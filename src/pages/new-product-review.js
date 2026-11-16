/* Page: new product review */
(function () {
  const { ref, computed, watch, onMounted, onUnmounted, reactive, nextTick } = Vue;

  window.NewProductReviewPage = {
    name: "NewProductReviewPage",
    components: {
      FlowChart: window.FlowChart,
      HBars: window.HBars,
      FunnelRows: window.FunnelRows
    },
    props: { data: Object },
    emits: ["notify"],
    setup(props, { emit }) {
      const quick = ref("近7天");
      const platform = ref(props.data.filters.platforms[0]);
      const store = ref(props.data.filters.stores[0]);
      const batchWindow = ref(props.data.current.window);
      const expanded = ref(true);
      const marketTab = ref("门店可比");
      const productA = ref(props.data.funnels[0].name);
      const productB = ref(props.data.funnels[1] ? props.data.funnels[1].name : "");

      const allPlatform = props.data.filters.platforms[0];
      const allStore = props.data.filters.stores[0];
      const num = (v) => Number(String(v).replace(/[^0-9.-]/g, "")) || 0;
      const fmtInt = (v) => Math.round(v).toLocaleString("en-US");

      const categoryOf = {
        "可可泰奶（冬季限定）": "可可系列",
        "手打柠檬茶": "泰式果茶",
        "香茅烤鸡翅": "泰式小吃",
        "芝士泰奶": "泰国红茶",
        "咸法酪泰奶（清爽版）": "泰国红茶",
        "甄选泰奶": "泰国红茶",
        "招牌泰式奶茶": "泰式奶茶",
        "椰香芒果糯米饭": "泰式甜品",
        "斑斓椰奶冻": "泰式甜品",
        "冬阴功海鲜面": "泰式主食"
      };
      const storeConf = {
        "安徽工学院店": { factor: 0.26, only: null, exclude: null },
        "深圳湾万象城店": { factor: 0.18, only: null, exclude: ["可可系列"] },
        "北京三里屯店": { factor: 0.12, only: ["泰国红茶", "泰式奶茶", "泰式果茶"], exclude: null }
      };
      const storeFactor = computed(() => {
        const c = storeConf[store.value];
        return c ? c.factor : 1;
      });
      const storeAllows = (name) => {
        const c = storeConf[store.value];
        const cat = categoryOf[name];
        if (!c || !cat) return true;
        if (c.only) return c.only.indexOf(cat) >= 0;
        if (c.exclude) return c.exclude.indexOf(cat) < 0;
        return true;
      };
      const platformAllows = (name) =>
        platform.value !== "饿了么" || name !== "可可泰奶（冬季限定）";

      const windowDates = computed(() => {
        const d = props.data.trend.dates;
        if (quick.value === "今日") return d.slice(-1);
        if (quick.value === "昨日") return d.slice(-2, -1);
        return d.slice();
      });
      const dayFactor = computed(() => windowDates.value.length / props.data.trend.dates.length);
      const dateRangeText = computed(() => {
        if (quick.value === "近30天") return "2026-11-01 至 2026-11-12";
        const d = windowDates.value;
        return "2026-" + d[0].a + " 至 2026-" + d[d.length - 1].a;
      });
      const platFactor = computed(() =>
        platform.value === "美团" ? 0.62 : platform.value === "饿了么" ? 0.38 : 1
      );
      const batchFactor = computed(() =>
        batchWindow.value === "T+14" ? 1.8 : batchWindow.value === "T+30" ? 3.2 : 1
      );
      const sampleSize = computed(() => (marketTab.value === "全部直营" ? 486 : 268));
      const sampleFactor = computed(() => (marketTab.value === "全部直营" ? 1.82 : 1));
      const isFiltered = computed(
        () =>
          quick.value !== "近7天" ||
          platform.value !== allPlatform ||
          store.value !== allStore ||
          batchWindow.value !== "T+7" ||
          marketTab.value !== "门店可比"
      );

      const ratio = computed(() => {
        const list = props.data.ratio.filter(
          (r) => platformAllows(r.name) && storeAllows(r.name)
        );
        const max = Math.max.apply(null, list.map((r) => r.width).concat([1]));
        return list.map((r) =>
          Object.assign({}, r, { width: Math.round((r.width / max) * 100) })
        );
      });
      const productNames = computed(() =>
        props.data.trend.series
          .filter((s) => platformAllows(s.name) && storeAllows(s.name))
          .map((s) => s.name)
      );
      const funnelNames = computed(() =>
        props.data.funnels
          .filter((f) => platformAllows(f.name) && storeAllows(f.name))
          .map((f) => f.name)
      );

      const trend = computed(() => {
        const start = props.data.trend.dates.length - windowDates.value.length;
        return {
          labels: windowDates.value,
          series: props.data.trend.series
            .filter((s) => platformAllows(s.name) && storeAllows(s.name))
            .map((s) => ({
              name: s.name,
              color: s.color,
              values: s.values
                .slice(start)
                .map((v) => Math.round(v * platFactor.value * storeFactor.value))
            })),
          share: props.data.trend.share.slice(start)
        };
      });
      const trendLines = computed(() =>
        trend.value.series
          .map((s) => ({ name: s.name, color: s.color, values: s.values, axis: "left", fmt: "num" }))
          .concat([
            {
              name: "新品销量占比",
              color: "#8a8f3c",
              values: trend.value.share,
              axis: "right",
              fmt: "pct"
            }
          ])
      );
      const trendEmpty = computed(() =>
        trend.value.series.length
          ? ""
          : "当前门店与平台条件下暂无新品销售趋势，请调整门店或平台筛选"
      );

      const scaleVal = (s, k) => {
        if (String(s).indexOf("%") >= 0) return s;
        const prefix = String(s).indexOf("¥") === 0 ? "¥" : "";
        return prefix + (num(s) * k).toFixed(2) + " 万";
      };
      const marketScale = computed(
        () =>
          dayFactor.value *
          platFactor.value *
          storeFactor.value *
          batchFactor.value *
          sampleFactor.value
      );
      const marketRows = computed(() =>
        props.data.market.rows.map((m) =>
          Object.assign({}, m, {
            now: scaleVal(m.now, marketScale.value),
            before: scaleVal(m.before, marketScale.value)
          })
        )
      );

      const scaleStages = (fn) =>
        fn
          ? fn.stages.map((s) =>
              Object.assign({}, s, {
                value: fmtInt(num(s.value) * dayFactor.value * platFactor.value * storeFactor.value * batchFactor.value)
              })
            )
          : [];
      const funnelOf = (name) => props.data.funnels.find((f) => f.name === name);
      const stagesA = computed(() => scaleStages(funnelOf(productA.value)));
      const stagesB = computed(() => scaleStages(funnelOf(productB.value)));
      watch(funnelNames, (names) => {
        if (!names.length) return;
        if (names.indexOf(productA.value) < 0) productA.value = names[0];
        if (names.indexOf(productB.value) < 0 || productB.value === productA.value) {
          const other = names.filter((n) => n !== productA.value)[0];
          productB.value = other || "";
        }
      });

      const funnelNote = computed(() => {
        if (!isFiltered.value) return props.data.funnelNote;
        const list = trend.value.series;
        if (!list.length) return "当前筛选条件下暂无新品销量数据";
        const sums = list
          .map((s) => ({ name: s.name, total: s.values.reduce((a, b) => a + b, 0) }))
          .sort((a, b) => b.total - a.total);
        return "当前筛选下趋势累计销量最高：" + sums[0].name + "，共 " + fmtInt(sums[0].total) + " 件。";
      });

      const historyRows = computed(() => {
        if (quick.value === "今日" || quick.value === "昨日") return [];
        return props.data.history.filter((b) =>
          b.tags.some((t) => platformAllows(t) && storeAllows(t))
        );
      });
      const historyEmpty = computed(() => {
        if (historyRows.value.length) return "";
        return quick.value === "今日" || quick.value === "昨日"
          ? "所选日期范围内暂无历史批次，请切换到近7天或近30天"
          : "没有符合当前门店或平台条件的历史批次，请调整门店或平台筛选";
      });

      const currentTags = computed(() =>
        props.data.current.tags.filter((t) => platformAllows(t) && storeAllows(t))
      );
      const currentCount = computed(() => productNames.value.length);
      const moreText = computed(() => {
        const extra = currentCount.value - currentTags.value.length;
        return extra > 0 ? "+" + extra + " 款" : "";
      });
      const summary = computed(() => {
        if (!isFiltered.value) return props.data.current.summary;
        const sum = ratio.value.reduce((s, r) => s + num(r.count), 0);
        return "新品已记录销量占比 " + sum.toFixed(2) + "%，上架前同期门店实收较上线前 ▼1.79%。";
      });
      const currentRange = computed(() =>
        quick.value === "近7天" ? props.data.current.range : dateRangeText.value
      );

      const toggle = () => {
        expanded.value = !expanded.value;
      };
      const query = () =>
        emit(
          "notify",
          "已按当前条件刷新：" +
            quick.value +
            " · " +
            platform.value +
            " · " +
            store.value +
            (trendEmpty.value ? "（无结果）" : " · " + productNames.value.length + " 款新品")
        );
      const reset = () => {
        quick.value = "近7天";
        platform.value = allPlatform;
        store.value = allStore;
        batchWindow.value = "T+7";
        marketTab.value = "门店可比";
        productA.value = props.data.funnels[0].name;
        productB.value = props.data.funnels[1] ? props.data.funnels[1].name : "";
        emit("notify", "筛选条件已重置");
      };

      return {
        quick,
        platform,
        store,
        batchWindow,
        expanded,
        marketTab,
        productA,
        productB,
        productNames,
        funnelNames,
        ratio,
        trend,
        trendLines,
        trendEmpty,
        dateRangeText,
        currentRange,
        marketRows,
        sampleSize,
        funnelNote,
        stagesA,
        stagesB,
        historyRows,
        historyEmpty,
        currentTags,
        currentCount,
        moreText,
        summary,
        toggle,
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
          <button class="btn btn-primary" @click="query">查询</button>
          <button class="btn btn-ghost" @click="reset">重置</button>
          <span class="toolbar-spacer"></span>
          <span class="muted-text">全渠道 · 自动更新</span>
        </div>

        <div class="ov-scroll">
          <section class="ov-card">
            <div class="np-batch-head">
              <div class="np-batch-date">
                <b>{{ data.current.date }}</b>
                <span>{{ data.current.year }}</span>
              </div>
              <div class="np-batch-main">
                <div class="np-batch-title">
                  <span class="np-brand">{{ data.current.brand }}</span>
                  <b>{{ currentCount }} 款新品</b>
                  <span class="np-tag" v-for="t in currentTags" :key="t">{{ t }}</span>
                  <span class="np-tag more" v-if="moreText">{{ moreText }}</span>
                </div>
                <div class="np-batch-summary">{{ summary }}</div>
              </div>
              <div class="np-batch-actions">
                <select class="f-select w90" v-model="batchWindow"><option>T+7</option><option>T+14</option><option>T+30</option></select>
                <span class="np-badge">{{ data.current.status }}</span>
                <button class="btn btn-ghost" @click="toggle">{{ expanded ? '收起复盘' : '展开复盘' }}</button>
              </div>
            </div>
            <div class="an-note">{{ currentRange }} · 品牌「{{ data.current.brand }}」</div>

            <div class="np-grid" v-show="expanded">
              <div class="np-panel">
                <div class="an-sub-title">已记录销量占比（部分商品平台销量待关联）</div>
                <h-bars v-if="ratio.length" :key="'np-ratio-' + platform + '-' + store + '-' + ratio.map(r => r.name + r.count).join('|')" :items="ratio" :label-width="96" />
                <div v-else class="empty-state">
                  <div class="empty-title">当前门店与平台条件下暂无新品销量占比数据</div>
                </div>
              </div>
              <div class="np-panel">
                <div class="np-market-head">
                  <div class="an-sub-title">同期外卖大盘</div>
                  <div class="tv-seg">
                    <button v-for="t in ['门店可比', '全部直营']" :key="t" :class="{ on: marketTab === t }" @click="marketTab = t">{{ t }}</button>
                  </div>
                </div>
                <div class="tv-foot-note">{{ data.market.beforeRange }} · 样本门店 {{ sampleSize }} 家</div>
                <table class="tbl np-market-tbl">
                  <thead><tr><th>指标</th><th>观察期</th><th>上线前</th><th>环比</th></tr></thead>
                  <tbody>
                    <tr v-for="m in marketRows" :key="m.label">
                      <td>{{ m.label }}</td>
                      <td>{{ m.now }}</td>
                      <td class="muted-text">{{ m.before }}</td>
                      <td :class="m.dir === 'up' ? 'ov-up' : 'ov-down'">{{ m.dir === 'up' ? '▲' : '▼' }} {{ m.delta }}</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          </section>

          <section class="ov-card ov-chart-card">
            <div class="ov-card-head">
              <h3 class="ov-card-title">新品销售趋势 <svg class="i i-12"><use href="#i-info" /></svg></h3>
              <div class="tv-tools">
                <span class="muted-text">左轴：销量（杯） · 右轴：新品销量占比（%）</span>
                <button class="btn btn-ghost" @click="$emit('notify', '已导出新品销售趋势（演示）')">导出</button>
              </div>
            </div>
            <div v-if="trendEmpty" class="empty-state">
              <div class="empty-title">{{ trendEmpty }}</div>
              <div class="empty-sub">趋势图基于当前日期、门店与平台条件重算</div>
            </div>
            <flow-chart
              v-else
              :key="'np-trend-' + quick + '-' + platform + '-' + store + '-' + trend.labels.length + '-' + trend.series.length + '-' + (trend.series[0] ? trend.series[0].values.join('_') : '')"
              :labels="trend.labels"
              :bars="[]"
              :lines="trendLines"
              :axes="{ left: { max: 600, fmt: 'num' }, right: { max: 10, fmt: 'pct' } }"
              :height="250" />
          </section>

          <section class="ov-card">
            <div class="ov-card-head">
              <h3 class="ov-card-title">新品转化漏斗</h3>
              <div class="tv-tools">
                <span class="muted-text">商品 A</span>
                <select class="f-select w190" v-model="productA">
                  <option v-for="n in funnelNames" :key="n" :value="n">{{ n }}</option>
                </select>
                <span class="muted-text">对比商品 B</span>
                <select class="f-select w190" v-model="productB">
                  <option value="">— 未选择 —</option>
                  <option v-for="n in funnelNames" :key="'b' + n" :value="n">{{ n }}</option>
                </select>
                <button class="btn btn-ghost" @click="$emit('notify', '已导出新品转化漏斗（演示）')">导出</button>
              </div>
            </div>
            <div v-if="!funnelNames.length" class="empty-state">
              <div class="empty-title">{{ trendEmpty }}</div>
              <div class="empty-sub">漏斗按当前筛选后的新品集合重算</div>
            </div>
            <div v-else class="pc-funnel-grid">
              <div class="pc-funnel-panel">
                <div class="pc-funnel-title">{{ productA || '未选择商品' }}</div>
                <funnel-rows :stages="stagesA" />
              </div>
              <div class="pc-funnel-panel">
                <div class="pc-funnel-title">{{ productB || '对比商品 B' }}</div>
                <funnel-rows v-if="productB" :stages="stagesB" />
                <div v-else class="pc-funnel-empty">未选择对比商品</div>
              </div>
            </div>
            <div class="tv-foot-note">{{ funnelNote }}</div>
          </section>

          <section class="ov-card">
            <div class="ov-card-head">
              <h3 class="ov-card-title">历史新品批次</h3>
              <span class="muted-text">按批次上线日期排序</span>
            </div>
            <div v-if="historyEmpty" class="empty-state">
              <div class="empty-title">{{ historyEmpty }}</div>
              <div class="empty-sub">历史批次按上线日期、门店可售品类与平台可售商品过滤</div>
            </div>
            <div v-else class="np-history">
              <div class="np-history-row" v-for="b in historyRows" :key="b.date + b.year">
                <div class="np-batch-date">
                  <b>{{ b.date }}</b>
                  <span>{{ b.year }}</span>
                </div>
                <div class="np-history-main">
                  <div class="np-batch-title">
                    <span class="np-brand">{{ b.brand }}</span>
                    <b>{{ b.count }} 款新品</b>
                    <span class="np-tag" v-for="t in b.tags" :key="t">{{ t }}</span>
                  </div>
                  <div class="np-batch-summary">{{ b.summary }}</div>
                  <div class="np-history-range">{{ b.range }}</div>
                </div>
                <div class="np-history-actions">
                  <span class="np-badge done">{{ b.status }}</span>
                  <button class="btn btn-ghost" @click="$emit('notify', '查看 ' + b.date + ' 批次报告（演示）')">查看报告</button>
                </div>
              </div>
            </div>
          </section>
        </div>
      </div>
    `
  };

  /* ================= 营销支出分析 ================= */
})();
