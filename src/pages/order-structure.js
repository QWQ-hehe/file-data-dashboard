/* Page: order structure */
(function () {
  const { ref, computed, watch, onMounted, onUnmounted, reactive, nextTick } = Vue;

  window.OrderStructurePage = {
    name: "OrderStructurePage",
    components: { HBars: window.HBars, FlowChart: window.FlowChart },
    props: { data: Object },
    emits: ["notify"],
    setup(props, { emit }) {
      /* 默认取近30天，与 mock 的完整统计区间（11-01 至 11-12）对齐 */
      const quick = ref("近30天");
      const platform = ref(props.data.filters.platforms[0]);
      const store = ref(props.data.filters.stores[0]);
      const slotRange = ref("按周");
      const amountTab = ref(props.data.amount.tabs[0]);
      const amountStep = ref(props.data.amount.step);

      const allPlatform = props.data.filters.platforms[0];
      const allStore = props.data.filters.stores[0];
      const num = (v) => Number(String(v).replace(/[^0-9.-]/g, "")) || 0;
      const fmtInt = (v) => Math.round(v).toLocaleString("en-US");
      const pct = (v) => v.toFixed(1) + "%";

      /* 门店订单份额与平台覆盖（本页本地折算口径） */
      const storeConf = {
        "深圳湾万象城店": { factor: 0.18, eleme: true },
        "北京三里屯店": { factor: 0.12, eleme: true },
        "上海新天地店": { factor: 0.2, eleme: false }
      };
      const storeFactor = computed(() => {
        const c = storeConf[store.value];
        return c ? c.factor : 1;
      });
      const platFactor = computed(() =>
        platform.value === "美团" ? 0.62 : platform.value === "饿了么" ? 0.38 : 1
      );
      const dayFactor = computed(() =>
        quick.value === "今日" || quick.value === "昨日"
          ? 1 / 12
          : quick.value === "近7天"
          ? 7 / 12
          : 1
      );
      const scale = computed(() => dayFactor.value * platFactor.value * storeFactor.value);

      const noData = computed(() => {
        const c = storeConf[store.value];
        return !!(c && platform.value === "饿了么" && !c.eleme);
      });
      const emptyText = computed(() =>
        noData.value
          ? "当前门店在饿了么暂无订单数据，请切换平台或门店后重试"
          : "当前筛选条件下暂无订单数据，请调整日期、平台或门店"
      );

      const dateRangeText = computed(() => {
        if (quick.value === "今日") return "2026-11-12 至 2026-11-12";
        if (quick.value === "昨日") return "2026-11-11 至 2026-11-11";
        if (quick.value === "近7天") return "2026-11-06 至 2026-11-12";
        return props.data.filters.dateStart + " 至 " + props.data.filters.dateEnd;
      });

      const summaryTotal = computed(() =>
        noData.value ? "0" : fmtInt(num(props.data.summary.total) * scale.value)
      );
      const amountSample = computed(() => {
        if (noData.value) return "金额有效样本 0 / 0 单";
        const t = fmtInt(num(props.data.summary.total) * scale.value);
        return "金额有效样本 " + t + " / " + t + " 单";
      });

      /* 统一：按 scale 折算 + 重算占比与条形宽度 */
      const shape = (rows) => {
        const scaled = rows.map((r) => ({
          name: r.name,
          range: r.range,
          count: r.count * scale.value
        }));
        const total = scaled.reduce((s, r) => s + r.count, 0) || 1;
        const max = Math.max.apply(null, scaled.map((r) => r.count).concat([1]));
        return scaled.map((r) => ({
          name: r.name,
          range: r.range,
          count: fmtInt(r.count),
          share: pct((r.count / total) * 100),
          width: Math.round((r.count / max) * 100)
        }));
      };

      /* 时段：按周 5 段；小时模式按段内小时均分 */
      const slotHours = {
        "早餐": ["06:00-07:00", "07:00-08:00", "08:00-09:00", "09:00-10:00"],
        "午餐": ["10:00-11:00", "11:00-12:00", "12:00-13:00", "13:00-14:00"],
        "下午茶": ["14:00-15:00", "15:00-16:00", "16:00-17:00"],
        "晚餐": ["17:00-18:00", "18:00-19:00", "19:00-20:00"],
        "夜宵": ["20:00-21:00", "21:00-22:00", "22:00-23:00", "23:00-00:00",
          "00:00-01:00", "01:00-02:00", "02:00-03:00", "03:00-04:00", "04:00-05:00", "05:00-06:00"]
      };
      const timeSlots = computed(() => {
        if (noData.value) return [];
        if (slotRange.value === "小时") {
          const rows = [];
          props.data.timeSlots.forEach((s) => {
            const hrs = slotHours[s.name] || [];
            const per = num(s.count) / (hrs.length || 1);
            hrs.forEach((h) => rows.push({ name: h.slice(0, 5), range: h, count: per }));
          });
          return shape(rows);
        }
        return shape(props.data.timeSlots.map((s) => ({
          name: s.name, range: s.range, count: num(s.count)
        })));
      });

      const weekRows = computed(() => {
        if (noData.value) return [];
        return shape(props.data.week.map((w) => ({ name: w.name, count: num(w.count) })));
      });

      /* 金额：档位重分桶 + 口径切换（订单量 / 用户实付 / 商家实收） */
      const midOf = {
        "10元以下": 8, "10-15元": 12.5, "15-20元": 17.5, "20-25元": 22.5,
        "25-30元": 27.5, "30-35元": 32.5, "35-40元": 37.5, "40-45元": 42.5,
        "45-50元": 47.5, "50-60元": 55, "60-70元": 65, "70-80元": 75,
        "80-90元": 85, "90-100元": 95, "100元以上": 120
      };
      const bucketOf = (range) => {
        if (range === "10元以下" || range === "100元以上") return range;
        const lo = Math.floor(parseInt(range, 10) / 10) * 10;
        return lo + "-" + (lo + 10) + "元";
      };
      const amountRows = computed(() => {
        if (noData.value) return [];
        const agg = {};
        const order = [];
        props.data.amount.rows.forEach((r) => {
          const key = amountStep.value === "10元一档" ? bucketOf(r.range) : r.range;
          if (!agg[key]) {
            agg[key] = { range: key, count: 0, amount: 0 };
            order.push(key);
          }
          const c = num(r.count);
          agg[key].count += c;
          agg[key].amount += c * (midOf[r.range] || 0);
        });
        const mult = amountTab.value === "用户实付" ? 1 : amountTab.value === "商家实收" ? 0.72 : 0;
        const raw = order.map((k) => ({
          range: k,
          count: agg[k].count * scale.value,
          value:
            (amountTab.value === "订单量" ? agg[k].count : agg[k].amount * mult) *
            scale.value
        }));
        const total = raw.reduce((s, r) => s + r.value, 0) || 1;
        return raw.map((r) => ({
          range: r.range,
          count: fmtInt(r.count),
          metric:
            amountTab.value === "订单量"
              ? fmtInt(r.value) + " 单"
              : "¥" + fmtInt(r.value),
          raw: Math.round(r.value),
          share: pct((r.value / total) * 100)
        }));
      });

      const cupRows = computed(() => {
        if (noData.value) return [];
        const raw = props.data.cups.rows.map((r) => ({
          range: r.range,
          count: num(r.count) * scale.value
        }));
        const total = raw.reduce((s, r) => s + r.count, 0) || 1;
        return raw.map((r) => ({
          range: r.range,
          count: fmtInt(r.count),
          raw: Math.round(r.count),
          share: pct((r.count / total) * 100)
        }));
      });

      const reset = () => {
        quick.value = "近30天";
        platform.value = allPlatform;
        store.value = allStore;
        slotRange.value = "按周";
        amountTab.value = props.data.amount.tabs[0];
        amountStep.value = props.data.amount.step;
        emit("notify", "筛选条件已重置");
      };
      const query = () => {
        emit(
          "notify",
          "已按当前条件刷新：" + dateRangeText.value + " · " + platform.value + " · " + store.value +
            (noData.value ? "（无结果）" : " · " + summaryTotal.value + " 单")
        );
      };

      return {
        quick, platform, store, slotRange, amountTab, amountStep,
        dateRangeText, summaryTotal, amountSample, timeSlots, weekRows, amountRows, cupRows,
        emptyText, noData, query, reset
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
          <section class="ov-card an-summary">
            <div class="an-summary-title">{{ data.summary.title }}</div>
            <div class="an-summary-line">
              <span>{{ dateRangeText }}</span>
              <span>筛选：{{ platform === '全部' ? '全平台' : platform }} · {{ store === data.filters.stores[0] ? '全部门店' : store }}</span>
              <span>共 <b>{{ summaryTotal }}</b> {{ data.summary.unit }}</span>
            </div>
          </section>

          <section class="ov-card">
            <div class="ov-card-head">
              <h3 class="ov-card-title">订单时段构成</h3>
              <div class="tv-tools">
                <div class="tv-seg">
                  <button v-for="r in ['按周', '小时']" :key="r" :class="{ on: slotRange === r }" @click="slotRange = r">{{ r }}</button>
                </div>
                <button class="btn btn-ghost" @click="$emit('notify', '已导出订单时段构成（演示）')">导出</button>
              </div>
            </div>
            <div v-if="noData" class="empty-state">
              <div class="empty-title">暂无订单时段数据</div>
              <div class="empty-sub">{{ emptyText }}</div>
            </div>
            <div v-else class="an-split">
              <div class="an-split-chart">
                <h-bars :items="timeSlots" :label-width="52" />
              </div>
              <div class="ov-table-wrap an-mini-scroll">
                <table class="tbl">
                  <thead><tr><th>时段</th><th>时间范围</th><th>订单量</th><th>占比</th></tr></thead>
                  <tbody>
                    <tr v-for="s in timeSlots" :key="s.name">
                      <td class="cell-name">{{ s.name }}</td>
                      <td class="muted-text">{{ s.range }}</td>
                      <td>{{ s.count }}</td>
                      <td>{{ s.share }}</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          </section>

          <section class="ov-card">
            <div class="ov-card-head">
              <h3 class="ov-card-title">星期分布</h3>
              <button class="btn btn-ghost" @click="$emit('notify', '已导出星期分布（演示）')">导出</button>
            </div>
            <div v-if="noData" class="empty-state">
              <div class="empty-title">暂无星期分布数据</div>
              <div class="empty-sub">{{ emptyText }}</div>
            </div>
            <div v-else class="an-split">
              <div class="an-split-chart">
                <h-bars :items="weekRows" :label-width="40" />
              </div>
              <div class="ov-table-wrap an-mini-scroll">
                <table class="tbl">
                  <thead><tr><th>星期</th><th>订单量</th><th>占比</th></tr></thead>
                  <tbody>
                    <tr v-for="s in weekRows" :key="s.name">
                      <td class="cell-name">{{ s.name }}</td>
                      <td>{{ s.count }}</td>
                      <td>{{ s.share }}</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          </section>

          <section class="ov-card ov-chart-card">
            <div class="ov-card-head">
              <h3 class="ov-card-title">订单金额分布</h3>
              <div class="tv-tools">
                <div class="tv-seg">
                  <button v-for="t in data.amount.tabs" :key="t" :class="{ on: amountTab === t }" @click="amountTab = t">{{ t }}</button>
                </div>
                <select class="f-select w110" :value="amountStep" @change="amountStep = $event.target.value">
                  <option v-for="s in ['5元一档', '10元一档']" :key="s">{{ s }}</option>
                </select>
                <button class="btn btn-ghost" @click="$emit('notify', '已导出订单金额分布（演示）')">导出</button>
              </div>
            </div>
            <div class="an-note">{{ amountSample }}</div>
            <div v-if="noData" class="empty-state">
              <div class="empty-title">暂无金额分布数据</div>
              <div class="empty-sub">{{ emptyText }}</div>
            </div>
            <template v-else>
              <flow-chart
                :key="'os-amount-' + quick + '-' + platform + '-' + store + '-' + amountTab + '-' + amountStep"
                :labels="amountRows.map(r => r.range)"
                :bars="[{ name: amountTab, color: '#6d84c7', values: amountRows.map(r => r.raw) }]"
                :height="240" />
              <div class="ov-table-wrap an-mini-scroll">
                <table class="tbl">
                  <thead><tr><th>金额区间</th><th>订单量</th><th v-if="amountTab !== '订单量'">{{ amountTab }}</th><th>占比</th></tr></thead>
                  <tbody>
                    <tr v-for="r in amountRows" :key="r.range">
                      <td class="cell-name">{{ r.range }}</td>
                      <td>{{ r.count }}</td>
                      <td v-if="amountTab !== '订单量'">{{ r.metric }}</td>
                      <td>{{ r.share }}</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </template>
          </section>

          <section class="ov-card ov-chart-card">
            <div class="ov-card-head">
              <h3 class="ov-card-title">订单杯数构成</h3>
              <button class="btn btn-ghost" @click="$emit('notify', '已导出订单杯数构成（演示）')">导出</button>
            </div>
            <div v-if="noData" class="empty-state">
              <div class="empty-title">暂无杯数构成数据</div>
              <div class="empty-sub">{{ emptyText }}</div>
            </div>
            <template v-else>
              <flow-chart
                :key="'os-cups-' + quick + '-' + platform + '-' + store"
                :labels="cupRows.map(r => r.range)"
                :bars="[{ name: '订单量', color: '#6d84c7', values: cupRows.map(r => r.raw) }]"
                :height="240" />
              <div class="ov-table-wrap an-mini-scroll">
                <table class="tbl">
                  <thead><tr><th>杯数</th><th>订单量</th><th>占比</th></tr></thead>
                  <tbody>
                    <tr v-for="r in cupRows" :key="r.range">
                      <td class="cell-name">{{ r.range }}</td>
                      <td>{{ r.count }}</td>
                      <td>{{ r.share }}</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </template>
          </section>
        </div>
      </div>
    `
  };

  /* ================= 基本面分析 ================= */
})();
