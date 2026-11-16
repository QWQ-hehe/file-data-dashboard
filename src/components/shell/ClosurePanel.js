/* Closure panel */
(function () {
  const { ref, computed } = Vue;

  window.ClosurePanel = {
    name: "ClosurePanel",
    props: { warning: Object },
    emits: ["notify"],
    methods: {
      fmt(v) {
        return (v > 0 ? "+" : "") + v.toFixed(2) + "%";
      }
    },
    template: `
      <article class="panel">
        <div class="panel-head closure-head">
          <h2 class="panel-title">处理闭环</h2>
          <button class="btn-mini" @click="$emit('notify', '门店诊断：正在生成经营诊断报告（演示）')">门店诊断</button>
          <button class="btn-mini" @click="$emit('notify', '门店诊断报告已导出（演示）')">门店诊断导出</button>
          <span class="head-note">2026-10 月报</span>
        </div>

        <div class="panel-body closure-body" v-if="warning">
          <h3 class="store-title">{{ warning.store }} · 10月业绩异常下滑</h3>
          <div class="meta-line">月度业绩预警 · {{ warning.status }}</div>
          <div class="meta-line">流量 · 业绩预警自动派单 · {{ warning.dispatchAt }}</div>
          <div class="meta-line">{{ warning.period }}</div>

          <div class="metrics">
            <div class="metric" v-for="m in warning.metrics" :key="m.label">
              <div class="metric-label">{{ m.label }}</div>
              <div class="metric-value" :class="{ up: m.value > 0 }">{{ fmt(m.value) }}</div>
            </div>
          </div>

          <p class="notice">此待办已结束，可查看处理记录。</p>

          <h4 class="sub-title">处理记录</h4>
          <div class="records">
            <div class="record" v-for="(r, i) in warning.records" :key="i">
              <div class="record-status">{{ r.status }}</div>
              <div class="record-meta">{{ r.user || '业绩预警自动派单' }}<template v-if="r.time"> · {{ r.time }}</template></div>
              <template v-if="r.status !== '加入待办'">
                <p class="record-text" v-for="(t, j) in r.texts" :key="j">{{ t }}</p>
              </template>
            </div>
          </div>
        </div>
      </article>
    `
  };

})();
