/* Page: traffic overview */
(function () {
  const { ref, computed, watch, onMounted, onUnmounted, reactive, nextTick } = Vue;

  window.TrafficOverviewPage = {
    name: "TrafficOverviewPage",
    components: { FlowChart: window.FlowChart, ScatterChart: window.ScatterChart },
    props: { data: Object },
    emits: ["notify"],
    setup(props, { emit }) {
      const quick = ref("近7天");
      const platform = ref(props.data.filters.platforms[0]);
      const store = ref(props.data.filters.stores[0]);
      const keyword = ref("");
      const range = ref("日");
      const metricOpen = ref(false);

      const allPlatform = props.data.filters.platforms[0];
      const allStore = props.data.filters.stores[0];
      const num = (v) => Number(String(v).replace(/[^0-9.-]/g, "")) || 0;
      const fmtInt = (v) => Math.round(v).toLocaleString("en-US");
      const fmtPct = (v, d) => (v * 100).toFixed(d == null ? 1 : d) + "%";
      const ymd = (d) =>
        d.getFullYear() + "-" + String(d.getMonth() + 1).padStart(2, "0") + "-" + String(d.getDate()).padStart(2, "0");
      const todayStr = ymd(new Date());
      const yesterdayStr = ymd(new Date(Date.now() - 86400000));
      const kpiBase = props.data.kpis.find((k) => k.label === "总曝光人数") || {};
      const baseExposure = num(kpiBase.value) || 18669780;

      /* 指标选择：控制门店明细列 */
      const metricDefs = [
        { key: "score", label: "门店评分" },
        { key: "exposure", label: "曝光人数" },
        { key: "enter", label: "入店转化率" },
        { key: "order", label: "下单转化率" },
        { key: "total", label: "总转化率" },
        { key: "delta", label: "曝光环比" }
      ];
      const visible = ref({ score: true, exposure: true, enter: true, order: true, total: true, delta: true });
      const visibleMetrics = computed(() => metricDefs.filter((m) => visible.value[m.key]));
      const visibleCount = computed(() => visibleMetrics.value.length);
      const toggleMetric = (key) => {
        visible.value = Object.assign({}, visible.value, { [key]: !visible.value[key] });
      };

      /* 门店 × 平台明细：演示数据按固定占比拆分，保证同一筛选结果可复现 */
      const platformRows = computed(() => {
        const rows = [];
        props.data.stores.forEach((s, i) => {
          const exposure = num(s.exposure);
          const enter = num(s.enter) / 100;
          const order = num(s.order) / 100;
          const mtOnly = s.name === "北京朝阳大悦城店";
          const mtShare = 0.52 + ((i * 7) % 9) / 100;
          ["美团", "饿了么"].forEach((p) => {
            if (mtOnly && p === "饿了么") return;
            const share = mtOnly ? 1 : p === "美团" ? mtShare : 1 - mtShare;
            const enterRate = enter * (p === "美团" ? 1 : 0.96 + (i % 3) * 0.01);
            const orderRate = order * (p === "美团" ? 1 : 0.94 + (i % 4) * 0.01);
            const exp = exposure * share;
            const visits = exp * enterRate;
            rows.push({
              name: s.name,
              platform: p,
              score: s.score,
              exposure: exp,
              enter: enterRate,
              order: orderRate,
              visits: visits,
              orders: visits * orderRate,
              total: enterRate * orderRate,
              delta: s.delta,
              dir: s.dir
            });
          });
        });
        return rows;
      });

      const dateEmpty = computed(() => quick.value === "今日" || quick.value === "昨日");
      const windowN = computed(() => {
        if (dateEmpty.value) return 0;
        const labs = props.data.trend.labels;
        return quick.value === "近7天" ? Math.min(7, labs.length) : labs.length;
      });
      const windowRatio = computed(() => windowN.value / props.data.trend.labels.length);
      const dateLabel = computed(() => {
        const labs = props.data.trend.labels;
        const year = props.data.filters.dateEnd.slice(0, 4);
        if (quick.value === "今日") return todayStr;
        if (quick.value === "昨日") return yesterdayStr;
        const n = windowN.value || labs.length;
        return year + "-" + labs[labs.length - n] + " 至 " + year + "-" + labs[labs.length - 1];
      });

      /* 平台 / 门店 / 搜索同时生效：不同控件之间取「与」，同一控件内为单选 */
      const filteredRows = computed(() => {
        if (dateEmpty.value) return [];
        const k = keyword.value.trim().toLowerCase();
        return platformRows.value.filter((r) => {
          if (platform.value !== allPlatform && r.platform !== platform.value) return false;
          if (store.value !== allStore && r.name !== store.value) return false;
          if (k && !r.name.toLowerCase().includes(k)) return false;
          return true;
        });
      });

      const totalExposure = computed(() => platformRows.value.reduce((s, r) => s + r.exposure, 0) || 1);
      const share = computed(() => filteredRows.value.reduce((s, r) => s + r.exposure, 0) / totalExposure.value);

      const storeSummaries = computed(() => {
        const map = new Map();
        filteredRows.value.forEach((r) => {
          let o = map.get(r.name);
          if (!o) {
            o = { name: r.name, score: r.score, exposure: 0, visits: 0, orders: 0, delta: r.delta, dir: r.dir };
            map.set(r.name, o);
          }
          o.exposure += r.exposure;
          o.visits += r.visits;
          o.orders += r.orders;
        });
        return Array.from(map.values())
          .map((o) => ({
            name: o.name,
            score: o.score,
            exposure: o.exposure,
            enter: o.exposure ? o.visits / o.exposure : 0,
            order: o.visits ? o.orders / o.visits : 0,
            total: o.exposure ? o.orders / o.exposure : 0,
            delta: o.delta,
            dir: o.dir
          }))
          .sort((a, b) => b.exposure - a.exposure);
      });

      const emptyText = computed(() => {
        if (dateEmpty.value) {
          return "所选日期 " + dateLabel.value + " 超出演示数据范围（" + props.data.filters.dateStart +
            " 至 " + props.data.filters.dateEnd + "），暂无数据";
        }
        if (!filteredRows.value.length) {
          return "没有符合当前筛选条件的门店数据，请调整平台、门店或搜索关键词";
        }
        return "";
      });

      const kpis = computed(() => {
        if (emptyText.value) return [];
        const rows = filteredRows.value;
        const exp = rows.reduce((s, r) => s + r.exposure, 0);
        const visits = rows.reduce((s, r) => s + r.visits, 0);
        const orders = rows.reduce((s, r) => s + r.orders, 0);
        const enterRate = exp ? visits / exp : 0;
        const orderRate = visits ? orders / visits : 0;
        const scopeExposure = baseExposure * share.value * windowRatio.value;
        const adjusted =
          quick.value !== "近30天" || platform.value !== allPlatform || store.value !== allStore || keyword.value.trim() !== "";
        const list = [
          { label: "总曝光人数", value: fmtInt(scopeExposure), delta: "5.7%", diff: "(-1,127,531)", dir: "down" },
          { label: "总进店人数", value: fmtInt(scopeExposure * enterRate), delta: "3.9%", diff: "(+18,164)", dir: "up" },
          { label: "入店转化率", value: fmtPct(enterRate), delta: "4.7%", diff: "(-0.4pp)", dir: "down" },
          { label: "下单转化率", value: fmtPct(orderRate), delta: "2.9%", diff: "(-0.5pp)", dir: "down" },
          { label: "总转化率", value: fmtPct(enterRate * orderRate, 2), delta: "7.6%", diff: "(-0.1pp)", dir: "down" },
          { label: "人均下单频次", value: "待数据", delta: "", diff: "比上月 —（暂无可比数据）", dir: "flat", muted: true }
        ];
        if (!adjusted) return list;
        return list.map((k) => (k.muted ? k : Object.assign({}, k, { delta: "", diff: "所选范围不提供环比" })));
      });

      /* 趋势图：按筛选后的份额和转化率重算，并支持日 / 周 / 月聚合 */
      const chartData = computed(() => {
        if (emptyText.value) return null;
        const base = props.data.trend;
        const n = windowN.value;
        const start = base.labels.length - n;
        const rows = filteredRows.value;
        const expSum = rows.reduce((s, r) => s + r.exposure, 0);
        const visSum = rows.reduce((s, r) => s + r.visits, 0);
        const ordSum = rows.reduce((s, r) => s + r.orders, 0);
        const enterRate = expSum ? visSum / expSum : 0;
        const orderRate = visSum ? ordSum / visSum : 0;
        const baseExp = base.exposure.reduce((a, b) => a + b, 0) || 1;
        const baseVis = base.visits.reduce((a, b) => a + b, 0) || 1;
        const baseRate = base.orderRate.reduce((a, b) => a + b, 0) / (base.orderRate.length || 1);
        const eScale = enterRate ? enterRate / (baseVis / baseExp) : 1;
        const oScale = orderRate && baseRate ? orderRate / baseRate : 1;
        const labels = base.labels.slice(start);
        const exposure = base.exposure.slice(start).map((v) => v * share.value);
        const visits = base.visits.slice(start).map((v) => v * share.value * eScale);
        const rates = base.orderRate.slice(start).map((v) => Math.round(v * oScale * 10) / 10);

        let out = { labels: labels, exposure: exposure, visits: visits, orderRate: rates };
        if (range.value !== "日") {
          const size = range.value === "周" ? 7 : labels.length;
          const agg = { labels: [], exposure: [], visits: [], orderRate: [] };
          for (let i = 0; i < labels.length; i += size) {
            const end = Math.min(i + size, labels.length);
            let e = 0;
            let v = 0;
            let w = 0;
            for (let j = i; j < end; j++) {
              e += exposure[j];
              v += visits[j];
              w += visits[j] * rates[j];
            }
            agg.labels.push(range.value === "月" ? labels[i].slice(0, 2) + "月" : labels[i] + (end - i > 1 ? "~" + labels[end - 1] : ""));
            agg.exposure.push(Math.round(e));
            agg.visits.push(Math.round(v));
            agg.orderRate.push(v ? Math.round((w / v) * 10) / 10 : 0);
          }
          out = agg;
        }
        const flow = out.exposure.reduce((a, b) => a + b, 0);
        const vsum = out.visits.reduce((a, b) => a + b, 0);
        const rate = vsum ? out.orderRate.reduce((s, v, i) => s + v * out.visits[i], 0) / vsum : 0;
        return {
          labels: out.labels,
          exposure: out.exposure,
          visits: out.visits,
          orderRate: out.orderRate,
          flow: flow,
          vsum: vsum,
          rate: rate
        };
      });

      /* 分布图：按筛选后的门店转化率重新分箱 */
      const histograms = computed(() => {
        if (emptyText.value) return [];
        const defs = [
          { src: props.data.histograms.enter, edges: [0, 2, 4, 6, 8, 10], get: (r) => r.enter * 100 },
          { src: props.data.histograms.order, edges: [0, 5, 10, 15, 20], get: (r) => r.order * 100 }
        ];
        return defs.map((d) => ({
          title: d.src.title,
          labels: d.src.labels,
          values: d.src.labels.map((l, i) =>
            storeSummaries.value.filter((r) => {
              const v = d.get(r);
              return i === d.src.labels.length - 1 ? v >= d.edges[i] : v >= d.edges[i] && v < d.edges[i + 1];
            }).length
          )
        }));
      });

      /* 散点图：用筛选后的门店曝光 × 总转化率重算，并重算中位数 */
      const scatterData = computed(() => {
        if (emptyText.value || !storeSummaries.value.length) return null;
        const points = storeSummaries.value.map((r) => ({ x: Math.round(r.exposure), y: Math.round(r.total * 10000) / 100 }));
        const median = (arr) => {
          const a = arr.slice().sort((x, y) => x - y);
          const m = Math.floor(a.length / 2);
          return a.length % 2 ? a[m] : (a[m - 1] + a[m]) / 2;
        };
        return {
          title: props.data.scatter.title,
          points: points,
          medianX: Math.round(median(points.map((p) => p.x))),
          medianY: Math.round(median(points.map((p) => p.y)) * 100) / 100
        };
      });

      const reset = () => {
        quick.value = "近7天";
        platform.value = allPlatform;
        store.value = allStore;
        keyword.value = "";
        range.value = "日";
        visible.value = { score: true, exposure: true, enter: true, order: true, total: true, delta: true };
        metricOpen.value = false;
        emit("notify", "筛选条件已重置");
      };

      const query = () => {
        emit("notify", "已按当前条件筛选：" + storeSummaries.value.length + " 家门店 / " + filteredRows.value.length + " 条平台记录");
      };

      return {
        quick, platform, store, keyword, range, metricOpen,
        metricDefs, visible, visibleMetrics, visibleCount, toggleMetric,
        dateLabel, filteredRows, storeSummaries, emptyText,
        kpis, chartData, histograms, scatterData, reset, query, fmtInt, fmtPct
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
          <span class="ov-date">{{ dateLabel }}</span>
          <select class="f-select w110" v-model="platform">
            <option v-for="o in data.filters.platforms" :key="o">{{ o }}</option>
          </select>
          <select class="f-select w150" v-model="store">
            <option v-for="o in data.filters.stores" :key="o">{{ o }}</option>
          </select>
          <button class="btn btn-primary" @click="query">查询</button>
          <button class="btn btn-ghost" @click="reset">重置</button>
          <span class="toolbar-spacer"></span>
          <span class="muted-text">{{ platform }} · {{ store }}{{ keyword ? ' · 搜索：' + keyword : '' }}</span>
        </div>

        <div class="ov-scroll">
          <section class="ov-card">
            <div class="ov-card-head">
              <h3 class="ov-card-title">核心指标</h3>
              <span class="muted-text">{{ dateLabel }} · {{ platform }} · {{ store }}</span>
            </div>
            <div v-if="emptyText" class="empty-state">
              <div class="empty-title">{{ emptyText }}</div>
              <div class="empty-sub">调整日期、平台、门店或搜索关键词，或点击「重置」恢复全部数据</div>
            </div>
            <div v-else class="ov-kpi-grid tv-grid-3">
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
              <div class="tv-title-group">
                <h3 class="ov-card-title">流量转化趋势</h3>
                <span class="muted-text">曝光量 · 入店率 / 下单率</span>
              </div>
              <div class="tv-tools">
                <div class="tv-seg">
                  <button v-for="r in ['日', '周', '月']" :key="r" :class="{ on: range === r }" @click="range = r">{{ r }}</button>
                </div>
                <button class="btn btn-ghost" @click="$emit('notify', '已导出流量转化趋势（演示）')">导出</button>
              </div>
            </div>
            <div v-if="emptyText" class="empty-state">
              <div class="empty-title">{{ emptyText }}</div>
              <div class="empty-sub">趋势图、分布图与散点图均基于当前筛选结果重算</div>
            </div>
            <template v-else>
              <div class="tv-metric-strip">
                <span>流量 <b>{{ chartData.flow >= 10000 ? (chartData.flow / 10000).toFixed(1) + '万' : fmtInt(chartData.flow) }}</b></span>
                <span>进店 <b>{{ fmtInt(chartData.vsum) }}</b></span>
                <span>下单率 <b>{{ chartData.rate.toFixed(1) }}%</b></span>
                <span class="muted-text">{{ dateLabel }} · {{ range }}维度 · {{ platform }}</span>
              </div>
              <flow-chart
                :key="'flow-' + chartData.labels.join('|') + '-' + chartData.exposure.join('|') + '-' + chartData.orderRate.join('|')"
                :labels="chartData.labels"
                :bars="[{ name: '曝光人数', color: '#6d84c7', values: chartData.exposure }]"
                :lines="[
                  { name: '进店人数', color: '#6f9b78', values: chartData.visits, axis: 'left', fmt: 'num' },
                  { name: '下单率', color: '#c98a4b', values: chartData.orderRate, axis: 'right', fmt: 'pct' }
                ]"
                :axes="{ left: { fmt: 'num' }, right: { fmt: 'pct', max: 30 } }"
                :height="240" />
            </template>
          </section>

          <div class="tv-two-col" v-if="!emptyText">
            <section class="ov-card ov-chart-card" v-for="h in histograms" :key="h.title + '-' + h.values.join(',')">
              <div class="ov-card-head">
                <h3 class="ov-card-title">{{ h.title }}</h3>
                <span class="muted-text">门店数</span>
              </div>
              <flow-chart
                :labels="h.labels"
                :bars="[{ name: '门店数', color: '#7c93cc', values: h.values }]"
                :height="200" />
            </section>
          </div>
          <section v-else class="ov-card ov-chart-card">
            <div class="ov-card-head">
              <h3 class="ov-card-title">入店 / 下单转化率分布</h3>
            </div>
            <div class="empty-state">
              <div class="empty-title">{{ emptyText }}</div>
              <div class="empty-sub">筛选无结果时不再展示 0 值分布</div>
            </div>
          </section>

          <section class="ov-card ov-chart-card">
            <div class="ov-card-head">
              <h3 class="ov-card-title">{{ scatterData ? scatterData.title : data.scatter.title }}</h3>
              <span class="muted-text">虚线为曝光/转化中位数</span>
            </div>
            <div v-if="!scatterData" class="empty-state">
              <div class="empty-title">{{ emptyText || '没有可绘制的门店散点' }}</div>
              <div class="empty-sub">请调整筛选条件后重试</div>
            </div>
            <scatter-chart
              v-else
              :key="'scatter-' + scatterData.points.map(p => p.x + ':' + p.y).join(',')"
              :points="scatterData.points"
              :median-x="scatterData.medianX"
              :median-y="scatterData.medianY"
              :height="260" />
          </section>

          <section class="ov-card">
            <div class="ov-card-head">
              <h3 class="ov-card-title">门店明细</h3>
              <div class="ov-rank-tools">
                <input class="f-input w160" v-model="keyword" placeholder="搜索门店名..." />
                <div class="tv-metric-wrap">
                  <button class="btn btn-ghost" @click="metricOpen = !metricOpen">指标选择（{{ visibleCount }}）</button>
                  <div v-if="metricOpen" class="tv-metric-panel">
                    <label v-for="m in metricDefs" :key="m.key">
                      <input type="checkbox" :checked="visible[m.key]" @change="toggleMetric(m.key)" />
                      <span>{{ m.label }}</span>
                    </label>
                  </div>
                </div>
                <button class="btn btn-primary" @click="$emit('notify', '已导出门店明细（演示）')">下载明细（Excel）</button>
              </div>
            </div>
            <div class="ov-table-wrap">
              <table class="tbl tv-store-tbl">
                <thead>
                  <tr>
                    <th>门店</th>
                    <th v-for="m in visibleMetrics" :key="m.key">{{ m.label }}</th>
                  </tr>
                </thead>
                <tbody>
                  <template v-if="visibleCount">
                    <tr v-for="s in storeSummaries" :key="s.name">
                      <td class="cell-name">{{ s.name }}</td>
                      <td v-if="visible.score"><span class="tv-score" :class="'score-' + s.score">{{ s.score }}</span></td>
                      <td v-if="visible.exposure">{{ fmtInt(s.exposure) }}</td>
                      <td v-if="visible.enter">{{ fmtPct(s.enter) }}</td>
                      <td v-if="visible.order">{{ fmtPct(s.order) }}</td>
                      <td v-if="visible.total">{{ fmtPct(s.total, 2) }}</td>
                      <td v-if="visible.delta" :class="s.dir === 'up' ? 'ov-up' : 'ov-down'">{{ s.dir === 'up' ? '+' : '-' }}{{ s.delta }}</td>
                    </tr>
                  </template>
                  <tr v-if="!storeSummaries.length || !visibleCount">
                    <td :colspan="visibleCount + 1" class="row-empty">{{ emptyText || '请至少选择一项指标后查看门店明细' }}</td>
                  </tr>
                </tbody>
              </table>
            </div>
            <div class="panel-foot">
              <span>共 {{ storeSummaries.length }} 家门店 · {{ filteredRows.length }} 条平台记录</span>
              <span class="foot-note">{{ emptyText ? '当前筛选无结果，未展示 0 值' : '数据周期：' + dateLabel + '（演示数据）' }}</span>
            </div>
          </section>
        </div>
      </div>
    `
  };

  /* ---------- 推广分析 ---------- */
})();
