/* Report donut */
(function () {
  const { ref, computed } = Vue;

  window.ReportDonut = {
    name: "ReportDonut",
    props: { items: Array, size: { type: Number, default: 132 } },
    setup(props) {
      const r = 52;
      const c = 2 * Math.PI * r;
      const segs = computed(() => {
        let acc = 0;
        return props.items.map((it) => {
          const len = (it.pct / 100) * c;
          const seg = { color: it.color, dash: len + " " + (c - len), offset: -acc };
          acc += len;
          return seg;
        });
      });
      return { r, c, segs };
    },
    template: `
      <svg class="rp-donut" viewBox="0 0 120 120" :width="size" :height="size">
        <circle cx="60" cy="60" :r="r" fill="none" stroke="#eef0f4" stroke-width="18" />
        <circle
          v-for="(s, i) in segs" :key="i"
          cx="60" cy="60" :r="r" fill="none"
          :stroke="s.color" stroke-width="18"
          :stroke-dasharray="s.dash" :stroke-dashoffset="s.offset"
          transform="rotate(-90 60 60)" />
      </svg>
    `
  };

})();
