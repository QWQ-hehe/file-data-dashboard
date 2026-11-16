/* Page: fundamental analysis */
(function () {
  const { ref, computed, watch, onMounted, onUnmounted, reactive, nextTick } = Vue;

  window.FundamentalAnalysisPage = {
    name: "FundamentalAnalysisPage",
    components: { HBars: window.HBars, RingChart: window.RingChart, GroupBarChart: window.GroupBarChart, FlowChart: window.FlowChart },
    props: { data: Object },
    emits: ["notify"],
    setup(props, { emit }) {
      const f = window.useFilters(props, emit);
      const storeQuery = ref("");
      const baseReset = f.reset;

      const allPlatform = props.data.filters.platforms[0];
      const allStore = props.data.filters.stores[0];
      const num = (v) => Number(String(v).replace(/[^0-9.-]/g, "")) || 0;
      const r1 = (v) => (Math.round(v * 10) / 10).toFixed(1);
      const avg = (list) => (list.length ? list.reduce((s, v) => s + v, 0) / list.length : 0);
      const storeShare = { "深圳湾万象城店": 0.18, "北京三里屯店": 0.12, "上海新天地店": 0.2 };

      const isFiltered = computed(() =>
        f.quick.value !== "近7天" ||
        f.platform.value !== allPlatform ||
        f.store.value !== allStore
      );
      const noData = computed(() =>
        f.platform.value === "饿了么" && f.store.value === "上海新天地店"
      );
      const emptyText = computed(() =>
        noData.value
          ? "当前门店在饿了么暂无基本面数据，请切换平台或门店后重试"
          : "当前筛选条件下暂无基本面数据，请调整日期、平台或门店"
      );

      const matchedStores = computed(() =>
        props.data.storeScores.filter(
          (s) => f.store.value === allStore || s.name === f.store.value
        )
      );

      /* 单店视图按综合体验相对大盘的系数微调六维与评分分布 */
      const expFactor = computed(() => {
        const base = avg(props.data.storeScores.map((s) => num(s.exp)));
        if (f.store.value === allStore) return 1;
        const row = matchedStores.value[0];
        return base && row ? num(row.exp) / base : 1;
      });
      const dayFactor = computed(() =>
        f.quick.value === "今日" || f.quick.value === "昨日" ? 1 / 13 : 1
      );

      /* 5 张评分 KPI */
      const kpis = computed(() => {
        if (!isFiltered.value) return props.data.kpis;
        if (noData.value || !matchedStores.value.length) return [];
        const rows = matchedStores.value;
        const hasMt = f.platform.value !== "饿了么";
        const hasEl = f.platform.value !== "美团";
        return [
          {
            label: "美团店铺分（店内）",
            value: hasMt ? r1(avg(rows.map((s) => num(s.mt)))) : "—",
            muted: !hasMt,
            diff: hasMt ? "当前筛选门店均值" : "当前平台无美团数据"
          },
          {
            label: "饿了么店铺分（店内）",
            value: hasEl ? r1(avg(rows.map((s) => num(s.base)))) : "—",
            muted: !hasEl,
            diff: hasEl ? "当前筛选门店均值" : "当前平台无饿了么数据"
          },
          {
            label: "商家评分（店铺）",
            value: r1(avg(rows.map((s) => num(s.exp)))),
            diff: "当前筛选门店均值"
          },
          {
            label: "京东店铺分（店内）",
            value: "—",
            muted: true,
            diff: "京东店铺分暂未接入"
          },
          {
            label: "基础任务完成率（店内）",
            value: r1(avg(rows.map((s) => num(s.task)))) + "%",
            diff: "当前筛选门店均值"
          }
        ];
      });

      /* 六维对比：平台决定保留哪条系列，门店决定整体偏移 */
      const sixDim = computed(() => {
        if (!isFiltered.value) {
          return {
            labels: props.data.sixDim.labels,
            series: [
              { name: "美团（店铺评分）", color: "#5b77b8", values: props.data.sixDim.meituan },
              { name: "饿了么（店铺评分）", color: "#7fa08a", values: props.data.sixDim.eleme }
            ]
          };
        }
        const scale = (list) =>
          list.map((v) => Math.min(5, Math.round(v * expFactor.value * 10) / 10));
        const series = [];
        if (!noData.value && f.platform.value !== "饿了么") {
          series.push({ name: "美团（店铺评分）", color: "#5b77b8", values: scale(props.data.sixDim.meituan) });
        }
        if (!noData.value && f.platform.value !== "美团") {
          series.push({ name: "饿了么（店铺评分）", color: "#7fa08a", values: scale(props.data.sixDim.eleme) });
        }
        return { labels: props.data.sixDim.labels, series };
      });
      const sixEmpty = computed(() => noData.value || !sixDim.value.series.length);

      /* 商家成长：平台=美团时无饿了么数据 */
      const growthEmpty = computed(() =>
        noData.value
          ? emptyText.value
          : f.platform.value === "美团"
          ? "当前平台筛选为美团，饿了么商家成长数据不参与统计"
          : ""
      );
      const growthDonut = computed(() => {
        if (!isFiltered.value) return props.data.growth.donut;
        return props.data.growth.donut.map((d) => Object.assign({}, d));
      });
      const growthBuckets = computed(() => {
        const src = props.data.growth.taskBuckets;
        if (!isFiltered.value) return src;
        const k =
          (storeShare[f.store.value] || 1) * dayFactor.value;
        return {
          labels: src.labels,
          values: src.values.map((v) => Math.max(1, Math.round(v * k)))
        };
      });

      /* 评分分布：平台互斥 + 门店偏移 */
      const buildDist = (which) => {
        const src = props.data.scoreDist[which];
        const values = isFiltered.value
          ? src.values.map((v) => Math.min(100, Math.round(v * expFactor.value)))
          : src.values;
        return src.labels.map((l, i) => ({
          name: l,
          count: values[i],
          width: values[i],
          color: which === "eleme" ? "#7fa08a" : "#5b77b8"
        }));
      };
      const elemeBars = computed(() => buildDist("eleme"));
      const meituanBars = computed(() => buildDist("meituan"));
      const elemeDistEmpty = computed(() =>
        noData.value
          ? emptyText.value
          : f.platform.value === "美团"
          ? "当前平台筛选为美团，饿了么评分分布不参与统计"
          : ""
      );
      const meituanDistEmpty = computed(() =>
        noData.value
          ? emptyText.value
          : f.platform.value === "饿了么"
          ? "当前平台筛选为饿了么，美团评分分布不参与统计"
          : ""
      );

      /* 门店评分明细 */
      const tableRows = computed(() => {
        if (noData.value) return [];
        const q = storeQuery.value.trim();
        const rows = matchedStores.value.filter((s) => !q || s.name.indexOf(q) >= 0);
        const mtOff = f.platform.value === "饿了么";
        return rows.map((s) => ({
          name: s.name,
          mt: mtOff ? "—" : s.mt,
          exp: mtOff ? "—" : s.exp,
          quality: mtOff ? "—" : s.quality,
          base: s.base,
          task: s.task,
          hh: s.hh,
          jd: s.jd
        }));
      });
      const tableEmpty = computed(() => {
        if (noData.value) return emptyText.value;
        if (tableRows.value.length) return "";
        const q = storeQuery.value.trim();
        return q
          ? "没有匹配「" + q + "」的门店，请调整搜索关键词"
          : "当前筛选条件下暂无门店评分数据，请调整门店或平台";
      });

      const reset = () => {
        storeQuery.value = "";
        baseReset();
      };

      return Object.assign(f, {
        storeQuery, reset,
        kpis, sixDim, sixEmpty, growthEmpty, growthDonut, growthBuckets,
        elemeBars, meituanBars, elemeDistEmpty, meituanDistEmpty,
        tableRows, tableEmpty, emptyText, noData
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
          <section class="ov-card">
            <div class="ov-card-head">
              <h3 class="ov-card-title">店铺评分概览</h3>
              <span class="muted-text">比上月 · 店内数据</span>
            </div>
            <div v-if="!kpis.length" class="empty-state">
              <div class="empty-title">暂无店铺评分数据</div>
              <div class="empty-sub">{{ emptyText }}</div>
            </div>
            <div v-else class="ov-kpi-grid tv-grid-4">
              <div class="ov-kpi" v-for="k in kpis" :key="k.label">
                <div class="ov-kpi-label">{{ k.label }}<svg class="i i-12"><use href="#i-info" /></svg></div>
                <div class="ov-kpi-value" :class="{ 'tv-muted-value': k.muted }">{{ k.value }}</div>
                <div class="ov-kpi-foot" :class="k.dir">
                  <template v-if="k.delta">比上月 <b>{{ k.dir === 'up' ? '▲' : '▼' }} {{ k.delta }}</b> <span>{{ k.diff }}</span></template>
                  <template v-else>{{ k.diff }}</template>
                </div>
              </div>
            </div>
          </section>

          <section class="ov-card ov-chart-card">
            <div class="ov-card-head">
              <h3 class="ov-card-title">① 评分六维对比（美团 vs 饿了么，店内评分）</h3>
              <button class="btn btn-ghost" @click="$emit('notify', '已导出评分六维对比（演示）')">导出</button>
            </div>
            <div v-if="sixEmpty" class="empty-state">
              <div class="empty-title">暂无六维评分数据</div>
              <div class="empty-sub">{{ emptyText }}</div>
            </div>
            <group-bar-chart
              v-else
              :key="'fd-six-' + platform + '-' + store"
              :labels="sixDim.labels"
              :series="sixDim.series"
              :max="5"
              :height="240" />
          </section>

          <div class="an-three-col">
            <section class="ov-card ov-chart-card">
              <div class="ov-card-head">
                <h3 class="ov-card-title">② 饿了么商家成长</h3>
                <button class="btn btn-ghost" @click="$emit('notify', '已导出商家成长（演示）')">导出</button>
              </div>
              <div v-if="growthEmpty" class="empty-state">
                <div class="empty-title">暂无商家成长数据</div>
                <div class="empty-sub">{{ growthEmpty }}</div>
              </div>
              <template v-else>
                <div class="an-sub-title">产阶分布（%）</div>
                <ring-chart :key="'fd-donut-' + store" :items="growthDonut" :size="140" />
                <div class="an-sub-title">基础任务完成率分布（%）</div>
                <flow-chart
                  :key="'fd-bucket-' + quick + '-' + store"
                  :labels="growthBuckets.labels"
                  :bars="[{ name: '门店数', color: '#6d84c7', values: growthBuckets.values }]"
                  :height="160" />
              </template>
            </section>

            <section class="ov-card ov-chart-card">
              <div class="ov-card-head">
                <h3 class="ov-card-title">③ {{ data.scoreDist.eleme.title }}</h3>
                <button class="btn btn-ghost" @click="$emit('notify', '已导出评分分布（演示）')">导出</button>
              </div>
              <div v-if="elemeDistEmpty" class="empty-state">
                <div class="empty-title">暂无饿了么评分分布</div>
                <div class="empty-sub">{{ elemeDistEmpty }}</div>
              </div>
              <h-bars v-else :items="elemeBars" :label-width="86" />
            </section>

            <section class="ov-card ov-chart-card">
              <div class="ov-card-head">
                <h3 class="ov-card-title">④ {{ data.scoreDist.meituan.title }}</h3>
                <button class="btn btn-ghost" @click="$emit('notify', '已导出评分分布（演示）')">导出</button>
              </div>
              <div v-if="meituanDistEmpty" class="empty-state">
                <div class="empty-title">暂无美团评分分布</div>
                <div class="empty-sub">{{ meituanDistEmpty }}</div>
              </div>
              <h-bars v-else :items="meituanBars" :label-width="86" />
            </section>
          </div>

          <section class="ov-card">
            <div class="ov-card-head">
              <h3 class="ov-card-title">⑤ 门店评分明细</h3>
              <div class="ov-rank-tools">
                <button class="btn btn-ghost" @click="$emit('notify', '指标选择：已选 7 项（演示）')">指标选择（7）</button>
                <input class="f-input w160" v-model="storeQuery" placeholder="搜索门店" />
              </div>
            </div>
            <div class="ov-table-wrap">
              <table class="tbl an-wide-tbl">
                <thead>
                  <tr><th>门店</th><th>美团店铺分</th><th>美团综合体验</th><th>商品质量分</th><th>基础分</th><th>任务完成率</th><th>海合评分</th><th>京东店铺分</th></tr>
                </thead>
                <tbody>
                  <tr v-for="s in tableRows" :key="s.name">
                    <td class="cell-name">{{ s.name }}</td>
                    <td>{{ s.mt }}</td>
                    <td>{{ s.exp }}</td>
                    <td>{{ s.quality }}</td>
                    <td>{{ s.base }}</td>
                    <td>{{ s.task }}</td>
                    <td>{{ s.hh }}</td>
                    <td class="muted-text">{{ s.jd }}</td>
                  </tr>
                  <tr v-if="!tableRows.length">
                    <td colspan="8">
                      <div class="empty-state">
                        <div class="empty-title">暂无门店评分明细</div>
                        <div class="empty-sub">{{ tableEmpty }}</div>
                      </div>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
            <div class="panel-foot">
              <span>共 {{ tableRows.length }} 家门店</span>
              <button class="btn btn-ghost" @click="$emit('notify', '已导出门店评分明细（演示）')">下载明细（Excel）</button>
            </div>
          </section>
        </div>
      </div>
    `
  };

  /* ================= 顾客分析 ================= */
})();
