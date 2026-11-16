/* Stat cards */
(function () {
  const { ref } = Vue;

  window.StatCards = {
    name: "StatCards",
    props: { stats: Object },
    emits: ["notify"],
    template: `
      <section class="stats">
        <article class="stat-card accent-blue">
          <div class="stat-label">{{ stats.revenue.label }}</div>
          <div class="stat-value">
            <span class="currency">¥</span><span class="dash">{{ stats.revenue.value }}</span>
          </div>
          <div class="stat-chips">
            <span class="chip" v-for="(c, i) in stats.revenue.chips" :key="i">
              {{ c.prefix }} <b>{{ c.value }}</b> <i>{{ c.note }}</i>
            </span>
          </div>
        </article>

        <article class="stat-card accent-amber">
          <div class="stat-label">{{ stats.alerts.label }}</div>
          <div class="alert-metrics">
            <div class="alert-cell" v-for="item in stats.alerts.items" :key="item.label">
              <div class="alert-num" :class="item.tone">{{ item.value }}</div>
              <div class="alert-cap">{{ item.label }}</div>
            </div>
          </div>
          <div class="alert-foot">
            <a class="text-link" @click="$emit('notify', '异常构成：优惠力不足 7 · 评分下滑 6 · 曝光下降 5')">
              <span class="caret">▸</span>{{ stats.alerts.link }}
            </a>
            <span>{{ stats.alerts.foot }}</span>
          </div>
        </article>

        <article class="stat-card accent-red">
          <div class="stat-label">{{ stats.trafficLight.label }}</div>
          <div class="stat-period">{{ stats.trafficLight.period }}</div>
          <div class="traffic-bar">
            <span class="seg-red" :style="{ flex: stats.trafficLight.counts.red }"></span>
            <span class="seg-amber" :style="{ flex: stats.trafficLight.counts.amber }"></span>
            <span class="seg-green" :style="{ flex: stats.trafficLight.counts.green }"></span>
          </div>
          <div class="traffic-legend">
            <span><i class="dot" style="background:#c4554f"></i>红 <b>{{ stats.trafficLight.counts.red }}</b></span>
            <span><i class="dot" style="background:#d8a63c"></i>黄 <b>{{ stats.trafficLight.counts.amber }}</b></span>
            <span><i class="dot" style="background:#2f7d63"></i>绿 <b>{{ stats.trafficLight.counts.green }}</b></span>
          </div>
        </article>
      </section>
    `
  };

})();
