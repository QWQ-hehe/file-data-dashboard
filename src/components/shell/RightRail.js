/* Right rail */
(function () {
  const { ref, computed } = Vue;

  window.RightRail = {
    name: "RightRail",
    components: { DonutChart: window.DonutChart },
    props: { donut: Object, monitor: Object, ranking: Object },
    emits: ["notify"],
    setup() {
      const tab = ref("todo");
      return { tab };
    },
    template: `
      <article class="panel">
        <div class="panel-head">
          <h2 class="panel-title">其他待办</h2>
        </div>

        <div class="panel-body">
          <div class="side-card">
            <div class="side-card-title">
              {{ donut.title }}
              <svg class="i"><use href="#i-info" /></svg>
            </div>
            <donut-chart :data="donut" />
            <div class="legend">
              <span class="legend-item" v-for="d in donut.data" :key="d.name">
                <i class="dot" :style="{ background: d.color }"></i>{{ d.name }} {{ d.value }}
              </span>
            </div>
          </div>

          <div class="soft-divider"></div>
          <div class="sub-title">{{ monitor.title }}</div>
          <div class="soft-divider"></div>

          <div class="monitor-row">
            <span class="monitor-name">{{ monitor.name }}</span>
            <div class="seg">
              <button :class="{ on: tab === 'todo' }" @click="tab = 'todo'">未完成</button>
              <button :class="{ on: tab === 'done' }" @click="tab = 'done'">已完成</button>
            </div>
          </div>
          <div class="monitor-stat">{{ monitor.doneStats }}</div>

          <div v-if="tab === 'todo'" class="empty">{{ monitor.emptyText }}</div>
          <div v-else class="warning-item" style="margin-top:10px" @click="$emit('notify', '查看「' + monitor.doneItem.store + '」处理记录')">
            <div class="warning-title">{{ monitor.doneItem.store }}</div>
            <div class="warning-meta">{{ monitor.doneItem.time }}</div>
          </div>

          <div class="soft-divider"></div>
          <div class="rank-title">{{ ranking.title }}<span>{{ ranking.subtitle }}</span></div>
          <div class="rank-list">
            <div class="rank-item" v-for="(s, i) in ranking.stores" :key="s.name">
              <span class="rank-no" :class="{ top: i < 3 }">{{ i + 1 }}</span>
              <div class="rank-main">
                <div class="rank-name">{{ s.name }}</div>
                <div class="rank-bar"><span :style="{ width: s.bar + '%' }"></span></div>
              </div>
              <span class="rank-value">{{ s.value }}</span>
            </div>
          </div>
        </div>
      </article>
    `
  };
})();
