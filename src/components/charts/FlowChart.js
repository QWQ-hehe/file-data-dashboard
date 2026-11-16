/* Combo chart: stacked bars + multi-axis lines */
(function () {
  const { ref, computed } = Vue;

  window.FlowChart = {
    name: "FlowChart",
    props: {
      labels: { type: Array, default: () => [] },
      bars: { type: Array, default: () => [] },
      lines: { type: Array, default: () => [] },
      axes: { type: Object, default: () => ({}) },
      height: { type: Number, default: 220 },
      labelEvery: { type: Number, default: 1 }
    },
    setup(props) {
      const W = 760;
      const hasFar = props.lines.some((l) => l.axis === "far");
      const hasRight = props.lines.some((l) => l.axis === "right" || l.axis === "far");
      const padL = 46;
      const padR = hasFar ? 78 : hasRight ? 46 : 10;
      const padT = 12;
      const padB = 34;
      const plotW = W - padL - padR;
      const plotH = props.height - padT - padB;

      const axisVals = { left: [], right: [], far: [] };
      props.bars.forEach((b) => (axisVals.left = axisVals.left.concat(b.values)));
      props.lines.forEach((l) => {
        const k = l.axis || "left";
        axisVals[k] = axisVals[k].concat(l.values);
      });

      const axisMax = {};
      const axisFmt = {};
      ["left", "right", "far"].forEach((k) => {
        const conf = props.axes[k] || {};
        const maxv = Math.max.apply(null, axisVals[k].concat([1]));
        axisMax[k] = conf.max || niceMax(maxv * 1.12);
        axisFmt[k] = conf.fmt || "num";
      });

      const ticksFor = (max) =>
        [0, 1, 2, 3, 4].map((i) => {
          const v = (max / 4) * i;
          return { y: padT + plotH - (v / max) * plotH, text: axisText(v, "num") };
        });

      const leftTicks = [0, 1, 2, 3, 4].map((i) => {
        const v = (axisMax.left / 4) * i;
        return { y: padT + plotH - (v / axisMax.left) * plotH, text: axisText(v, axisFmt.left) };
      });
      const rightTicks = ticksFor(axisMax.right).map((t, i) => {
        const v = (axisMax.right / 4) * i;
        return { y: t.y, text: axisText(v, axisFmt.right) };
      });
      const farTicks = ticksFor(axisMax.far).map((t, i) => {
        const v = (axisMax.far / 4) * i;
        return { y: t.y, text: axisText(v, axisFmt.far) };
      });

      const n = props.labels.length || 1;
      const groupW = plotW / n;
      const barW = Math.min(24, groupW * 0.62);
      const bars = [];

      props.bars.forEach((s, si) => {
        const stacked = props.bars.length > 1;
        s.values.forEach((v, i) => {
          if (stacked) {
            let base = 0;
            for (let k = 0; k <= si; k++) base += props.bars[k].values[i] || 0;
            const h = ((s.values[i] || 0) / axisMax.left) * plotH;
            const below = ((base - (s.values[i] || 0)) / axisMax.left) * plotH;
            bars.push({
              x: padL + groupW * i + (groupW - barW) / 2,
              y: padT + plotH - below - h,
              w: barW,
              h: h,
              color: s.color
            });
          } else {
            const h = (v / axisMax.left) * plotH;
            bars.push({
              x: padL + groupW * i + (groupW - barW) / 2,
              y: padT + plotH - h,
              w: barW,
              h: h,
              color: s.color
            });
          }
        });
      });

      const lines = props.lines.map((l) => {
        const axis = l.axis || "left";
        const max = axisMax[axis];
        const pts = l.values.map((v, i) => {
          const x = padL + groupW * i + groupW / 2;
          const y = padT + plotH - (v / max) * plotH;
          return { x: x, y: y };
        });
        return {
          name: l.name,
          color: l.color,
          axis: axis,
          points: pts.map((p) => p.x.toFixed(1) + "," + p.y.toFixed(1)).join(" "),
          dots: pts,
          fmt: l.fmt || axisFmt[axis]
        };
      });

      const xLabels = props.labels
        .map((l, i) => ({
          x: padL + groupW * i + groupW / 2,
          text: typeof l === "string" ? l : l.a,
          i: i
        }))
        .filter((l) => l.i % Math.max(1, props.labelEvery) === 0);

      return {
        W, H: props.height, padL, padR, padT, plotH, leftTicks, rightTicks, farTicks,
        bars, legendBars: props.bars, lines, xLabels, hasRight, hasFar
      };
    },
    template: `
      <div class="tv-chart">
        <div class="ov-legend" v-if="bars.length + lines.length > 1">
          <span v-for="s in legendBars" :key="'b' + s.name"><i :style="{ background: s.color }"></i>{{ s.name }}</span>
          <span v-for="l in lines" :key="'l' + l.name"><i :style="{ background: l.color }"></i>{{ l.name }}</span>
        </div>
        <svg class="ov-svg" :viewBox="'0 0 ' + W + ' ' + H" role="img" aria-label="趋势图">
          <g class="ov-grid">
            <line v-for="(t, i) in leftTicks" :key="'g' + i" :x1="padL" :x2="W - padR" :y1="t.y" :y2="t.y" />
          </g>
          <g class="ov-axis">
            <text v-for="(t, i) in leftTicks" :key="'y' + i" :x="padL - 7" :y="t.y + 3" text-anchor="end">{{ t.text }}</text>
            <text v-if="hasRight" v-for="(t, i) in rightTicks" :key="'r' + i" :x="W - padR + 6" :y="t.y + 3">{{ t.text }}</text>
            <text v-if="hasFar" v-for="(t, i) in farTicks" :key="'f' + i" :x="W - 30" :y="t.y + 3">{{ t.text }}</text>
          </g>
          <rect v-for="(b, i) in bars" :key="'bar' + i" :x="b.x" :y="b.y" :width="b.w" :height="Math.max(b.h, 0)" :fill="b.color" rx="1" />
          <g v-for="l in lines" :key="'line' + l.name">
            <polyline :points="l.points" fill="none" :stroke="l.color" stroke-width="1.6" />
          </g>
          <g class="ov-xaxis">
            <text v-for="(l, i) in xLabels" :key="'x' + i" :x="l.x" :y="H - 12" text-anchor="middle">{{ l.text }}</text>
          </g>
        </svg>
      </div>
    `
  };

  /* ---------- 散点图 ---------- */
})();
