/* Page: product conversion */
(function () {
  const { ref, computed, watch, onMounted, onUnmounted, reactive, nextTick } = Vue;

  window.ProductConversionPage = {
    name: "ProductConversionPage",
    components: {
      QuadrantScatter: window.QuadrantScatter,
      FunnelRows: window.FunnelRows
    },
    props: { data: Object },
    emits: ["notify"],
    setup(props, { emit }) {
      const quick = ref("近30天");
      const platform = ref(props.data.filters.platforms[0]);
      const store = ref(props.data.filters.stores[0]);
      const activeKey = ref("");
      const productA = ref(props.data.rows[0].name);
      const productB = ref("");

      const allPlatform = props.data.filters.platforms[0];
      const allStore = props.data.filters.stores[0];
      const num = (v) => Number(String(v).replace(/[^0-9.-]/g, "")) || 0;
      const fmtInt = (v) => Math.round(v).toLocaleString("en-US");
      const pct = (v) => v.toFixed(1) + "%";

      const categoryOf = {
        "甄选泰奶": "泰国红茶",
        "咸法酪泰奶（清爽版）": "泰国红茶",
        "招牌泰式奶茶": "泰式奶茶",
        "手打柠檬茶": "泰式果茶",
        "椰香芒果糯米饭": "泰式甜品",
        "青咖喱鸡饭": "泰式主食",
        "冬阴功海鲜面": "泰式主食",
        "芝士泰奶": "泰国红茶",
        "泰式炒河粉": "泰式主食",
        "泰式菠萝炒饭": "泰式主食",
        "斑斓椰奶冻": "泰式甜品",
        "可可泰奶（冬季限定）": "可可系列",
        "曼谷炸鸡块": "泰式小吃",
        "香茅烤鸡翅": "泰式小吃"
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

      const windowInfo = computed(() => {
        if (quick.value === "今日") return { days: 1, text: "2026-11-12 至 2026-11-12" };
        if (quick.value === "昨日") return { days: 1, text: "2026-11-11 至 2026-11-11" };
        if (quick.value === "近7天") return { days: 7, text: "2026-11-06 至 2026-11-12" };
        return { days: 12, text: "2026-11-01 至 2026-11-12" };
      });
      const dayFactor = computed(() => windowInfo.value.days / 12);
      const platFactor = computed(() =>
        platform.value === "美团" ? 0.62 : platform.value === "饿了么" ? 0.38 : 1
      );
      const isFiltered = computed(
        () =>
          quick.value !== "近30天" ||
          platform.value !== allPlatform ||
          store.value !== allStore
      );

      const baseRows = computed(() => {
        const list = props.data.rows.filter((r) => storeAllows(r.name));
        if (!isFiltered.value) return list;
        const scale = dayFactor.value * platFactor.value * storeFactor.value;
        const qtySum = list.reduce((s, r) => s + num(r.qty), 0) || 1;
        return list.map((r) => ({
          name: r.name,
          qty: fmtInt(num(r.qty) * scale),
          qtyShare: pct((num(r.qty) / qtySum) * 100),
          price: r.price,
          exposure: fmtInt(num(r.exposure) * scale),
          clicks: fmtInt(num(r.clicks) * scale),
          clickRate: r.clickRate,
          adds: fmtInt(num(r.adds) * scale),
          addRate: r.addRate,
          orders: fmtInt(num(r.orders) * scale),
          orderRate: r.orderRate,
          repeat: fmtInt(num(r.repeat) * scale)
        }));
      });

      const quadrantData = computed(() => {
        if (!isFiltered.value) return props.data.quadrant;
        const scale = dayFactor.value * platFactor.value * storeFactor.value;
        const points = baseRows.value.map((r) => ({
          name: r.name,
          x: Math.max(1, Math.round(num(r.exposure) * scale)),
          y: num(r.orderRate),
          key: ""
        }));
        const med = (arr) => {
          const a = arr.slice().sort((x, y) => x - y);
          if (!a.length) return 0;
          return a.length % 2 ? a[(a.length - 1) / 2] : (a[a.length / 2 - 1] + a[a.length / 2]) / 2;
        };
        const medianX = med(points.map((p) => p.x));
        const medianY = med(points.map((p) => p.y));
        points.forEach((p) => {
          p.key =
            p.x >= medianX && p.y >= medianY
              ? "star"
              : p.x >= medianX
              ? "dog"
              : p.y >= medianY
              ? "cow"
              : "question";
        });
        const counts = { star: 0, dog: 0, cow: 0, question: 0 };
        points.forEach((p) => counts[p.key]++);
        return {
          points: points,
          medianX: Math.round(medianX),
          medianY: Math.round(medianY * 100) / 100,
          chips: props.data.quadrant.chips.map((c) => Object.assign({}, c, { count: counts[c.key] }))
        };
      });

      const nameKey = computed(() => {
        const m = {};
        quadrantData.value.points.forEach((p) => (m[p.name] = p.key));
        return m;
      });
      const tableRows = computed(() =>
        activeKey.value
          ? baseRows.value.filter((r) => nameKey.value[r.name] === activeKey.value)
          : baseRows.value
      );
      const emptyText = computed(() =>
        tableRows.value.length
          ? ""
          : baseRows.value.length
          ? "当前象限下暂无商品，请切换或取消象限筛选"
          : "没有符合当前筛选条件的商品转化数据，请调整日期、平台或门店"
      );
      const scatterEmpty = computed(() =>
        quadrantData.value.points.length
          ? ""
          : "当前筛选条件下暂无商品可绘制四象限，请调整日期、平台或门店"
      );

      const selectableNames = computed(() => baseRows.value.map((r) => r.name));
      watch(selectableNames, (names) => {
        if (!names.length) return;
        if (names.indexOf(productA.value) < 0) productA.value = names[0];
        if (productB.value && names.indexOf(productB.value) < 0) productB.value = "";
      });

      const toggleKey = (key) => {
        activeKey.value = activeKey.value === key ? "" : key;
      };
      const toStages = (row) => {
        if (!row) return [];
        return [
          { name: "曝光", value: row.exposure, rate: "" },
          { name: "点击", value: row.clicks, rate: row.clickRate },
          { name: "加购", value: row.adds, rate: row.addRate },
          { name: "下单", value: row.orders, rate: row.orderRate }
        ];
      };
      const rowOf = (name) => baseRows.value.find((r) => r.name === name);
      const stagesA = computed(() => toStages(rowOf(productA.value)));
      const stagesB = computed(() => toStages(rowOf(productB.value)));

      const query = () => {
        const chip = props.data.quadrant.chips.find((c) => c.key === activeKey.value);
        emit(
          "notify",
          "已按当前条件筛选：" +
            quick.value +
            " · " +
            platform.value +
            " · " +
            store.value +
            (chip ? " · " + chip.label : "") +
            (emptyText.value ? "（无结果）" : " · " + tableRows.value.length + " 个商品")
        );
      };
      const reset = () => {
        quick.value = "近30天";
        platform.value = allPlatform;
        store.value = allStore;
        activeKey.value = "";
        productA.value = props.data.rows[0].name;
        productB.value = "";
        emit("notify", "筛选条件已重置");
      };

      return {
        quick,
        platform,
        store,
        activeKey,
        productA,
        productB,
        windowInfo,
        baseRows,
        quadrantData,
        tableRows,
        emptyText,
        scatterEmpty,
        toggleKey,
        stagesA,
        stagesB,
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
          <span class="ov-date">{{ windowInfo.text }}</span>
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
          <section class="ov-card ov-chart-card">
            <div class="ov-card-head">
              <h3 class="ov-card-title">商品曝光转化四象限 <svg class="i i-12"><use href="#i-info" /></svg></h3>
              <div class="pc-chips">
                <button
                  v-for="c in quadrantData.chips" :key="c.key"
                  class="pc-chip"
                  :class="{ on: activeKey === c.key }"
                  :style="{ color: c.color, borderColor: c.color }"
                  @click="toggleKey(c.key)">
                  {{ c.label }} {{ c.count }}
                </button>
              </div>
            </div>
            <div class="an-note">横轴：商品曝光人数（对数轴） · 纵轴：商品下单率（下单人数 ÷ 加购人数） · 虚线为过滤后样本中位数</div>
            <div v-if="scatterEmpty" class="empty-state">
              <div class="empty-title">{{ scatterEmpty }}</div>
              <div class="empty-sub">散点与中位数线均基于当前筛选后的商品集合重算</div>
            </div>
            <quadrant-scatter
              v-else
              :key="'pc-scat-' + quick + '-' + platform + '-' + store + '-' + quadrantData.points.length + '-' + quadrantData.medianX + '-' + quadrantData.medianY + '-' + activeKey"
              :points="quadrantData.points"
              :median-x="quadrantData.medianX"
              :median-y="quadrantData.medianY"
              :active="activeKey"
              :height="300" />
            <div class="tv-foot-note">点击右上角象限可筛选高亮对应商品</div>
          </section>

          <section class="ov-card">
            <div class="ov-card-head">
              <h3 class="ov-card-title">商品转化漏斗 <svg class="i i-12"><use href="#i-info" /></svg></h3>
              <div class="tv-tools">
                <span class="muted-text">商品 A</span>
                <select class="f-select w190" v-model="productA">
                  <option v-for="n in baseRows" :key="n.name" :value="n.name">{{ n.name }}</option>
                </select>
                <span class="muted-text">对比商品 B</span>
                <select class="f-select w190" v-model="productB">
                  <option value="">— 未选择 —</option>
                  <option v-for="n in baseRows" :key="'b' + n.name" :value="n.name">{{ n.name }}</option>
                </select>
              </div>
            </div>
            <div v-if="!baseRows.length" class="empty-state">
              <div class="empty-title">{{ emptyText }}</div>
              <div class="empty-sub">漏斗与明细表均基于当前筛选结果重算</div>
            </div>
            <div v-else class="pc-funnel-grid">
              <div class="pc-funnel-panel">
                <div class="pc-funnel-title">{{ productA || '未选择商品' }}</div>
                <funnel-rows :stages="stagesA" />
                <div class="pc-funnel-note">{{ data.funnel.note }}</div>
              </div>
              <div class="pc-funnel-panel">
                <div class="pc-funnel-title">{{ productB || '未选择对比商品' }}</div>
                <funnel-rows v-if="productB" :stages="stagesB" />
                <div v-else class="pc-funnel-empty">未选择对比商品</div>
              </div>
            </div>
          </section>

          <section class="ov-card">
            <div class="ov-card-head">
              <h3 class="ov-card-title">商品转化明细表</h3>
              <div class="tv-tools">
                <span class="muted-text">共 {{ tableRows.length }} 个商品 · 按商品销量排序</span>
                <button class="btn btn-ghost" @click="$emit('notify', '已导出商品转化明细（演示）')">导出</button>
              </div>
            </div>
            <div class="ov-table-wrap an-scroll-260">
              <table class="tbl pc-wide-tbl">
                <thead>
                  <tr>
                    <th>商品名称</th><th>商品销量</th><th>商品销量占比</th><th>商品外卖定价</th>
                    <th>曝光人数</th><th>点击人数</th><th>点击率</th><th>加购人数</th><th>加购率</th>
                    <th>下单人数</th><th>下单率</th><th>期末纳入复购人数</th>
                  </tr>
                </thead>
                <tbody>
                  <tr v-for="r in tableRows" :key="r.name">
                    <td class="cell-name">{{ r.name }}</td>
                    <td>{{ r.qty }}</td>
                    <td>{{ r.qtyShare }}</td>
                    <td>{{ r.price }}</td>
                    <td>{{ r.exposure }}</td>
                    <td>{{ r.clicks }}</td>
                    <td>{{ r.clickRate }}</td>
                    <td>{{ r.adds }}</td>
                    <td>{{ r.addRate }}</td>
                    <td>{{ r.orders }}</td>
                    <td>{{ r.orderRate }}</td>
                    <td>{{ r.repeat }}</td>
                  </tr>
                  <tr v-if="emptyText"><td colspan="12" class="row-empty">{{ emptyText }}</td></tr>
                </tbody>
              </table>
            </div>
          </section>
        </div>
      </div>
    `
  };

  /* ================= 商品毛利测算 ================= */
})();
