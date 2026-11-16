/* 经营概览数据服务：同源 → 127.0.0.1:8000 → localhost:8000 → 8001 备用端口 */
(function () {
  const API_BASES = window.Http.bases();
  let apiBasePromise = null;

  const apiGet = (base, path, timeout) => window.Http.getJson(base, path, null, timeout);

  const detectApi = async () => {
    if (!apiBasePromise) {
      apiBasePromise = (async () => {
        const seen = {};
        for (const base of API_BASES) {
          if (seen[base]) continue;
          seen[base] = true;
          try {
            await apiGet(base, "/api/dashboard/business_overview?start=2026-11-01&end=2026-11-01", 1500);
            return base;
          } catch (e) { /* 继续尝试下一个地址 */ }
        }
        return "";
      })();
    }
    return apiBasePromise;
  };

  window.apiGet = apiGet;
  window.detectApi = detectApi;
})();
