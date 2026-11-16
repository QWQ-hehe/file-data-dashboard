/* 通用接口访问层：候选 base 探测 + 超时 JSON 请求 */
(function () {
  const bases = () => {
    const list = [];
    if (location.protocol === "http:" || location.protocol === "https:") list.push(location.origin);
    list.push(
      "http://127.0.0.1:8000", "http://localhost:8000",
      "http://127.0.0.1:8001", "http://localhost:8001"
    );
    return list;
  };

  const getJson = async (base, path, opt, timeout) => {
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

  window.Http = { bases, getJson };
})();
