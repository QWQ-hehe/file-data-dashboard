/* Page: store relation */
(function () {
  const { ref, computed, watch, onMounted, onUnmounted, reactive, nextTick } = Vue;

  window.StoreRelationPage = {
    name: "StoreRelationPage",
    props: { data: Object, tab: String },
    emits: ["change", "notify"],
    setup(props, { emit }) {
      const baseStores = (props.data.stores || []).map((s) => ({ ...s }));
      const baseIds = baseStores.map((s) => s.id);
      const baseColumns = (props.data.columns || []).map((c) => ({ ...c }));

      const stores = ref(baseStores);
      const columns = ref(baseColumns);
      const dynamicFields = ref([]);
      const storageMode = ref("local");
      const saving = ref(false);

      const keyword = ref("");
      const checked = ref([]);
      const filters = reactive({});
      const openFilter = ref("");
      (props.data.filterFields || []).forEach((f) => { filters[f.key] = []; });

      const aKeyword = ref("");
      const aFilters = reactive({ province: [], operator: [] });
      const aOpenFilter = ref("");

      /* ---------- 弹窗状态 ---------- */
      const dialog = ref("");
      const formError = ref("");
      const form = reactive({});
      const fieldForm = reactive({ label: "", type: "text" });
      const batchForm = reactive({});
      const editId = ref("");
      const clearAllDialog = ref(false);
      const resetDialog = ref(false);

      /* ---------- 活动配置状态 ---------- */
      const actConfig = ref({});
      const actChecked = ref([]);
      const actDialog = ref("");
      const actForm = reactive({});
      const actStoreId = ref("");
      const actError = ref("");
      const actSaving = ref(false);
      const actOptions = ref({});
      const actOptAct = ref("delivery");
      const actNewOption = ref("");
      const actReturn = ref("");
      const actFilter = ref("");
      const actFields = ref([]);
      const actFieldDialog = ref(false);
      const actFieldForm = reactive({ label: "", type: "text" });
      const actFieldError = ref("");
      const actClearDialog = ref(false);

      const batchKeys = ["province", "city", "age", "operator", "modeM", "modeE", "status", "remark", "brand", "mFee", "eFee"];
      const batchFields = computed(() =>
        batchKeys.map((k) => columns.value.find((c) => c.key === k) || { key: k, label: k, type: "text" })
      );

      const badgeText = computed(() => {
        const added = stores.value.filter((s) => baseIds.indexOf(s.id) < 0).length;
        return "共 " + stores.value.length + " 家（门店关系映射表 " + baseIds.length + " · 本机新增 " + added + "）";
      });

      /* ---------- 通用：多关键词搜索 + 多选筛选 ---------- */
      const splitTerms = (kw) =>
        String(kw || "").split(/[,，]/).map((t) => t.trim().toLowerCase()).filter(Boolean);
      const splitTags = (v) =>
        String(v || "").split(/[,，]/).map((t) => t.trim()).filter(Boolean);
      const matchTerms = (terms, fields) =>
        !terms.length ||
        terms.some((t) =>
          fields.some((f) => String(f == null ? "" : f).toLowerCase().includes(t))
        );
      const matchFilters = (s, map) =>
        Object.keys(map).every((key) => {
          const sel = map[key] || [];
          if (!sel.length) return true;
          if (key === "tags") return splitTags(s.tags).some((t) => sel.indexOf(t) >= 0);
          return sel.indexOf(String(s[key] == null ? "" : s[key]).trim()) >= 0;
        });
      const filterOptions = (key, source) => {
        const vals = [];
        (source || stores.value).forEach((s) => {
          if (key === "tags") {
            splitTags(s.tags).forEach((t) => { if (vals.indexOf(t) < 0) vals.push(t); });
          } else {
            const v = String(s[key] == null ? "" : s[key]).trim();
            if (v && vals.indexOf(v) < 0) vals.push(v);
          }
        });
        return vals;
      };
      const toggleFilterMenu = (key) => {
        openFilter.value = openFilter.value === key ? "" : key;
        aOpenFilter.value = "";
      };
      const toggleAFilterMenu = (key) => {
        aOpenFilter.value = aOpenFilter.value === key ? "" : key;
        openFilter.value = "";
      };
      const removeFilter = (key, v) => {
        filters[key] = filters[key].filter((x) => x !== v);
      };
      const removeAFilter = (key, v) => {
        aFilters[key] = aFilters[key].filter((x) => x !== v);
      };
      const clearFilters = () => {
        Object.keys(filters).forEach((k) => (filters[k] = []));
      };
      const clearAFilters = () => {
        aFilters.province = [];
        aFilters.operator = [];
      };
      const closeMenus = () => {
        openFilter.value = "";
        aOpenFilter.value = "";
      };
      const hasStoreFilter = computed(() => Object.keys(filters).some((k) => filters[k].length));
      const hasActFilter = computed(
        () => aFilters.province.length > 0 || aFilters.operator.length > 0
      );

      const list = computed(() => {
        const terms = splitTerms(keyword.value);
        return stores.value.filter((s) => {
          const hitKeyword = matchTerms(terms, [
            s.name, s.brandCode, s.city, s.meituan, s.eleme, s.operator, s.tags
          ]);
          return hitKeyword && matchFilters(s, filters);
        });
      });

      const allChecked = computed({
        get: () =>
          list.value.length > 0 && list.value.every((s) => checked.value.includes(s.id)),
        set: (on) => {
          const ids = list.value.map((s) => s.id);
          if (on) checked.value = Array.from(new Set(checked.value.concat(ids)));
          else checked.value = checked.value.filter((id) => !ids.includes(id));
        }
      });

      const activityList = computed(() =>
        stores.value.filter((s) => {
          const terms = splitTerms(aKeyword.value);
          const hitK = matchTerms(terms, [s.name, s.brandCode]);
          const hitFilters = matchFilters(s, aFilters);
          const cfg = actConfig.value[s.id] || {};
          const filled = (id) => String(cfg[id] == null ? "" : cfg[id]).trim() !== "";
          const hitChip =
            !actFilter.value ||
            (actFilter.value === "any"
              ? Object.keys(cfg).some((id) => filled(id))
              : filled(actFilter.value));
          return hitK && hitFilters && hitChip;
        })
      );

      /* ---------- 活动配置：文本值统计与选项 ---------- */
      const actVal = (s, actId) => {
        const cfg = actConfig.value[s.id];
        const v = cfg && cfg[actId];
        return v == null ? "" : String(v).trim();
      };
      const configuredCount = computed(
        () =>
          activityList.value.filter((s) => {
            const cfg = actConfig.value[s.id];
            if (!cfg) return false;
            return Object.keys(cfg).some((k) => String(cfg[k] == null ? "" : cfg[k]).trim() !== "");
          }).length
      );
      const actCount = (actId) => activityList.value.filter((s) => !!actVal(s, actId)).length;

      /* 九类固定活动 + 自定义字段，供表格与编辑/批量弹窗共用 */
      const actAllFields = computed(() =>
        props.data.activities
          .map((a) => ({ id: a.id, label: a.label }))
          .concat(actFields.value.map((f) => ({ id: f.key, label: f.label, dynamic: true })))
      );

      const openActField = () => {
        actFieldForm.label = "";
        actFieldForm.type = "text";
        actFieldError.value = "";
        actFieldDialog.value = true;
      };

      const saveActField = async () => {
        const label = String(actFieldForm.label || "").trim();
        if (!label) {
          actFieldError.value = "字段名必填";
          return;
        }
        if (actAllFields.value.some((f) => f.label === label)) {
          actFieldError.value = "字段名「" + label + "」已存在";
          return;
        }
        const key = "cf_" + Date.now().toString(36);
        const type = actFieldForm.type || "text";
        actFields.value.push({ key: key, label: label, type: type });
        const r = await StoreRepo.addActivityField({ key: key, label: label, type: type }, actFields.value);
        actFieldDialog.value = false;
        emit("notify", "已新增字段「" + label + "」" + (r.mode === "api" ? "（已写入数据库）" : "（已保存到本机）"));
      };

      const actOptionList = (actId) => actOptions.value[actId] || [];
      const pickActOption = (actId, e) => {
        const v = e && e.target ? e.target.value : "";
        if (v) actForm[actId] = v;
        if (e && e.target) e.target.value = "";
      };

      /* 点击顶部标签筛选：单个标签互斥，再次点击取消 */
      const toggleActFilter = (id) => {
        actFilter.value = actFilter.value === id ? "" : id;
        const ids = activityList.value.map((s) => s.id);
        actChecked.value = actChecked.value.filter((sid) => ids.indexOf(sid) >= 0);
      };

      /* 批量弹窗：点击已填写的行标题可取消该项 */
      const actFilled = (id) => String(actForm[id] == null ? "" : actForm[id]).trim() !== "";
      const clearBatchField = (key) => { batchForm[key] = ""; };
      const clearActField = (id) => { actForm[id] = ""; };

      const actAllChecked = computed({
        get: () =>
          activityList.value.length > 0 &&
          activityList.value.every((s) => actChecked.value.includes(s.id)),
        set: (on) => {
          const ids = activityList.value.map((s) => s.id);
          if (on) actChecked.value = Array.from(new Set(actChecked.value.concat(ids)));
          else actChecked.value = actChecked.value.filter((id) => !ids.includes(id));
        }
      });

      const actDialogTitle = computed(() => {
        if (actDialog.value === "act-batch") return "批量设置活动（已选 " + actChecked.value.length + " 家）";
        if (actDialog.value === "act-options") return "配置活动选项";
        if (actDialog.value === "act-edit") {
          const s = stores.value.find((x) => x.id === actStoreId.value);
          return "编辑活动配置" + (s ? " · " + s.name : "");
        }
        return "";
      });

      const buildActRecord = (s) => ({
        store_id: s.id,
        brand_code: s.brandCode || "",
        store_name: s.name || "",
        city: s.city || "",
        operator: s.operator || "",
        ops: s.operator || "",
        activities: Object.assign({}, actConfig.value[s.id] || {})
      });

      const persistActs = async (rows) => {
        actSaving.value = true;
        const r = await StoreRepo.saveActivity(rows.map(buildActRecord), actConfig.value);
        actSaving.value = false;
        return r;
      };

      const openActBatch = () => {
        Object.keys(actForm).forEach((k) => delete actForm[k]);
        actAllFields.value.forEach((a) => (actForm[a.id] = ""));
        actError.value = "";
        actDialog.value = "act-batch";
      };

      const openActEdit = (s) => {
        Object.keys(actForm).forEach((k) => delete actForm[k]);
        actAllFields.value.forEach((a) => (actForm[a.id] = actVal(s, a.id)));
        actStoreId.value = s.id;
        actError.value = "";
        actDialog.value = "act-edit";
      };

      /* ---------- 活动选项维护 ---------- */
      const openActOptions = () => {
        actReturn.value =
          actDialog.value === "act-edit" || actDialog.value === "act-batch" ? actDialog.value : "";
        if (!props.data.activities.some((a) => a.id === actOptAct.value)) {
          actOptAct.value = props.data.activities[0].id;
        }
        actNewOption.value = "";
        actError.value = "";
        actDialog.value = "act-options";
      };

      const closeActOptions = () => {
        actDialog.value = actReturn.value || "";
        actError.value = "";
      };

      const persistActOptions = async () => {
        const r = await StoreRepo.saveActivityOptions(actOptions.value);
        return r;
      };

      const addActOption = async () => {
        const text = String(actNewOption.value || "").trim();
        if (!text) {
          actError.value = "请填写选项内容";
          return;
        }
        const aid = actOptAct.value;
        const arr = (actOptions.value[aid] || []).slice();
        if (arr.indexOf(text) >= 0) {
          actError.value = "该选项已存在";
          return;
        }
        arr.push(text);
        actOptions.value = Object.assign({}, actOptions.value, { [aid]: arr });
        actNewOption.value = "";
        actError.value = "";
        const r = await persistActOptions();
        emit("notify", "已新增选项「" + text + "」" + (r.mode === "api" ? "（已写入数据库）" : "（已保存到本机）"));
      };

      const removeActOption = async (aid, value) => {
        const arr = (actOptions.value[aid] || []).filter((x) => x !== value);
        actOptions.value = Object.assign({}, actOptions.value, { [aid]: arr });
        const r = await persistActOptions();
        emit("notify", "已删除选项「" + value + "」" + (r.mode === "api" ? "（已写入数据库）" : "（已保存到本机）"));
      };

      const submitActDialog = async () => {
        if (actSaving.value) return;
        if (actDialog.value === "act-batch") {
          const ids = actChecked.value.slice();
          if (!ids.length) {
            actError.value = "请先勾选要设置的门店";
            return;
          }
          const patch = {};
          actAllFields.value.forEach((a) => {
            const text = String(actForm[a.id] == null ? "" : actForm[a.id]).trim();
            if (text) patch[a.id] = text;
          });
          if (!Object.keys(patch).length) {
            actError.value = "请至少填写一项活动内容";
            return;
          }
          const rows = stores.value.filter((s) => ids.indexOf(s.id) >= 0);
          rows.forEach((s) => {
            const next = Object.assign({}, actConfig.value[s.id] || {});
            Object.keys(patch).forEach((k) => (next[k] = patch[k]));
            actConfig.value[s.id] = next;
          });
          const r = await persistActs(rows);
          actChecked.value = [];
          actDialog.value = "";
          emit("notify", "已批量设置 " + rows.length + " 家门店的活动" +
            (r.mode === "api" ? "（已写入数据库）" : "（已保存到本机）"));
          return;
        }
        const s = stores.value.find((x) => x.id === actStoreId.value);
        if (!s) return;
        const next = {};
        actAllFields.value.forEach((a) => {
          next[a.id] = String(actForm[a.id] == null ? "" : actForm[a.id]).trim();
        });
        actConfig.value[s.id] = next;
        const r = await persistActs([s]);
        actDialog.value = "";
        emit("notify", "已更新「" + s.name + "」的活动配置" +
          (r.mode === "api" ? "（已写入数据库）" : "（已保存到本机）"));
      };

      const display = (v) => {
        const t = v == null ? "" : String(v).trim();
        return t || "—";
      };
      const cellClass = (c, s) => {
        if (c.key === "name") return "cell-name";
        const v = s[c.key] == null ? "" : String(s[c.key]).trim();
        if (c.key === "remark") return v ? "cell-warn" : "cell-muted";
        return v ? "" : "cell-muted";
      };

      /* ---------- 导出 CSV ---------- */
      const pad2 = (n) => (n < 10 ? "0" + n : String(n));
      const stamp = () => {
        const d = new Date();
        return String(d.getFullYear()) + pad2(d.getMonth() + 1) + pad2(d.getDate()) +
          "_" + pad2(d.getHours()) + pad2(d.getMinutes()) + pad2(d.getSeconds());
      };
      const csvCell = (v) => {
        const t = v == null ? "" : String(v);
        return /[",\r\n]/.test(t) ? '"' + t.replace(/"/g, '""') + '"' : t;
      };
      const downloadCsv = (name, header, rows) => {
        const csv = "\ufeff" + [header].concat(rows)
          .map((r) => r.map(csvCell).join(","))
          .join("\r\n");
        const blob = new Blob([csv], { type: "text/csv;charset=utf-8" });
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = name;
        document.body.appendChild(a);
        a.click();
        a.remove();
        setTimeout(() => URL.revokeObjectURL(url), 1000);
      };

      const exportStoreCsv = () => {
        const rows = checked.value.length
          ? stores.value.filter((s) => checked.value.indexOf(s.id) >= 0)
          : list.value;
        if (!rows.length) {
          emit("notify", "当前筛选结果为空，未导出 CSV");
          return;
        }
        const cols = columns.value;
        const header = ["门店编码"].concat(cols.map((c) => c.label));
        const body = rows.map((s) => [s.id].concat(cols.map((c) => (s[c.key] == null ? "" : s[c.key]))));
        downloadCsv("门店信息维护_" + stamp() + ".csv", header, body);
        emit("notify", "已导出 " + rows.length + " 家门店" +
          (checked.value.length ? "（勾选行）" : "（当前筛选结果）"));
      };

      const exportActCsv = () => {
        const rows = actChecked.value.length
          ? stores.value.filter((s) => actChecked.value.indexOf(s.id) >= 0)
          : activityList.value;
        if (!rows.length) {
          emit("notify", "当前筛选结果为空，未导出 CSV");
          return;
        }
        const header = ["品牌编码", "门店名称", "城市", "直营/代理", "运营"]
          .concat(actAllFields.value.map((f) => f.label));
        const body = rows.map((s) =>
          [s.brandCode || s.id, s.name, s.city, s.modeM || "", s.operator || ""]
            .concat(actAllFields.value.map((f) => actVal(s, f.id)))
        );
        downloadCsv("活动配置整理_" + stamp() + ".csv", header, body);
        emit("notify", "已导出 " + rows.length + " 家门店" +
          (actChecked.value.length ? "（勾选行）" : "（当前筛选结果）"));
      };

      /* ---------- 清空全部（二次确认） ---------- */
      const clearAllStores = async () => {
        const r = await StoreRepo.clearStores();
        clearAllDialog.value = false;
        if (!r.ok) {
          emit("notify", "清空失败：接口未响应，请检查本地服务");
          return;
        }
        checked.value = [];
        clearFilters();
        await initStoreData();
        emit("notify", "已清空全部维护记录，已恢复基准门店数据" +
          (r.mode === "api" ? "（已删除数据库维护记录）" : "（已清除本机维护改动）"));
      };

      const clearAllActivity = async () => {
        const r = await StoreRepo.clearActivity();
        actClearDialog.value = false;
        if (!r.ok) {
          emit("notify", "清空失败：接口未响应，请检查本地服务");
          return;
        }
        actConfig.value = {};
        actChecked.value = [];
        actFilter.value = "";
        emit("notify", "已清空全部活动配置" +
          (r.mode === "api" ? "（已删除数据库记录）" : "（已清除本机缓存）"));
      };

      const clearForm = () => {
        Object.keys(form).forEach((k) => delete form[k]);
      };

      const openAdd = () => {
        clearForm();
        columns.value.forEach((c) => (form[c.key] = ""));
        editId.value = "";
        formError.value = "";
        dialog.value = "add";
      };

      const openEdit = (s) => {
        clearForm();
        columns.value.forEach((c) => (form[c.key] = s[c.key] == null ? "" : String(s[c.key])));
        editId.value = s.id;
        formError.value = "";
        dialog.value = "edit";
      };

      const openBatch = () => {
        Object.keys(batchForm).forEach((k) => delete batchForm[k]);
        batchFields.value.forEach((f) => (batchForm[f.key] = ""));
        formError.value = "";
        dialog.value = "batch";
      };

      const openField = () => {
        fieldForm.label = "";
        fieldForm.type = "text";
        formError.value = "";
        dialog.value = "field";
      };

      const collect = () => {
        const rec = {};
        columns.value.forEach((c) => {
          rec[c.key] = String(form[c.key] == null ? "" : form[c.key]).trim();
        });
        return rec;
      };

      const persist = async (items, patch) => {
        saving.value = true;
        const r = await StoreRepo.saveStores(items, stores.value, dynamicFields.value, patch);
        saving.value = false;
        return r;
      };

      const saveAdd = async () => {
        const rec = collect();
        if (!rec.name) {
          formError.value = "门店名称必填";
          return;
        }
        if (rec.brandCode && stores.value.some((s) => s.brandCode === rec.brandCode)) {
          formError.value = "门店编码「" + rec.brandCode + "」已存在，请更换";
          return;
        }
        const id = rec.brandCode || "LOCAL" + Date.now().toString(36);
        if (stores.value.some((s) => s.id === id)) {
          formError.value = "门店编码「" + id + "」已存在，请更换";
          return;
        }
        const row = Object.assign({ id: id }, rec);
        stores.value.push(row);
        const r = await persist([row], null);
        dialog.value = "";
        emit("notify", "新增门店成功" + (r.mode === "api" ? "（已写入数据库）" : "（已保存到本机）"));
      };

      const saveEdit = async () => {
        const s = stores.value.find((x) => x.id === editId.value);
        if (!s) return;
        const rec = collect();
        if (!rec.name) {
          formError.value = "门店名称必填";
          return;
        }
        if (rec.brandCode && stores.value.some((x) => x.id !== s.id && x.brandCode === rec.brandCode)) {
          formError.value = "门店编码「" + rec.brandCode + "」已存在，请更换";
          return;
        }
        Object.assign(s, rec);
        const r = await persist([s], null);
        dialog.value = "";
        emit("notify", "门店已更新" + (r.mode === "api" ? "（已写入数据库）" : "（已保存到本机）"));
      };

      const saveBatch = async () => {
        const ids = checked.value.slice();
        const patch = {};
        batchFields.value.forEach((f) => {
          const v = String(batchForm[f.key] == null ? "" : batchForm[f.key]).trim();
          if (v) patch[f.key] = v;
        });
        if (!Object.keys(patch).length) {
          formError.value = "请至少填写一项要修改的内容";
          return;
        }
        const rows = stores.value.filter((s) => ids.indexOf(s.id) >= 0);
        rows.forEach((s) => Object.assign(s, patch));
        const r = await persist(rows, patch);
        const n = rows.length;
        checked.value = [];
        dialog.value = "";
        emit("notify", "已批量更新 " + n + " 家门店" + (r.mode === "api" ? "（已写入数据库）" : "（已保存到本机）"));
      };

      const saveField = async () => {
        const label = fieldForm.label.trim();
        if (!label) {
          formError.value = "字段名必填";
          return;
        }
        if (columns.value.some((c) => c.label === label)) {
          formError.value = "字段名「" + label + "」已存在";
          return;
        }
        const key = "cf_" + Date.now().toString(36);
        const type = fieldForm.type || "text";
        columns.value.push({ key: key, label: label, type: type, dynamic: true });
        dynamicFields.value.push({ key: key, label: label, type: type });
        const r = await StoreRepo.addField({ key: key, label: label, type: type }, dynamicFields.value, stores.value);
        dialog.value = "";
        emit("notify", "已新增字段「" + label + "」" + (r.mode === "api" ? "（已写入数据库）" : "（已保存到本机）"));
      };

      const submitDialog = () => {
        if (saving.value) return;
        if (dialog.value === "add") saveAdd();
        else if (dialog.value === "edit") saveEdit();
        else if (dialog.value === "batch") saveBatch();
        else if (dialog.value === "field") saveField();
      };

      const dialogTitle = computed(() => {
        if (dialog.value === "add") return "新增门店";
        if (dialog.value === "edit") return "编辑门店";
        if (dialog.value === "batch") return "批量修改（已选 " + checked.value.length + " 家）";
        if (dialog.value === "field") return "新增字段";
        return "";
      });

      /* 重置本机修改：清缓存后重新从接口/基准数据加载 */
      const resetLocal = async () => {
        resetDialog.value = false;
        StoreRepo.resetLocal();
        checked.value = [];
        actChecked.value = [];
        clearFilters();
        clearAFilters();
        await initStoreData();
        emit("notify", "已重置，当前为基准数据");
      };

      /* ---------- 初始化：优先接口，失败读本机，再与基准数据合并 ---------- */
      const initStoreData = async () => {
        const [res, actRes] = await Promise.all([StoreRepo.load(), StoreRepo.loadActivity()]);
        storageMode.value = res.mode;

        const map = new Map();
        baseStores.forEach((s) => map.set(s.id, { ...s }));
        (res.stores || []).forEach((r) => {
          const id = r.id || r.store_id;
          if (!id) return;
          map.set(id, Object.assign({}, map.get(id) || { id: id }, r, { id: id }));
        });
        /* 接口模式：把本机新增、尚未入库的门店补进来 */
        if (res.mode === "api") {
          StoreRepo.localStores().forEach((r) => {
            if (r && r.id && !map.has(r.id)) map.set(r.id, Object.assign({ id: r.id }, r));
          });
        }
        stores.value = Array.from(map.values());

        const existKeys = new Set(baseColumns.map((c) => c.key));
        const mergedFields = [];
        (res.fields || []).forEach((f) => {
          if (f && f.key && !existKeys.has(f.key)) {
            existKeys.add(f.key);
            mergedFields.push(f);
          }
        });
        StoreRepo.localFields().forEach((f) => {
          if (f && f.key && !existKeys.has(f.key)) {
            existKeys.add(f.key);
            mergedFields.push(f);
          }
        });
        dynamicFields.value = mergedFields.map((f) => ({ key: f.key, label: f.label, type: f.type || "text" }));
        columns.value = baseColumns.concat(
          dynamicFields.value.map((f) => Object.assign({ dynamic: true }, f))
        );

        if (res.mode === "api") {
          const remoteIds = new Set((res.stores || []).map((r) => r.id || r.store_id));
          const remoteKeys = new Set((res.fields || []).map((f) => f.key));
          const missingStores = stores.value.filter((s) => !remoteIds.has(s.id));
          const missingFields = dynamicFields.value.filter((f) => !remoteKeys.has(f.key));
          (async () => {
            for (let i = 0; i < missingStores.length; i++) {
              try { await StoreRepo.saveStores([missingStores[i]], stores.value, dynamicFields.value, null); } catch (e) {}
            }
            for (let i = 0; i < missingFields.length; i++) {
              try { await StoreRepo.addField(missingFields[i], dynamicFields.value, stores.value); } catch (e) {}
            }
          })();
        } else {
          /* 本机模式：把合并后的完整数据写入本机缓存 */
          StoreRepo.saveStores([], stores.value, dynamicFields.value, null);
        }

        /* 活动配置：本机缓存打底，接口数据覆盖；旧布尔值统一转文本 */
        const normalizeActs = (m) => {
          const out = {};
          Object.keys(m || {}).forEach((k) => {
            const v = m[k];
            if (v === true || v === 1 || v === "1") out[k] = "已配置";
            else if (v === false || v === 0 || v === null || v === undefined) out[k] = "";
            else out[k] = String(v);
          });
          return out;
        };
        const actMap = {};
        if (actRes.mode === "api") {
          let localActs = {};
          try { localActs = JSON.parse(localStorage.getItem(LS_ACT) || "{}") || {}; } catch (e) {}
          const remoteIds = new Set((actRes.records || []).map((r) => r.store_id || r.id));
          /* 本机缓存只补接口中不存在的门店，避免清空后又被旧缓存回填 */
          Object.keys(localActs).forEach((id) => {
            if (!remoteIds.has(id)) actMap[id] = normalizeActs(localActs[id]);
          });
          (actRes.records || []).forEach((r) => {
            const id = r.store_id || r.id;
            if (id) actMap[id] = normalizeActs(r.activities || {});
          });
        } else {
          Object.keys(actRes.map || {}).forEach((id) => {
            actMap[id] = normalizeActs(actRes.map[id]);
          });
        }
        actConfig.value = actMap;
        actOptions.value = Object.assign({}, actRes.options || {});

        /* 活动页自定义字段：接口字段 + 本机新增字段 */
        const actFieldKeys = new Set((actRes.fields || []).map((f) => f.key));
        const mergedActFields = (actRes.fields || []).slice();
        let localActFields = [];
        try { localActFields = JSON.parse(localStorage.getItem(LS_ACT_FIELDS) || "[]") || []; } catch (e) {}
        localActFields.forEach((f) => {
          if (f && f.key && !actFieldKeys.has(f.key)) {
            actFieldKeys.add(f.key);
            mergedActFields.push(f);
          }
        });
        actFields.value = mergedActFields.map((f) => ({
          key: f.key, label: f.label, type: f.type || "text"
        }));
        if (actRes.mode === "api") {
          const remoteFieldKeys = new Set((actRes.fields || []).map((f) => f.key));
          const missingActFields = actFields.value.filter((f) => !remoteFieldKeys.has(f.key));
          (async () => {
            for (let i = 0; i < missingActFields.length; i++) {
              try { await StoreRepo.addActivityField(missingActFields[i], actFields.value); } catch (e) {}
            }
          })();
        }
      };

      onMounted(initStoreData);

      const goTab = (id) => {
        if (id !== props.tab) emit("change", id);
      };

      const onDocClick = () => closeMenus();
      onMounted(() => document.addEventListener("click", onDocClick));
      onUnmounted(() => document.removeEventListener("click", onDocClick));

      return {
        keyword, checked, list, allChecked,
        filters, openFilter, filterOptions, toggleFilterMenu, removeFilter, clearFilters,
        hasStoreFilter,
        aKeyword, aFilters, aOpenFilter, toggleAFilterMenu, removeAFilter, clearAFilters,
        hasActFilter, activityList, goTab,
        stores, columns, badgeText, storageMode, saving, dynamicFields,
        dialog, formError, form, fieldForm, batchForm, batchFields, dialogTitle,
        openAdd, openEdit, openBatch, openField, submitDialog, resetLocal, resetDialog,
        display, cellClass, exportStoreCsv, clearAllDialog, clearAllStores,
        actConfig, actChecked, actDialog, actForm, actError, actSaving,
        actVal, configuredCount, actCount, actAllChecked, actDialogTitle, actFilter,
        actOptions, actOptAct, actNewOption, actOptionList, pickActOption, actReturn,
        toggleActFilter, clearBatchField, clearActField, actFilled,
        actFields, actFieldDialog, actFieldForm, actFieldError, actAllFields,
        openActField, saveActField, exportActCsv, actClearDialog, clearAllActivity,
        openActBatch, openActEdit, submitActDialog,
        openActOptions, closeActOptions, addActOption, removeActOption
      };
    },
    template: `
      <div class="module-page">
        <header class="module-topbar">
          <div class="module-head-left">
            <h1 class="page-title">{{ data.title }}</h1>
            <span class="count-badge">{{ badgeText }}</span>
          </div>
          <button class="bell-btn" title="通知" @click="$emit('notify', '暂无新的通知')">
            <svg class="i"><use href="#i-bell" /></svg>
          </button>
        </header>

        <div class="page-tabs">
          <button
            v-for="t in data.tabs" :key="t.id"
            class="page-tab" :class="{ active: tab === t.id }"
            @click="goTab(t.id)">
            {{ t.label }}
          </button>
        </div>

        <!-- 门店信息维护 -->
        <article class="module-panel" v-if="tab === 'store-info'">
          <div class="toolbar">
            <input class="f-input w220" v-model="keyword" placeholder="搜索门店名 / 编码 / 操盘手 / 标签，多个用英文逗号分隔" />
            <span class="search-hint">多值用「,」分隔</span>
            <div class="ms" v-for="f in data.filterFields" :key="f.id">
              <button class="ms-btn" :class="{ on: filters[f.key].length }" @click.stop="toggleFilterMenu(f.key)">
                {{ f.label }}<span class="ms-count" v-if="filters[f.key].length">{{ filters[f.key].length }}</span>
              </button>
              <div class="ms-menu" v-if="openFilter === f.key" @click.stop>
                <div class="ms-menu-head">
                  <span>{{ f.label }}（可多选）</span>
                  <button class="btn btn-link" @click="filters[f.key] = []">清空</button>
                </div>
                <label class="ms-item" v-for="opt in filterOptions(f.key)" :key="opt">
                  <input type="checkbox" :value="opt" v-model="filters[f.key]" /> {{ opt }}
                </label>
                <div class="ms-empty" v-if="!filterOptions(f.key).length">暂无可选项</div>
              </div>
            </div>
            <button class="btn btn-ghost" @click="openAdd">+ 新增门店</button>
            <button class="btn btn-primary" @click="$emit('notify', '已打开「导入维护表」（演示）')">导入维护表</button>
            <button class="btn btn-ghost" @click="openField">+ 新增字段</button>
            <button class="btn btn-soft" :disabled="!checked.length" @click="openBatch">批量修改</button>
            <button class="btn btn-ghost btn-icon" title="更多" @click="$emit('notify', '更多操作（演示）')">—</button>
            <span class="toolbar-spacer"></span>
            <button class="btn btn-primary" @click="exportStoreCsv">导出 CSV</button>
            <button class="btn btn-link danger" @click="clearAllDialog = true">清空全部</button>
            <button class="btn btn-link" @click="resetDialog = true">重置本机修改</button>
          </div>
          <div class="ms-chipbar" v-if="hasStoreFilter">
            <template v-for="f in data.filterFields" :key="f.id">
              <span class="ms-chip" v-for="v in filters[f.key]" :key="f.key + ':' + v">
                {{ f.label }}：{{ v }}
                <button class="ms-chip-x" title="移除" @click="removeFilter(f.key, v)">×</button>
              </span>
            </template>
            <button class="btn btn-link" @click="clearFilters">清空筛选</button>
          </div>

          <div class="table-scroll">
            <table class="tbl store-tbl">
              <thead>
                <tr>
                  <th class="col-check">
                    <input type="checkbox" :checked="allChecked" @change="allChecked = $event.target.checked" />
                  </th>
                  <th v-for="c in columns" :key="c.key">{{ c.label }}</th>
                  <th class="col-op">操作</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="s in list" :key="s.id">
                  <td class="col-check">
                    <input type="checkbox" :value="s.id" v-model="checked" />
                  </td>
                  <td v-for="c in columns" :key="c.key" :class="cellClass(c, s)">
                    <span
                      v-if="c.key === 'status' && s.status"
                      class="status-dot"
                      :class="s.status === '营业中' ? 'ok' : (s.status === '休息中' ? 'warn' : 'off')">{{ s.status }}</span>
                    <template v-else>{{ display(s[c.key]) }}</template>
                  </td>
                  <td class="col-op">
                    <a class="op-link" @click="openEdit(s)">编辑</a>
                  </td>
                </tr>
                <tr v-if="!list.length">
                  <td :colspan="columns.length + 2" class="row-empty">没有符合筛选的门店</td>
                </tr>
              </tbody>
            </table>
          </div>

          <div class="panel-foot">
            <span>已展示 {{ list.length }} 家门店 · 勾选 {{ checked.length }} 家</span>
            <span class="foot-note">
              {{ data.sourceNote }} · {{ storageMode === 'api' ? '已连接本地服务（SQLite）' : '本机缓存模式（未连接服务）' }}
            </span>
          </div>
        </article>

        <!-- 活动配置整理 -->
        <article class="module-panel" v-else>
          <div class="overview-chips">
            <span
              class="ov-chip clickable"
              :class="{ active: actFilter === 'any' }"
              :title="actFilter === 'any' ? '再次点击取消筛选' : '点击只看至少配置了一项活动的门店'"
              @click="toggleActFilter('any')">
              <svg class="i i-12"><use href="#i-info" /></svg>
              已配置门店 {{ configuredCount }} / {{ activityList.length }} 家
            </span>
            <span
              class="ov-chip clickable"
              v-for="a in data.activities" :key="a.id"
              :class="{ active: actFilter === a.id }"
              :title="actFilter === a.id ? '再次点击取消筛选' : '点击只看已配置「' + a.label + '」的门店'"
              @click="toggleActFilter(a.id)">
              {{ a.label }} {{ actCount(a.id) }} 家
            </span>
            <span class="toolbar-spacer"></span>
            <button class="btn btn-soft" :disabled="!actChecked.length" @click="openActBatch">
              批量设置（{{ actChecked.length }} 家勾选）
            </button>
            <button class="btn btn-primary" @click="exportActCsv">导出 CSV</button>
            <button class="btn btn-link danger" @click="actClearDialog = true">清空全部</button>
          </div>

          <div class="toolbar">
            <input class="f-input w200" v-model="aKeyword" placeholder="搜索门店 / 品牌编码，多个用英文逗号分隔" />
            <span class="search-hint">多值用「,」分隔</span>
            <div class="ms" v-for="f in [{ key: 'province', label: '省份' }, { key: 'operator', label: '操盘手' }]" :key="f.key">
              <button class="ms-btn" :class="{ on: aFilters[f.key].length }" @click.stop="toggleAFilterMenu(f.key)">
                {{ f.label }}<span class="ms-count" v-if="aFilters[f.key].length">{{ aFilters[f.key].length }}</span>
              </button>
              <div class="ms-menu" v-if="aOpenFilter === f.key" @click.stop>
                <div class="ms-menu-head">
                  <span>{{ f.label }}（可多选）</span>
                  <button class="btn btn-link" @click="aFilters[f.key] = []">清空</button>
                </div>
                <label class="ms-item" v-for="opt in filterOptions(f.key)" :key="opt">
                  <input type="checkbox" :value="opt" v-model="aFilters[f.key]" /> {{ opt }}
                </label>
                <div class="ms-empty" v-if="!filterOptions(f.key).length">暂无可选项</div>
              </div>
            </div>
            <button class="btn btn-ghost" @click="openActField">+ 新增字段</button>
          </div>
          <div class="ms-chipbar" v-if="hasActFilter">
            <span class="ms-chip" v-for="v in aFilters.province" :key="'p:' + v">
              省份：{{ v }}<button class="ms-chip-x" title="移除" @click="removeAFilter('province', v)">×</button>
            </span>
            <span class="ms-chip" v-for="v in aFilters.operator" :key="'o:' + v">
              操盘手：{{ v }}<button class="ms-chip-x" title="移除" @click="removeAFilter('operator', v)">×</button>
            </span>
            <button class="btn btn-link" @click="clearAFilters">清空筛选</button>
          </div>

          <div class="table-scroll">
            <table class="tbl activity-tbl">
              <thead>
                <tr>
                  <th class="col-check">
                    <input type="checkbox" :checked="actAllChecked" @change="actAllChecked = $event.target.checked" />
                  </th>
                  <th>品牌编码</th>
                  <th>门店名称</th>
                  <th>城市</th>
                  <th>直营/代理</th>
                  <th>运营</th>
                  <th v-for="a in data.activities" :key="a.id">{{ a.label }}</th>
                  <th v-for="f in actFields" :key="f.key">{{ f.label }}</th>
                  <th class="col-op">操作</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="s in activityList" :key="s.id">
                  <td class="col-check">
                    <input type="checkbox" :value="s.id" v-model="actChecked" />
                  </td>
                  <td :class="{ 'cell-muted': !s.brandCode }">{{ s.brandCode || '—' }}</td>
                  <td class="cell-name">{{ s.name }}</td>
                  <td>{{ s.city }}</td>
                  <td>{{ s.modeM || '—' }}</td>
                  <td>{{ s.operator || '—' }}</td>
                  <td v-for="a in data.activities" :key="a.id">
                    <span v-if="actVal(s, a.id)" class="act-badge">{{ actVal(s, a.id) }}</span>
                    <span v-else class="cell-muted">—</span>
                  </td>
                  <td v-for="f in actFields" :key="f.key">
                    <span v-if="actVal(s, f.key)" class="act-badge">{{ actVal(s, f.key) }}</span>
                    <span v-else class="cell-muted">—</span>
                  </td>
                  <td class="col-op">
                    <a class="op-link" @click="openActEdit(s)">编辑</a>
                  </td>
                </tr>
                <tr v-if="!activityList.length">
                  <td :colspan="data.activities.length + actFields.length + 7" class="row-empty">没有符合筛选的门店</td>
                </tr>
              </tbody>
            </table>
          </div>

          <div class="panel-foot">
            <span>已展示 {{ activityList.length }} 家门店 · 已配置 {{ configuredCount }} 家 · 勾选 {{ actChecked.length }} 家</span>
            <span class="foot-note">
              配置变更实时写入活动配置底表 · {{ storageMode === 'api' ? '已连接本地服务（SQLite）' : '本机缓存模式（未连接服务）' }}
            </span>
          </div>
        </article>

        <!-- 新增 / 编辑 / 批量修改 / 新增字段 弹窗 -->
        <div class="modal-mask" v-if="dialog" @click.self="dialog = ''">
          <div class="modal" :class="{ 'modal-wide': dialog === 'add' || dialog === 'edit' }">
            <div class="modal-head">
              <h3 class="modal-title">{{ dialogTitle }}</h3>
              <button class="modal-close" @click="dialog = ''">×</button>
            </div>
            <div class="modal-body">
              <div class="modal-error" v-if="formError">{{ formError }}</div>

              <div class="form-grid" v-if="dialog === 'add' || dialog === 'edit'">
                <label class="form-item" v-for="c in columns" :key="c.key">
                  <span class="form-label">
                    {{ c.label }}<span class="req" v-if="c.required">*</span>
                  </span>
                  <select v-if="c.options" class="f-select" v-model="form[c.key]">
                    <option value="">请选择</option>
                    <option v-for="o in c.options" :key="o" :value="o">{{ o }}</option>
                  </select>
                  <input
                    v-else class="f-input"
                    :type="c.type === 'number' ? 'number' : (c.type === 'date' ? 'date' : 'text')"
                    v-model="form[c.key]"
                    :placeholder="c.required ? '必填' : '可留空'" />
                </label>
              </div>

              <div class="form-grid" v-else-if="dialog === 'batch'">
                <label class="form-item" v-for="c in batchFields" :key="c.key" :class="{ picked: !!batchForm[c.key] }">
                  <span
                    class="form-label"
                    :title="batchForm[c.key] ? '点击取消该项' : c.label"
                    @click="clearBatchField(c.key)">{{ c.label }}</span>
                  <select v-if="c.options" class="f-select" v-model="batchForm[c.key]">
                    <option value="">保持不变</option>
                    <option v-for="o in c.options" :key="o" :value="o">{{ o }}</option>
                  </select>
                  <input
                    v-else class="f-input"
                    :type="c.type === 'number' ? 'number' : 'text'"
                    v-model="batchForm[c.key]"
                    placeholder="保持不变（不修改）" />
                </label>
              </div>

              <div class="form-grid single" v-else>
                <label class="form-item">
                  <span class="form-label">字段名<span class="req">*</span></span>
                  <input class="f-input" v-model="fieldForm.label" placeholder="例如：区域经理" />
                </label>
                <label class="form-item">
                  <span class="form-label">字段类型</span>
                  <select class="f-select" v-model="fieldForm.type">
                    <option value="text">文本</option>
                    <option value="number">数字</option>
                    <option value="date">日期</option>
                  </select>
                </label>
              </div>
            </div>
            <div class="modal-foot">
              <span class="modal-hint" v-if="dialog === 'batch'">未填写的字段保持原值不变</span>
              <span class="toolbar-spacer" v-else></span>
              <button class="btn btn-ghost" @click="dialog = ''">取消</button>
              <button class="btn btn-primary" :disabled="saving" @click="submitDialog">
                {{ dialog === 'batch' ? '应用到 ' + checked.length + ' 家门店' : '保存' }}
              </button>
            </div>
          </div>
        </div>

        <!-- 活动配置：批量设置 / 编辑 / 选项配置 -->
        <div class="modal-mask" v-if="actDialog" @click.self="actDialog = ''">
          <div class="modal modal-act">
            <div class="modal-head">
              <h3 class="modal-title">{{ actDialogTitle }}</h3>
              <button class="modal-close" @click="actDialog = ''">×</button>
            </div>
            <div class="modal-body">
              <div class="modal-error" v-if="actError">{{ actError }}</div>

              <!-- 选项配置面板 -->
              <template v-if="actDialog === 'act-options'">
                <div class="act-opt-bar">
                  <select class="f-select w160" v-model="actOptAct">
                    <option v-for="a in data.activities" :key="a.id" :value="a.id">{{ a.label }}</option>
                  </select>
                  <input
                    class="f-input"
                    v-model="actNewOption"
                    placeholder="输入新选项，例如 满30减5"
                    @keyup.enter="addActOption" />
                  <button class="btn btn-ghost" @click="addActOption">添加</button>
                </div>
                <div class="act-opt-list">
                  <span class="act-opt-chip" v-for="o in actOptionList(actOptAct)" :key="o">
                    {{ o }}
                    <button class="act-opt-del" title="删除" @click="removeActOption(actOptAct, o)">×</button>
                  </span>
                  <span class="act-opt-empty" v-if="!actOptionList(actOptAct).length">
                    暂无选项，先在上方添加
                  </span>
                </div>
                <p class="act-opt-tip">
                  选项仅作为填写快捷方式，增删后立即保存 · {{ storageMode === 'api' ? '已写入数据库' : '保存在本机浏览器' }}
                </p>
              </template>

              <!-- 编辑 / 批量填写 -->
              <div class="act-form" v-else>
                <div class="act-form-row" v-for="a in actAllFields" :key="a.id" :class="{ picked: actFilled(a.id) }">
                  <span
                    class="act-form-name"
                    :title="actDialog === 'act-batch' && actFilled(a.id) ? '点击取消该项' : a.label"
                    @click="actDialog === 'act-batch' && clearActField(a.id)">{{ a.label }}</span>
                  <div class="act-field">
                    <input
                      class="f-input"
                      v-model="actForm[a.id]"
                      :placeholder="actDialog === 'act-batch' ? '不填则保持原值' : '如：满30减5 / 8折'" />
                    <select class="f-select act-opt-select" @change="pickActOption(a.id, $event)">
                      <option value="">常用选项</option>
                      <option v-for="o in actOptionList(a.id)" :key="o" :value="o">{{ o }}</option>
                    </select>
                  </div>
                </div>
              </div>
            </div>
            <div class="modal-foot">
              <template v-if="actDialog === 'act-options'">
                <span class="modal-hint">按活动维护下拉选项，增删后立即生效</span>
                <span class="toolbar-spacer"></span>
                <button class="btn btn-primary" @click="closeActOptions">
                  {{ actReturn ? '返回' : '完成' }}
                </button>
              </template>
              <template v-else>
                <span class="modal-hint">
                  {{ actDialog === 'act-batch' ? '未填写的活动保持原值不变' : '按填写的文本展示，留空表示未配置' }}
                </span>
                <span class="toolbar-spacer"></span>
                <button class="btn btn-ghost" @click="openActOptions">配置选项</button>
                <button class="btn btn-ghost" @click="actDialog = ''">取消</button>
                <button class="btn btn-primary" :disabled="actSaving" @click="submitActDialog">
                  {{ actDialog === 'act-batch' ? '应用到 ' + actChecked.length + ' 家门店' : '保存' }}
                </button>
              </template>
            </div>
          </div>
        </div>

        <!-- 清空全部维护记录：二次确认 -->
        <div class="modal-mask" v-if="clearAllDialog" @click.self="clearAllDialog = false">
          <div class="modal modal-confirm">
            <div class="modal-head">
              <h3 class="modal-title">清空全部维护记录</h3>
              <button class="modal-close" @click="clearAllDialog = false">×</button>
            </div>
            <div class="modal-body">
              <p class="confirm-text">将清空全部维护记录（基准门店数据保留），操作不可恢复。</p>
              <p class="confirm-sub">{{ storageMode === 'api' ? '将删除数据库中的门店维护记录。' : '将清除本机维护改动。' }}基准门店数据与字段定义会保留。</p>
            </div>
            <div class="modal-foot">
              <span class="toolbar-spacer"></span>
              <button class="btn btn-ghost" @click="clearAllDialog = false">取消</button>
              <button class="btn btn-danger" @click="clearAllStores">确认清空</button>
            </div>
          </div>
        </div>

        <!-- 重置本机修改：二次确认 -->
        <div class="modal-mask" v-if="resetDialog" @click.self="resetDialog = false">
          <div class="modal modal-confirm">
            <div class="modal-head">
              <h3 class="modal-title">重置本机修改</h3>
              <button class="modal-close" @click="resetDialog = false">×</button>
            </div>
            <div class="modal-body">
              <p class="confirm-text">将清除本机模式下的全部改动（门店维护、活动配置、字段与选项），操作不可恢复。</p>
              <p class="confirm-sub">随后会重新从接口读取；接口不可用时回到基准数据。</p>
            </div>
            <div class="modal-foot">
              <span class="toolbar-spacer"></span>
              <button class="btn btn-ghost" @click="resetDialog = false">取消</button>
              <button class="btn btn-danger" @click="resetLocal">确认重置</button>
            </div>
          </div>
        </div>

        <!-- 清空全部活动配置：二次确认 -->
        <div class="modal-mask" v-if="actClearDialog" @click.self="actClearDialog = false">
          <div class="modal modal-confirm">
            <div class="modal-head">
              <h3 class="modal-title">清空全部活动配置</h3>
              <button class="modal-close" @click="actClearDialog = false">×</button>
            </div>
            <div class="modal-body">
              <p class="confirm-text">将删除全部活动配置数据且不可恢复，请谨慎操作。</p>
              <p class="confirm-sub">{{ storageMode === 'api' ? '将清空活动配置底表记录。' : '将清空本机缓存的活动配置。' }}选项与自定义字段会保留。</p>
            </div>
            <div class="modal-foot">
              <span class="toolbar-spacer"></span>
              <button class="btn btn-ghost" @click="actClearDialog = false">取消</button>
              <button class="btn btn-danger" @click="clearAllActivity">确认清空</button>
            </div>
          </div>
        </div>

        <!-- 新增活动字段 -->
        <div class="modal-mask" v-if="actFieldDialog" @click.self="actFieldDialog = false">
          <div class="modal modal-confirm">
            <div class="modal-head">
              <h3 class="modal-title">新增活动字段</h3>
              <button class="modal-close" @click="actFieldDialog = false">×</button>
            </div>
            <div class="modal-body">
              <div class="modal-error" v-if="actFieldError">{{ actFieldError }}</div>
              <div class="form-grid">
                <label class="form-item">
                  <span class="form-label">字段名<span class="req">*</span></span>
                  <input class="f-input" v-model="actFieldForm.label" placeholder="如：活动预算" />
                </label>
                <label class="form-item">
                  <span class="form-label">类型</span>
                  <select class="f-select" v-model="actFieldForm.type">
                    <option value="text">文本</option>
                    <option value="number">数字</option>
                    <option value="date">日期</option>
                  </select>
                </label>
              </div>
            </div>
            <div class="modal-foot">
              <span class="modal-hint">保存后表头新增一列，编辑/批量弹窗可直接填写</span>
              <span class="toolbar-spacer"></span>
              <button class="btn btn-ghost" @click="actFieldDialog = false">取消</button>
              <button class="btn btn-primary" @click="saveActField">保存</button>
            </div>
          </div>
        </div>
      </div>
    `
  };

  /* ================= 产品信息维护 ================= */
})();
