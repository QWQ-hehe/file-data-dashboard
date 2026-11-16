/* Page: review analysis */
(function () {
  const { ref, computed, watch, onMounted, onUnmounted, reactive, nextTick } = Vue;

  window.ReviewAnalysisPage = {
    name: "ReviewAnalysisPage",
    components: { FlowChart: window.FlowChart, HBars: window.HBars },
    props: { data: Object },
    emits: ["notify"],
    setup(props, { emit }) {
      const f = window.useFilters(props, emit);
      const wordTab = ref("差评词频统计 (Top 10)");
      const productKeyword = ref("");

      const allPlatform = props.data.filters.platforms[0];
      const allStore = props.data.filters.stores[0];
      const num = (v) => Number(String(v).replace(/[^0-9.-]/g, "")) || 0;
      const fmtInt = (v) => Math.round(v).toLocaleString("en-US");
      const pct = (v) => (Math.round(v * 10) / 10).toFixed(1) + "%";
      const pct2 = (v) => (Math.round(v * 100) / 100).toFixed(2) + "%";
      const clamp = (v, a, b) => Math.min(b, Math.max(a, v));

      const shareMap = { "深圳湾万象城店": 0.18, "北京三里屯店": 0.12, "上海新天地店": 0.2 };
      const platFactor = computed(() =>
        f.platform.value === "美团" ? 0.62 : f.platform.value === "饿了么" ? 0.38 : 1
      );
      const dayFactor = computed(() =>
        f.quick.value === "今日" || f.quick.value === "昨日"
          ? 1 / 12
          : f.quick.value === "近7天"
          ? 7 / 12
          : 1
      );
      const dayCount = computed(() =>
        f.quick.value === "今日" || f.quick.value === "昨日" ? 1 : f.quick.value === "近7天" ? 7 : 12
      );
      const storeShare = computed(() => shareMap[f.store.value] || 1);
      const isFiltered = computed(() =>
        f.quick.value !== "近7天" || f.platform.value !== allPlatform || f.store.value !== allStore
      );

      const labelsAll = props.data.trend.labels;
      const lastDay = labelsAll[labelsAll.length - 1].a;
      const dayStart = computed(() => labelsAll[labelsAll.length - dayCount.value].a);
      const dateRange = computed(() =>
        !isFiltered.value
          ? props.data.filters.dateStart + " 至 " + props.data.filters.dateEnd
          : "2026-" + dayStart.value + " 至 2026-" + lastDay
      );

      /* 门店差评榜：mock 全部为饿了么，美团下无数据 */
      const storeRankingRows = computed(() =>
        f.platform.value === "美团"
          ? []
          : props.data.storeRanking.filter((s) => f.store.value === allStore || s.name === f.store.value)
      );
      /* 明细：平台 + 门店（不叠加日期）作为是否有数据的判定依据 */
      const scopedReviews = computed(() =>
        props.data.reviews.filter(
          (r) =>
            (f.platform.value === allPlatform || r.platform === f.platform.value) &&
            (f.store.value === allStore || r.store === f.store.value)
        )
      );
      const noData = computed(
        () =>
          (f.platform.value !== allPlatform || f.store.value !== allStore) &&
          !scopedReviews.value.length &&
          !storeRankingRows.value.length
      );
      const emptyText = "当前筛选条件下暂无评价数据，请调整日期、平台或门店";

      const noticeText = computed(() =>
        noData.value
          ? "当前筛选条件下暂无评价数据，评分与差评相关指标暂不可用。"
          : props.data.notice
      );

      const kpis = computed(() => {
        if (noData.value) return [];
        if (!isFiltered.value) return props.data.kpis;
        const sample = Math.round(177 * platFactor.value * dayFactor.value * storeShare.value);
        const platAdj = { "全部": 1, "美团": 1.08, "饿了么": 0.9 }[f.platform.value] || 1;
        const storeAdj = { "深圳湾万象城店": 1, "北京三里屯店": 1.05, "上海新天地店": 0.95 }[f.store.value] || 1;
        const reply = clamp(40.7 * platAdj * storeAdj, 0, 100);
        return props.data.kpis.map((k) => {
          if (k.label === "评价分析样本") {
            return Object.assign({}, k, { value: fmtInt(sample), delta: "", diff: "按当前筛选口径折算" });
          }
          if (k.label === "差评回复率") {
            return Object.assign({}, k, { value: pct(reply), delta: "", diff: "按当前筛选口径折算" });
          }
          return k;
        });
      });

      const trend = computed(() => {
        if (noData.value) return null;
        if (!isFiltered.value) return props.data.trend;
        const src = props.data.trend;
        const start = src.labels.length - dayCount.value;
        const k = platFactor.value * storeShare.value;
        const review = src.review.slice(start).map((v) => Math.round(v * k));
        const bad = src.bad.slice(start).map((v) => Math.round(v * k));
        const badRate = review.map((r, i) => (r ? Math.round((bad[i] / r) * 1000) / 10 : 0));
        return {
          labels: src.labels.slice(start),
          review: review,
          bad: bad,
          badRate: badRate,
          goodRate: badRate.map((v) => Math.round((100 - v) * 10) / 10)
        };
      });
      const trendEmpty = computed(() => (noData.value ? emptyText : "暂无评价趋势数据"));
      const trendKey = computed(
        () =>
          "rv-trend-" + f.quick.value + "-" + f.platform.value + "-" + f.store.value + "-" +
          (trend.value ? trend.value.labels.length : 0)
      );

      const kAll = computed(() =>
        isFiltered.value ? platFactor.value * dayFactor.value * storeShare.value : 1
      );
      const productRows = computed(() => {
        if (noData.value) return [];
        const kw = productKeyword.value.trim().toLowerCase();
        const k = kAll.value;
        return props.data.productRanking
          .filter((p) => !kw || p.name.toLowerCase().includes(kw) || p.cat.toLowerCase().includes(kw))
          .map((p) => {
            const reviews = Math.round(num(p.reviews) * k);
            const bad = Math.round(num(p.bad) * k);
            return {
              name: p.name,
              cat: p.cat,
              reviews: fmtInt(reviews),
              bad: String(bad),
              badRate: reviews ? pct2((bad / reviews) * 100) : "0.00%",
              badAll: fmtInt(Math.round(num(p.badAll) * k)),
              reason: p.reason,
              keyword: p.keyword
            };
          });
      });
      const productEmptyText = computed(() =>
        noData.value
          ? emptyText
          : "没有匹配「" + productKeyword.value.trim() + "」的商品，请调整搜索关键词"
      );

      const storeRows = computed(() =>
        storeRankingRows.value.map((s) => {
          const k = isFiltered.value ? dayFactor.value : 1;
          const reviews = Math.round(num(s.reviews) * k);
          const bad = Math.round(num(s.bad) * k);
          return {
            name: s.name,
            platform: s.platform,
            reviews: fmtInt(reviews),
            bad: String(bad),
            badRate: reviews ? pct2((bad / reviews) * 100) : "0.00%",
            badAll: fmtInt(Math.round(num(s.badAll) * k))
          };
        })
      );
      const storeTotal = computed(() => {
        const src = props.data.storeTotal;
        if (!isFiltered.value) return src;
        const k = dayFactor.value;
        const reviews = Math.round(num(src.reviews) * k);
        const bad = Math.round(num(src.bad) * k);
        return {
          label: src.label,
          reviews: fmtInt(reviews),
          bad: String(bad),
          badRate: reviews ? pct2((bad / reviews) * 100) : "0.00%",
          badAll: fmtInt(Math.round(num(src.badAll) * k))
        };
      });
      const storeEmptyText = computed(() =>
        noData.value
          ? emptyText
          : f.platform.value === "美团"
          ? "当前平台暂无门店差评数据，请切换平台"
          : "当前门店暂无差评榜单数据，请切换门店"
      );

      const detail = computed(() => {
        const src = props.data.productDetail;
        if (!isFiltered.value) return src;
        if (noData.value) return null;
        const k = platFactor.value * dayFactor.value * storeShare.value;
        const reviews = Math.round(num(src.reviews) * k);
        const bad = Math.round(num(src.bad) * k);
        const badAll = Math.round(num(src.badAll) * k);
        const wordsN = clamp(Math.round(src.words.length * k), 2, src.words.length);
        const cloudN = clamp(Math.round(src.keywordCloud.length * k), 6, src.keywordCloud.length);
        const dims = src.dimensions.map((d) => ({
          label: d.label,
          count: Math.max(1, Math.round(d.count * k))
        }));
        const dimTotal = dims.reduce((s, d) => s + d.count, 0) || 1;
        return {
          name: src.name,
          code: src.code,
          reviews: fmtInt(reviews),
          bad: String(bad),
          badRate: reviews ? pct2((bad / reviews) * 100) : "0.00%",
          badAll: String(badAll),
          badAllRate: fmtInt(Math.round(num(src.badAllRate) * k)),
          words: src.words.slice(0, wordsN),
          keywordCloud: src.keywordCloud.slice(0, cloudN),
          dimensions: dims.map((d) => ({
            label: d.label,
            count: d.count,
            pct: pct((d.count / dimTotal) * 100)
          })),
          samples: src.samples.filter((s) => f.store.value === allStore || s.store === f.store.value)
        };
      });

      const reviewRows = computed(() =>
        scopedReviews.value.filter(
          (r) => !isFiltered.value || (r.date.slice(5) >= dayStart.value && r.date.slice(5) <= lastDay)
        )
      );

      return Object.assign(f, {
        wordTab,
        productKeyword,
        noticeText,
        kpis,
        trend,
        trendKey,
        trendEmpty,
        productRows,
        productEmptyText,
        storeRows,
        storeTotal,
        storeEmptyText,
        detail,
        reviewRows,
        dateRange,
        emptyText
      });
    },
    template: `
      <div class="module-page">
        <header class="module-topbar">
          <div class="module-head-left">
            <h1 class="page-title">{{ data.title }}</h1>
            <span class="count-badge">{{ data.updatedAt }}</span>
          </div>
          <button class="bell-btn" title="通知" @click="$emit('notify', '暂无新的通知')">
            <svg class="i"><use href="#i-bell" /></svg>
          </button>
        </header>

        ${window.FILTER_BAR}

        <div class="ov-scroll">
          <div class="an-banner">{{ noticeText }}</div>

          <section class="ov-card">
            <div class="ov-card-head">
              <h3 class="ov-card-title">评价概况</h3>
              <span class="muted-text">比上月 · 全渠道</span>
            </div>
            <div class="ov-kpi-grid tv-grid-4" v-if="kpis.length">
              <div class="ov-kpi" v-for="k in kpis" :key="k.label">
                <div class="ov-kpi-label">{{ k.label }}<svg class="i i-12"><use href="#i-info" /></svg></div>
                <div class="ov-kpi-value" :class="{ 'tv-muted-value': k.muted }">{{ k.value }}</div>
                <div class="ov-kpi-foot" :class="k.dir">
                  <template v-if="k.delta">比上月 <b>{{ k.dir === 'up' ? '▲' : '▼' }} {{ k.delta }}</b> <span>{{ k.diff }}</span></template>
                  <template v-else>{{ k.diff }}</template>
                </div>
              </div>
            </div>
            <div v-else class="empty-state">
              <div class="empty-title">暂无评价指标数据</div>
              <div class="empty-sub">{{ emptyText }}</div>
            </div>
          </section>

          <section class="ov-card ov-chart-card">
            <div class="ov-card-head">
              <h3 class="ov-card-title">评价趋势</h3>
              <button class="btn btn-ghost" @click="$emit('notify', '已导出评价趋势（演示）')">导出</button>
            </div>
            <flow-chart
              v-if="trend"
              :key="trendKey"
              :labels="trend.labels"
              :bars="[
                { name: '评价数（计入）', color: '#6d84c7', values: trend.review },
                { name: '差评数（计入）', color: '#b45a55', values: trend.bad }
              ]"
              :lines="[
                { name: '差评率', color: '#c98a4b', values: trend.badRate, axis: 'right', fmt: 'pct' },
                { name: '好评率', color: '#7fa08a', values: trend.goodRate, axis: 'right', fmt: 'pct' }
              ]"
              :axes="{ left: { fmt: 'num' }, right: { fmt: 'pct', max: 100 } }"
              :height="240" />
            <div v-else class="empty-state">
              <div class="empty-title">暂无评价趋势数据</div>
              <div class="empty-sub">{{ trendEmpty }}</div>
            </div>
          </section>

          <div class="tv-two-col">
            <section class="ov-card">
              <div class="ov-card-head">
                <h3 class="ov-card-title">商品差评榜单</h3>
                <input class="f-input w150" placeholder="搜索商品" v-model="productKeyword" />
              </div>
              <div class="ov-table-wrap an-scroll-260">
                <table class="tbl an-wide-tbl">
                  <thead>
                    <tr><th>商品</th><th>分类</th><th>评价数</th><th>差评数</th><th>差评率</th><th>差评总数</th><th>差评原因</th><th>差评关键词</th></tr>
                  </thead>
                  <tbody>
                    <tr v-for="p in productRows" :key="p.name">
                      <td class="cell-name">{{ p.name }}</td>
                      <td class="muted-text">{{ p.cat }}</td>
                      <td>{{ p.reviews }}</td>
                      <td class="ov-down">{{ p.bad }}</td>
                      <td>{{ p.badRate }}</td>
                      <td>{{ p.badAll }}</td>
                      <td>{{ p.reason }}</td>
                      <td class="muted-text">{{ p.keyword }}</td>
                    </tr>
                    <tr v-if="!productRows.length"><td colspan="8" class="row-empty">{{ productEmptyText }}</td></tr>
                  </tbody>
                </table>
              </div>
            </section>

            <section class="ov-card">
              <div class="ov-card-head">
                <h3 class="ov-card-title">门店差评榜单</h3>
                <span class="muted-text">按差评数排序</span>
              </div>
              <div class="ov-table-wrap an-scroll-260">
                <table class="tbl">
                  <thead>
                    <tr><th>门店</th><th>平台</th><th>评价数</th><th>差评数</th><th>差评率</th><th>差评总数</th></tr>
                  </thead>
                  <tbody>
                    <tr v-for="s in storeRows" :key="s.name">
                      <td class="cell-name">{{ s.name }}</td>
                      <td><span class="tv-platform" :class="s.platform === '美团' ? 'mt' : 'ele'">{{ s.platform }}</span></td>
                      <td>{{ s.reviews }}</td>
                      <td>{{ s.bad }}</td>
                      <td>{{ s.badRate }}</td>
                      <td>{{ s.badAll }}</td>
                    </tr>
                    <tr class="an-total-row" v-if="storeRows.length">
                      <td>{{ storeTotal.label }}</td>
                      <td>—</td>
                      <td>{{ storeTotal.reviews }}</td>
                      <td>{{ storeTotal.bad }}</td>
                      <td>{{ storeTotal.badRate }}</td>
                      <td>{{ storeTotal.badAll }}</td>
                    </tr>
                    <tr v-if="!storeRows.length"><td colspan="6" class="row-empty">{{ storeEmptyText }}</td></tr>
                  </tbody>
                </table>
              </div>
            </section>
          </div>

          <section class="ov-card">
            <div class="ov-card-head">
              <h3 class="ov-card-title">产品差评分析</h3>
              <button class="btn btn-ghost" @click="$emit('notify', '已导出产品差评分析（演示）')">导出</button>
            </div>
            <template v-if="detail">
              <div class="an-product-head">
                <div class="an-product-name">
                  <b>{{ detail.name }}</b>
                  <span>{{ detail.code }}</span>
                </div>
                <div class="an-product-metrics">
                  <div><span>评价数</span><b>{{ detail.reviews }}</b></div>
                  <div><span>差评数</span><b>{{ detail.bad }}</b></div>
                  <div><span>差评率</span><b>{{ detail.badRate }}</b></div>
                  <div><span>差评总数</span><b>{{ detail.badAll }}</b></div>
                  <div><span>差评率（全店）</span><b>{{ detail.badAllRate }}</b></div>
                </div>
              </div>

              <div class="an-three-col">
                <div>
                  <div class="an-sub-title">{{ wordTab }}</div>
                  <div class="ov-table-wrap an-scroll-200">
                    <table class="tbl">
                      <thead><tr><th>#</th><th>词条</th><th>次数</th><th>占比</th></tr></thead>
                      <tbody>
                        <tr v-for="(w, i) in detail.words" :key="w.word">
                          <td>{{ i + 1 }}</td>
                          <td class="cell-name">{{ w.word }}</td>
                          <td>{{ w.count }}</td>
                          <td>{{ w.pct }}</td>
                        </tr>
                        <tr v-if="!detail.words.length"><td colspan="4" class="row-empty">当前筛选条件下暂无差评词频样本</td></tr>
                      </tbody>
                    </table>
                  </div>
                </div>

                <div>
                  <div class="an-sub-title">差评关键词云</div>
                  <div class="an-cloud" v-if="detail.keywordCloud.length">
                    <span v-for="(w, i) in detail.keywordCloud" :key="w + i"
                      :class="'w' + (i % 4)" :style="{ fontSize: (11 + ((i * 5) % 7)) + 'px' }">{{ w }}</span>
                  </div>
                  <div v-else class="empty-sub">当前筛选条件下暂无关键词云数据</div>
                </div>

                <div>
                  <div class="an-sub-title">多维度评价占比（多标签，合计可超 100%）</div>
                  <h-bars v-if="detail.dimensions.length"
                    :items="detail.dimensions.map(d => ({ name: d.label, count: d.pct, width: parseFloat(d.pct), color: '#6d84c7' }))"
                    :label-width="86" />
                  <div v-else class="empty-sub">当前筛选条件下暂无维度占比数据</div>
                </div>
              </div>

              <div class="an-sub-title">典型评价（按原声展示）</div>
              <div class="an-samples" v-if="detail.samples.length">
                <div class="an-sample" v-for="(s, i) in detail.samples" :key="i">
                  <div class="an-sample-text">{{ s.text }}</div>
                  <div class="an-sample-meta">{{ s.date }} · {{ s.store }} · {{ s.score }}</div>
                </div>
              </div>
              <div v-else class="empty-sub">当前门店暂无典型评价原声，请切换门店</div>
            </template>
            <div v-else class="empty-state">
              <div class="empty-title">暂无产品差评数据</div>
              <div class="empty-sub">{{ emptyText }}</div>
            </div>
          </section>

          <section class="ov-card">
            <div class="ov-card-head">
              <h3 class="ov-card-title">门店评价明细</h3>
              <div class="ov-rank-tools">
                <button class="btn btn-ghost" @click="$emit('notify', '已筛选差评评价（演示）')">筛选差评</button>
                <button class="btn btn-ghost" @click="$emit('notify', '已导出门店评价明细（演示）')">下载明细（Excel）</button>
              </div>
            </div>
            <div class="ov-table-wrap">
              <table class="tbl an-wide-tbl">
                <thead><tr><th>日期</th><th>门店</th><th>平台</th><th>评分</th><th>评价内容</th><th>差评类型</th></tr></thead>
                <tbody>
                  <tr v-for="(r, i) in reviewRows" :key="i">
                    <td class="muted-text">{{ r.date }}</td>
                    <td class="cell-name">{{ r.store }}</td>
                    <td><span class="tv-platform" :class="r.platform === '美团' ? 'mt' : 'ele'">{{ r.platform }}</span></td>
                    <td>{{ r.score }}</td>
                    <td>{{ r.text }}</td>
                    <td><span class="an-tag" :class="{ bad: r.tag !== '好评' }">{{ r.tag }}</span></td>
                  </tr>
                  <tr v-if="!reviewRows.length"><td colspan="6" class="row-empty">当前筛选条件下暂无评价明细，请调整日期、平台或门店</td></tr>
                </tbody>
              </table>
            </div>
            <div class="panel-foot">
              <span>共 {{ reviewRows.length }} 条评价</span>
              <span class="foot-note">数据周期：{{ dateRange }}</span>
            </div>
          </section>
        </div>
      </div>
    `
  };
})();
