/* Grouped bars */
(function () {
  const { ref, computed, watch, onMounted, onUnmounted, reactive, nextTick } = Vue;

  window.GroupBarChart = {
    name: "GroupBarChart",
    props: {
      labels: { type: Array, default: () => [] },
      series: { type: Array, default: () => [] },
      max: { type: Number, default: 5 },
      height: { type: Number, default: 230 }
    },
    setup(props) {
      const W = 760;
      const padL = 34;
      const padR = 12;
      const padT = 12;
      const padB = 46;
      const plotW = W - padL - padR;
      const plotH = props.height - padT - padB;
      const max = props.max;
      const groupW = plotW / (props.labels.length || 1);
      const barW = Math.min(20, (groupW * 0.56) / (props.series.length || 1));
      const bars = [];
      props.series.forEach((s, si) => {
        s.values.forEach((v, i) => {
          const h = (v / max) * plotH;
          bars.push({
            x: padL + groupW * i + groupW / 2 - (barW * props.series.length) / 2 + barW * si,
            y: padT + plotH - h,
            w: barW - 2,
            h: h,
            color: s.color
          });
        });
      });
      const ticks = [0, 1, 2, 3, 4, 5].map((i) => {
        const v = (max / 5) * i;
        return { y: padT + plotH - (v / max) * plotH, text: v };
      });
      const xLabels = props.labels.map((l, i) => ({
        x: padL + groupW * i + groupW / 2,
        text: l
      }));
      return { W, H: props.height, padL, padR, plotH, bars, ticks, xLabels, series: props.series };
    },
    template: `
      <div class="tv-chart">
        <div class="ov-legend">
          <span v-for="s in series" :key="s.name"><i :style="{ background: s.color }"></i>{{ s.name }}</span>
        </div>
        <svg class="ov-svg" :viewBox="'0 0 ' + W + ' ' + H" role="img" aria-label="评分对比">
          <g class="ov-grid">
            <line v-for="(t, i) in ticks" :key="'g' + i" :x1="padL" :x2="W - padR" :y1="t.y" :y2="t.y" />
          </g>
          <g class="ov-axis">
            <text v-for="(t, i) in ticks" :key="'y' + i" :x="padL - 7" :y="t.y + 3" text-anchor="end">{{ t.text }}</text>
          </g>
          <rect v-for="(b, i) in bars" :key="'b' + i" :x="b.x" :y="b.y" :width="b.w" :height="Math.max(b.h, 0)" :fill="b.color" rx="1" />
          <g class="ov-xaxis">
            <text v-for="(l, i) in xLabels" :key="'x' + i" :x="l.x" :y="H - 30" text-anchor="middle">{{ l.text }}</text>
          </g>
        </svg>
      </div>
    `
  };

})();
