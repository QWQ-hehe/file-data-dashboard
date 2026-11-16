/* Shared SVG axis helpers */
(function () {
  const niceMax = (m) => {
    if (!m) return 1;
    const p = Math.pow(10, Math.floor(Math.log10(m)));
    const n = m / p;
    const steps = [1, 1.2, 1.5, 2, 2.5, 3, 4, 5, 6, 8, 10];
    for (let i = 0; i < steps.length; i++) if (n <= steps[i]) return steps[i] * p;
    return 10 * p;
  };

  const axisText = (v, kind) => {
    if (kind === "pct") return (Math.round(v * 10) / 10) + "%";
    if (kind === "wan") return (Math.round(v * 10) / 10) + "万";
    if (kind === "money") {
      if (v >= 10000) return "¥" + (v / 10000).toFixed(1) + "万";
      return "¥" + Math.round(v);
    }
    if (v >= 10000) return (v / 10000).toFixed(v % 10000 === 0 ? 0 : 1) + "万";
    if (v >= 1000) return (v / 1000).toFixed(0) + "k";
    return String(Math.round(v * 10) / 10);
  };

  window.niceMax = niceMax;
  window.axisText = axisText;
})();
