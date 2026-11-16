/* Page: marketing scene */
(function () {
  const { ref, computed, watch, onMounted, onUnmounted, reactive, nextTick } = Vue;

  window.MarketingScenePage = {
    name: "MarketingScenePage",
    components: { FlowChart: window.FlowChart },
    props: { data: Object },
    emits: ["notify"],
    setup(props, { emit }) {
      const f = window.useFilters(props, emit);
      const prodTab = ref(0);

      const allPlatform = props.data.filters.platforms[0];
      const allStore = props.data.filters.stores[0];
      const num = (v) => Number(String(v).replace(/[^0-9.-]/g, "")) || 0;
      const comma = (v) => Math.round(v).toLocaleString("en-US");
      const pct1 = (v) => (Math.round(v * 10) / 10).toFixed(1) + "%";
      const r1 = (v) => (Math.round(v * 10) / 10).toFixed(1);
      const money0 = (v) => "¥" + comma(v);
      const money1 = (v) =>
        "¥" + (Math.round(v * 10) / 10).toLocaleString("en-US", { minimumFractionDigits: 1, maximumFractionDigits: 1 });
      const money2 = (v) =>
        "¥" + (Math.round(v * 100) / 100).toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 });

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
      const weekCount = computed(() =>
        f.quick.value === "昨日" ? 2 : f.quick.value === "近7天" ? 4 : 12
      );
      const isFiltered = computed(() =>
        f.quick.value !== "近7天" || f.platform.value !== allPlatform || f.store.value !== allStore
      );
      /* 场景明细仅覆盖安徽工学院店 / 深圳湾万象城店 */
      const noData = computed(() =>
        f.store.value !== allStore && f.store.value !== "安徽工学院店" && f.store.value !== "深圳湾万象城店"
      );
      const emptyText = "当前筛选条件下暂无营销场景数据，请调整日期、平台或门店";
      const k = computed(() =>
        isFiltered.value ? platFactor.value * dayFactor.value * storeShare.value : 1
      );

      const shiftMap = { "安徽工学院店": 0.2, "深圳湾万象城店": 0.4, "北京三里屯店": -0.3, "上海世博天地店": 0.5 };
      const shift = computed(() => (f.store.value === allStore ? 0 : shiftMap[f.store.value] || 0));
      const platShift = computed(() =>
        f.platform.value === "美团" ? 0.8 : f.platform.value === "饿了么" ? -0.9 : 0
      );

      const kpiGroups = computed(() => {
        if (noData.value) return [];
        if (!isFiltered.value) return props.data.kpiGroups;
        return props.data.kpiGroups.map((g) => ({
          label: g.label,
          items: g.items.map((it) => {
            if (it.value === "待数据") return { label: it.label, value: "待数据", delta: "—", dir: "" };
            if (it.label === "实付 GMV") {
              return { label: it.label, value: comma(num(it.value) * k.value), delta: "—", dir: "" };
            }
            if (it.label === "实收订单量") {
              return { label: it.label, value: comma(num(it.value) * k.value), delta: "—", dir: "" };
            }
            if (it.label === "GMV 渗透率") {
              const sceneAdj = g.label.indexOf("神抢手") >= 0 ? -0.4 : g.label.indexOf("拼好饭") >= 0 ? 0.3 : 0.2;
              return {
                label: it.label,
                value: pct1(Math.max(0, num(it.value) + platShift.value * sceneAdj + shift.value)),
                delta: "—",
                dir: ""
              };
            }
            /* 单均价 / 单均补贴：GMV 与订单同比例折算，仅随门店价格水平微调 */
            return { label: it.label, value: r1(num(it.value) * (1 + shift.value / 100)), delta: "—", dir: "" };
          })
        }));
      });

      const extraAdj = {
        "拼好饭订单占比（含拼团）": 1.1,
        "神抢手订单占比（含超抢手）": -1.3,
        "主站顾客实付率": -0.6,
        "拼好饭顾客实付率": 0.8
      };
      const extraKpis = computed(() => {
        if (noData.value) return [];
        if (!isFiltered.value) return props.data.extraKpis;
        const dir = f.platform.value === "美团" ? 1 : f.platform.value === "饿了么" ? -1 : 0;
        return props.data.extraKpis.map((it) => ({
          label: it.label,
          value: pct1(Math.max(0, num(it.value) + (extraAdj[it.label] || 0) * dir + shift.value)),
          delta: "—",
          dir: ""
        }));
      });

      const charts = computed(() => {
        if (noData.value) return [];
        const src = props.data.weekly.charts;
        if (!isFiltered.value) {
          return src.map((c) => ({
            title: c.title,
            labels: props.data.weekly.labels,
            series: c.series.map((s) => ({ name: s.name, color: s.color, values: s.values, axis: "left", fmt: "pct" }))
          }));
        }
        const start = props.data.weekly.labels.length - weekCount.value;
        return src.map((c) => ({
          title: c.title,
          labels: props.data.weekly.labels.slice(start),
          series: c.series
            .filter((s) => f.platform.value === allPlatform || s.name.indexOf(f.platform.value) >= 0)
            .map((s) => ({
              name: s.name,
              color: s.color,
              axis: "left",
              fmt: "pct",
              values: s.values.slice(start).map((v) => Math.round((v + shift.value) * 10) / 10)
            }))
        }));
      });
      const chartKey = computed(() => "ms-chart-" + f.platform.value + "-" + f.store.value);

      const prodFactor = computed(() =>
        isFiltered.value ? dayFactor.value * storeShare.value : 1
      );
      const productView = computed(() => {
        if (noData.value) return null;
        const s = props.data.products.sets[prodTab.value];
        if (!isFiltered.value) return s;
        const scale = (list) =>
          list.map((p) => ({
            name: p.name,
            share: p.share,
            price: p.price,
            width: p.width,
            qty: comma(num(p.qty) * prodFactor.value)
          }));
        const total = (txt) => "总计销量 " + comma(num(txt) * prodFactor.value);
        return {
          leftTitle: s.leftTitle,
          rightTitle: s.rightTitle,
          leftTotal: total(s.leftTotal),
          rightTotal: total(s.rightTotal),
          left: f.platform.value === "美团" ? [] : scale(s.left),
          right: f.platform.value === "饿了么" ? [] : scale(s.right)
        };
      });

      const sceneRows = computed(() => {
        if (noData.value) return [];
        const factor = isFiltered.value ? dayFactor.value * storeShare.value : 1;
        return props.data.sceneTable
          .filter((r) => f.platform.value === allPlatform || r.platform === f.platform.value)
          .map((r) => ({
            platform: r.platform,
            scene: r.scene,
            orders: comma(num(r.orders) * factor),
            gmv: money0(num(r.gmv) * factor),
            income: r.income,
            incomeRate: r.incomeRate,
            cups: comma(num(r.cups) * factor),
            avgIncome: r.avgIncome,
            activitySub: money1(num(r.activitySub) * factor),
            avgSub: r.avgSub,
            profit: money2(num(r.profit) * factor)
          }));
      });

      const sceneStoreRows = computed(() =>
        props.data.storeRows
          .filter((r) => f.platform.value === allPlatform || r.platform === f.platform.value)
          .filter((r) => f.store.value === allStore || r.store === f.store.value)
          .map((r) =>
            Object.assign({}, r, {
              orders: isFiltered.value ? comma(num(r.orders) * dayFactor.value) : r.orders,
              qty: isFiltered.value ? comma(num(r.qty) * dayFactor.value) : r.qty
            })
          )
      );
      const sceneStoreEmptyText = computed(() =>
        noData.value
          ? "当前门店暂无场景明细，请切换门店"
          : "当前筛选条件下暂无门店场景明细，请调整日期、平台或门店"
      );

      return Object.assign(f, {
        prodTab,
        kpiGroups,
        extraKpis,
        charts,
        chartKey,
        productView,
        sceneRows,
        sceneStoreRows,
        sceneStoreEmptyText,
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
              <h3 class="ov-card-title">场景核心指标 <svg class="i i-12"><use href="#i-info" /></svg></h3>
              <span class="muted-text">{{ platform === '全部' ? '全部渠道' : platform }} · {{ store }}</span>
            </div>
            <template v-if="kpiGroups.length">
              <div class="ms-kpi-row" v-for="g in kpiGroups" :key="g.label">
                <div class="ms-kpi-label">{{ g.label }}</div>
                <div class="ms-kpi-cells">
                  <div class="ov-kpi ms-kpi" v-for="k in g.items" :key="k.label">
                    <div class="ov-kpi-label">{{ k.label }}</div>
                    <div class="ov-kpi-value">{{ k.value }}</div>
                    <div class="ov-kpi-foot" :class="k.dir">
                      <template v-if="k.delta !== '—'">{{ k.dir === 'up' ? '▲' : '▼' }} {{ k.delta }}</template>
                      <template v-else>—</template>
                    </div>
                  </div>
                </div>
              </div>
              <div class="ms-extra">
                <div class="ov-kpi" v-for="k in extraKpis" :key="k.label">
                  <div class="ov-kpi-label">{{ k.label }}</div>
                  <div class="ov-kpi-value">{{ k.value }}</div>
                  <div class="ov-kpi-foot" :class="k.dir">
                    <template v-if="k.delta !== '—'">{{ k.dir === 'up' ? '▲' : '▼' }} {{ k.delta }}</template>
                    <template v-else>—</template>
                  </div>
                </div>
              </div>
            </template>
            <div v-else class="empty-state">
              <div class="empty-title">暂无场景核心指标</div>
              <div class="empty-sub">{{ emptyText }}</div>
            </div>
          </section>

          <section class="ov-card ov-chart-card">
            <div class="ov-card-head">
              <h3 class="ov-card-title">场景单量占比趋势 <svg class="i i-12"><use href="#i-info" /></svg></h3>
              <div class="tv-tools">
                <div class="tv-seg"><button class="on">订单占比</button><button @click="$emit('notify', '订单量维度（演示）')">订单量</button></div>
                <button class="btn btn-ghost" @click="$emit('notify', '已导出场景趋势（演示）')">导出</button>
              </div>
            </div>
            <div class="ms-chart-grid" v-if="charts.length">
              <div class="mk-subcard" v-for="c in charts" :key="c.title">
                <div class="an-sub-title">{{ c.title }}</div>
                <flow-chart :key="chartKey + '-' + c.title" :labels="c.labels" :bars="[]" :lines="c.series" :axes="{ left: { max: 100, fmt: 'pct' } }" :height="210" />
              </div>
            </div>
            <div v-else class="empty-state">
              <div class="empty-title">暂无场景占比趋势</div>
              <div class="empty-sub">{{ emptyText }}</div>
            </div>
          </section>

          <section class="ov-card">
            <div class="ov-card-head">
              <h3 class="ov-card-title">场景产品销量</h3>
              <div class="tv-seg">
                <button v-for="(l, i) in data.products.labels" :key="l" :class="{ on: prodTab === i }" @click="prodTab = i">{{ l }}</button>
              </div>
            </div>
            <div class="ms-prod-grid" v-if="productView">
              <div class="mk-subcard" v-if="productView.left.length">
                <div class="an-sub-title">{{ productView.leftTitle }} <span class="muted-text">{{ productView.leftTotal }}</span></div>
                <table class="tbl ms-prod-tbl">
                  <thead><tr><th>产品</th><th>销量占比</th><th>爆品价</th><th>销量</th></tr></thead>
                  <tbody>
                    <tr v-for="p in productView.left" :key="p.name">
                      <td class="cell-name">{{ p.name }}</td>
                      <td>
                        <div class="ms-share"><span class="ms-share-track"><i :style="{ width: p.width + '%' }"></i></span><em>{{ p.share }}</em></div>
                      </td>
                      <td>{{ p.price }}</td><td>{{ p.qty }}</td>
                    </tr>
                  </tbody>
                </table>
              </div>
              <div class="mk-subcard" v-if="productView.right.length">
                <div class="an-sub-title">{{ productView.rightTitle }} <span class="muted-text">{{ productView.rightTotal }}</span></div>
                <table class="tbl ms-prod-tbl">
                  <thead><tr><th>产品</th><th>销量占比</th><th>爆品价</th><th>销量</th></tr></thead>
                  <tbody>
                    <tr v-for="p in productView.right" :key="p.name">
                      <td class="cell-name">{{ p.name }}</td>
                      <td>
                        <div class="ms-share"><span class="ms-share-track"><i :style="{ width: p.width + '%' }"></i></span><em>{{ p.share }}</em></div>
                      </td>
                      <td>{{ p.price }}</td><td>{{ p.qty }}</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
            <div v-else class="empty-state">
              <div class="empty-title">暂无场景产品销量</div>
              <div class="empty-sub">{{ emptyText }}</div>
            </div>
          </section>

          <section class="ov-card">
            <div class="ov-card-head">
              <h3 class="ov-card-title">各场景商家实收率 / 理论毛利</h3>
              <button class="btn btn-ghost" @click="$emit('notify', '已导出场景实收数据（演示）')">导出</button>
            </div>
            <div class="ov-table-wrap an-scroll-260">
              <table class="tbl ms-wide-tbl">
                <thead>
                  <tr><th>平台</th><th>场景</th><th>订单数</th><th>订单原价（GMV）</th><th>商家实收</th><th>商家实收率</th><th>杯数（件）</th><th>杯均商家实收</th><th>活动补贴前金额（结算）</th><th>杯均活动补贴</th><th>理论毛利（成本已知商品）</th></tr>
                </thead>
                <tbody>
                  <tr v-for="r in sceneRows" :key="r.platform + r.scene">
                    <td><span class="mk-platform" :class="r.platform === '美团' ? 'mt' : 'ele'">{{ r.platform }}</span></td>
                    <td class="cell-name">{{ r.scene }}</td>
                    <td>{{ r.orders }}</td>
                    <td>{{ r.gmv }}</td>
                    <td>{{ r.income }}</td>
                    <td>{{ r.incomeRate }}</td>
                    <td>{{ r.cups }}</td>
                    <td>{{ r.avgIncome }}</td>
                    <td>{{ r.activitySub }}</td>
                    <td>{{ r.avgSub }}</td>
                    <td><b class="pm-profit">{{ r.profit }}</b></td>
                  </tr>
                  <tr v-if="!sceneRows.length"><td colspan="11" class="row-empty">{{ emptyText }}</td></tr>
                </tbody>
              </table>
            </div>
          </section>

          <section class="ov-card">
            <div class="ov-card-head">
              <h3 class="ov-card-title">各门店各场景支出明细</h3>
              <div class="tv-tools">
                <span class="muted-text">共 {{ sceneStoreRows.length }} 条 · 按门店排序</span>
                <button class="btn btn-ghost" @click="$emit('notify', '已导出门店场景明细（演示）')">导出</button>
              </div>
            </div>
            <div class="ov-table-wrap an-scroll-320">
              <table class="tbl ms-wide-tbl">
                <thead>
                  <tr>
                    <th>门店</th><th>TK</th><th>平台</th><th>场景</th><th>订单数</th><th>订单占比</th>
                    <th>商品销量</th><th>销量占比</th><th>商家实收率</th><th>单均毛利额（理论）</th><th>单均商家补贴支出</th>
                  </tr>
                </thead>
                <tbody>
                  <tr v-for="r in sceneStoreRows" :key="r.store + r.platform + r.scene">
                    <td class="cell-name">{{ r.store }}</td>
                    <td class="muted-text">{{ r.tk }}</td>
                    <td><span class="mk-platform" :class="r.platform === '美团' ? 'mt' : 'ele'">{{ r.platform }}</span></td>
                    <td>{{ r.scene }}</td>
                    <td>{{ r.orders }}</td>
                    <td>{{ r.orderShare }}</td>
                    <td>{{ r.qty }}</td>
                    <td>{{ r.qtyShare }}</td>
                    <td>{{ r.incomeRate }}</td>
                    <td>{{ r.avgIncome }}</td>
                    <td>{{ r.avgSub }}</td>
                  </tr>
                  <tr v-if="!sceneStoreRows.length"><td colspan="11" class="row-empty">{{ sceneStoreEmptyText }}</td></tr>
                </tbody>
              </table>
            </div>
          </section>
        </div>
      </div>
    `
  };
  /* ================= 营销台账记录 ================= */
})();
