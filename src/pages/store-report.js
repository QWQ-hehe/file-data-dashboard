/* Page: store report */
(function () {
  const { ref, computed, watch, onMounted, onUnmounted, reactive, nextTick } = Vue;

  window.StoreReportPage = {
    name: "StoreReportPage",
    components: { FlowChart: window.FlowChart, ReportDonut: window.ReportDonut, ReportRadar: window.ReportRadar },
    props: { data: Object },
    emits: ["notify"],
    setup(props, { emit }) {
      const tab = ref(props.data.tabs[0]);
      const store = ref(props.data.stores[0]);
      const platform = ref(props.data.platforms[0]);
      const date = ref(props.data.daily.date);
      const target = ref(props.data.targets[1]);

      const storeInfo = computed(() => {
        const parts = store.value.split(" · ");
        return { name: parts[0], tk: parts[1] || "" };
      });
      const cityMap = {
        "济南万象城店": "济南",
        "上海静安大悦城店": "上海",
        "深圳湾万象城店": "深圳",
        "安徽工学院店": "合肥"
      };
      /* 各门店当前有 mock 核心数据的报告类型 */
      const availMap = {
        "济南万象城店 · TK00011": ["日报"],
        "上海静安大悦城店 · TK00014": ["周报", "月报"]
      };
      const rangeMap = {
        "日报": { from: "2026-11-13", to: "2026-11-13" },
        "周报": { from: "2026-11-02", to: "2026-11-08" },
        "月报": { from: "2026-10-01", to: "2026-10-31" }
      };
      const currentRange = computed(() => rangeMap[tab.value]);
      const hasStoreData = computed(() => (availMap[store.value] || []).indexOf(tab.value) >= 0);
      const dateInRange = computed(
        () => !!date.value && date.value >= currentRange.value.from && date.value <= currentRange.value.to
      );
      const viewOk = computed(() => hasStoreData.value && dateInRange.value);
      const emptyTitle = computed(() =>
        hasStoreData.value ? "所选日期无" + tab.value + "数据" : "该门店暂无" + tab.value + "数据"
      );
      const emptySub = computed(() => {
        if (!hasStoreData.value) {
          return "「" + store.value + "」暂无" + tab.value + "有效核心数据（实收与订单均缺失），正式报告禁用下载。";
        }
        return "所选日期 " + (date.value || "（未选择）") + " 不在" + tab.value + "可导出范围（" +
          currentRange.value.from + " 至 " + currentRange.value.to + "）。";
      });

      const weekday = computed(() => {
        if (!date.value) return "";
        const d = new Date(date.value + "T00:00:00");
        if (isNaN(d.getTime())) return "";
        return "周" + "日一二三四五六".charAt(d.getDay());
      });
      const platformScope = computed(() => {
        if (platform.value !== "全部") return platform.value + "（仅展示该平台明细）";
        return tab.value === "日报" ? "全部（美团+饿了么+京东外卖）" : "全部（美团+饿了么+堂食）";
      });
      const showMeituan = computed(() => platform.value !== "饿了么");
      const showEleme = computed(() => platform.value !== "美团");
      const dailyTiles = computed(() => {
        if (platform.value === "全部") return props.data.daily.tiles;
        const drop = platform.value === "美团" ? "淘宝闪购" : "美团外卖";
        return props.data.daily.tiles.filter((t) => t.name !== drop);
      });

      /* 周报 / 月报：平台口径按 0.62 / 0.38 折算，环形图同步互斥并归一到 100% */
      const platFactor = computed(() => (platform.value === "美团" ? 0.62 : platform.value === "饿了么" ? 0.38 : 1));
      const num = (v) => Number(String(v).replace(/[^0-9.-]/g, "")) || 0;
      const fmtInt = (v) => Math.round(v).toLocaleString("en-US");
      const fmt1 = (v) => (Math.round(v * 10) / 10).toFixed(1);
      const scaleKpi = (k, i, f) => {
        if (f === 1) return k;
        if (i === 0) {
          return { ...k, value: "¥" + fmtInt(num(k.value) * f), extra: "(+" + fmt1(num(k.extra) * f) + ")" };
        }
        if (i === 1) {
          return {
            ...k,
            value: fmtInt(num(k.value) * f),
            extra: "(" + (num(k.extra) >= 0 ? "+" : "") + fmt1(num(k.extra) * f) + ")"
          };
        }
        if (i === 4) return { ...k, value: fmt1(num(k.value) * f) + "%" };
        return k;
      };
      const filterDonut = (items) => {
        if (platform.value === "全部") return items;
        const kept = items.filter(
          (it) => it.name.indexOf(platform.value) === 0 || it.name.indexOf("堂食") === 0
        );
        const sum = kept.reduce((s, it) => s + it.pct, 0) || 1;
        return kept.map((it) => {
          const pct = Math.round((it.pct / sum) * 1000) / 10;
          return { ...it, pct, name: it.name.replace(/\d+(\.\d+)?%$/, pct.toFixed(1) + "%") };
        });
      };
      const basePeriodic = computed(() => (tab.value === "周报" ? props.data.weekly : props.data.monthly));
      const periodicView = computed(() => {
        const base = basePeriodic.value;
        const f = platFactor.value;
        const kpis = base.kpis.map((k, i) => scaleKpi(k, i, f));
        let headline = base.headline;
        if (f !== 1) {
          const rest = base.headline.split("；").slice(1).join("；");
          headline = "总评（" + platform.value + "口径）：外卖总实收 " + kpis[0].value +
            "（环比 " + kpis[0].delta.replace("+", "") + "），订单 " + kpis[1].value +
            " 单（环比 " + kpis[1].delta.replace("+", "") + "）；" + rest;
        }
        return {
          ...base,
          store: storeInfo.value.name,
          city: cityMap[storeInfo.value.name] || "",
          tk: storeInfo.value.tk,
          kpis,
          headline,
          donut: filterDonut(base.donut)
        };
      });

      const targetHint = computed(() => {
        if (target.value === "查看 PDF") return "仅预览，不生成文件";
        if (target.value === "下载 PNG") return "导出 PNG 图片";
        return "导出 PDF 文件";
      });
      const reportName = computed(() => storeInfo.value.name + " · " + tab.value);
      const onTab = (t) => {
        tab.value = t;
        date.value = t === "日报" ? props.data.daily.date : t === "周报" ? "2026-11-08" : "2026-10-31";
      };
      const generate = () => emit("notify", "已按「" + reportName.value + " / " + target.value + "」生成预览（演示）");
      const download = (kind) => {
        if (!viewOk.value) return;
        emit("notify", "已下载「" + reportName.value + "」" + kind + "（报告内容：" + target.value + "，演示）");
      };

      return {
        tab, store, platform, date, target, storeInfo, viewOk, emptyTitle, emptySub,
        weekday, platformScope, showMeituan, showEleme, dailyTiles, periodicView,
        targetHint, reportName, onTab, generate, download
      };
    },
    template: `
      <div class="module-page">
        <header class="module-topbar">
          <div class="module-head-left">
            <h1 class="page-title">{{ data.title }}</h1>
            <span class="count-badge">{{ data.updatedAt }}</span>
          </div>
          <button class="bell-btn" title="通知" @click="$emit('notify', '暂无新的通知')">
            <svg class="i"><use href="#i-bell" /></svg>
          </button>
        </header>

        <div class="rp-tabs">
          <button
            v-for="t in data.tabs" :key="t"
            class="rp-tab" :class="{ on: tab === t }"
            @click="onTab(t)">{{ t }}</button>
        </div>

        <div class="rp-filter">
          <div class="rp-field">
            <label>门店名 / TK 搜索，重名以 TK 区分</label>
            <select class="f-select w220" v-model="store">
              <option v-for="s in data.stores" :key="s">{{ s }}</option>
            </select>
          </div>
          <div class="rp-field">
            <label>{{ tab === '日报' ? '经营日期' : '统计周期' }}</label>
            <input class="dl-date" type="date" v-model="date" />
          </div>
          <div class="rp-field">
            <label>平台</label>
            <select class="f-select w120" v-model="platform">
              <option v-for="p in data.platforms" :key="p">{{ p }}</option>
            </select>
          </div>
          <div class="rp-field">
            <label>报告内容</label>
            <select class="f-select w120" v-model="target">
              <option v-for="t in data.targets" :key="t">{{ t }}</option>
            </select>
          </div>
          <div class="rp-actions">
            <button class="btn btn-primary" @click="generate">生成预览</button>
            <button class="btn btn-ghost" :disabled="!viewOk" @click="download('PDF')">下载 PDF</button>
            <button class="btn btn-ghost" :disabled="!viewOk" @click="download('PNG')">下载 PNG</button>
          </div>
        </div>
        <div class="rp-notes">
          <span v-for="n in data.notes" :key="n">{{ n }}</span>
          <span class="rp-target">报告内容：{{ target }} · {{ targetHint }}</span>
        </div>

        <div class="ov-scroll">
          <div class="rp-empty empty-state" v-if="!viewOk">
            <div class="empty-title">{{ emptyTitle }}</div>
            <div class="empty-sub">{{ emptySub }}</div>
          </div>

          <!-- 日报 -->
          <div class="rp-sheet" v-else-if="tab === '日报'">
            <div class="rp-band">
              <span class="rp-brand">泰柯</span>
              <b>门店经营日报</b>
              <span class="rp-band-date">{{ date }}</span>
            </div>
            <div class="rp-meta">
              门店：{{ storeInfo.name }}（{{ storeInfo.tk }}）· 经营日期：{{ date }}（{{ weekday }}）· 平台范围：{{ platformScope }}
            </div>

            <div class="rp-sum-grid">
              <div class="rp-sum" v-for="s in data.daily.summary" :key="s.label">
                <div class="rp-sum-label">{{ s.label }} <svg class="i i-12"><use href="#i-info" /></svg></div>
                <div class="rp-sum-value">{{ s.value }}</div>
                <div class="rp-sum-lines">
                  <span v-for="l in s.lines" :key="l[0]"><em>{{ l[0] }}</em> {{ l[1] }}</span>
                </div>
                <div class="rp-sum-month">
                  <span class="muted-text">{{ s.monthLabel }}</span>
                  <b>{{ s.monthValue }}</b>
                  <span class="rp-sum-note">{{ s.monthNote }}</span>
                </div>
              </div>

              <div class="rp-sum">
                <div class="rp-sum-label">{{ data.daily.cost.label }} <svg class="i i-12"><use href="#i-info" /></svg></div>
                <div class="rp-kv" v-for="r in data.daily.cost.rows" :key="r[0]">
                  <span>{{ r[0] }}</span><b>{{ r[1] }}</b>
                </div>
                <div class="rp-sum-note">{{ data.daily.cost.note }}</div>
              </div>
            </div>

            <div class="rp-tiles">
              <div class="rp-tile" v-for="t in dailyTiles" :key="t.name">
                <div class="rp-tile-name">{{ t.name }}</div>
                <div class="rp-tile-top">
                  <span v-for="x in t.today" :key="x[0]">{{ x[0] }} <b>{{ x[1] }}</b></span>
                </div>
                <div class="rp-tile-month">
                  <span v-for="x in t.month" :key="x[0]"><em>{{ x[0] }}</em><b>{{ x[1] }}</b></span>
                </div>
              </div>
            </div>

            <div class="rp-row3">
              <div class="rp-box">
                <div class="rp-box-title">外卖畅销 TOP5</div>
                <table class="rp-tbl">
                  <thead><tr><th>商品</th><th>销量</th><th>销售额</th></tr></thead>
                  <tbody>
                    <tr v-for="(p, i) in data.daily.top5" :key="p.name">
                      <td class="cell-name">{{ i + 1 }}. {{ p.name }}</td>
                      <td>{{ p.qty }}</td>
                      <td>{{ p.amount }}</td>
                    </tr>
                  </tbody>
                </table>
              </div>
              <div class="rp-box" v-if="showMeituan">
                <div class="rp-box-title">{{ data.daily.funnels.meituan.label }}</div>
                <div class="rp-funnel">
                  <div class="rp-funnel-side">
                    <span>入店转化<b>{{ data.daily.funnels.meituan.visitRate }}</b></span>
                    <span>下单转化<b>{{ data.daily.funnels.meituan.orderRate }}</b></span>
                  </div>
                  <div class="rp-funnel-body">
                    <div class="rp-step s1"><span>曝光人数</span><b>{{ data.daily.funnels.meituan.exposure }} 人</b></div>
                    <div class="rp-step s2"><span>入店人数</span><b>{{ data.daily.funnels.meituan.visit }} 人</b></div>
                    <div class="rp-step s3"><span>下单人数</span><b>{{ data.daily.funnels.meituan.order }} 人</b></div>
                  </div>
                </div>
              </div>
              <div class="rp-box" v-if="showEleme">
                <div class="rp-box-title">{{ data.daily.funnels.eleme.label }}</div>
                <div class="rp-funnel">
                  <div class="rp-funnel-side">
                    <span>入店转化<b>{{ data.daily.funnels.eleme.visitRate }}</b></span>
                    <span>下单转化<b>{{ data.daily.funnels.eleme.orderRate }}</b></span>
                  </div>
                  <div class="rp-funnel-body">
                    <div class="rp-step s1"><span>曝光人数</span><b>{{ data.daily.funnels.eleme.exposure }} 人</b></div>
                    <div class="rp-step s2"><span>入店人数</span><b>{{ data.daily.funnels.eleme.visit }} 人</b></div>
                    <div class="rp-step s3"><span>下单人数</span><b>{{ data.daily.funnels.eleme.order }} 人</b></div>
                  </div>
                </div>
              </div>
            </div>

            <div class="rp-row4">
              <div class="rp-box">
                <div class="rp-box-title">订单时间构成</div>
                <div class="rp-hours">
                  <div class="rp-hour" v-for="h in data.daily.hours" :key="h.slot">
                    <span>{{ h.slot }}</span>
                    <em class="rp-hour-track"><i :style="{ width: h.pct * 3 + '%' }"></i></em>
                    <b>{{ h.pct }}%</b>
                  </div>
                </div>
              </div>
              <div class="rp-box">
                <div class="rp-box-title">基本面情况</div>
                <template v-if="showMeituan">
                  <div class="rp-sub">美团</div>
                  <div class="rp-kv" v-for="r in data.daily.basics.meituan" :key="r[0]"><span>{{ r[0] }}</span><b>{{ r[1] }}</b></div>
                </template>
                <template v-if="showEleme">
                  <div class="rp-sub">饿了么</div>
                  <div class="rp-kv" v-for="r in data.daily.basics.eleme" :key="r[0]"><span>{{ r[0] }}</span><b>{{ r[1] }}</b></div>
                </template>
              </div>
              <div class="rp-box">
                <div class="rp-box-title">新增中差评</div>
                <div class="rp-kv" v-if="showMeituan"><span>美团</span><b>{{ data.daily.reviews.meituan }}</b></div>
                <div class="rp-kv" v-if="showEleme"><span>饿了么</span><b>{{ data.daily.reviews.eleme }}</b></div>
              </div>
              <div class="rp-box">
                <div class="rp-box-title">历史最高 · 单日实收</div>
                <div class="rp-muted">{{ data.daily.record.date }}</div>
                <div class="rp-record">{{ data.daily.record.value }}</div>
              </div>
            </div>

            <div class="rp-focus">{{ data.daily.focus }}</div>
          </div>

          <!-- 周报 / 月报 -->
          <div class="rp-sheet" v-else>
            <div class="rp-doc-head">
              <div>
                <h2>{{ periodicView.store }} <span>{{ periodicView.city }} · {{ periodicView.tk }}</span></h2>
                <div class="rp-window">统计窗口：{{ periodicView.tabLabel }} · {{ periodicView.period }} · 平台范围：{{ platformScope }}</div>
              </div>
              <span class="rp-status">经营状态：{{ periodicView.status }}</span>
            </div>
            <p class="rp-headline">{{ periodicView.headline }}</p>

            <div class="rp-kpi5">
              <div class="rp-kpi" v-for="k in periodicView.kpis" :key="k.label">
                <div class="rp-kpi-label">{{ k.label }}</div>
                <div class="rp-kpi-value">{{ k.value }}</div>
                <div class="rp-kpi-foot" :class="k.dir">较前期 {{ k.dir === 'up' ? '▲' : '▼' }} {{ k.delta }} <em>{{ k.extra }}</em></div>
              </div>
            </div>

            <div class="rp-row2 wide">
              <div class="rp-box">
                <div class="rp-box-title">有数据渠道实收占比</div>
                <div class="rp-donut-wrap">
                  <report-donut :items="periodicView.donut" :size="150" />
                  <div class="rp-legend">
                    <div v-for="d in periodicView.donut" :key="d.name">
                      <i class="dot" :style="{ background: d.color }"></i>{{ d.name }}
                    </div>
                  </div>
                </div>
              </div>
              <div class="rp-box">
                <div class="rp-box-title">外卖收入与订单趋势</div>
                <flow-chart
                  :labels="periodicView.trend.labels"
                  :bars="periodicView.trend.bars"
                  :lines="[{ name: periodicView.trend.line.name, color: periodicView.trend.line.color, values: periodicView.trend.line.values, axis: 'right', fmt: 'num' }]"
                  :height="200" />
                <div class="rp-foot">左轴：收入（元） · 右轴：有效订单（单）</div>
              </div>
            </div>

            <div class="rp-box">
              <div class="rp-box-title">① 指标全览 · 雷达（越外圈越好，50 = 授权门店中位）</div>
              <div class="rp-radar-wrap">
                <report-radar
                  :dims="periodicView.radar.dims"
                  :mine="periodicView.radar.mine"
                  :median="periodicView.radar.median"
                  :prev="periodicView.radar.prev" />
                <div class="rp-legend rp-legend-col">
                  <div><i class="dot" style="background:#5b77b8"></i>本期</div>
                  <div><i class="dot" style="background:#c8cedb"></i>授权门店中位（50）</div>
                  <div><i class="dot" style="background:#d9b98a"></i>上期</div>
                </div>
              </div>
            </div>

            <div class="rp-box">
              <div class="rp-box-title">② 维度对比</div>
              <table class="rp-tbl rp-cmp">
                <thead>
                  <tr><th>指标</th><th>上期</th><th>本期</th><th>环比上期</th><th>授权门店参考值</th><th>对比参考值</th><th>灯</th></tr>
                </thead>
                <tbody>
                  <tr v-for="r in periodicView.compare" :key="r[0]">
                    <td class="cell-name">{{ r[0] }}</td>
                    <td>{{ r[1] }}</td>
                    <td>{{ r[2] }}</td>
                    <td>{{ r[3] }}</td>
                    <td>{{ r[4] }}</td>
                    <td>{{ r[5] }}</td>
                    <td><i class="rp-dot" :class="r[6]"></i></td>
                  </tr>
                </tbody>
              </table>
            </div>

            <div class="rp-row2">
              <div class="rp-box" v-if="showMeituan">
                <div class="rp-box-title">③ 多米诺漏斗 · {{ periodicView.funnels.meituan.label }}</div>
                <div class="rp-funnel">
                  <div class="rp-funnel-side">
                    <span>入店转化<b>{{ periodicView.funnels.meituan.visitRate }}</b></span>
                    <span>下单转化<b>{{ periodicView.funnels.meituan.orderRate }}</b></span>
                  </div>
                  <div class="rp-funnel-body">
                    <div class="rp-step s1"><span>曝光人数</span><b>{{ periodicView.funnels.meituan.exposure }} 人</b></div>
                    <div class="rp-step s2"><span>入店人数</span><b>{{ periodicView.funnels.meituan.visit }} 人</b></div>
                    <div class="rp-step s3"><span>下单人数</span><b>{{ periodicView.funnels.meituan.order }} 人</b></div>
                  </div>
                </div>
              </div>
              <div class="rp-box" v-if="showEleme">
                <div class="rp-box-title">④ 多米诺漏斗 · {{ periodicView.funnels.eleme.label }}</div>
                <div class="rp-funnel">
                  <div class="rp-funnel-side">
                    <span>入店转化<b>{{ periodicView.funnels.eleme.visitRate }}</b></span>
                    <span>下单转化<b>{{ periodicView.funnels.eleme.orderRate }}</b></span>
                  </div>
                  <div class="rp-funnel-body">
                    <div class="rp-step s1"><span>曝光人数</span><b>{{ periodicView.funnels.eleme.exposure }} 人</b></div>
                    <div class="rp-step s2"><span>入店人数</span><b>{{ periodicView.funnels.eleme.visit }} 人</b></div>
                    <div class="rp-step s3"><span>下单人数</span><b>{{ periodicView.funnels.eleme.order }} 人</b></div>
                  </div>
                </div>
              </div>
            </div>

            <div class="rp-row2">
              <div class="rp-box" v-if="showMeituan">
                <div class="rp-box-title">门店评分 · 美团</div>
                <div class="rp-score">
                  <b>{{ periodicView.score.meituan.score }}</b><span>/ {{ periodicView.score.meituan.total }}</span>
                  <em>共 {{ periodicView.score.meituan.count }}</em>
                </div>
                <div class="rp-kv" v-for="r in periodicView.score.meituan.items" :key="r[0]"><span>{{ r[0] }}</span><b>{{ r[1] }}</b></div>
              </div>
              <div class="rp-box" v-if="showEleme">
                <div class="rp-box-title">门店评分 · 饿了么</div>
                <div class="rp-score">
                  <b>{{ periodicView.score.eleme.score }}</b><span>/ {{ periodicView.score.eleme.total }}</span>
                  <em>共 {{ periodicView.score.eleme.count }}</em>
                </div>
                <div class="rp-kv" v-for="r in periodicView.score.eleme.items" :key="r[0]"><span>{{ r[0] }}</span><b>{{ r[1] }}</b></div>
              </div>
            </div>

            <div class="rp-box rp-diag">
              <div class="rp-box-title">⑤ 诊断结论</div>
              <div class="rp-diag-row" v-for="(d, i) in periodicView.diagnosis" :key="i">
                <span class="rp-diag-no">{{ i + 1 }}</span>
                <span>{{ d }}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    `
  };
})();
