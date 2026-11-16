/* Page: product margin */
(function () {
  const { ref, computed, watch, onMounted, onUnmounted, reactive, nextTick } = Vue;

  window.ProductMarginPage = {
    name: "ProductMarginPage",
    props: { data: Object },
    emits: ["notify"],
    setup(props, { emit }) {
      const store = ref(props.data.filters.store);
      const platform = ref(props.data.filters.platform);
      const discount = ref(props.data.filters.discount);
      const memberRedPacket = ref(props.data.filters.memberRedPacket);
      const manual = ref(false);
      const manualRate = ref(6.2);
      const keyword = ref("");

      const defaultStore = props.data.filters.store;
      const defaultPlatform = props.data.filters.platform;
      const defaultDiscount = props.data.filters.discount;
      const defaultRedPacket = props.data.filters.memberRedPacket;

      const money = (v) => "¥" + Number(v).toFixed(2);
      const r2 = (v) => Math.round(v * 100) / 100;

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
        "安徽工学院店 · TK00169": { delta: 0, only: null, exclude: null },
        "深圳湾万象城店 · TK00218": { delta: 0.003, only: null, exclude: ["可可系列"] },
        "北京三里屯店 · TK00306": {
          delta: -0.002,
          only: ["泰国红茶", "泰式奶茶", "泰式果茶"],
          exclude: null
        }
      };
      const platformConf = computed(() =>
        platform.value === "饿了么"
          ? { rate: 0.055, minFee: 0.8, startPrice: 2.5 }
          : { rate: 0.062, minFee: 0.92, startPrice: 2.8 }
      );
      const storeDelta = computed(() => {
        const c = storeConf[store.value];
        return c ? c.delta : 0;
      });
      const effDiscount = computed(() => {
        const v = Number(discount.value);
        return isFinite(v) ? Math.min(10, Math.max(1, v)) : 10;
      });
      const effManualRate = computed(() => {
        const v = Number(manualRate.value);
        return isFinite(v) ? Math.min(30, Math.max(0, v)) : 6.2;
      });
      const ratePct = computed(() =>
        manual.value ? effManualRate.value : (platformConf.value.rate + storeDelta.value) * 100
      );
      const feeNote = computed(
        () =>
          "扣点 " +
          ratePct.value.toFixed(1) +
          "% · 保底 " +
          money(platformConf.value.minFee) +
          " · 起步价 " +
          money(platformConf.value.startPrice) +
          "（0-2公里）"
      );

      const pricingChanged = computed(
        () =>
          platform.value !== defaultPlatform ||
          Number(discount.value) !== defaultDiscount ||
          memberRedPacket.value !== defaultRedPacket ||
          manual.value ||
          store.value !== defaultStore
      );

      const rows = computed(() => {
        const k = keyword.value.trim().toLowerCase();
        const list = props.data.rows.filter((r) => {
          const c = storeConf[store.value];
          const cat = categoryOf[r.name];
          if (c) {
            if (c.only && c.only.indexOf(cat) < 0) return false;
            if (c.exclude && c.exclude.indexOf(cat) >= 0) return false;
          }
          return !k || r.name.toLowerCase().includes(k) || r.code.toLowerCase().includes(k);
        });
        if (!pricingChanged.value) return list;
        const rate = ratePct.value / 100;
        const payAdj = memberRedPacket.value ? 0 : 2;
        const calc = list.map((r) => {
          const pay = r2(r.pay * (effDiscount.value / 10) + payAdj);
          const fee = r2(Math.max(platformConf.value.minFee, pay * rate) + platformConf.value.startPrice);
          const income = r2(pay + r.packing - fee);
          const profit = r2(income - r.cost);
          return {
            name: r.name,
            code: r.code,
            cost: r.cost,
            price: r.price,
            pay: pay,
            packing: r.packing,
            fee: fee,
            income: income,
            profit: profit,
            margin: income > 0 ? ((profit / income) * 100).toFixed(2) + "%" : "—"
          };
        });
        calc.sort((a, b) => (parseFloat(b.margin) || 0) - (parseFloat(a.margin) || 0));
        return calc;
      });

      const emptyText = computed(() =>
        rows.value.length ? "" : "没有符合当前测算条件的商品，请调整门店、平台或搜索关键词"
      );

      const reset = () => {
        store.value = defaultStore;
        platform.value = defaultPlatform;
        discount.value = defaultDiscount;
        memberRedPacket.value = defaultRedPacket;
        manual.value = false;
        manualRate.value = 6.2;
        keyword.value = "";
        emit("notify", "测算条件已重置");
      };
      return {
        store,
        platform,
        discount,
        memberRedPacket,
        manual,
        manualRate,
        keyword,
        rows,
        money,
        feeNote,
        emptyText,
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

        <div class="ov-scroll">
          <section class="ov-card">
            <div class="pm-filter-grid">
              <label class="pm-field">
                <span>门店</span>
                <select class="f-select" v-model="store">
                  <option>安徽工学院店 · TK00169</option>
                  <option>深圳湾万象城店 · TK00218</option>
                  <option>北京三里屯店 · TK00306</option>
                </select>
              </label>
              <label class="pm-field">
                <span>平台</span>
                <select class="f-select" v-model="platform">
                  <option>美团</option>
                  <option>饿了么</option>
                </select>
              </label>
              <label class="pm-field">
                <span>默认商品折扣（折）</span>
                <input class="f-select" type="number" min="1" max="10" step="0.1" v-model.number="discount" />
              </label>
              <label class="pm-check">
                <input type="checkbox" v-model="memberRedPacket" />
                <span>使用会员红包</span>
              </label>
              <label class="pm-check pm-radio">
                <input type="radio" :checked="manual" @click="manual = !manual" />
                <span>手动填写<br />本次扣点</span>
              </label>
              <label class="pm-field" v-if="manual">
                <span>本次扣点（%）</span>
                <input class="f-select" type="number" min="0" max="30" step="0.1" v-model.number="manualRate" />
              </label>
            </div>
            <div class="an-note">{{ feeNote }}</div>
          </section>

          <section class="ov-card">
            <div class="ov-card-head">
              <h3 class="ov-card-title">单件商品测算 <svg class="i i-12"><use href="#i-info" /></svg></h3>
              <div class="tv-tools">
                <span class="muted-text">共 {{ rows.length }} 个商品 · 已按毛利率排序</span>
                <input class="f-select pm-search" v-model="keyword" placeholder="搜索商品、规格或分类" />
                <button class="btn btn-ghost" @click="$emit('notify', '资料已刷新（演示）')">刷新资料</button>
                <button class="btn btn-ghost" @click="reset">重置</button>
              </div>
            </div>
            <div class="ps-formula">
              商家收入 = 顾客实付 + 包装费 - 平台抽点；<b>毛利额 = 商家收入 - 成本</b>；<b>毛利率 = 毛利额 ÷ 商家收入</b>。售价取商品维护中的外卖定价，包装费取商品维护中的包装费。
            </div>
            <div v-if="emptyText" class="empty-state">
              <div class="empty-title">{{ emptyText }}</div>
              <div class="empty-sub">毛利额与毛利率按当前门店、平台、折扣、红包与扣点条件重算</div>
            </div>
            <div v-else class="ov-table-wrap pm-scroll">
              <table class="tbl pm-tbl">
                <thead>
                  <tr>
                    <th>商品名称</th><th>成本</th><th>外卖定价</th><th>顾客实付</th><th>包装费</th>
                    <th>平台抽点</th><th>商家收入</th><th>毛利额</th><th>毛利率</th>
                  </tr>
                </thead>
                <tbody>
                  <tr v-for="r in rows" :key="r.code">
                    <td class="cell-name">{{ r.name }}<span class="pm-code">{{ r.code }}</span></td>
                    <td>{{ money(r.cost) }}</td>
                    <td>{{ money(r.price) }}</td>
                    <td>{{ money(r.pay) }}</td>
                    <td>{{ money(r.packing) }}</td>
                    <td>{{ money(r.fee) }}</td>
                    <td>{{ money(r.income) }}</td>
                    <td><b class="pm-profit">{{ money(r.profit) }}</b></td>
                    <td><b class="pm-profit">{{ r.margin }}</b></td>
                  </tr>
                </tbody>
              </table>
            </div>
          </section>
        </div>
      </div>
    `
  };

  /* ================= 新品复盘分析 ================= */
})();
