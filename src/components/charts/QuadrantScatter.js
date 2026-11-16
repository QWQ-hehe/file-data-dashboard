/* Quadrant scatter */
(function () {
  const { ref, computed, watch, onMounted, onUnmounted, reactive, nextTick } = Vue;

  window.QuadrantScatter = {
    name: "QuadrantScatter",
    props: {
      points: { type: Array, default: () => [] },
      medianX: { type: Number, default: 0 },
      medianY: { type: Number, default: 0 },
      active: { type: String, default: "" },
      height: { type: Number, default: 300 }
    },
    setup(props) {
      const W = 760;
      const padL = 54;
      const padR = 22;
      const padT = 18;
      const padB = 46;
      const plotW = W - padL - padR;
      const plotH = props.height - padT - padB;
      const xMin = 100000;
      const xMax = 10000000;
      const yMax = 50;
      const lx = (v) => Math.log10(Math.max(v, xMin));
      const sx = (v) => padL + ((lx(v) - lx(xMin)) / (lx(xMax) - lx(xMin))) * plotW;
      const sy = (v) => padT + plotH - (v / yMax) * plotH;
      const colors = { star: "#4a7d63", dog: "#b45a55", cow: "#5f7fc0", question: "#8d94a3" };

      const dots = computed(() =>
        props.points.map((p) => ({
          name: p.name,
          cx: sx(p.x),
          cy: sy(p.y),
          color: colors[p.key] || "#8d94a3",
          dim: props.active && props.active !== p.key
        }))
      );
      const xTicks = [100000, 200000, 500000, 1000000, 2000000, 5000000, 10000000].map((v) => ({
        x: sx(v),
        text: v >= 10000 ? v / 10000 + "万" : String(v)
      }));
      const yTicks = [0, 10, 20, 30, 40, 50].map((v) => ({ y: sy(v), text: v + "%" }));
      const mx = sx(props.medianX);
      const my = sy(props.medianY);
      return { W, H: props.height, padL, plotW, plotH, dots, xTicks, yTicks, mx, my, xLine: W - padR, sy0: padT + plotH };
    },
    template: `
      <div class="tv-chart pc-scatter">
        <svg class="ov-svg" :viewBox="'0 0 ' + W + ' ' + H" role="img" aria-label="商品曝光转化四象限">
          <g class="ov-grid">
            <line v-for="(t, i) in yTicks" :key="'gy' + i" :x1="padL" :x2="xLine" :y1="t.y" :y2="t.y" />
          </g>
          <line :x1="mx" :x2="mx" :y1="padL" :y2="sy0" stroke="#d7dce5" stroke-dasharray="4 4" />
          <line :x1="padL" :x2="xLine" :y1="my" :y2="my" stroke="#d7dce5" stroke-dasharray="4 4" />
          <text class="pc-quad-label" :x="padL + 8" :y="padL + 12" fill="#5f7fc0">金牛商品</text>
          <text class="pc-quad-label" :x="xLine - 8" :y="padL + 12" text-anchor="end" fill="#4a7d63">明星产品</text>
          <text class="pc-quad-label" :x="padL + 8" :y="sy0 - 8" fill="#8d94a3">问题产品</text>
          <text class="pc-quad-label" :x="xLine - 8" :y="sy0 - 8" text-anchor="end" fill="#b45a55">瘦狗产品</text>
          <circle v-for="(d, i) in dots" :key="'d' + i" :cx="d.cx" :cy="d.cy" r="3.4" :fill="d.color" :fill-opacity="d.dim ? 0.16 : 0.82" />
          <g class="ov-axis">
            <text v-for="(t, i) in yTicks" :key="'ty' + i" :x="padL - 7" :y="t.y + 3" text-anchor="end">{{ t.text }}</text>
            <text v-for="(t, i) in xTicks" :key="'tx' + i" :x="t.x" :y="H - 24" text-anchor="middle">{{ t.text }}</text>
          </g>
          <text class="sc-axis-label" :x="padL + plotW / 2" :y="H - 4" text-anchor="middle">商品曝光人数（对数轴）</text>
          <text class="sc-axis-label" x="12" :y="padL + plotH / 2" text-anchor="middle" :transform="'rotate(-90 12 ' + (padL + plotH / 2) + ')'">商品下单率（下单人数 ÷ 加购人数）</text>
        </svg>
      </div>
    `
  };

  /* ---------- 漏斗行 ---------- */
})();
