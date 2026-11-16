/* Ring chart */
(function () {
  const { ref, computed, watch, onMounted, onUnmounted, reactive, nextTick } = Vue;

  window.RingChart = {
    name: "RingChart",
    props: {
      items: { type: Array, default: () => [] },
      size: { type: Number, default: 150 },
      thickness: { type: Number, default: 24 }
    },
    setup(props) {
      const r = (props.size - props.thickness) / 2;
      const c = 2 * Math.PI * r;
      const total = props.items.reduce((s, i) => s + i.value, 0) || 1;
      let acc = 0;
      const arcs = props.items.map((i) => {
        const len = (i.value / total) * c;
        const arc = {
          color: i.color,
          dash: len.toFixed(2) + " " + (c - len).toFixed(2),
          offset: (-acc).toFixed(2)
        };
        acc += len;
        return arc;
      });
      return { r, c, arcs, cx: props.size / 2, cy: props.size / 2, total };
    },
    template: `
      <div class="an-ring-wrap">
        <svg class="an-ring" :width="size" :height="size" :viewBox="'0 0 ' + size + ' ' + size">
          <circle :cx="cx" :cy="cy" :r="r" fill="none" stroke="#eef1f6" :stroke-width="thickness" />
          <circle
            v-for="(a, i) in arcs" :key="i"
            :cx="cx" :cy="cy" :r="r" fill="none" :stroke="a.color"
            :stroke-width="thickness" :stroke-dasharray="a.dash"
            :stroke-dashoffset="a.offset"
            :transform="'rotate(-90 ' + cx + ' ' + cy + ')'" />
        </svg>
        <div class="an-ring-legend">
          <span v-for="it in items" :key="it.name"><i :style="{ background: it.color }"></i>{{ it.name }} {{ it.value }}%</span>
        </div>
      </div>
    `
  };

  /* ---------- 分组柱状图（双系列） ---------- */
})();
