/* Store repository: API first, localStorage fallback */
(function () {
  /* StoreRepo: fetch + localStorage, no Vue dependency */

  /* ================= 门店存储层：优先本地 API（SQLite），失败回落 localStorage ================= */
  const LS_STORES = "dashboard.storeMaintain.stores.v1";
  const LS_FIELDS = "dashboard.storeMaintain.fields.v1";
  const LS_ACT = "dashboard.storeActivity.v1";
  const LS_ACT_OPT = "dashboard.storeActivity.options.v1";
  const LS_ACT_FIELDS = "dashboard.storeActivity.fields.v1";

  const StoreRepo = (function () {
    const candidates = [];
    if (location.protocol === "http:" || location.protocol === "https:") candidates.push(location.origin);
    candidates.push(
      "http://127.0.0.1:8000", "http://localhost:8000",
      "http://127.0.0.1:8001", "http://localhost:8001"
    );
    let basePromise = null;

    const readLocal = (k) => {
      try { return JSON.parse(localStorage.getItem(k) || "null") || []; } catch (e) { return []; }
    };
    const writeLocal = (k, v) => {
      try { localStorage.setItem(k, JSON.stringify(v || [])); } catch (e) {}
    };
    const readOptionsLocal = () => {
      try { return JSON.parse(localStorage.getItem(LS_ACT_OPT) || "{}") || {}; } catch (e) { return {}; }
    };
    const request = async (base, path, opt, timeout) => {
      const ctrl = typeof AbortController === "function" ? new AbortController() : null;
      const timer = setTimeout(() => ctrl && ctrl.abort(), timeout || 3000);
      try {
        const res = await fetch(base + path, Object.assign({ signal: ctrl ? ctrl.signal : undefined }, opt || {}));
        if (!res.ok) throw new Error("HTTP " + res.status);
        return await res.json();
      } finally {
        clearTimeout(timer);
      }
    };
    /* 探测接口：页面来自 http(s) 先试同源，再试本地 8000 端口；file:// 直接试本地服务 */
    const detect = () => {
      if (!basePromise) {
        basePromise = (async () => {
          const bases = Array.from(new Set(candidates));
          for (let i = 0; i < bases.length; i++) {
            try {
              await request(bases[i], "/api/store_maintenance/config", {}, 1200);
              return bases[i];
            } catch (e) {}
          }
          return "";
        })();
      }
      return basePromise;
    };

    return {
      localStores: () => readLocal(LS_STORES),
      localFields: () => readLocal(LS_FIELDS),

      async load() {
        const base = await detect();
        if (base) {
          try {
            const data = await request(base, "/api/store_maintenance/config", {}, 4000);
            return { mode: "api", stores: data.stores || [], fields: data.fields || [] };
          } catch (e) {}
        }
        return { mode: "local", stores: readLocal(LS_STORES), fields: readLocal(LS_FIELDS) };
      },

      /* items 为空时只写本机缓存；patch 存在时走批量接口 */
      async saveStores(items, allStores, allFields, patch) {
        const base = await detect();
        let mode = "local";
        if (base) {
          try {
            let url = "";
            let body = null;
            if (patch) {
              url = "/api/store_maintenance/batch_update";
              body = { stores: items || [], patch: patch };
            } else if (items && items.length) {
              url = "/api/store_maintenance/save";
              body = { store: items[0] };
            }
            if (url) {
              const r = await request(base, url, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(body)
              });
              if (r.status === "success") mode = "api";
            }
          } catch (e) {}
        }
        writeLocal(LS_STORES, allStores);
        writeLocal(LS_FIELDS, allFields);
        return { mode };
      },

      async addField(fieldDef, allFields, allStores) {
        const base = await detect();
        let mode = "local";
        if (base) {
          try {
            const r = await request(base, "/api/store_maintenance/fields/add", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify(fieldDef)
            });
            if (r.status === "success") mode = "api";
          } catch (e) {}
        }
        writeLocal(LS_FIELDS, allFields);
        writeLocal(LS_STORES, allStores);
        return { mode };
      },

      /* 活动配置：接口返回 records + options + fields；本机缓存存 {storeId: {actId: '文本'}} */
      async loadActivity() {
        const base = await detect();
        if (base) {
          try {
            const data = await request(base, "/api/store_activity/config", {}, 4000);
            return {
              mode: "api",
              records: data.records || [],
              options: data.options || readOptionsLocal(),
              fields: data.fields || readLocal(LS_ACT_FIELDS)
            };
          } catch (e) {}
        }
        let map = {};
        try { map = JSON.parse(localStorage.getItem(LS_ACT) || "{}") || {}; } catch (e) { map = {}; }
        return {
          mode: "local",
          map: map,
          options: readOptionsLocal(),
          fields: readLocal(LS_ACT_FIELDS)
        };
      },

      /* 活动页自定义字段定义 */
      async addActivityField(fieldDef, allFields) {
        const base = await detect();
        let mode = "local";
        if (base) {
          try {
            const r = await request(base, "/api/store_activity/fields/add", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify(fieldDef)
            });
            if (r.status === "success") mode = "api";
          } catch (e) {}
        }
        writeLocal(LS_ACT_FIELDS, allFields);
        return { mode };
      },

      /* 清空维护记录：只清维护层数据，基准门店（dim_store）保留 */
      async clearStores() {
        const base = await detect();
        let mode = "local";
        let ok = true;
        if (base) {
          try {
            const r = await request(base, "/api/store_maintenance/clear", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({})
            });
            if (r.status === "success") mode = "api";
            else ok = false;
          } catch (e) { ok = false; }
        }
        if (mode === "local" || ok) {
          try { localStorage.removeItem(LS_STORES); } catch (e) {}
        }
        return { mode, ok };
      },

      async clearActivity() {
        const base = await detect();
        let mode = "local";
        let ok = true;
        if (base) {
          try {
            const r = await request(base, "/api/store_activity/clear", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({})
            });
            if (r.status === "success") mode = "api";
            else ok = false;
          } catch (e) { ok = false; }
        }
        if (mode === "local" || ok) {
          try { localStorage.removeItem(LS_ACT); } catch (e) {}
        }
        return { mode, ok };
      },

      async saveActivityOptions(options) {
        const base = await detect();
        let mode = "local";
        if (base) {
          try {
            const r = await request(base, "/api/store_activity/options/save", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ options: options || {} })
            });
            if (r.status === "success") mode = "api";
          } catch (e) {}
        }
        writeLocal(LS_ACT_OPT, options || {});
        return { mode };
      },

      async saveActivity(records, allActs) {
        const base = await detect();
        let mode = "local";
        if (base) {
          try {
            const url = records.length > 1
              ? "/api/store_activity/batch_update"
              : "/api/store_activity/save";
            const body = records.length > 1 ? { records: records } : { record: records[0] };
            const r = await request(base, url, {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify(body)
            });
            if (r.status === "success") mode = "api";
          } catch (e) {}
        }
        writeLocal(LS_ACT, allActs);
        return { mode };
      },

      /* 重置本机修改：清空全部本地缓存，重新从接口/基准数据加载 */
      resetLocal() {
        try {
          localStorage.removeItem(LS_STORES);
          localStorage.removeItem(LS_FIELDS);
          localStorage.removeItem(LS_ACT);
          localStorage.removeItem(LS_ACT_OPT);
          localStorage.removeItem(LS_ACT_FIELDS);
        } catch (e) {}
      }
    };
  })();

  window.StoreRepo = StoreRepo;
})();
