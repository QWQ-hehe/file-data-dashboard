/* Page: data download */
(function () {
  const { ref, computed, watch, onMounted, onUnmounted, reactive, nextTick } = Vue;

  window.DataDownloadPage = {
    name: "DataDownloadPage",
    props: { data: Object },
    emits: ["notify"],
    setup(props, { emit }) {
      const report = ref(props.data.reportTypes[0]);
      const platform = ref(props.data.platforms[0]);
      const start = ref(props.data.dateStart);
      const end = ref(props.data.dateEnd);
      const tk = ref("");
      const fields = ref(props.data.fields.map((f) => ({ ...f })));
      const checkedCount = computed(() => fields.value.filter((f) => f.on).length);
      const selectAll = (val) => fields.value.forEach((f) => (f.on = val));

      const allPlatform = props.data.platforms[0];
      const maxDays = parseInt(props.data.days, 10) || 400;
      const dayMs = 24 * 60 * 60 * 1000;

      /* 日期窗口：开始/结束必须完整、先后有序、跨度不超过 400 天 */
      const spanDays = computed(() => {
        const a = Date.parse(start.value);
        const b = Date.parse(end.value);
        if (isNaN(a) || isNaN(b) || b < a) return 0;
        return Math.round((b - a) / dayMs) + 1;
      });
      const dateError = computed(() => {
        if (!start.value || !end.value) return "请选择完整的开始与结束日期";
        const a = Date.parse(start.value);
        const b = Date.parse(end.value);
        if (isNaN(a) || isNaN(b)) return "日期格式无效，请重新选择";
        if (a > b) return "开始日期不能晚于结束日期";
        if (spanDays.value > maxDays) return "日期跨度 " + spanDays.value + " 天，超过单次上限 " + maxDays + " 天";
        return "";
      });

      /* 报表与平台的兼容范围 */
      const reportPlatformMap = {
        "美团门店日报": ["全部", "美团"],
        "饿了么门店日报": ["全部", "饿了么"],
        "全平台门店日报": ["全部", "美团", "饿了么"],
        "门店月报": ["全部", "美团", "饿了么"]
      };
      const reportPlatformOk = computed(() => {
        const allowed = reportPlatformMap[report.value];
        return !allowed || allowed.indexOf(platform.value) >= 0;
      });
      const reportPlatformError = computed(() =>
        reportPlatformOk.value ? "" : "「" + report.value + "」不支持「" + platform.value + "」平台，请调整报表或平台"
      );

      /* XXX 编码：逗号 / 换行 / 空格分隔，去重并校验 XXX+数字 */
      const tkList = computed(() => {
        const seen = {};
        const list = [];
        tk.value
          .split(/[\s,，;；]+/)
          .filter(Boolean)
          .forEach((t) => {
            const v = t.toUpperCase();
            if (!seen[v]) {
              seen[v] = true;
              list.push(v);
            }
          });
        return list;
      });
      const badTk = computed(() => tkList.value.filter((t) => !/^XXX\d+$/.test(t)));
      const tkMeta = computed(() => {
        if (!tkList.value.length) return "留空为全部门店（包含未对应门店）";
        if (badTk.value.length) {
          return "已识别 " + tkList.value.length + " 个编码，其中 " + badTk.value.length +
            " 个格式不符：" + badTk.value.slice(0, 5).join("、");
        }
        const shown = tkList.value.slice(0, 6).join("、");
        return "已识别 " + tkList.value.length + " 个编码：" + shown + (tkList.value.length > 6 ? " 等" : "");
      });

      const canExport = computed(
        () => !dateError.value && reportPlatformOk.value && checkedCount.value > 0 && badTk.value.length === 0
      );
      const emptyTitle = computed(() => {
        if (dateError.value) return "当前日期条件不可导出";
        if (!reportPlatformOk.value) return "报表与平台不匹配";
        if (badTk.value.length) return "XXX 编码格式有误";
        if (checkedCount.value === 0) return "未选择导出字段";
        return "";
      });
      const emptySub = computed(() => {
        if (dateError.value) return dateError.value;
        if (!reportPlatformOk.value) return reportPlatformError.value;
        if (badTk.value.length) return "XXX 编码需形如 XXX00169，多个用逗号或换行分隔";
        if (checkedCount.value === 0) return "至少勾选 1 个导出字段后才能下载 CSV";
        return "";
      });

      const exportName = computed(() => {
        const plat = platform.value === allPlatform ? "全平台" : platform.value;
        const range = start.value === end.value ? start.value : start.value + "_" + end.value;
        const tkPart = tkList.value.length ? "_" + tkList.value.length + "个XXX" : "";
        return report.value + "_" + plat + "_" + range + tkPart + ".csv";
      });
      const exportHint = computed(() =>
        canExport.value
          ? "共 " + checkedCount.value + " 个字段 · " + spanDays.value + " 天 · " +
            (tkList.value.length ? tkList.value.length + " 个 XXX" : "全部门店") + "（演示，不产生真实文件）"
          : "修正上方条件后可导出"
      );
      const doExport = () => {
        if (!canExport.value) return;
        emit("notify", "已开始导出「" + exportName.value + "」（演示）");
      };

      return {
        report, platform, start, end, tk, fields, checkedCount, selectAll,
        maxDays, spanDays, dateError, reportPlatformOk, reportPlatformError,
        tkList, badTk, tkMeta, canExport, emptyTitle, emptySub, exportName, exportHint, doExport
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

        <div class="ov-scroll">
          <section class="ov-card">
            <div class="ov-card-head">
              <h3 class="ov-card-title">{{ data.cardTitle }}</h3>
              <span class="muted-text">单次最多 {{ data.rows }} 行 · {{ data.days }} 天</span>
            </div>
            <p class="dl-desc">{{ data.desc }}</p>

            <div class="dl-filters">
              <div class="dl-field">
                <label>报表</label>
                <select class="f-select w160" v-model="report">
                  <option v-for="r in data.reportTypes" :key="r">{{ r }}</option>
                </select>
              </div>
              <div class="dl-field">
                <label>平台</label>
                <select class="f-select w130" v-model="platform">
                  <option v-for="p in data.platforms" :key="p">{{ p }}</option>
                </select>
              </div>
              <div class="dl-field">
                <label>开始日期</label>
                <input class="dl-date" type="date" v-model="start" />
              </div>
              <div class="dl-field">
                <label>结束日期</label>
                <input class="dl-date" type="date" v-model="end" />
              </div>
            </div>
            <div class="dl-range" :class="{ err: !!dateError }">
              {{ dateError || '已选 ' + spanDays + ' 天，单次最多 ' + maxDays + ' 天' }}
            </div>

            <div class="dl-tk">
              <label>{{ data.tkLabel }}</label>
              <textarea class="dl-textarea" rows="2" v-model="tk" :placeholder="data.tkPlaceholder"></textarea>
              <span class="dl-tk-meta" :class="{ err: badTk.length > 0 }">{{ tkMeta }}</span>
            </div>

            <div class="dl-fields">
              <div class="dl-fields-head">
                <b>导出字段</b>
                <span class="muted-text" :class="{ 'dl-zero': checkedCount === 0 }">已选 {{ checkedCount }} / {{ fields.length }} 项</span>
                <span class="toolbar-spacer"></span>
                <a class="dl-link" @click="selectAll(true)">全选</a>
                <a class="dl-link" @click="selectAll(false)">清空</a>
              </div>
              <div class="dl-check-grid">
                <label class="dl-check" v-for="f in fields" :key="f.label">
                  <input type="checkbox" v-model="f.on" />
                  <span>{{ f.label }}</span>
                </label>
              </div>
            </div>

            <div class="dl-actions">
              <button class="btn btn-primary" :disabled="!canExport" @click="doExport">
                {{ canExport ? '下载 CSV' : '条件未就绪' }}
              </button>
              <span class="muted-text" v-if="canExport">导出为 UTF-8 CSV，缺失字段以 \\N 占位</span>
              <span class="muted-text" v-else>{{ emptySub }}</span>
            </div>

            <div class="dl-preview" v-if="canExport">
              <span class="dl-file">{{ exportName }}</span>
              <span class="muted-text">{{ exportHint }}</span>
            </div>
            <div class="dl-empty empty-state" v-else>
              <div class="empty-title">{{ emptyTitle }}</div>
              <div class="empty-sub">{{ emptySub }}</div>
            </div>
          </section>
        </div>
      </div>
    `
  };

  /* ---------- 报告内的小环形图 / 雷达图（原生 SVG） ---------- */
})();
