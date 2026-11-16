/* Page: product sales */
(function () {
  const { ref, computed, watch, onMounted, onUnmounted, reactive, nextTick } = Vue;

  window.ProductSalesPage = {
    name: "ProductSalesPage",
    components: {
      FlowChart: window.FlowChart,
      RingChart: window.RingChart,
      HBars: window.HBars
    },
    props: { data: Object },
    emits: ["notify"],
    setup(props, { emit }) {
      const quick = ref("近30天");
      const platform = ref(props.data.filters.platforms[0]);
      const store = ref(props.data.filters.stores[0]);
      const category = ref("全部品类");
      const showMom = ref(true);

      const allPlatform = props.data.filters.platforms[0];
      const allStore = props.data.filters.stores[0];
      const allCategory = "全部品类";
      const dates = props.data.newTrend.dates;
      const baseKpi = {};
      props.data.kpis.forEach((k) => (baseKpi[k.label] = k));

      const num = (v) => Number(String(v).replace(/[^0-9.-]/g, "")) || 0;
      const fmtInt = (v) => Math.round(v).toLocaleString("en-US");
      const fmtMoney = (v) => "¥" + fmtInt(v);
      const fmtWan = (v) => "¥" + v.toFixed(1) + "万";
      const pct = (v) => v.toFixed(1) + "%";

      const detailBase = props.data.detail.map((r) => ({
        name: r.name,
        mapped: r.mapped,
        onlineAt: r.onlineAt,
        category: r.category,
        mom: r.mom,
        dir: r.dir,
        qtyNum: num(r.qty),
        amountWan: num(r.amount),
        shareNum: num(r.share),
        marginNum: num(r.margin)
      }));
      const totalQty = detailBase.reduce((s, r) => s + r.qtyNum, 0) || 1;
      const totalAmount = detailBase.reduce((s, r) => s + r.amountWan, 0) || 1;

      const nameCategory = {};
      detailBase.forEach((r) => (nameCategory[r.name] = r.category));
      nameCategory["香茅烤鸡翅"] = "泰式小吃";
      nameCategory["曼谷炸鸡块"] = "泰式小吃";

      const categoryOptions = [allCategory].concat(
        props.data.structure.categories.map((c) => c.name)
      );

      const storeConf = {
        "安徽工学院店": { factor: 0.26, only: null, exclude: null },
        "深圳湾万象城店": { factor: 0.18, only: null, exclude: ["可可系列"] },
        "北京三里屯店": { factor: 0.12, only: ["泰国红茶", "泰式奶茶", "泰式果茶"], exclude: null }
      };
      const storeFactor = computed(() => {
        const c = storeConf[store.value];
        return c ? c.factor : 1;
      });
      const storeAllows = (cat) => {
        const c = storeConf[store.value];
        if (!c || !cat) return true;
        if (c.only) return c.only.indexOf(cat) >= 0;
        if (c.exclude) return c.exclude.indexOf(cat) < 0;
        return true;
      };
      const categoryAllows = (cat) => category.value === allCategory || cat === category.value;

      const windowDates = computed(() => {
        if (quick.value === "今日") return dates.slice(-1);
        if (quick.value === "昨日") return dates.slice(-2, -1);
        if (quick.value === "近7天") return dates.slice(-7);
        return dates.slice();
      });
      const dayFactor = computed(() => windowDates.value.length / dates.length);
      const platFactor = computed(() =>
        platform.value === "美团" ? 0.62 : platform.value === "饿了么" ? 0.38 : 1
      );
      const dateRangeText = computed(() => {
        const d = windowDates.value;
        if (!d.length) return "—";
        return "2026-" + d[0].a + " 至 2026-" + d[d.length - 1].a;
      });

      const isFiltered = computed(
        () =>
          quick.value !== "近30天" ||
          platform.value !== allPlatform ||
          store.value !== allStore ||
          category.value !== allCategory
      );

      const matchedBase = computed(() =>
        detailBase.filter((r) => categoryAllows(r.category) && storeAllows(r.category))
      );

      const emptyText = computed(() =>
        matchedBase.value.length
          ? ""
          : "没有符合当前筛选条件的商品销售数据，请调整日期、平台、门店或品类"
      );

      const kpis = computed(() => {
        if (!isFiltered.value) return props.data.kpis;
        const matched = matchedBase.value;
        if (!matched.length) return [];
        const qtyShare = matched.reduce((s, r) => s + r.qtyNum, 0) / totalQty;
        const amtShare = matched.reduce((s, r) => s + r.amountWan, 0) / totalAmount;
        const scale = dayFactor.value * platFactor.value * storeFactor.value;
        const qty = num(baseKpi["商品销量"].value) * scale * qtyShare;
        const amount = num(baseKpi["商品销售额"].value) * scale * amtShare;
        return [
          {
            label: "动销商品数",
            value:
              Math.round(num(baseKpi["动销商品数"].value) * (matched.length / detailBase.length)) +
              " 个"
          },
          { label: "商品销量", value: fmtInt(qty) },
          { label: "商品销售额", value: fmtMoney(amount) },
          { label: "件均价", value: "¥" + (qty ? (amount / qty).toFixed(1) : "0.0") }
        ];
      });

      const trend = computed(() => {
        if (!isFiltered.value) {
          return {
            labels: props.data.newTrend.dates,
            series: props.data.newTrend.series,
            newShare: props.data.newTrend.newShare
          };
        }
        const start = dates.length - windowDates.value.length;
        const qtyShare = matchedBase.value.length
          ? matchedBase.value.reduce((s, r) => s + r.qtyNum, 0) / totalQty
          : 0;
        const shareScale = category.value === allCategory ? 1 : qtyShare;
        const series = props.data.newTrend.series
          .filter((s) => categoryAllows(nameCategory[s.name]) && storeAllows(nameCategory[s.name]))
          .map((s) => ({
            name: s.name,
            color: s.color,
            values: s.values
              .slice(start)
              .map((v) => Math.round(v * platFactor.value * storeFactor.value))
          }));
        return {
          labels: windowDates.value,
          series: series,
          newShare: props.data.newTrend.newShare
            .slice(start)
            .map((v) => Math.round(v * shareScale * 10) / 10)
        };
      });
      const trendEmpty = computed(() =>
        emptyText.value ||
        (trend.value.series.length ? "" : "当前品类暂无标记新品的销售趋势数据")
      );

      const detailRows = computed(() => {
        if (!isFiltered.value) return props.data.detail;
        const rows = matchedBase.value;
        const amtSum = rows.reduce((s, r) => s + r.amountWan, 0) || 1;
        const scale = dayFactor.value * platFactor.value * storeFactor.value;
        return rows.map((r) => ({
          name: r.name,
          mapped: r.mapped,
          onlineAt: r.onlineAt,
          category: r.category,
          qty: fmtInt(r.qtyNum * scale),
          mom: r.mom,
          dir: r.dir,
          amount: fmtWan(r.amountWan * scale),
          share: pct((r.amountWan / amtSum) * 100),
          margin: pct(r.marginNum)
        }));
      });

      const buildReviews = (list) => {
        if (!isFiltered.value) return list;
        const scale = dayFactor.value * platFactor.value * storeFactor.value;
        return list
          .filter((r) => {
            const c = nameCategory[r.name];
            return categoryAllows(c) && storeAllows(c);
          })
          .map((r, i) => ({
            rank: i + 1,
            name: r.name,
            goodRate: r.goodRate,
            badRate: r.badRate,
            count: fmtInt(num(r.count) * scale)
          }));
      };
      const goodReviews = computed(() => buildReviews(props.data.reviews.good));
      const badReviews = computed(() => buildReviews(props.data.reviews.bad));

      const structure = computed(() => {
        if (!isFiltered.value) return props.data.structure;
        const rows = detailRows.value;
        const agg = {};
        const colorOf = {};
        const origRow = {};
        props.data.structure.categories.forEach((c) => (colorOf[c.name] = c.color));
        props.data.structure.rows.forEach((r) => (origRow[r.name] = r));
        rows.forEach((r) => {
          if (!agg[r.category]) agg[r.category] = { qty: 0, amount: 0 };
          agg[r.category].qty += num(r.qty);
          agg[r.category].amount += num(r.amount);
        });
        const names = Object.keys(agg);
        const totalQ = names.reduce((s, n) => s + agg[n].qty, 0) || 1;
        const totalA = names.reduce((s, n) => s + agg[n].amount, 0) || 1;
        const maxQ = Math.max.apply(null, names.map((n) => agg[n].qty).concat([1]));
        return {
          categories: names
            .slice()
            .sort((a, b) => agg[b].qty - agg[a].qty)
            .map((n) => ({
              name: n,
              value: Math.round((agg[n].qty / totalQ) * 1000) / 10,
              color: colorOf[n] || "#8a93a0"
            })),
          ranking: names
            .slice()
            .sort((a, b) => agg[b].qty - agg[a].qty)
            .map((n) => ({
              name: n,
              count: fmtInt(agg[n].qty),
              width: Math.round((agg[n].qty / maxQ) * 1000) / 10
            })),
          rows: names
            .slice()
            .sort((a, b) => agg[b].amount - agg[a].amount)
            .map((n) => ({
              name: n,
              qty: fmtInt(agg[n].qty),
              qtyShare: pct((agg[n].qty / totalQ) * 100),
              amount: fmtWan(agg[n].amount),
              amountShare: pct((agg[n].amount / totalA) * 100),
              price: "¥" + (agg[n].qty ? ((agg[n].amount * 10000) / agg[n].qty).toFixed(1) : "0.0"),
              good: (origRow[n] || {}).good || "—",
              bad: (origRow[n] || {}).bad || "—"
            }))
        };
      });

      const query = () =>
        emit(
          "notify",
          "已按当前条件筛选：" +
            quick.value +
            " · " +
            platform.value +
            " · " +
            store.value +
            " · " +
            category.value +
            (emptyText.value ? "（无结果）" : " · " + detailRows.value.length + " 个商品")
        );
      const reset = () => {
        quick.value = "近30天";
        platform.value = allPlatform;
        store.value = allStore;
        category.value = allCategory;
        emit("notify", "筛选条件已重置");
      };

      return {
        quick,
        platform,
        store,
        category,
        showMom,
        categoryOptions,
        dateRangeText,
        isFiltered,
        emptyText,
        kpis,
        trend,
        trendEmpty,
        detailRows,
        goodReviews,
        badReviews,
        structure,
        query,
        reset
      };
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

        <div class="ov-filters">
          <div class="ov-quick-group">
            <span class="ov-filter-label">日期</span>
            <button v-for="q in data.filters.quick" :key="q" class="ov-quick" :class="{ active: quick === q }" @click="quick = q">{{ q }}</button>
          </div>
          <span class="ov-date">{{ dateRangeText }}</span>
          <div class="tv-seg">
            <button v-for="p in data.filters.platforms" :key="p" :class="{ on: platform === p }" @click="platform = p">{{ p }}</button>
          </div>
          <select class="f-select w160" v-model="store">
            <option v-for="o in data.filters.stores" :key="o">{{ o }}</option>
          </select>
          <select class="f-select w130" v-model="category">
            <option v-for="c in categoryOptions" :key="c">{{ c }}</option>
          </select>
          <button class="btn btn-primary" @click="query">查询</button>
          <button class="btn btn-ghost" @click="reset">重置</button>
          <span class="toolbar-spacer"></span>
          <span class="muted-text">全渠道 · 自动更新</span>
        </div>

        <div class="ov-scroll">
          <section class="ov-card">
            <div class="ov-card-head">
              <h3 class="ov-card-title">核心指标</h3>
              <label class="ps-switch">
                <input type="checkbox" v-model="showMom" />
                <span>显示环比数据</span>
              </label>
            </div>
            <div v-if="emptyText" class="empty-state">
              <div class="empty-title">{{ emptyText }}</div>
              <div class="empty-sub">调整日期、平台、门店或品类，或点击「重置」恢复全部数据</div>
            </div>
            <div v-else class="ov-kpi-grid tv-grid-4">
              <div class="ov-kpi" v-for="k in kpis" :key="k.label">
                <div class="ov-kpi-label">{{ k.label }}<svg class="i i-12"><use href="#i-info" /></svg></div>
                <div class="ov-kpi-value">{{ k.value }}</div>
                <div class="ov-kpi-foot" :class="showMom && !isFiltered ? k.dir : ''">
                  <template v-if="!showMom">—</template>
                  <template v-else-if="isFiltered">筛选后不提供环比</template>
                  <template v-else>比上月 <b>{{ k.dir === 'up' ? '▲' : '▼' }} {{ k.delta }}</b> <span>{{ k.diff }}</span></template>
                </div>
              </div>
            </div>
          </section>

          <section class="ov-card ov-chart-card">
            <div class="ov-card-head">
              <h3 class="ov-card-title">新品趋势 · 维护标记新品 <svg class="i i-12"><use href="#i-info" /></svg></h3>
              <div class="tv-tools">
                <select class="f-select w130"><option>全部标记新品</option><option>仅新品标签</option></select>
                <select class="f-select w190"><option>全部标记新品 · 13 个（Top5 单列）</option><option>按销量排序</option></select>
                <button class="btn btn-ghost" @click="$emit('notify', '已导出新品趋势（演示）')">导出</button>
              </div>
            </div>
            <div v-if="trendEmpty" class="empty-state">
              <div class="empty-title">{{ trendEmpty }}</div>
              <div class="empty-sub">趋势图基于当前筛选结果重算</div>
            </div>
            <template v-else>
              <flow-chart
                :key="'ps-new-' + quick + '-' + platform + '-' + store + '-' + category + '-' + trend.labels.length + '-' + trend.series.length + '-' + (trend.series[0] ? trend.series[0].values.join('_') : '')"
                :labels="trend.labels"
                :bars="trend.series"
                :lines="[{ name: '新品销量占比', color: '#8a8f3c', values: trend.newShare, axis: 'right', fmt: 'pct' }]"
                :axes="{ right: { max: 12, fmt: 'pct' } }"
                :height="260" />
              <div class="tv-foot-note">左轴：销量（杯） · 右轴：新品销量占比（%）</div>
            </template>
          </section>

          <section class="ov-card">
            <div class="ov-card-head">
              <h3 class="ov-card-title">商品榜单</h3>
              <button class="btn btn-ghost" @click="$emit('notify', '已导出商品榜单（演示）')">导出</button>
            </div>
            <div class="ps-two">
              <div>
                <div class="an-sub-title">好评 Top10</div>
                <div class="ov-table-wrap an-scroll-260">
                  <table class="tbl">
                    <thead><tr><th>排名</th><th>商品名称</th><th>好评率</th><th>差评率</th><th>评价数</th></tr></thead>
                    <tbody>
                      <tr v-for="r in goodReviews" :key="'g' + r.rank">
                        <td>{{ r.rank }}</td>
                        <td class="cell-name">{{ r.name }}</td>
                        <td>{{ r.goodRate }}</td>
                        <td>{{ r.badRate }}</td>
                        <td>{{ r.count }}</td>
                      </tr>
                      <tr v-if="!goodReviews.length"><td colspan="5" class="row-empty">当前筛选条件下暂无好评品项</td></tr>
                    </tbody>
                  </table>
                </div>
              </div>
              <div>
                <div class="an-sub-title">差评 Top10</div>
                <div class="ov-table-wrap an-scroll-260">
                  <table class="tbl">
                    <thead><tr><th>排名</th><th>商品名称</th><th>差评率</th><th>好评率</th><th>评价数</th></tr></thead>
                    <tbody>
                      <tr v-for="r in badReviews" :key="'b' + r.rank">
                        <td>{{ r.rank }}</td>
                        <td class="cell-name">{{ r.name }}</td>
                        <td>{{ r.badRate }}</td>
                        <td>{{ r.goodRate }}</td>
                        <td>{{ r.count }}</td>
                      </tr>
                      <tr v-if="!badReviews.length"><td colspan="5" class="row-empty">当前筛选条件下暂无差评品项</td></tr>
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </section>

          <section class="ov-card">
            <div class="ov-card-head">
              <h3 class="ov-card-title">商品销售明细</h3>
              <div class="tv-tools">
                <span class="muted-text">共 {{ detailRows.length }} 个商品 · 按销量排序</span>
                <button class="btn btn-ghost" @click="$emit('notify', '已导出商品销售明细（演示）')">导出</button>
              </div>
            </div>
            <div class="ov-table-wrap an-scroll-260">
              <table class="tbl an-wide-tbl">
                <thead>
                  <tr><th>商品名称</th><th>映射商品名称</th><th>上架日期</th><th>分类</th><th>销量</th><th>环比</th><th>销售额</th><th>销售额占比</th><th>毛利率</th></tr>
                </thead>
                <tbody>
                  <tr v-for="r in detailRows" :key="r.name">
                    <td class="cell-name">{{ r.name }}</td>
                    <td class="muted-text">{{ r.mapped }}</td>
                    <td class="muted-text">{{ r.onlineAt }}</td>
                    <td>{{ r.category }}</td>
                    <td>{{ r.qty }}</td>
                    <td :class="r.dir === 'up' ? 'ov-up' : 'ov-down'">{{ r.dir === 'up' ? '▲' : '▼' }} {{ r.mom }}</td>
                    <td>{{ r.amount }}</td>
                    <td>{{ r.share }}</td>
                    <td>{{ r.margin }}</td>
                  </tr>
                  <tr v-if="emptyText"><td colspan="9" class="row-empty">{{ emptyText }}</td></tr>
                </tbody>
              </table>
            </div>
          </section>

          <section class="ov-card">
            <div class="ov-card-head">
              <h3 class="ov-card-title">商品结构分析 · 标准菜单</h3>
              <div class="tv-tools">
                <div class="tv-seg"><button class="on">目标量占比</button><button @click="$emit('notify', '标杆量排行（演示）')">标杆量排行</button></div>
                <button class="btn btn-ghost" @click="$emit('notify', '已导出商品结构分析（演示）')">导出</button>
              </div>
            </div>
            <div class="ps-structure">
              <div>
                <div class="an-sub-title">品类销量占比</div>
                <ring-chart
                  v-if="structure.categories.length"
                  :key="'ps-ring-' + quick + '-' + platform + '-' + store + '-' + category + '-' + structure.categories.map(c => c.name + c.value).join('|')"
                  :items="structure.categories"
                  :size="168"
                  :thickness="26" />
                <div v-else class="empty-state">
                  <div class="empty-title">{{ emptyText || '当前筛选条件下暂无品类数据' }}</div>
                </div>
              </div>
              <div>
                <div class="an-sub-title">分类销量排行</div>
                <h-bars
                  v-if="structure.ranking.length"
                  :key="'ps-rank-' + quick + '-' + platform + '-' + store + '-' + category + '-' + structure.ranking.map(r => r.name + r.count).join('|')"
                  :items="structure.ranking"
                  :label-width="56" />
                <div v-else class="empty-state">
                  <div class="empty-title">{{ emptyText || '当前筛选条件下暂无分类销量数据' }}</div>
                </div>
              </div>
            </div>
            <div class="ov-table-wrap an-scroll-240">
              <table class="tbl an-wide-tbl">
                <thead>
                  <tr><th>类目</th><th>销量</th><th>销量占比</th><th>销售额</th><th>销售额占比</th><th>件均价</th><th>好评率</th><th>差评率</th></tr>
                </thead>
                <tbody>
                  <tr v-for="r in structure.rows" :key="r.name">
                    <td class="cell-name">{{ r.name }}</td>
                    <td>{{ r.qty }}</td>
                    <td>{{ r.qtyShare }}</td>
                    <td>{{ r.amount }}</td>
                    <td>{{ r.amountShare }}</td>
                    <td>{{ r.price }}</td>
                    <td>{{ r.good }}</td>
                    <td>{{ r.bad }}</td>
                  </tr>
                  <tr v-if="!structure.rows.length"><td colspan="8" class="row-empty">{{ emptyText || '当前筛选条件下暂无商品结构数据' }}</td></tr>
                </tbody>
              </table>
            </div>
          </section>
        </div>
      </div>
    `
  };

  /* ---------- 四象限散点图（曝光人数对数轴） ---------- */
})();
