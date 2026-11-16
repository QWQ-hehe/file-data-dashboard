/* 路由与视图分发：hash 初始化、菜单映射、视图白名单 */
(function () {
  const views = [
    "workbench", "store-info", "store-activity", "product-info", "product-mapping",
    "business-overview", "traffic-overview", "promotion-analysis",
    "order-structure", "fundamental", "customer-analysis", "review-analysis",
    "product-sales", "product-conversion", "product-margin", "new-product-review",
    "marketing-spend", "marketing-scene", "marketing-ledger",
    "data-download", "store-report"
  ];

  const menuMap = {
    workbench: "workbench",
    "store-relation": "store-info",
    "product-info": "product-info",
    "business-overview": "business-overview",
    "traffic-funnel": "traffic-overview",
    promotion: "promotion-analysis",
    "order-structure": "order-structure",
    fundamental: "fundamental",
    "customer-analysis": "customer-analysis",
    "review-analysis": "review-analysis",
    "product-sales": "product-sales",
    "product-conversion": "product-conversion",
    "product-margin": "product-margin",
    "new-product-review": "new-product-review",
    "marketing-spend": "marketing-spend",
    "marketing-scene": "marketing-scene",
    "marketing-ledger": "marketing-ledger",
    "data-download": "data-download",
    "store-report": "store-report"
  };

  const initial = () => {
    const hash = (location.hash || "").replace("#", "");
    return views.indexOf(hash) >= 0 ? hash : "workbench";
  };

  const activeMenu = (view) => {
    if (view === "store-info" || view === "store-activity") return "store-relation";
    if (view === "product-info" || view === "product-mapping") return "product-info";
    if (view === "business-overview") return "business-overview";
    if (view === "traffic-overview") return "traffic-funnel";
    if (view === "promotion-analysis") return "promotion";
    if (view === "order-structure" || view === "fundamental" || view === "customer-analysis" || view === "review-analysis") return view;
    if (view === "product-sales") return "product-sales";
    if (view === "product-conversion") return "product-conversion";
    if (view === "product-margin") return "product-margin";
    if (view === "new-product-review") return "new-product-review";
    if (view === "marketing-spend") return "marketing-spend";
    if (view === "marketing-scene") return "marketing-scene";
    if (view === "marketing-ledger") return "marketing-ledger";
    if (view === "data-download") return "data-download";
    if (view === "store-report") return "store-report";
    if (view === "workbench") return "workbench";
    return "";
  };

  window.AppRouter = { views, menuMap, initial, activeMenu };
})();
