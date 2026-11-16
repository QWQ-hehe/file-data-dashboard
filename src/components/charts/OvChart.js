/* Overview chart */
(function () {
  const { ref, computed } = Vue;

  window.OvChart = {
    name: "OvChart",
    props: {
      labels: { type: Array, default: () => [] },
      series: { type: Array, default: () => [] },
      line: { type: Object, default: null },
      height: { type: Number, default: 170 }
    },
    setup(props) {
      const W = 640;
      const padL = 44;
      const padR = props.line ? 34 : 10;
      const padT = 12;
      const padB = 36;
      const plotW = W - padL - padR;
      const plotH = props.height - padT - padB;

      const fmt = (v) => {
        if (v >= 10000) {
          const n = v / 10000;
          return (n % 1 === 0 ? n.toFixed(0) : n.toFixed(1)) + "万";
        }
        if (v >= 1000) {
          const n = v / 1000;
          return (n % 1 === 0 ? n.toFixed(0) : n.toFixed(1)) + "k";
        }
        return String(Math.round(v * 10) / 10);
      };

      const niceMax = (m) => {
        if (!m) return 1;
        const p = Math.pow(10, Math.floor(Math.log10(m)));
        const n = m / p;
        const steps = [1, 1.2, 1.5, 2, 2.5, 3, 4, 5, 6, 8, 10];
        for (let i = 0; i < steps.length; i++) {
          if (n <= steps[i]) return steps[i] * p;
        }
        return 10 * p;
      };

      const flat = (arr) => arr.reduce((a, b) => a.concat(b), []);
      const barMax = niceMax(Math.max.apply(null, flat(props.series.map((s) => s.values)).concat([1])) * 1.08);
      const lineMax = props.line
        ? niceMax(Math.max.apply(null, props.line.values.concat([1])) * 1.12)
        : 1;

      const ticks = [0, 1, 2, 3, 4].map((i) => {
        const v = (barMax / 4) * i;
        return { y: padT + plotH - (v / barMax) * plotH, text: fmt(v) };
      });

      const lineTicks = [0, 1, 2, 3, 4].map((i) => {
        const v = (lineMax / 4) * i;
        return { y: padT + plotH - (v / lineMax) * plotH, text: fmt(v) };
      });

      const n = props.labels.length || 1;
      const groupW = plotW / n;
      const m = props.series.length || 1;
      const barW = Math.min(20, (groupW * 0.62) / m);
      const gap = m > 1 ? 2 : 0;
      const totalW = barW * m + gap * (m - 1);

      const bars = [];
      props.series.forEach((s, si) => {
        s.values.forEach((v, i) => {
          const h = (v / barMax) * plotH;
          bars.push({
            x: padL + groupW * i + (groupW - totalW) / 2 + si * (barW + gap),
            y: padT + plotH - h,
            w: barW,
            h: h,
            color: s.color
          });
        });
      });

      const linePoints = props.line
        ? props.line.values
            .map((v, i) => {
              const x = padL + groupW * i + groupW / 2;
              const y = padT + plotH - (v / lineMax) * plotH;
              return x.toFixed(1) + "," + y.toFixed(1);
            })
            .join(" ")
        : "";

      const xLabels = props.labels.map((l, i) => ({
        x: padL + groupW * i + groupW / 2,
        a: typeof l === "string" ? l : l.a,
        b: typeof l === "string" ? "" : l.b || ""
      }));

      const hasLegend = props.series.length + (props.line ? 1 : 0) > 1;

      return {
        W, padL, padR, padT, plotH, ticks, lineTicks, bars, linePoints, xLabels,
        hasLegend, H: props.height
      };
    },
    template: `
      <div class="ov-chart">
        <div class="ov-legend" v-if="hasLegend">
          <span v-for="s in series" :key="s.name"><i :style="{ background: s.color }"></i>{{ s.name }}</span>
          <span v-if="line"><i :style="{ background: line.color }"></i>{{ line.name }}</span>
        </div>
        <svg class="ov-svg" :viewBox="'0 0 ' + W + ' ' + H" role="img" aria-label="经营趋势图">
          <g class="ov-grid">
            <line v-for="(t, i) in ticks" :key="'g' + i"
              :x1="padL" :x2="W - padR" :y1="t.y" :y2="t.y" />
          </g>
          <g class="ov-axis">
            <text v-for="(t, i) in ticks" :key="'y' + i" :x="padL - 7" :y="t.y + 3" text-anchor="end">{{ t.text }}</text>
            <text v-if="line" v-for="(t, i) in lineTicks" :key="'ry' + i" :x="W - padR + 6" :y="t.y + 3">{{ t.text }}</text>
          </g>
          <rect v-for="(b, i) in bars" :key="'b' + i"
            :x="b.x" :y="b.y" :width="b.w" :height="b.h" :fill="b.color" rx="1" />
          <polyline v-if="line" :points="linePoints" fill="none" :stroke="line.color" stroke-width="1.6" />
          <g class="ov-xaxis">
            <g v-for="(l, i) in xLabels" :key="'x' + i">
              <text :x="l.x" :y="H - 18" text-anchor="middle">{{ l.a }}</text>
              <text v-if="l.b" :x="l.x" :y="H - 6" text-anchor="middle" class="ov-xsub">{{ l.b }}</text>
            </g>
          </g>
        </svg>
      </div>
    `
  };

  /* ---------- 经营概览页面 ---------- */
})();
