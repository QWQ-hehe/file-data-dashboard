/* Page: business overview */
(function () {
  const { ref, computed, watch, onMounted, onUnmounted, reactive, nextTick } = Vue;

  window.BusinessOverviewPage = {
    name: "BusinessOverviewPage",
    components: { OvChart: window.OvChart },
    props: { data: Object },
    emits: ["notify"],
    setup(props, { emit }) {
      const data = ref(props.data);
      const tab = ref("common");
      const connected = ref(false);
      const loading = ref(false);
      const banner = ref(null);

      const pad = (n) => (n < 10 ? "0" + n : "" + n);
      const toISO = (d) => d.getFullYear() + "-" + pad(d.getMonth() + 1) + "-" + pad(d.getDate());
      const shift = (n) => {
        const d = new Date();
        d.setHours(0, 0, 0, 0);
        d.setDate(d.getDate() + n);
        return d;
      };
      const rangeOf = (q) => {
        if (q === "今日") { const d = shift(0); return [toISO(d), toISO(d)]; }
        if (q === "昨日") { const d = shift(-1); return [toISO(d), toISO(d)]; }
        if (q === "近7天") return [toISO(shift(-6)), toISO(shift(0))];
        return [toISO(shift(-29)), toISO(shift(0))];
      };

      const initRange = rangeOf("近7天");
      const quick = ref("近7天");
      const startDate = ref(initRange[0]);
      const endDate = ref(initRange[1]);
      const region = ref((props.data.filters.regions || [])[0] || "全部区域");
      const province = ref("全部省份");
      const channel = ref((props.data.filters.channels || [])[0] || "全部渠道");
      const storeType = ref((props.data.filters.storeTypes || [])[0] || "全部门店类型");
      const storeId = ref("");
      const brand = ref((props.data.filters.brands || [])[0] || "全部品牌");
      const storeKeyword = ref("");
      const stars = ref({});

      const current = computed(() => (data.value.indicators || {})[tab.value] || []);
      const hasData = computed(() => !data.value.meta || data.value.meta.hasData !== false);

      const provinceOptions = computed(() => {
        const f = data.value.filters || {};
        if (f.provinceList) {
          return ["全部省份"].concat(
            f.provinceList
              .filter((p) => region.value === "全部区域" || p.region === region.value)
              .map((p) => p.name)
          );
        }
        return (f.provinces && f.provinces.length ? f.provinces : ["全部省份"]);
      });

      const storeOptions = computed(() => {
        const f = data.value.filters || {};
        if (!f.storeList) return [];
        return f.storeList.filter((s) => {
          if (region.value !== "全部区域" && s.region !== region.value) return false;
          if (province.value !== "全部省份" && s.province !== province.value) return false;
          if (storeType.value !== "全部门店类型" && s.type !== storeType.value) return false;
          if (brand.value !== "全部品牌" && s.brand !== brand.value) return false;
          return true;
        });
      });

      const storeTrendSeries = computed(() => {
        const t = data.value.storeTrend || {};
        const arr = [{ name: "新开门店", color: "#5a6fa8", values: t.open || [] }];
        if (t.closeAvailable !== false) {
          arr.push({ name: "停止营业（不含闭店）", color: "#8aa06a", values: t.close || [] });
        }
        return arr;
      });

      const rankHeaders = ["外卖GMV（原）", "外卖收入", "外卖实收率", "有效订单", "客单价", "总曝光人数"];

      const filteredStores = computed(() => {
        const list = data.value.storeRanking || [];
        const k = storeKeyword.value.trim().toLowerCase();
        if (!k) return list;
        return list.filter((s) => s.name.toLowerCase().includes(k));
      });

      const isStar = (tabId, index) => {
        const key = tabId + "-" + index;
        if (key in stars.value) return stars.value[key];
        const row = ((data.value.indicators || {})[tabId] || [])[index];
        return !!(row && row.star);
      };

      const toggleStar = (tabId, index) => {
        const key = tabId + "-" + index;
        const next = !isStar(tabId, index);
        stars.value = Object.assign({}, stars.value, { [key]: next });
        emit("notify", next ? "已加入常用指标" : "已从常用指标移除");
      };

      const buildParams = () => {
        const p = { start: startDate.value, end: endDate.value };
        if (region.value !== "全部区域") p.region = region.value;
        if (province.value !== "全部省份") p.province = province.value;
        if (channel.value !== "全部渠道") p.platform = channel.value;
        if (storeType.value !== "全部门店类型") p.store_type = storeType.value;
        if (storeId.value) p.store = storeId.value;
        if (brand.value !== "全部品牌") p.brand = brand.value;
        return p;
      };

      let seq = 0;
      const query = async (silent) => {
        const my = ++seq;
        loading.value = true;
        const base = await detectApi();
        if (!base) {
          connected.value = false;
          loading.value = false;
          data.value = props.data;
          banner.value = {
            type: "warn",
            text: "演示数据：未连接数据服务，当前展示内置演示数据。双击「启动看板.bat」启动服务后点「重试连接」查看真实数据。"
          };
          if (!silent) emit("notify", "未连接数据服务，展示演示数据");
          return;
        }
        try {
          const qs = new URLSearchParams(buildParams()).toString();
          const res = await apiGet(base, "/api/dashboard/business_overview?" + qs, 8000);
          if (my !== seq) return;
          connected.value = true;
          data.value = res;
          const f = res.filters || {};
          if (f.regions && f.regions.indexOf(region.value) < 0) region.value = "全部区域";
          if (f.provinces && f.provinces.indexOf(province.value) < 0 && province.value !== "全部省份") {
            province.value = "全部省份";
          }
          if (f.storeTypes && f.storeTypes.indexOf(storeType.value) < 0) storeType.value = "全部门店类型";
          if (f.brands && f.brands.indexOf(brand.value) < 0) brand.value = "全部品牌";
          const meta = res.meta || {};
          if (meta.hasData === false) {
            banner.value = { type: "error", text: meta.message || "所选区间无数据" };
          } else if (meta.message) {
            banner.value = { type: "info", text: meta.message };
          } else {
            banner.value = null;
          }
          if (!silent) emit("notify", meta.hasData === false ? "所选区间无数据" : "已刷新为真实数据");
        } catch (e) {
          if (my !== seq) return;
          connected.value = false;
          data.value = props.data;
          banner.value = { type: "warn", text: "数据服务请求失败，当前展示演示数据。" };
          if (!silent) emit("notify", "数据服务请求失败，展示演示数据");
        } finally {
          if (my === seq) loading.value = false;
        }
      };

      /* 重试连接：清掉探测缓存，服务启动后无需刷新页面 */
      const retryConnect = () => {
        apiBasePromise = null;
        query(false);
      };

      const applyQuick = (q) => {
        quick.value = q;
        const r = rangeOf(q);
        startDate.value = r[0];
        endDate.value = r[1];
        query();
      };

      const onDateChange = () => {
        quick.value = "";
        query();
      };

      const onRegionChange = () => {
        if (province.value !== "全部省份" && provinceOptions.value.indexOf(province.value) < 0) {
          province.value = "全部省份";
        }
        if (storeId.value && !storeOptions.value.some((s) => s.id === storeId.value)) storeId.value = "";
        query();
      };

      const onDimChange = () => {
        if (storeId.value && !storeOptions.value.some((s) => s.id === storeId.value)) storeId.value = "";
        query();
      };

      const resetFilters = () => {
        quick.value = "近7天";
        const r = rangeOf("近7天");
        startDate.value = r[0];
        endDate.value = r[1];
        region.value = "全部区域";
        province.value = "全部省份";
        channel.value = "全部渠道";
        storeType.value = "全部门店类型";
        storeId.value = "";
        brand.value = "全部品牌";
        storeKeyword.value = "";
        query();
      };

      const jumpToCoverage = () => {
        const meta = data.value.meta || {};
        if (!meta.dataStart) return;
        quick.value = "";
        startDate.value = meta.dataStart;
        endDate.value = meta.dataEnd;
        query();
      };

      const exportData = (name) => emit("notify", "已导出 " + name + "（演示）");

      onMounted(() => query(true));

      return {
        data, tab, quick, startDate, endDate, region, province, channel, storeType, storeId, brand,
        storeKeyword, connected, loading, banner, hasData, current, provinceOptions, storeOptions,
        storeTrendSeries, rankHeaders, filteredStores, isStar, toggleStar, applyQuick, onDateChange,
        onRegionChange, onDimChange, resetFilters, jumpToCoverage, query, exportData, retryConnect
      };
    },
    template: `
      <div class="module-page">
        <header class="module-topbar">
          <div class="module-head-left">
            <h1 class="page-title">{{ data.title }}</h1>
            <span class="count-badge">{{ data.updatedAt }}</span>
            <span v-if="connected" class="ov-mode-badge ok">真实数据</span>
            <span v-else class="ov-mode-badge warn">演示数据</span>
            <span v-if="loading" class="muted-text">查询中…</span>
          </div>
          <button class="bell-btn" title="通知" @click="$emit('notify', '暂无新的通知')">
            <svg class="i"><use href="#i-bell" /></svg>
          </button>
        </header>

        <div class="ov-filters">
          <div class="ov-quick-group">
            <span class="ov-filter-label">日期</span>
            <button
              v-for="q in (data.filters.quick || ['今日','昨日','近7天','近30天'])" :key="q"
              class="ov-quick" :class="{ active: quick === q }"
              @click="applyQuick(q)">{{ q }}</button>
          </div>
          <input class="f-input ov-date-input" type="date" v-model="startDate" @change="onDateChange" />
          <span class="ov-date">至</span>
          <input class="f-input ov-date-input" type="date" v-model="endDate" @change="onDateChange" />
          <select class="f-select w110" v-model="region" @change="onRegionChange">
            <option v-for="o in data.filters.regions" :key="o">{{ o }}</option>
          </select>
          <select class="f-select w110" v-model="province" @change="onRegionChange">
            <option v-for="o in provinceOptions" :key="o">{{ o }}</option>
          </select>
          <select class="f-select w110" v-model="channel" @change="query()">
            <option v-for="o in data.filters.channels" :key="o">{{ o }}</option>
          </select>
          <select class="f-select w130" v-model="storeType" @change="onDimChange">
            <option v-for="o in data.filters.storeTypes" :key="o">{{ o }}</option>
          </select>
          <select class="f-select w180" v-model="storeId" @change="query()">
            <option value="">全部门店</option>
            <option v-for="s in storeOptions" :key="s.id" :value="s.id">{{ s.label }}</option>
          </select>
          <select class="f-select w110" v-model="brand" @change="onDimChange">
            <option v-for="o in data.filters.brands" :key="o">{{ o }}</option>
          </select>
          <button class="btn btn-primary" @click="query()">查询</button>
          <button class="btn btn-ghost" @click="resetFilters">重置</button>
          <span class="toolbar-spacer"></span>
          <span class="muted-text">{{ connected ? '接口实时查询' : '本机演示数据' }}</span>
        </div>

        <div v-if="banner" class="ov-banner" :class="banner.type">
          <span class="ov-banner-text">{{ banner.text }}</span>
          <button v-if="!connected" class="btn btn-ghost ov-retry" :disabled="loading" @click="retryConnect">
            {{ loading ? '连接中…' : '重试连接' }}
          </button>
        </div>

        <div class="ov-scroll">
          <section v-if="!hasData" class="ov-card ov-empty">
            <div class="ov-empty-title">所选区间暂无数据</div>
            <p>{{ banner ? banner.text : '请调整日期或筛选条件后重试。' }}</p>
            <button v-if="data.meta && data.meta.dataStart" class="btn btn-primary" @click="jumpToCoverage">
              查看有数据区间（{{ data.meta.dataStart }} 至 {{ data.meta.dataEnd }}）
            </button>
          </section>

          <template v-else>
          <section class="ov-card">
            <div class="ov-card-head">
              <h3 class="ov-card-title">核心指标</h3>
              <span class="muted-text">库内无同比/环比历史期，暂不展示环比</span>
            </div>
            <div class="ov-kpi-grid">
              <div class="ov-kpi" v-for="k in data.kpis" :key="k.label">
                <div class="ov-kpi-label">
                  {{ k.label }}
                  <svg class="i i-12"><use href="#i-info" /></svg>
                </div>
                <div class="ov-kpi-value">{{ k.value }}<span v-if="k.unit">{{ k.unit }}</span></div>
                <div v-if="k.delta" class="ov-kpi-foot" :class="k.dir">
                  环比 <b>{{ k.dir === 'up' ? '▲' : '▼' }} {{ k.delta }}</b>
                  <span>{{ k.diff }}</span>
                </div>
                <div v-else class="ov-kpi-foot muted-text">{{ k.diff || '暂无可比期' }}</div>
              </div>
            </div>
          </section>

          <section class="ov-card">
            <div class="ov-card-head">
              <h3 class="ov-card-title">指标分类</h3>
              <span class="muted-text">共 {{ current.length }} 项指标 · 数据口径见各指标说明</span>
            </div>
            <div class="ov-tabs">
              <button
                v-for="t in data.tabs" :key="t.id"
                class="ov-tab" :class="{ active: tab === t.id }"
                @click="tab = t.id">{{ t.label }}</button>
            </div>
            <div class="ov-table-wrap">
              <table class="tbl ov-ind-tbl">
                <thead>
                  <tr>
                    <th class="ov-ind-name">指标</th>
                    <th v-for="p in data.platforms" :key="p.key">{{ p.label }}</th>
                    <th class="ov-star-col">常用</th>
                  </tr>
                </thead>
                <tbody>
                  <tr v-for="(r, ri) in current" :key="r.label">
                    <td class="ov-ind-name">
                      {{ r.label }}
                      <svg class="i i-12"><use href="#i-info" /></svg>
                    </td>
                    <td v-for="(c, ci) in r.cells" :key="ci">
                      <div class="ov-cell-value" :class="{ muted: c.muted }">{{ c.v }}</div>
                      <div v-if="c.d" class="ov-cell-delta" :class="c.dir">
                        <template v-if="c.dir === 'flat'">{{ c.d }}</template>
                        <template v-else>环比 {{ c.dir === 'up' ? '▲' : '▼' }} {{ c.d }}</template>
                      </div>
                    </td>
                    <td class="ov-star-col">
                      <button class="ov-star" :class="{ on: isStar(tab, ri) }" @click="toggleStar(tab, ri)">
                        {{ isStar(tab, ri) ? '★' : '☆' }}
                      </button>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </section>

          <template v-if="tab === 'common'">
            <div class="ov-chart-row">
              <section class="ov-card ov-chart-card" v-for="c in data.trendCards" :key="c.title">
                <div class="ov-chart-head">
                  <div>
                    <div class="ov-chart-title">{{ c.title }}</div>
                    <div class="ov-chart-value">{{ c.value }}</div>
                  </div>
                  <span class="muted-text">{{ c.rangeLabel || '所选区间' }}</span>
                </div>
                <ov-chart
                  :labels="c.labels"
                  :series="[{ name: c.title, color: '#5f76b4', values: c.values }]"
                  :height="150" />
              </section>
            </div>

            <div class="ov-split">
              <section class="ov-card ov-chart-card">
                <div class="ov-card-head">
                  <h3 class="ov-card-title">{{ data.province.title }}</h3>
                  <button class="btn btn-ghost" @click="exportData('省份数据')">导出</button>
                </div>
                <ov-chart
                  :labels="data.province.labels"
                  :series="[{ name: '店日均实收', color: '#6d84c7', values: data.province.bars }]"
                  :line="{ name: '门店数量', color: '#8aa06a', values: data.province.line }"
                  :height="220" />
              </section>
              <section class="ov-card ov-province-card">
                <div class="ov-card-head">
                  <h3 class="ov-card-title">省份明细</h3>
                </div>
                <div class="ov-table-wrap">
                  <table class="tbl">
                    <thead>
                      <tr><th>省份</th><th>店日均实收（元）</th><th>同比增速（缺历史期）</th></tr>
                    </thead>
                    <tbody>
                      <tr v-for="r in data.province.table" :key="r.name">
                        <td class="cell-name">{{ r.name }}</td>
                        <td>{{ r.value }}</td>
                        <td :class="r.dir === 'up' ? 'ov-up' : (r.dir === 'down' ? 'ov-down' : 'muted-text')">
                          <template v-if="r.dir">{{ r.dir === 'up' ? '+' : '-' }}{{ r.delta }}</template>
                          <template v-else>—</template>
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </section>
            </div>

            <section class="ov-card ov-chart-card">
              <div class="ov-card-head">
                <h3 class="ov-card-title">{{ data.storeTrend.title }}</h3>
                <span class="muted-text" v-if="data.storeTrend.closeAvailable === false">停止营业：库中无数据</span>
                <button class="btn btn-ghost" @click="exportData('开店闭店数据')">导出</button>
              </div>
              <ov-chart
                :labels="data.storeTrend.labels"
                :series="storeTrendSeries"
                :height="200" />
            </section>

            <section class="ov-card">
              <div class="ov-card-head">
                <h3 class="ov-card-title">门店风云榜</h3>
                <div class="ov-rank-tools">
                  <input class="f-input w160" v-model="storeKeyword" placeholder="搜索门店名..." />
                  <button class="btn btn-ghost" @click="$emit('notify', '指标选择：已选 6 项（演示）')">指标选择（6）</button>
                  <button class="btn btn-primary" @click="exportData('门店风云榜明细')">下载明细（Excel）</button>
                </div>
              </div>
              <div class="ov-table-wrap">
                <table class="tbl ov-rank-tbl">
                  <thead>
                    <tr>
                      <th class="ov-rank-col">排名</th>
                      <th>门店</th>
                      <th v-for="h in rankHeaders" :key="h">{{ h }}</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr v-for="s in filteredStores" :key="s.name">
                      <td class="ov-rank-col">
                        <span class="ov-rank" :class="'r' + s.rank">{{ s.rank }}</span>
                      </td>
                      <td class="cell-name">{{ s.name }}</td>
                      <td v-for="(c, ci) in s.cells" :key="ci">
                        <div class="ov-cell-value" :class="{ muted: c.muted }">{{ c.v }}</div>
                        <div v-if="c.d" class="ov-cell-delta" :class="c.dir">
                          {{ c.dir === 'up' ? '▲' : '▼' }} {{ c.d }}
                        </div>
                      </td>
                    </tr>
                    <tr v-if="!filteredStores.length">
                      <td :colspan="rankHeaders.length + 2" class="row-empty">没有符合条件的门店</td>
                    </tr>
                  </tbody>
                </table>
              </div>
              <div class="panel-foot">
                <span>共 {{ filteredStores.length }} 家门店 · 按外卖GMV（原）降序</span>
                <span class="foot-note">数据周期：{{ startDate }} 至 {{ endDate }}</span>
              </div>
            </section>
          </template>
          </template>
        </div>
      </div>
    `
  };
})();
