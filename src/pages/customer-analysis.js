/* Page: customer analysis */
(function () {
  const { ref, computed, watch, onMounted, onUnmounted, reactive, nextTick } = Vue;

  window.CustomerAnalysisPage = {
    name: "CustomerAnalysisPage",
    components: { FlowChart: window.FlowChart },
    props: { data: Object },
    emits: ["notify"],
    setup(props, { emit }) {
      const f = window.useFilters(props, emit);
      const keyword = ref("");
      const acqKeyword = ref("");

      const allPlatform = props.data.filters.platforms[0];
      const allStore = props.data.filters.stores[0];
      const num = (v) => Number(String(v).replace(/[^0-9.-]/g, "")) || 0;
      const fmtInt = (v) => Math.round(v).toLocaleString("en-US");
      const r1 = (v) => (Math.round(v * 10) / 10).toFixed(1);
      const avg = (list) => (list.length ? list.reduce((s, v) => s + v, 0) / list.length : 0);

      const isFiltered = computed(
        () =>
          f.quick.value !== "近7天" ||
          f.platform.value !== allPlatform ||
          f.store.value !== allStore
      );
      const storeRow = computed(() =>
        f.store.value === allStore
          ? null
          : props.data.storeRows.find((s) => s.name === f.store.value) || null
      );
      const noData = computed(() => f.store.value !== allStore && !storeRow.value);
      const emptyText = computed(() =>
        noData.value
          ? "当前门店暂无顾客分析数据，请切换门店后重试"
          : "当前筛选条件下暂无顾客数据，请调整日期、平台或门店"
      );

      const platFactor = computed(() =>
        f.platform.value === "美团" ? 0.62 : f.platform.value === "饿了么" ? 0.38 : 1
      );
      const quickFactor = computed(() =>
        f.quick.value === "今日" || f.quick.value === "昨日"
          ? 1 / 30
          : f.quick.value === "近7天"
          ? 7 / 30
          : 1
      );
      const storeShare = computed(() =>
        storeRow.value ? num(storeRow.value.total) / num(props.data.storeTotal.total) : 1
      );

      /* 4 张核心指标 */
      const kpis = computed(() => {
        if (!isFiltered.value) return props.data.kpis;
        if (noData.value) return [];
        const rows = storeRow.value ? [storeRow.value] : props.data.storeRows;
        const base = storeRow.value
          ? num(storeRow.value.total)
          : num(props.data.storeTotal.total);
        const total = base * quickFactor.value * platFactor.value;
        const oldRate = storeRow.value
          ? (num(storeRow.value.old) / base) * 100
          : (num(props.data.storeTotal.old) / base) * 100;
        return [
          { label: "总下单人数", value: fmtInt(total), diff: "当前筛选口径合计" },
          { label: "老客占比", value: r1(oldRate) + "%", diff: "当前筛选门店均值" },
          {
            label: "新客近30日复购率",
            value: r1(avg(rows.map((r) => num(r.repurchase)))) + "%",
            diff: "当前筛选门店均值"
          },
          {
            label: "人均下单频次",
            value: avg(rows.map((r) => num(r.freq))).toFixed(2),
            diff: "当前筛选门店均值"
          }
        ];
      });

      /* 新老客趋势：按日期窗口切片并按平台/门店折算 */
      const windowLabels = computed(() => {
        const all = props.data.trend.labels;
        if (f.quick.value === "今日") return all.slice(-1);
        if (f.quick.value === "昨日") return all.slice(-2, -1);
        if (f.quick.value === "近7天") return all.slice(-7);
        return all.slice();
      });
      const trend = computed(() => {
        const src = props.data.trend;
        if (!isFiltered.value) return src;
        const start = src.labels.length - windowLabels.value.length;
        const k = platFactor.value * storeShare.value;
        return {
          labels: windowLabels.value,
          total: src.total.slice(start).map((v) => Math.round(v * k)),
          old: src.old.slice(start).map((v) => Math.round(v * k)),
          newRate: src.newRate.slice(start),
          oldRate: src.oldRate.slice(start)
        };
      });
      const trendEmpty = computed(() => noData.value);

      /* 人均下单频次趋势 */
      const freqTrend = computed(() => {
        const src = props.data.freqTrend;
        if (!isFiltered.value) return src;
        const start = src.labels.length - windowLabels.value.length;
        const k = storeRow.value ? num(storeRow.value.freq) : 1;
        return {
          labels: windowLabels.value,
          values: src.values.slice(start).map((v) => Math.round(v * k * 100) / 100)
        };
      });

      /* 获客率明细 */
      const acquisition = computed(() => {
        const k = acqKeyword.value.trim().toLowerCase();
        return props.data.acquisition.filter(
          (a) =>
            (f.platform.value === allPlatform || a.platform === f.platform.value) &&
            (f.store.value === allStore || a.name === f.store.value) &&
            (!k || a.name.toLowerCase().includes(k) || a.platform.indexOf(k) >= 0)
        );
      });
      const acqEmptyText = computed(() => {
        if (noData.value) return emptyText.value;
        return "没有符合当前门店、平台与搜索条件的获客率数据";
      });

      /* 门店明细 */
      const storeRows = computed(() => {
        const k = keyword.value.trim().toLowerCase();
        return props.data.storeRows.filter(
          (s) =>
            (f.store.value === allStore || s.name === f.store.value) &&
            (!k || s.name.toLowerCase().includes(k) || s.tk.toLowerCase().includes(k))
        );
      });
      const storeEmptyText = computed(() =>
        noData.value ? emptyText.value : "没有符合当前门店与搜索条件的门店明细"
      );
      const footer = computed(() => {
        if (!isFiltered.value && !keyword.value.trim()) return props.data.storeTotal;
        /* 合计与 KPI 同口径：全域（或选中门店）× 平台系数 × 时间系数，搜索只影响可见行 */
        const k = platFactor.value * quickFactor.value;
        const src = storeRow.value ? storeRow.value : props.data.storeTotal;
        return {
          total: fmtInt(num(src.total) * k),
          newC: fmtInt(num(src.newC) * k),
          old: fmtInt(num(src.old) * k),
          newRate: src.newRate
        };
      });

      return Object.assign(f, {
        keyword,
        acqKeyword,
        acquisition,
        storeRows,
        kpis,
        trend,
        trendEmpty,
        freqTrend,
        footer,
        emptyText,
        noData,
        acqEmptyText,
        storeEmptyText
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
              <div class="tv-title-group">
                <h3 class="ov-card-title">最近 30 日获客率</h3>
                <span class="muted-text">数据来源：门店维度 · 筛选维度</span>
              </div>
              <div class="ov-rank-tools">
                <input class="f-input w170" v-model="acqKeyword" placeholder="搜索门店名 / TK 码" />
                <button class="btn btn-ghost" @click="$emit('notify', '已导出最近30日获客率（演示）')">下载明细（Excel）</button>
              </div>
            </div>
            <div class="ov-table-wrap an-scroll-240">
              <table class="tbl">
                <thead><tr><th>门店</th><th>平台</th><th>统计日期</th><th>近30日获客率</th></tr></thead>
                <tbody>
                  <tr v-for="(a, i) in acquisition" :key="a.name + a.platform + i">
                    <td class="cell-name">{{ a.name }}</td>
                    <td><span class="tv-platform" :class="a.platform === '美团' ? 'mt' : 'ele'">{{ a.platform }}</span></td>
                    <td>{{ a.date }}</td>
                    <td :class="{ 'muted-text': a.rate === '暂停营业' }">{{ a.rate }}</td>
                  </tr>
                  <tr v-if="!acquisition.length"><td colspan="4" class="row-empty">{{ acqEmptyText }}</td></tr>
                </tbody>
              </table>
            </div>
            <div class="panel-foot">
              <span>共 {{ acquisition.length }} 条</span>
              <span class="foot-note">数据周期：{{ data.filters.dateStart }} 至 {{ data.filters.dateEnd }}</span>
            </div>
          </section>

          <section class="ov-card">
            <div class="ov-card-head">
              <h3 class="ov-card-title">核心指标</h3>
              <span class="muted-text">比上月 · 双平台汇总</span>
            </div>
            <div v-if="!kpis.length" class="empty-state">
              <div class="empty-title">暂无顾客核心指标</div>
              <div class="empty-sub">{{ emptyText }}</div>
            </div>
            <div v-else class="ov-kpi-grid tv-grid-4">
              <div class="ov-kpi" v-for="k in kpis" :key="k.label">
                <div class="ov-kpi-label">{{ k.label }}<svg class="i i-12"><use href="#i-info" /></svg></div>
                <div class="ov-kpi-value">{{ k.value }}</div>
                <div class="ov-kpi-foot" :class="k.dir">
                  <template v-if="k.delta">比上月 <b>{{ k.dir === 'up' ? '▲' : '▼' }} {{ k.delta }}</b> <span>{{ k.diff }}</span></template>
                  <template v-else>{{ k.diff }}</template>
                </div>
              </div>
            </div>
          </section>

          <section class="ov-card ov-chart-card">
            <div class="ov-card-head">
              <h3 class="ov-card-title">新老客占比及变化趋势</h3>
              <button class="btn btn-ghost" @click="$emit('notify', '已导出趋势数据（演示）')">导出</button>
            </div>
            <div v-if="trendEmpty" class="empty-state">
              <div class="empty-title">暂无新老客趋势数据</div>
              <div class="empty-sub">{{ emptyText }}</div>
            </div>
            <flow-chart
              v-else
              :key="'ca-trend-' + quick + '-' + platform + '-' + store + '-' + trend.labels.length + '-' + (trend.total[0] || 0)"
              :labels="trend.labels"
              :bars="[
                { name: '下单人数', color: '#6d84c7', values: trend.total.map((v, i) => v - trend.old[i]) },
                { name: '下单老客', color: '#7fa08a', values: trend.old }
              ]"
              :lines="[
                { name: '新客占比', color: '#c98a4b', values: trend.newRate, axis: 'right', fmt: 'pct' },
                { name: '老客占比', color: '#8a6fb0', values: trend.oldRate, axis: 'right', fmt: 'pct' }
              ]"
              :axes="{ left: { fmt: 'num' }, right: { fmt: 'pct', max: 100 } }"
              :height="250" />
          </section>

          <section class="ov-card ov-chart-card">
            <div class="ov-card-head">
              <h3 class="ov-card-title">人均下单频次趋势</h3>
              <button class="btn btn-ghost" @click="$emit('notify', '已导出人均下单频次（演示）')">导出</button>
            </div>
            <div v-if="trendEmpty" class="empty-state">
              <div class="empty-title">暂无下单频次趋势数据</div>
              <div class="empty-sub">{{ emptyText }}</div>
            </div>
            <flow-chart
              v-else
              :key="'ca-freq-' + quick + '-' + platform + '-' + store + '-' + freqTrend.labels.length + '-' + (freqTrend.values[0] || 0)"
              :labels="freqTrend.labels"
              :bars="[]"
              :lines="[{ name: '人均下单频次', color: '#6d84c7', values: freqTrend.values, axis: 'left', fmt: 'num' }]"
              :axes="{ left: { fmt: 'num', max: 1.2 } }"
              :height="200" />
          </section>

          <section class="ov-card">
            <div class="ov-card-head">
              <h3 class="ov-card-title">门店明细</h3>
              <div class="ov-rank-tools">
                <button class="btn btn-ghost" @click="$emit('notify', '指标选择：已选 9 项（演示）')">指标选择（9）</button>
                <input class="f-input w160" v-model="keyword" placeholder="搜索门店名 / TK" />
                <button class="btn btn-primary" @click="$emit('notify', '已导出门店明细（演示）')">下载明细（Excel）</button>
              </div>
            </div>
            <div class="ov-table-wrap">
              <table class="tbl an-wide-tbl">
                <thead>
                  <tr>
                    <th>门店名称</th><th>TK码</th><th>总下单人数</th><th>下单新客</th><th>下单老客</th>
                    <th>新客占比</th><th>近30日新客获客率</th><th>近30日新客复购率</th><th>人均下单频次</th><th>老客占比环比</th>
                  </tr>
                </thead>
                <tbody>
                  <tr v-for="s in storeRows" :key="s.tk">
                    <td class="cell-name">{{ s.name }}</td>
                    <td class="muted-text">{{ s.tk }}</td>
                    <td>{{ s.total }}</td>
                    <td>{{ s.newC }}</td>
                    <td>{{ s.old }}</td>
                    <td>{{ s.newRate }}</td>
                    <td>{{ s.acq }}</td>
                    <td>{{ s.repurchase }}</td>
                    <td>{{ s.freq }}</td>
                    <td :class="s.dir === 'up' ? 'ov-up' : 'ov-down'">{{ s.dir === 'up' ? '▲' : '▼' }} {{ s.delta }}</td>
                  </tr>
                  <tr v-if="!storeRows.length"><td colspan="10" class="row-empty">{{ storeEmptyText }}</td></tr>
                </tbody>
              </table>
            </div>
            <div class="panel-foot">
              <span>共 {{ storeRows.length }} 家门店 · 总计 {{ footer.total }} 人</span>
              <span class="foot-note">合计：新客 {{ footer.newC }} · 老客 {{ footer.old }} · 新客占比 {{ footer.newRate }}</span>
            </div>
          </section>
        </div>
      </div>
    `
  };

  /* ================= 评价分析 ================= */
})();
