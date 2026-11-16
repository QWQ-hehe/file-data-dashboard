/* Workbench donut */
(function () {
  const { ref, computed } = Vue;

  window.DonutChart = {
    name: "DonutChart",
    props: { data: Object },
    setup(props) {
      const segments = computed(() => {
        const list = props.data.data;
        const total = list.reduce((sum, d) => sum + d.value, 0);
        const cx = 75, cy = 75, r = 57, gap = 1.1;
        let start = -90;
        const polar = (deg) => {
          const rad = (deg * Math.PI) / 180;
          return [cx + r * Math.cos(rad), cy + r * Math.sin(rad)];
        };
        return list.map((d) => {
          const sweep = (d.value / total) * 360;
          const a0 = start + gap;
          const a1 = start + sweep - gap;
          const p0 = polar(a0);
          const p1 = polar(a1);
          const large = a1 - a0 > 180 ? 1 : 0;
          const path = `M ${p0[0].toFixed(2)} ${p0[1].toFixed(2)} A ${r} ${r} 0 ${large} 1 ${p1[0].toFixed(2)} ${p1[1].toFixed(2)}`;
          const mid = polar((a0 + a1) / 2);
          start += sweep;
          return { ...d, path, tx: mid[0], ty: mid[1] };
        });
      });
      return { segments };
    },
    template: `
      <div class="donut-wrap">
        <svg class="donut-svg" viewBox="0 0 150 150" role="img" :aria-label="'推广五色分布，合格率 ' + data.percent + '%'">
          <path
            v-for="s in segments" :key="s.name"
            :d="s.path" :stroke="s.color" stroke-width="24" fill="none" stroke-linecap="butt" />
          <text v-for="s in segments" :key="'t' + s.name"
            class="donut-num" :x="s.tx" :y="s.ty + 3.2" text-anchor="middle">{{ s.value }}</text>
          <text class="donut-center-value" x="75" y="72" text-anchor="middle">{{ data.percent }}%</text>
          <text class="donut-center-label" x="75" y="88" text-anchor="middle">合格 {{ data.qualified }} / {{ data.total }}</text>
        </svg>
      </div>
    `
  };

})();
