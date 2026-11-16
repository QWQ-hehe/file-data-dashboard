/* Page: marketing spend */
(function () {
  const { ref, computed, watch, onMounted, onUnmounted, reactive, nextTick } = Vue;

  window.MarketingSpendPage = {
    name: "MarketingSpendPage",
    components: { FlowChart: window.FlowChart, RingChart: window.RingChart },
    props: { data: Object },
    emits: ["notify"],
    setup(props, { emit }) {
      const f = window.useFilters(props, emit);
      const showMom = ref(true);
      const barW = (v) => Math.min(v * 2.4, 100) + "%";
      const typeKeyword = ref("");

      const allPlatform = props.data.filters.platforms[0];
      const allStore = props.data.filters.stores[0];
      const num = (v) => Number(String(v).replace(/[^0-9.-]/g, "")) || 0;
      const money = (v) =>
        "¥" + (Math.round(v * 10) / 10).toLocaleString("en-US", { minimumFractionDigits: 1, maximumFractionDigits: 1 });
      const money2 = (v) =>
        "¥" + (Math.round(v * 100) / 100).toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
      const pct1 = (v) => (Math.round(v * 10) / 10).toFixed(1) + "%";
      const r1 = (v) => (Math.round(v * 10) / 10).toFixed(1);

      const platFactor = computed(() =>
        f.platform.value === "美团" ? 0.62 : f.platform.value === "饿了么" ? 0.38 : 1
      );
      const shareMap = {
        "安徽工学院店": 0.26,
        "深圳湾万象城店": 0.18,
        "北京三里屯店": 0.12,
        "上海世博天地店": 0.16
      };
      const storeShare = computed(() => shareMap[f.store.value] || 1);
      const dayCount = computed(() =>
        f.quick.value === "昨日" ? 1 : f.quick.value === "近7天" ? 7 : 12
      );
      const dayFactor = computed(() => dayCount.value / 12);
      const isFiltered = computed(() =>
        f.quick.value !== "近7天" || f.platform.value !== allPlatform || f.store.value !== allStore
      );
      /* 上海世博天地店为美团新店，饿了么暂无营销数据 */
      const noData = computed(() => f.store.value === "上海世博天地店" && f.platform.value === "饿了么");
      const emptyText = "当前筛选条件下暂无营销支出数据，请调整日期、平台或门店";
      const k = computed(() =>
        isFiltered.value ? platFactor.value * dayFactor.value * storeShare.value : 1
      );

      const platAdjust = {
        "全部": { share: 69.5, power: 30.8, roi: 3.3 },
        "美团": { share: 71.2, power: 31.4, roi: 3.1 },
        "饿了么": { share: 66.4, power: 29.7, roi: 3.6 }
      };
      const storeAdjust = {
        "安徽工学院店": 1.01,
        "深圳湾万象城店": 1.02,
        "北京三里屯店": 0.98,
        "上海世博天地店": 1.04
      };
      const adj = computed(() => storeAdjust[f.store.value] || 1);
      const sharePct = computed(() => {
        if (!isFiltered.value) return 69.5;
        const pa = platAdjust[f.platform.value] || platAdjust["全部"];
        return Math.min(95, pa.share * adj.value);
      });
      const merchantTotal = computed(() => 3444191.58 * k.value);
      const platformTotal = computed(() =>
        merchantTotal.value * ((100 - sharePct.value) / sharePct.value)
      );

      const kpis = computed(() => {
        if (noData.value) return [];
        if (!isFiltered.value) return props.data.kpis;
        const pa = platAdjust[f.platform.value] || platAdjust["全部"];
        return [
          { label: "商家补贴总额", value: money(merchantTotal.value), delta: "", diff: "按当前筛选口径折算" },
          { label: "平台补贴总额", value: money(platformTotal.value), delta: "", diff: "按当前筛选口径折算" },
          { label: "商家补贴占比", value: pct1(sharePct.value), delta: "", diff: "按当前筛选口径折算" },
          { label: "商家营销力度", value: pct1(Math.min(100, pa.power * adj.value)), delta: "", diff: "按当前筛选口径折算" },
          { label: "活动 ROI", value: r1(pa.roi * adj.value), delta: "", diff: "按当前筛选口径折算" }
        ];
      });

      const costComposition = computed(() => {
        if (noData.value) return [];
        if (!isFiltered.value) return props.data.costComposition;
        return [
          { name: "商家成本", value: Math.round(sharePct.value * 10) / 10, amount: money2(merchantTotal.value), avg: "单均 ¥11.92", color: "#5b77b8" },
          { name: "平台成本", value: Math.round((100 - sharePct.value) * 10) / 10, amount: money2(platformTotal.value), avg: "单均 ¥5.24", color: "#a9b8d8" }
        ];
      });

      const newOld = computed(() => {
        if (noData.value) return null;
        if (!isFiltered.value) return props.data.newOld;
        const baseOld = f.platform.value === "美团" ? 47.6 : f.platform.value === "饿了么" ? 45.7 : 46.4;
        const oldPct = Math.min(95, baseOld * adj.value);
        const blockTotal = merchantTotal.value * 0.502;
        const oldAmount = blockTotal * (oldPct / 100);
        return {
          title: "新老客商家成本 · " + (f.platform.value === allPlatform ? "全渠道" : f.platform.value),
          items: [
            { name: "老客", value: Math.round(oldPct * 10) / 10, amount: money2(oldAmount), avg: "单均 ¥10.92", color: "#5b77b8" },
            { name: "新客", value: Math.round((100 - oldPct) * 10) / 10, amount: money2(blockTotal - oldAmount), avg: "单均 ¥11.73", color: "#a9b8d8" }
          ]
        };
      });

      const trend = computed(() => {
        if (noData.value) return null;
        if (!isFiltered.value) return props.data.trend;
        const src = props.data.trend;
        const start = src.dates.length - dayCount.value;
        const factor = platFactor.value * storeShare.value;
        const rateAdj =
          (f.platform.value === "美团" ? 1.02 : f.platform.value === "饿了么" ? 0.97 : 1) * adj.value;
        return {
          dates: src.dates.slice(start),
          merchant: src.merchant.slice(start).map((v) => Math.round(v * factor)),
          platform: src.platform.slice(start).map((v) => Math.round(v * factor)),
          rate: src.rate.slice(start).map((v) => Math.round(v * rateAdj * 10) / 10)
        };
      });
      const trendKey = computed(
        () =>
          "mk-trend-" + f.quick.value + "-" + f.platform.value + "-" + f.store.value + "-" +
          (trend.value ? trend.value.dates.length : 0)
      );

      const donuts = computed(() => {
        if (noData.value) return [];
        if (!isFiltered.value) return props.data.donuts;
        return props.data.donuts.filter(
          (d) => f.platform.value === allPlatform || d.title.indexOf(f.platform.value) >= 0
        );
      });

      const activities = computed(() => {
        if (noData.value) return [];
        if (!isFiltered.value) return props.data.activities;
        const factor = platFactor.value * dayFactor.value * storeShare.value;
        return props.data.activities
          .filter((a) => f.platform.value === allPlatform || a.title.indexOf(f.platform.value) >= 0)
          .map((a) => ({
            title: a.title,
            items: a.items.map((i) => ({
              name: i.name,
              amount: money2(num(i.amount) * factor),
              share: String(Math.round(i.share * 10) / 10),
              orders: i.orders,
              roi: i.roi
            }))
          }));
      });

      const detailRows = computed(() => {
        if (noData.value) return [];
        const kw = typeKeyword.value.trim();
        const factor = isFiltered.value ? dayFactor.value * storeShare.value : 1;
        return props.data.detail
          .filter((r) => f.platform.value === allPlatform || r.platform === f.platform.value)
          .filter((r) => !kw || r.type.indexOf(kw) >= 0)
          .map((r) => ({
            platform: r.platform,
            type: r.type,
            merchant: money2(num(r.merchant) * factor),
            plat: money2(num(r.plat) * factor),
            mAvg: r.mAvg,
            pAvg: r.pAvg,
            mOrders: Math.round(num(r.mOrders) * factor).toLocaleString("en-US"),
            orders: r.orders,
            incomeRate: r.incomeRate,
            share: r.share,
            verify: r.verify
          }));
      });
      const detailEmptyText = computed(() =>
        noData.value
          ? emptyText
          : "没有匹配「" + typeKeyword.value.trim() + "」的活动类型，请调整搜索关键词"
      );

      return Object.assign(f, {
        showMom,
        barW,
        typeKeyword,
        kpis,
        costComposition,
        newOld,
        trend,
        trendKey,
        donuts,
        activities,
        detailRows,
        detailEmptyText,
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
          <section class="ov-card">
            <div class="ov-card-head">
              <h3 class="ov-card-title">营销总览</h3>
              <label class="ps-switch">
                <input type="checkbox" v-model="showMom" />
                <span>显示环比数据</span>
              </label>
            </div>
            <div class="mk-kpi-grid" v-if="kpis.length">
              <div class="ov-kpi mk-kpi" v-for="k in kpis" :key="k.label">
                <div class="ov-kpi-label">{{ k.label }}<svg class="i i-12"><use href="#i-info" /></svg></div>
                <div class="ov-kpi-value">{{ k.value }}</div>
                <div class="ov-kpi-foot" :class="showMom ? k.dir : ''">
                  <template v-if="showMom">比上月 <b>{{ k.dir === 'up' ? '▲' : (k.dir === 'down' ? '▼' : '') }} {{ k.delta }}</b> <span>{{ k.diff }}</span></template>
                  <template v-else>—</template>
                </div>
              </div>
            </div>
            <div v-else class="empty-state">
              <div class="empty-title">暂无营销核心指标</div>
              <div class="empty-sub">{{ emptyText }}</div>
            </div>
          </section>

          <section class="ov-card">
            <div class="ov-card-head"><h3 class="ov-card-title">活动成本分布</h3></div>
            <div class="mk-cost-grid">
              <div class="mk-subcard">
                <div class="an-sub-title">活动总成本构成</div>
                <template v-if="costComposition.length">
                  <div class="mk-cost-row" v-for="c in costComposition" :key="c.name">
                    <span class="mk-cost-name">{{ c.name }}</span>
                    <span class="mk-cost-track"><i :style="{ width: c.value + '%', background: c.color }"></i></span>
                    <span class="mk-cost-pct">{{ c.value }}%</span>
                    <span class="mk-cost-amount">{{ c.amount }}<em>{{ c.avg }}</em></span>
                  </div>
                </template>
                <div v-else class="empty-sub">{{ emptyText }}</div>
              </div>
              <div class="mk-subcard">
                <div class="an-sub-title">{{ newOld ? newOld.title : '新老客商家成本' }}</div>
                <template v-if="newOld">
                  <div class="mk-cost-row" v-for="c in newOld.items" :key="c.name">
                    <span class="mk-cost-name">{{ c.name }}</span>
                    <span class="mk-cost-track"><i :style="{ width: c.value + '%', background: c.color }"></i></span>
                    <span class="mk-cost-pct">{{ c.value }}%</span>
                    <span class="mk-cost-amount">{{ c.amount }}<em>{{ c.avg }}</em></span>
                  </div>
                </template>
                <div v-else class="empty-sub">{{ emptyText }}</div>
              </div>
            </div>
          </section>

          <section class="ov-card ov-chart-card">
            <div class="ov-card-head">
              <h3 class="ov-card-title">商家补贴 / 平台补贴趋势 <svg class="i i-12"><use href="#i-info" /></svg></h3>
              <div class="tv-tools">
                <div class="tv-seg"><button class="on">日</button><button @click="$emit('notify', '周维度（演示）')">周</button><button @click="$emit('notify', '月维度（演示）')">月</button></div>
                <button class="btn btn-ghost" @click="$emit('notify', '已导出补贴趋势（演示）')">导出</button>
              </div>
            </div>
            <flow-chart
              v-if="trend"
              :key="trendKey"
              :labels="trend.dates"
              :bars="[
                { name: '商家补贴', color: '#5b77b8', values: trend.merchant },
                { name: '平台补贴', color: '#8fb2a6', values: trend.platform }
              ]"
              :lines="[{ name: '商家补贴率', color: '#c8825a', values: trend.rate, axis: 'right', fmt: 'pct' }]"
              :axes="{ right: { max: 35, fmt: 'pct' } }"
              :height="260" />
            <div v-else class="empty-state">
              <div class="empty-title">暂无补贴趋势数据</div>
              <div class="empty-sub">{{ emptyText }}</div>
            </div>
            <div class="tv-foot-note">左轴：补贴金额（元） · 右轴：商家补贴率（%）</div>
          </section>

          <section class="ov-card">
            <div class="ov-card-head"><h3 class="ov-card-title">各类支出占比</h3></div>
            <div class="mk-donuts" v-if="donuts.length">
              <div class="mk-subcard" v-for="d in donuts" :key="d.title">
                <div class="an-sub-title">{{ d.title }}</div>
                <ring-chart :key="'mk-donut-' + platform + '-' + store + '-' + d.title" :items="d.items" :size="160" :thickness="26" />
              </div>
            </div>
            <div v-else class="empty-state">
              <div class="empty-title">暂无支出占比数据</div>
              <div class="empty-sub">{{ emptyText }}</div>
            </div>
          </section>

          <section class="ov-card">
            <div class="ov-card-head"><h3 class="ov-card-title">各类活动成本与效果</h3></div>
            <div class="mk-acts" v-if="activities.length">
              <div class="mk-subcard" v-for="a in activities" :key="a.title">
                <div class="mk-act-head">
                  <span class="an-sub-title">{{ a.title }}</span>
                  <button class="btn btn-ghost" @click="$emit('notify', '已导出活动效果（演示）')">导出</button>
                </div>
                <div class="mk-act-scroll">
                  <div class="mk-act-row" v-for="i in a.items" :key="i.name">
                    <span class="mk-act-name">{{ i.name }}</span>
                    <span class="mk-act-track"><i :style="{ width: barW(i.share) }"></i></span>
                    <span class="mk-act-amount">{{ i.amount }}<em>{{ i.share }}% · 订单 {{ i.orders }}</em></span>
                    <span class="mk-act-roi">ROI {{ i.roi }}</span>
                  </div>
                </div>
              </div>
            </div>
            <div v-else class="empty-state">
              <div class="empty-title">暂无活动成本数据</div>
              <div class="empty-sub">{{ emptyText }}</div>
            </div>
          </section>

          <section class="ov-card">
            <div class="ov-card-head">
              <h3 class="ov-card-title">活动明细</h3>
              <div class="tv-tools">
                <div class="tv-seg">
                  <button :class="{ on: platform === '美团' }" @click="platform = '美团'">美团</button>
                  <button :class="{ on: platform === '饿了么' }" @click="platform = '饿了么'">饿了么</button>
                </div>
                <input class="f-select mk-search" placeholder="搜索活动类型" v-model="typeKeyword" />
                <button class="btn btn-ghost" @click="$emit('notify', '已导出活动明细（演示）')">导出</button>
              </div>
            </div>
            <div class="ov-table-wrap an-scroll-300">
              <table class="tbl mk-wide-tbl">
                <thead>
                  <tr>
                    <th>平台</th><th>活动分类</th><th>商家补贴 ¥</th><th>平台补贴 ¥</th><th>单均商家补贴 ¥</th><th>单均平台补贴 ¥</th>
                    <th>商家补贴订单数</th><th>活动实收率</th><th>商家补贴占比</th><th>核销数</th>
                  </tr>
                </thead>
                <tbody>
                  <tr v-for="r in detailRows" :key="r.platform + r.type">
                    <td><span class="mk-platform" :class="r.platform === '美团' ? 'mt' : 'ele'">{{ r.platform }}</span></td>
                    <td class="cell-name">{{ r.type }}</td>
                    <td>{{ r.merchant }}</td>
                    <td>{{ r.plat }}</td>
                    <td>{{ r.mAvg }}</td>
                    <td>{{ r.pAvg }}</td>
                    <td>{{ r.mOrders }}</td>
                    <td>{{ r.incomeRate }}</td>
                    <td>{{ r.share }}</td>
                    <td>{{ r.verify }}</td>
                  </tr>
                  <tr v-if="!detailRows.length"><td colspan="10" class="row-empty">{{ detailEmptyText }}</td></tr>
                </tbody>
              </table>
            </div>
          </section>
        </div>
      </div>
    `
  };

  /* ================= 营销场景分析 ================= */
})();
