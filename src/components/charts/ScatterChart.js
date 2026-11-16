/* Scatter chart */
(function () {
  const { ref, computed } = Vue;

  window.ScatterChart = {
    name: "ScatterChart",
    props: {
      points: { type: Array, default: () => [] },
      medianX: { type: Number, default: 0 },
      medianY: { type: Number, default: 0 },
      xLabel: { type: String, default: "" },
      yLabel: { type: String, default: "" },
      showQuadrants: { type: Boolean, default: true },
      height: { type: Number, default: 260 }
    },
    setup(props) {
      const W = 760;
      const padL = 54;
      const padR = 18;
      const padT = 14;
      const padB = 38;
      const plotW = W - padL - padR;
      const plotH = props.height - padT - padB;
      const xMax = niceMax(Math.max.apply(null, props.points.map((p) => p.x).concat([1])) * 1.06);
      const yMax = niceMax(Math.max.apply(null, props.points.map((p) => p.y).concat([1])) * 1.12);

      const sx = (v) => padL + (v / xMax) * plotW;
      const sy = (v) => padT + plotH - (v / yMax) * plotH;

      const dots = props.points.map((p) => {
        let color = "#b45a55";
        if (!props.showQuadrants) color = "#6d84c7";
        else if (p.x >= props.medianX && p.y >= props.medianY) color = "#4a7d63";
        else if (p.x >= props.medianX) color = "#c98a4b";
        else if (p.y >= props.medianY) color = "#5f7fc0";
        return { cx: sx(p.x), cy: sy(p.y), color: color };
      });

      const xTicks = [0, 0.25, 0.5, 0.75, 1].map((r) => {
        const v = xMax * r;
        return { x: sx(v), text: v >= 10000 ? (v / 10000).toFixed(1) + "万" : Math.round(v) };
      });
      const yTicks = [0, 0.25, 0.5, 0.75, 1].map((r) => {
        const v = yMax * r;
        return { y: sy(v), text: (Math.round(v * 10) / 10) + "%" };
      });

      const mx = sx(props.medianX);
      const my = sy(props.medianY);

      return {
        W, H: props.height, padL, plotW, plotH, dots, xTicks, yTicks, mx, my,
        xLine: W - padR, sy0: padT + plotH
      };
    },
    template: `
      <div class="tv-chart">
        <div class="ov-legend" v-if="showQuadrants">
          <span><i style="background:#4a7d63"></i>高曝光高转化</span>
          <span><i style="background:#c98a4b"></i>高曝光低转化</span>
          <span><i style="background:#5f7fc0"></i>低曝光高转化</span>
          <span><i style="background:#b45a55"></i>低曝光低转化</span>
        </div>
        <svg class="ov-svg" :viewBox="'0 0 ' + W + ' ' + H" role="img" aria-label="散点图">
          <g class="ov-grid">
            <line v-for="(t, i) in yTicks" :key="'gy' + i" :x1="padL" :x2="xLine" :y1="t.y" :y2="t.y" />
          </g>
          <line v-if="showQuadrants && medianX > 0" :x1="mx" :x2="mx" :y1="padL + 0" :y2="sy0" stroke="#d7dce5" stroke-dasharray="4 4" />
          <line v-if="showQuadrants && medianY > 0" :x1="padL" :x2="xLine" :y1="my" :y2="my" stroke="#d7dce5" stroke-dasharray="4 4" />
          <circle v-for="(d, i) in dots" :key="'d' + i" :cx="d.cx" :cy="d.cy" r="2.7" :fill="d.color" fill-opacity=".78" />
          <g class="ov-axis">
            <text v-for="(t, i) in yTicks" :key="'ty' + i" :x="padL - 7" :y="t.y + 3" text-anchor="end">{{ t.text }}</text>
            <text v-for="(t, i) in xTicks" :key="'tx' + i" :x="t.x" :y="H - 12" text-anchor="middle">{{ t.text }}</text>
          </g>
          <text class="sc-axis-label" :x="padL + plotW / 2" :y="H - 1" text-anchor="middle">{{ xLabel || '曝光人数' }}</text>
          <text class="sc-axis-label" x="12" :y="padL + plotH / 2" text-anchor="middle" :transform="'rotate(-90 12 ' + (padL + plotH / 2) + ')'">{{ yLabel || '总转化率' }}</text>
        </svg>
      </div>
    `
  };

  /* ---------- 流量转化概览 ---------- */
})();
