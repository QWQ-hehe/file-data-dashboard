/* 页面：运营工作台 */
(function () {
  window.WorkbenchPage = {
    name: "WorkbenchPage",
    components: {
      StatCards: window.StatCards,
      TodoPanel: window.TodoPanel,
      ClosurePanel: window.ClosurePanel,
      RightRail: window.RightRail
    },
    props: {
      stats: Object,
      todo: Object,
      warnings: Array,
      activeId: Number,
      donut: Object,
      monitor: Object,
      ranking: Object
    },
    emits: ["select", "notify"],
    computed: {
      activeWarning() {
        return this.warnings.find((w) => w.id === this.activeId) || this.warnings[0];
      }
    },
    template: `
      <header class="topbar">
        <div>
          <h1 class="page-title">运营工作台</h1>
          <div class="page-sub">沈健 · 我的工作台</div>
        </div>
        <button class="bell-btn" title="通知" @click="$emit('notify', '暂无新的通知')">
          <svg class="i"><use href="#i-bell" /></svg>
        </button>
      </header>

      <div class="content">
        <stat-cards :stats="stats" @notify="$emit('notify', $event)" />

        <section class="grid">
          <todo-panel
            :todo="todo"
            :warnings="warnings"
            :active-id="activeId"
            @select="$emit('select', $event)"
            @notify="$emit('notify', $event)" />
          <closure-panel :warning="activeWarning" @notify="$emit('notify', $event)" />
          <right-rail
            :donut="donut"
            :monitor="monitor"
            :ranking="ranking"
            @notify="$emit('notify', $event)" />
        </section>
      </div>
    `
  };
})();
