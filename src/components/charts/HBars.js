/* Horizontal bars */
(function () {
  const { ref, computed, watch, onMounted, onUnmounted, reactive, nextTick } = Vue;

  window.HBars = {
    name: "HBars",
    props: {
      items: { type: Array, default: () => [] },
      color: { type: String, default: "#7c93cc" },
      labelWidth: { type: Number, default: 76 }
    },
    template: `
      <div class="an-hbars">
        <div class="an-hbar-row" v-for="it in items" :key="it.name">
          <span class="an-hbar-label" :style="{ width: labelWidth + 'px' }">{{ it.name }}</span>
          <span class="an-hbar-track"><i :style="{ width: (it.width || 0) + '%', background: it.color || color }"></i></span>
          <span class="an-hbar-value">{{ it.count }}</span>
        </div>
      </div>
    `
  };

  /* ---------- 环形占比图 ---------- */
})();
