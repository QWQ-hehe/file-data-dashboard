/* Funnel rows */
(function () {
  const { ref, computed, watch, onMounted, onUnmounted, reactive, nextTick } = Vue;

  window.FunnelRows = {
    name: "FunnelRows",
    props: { stages: { type: Array, default: () => [] } },
    setup(props) {
      const num = (v) => Number(String(v).replace(/[^0-9.]/g, "")) || 0;
      const pct = (v) => {
        const max = Math.max.apply(null, props.stages.map((s) => num(s.value)).concat([1]));
        return Math.max((num(v) / max) * 100, 3).toFixed(1) + "%";
      };
      return { pct };
    },
    template: `
      <div class="pc-funnel">
        <div class="pc-funnel-row" v-for="(s, i) in stages" :key="s.name">
          <span class="pc-funnel-label">{{ s.name }}</span>
          <span class="pc-funnel-track">
            <i :style="{ width: pct(s.value), background: ['#cdd8f0', '#a9bee6', '#7f9bd6', '#5b77b8'][i % 4] }"></i>
          </span>
          <span class="pc-funnel-value">{{ s.value }} 人<em v-if="s.rate"> · {{ s.rate }}</em></span>
        </div>
      </div>
    `
  };

  /* ================= 商品转化分析 ================= */
})();
