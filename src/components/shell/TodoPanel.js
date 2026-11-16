/* Todo panel */
(function () {
  const { ref, computed } = Vue;

  window.TodoPanel = {
    name: "TodoPanel",
    props: { todo: Object, warnings: Array, activeId: Number },
    emits: ["select", "notify"],
    setup(props, { emit }) {
      const platform = ref("meituan");
      const filter = ref("all");
      const spinning = ref(false);

      const filtered = computed(() => {
        if (filter.value === "done") return props.warnings.filter((w) => w.status === "已完成");
        if (filter.value === "todo") return props.warnings.filter((w) => w.status !== "已完成");
        return props.warnings;
      });

      const refresh = () => {
        if (spinning.value) return;
        spinning.value = true;
        setTimeout(() => {
          spinning.value = false;
          emit("notify", "今日待办已刷新（演示数据）");
        }, 600);
      };

      return { platform, filter, spinning, filtered, refresh };
    },
    template: `
      <article class="panel">
        <div class="panel-head todo-head">
          <h2 class="panel-title">今日待办</h2>
          <button class="btn-mini" @click="refresh">
            <span v-if="!spinning">刷新</span><span v-else>刷新中…</span>
          </button>
        </div>

        <div class="panel-body todo-body">
          <div class="info-strip">
            <span>{{ todo.groupLabel }}</span>
            <span>{{ todo.count }}</span>
          </div>

          <div class="store-card">
            <div class="store-name">{{ todo.store.name }}</div>
            <div class="store-meta">{{ todo.store.platform }} · 开业第 {{ todo.store.openedDays }} 天</div>

            <div class="order-row">
              <div class="order-cell">
                <div class="order-label">昨日订单</div>
                <div class="order-value">{{ todo.store.yesterdayOrders }}</div>
              </div>
              <div class="order-cell">
                <div class="order-label">昨日实收</div>
                <div class="order-value">{{ todo.store.yesterdayRevenue }}</div>
              </div>
            </div>

            <div class="target-block">
              <div class="target-title">月目标达成</div>
              <div class="target-row" v-for="row in todo.store.targetRows" :key="row.label">
                <span class="target-label">{{ row.label }}</span>
                <span class="dotted"></span>
                <span class="target-val" :class="{ warn: row.warn }">{{ row.value }}</span>
              </div>
            </div>

            <div class="week-title">近7日订单</div>
            <div class="week-grid">
              <div class="week-col" v-for="d in todo.store.week" :key="d.date">
                <span class="week-date">{{ d.date }}</span>
                <span class="week-val" :class="{ down: d.down }">{{ d.value }}</span>
              </div>
            </div>

            <button class="detail-btn" @click="$emit('notify', '打开「' + todo.store.name + '」门店详情')">
              查看详情 <svg class="i"><use href="#i-arrow-right" /></svg>
            </button>
          </div>

          <div class="platform-row">
            <button
              v-for="p in todo.platforms" :key="p.id"
              class="pill" :class="{ active: platform === p.id }"
              @click="platform = p.id">
              {{ p.label }}
            </button>
          </div>

          <div class="todo-tabs">
            <button
              v-for="f in todo.filters" :key="f.id"
              class="tab" :class="{ active: filter === f.id }"
              @click="filter = f.id">
              {{ f.label }}
            </button>
          </div>

          <div class="section-label">业绩预警</div>
          <div class="warning-list">
            <div
              v-for="w in filtered" :key="w.id"
              class="warning-item" :class="{ active: w.id === activeId }"
              @click="$emit('select', w.id)">
              <div class="warning-title">{{ w.store }} · 10月业绩异常下滑</div>
              <div class="warning-status">{{ w.status }}</div>
              <div class="warning-meta">{{ w.streak }} · 处理{{ w.hours }}</div>
            </div>
            <div v-if="!filtered.length" class="list-empty">暂无相关待办</div>
          </div>
        </div>
      </article>
    `
  };
})();
