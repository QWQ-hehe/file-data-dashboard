/* Page: promotion analysis */
(function () {
  const { ref, computed, watch, onMounted, onUnmounted, reactive, nextTick } = Vue;

  window.PromotionAnalysisPage = {
    name: "PromotionAnalysisPage",
    components: { FlowChart: window.FlowChart, ScatterChart: window.ScatterChart },
    props: { data: Object },
    emits: ["notify"],
    setup(props, { emit }) {
      const platform = ref(props.data.filters.platforms[0]);
      const store = ref(props.data.filters.stores[0]);
      const range = ref("日");
      const scatterPlatform = ref("meituan");
      const keyword = ref("");
      const productTab = ref("美团");
      const metricOpen = ref(false);

      const allPlatform = props.data.filters.platforms[0];
      const allStore = props.data.filters.stores[0];
      const num = (v) => Number(String(v).replace(/[^0-9.-]/g, "")) || 0;
      const fmtInt = (v) => Math.round(v).toLocaleString("en-US");
      const fmtMoney = (v, d) =>
        "¥" + v.toLocaleString("en-US", { minimumFractionDigits: d || 0, maximumFractionDigits: d || 0 });
      const fmtPct = (v, d) => v.toFixed(d == null ? 1 : d) + "%";
      const kpiBy = (label) => props.data.kpis.find((k) => k.label === label) || {};
      const base = {
        spend: num(kpiBy("推广花费").value),
        gmv: num(kpiBy("推广营业额").value),
        roi: num(kpiBy("ROI").value),
        orders: num(kpiBy("推广订单数").value),
        daily: num(kpiBy("日均推广费").value),
        costRate: num(kpiBy("推广成本率").value),
        exposure: num(kpiBy("推广曝光提升数").value),
        expShare: num(kpiBy("推广曝光占比").value)
      };

      const totals = (list) =>
        list.reduce(
          (o, r) => {
            const spend = num(r.spend);
            o.spend += spend;
            o.gmv += spend * num(r.roi);
            o.orders += num(r.orders);
            o.exposure += num(r.exposure);
            return o;
          },
          { spend: 0, gmv: 0, orders: 0, exposure: 0 }
        );
      const allTotals = totals(props.data.storeRows);

      const metricDefs = [
        { key: "spend", label: "推广花费（元）" },
        { key: "roi", label: "ROI" },
        { key: "costRate", label: "推广成本率" },
        { key: "orders", label: "推广订单数" },
        { key: "exposure", label: "推广曝光" }
      ];
      const visible = ref({ spend: true, roi: true, costRate: true, orders: true, exposure: true });
      const visibleMetrics = computed(() => metricDefs.filter((m) => visible.value[m.key]));
      const visibleCount = computed(() => visibleMetrics.value.length);
      const toggleMetric = (key) => {
        visible.value = Object.assign({}, visible.value, { [key]: !visible.value[key] });
      };

      const matched = (r, k) => !k || r.name.toLowerCase().includes(k) || r.tk.toLowerCase().includes(k);

      const filteredStoreRows = computed(() => {
        const k = keyword.value.trim().toLowerCase();
        return props.data.storeRows.filter((r) => {
          if (platform.value !== allPlatform && r.platform !== platform.value) return false;
          if (store.value !== allStore && r.name !== store.value) return false;
          return matched(r, k);
        });
      });

      /* 门店/关键词维度（不含平台），供产品表与散点按份额折算 */
      const contextRows = computed(() => {
        const k = keyword.value.trim().toLowerCase();
        return props.data.storeRows.filter((r) => {
          if (store.value !== allStore && r.name !== store.value) return false;
          return matched(r, k);
        });
      });
      const contextSpendShare = computed(() =>
        allTotals.spend ? totals(contextRows.value).spend / allTotals.spend : 0
      );

      const fTotals = computed(() => totals(filteredStoreRows.value));
      const shares = computed(() => ({
        spend: allTotals.spend ? fTotals.value.spend / allTotals.spend : 0,
        gmv: allTotals.gmv ? fTotals.value.gmv / allTotals.gmv : 0,
        orders: allTotals.orders ? fTotals.value.orders / allTotals.orders : 0,
        exposure: allTotals.exposure ? fTotals.value.exposure / allTotals.exposure : 0
      }));

      const emptyText = computed(() =>
        filteredStoreRows.value.length
          ? ""
          : "没有符合当前筛选条件的门店推广数据，请调整平台、门店或搜索关键词"
      );
      const adjusted = computed(
        () => platform.value !== allPlatform || store.value !== allStore || keyword.value.trim() !== ""
      );

      const kpis = computed(() => {
        if (emptyText.value) return [];
        const s = shares.value;
        const roi = s.spend ? base.roi * (s.gmv / s.spend) : 0;
        const costRate = s.gmv ? base.costRate * (s.spend / s.gmv) : 0;
        const list = [
          { label: "推广花费", value: fmtMoney(base.spend * s.spend, 1) },
          { label: "推广营业额", value: fmtMoney(base.gmv * s.gmv, 1) },
          { label: "ROI", value: roi.toFixed(1) },
          { label: "推广订单数", value: fmtInt(base.orders * s.orders) },
          { label: "日均推广费", value: fmtMoney(base.daily * s.spend, 1) },
          { label: "推广成本率", value: fmtPct(costRate) },
          { label: "推广曝光提升数", value: fmtInt(base.exposure * s.exposure) },
          { label: "推广曝光占比", value: fmtPct(base.expShare * s.exposure) }
        ];
        return list.map((k) => {
          const b = kpiBy(k.label);
          return Object.assign(
            { delta: b.delta, diff: b.diff, dir: b.dir },
            k,
            adjusted.value ? { delta: "", diff: "筛选后不提供环比" } : {}
          );
        });
      });

      /* 日 / 周 / 月分桶 */
      const buckets = (labels, mode) => {
        const out = [];
        if (mode === "日") {
          labels.forEach((l, i) => out.push({ label: l, idxs: [i] }));
          return out;
        }
        if (mode === "周") {
          for (let i = 0; i < labels.length; i += 7) {
            const end = Math.min(i + 7, labels.length);
            const idxs = [];
            for (let j = i; j < end; j++) idxs.push(j);
            out.push({ label: labels[i] + "~" + labels[end - 1], idxs: idxs });
          }
          return out;
        }
        let start = 0;
        for (let i = 1; i <= labels.length; i++) {
          if (i === labels.length || labels[i].slice(0, 2) !== labels[start].slice(0, 2)) {
            const idxs = [];
            for (let j = start; j < i; j++) idxs.push(j);
            out.push({ label: labels[start].slice(0, 2) + "月", idxs: idxs });
            start = i;
          }
        }
        return out;
      };

      const trendData = computed(() => {
        if (emptyText.value) return null;
        const t = props.data.trend;
        const s = shares.value;
        const overall = t.overall.map((v) => v * s.exposure);
        const promo = t.promo.map((v) => v * s.exposure);
        const spend = t.spend.map((v) => v * s.spend);
        const bs = buckets(t.labels, range.value);
        return {
          labels: bs.map((b) => b.label),
          overall: bs.map((b) => Math.round(b.idxs.reduce((a, i) => a + overall[i], 0))),
          promo: bs.map((b) => Math.round(b.idxs.reduce((a, i) => a + promo[i], 0))),
          spend: bs.map((b) => Math.round(b.idxs.reduce((a, i) => a + spend[i], 0) * 100) / 100)
        };
      });

      const roiData = computed(() => {
        if (emptyText.value) return null;
        const t = props.data.roiTrend;
        const s = shares.value;
        const spend = t.spend.map((v) => v * s.spend);
        const roi = t.roi.map((v) => v * (s.spend ? s.gmv / s.spend : 1));
        const cost = t.costRate.map((v) => v * (s.gmv ? s.spend / s.gmv : 1));
        const bs = buckets(props.data.trend.labels, range.value);
        return {
          labels: bs.map((b) => b.label),
          spend: bs.map((b) => Math.round(b.idxs.reduce((a, i) => a + spend[i], 0))),
          roi: bs.map((b) => {
            const sp = b.idxs.reduce((a, i) => a + spend[i], 0);
            return sp ? Math.round((b.idxs.reduce((a, i) => a + spend[i] * roi[i], 0) / sp) * 10) / 10 : 0;
          }),
          costRate: bs.map((b) => {
            const sp = b.idxs.reduce((a, i) => a + spend[i], 0);
            return sp ? Math.round((b.idxs.reduce((a, i) => a + spend[i] * cost[i], 0) / sp) * 10) / 10 : 0;
          })
        };
      });

      const platformOfStore = computed(() => {
        if (store.value === allStore) return null;
        return props.data.storeRows.filter((r) => r.name === store.value).map((r) => r.platform);
      });

      const productEmpty = computed(() => {
        if (emptyText.value) return emptyText.value;
        if (platform.value !== allPlatform && platform.value !== productTab.value) {
          return "平台筛选为「" + platform.value + "」，与产品端口「" + productTab.value + "」不一致，暂无产品数据";
        }
        if (platformOfStore.value && platformOfStore.value.indexOf(productTab.value) < 0) {
          return "该门店在「" + productTab.value + "」暂无推广产品记录，请切换端口或重置";
        }
        return "";
      });

      const productRows = computed(() => {
        if (productEmpty.value) return [];
        const factor = (productTab.value === "美团" ? 1 : 0.613) * (contextSpendShare.value || 0);
        if (!factor) return [];
        return props.data.products.map((p) => {
          const spend = num(p.spend) * factor;
          const gmv = num(p.gmv) * factor;
          const exposure = num(p.exposure) * factor;
          const orders = num(p.orders) * factor;
          return {
            name: p.name,
            target: p.target,
            enter: p.enter,
            order: p.order,
            cost: p.cost,
            roi: p.roi,
            spend: p.spend === "—" ? "—" : fmtMoney(spend),
            exposure: p.exposure === "—" ? "—" : fmtInt(exposure),
            orders: fmtInt(orders),
            gmv: fmtMoney(gmv)
          };
        });
      });

      const scatterLabel = computed(() => (scatterPlatform.value === "meituan" ? "美团" : "饿了么"));
      const scatterEmpty = computed(() => {
        if (emptyText.value) return emptyText.value;
        if (platform.value !== allPlatform && platform.value !== scatterLabel.value) {
          return "平台筛选为「" + platform.value + "」，与散点端口「" + scatterLabel.value + "」不一致，暂无散点数据";
        }
        if (platformOfStore.value && platformOfStore.value.indexOf(scatterLabel.value) < 0) {
          return "该门店在「" + scatterLabel.value + "」暂无推广数据，请切换散点端口";
        }
        return "";
      });
      const scatterPoints = computed(() => {
        if (scatterEmpty.value) return [];
        const source = scatterPlatform.value === "meituan" ? props.data.scatter.meituan : props.data.scatter.eleme;
        const f = contextSpendShare.value || 0;
        return source.map((p) => ({ x: Math.max(1, Math.round(p.x * f)), y: Math.max(1, Math.round(p.y * f)) }));
      });

      const provinceOf = (name) => {
        if (name.indexOf("广州") >= 0 || name.indexOf("深圳") >= 0) return "广东";
        if (name.indexOf("上海") >= 0) return "上海";
        if (name.indexOf("北京") >= 0) return "北京";
        if (name.indexOf("青岛") >= 0) return "山东";
        if (name.indexOf("无锡") >= 0 || name.indexOf("常州") >= 0) return "江苏";
        if (name.indexOf("杭州") >= 0 || name.indexOf("宁波") >= 0) return "浙江";
        if (name.indexOf("江西") >= 0) return "江西";
        return "";
      };
      const activeProvinces = computed(() => {
        const cols = props.data.roiGrid.columns;
        if (store.value !== allStore) {
          const p = provinceOf(store.value);
          return p && cols.indexOf(p) >= 0 ? [p] : [];
        }
        const k = keyword.value.trim().toLowerCase();
        if (!k) return cols;
        const hit = {};
        props.data.storeRows.forEach((r) => {
          if (!matched(r, k)) return;
          const p = provinceOf(r.name);
          if (p && cols.indexOf(p) >= 0) hit[p] = true;
        });
        return cols.filter((c) => hit[c]);
      });
      const roiEmpty = computed(() => {
        if (emptyText.value) return emptyText.value;
        if (!activeProvinces.value.length) return "该门店所在省份不在 ROI 网格的省份范围内，暂无数据";
        return "";
      });
      const roiRows = computed(() => {
        if (roiEmpty.value) return [];
        const idxs = activeProvinces.value.map((p) => props.data.roiGrid.columns.indexOf(p));
        const factor = (platform.value === "饿了么" ? 0.613 : 1) * (contextSpendShare.value || 0);
        return props.data.roiGrid.rows.map((row) => ({
          name: row.name,
          cells: idxs.map((i) => ({ roi: row.cells[i].roi, spend: Math.round(row.cells[i].spend * factor) }))
        }));
      });

      const reset = () => {
        platform.value = allPlatform;
        store.value = allStore;
        keyword.value = "";
        range.value = "日";
        scatterPlatform.value = "meituan";
        productTab.value = "美团";
        visible.value = { spend: true, roi: true, costRate: true, orders: true, exposure: true };
        metricOpen.value = false;
        emit("notify", "筛选条件已重置");
      };
      const query = () => {
        emit("notify", "已按当前条件筛选：" + filteredStoreRows.value.length + " 家门店 · " + productRows.value.length + " 个推广产品");
      };

      return {
        platform, store, range, scatterPlatform, keyword, productTab, metricOpen,
        metricDefs, visible, visibleMetrics, visibleCount, toggleMetric,
        storeRows: filteredStoreRows, emptyText, kpis, trendData, roiData,
        scatterPoints, scatterEmpty, productRows, productEmpty,
        activeProvinces, roiRows, roiEmpty, contextShare: contextSpendShare, reset, query,
        fmtInt, fmtMoney, fmtPct
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
          <span class="ov-filter-label">平台</span>
          <div class="tv-seg">
            <button v-for="p in data.filters.platforms" :key="p" :class="{ on: platform === p }" @click="platform = p">{{ p }}</button>
          </div>
          <span class="ov-filter-label">日期</span>
          <span class="ov-date">{{ data.filters.dateStart }} 至 {{ data.filters.dateEnd }}</span>
          <select class="f-select w150" v-model="store">
            <option v-for="o in data.filters.stores" :key="o">{{ o }}</option>
          </select>
          <button class="btn btn-primary" @click="query">查询</button>
          <button class="btn btn-ghost" @click="reset">重置</button>
          <span class="toolbar-spacer"></span>
          <span class="muted-text">{{ platform }} · {{ store }}{{ keyword ? ' · 搜索：' + keyword : '' }} · 近 30 日</span>
        </div>

        <div class="ov-scroll">
          <section class="ov-card">
            <div class="ov-card-head">
              <h3 class="ov-card-title">推广概况</h3>
              <span class="muted-text">{{ platform }} · {{ store }} · 门店合计</span>
            </div>
            <div v-if="emptyText" class="empty-state">
              <div class="empty-title">{{ emptyText }}</div>
              <div class="empty-sub">调整平台、门店或搜索关键词，或点击「重置」恢复全部数据</div>
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
              <div class="tv-title-group">
                <h3 class="ov-card-title">推广花费与整体曝光</h3>
                <span class="muted-text">近 30 日</span>
              </div>
              <div class="tv-tools">
                <div class="tv-seg">
                  <button v-for="r in ['日', '周', '月']" :key="r" :class="{ on: range === r }" @click="range = r">{{ r }}</button>
                </div>
                <button class="btn btn-ghost" @click="$emit('notify', '已导出推广趋势（演示）')">导出</button>
              </div>
            </div>
            <div v-if="emptyText" class="empty-state">
              <div class="empty-title">{{ emptyText }}</div>
              <div class="empty-sub">趋势图、散点图与产品表均基于当前筛选结果重算</div>
            </div>
            <template v-else>
              <flow-chart
                :key="'ptrend-' + range + '-' + trendData.labels.join('|') + '-' + trendData.overall.join('|') + '-' + trendData.spend.join('|')"
                :labels="trendData.labels"
                :label-every="range === '日' ? 3 : 1"
                :bars="[
                  { name: '整体曝光', color: '#7f9f86', values: trendData.overall },
                  { name: '推广曝光', color: '#c9a06b', values: trendData.promo }
                ]"
                :lines="[{ name: '推广花费', color: '#4f6fae', values: trendData.spend, axis: 'right', fmt: 'wan' }]"
                :axes="{ left: { fmt: 'wan' }, right: { fmt: 'wan' } }"
                :height="250" />
              <div class="tv-foot-note">已按当前平台/门店的曝光与花费份额折算 · {{ range }}维度</div>
            </template>
          </section>

          <section class="ov-card ov-chart-card">
            <div class="ov-card-head">
              <div class="tv-title-group">
                <h3 class="ov-card-title">投放效率趋势</h3>
                <span class="muted-text">近 30 日 · ROI / 成本率</span>
              </div>
              <button class="btn btn-ghost" @click="$emit('notify', '已导出投放效率趋势（演示）')">导出</button>
            </div>
            <div v-if="emptyText" class="empty-state">
              <div class="empty-title">{{ emptyText }}</div>
              <div class="empty-sub">ROI 与成本率按筛选后的花费/流水比例重算</div>
            </div>
            <template v-else>
              <flow-chart
                :key="'proi-' + range + '-' + roiData.labels.join('|') + '-' + roiData.spend.join('|') + '-' + roiData.roi.join('|')"
                :labels="roiData.labels"
                :label-every="range === '日' ? 2 : 1"
                :bars="[{ name: '已消耗推广费', color: '#7c8fc4', values: roiData.spend }]"
                :lines="[
                  { name: 'ROI', color: '#6f9b78', values: roiData.roi, axis: 'right', fmt: 'num' },
                  { name: '成本率', color: '#c98a4b', values: roiData.costRate, axis: 'far', fmt: 'pct' }
                ]"
                :axes="{ left: { fmt: 'money' }, right: { fmt: 'num' }, far: { fmt: 'pct' } }"
                :height="250" />
              <div class="tv-foot-note">筛选后：花费按门店花费占比折算，ROI / 成本率按筛选后的流水与花费比例重算</div>
            </template>
          </section>

          <section class="ov-card ov-chart-card">
            <div class="ov-card-head">
              <h3 class="ov-card-title">{{ data.scatter.title }}</h3>
              <div class="tv-seg">
                <button :class="{ on: scatterPlatform === 'meituan' }" @click="scatterPlatform = 'meituan'">美团</button>
                <button :class="{ on: scatterPlatform === 'eleme' }" @click="scatterPlatform = 'eleme'">饿了么</button>
              </div>
            </div>
            <div v-if="scatterEmpty" class="empty-state">
              <div class="empty-title">{{ scatterEmpty }}</div>
              <div class="empty-sub">切换散点端口或重置筛选后可查看散点分布</div>
            </div>
            <scatter-chart
              v-else
              :key="'pscat-' + scatterPlatform + '-' + scatterPoints.length + '-' + contextShare.toFixed(4) + '-' + (scatterPoints[0] ? scatterPoints[0].x : 0)"
              :points="scatterPoints"
              :median-x="0"
              :median-y="0"
              :show-quadrants="false"
              :x-label="data.scatter.axisX"
              :y-label="data.scatter.axisY"
              :height="250" />
            <div class="tv-foot-note" v-if="!scatterEmpty">当前 {{ scatterPoints.length }} 个散点 · 花费/流水已按门店份额折算</div>
          </section>

          <section class="ov-card">
            <div class="ov-card-head">
              <h3 class="ov-card-title">推广产品表现（{{ productTab }}端口）</h3>
              <div class="tv-seg">
                <button :class="{ on: productTab === '美团' }" @click="productTab = '美团'">美团</button>
                <button :class="{ on: productTab === '饿了么' }" @click="productTab = '饿了么'">饿了么</button>
              </div>
            </div>
            <div class="ov-table-wrap">
              <table class="tbl tv-product-tbl">
                <thead>
                  <tr>
                    <th>推广产品</th><th>投放标的</th><th>推广消费</th><th>推广曝光数</th><th>进店率</th>
                    <th>下单率</th><th>订单量</th><th>推广提升GMV</th><th>单次进店成本</th><th>ROI</th>
                  </tr>
                </thead>
                <tbody>
                  <tr v-for="p in productRows" :key="p.name">
                    <td class="cell-name">{{ p.name }}</td>
                    <td>{{ p.target }}</td>
                    <td>{{ p.spend }}</td>
                    <td>{{ p.exposure }}</td>
                    <td>{{ p.enter }}</td>
                    <td>{{ p.order }}</td>
                    <td>{{ p.orders }}</td>
                    <td>{{ p.gmv }}</td>
                    <td>{{ p.cost }}</td>
                    <td class="tv-roi-text">{{ p.roi }}</td>
                  </tr>
                  <tr v-if="productEmpty"><td colspan="10" class="row-empty">{{ productEmpty }}</td></tr>
                </tbody>
              </table>
            </div>
            <div class="panel-foot"><span>共 {{ productRows.length }} 个推广产品 · {{ productTab }}端口</span><span class="foot-note">{{ productEmpty || '花费/曝光/订单/流水按门店份额折算' }}</span></div>
          </section>

          <section class="ov-card">
            <div class="ov-card-head">
              <h3 class="ov-card-title">客创阶段推广 ROI</h3>
              <span class="tv-roi-legend">
                <i class="roi-bg-low"></i>红色 &lt; 5
                <i class="roi-bg-mid"></i>黄色 5~9
                <i class="roi-bg-high"></i>绿色 &gt; 9
              </span>
            </div>
            <div class="ov-table-wrap">
              <table class="tbl tv-roi-grid">
                <thead>
                  <tr>
                    <th class="tv-roi-name">推广工具</th>
                    <th v-for="c in activeProvinces" :key="c">{{ c }}</th>
                  </tr>
                </thead>
                <tbody>
                  <tr v-for="row in roiRows" :key="row.name">
                    <td class="cell-name tv-roi-name">{{ row.name }}</td>
                    <td v-for="(c, i) in row.cells" :key="i">
                      <div class="roi-cell" :class="c.roi < 5 ? 'roi-bg-low' : c.roi <= 9 ? 'roi-bg-mid' : 'roi-bg-high'">
                        <b>{{ c.roi }}</b>
                        <span>¥{{ c.spend }}</span>
                      </div>
                    </td>
                  </tr>
                  <tr v-if="roiEmpty"><td :colspan="activeProvinces.length + 1" class="row-empty">{{ roiEmpty }}</td></tr>
                </tbody>
              </table>
            </div>
            <div class="panel-foot">
              <span>省份：{{ activeProvinces.length ? activeProvinces.join('、') : '无' }}</span>
              <span class="foot-note">{{ roiEmpty || '按门店所在省份筛选 · 花费按平台/门店份额折算' }}</span>
            </div>
          </section>

          <section class="ov-card">
            <div class="ov-card-head">
              <h3 class="ov-card-title">门店推广明细</h3>
              <div class="ov-rank-tools">
                <input class="f-input w160" v-model="keyword" placeholder="搜索门店名 / TK码" />
                <div class="tv-metric-wrap">
                  <button class="btn btn-ghost" @click="metricOpen = !metricOpen">指标选择（{{ visibleCount }}）</button>
                  <div v-if="metricOpen" class="tv-metric-panel">
                    <label v-for="m in metricDefs" :key="m.key">
                      <input type="checkbox" :checked="visible[m.key]" @change="toggleMetric(m.key)" />
                      <span>{{ m.label }}</span>
                    </label>
                  </div>
                </div>
                <button class="btn btn-primary" @click="$emit('notify', '已导出门店推广明细（演示）')">下载明细（Excel）</button>
              </div>
            </div>
            <div class="ov-table-wrap">
              <table class="tbl tv-store-tbl">
                <thead>
                  <tr>
                    <th>门店</th><th>TK码</th><th>平台</th>
                    <th v-for="m in visibleMetrics" :key="m.key">{{ m.label }}</th>
                  </tr>
                </thead>
                <tbody>
                  <template v-if="visibleCount">
                    <tr v-for="s in storeRows" :key="s.tk">
                      <td class="cell-name">{{ s.name }}</td>
                      <td>{{ s.tk }}</td>
                      <td><span class="tv-platform" :class="s.platform === '美团' ? 'mt' : 'ele'">{{ s.platform }}</span></td>
                      <td v-if="visible.spend">{{ s.spend }}</td>
                      <td v-if="visible.roi" class="tv-roi-text">{{ s.roi }}</td>
                      <td v-if="visible.costRate">{{ s.costRate }}</td>
                      <td v-if="visible.orders">{{ s.orders }}</td>
                      <td v-if="visible.exposure">{{ s.exposure }}</td>
                    </tr>
                  </template>
                  <tr v-if="!storeRows.length || !visibleCount">
                    <td :colspan="visibleCount + 3" class="row-empty">{{ emptyText || '请至少选择一项指标后查看门店明细' }}</td>
                  </tr>
                </tbody>
              </table>
            </div>
            <div class="panel-foot"><span>共 {{ storeRows.length }} 家门店</span><span class="foot-note">{{ emptyText || '数据周期：' + data.filters.dateStart + ' 至 ' + data.filters.dateEnd + '（演示数据）' }}</span></div>
          </section>
        </div>
      </div>
    `
  };
})();
