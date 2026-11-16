/* Page: marketing ledger */
(function () {
  const { ref, computed, watch, onMounted, onUnmounted, reactive, nextTick } = Vue;

  window.MarketingLedgerPage = {
    name: "MarketingLedgerPage",
    props: { data: Object },
    emits: ["notify"],
    setup(props, { emit }) {
      const f = window.useFilters(props, emit);
      const tab = ref("活动台账");

      const allPlatform = props.data.filters.platforms[0];
      const allStore = props.data.filters.stores[0];
      const isFiltered = computed(() =>
        f.quick.value !== "近7天" || f.platform.value !== allPlatform || f.store.value !== allStore
      );
      const lastDay = "2026-11-12";
      const windowStart = computed(() =>
        f.quick.value === "昨日" ? "2026-11-12" : f.quick.value === "近7天" ? "2026-11-06" : "2026-11-01"
      );

      /* 台账 / 日历均无门店字段，按活动适用范围映射（仅本页演示口径） */
      const scopeMap = {
        "双11 爆单红包": "全部门店",
        "冬季新品试饮": ["安徽工学院店", "深圳湾万象城店"],
        "神抢手满减加码": ["北京三里屯店", "上海世博天地店"],
        "门店新客立减": "全部门店",
        "冬季新品试饮上线": ["安徽工学院店", "深圳湾万象城店"],
        "神抢手周末加码": ["北京三里屯店", "上海世博天地店"],
        "双11 爆单红包爆发": "全部门店",
        "神抢手满减加码结束": ["北京三里屯店", "上海世博天地店"]
      };
      const inStore = (name) => {
        if (f.store.value === allStore) return true;
        const scope = scopeMap[name];
        return scope === "全部门店" || (Array.isArray(scope) && scope.indexOf(f.store.value) >= 0);
      };
      const inPlatform = (channel) =>
        f.platform.value === allPlatform || channel === f.platform.value || channel === "全渠道";

      const ledgerRows = computed(() => {
        if (!isFiltered.value) return props.data.rows;
        return props.data.rows.filter((r) => {
          if (!inPlatform(r.channel) || !inStore(r.name)) return false;
          const parts = r.time.split(" ~ ");
          return parts[0] <= lastDay && parts[1] >= windowStart.value;
        });
      });

      const calendarRows = computed(() => {
        if (!isFiltered.value) return props.data.calendar;
        return props.data.calendar.filter((c) => {
          if (!inPlatform(c.channel) || !inStore(c.name)) return false;
          const day = "2026-" + c.date.replace("/", "-");
          return day >= windowStart.value && day <= lastDay;
        });
      });

      const countText = computed(() =>
        "共 " + (tab.value === "活动台账" ? ledgerRows.value.length : calendarRows.value.length) + " 条"
      );
      const ledgerEmptyText = computed(() =>
        isFiltered.value
          ? "当前筛选条件下暂无台账记录，请调整日期、平台或门店"
          : "暂无台账记录 —— 点击右上「+ 新增活动」开始填写"
      );
      const calendarEmptyText = computed(() =>
        isFiltered.value
          ? "当前筛选条件下暂无日历事项，请调整日期、平台或门店"
          : "暂无日历事项 —— 点击右上「+ 新增活动」开始填写"
      );

      return Object.assign(f, {
        tab,
        ledgerRows,
        calendarRows,
        countText,
        ledgerEmptyText,
        calendarEmptyText
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
            <div class="ml-tabs">
              <button
                v-for="t in data.tabs" :key="t"
                class="ml-tab" :class="{ on: tab === t }"
                @click="tab = t">
                {{ t }}
              </button>
            </div>

            <div class="ml-toolbar">
              <span class="muted-text">
                {{ countText }} · 记录自动保存草稿，可导出 CSV 归档
              </span>
              <div class="tv-tools">
                <button class="btn btn-ghost" @click="$emit('notify', '已导出' + tab + ' CSV（演示）')">导出 CSV</button>
                <button class="btn btn-primary" @click="$emit('notify', '打开新增活动表单（演示）')">+ 新增活动</button>
              </div>
            </div>

            <div v-if="tab === '活动台账'" class="ov-table-wrap">
              <table class="tbl ml-tbl">
                <thead>
                  <tr>
                    <th>活动名称</th><th>活动目标</th><th>活动时间</th><th>活动渠道</th>
                    <th>关键节点</th><th>人员分工</th><th>项目预算</th><th>投产比预估</th><th>操作</th>
                  </tr>
                </thead>
                <tbody>
                  <tr v-for="r in ledgerRows" :key="r.name">
                    <td class="cell-name">{{ r.name }}</td>
                    <td>{{ r.goal }}</td>
                    <td class="muted-text">{{ r.time }}</td>
                    <td><span class="mk-platform" :class="r.channel === '美团' ? 'mt' : r.channel === '饿了么' ? 'ele' : 'all'">{{ r.channel }}</span></td>
                    <td>{{ r.milestone }}</td>
                    <td>{{ r.owners }}</td>
                    <td>{{ r.budget }}</td>
                    <td><b class="ml-roi">{{ r.roi }}</b></td>
                    <td class="ml-ops">
                      <a @click="$emit('notify', '查看活动「' + r.name + '」（演示）')">查看</a>
                      <a @click="$emit('notify', '编辑活动「' + r.name + '」（演示）')">编辑</a>
                    </td>
                  </tr>
                </tbody>
              </table>
              <div v-if="!ledgerRows.length" class="row-empty">{{ ledgerEmptyText }}</div>
            </div>

            <div v-else class="ov-table-wrap">
              <table class="tbl ml-tbl">
                <thead>
                  <tr><th>日期</th><th>活动事项</th><th>活动渠道</th><th>负责人</th><th>操作</th></tr>
                </thead>
                <tbody>
                  <tr v-for="c in calendarRows" :key="c.date + c.name">
                    <td class="cell-name">{{ c.date }}</td>
                    <td>{{ c.name }}</td>
                    <td><span class="mk-platform" :class="c.channel === '美团' ? 'mt' : 'ele'">{{ c.channel }}</span></td>
                    <td>{{ c.owner }}</td>
                    <td class="ml-ops"><a @click="$emit('notify', '查看日历事项「' + c.name + '」（演示）')">查看</a></td>
                  </tr>
                </tbody>
              </table>
              <div v-if="!calendarRows.length" class="row-empty">{{ calendarEmptyText }}</div>
            </div>
          </section>
        </div>
      </div>
    `
  };
})();
