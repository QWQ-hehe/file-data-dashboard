/* Report radar */
(function () {
  const { ref, computed } = Vue;

  window.ReportRadar = {
    name: "ReportRadar",
    props: { dims: Array, mine: Array, median: Array, prev: Array },
    setup(props) {
      const cx = 180;
      const cy = 132;
      const R = 92;
      const pt = (i, v, total) => {
        const ang = (-90 + (360 / total) * i) * (Math.PI / 180);
        const rr = (R * v) / 100;
        return [cx + rr * Math.cos(ang), cy + rr * Math.sin(ang)];
      };
      const poly = (vals) => vals.map((v, i) => pt(i, v, vals.length).join(",")).join(" ");
      const rings = [25, 50, 75, 100].map((v) =>
        props.dims.map((d, i) => pt(i, v, props.dims.length).join(",")).join(" ")
      );
      const axes = props.dims.map((d, i) => {
        const p = pt(i, 100, props.dims.length);
        const lp = pt(i, 122, props.dims.length);
        return { x1: cx, y1: cy, x2: p[0], y2: p[1], lx: lp[0], ly: lp[1], label: d };
      });
      return { cx, cy, rings, axes, minePoly: poly(props.mine), medianPoly: poly(props.median), prevPoly: poly(props.prev) };
    },
    template: `
      <svg class="rp-radar" viewBox="0 0 360 264" height="238">
        <polygon v-for="(r, i) in rings" :key="'r' + i" :points="r" fill="none" stroke="#e6eaf1" stroke-width="1" />
        <line v-for="(a, i) in axes" :key="'a' + i" :x1="a.x1" :y1="a.y1" :x2="a.x2" :y2="a.y2" stroke="#eceff4" />
        <polygon :points="medianPoly" fill="none" stroke="#c8cedb" stroke-width="1.2" stroke-dasharray="3 3" />
        <polygon :points="prevPoly" fill="none" stroke="#d9b98a" stroke-width="1.4" />
        <polygon :points="minePoly" fill="rgba(91,119,184,.16)" stroke="#5b77b8" stroke-width="1.8" />
        <text v-for="(a, i) in axes" :key="'t' + i" :x="a.lx" :y="a.ly" text-anchor="middle" font-size="9" fill="#7b8492">{{ a.label }}</text>
      </svg>
    `
  };

})();
