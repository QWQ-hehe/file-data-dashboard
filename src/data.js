/* 看板模拟数据（全部为中文 mock，无外部数据源） */
window.DASHBOARD_DATA = {
  brand: { name: "泰柯", title: "外卖运营看板" },
  user: { name: "沈健", role: "个人中心" },

  menus: [
    { type: "item", id: "workbench", label: "运营工作台", icon: "bag" },
    {
      type: "group", id: "maintain", label: "信息维护", icon: "gear", divider: true,
      children: [
        { id: "store-relation", label: "门店关系维护" },
        { id: "product-info", label: "产品信息维护" }
      ]
    },
    { type: "item", id: "dashboard", label: "仪表盘", icon: "grid" },
    {
      type: "group", id: "traffic", label: "经营流量中心", icon: "chart",
      children: [
        { id: "realtime", label: "实时数据" },
        { id: "business-overview", label: "经营概览" },
        { id: "traffic-funnel", label: "流量转化概览" },
        { id: "promotion", label: "推广分析" },
        { id: "new-store-target", label: "新店目标追踪" }
      ]
    },
    {
      type: "group", id: "customer", label: "顾客&订单中心", icon: "users",
      children: [
        { id: "order-structure", label: "订单结构分析" },
        { id: "order-abnormal", label: "异常订单分析" },
        { id: "fundamental", label: "基本面分析" },
        { id: "customer-analysis", label: "顾客分析" },
        { id: "review-analysis", label: "评价分析" }
      ]
    },
    {
      type: "group", id: "product", label: "商品中心", icon: "layers",
      children: [
        { id: "product-sales", label: "商品销售概览" },
        { id: "product-conversion", label: "商品转化分析" },
        { id: "product-margin", label: "商品毛利测算" },
        { id: "new-product-review", label: "新品复盘分析" }
      ]
    },
    {
      type: "group", id: "marketing", label: "营销中心", icon: "megaphone",
      children: [
        { id: "marketing-spend", label: "营销支出分析" },
        { id: "marketing-scene", label: "营销场景分析" },
        { id: "marketing-ledger", label: "营销台账记录" },
        { id: "campaign-review", label: "活动效果复盘" }
      ]
    },
    {
      type: "group", id: "download", label: "下载中心", icon: "download",
      children: [
        { id: "data-download", label: "数据下载" },
        { id: "store-report", label: "门店报告导出" }
      ]
    }
  ],

  stats: {
    revenue: {
      label: "昨日外卖实收",
      value: "—",
      chips: [
        { prefix: "实收 · 近7日", value: "—", note: "（不可比）" },
        { prefix: "订单 · 近7日", value: "—", note: "（不可比）" },
        { prefix: "客单价", value: "¥ —", note: "近7日 —（不可比）" }
      ]
    },
    alerts: {
      label: "异常与待办",
      items: [
        { value: 18, label: "未解除异常", tone: "red" },
        { value: 2, label: "待处理", tone: "amber" },
        { value: 13, label: "已完成", tone: "green" }
      ],
      link: "查看异常构成",
      foot: "预警待办 0 · 新店目标 2"
    },
    trafficLight: {
      label: "月度业绩红绿灯",
      period: "2026-10-01 至 2026-10-31",
      counts: { red: 11, amber: 37, green: 1 }
    }
  },

  todo: {
    groupLabel: "名下新店 · 4周评估期",
    count: "1 家",
    store: {
      name: "上海世博天地店",
      platform: "美团",
      openedDays: 20,
      yesterdayOrders: "—",
      yesterdayRevenue: "—",
      target: 800,
      targetRows: [
        { label: "时间", value: "63.3%" },
        { label: "实际", value: "订单待补", warn: true }
      ],
      week: [
        { date: "11-07", value: "27" },
        { date: "11-08", value: "33" },
        { date: "11-09", value: "13", down: true },
        { date: "11-10", value: "23", down: true },
        { date: "11-11", value: "19", down: true },
        { date: "11-12", value: "22", down: true },
        { date: "11-13", value: "—" }
      ]
    },
    platforms: [
      { id: "meituan", label: "美团" },
      { id: "eleme", label: "饿了么" }
    ],
    filters: [
      { id: "all", label: "全部" },
      { id: "todo", label: "未完成" },
      { id: "done", label: "已完成" }
    ]
  },

  warnings: [
    {
      id: 1,
      store: "天河东方宝泰店",
      status: "已完成",
      streak: "连续1次",
      hours: "210.49小时",
      tag: "业绩预警",
      dispatchAt: "2026-11-03 16:46:50",
      period: "2026-10-01 至 2026-10-31",
      metrics: [
        { label: "外卖总环比", value: -50.82 },
        { label: "堂食环比", value: -13.79 },
        { label: "大盘平均环比", value: -24.29 }
      ],
      records: [
        { status: "已完成", user: "沈健", time: "2026-11-12 11:16:18", texts: ["1"] },
        { status: "跟进中", user: "沈健", time: "2026-11-11 17:04:38", texts: ["每周一至周三 霸王餐 3单/天 需要好评 从下周一开始做1个月"] },
        {
          status: "跟进中", user: "沈健", time: "2026-11-10 11:58:40",
          texts: [
            "闪购",
            "店铺分偏低 和门店沟通重点关注消息回复率和负反馈率的问题 复购率建议（门店做霸王餐 5单/天（暂未确定））",
            "ROI偏低 目前先暂停推广 等基本面提升之后再进行推广",
            "美团",
            "建议门店充值加推"
          ]
        },
        { status: "加入待办", user: "", time: "2026-11-03 16:46:50", texts: ["业绩预警自动派单"] }
      ]
    },
    {
      id: 2,
      store: "上海新丸中心店",
      status: "已完成",
      streak: "连续1次",
      hours: "213.66小时",
      tag: "业绩预警",
      dispatchAt: "2026-11-03 16:12:08",
      period: "2026-10-01 至 2026-10-31",
      metrics: [
        { label: "外卖总环比", value: -38.26 },
        { label: "堂食环比", value: -9.14 },
        { label: "大盘平均环比", value: -18.72 }
      ],
      records: [
        { status: "已完成", user: "沈健", time: "2026-11-12 10:02:11", texts: ["已与门店确认套餐结构，调整主推套餐并补充满减活动。"] },
        { status: "跟进中", user: "沈健", time: "2026-11-09 16:20:05", texts: ["曝光量连续下滑，建议提高推广预算并优化午市投放时段。", "评分偏低，安排门店回访并跟进差评处理。"] },
        { status: "加入待办", user: "", time: "2026-11-03 16:12:08", texts: ["业绩预警自动派单"] }
      ]
    },
    {
      id: 3,
      store: "泉州古城西街店",
      status: "已完成",
      streak: "连续2次",
      hours: "47.92小时",
      tag: "业绩预警",
      dispatchAt: "2026-11-03 15:48:22",
      period: "2026-10-01 至 2026-10-31",
      metrics: [
        { label: "外卖总环比", value: -22.45 },
        { label: "堂食环比", value: -6.08 },
        { label: "大盘平均环比", value: -11.36 }
      ],
      records: [
        { status: "已完成", user: "沈健", time: "2026-11-11 09:41:26", texts: ["已完成门店巡检，优化菜单排序与出餐时长。"] },
        { status: "跟进中", user: "沈健", time: "2026-11-08 14:06:37", texts: ["连续 2 周下滑，重点关注差评关键词与复购率。"] },
        { status: "加入待办", user: "", time: "2026-11-03 15:48:22", texts: ["业绩预警自动派单"] }
      ]
    },
    {
      id: 4,
      store: "深圳湾万象城店",
      status: "跟进中",
      streak: "连续1次",
      hours: "6.50小时",
      tag: "业绩预警",
      dispatchAt: "2026-11-14 09:20:15",
      period: "2026-11-01 至 2026-11-30",
      metrics: [
        { label: "外卖总环比", value: -15.2 },
        { label: "堂食环比", value: -4.8 },
        { label: "大盘平均环比", value: -9.6 }
      ],
      records: [
        { status: "跟进中", user: "沈健", time: "2026-11-14 10:05:48", texts: ["已联系门店排查出餐与差评情况，等待门店反馈。"] },
        { status: "加入待办", user: "", time: "2026-11-14 09:20:15", texts: ["业绩预警自动派单"] }
      ]
    }
  ],

  donut: {
    title: "推广五色分布",
    percent: 59,
    qualified: 64,
    total: 108,
    data: [
      { name: "绿", value: 38, color: "#7d9b7e" },
      { name: "红", value: 22, color: "#b06b6b" },
      { name: "橙", value: 12, color: "#bf7a52" },
      { name: "灰", value: 10, color: "#8a93a0" },
      { name: "黄", value: 26, color: "#c9b26a" }
    ]
  },

  monitor: {
    title: "自定义监控完成情况",
    name: "推广异常门店",
    doneStats: "已完成 1 / 1 条 · 未完成 0 条 · 100%",
    emptyText: "暂无未完成待办",
    doneItem: { store: "上海新丸中心店", time: "2026-11-12 10:02 已处理" }
  },

  ranking: {
    title: "门店排行",
    subtitle: "TOP5 · 本月实收",
    stores: [
      { name: "上海世博天地店", value: "12.8万", bar: 100 },
      { name: "天河东方宝泰店", value: "11.2万", bar: 88 },
      { name: "上海新丸中心店", value: "10.6万", bar: 83 },
      { name: "泉州古城西街店", value: "9.4万", bar: 73 },
      { name: "深圳湾万象城店", value: "8.7万", bar: 68 }
    ]
  }
};

/* ================= 门店关系维护 ================= */
window.DASHBOARD_DATA.storeRelation = {
  title: "门店关系维护",
  badge: "共 6 家（门店关系映射表 6 · 本机新增 0）",
  sourceNote: "数据来源：data/门店关系映射表.xlsx",
  tabs: [
    { id: "store-info", label: "门店信息维护" },
    { id: "store-activity", label: "活动配置整理" }
  ],
  filterFields: [
    { id: "province", label: "省份", key: "province" },
    { id: "city", label: "城市", key: "city" },
    { id: "age", label: "新老店", key: "age" },
    { id: "operator", label: "操盘手", key: "operator" },
    { id: "status", label: "营业状态", key: "status" },
    { id: "tags", label: "标签", key: "tags" }
  ],
  columns: [
    { key: "name", label: "门店名称", type: "text", required: true },
    { key: "province", label: "省份", type: "text" },
    { key: "city", label: "城市", type: "text" },
    { key: "age", label: "新老店", type: "select", options: ["新店", "老店"] },
    { key: "operator", label: "操盘手", type: "text" },
    { key: "tags", label: "标签", type: "text" },
    { key: "meituan", label: "美团id", type: "text" },
    { key: "eleme", label: "饿了么id", type: "text" },
    { key: "jd", label: "京东id", type: "text" },
    { key: "modeM", label: "直营/代理(美)", type: "select", options: ["直营", "代理"] },
    { key: "modeE", label: "直营/代理(饿)", type: "select", options: ["直营", "代理"] },
    { key: "mtDate", label: "美团首次营业日期", type: "text" },
    { key: "eleDate", label: "饿了么首次营业日期", type: "text" },
    { key: "status", label: "营业状态", type: "select", options: ["营业中", "休息中", "暂停营业"] },
    { key: "qimai", label: "企迈id", type: "text" },
    { key: "remark", label: "备注", type: "text" },
    { key: "brand", label: "品牌", type: "text" },
    { key: "brandCode", label: "品牌编码", type: "text" },
    { key: "mFee", label: "M基础配送费", type: "number" },
    { key: "eFee", label: "E基础配送费", type: "number" },
    { key: "xiaocan", label: "小蚕店铺ID", type: "text" }
  ],
  stores: [
    { id: "OMM0001", name: "武汉银泰创意城店", province: "湖北", city: "武汉", age: "老店", operator: "", tags: "", meituan: "33689313", eleme: "544210449", jd: "", modeM: "", modeE: "", mtDate: "/", eleDate: "/", status: "营业中", qimai: "", remark: "", brand: "欧沫沫", brandCode: "OMM0001", mFee: "", eFee: "", xiaocan: "" },
    { id: "OMM0002", name: "深圳大悦城中心店", province: "广东", city: "深圳", age: "新店", operator: "", tags: "", meituan: "34710658", eleme: "542858799", jd: "", modeM: "", modeE: "", mtDate: "2026-09-21", eleDate: "/", status: "营业中", qimai: "", remark: "", brand: "欧沫沫", brandCode: "OMM0002", mFee: "3.5", eFee: "3.6", xiaocan: "2548618" },
    { id: "OMM0003", name: "深圳大运天地店", province: "广东", city: "深圳", age: "新店", operator: "", tags: "", meituan: "34885790", eleme: "546581071", jd: "", modeM: "", modeE: "", mtDate: "2026-10-12", eleDate: "2026-11-02", status: "营业中", qimai: "", remark: "", brand: "欧沫沫", brandCode: "OMM0003", mFee: "3.5", eFee: "4.2", xiaocan: "2583383" },
    { id: "OMM0004", name: "武汉万象城店", province: "湖北", city: "武汉", age: "老店", operator: "", tags: "", meituan: "33688789", eleme: "542597791", jd: "", modeM: "", modeE: "", mtDate: "2026-10-23", eleDate: "2026-10-23", status: "营业中", qimai: "", remark: "", brand: "欧沫沫", brandCode: "OMM0004", mFee: "3.5", eFee: "3.5", xiaocan: "2282000" },
    { id: "OMM0005", name: "佛山万象天地店", province: "广东", city: "佛山", age: "新店", operator: "", tags: "", meituan: "35098506", eleme: "", jd: "", modeM: "", modeE: "", mtDate: "2026-10-26", eleDate: "/", status: "营业中", qimai: "", remark: "", brand: "欧沫沫", brandCode: "OMM0005", mFee: "3.2", eFee: "", xiaocan: "2626897" },
    { id: "OMM0006", name: "襄阳高新万达店", province: "湖北", city: "襄阳", age: "新店", operator: "", tags: "", meituan: "35116041", eleme: "1362256179", jd: "", modeM: "", modeE: "", mtDate: "2026-10-27", eleDate: "2026-11-02", status: "营业中", qimai: "", remark: "", brand: "欧沫沫", brandCode: "OMM0006", mFee: "4.5", eFee: "5", xiaocan: "2627499" }
  ],
  activities: [
    { id: "delivery", label: "减配送费" },
    { id: "special", label: "特价菜" },
    { id: "newcomer", label: "门店新客立减" },
    { id: "coupon", label: "神券红包" },
    { id: "multi", label: "多件优惠" },
    { id: "fullcut", label: "店铺满减" },
    { id: "godbag", label: "神抢手" },
    { id: "collect", label: "收藏有礼" },
    { id: "selfpick", label: "到店自取折扣" }
  ]
};

/* ================= 产品信息维护 ================= */
window.DASHBOARD_DATA.productMaintenance = {
  title: "产品信息维护",
  badge: "共 109 个产品（共享资料 109 · 本机新增 0）",
  tabs: [
    { id: "product-info", label: "产品信息" },
    { id: "product-mapping", label: "商品映射" }
  ],
  overview: [
    { label: "产品总数", value: "109", unit: "个" },
    { label: "当前新品", value: "13", unit: "个" },
    { label: "当前招牌", value: "0", unit: "个" },
    { label: "待映射", value: "0", unit: "条" }
  ],
  overviewNote: "比上月 —（暂无可比数据）",
  filters: {
    categories: ["全部分类", "泰国红茶", "泰式奶茶", "泰式甜品", "泰式主食", "泰式小吃", "泰式果茶", "可可系列"],
    statuses: ["全部状态", "在售", "停售", "售罄"],
    tags: ["全部标签", "新品", "招牌", "无标签"],
    channels: ["全部渠道", "主站", "拼好饭"],
    platforms: ["全部平台", "美团", "饿了么"]
  },
  products: [
    { code: "P0128", name: "咸法酪泰奶（清爽版）", spec: "中杯/标准糖", tags: [], channel: "主站", status: "在售", category: "泰国红茶", dinein: "20", takeout: "24", packing: "1", onlineAt: "2025-09-01", updatedAt: "2026-10-14" },
    { code: "P0129", name: "甄选泰奶", spec: "大杯/少糖", tags: [], channel: "主站、拼好饭", status: "在售", category: "泰国红茶", dinein: "22", takeout: "26", packing: "1", onlineAt: "2025-09-01", updatedAt: "2026-10-12" },
    { code: "P0130", name: "招牌泰式奶茶", spec: "中杯/标准糖", tags: ["招牌"], channel: "主站、美团、饿了么", status: "在售", category: "泰式奶茶", dinein: "18", takeout: "22", packing: "1", onlineAt: "2025-08-12", updatedAt: "2026-10-10" },
    { code: "P0131", name: "手打柠檬茶", spec: "大杯/去冰", tags: ["新品"], channel: "主站、美团", status: "在售", category: "泰式果茶", dinein: "19", takeout: "23", packing: "1", onlineAt: "2026-09-18", updatedAt: "2026-10-08" },
    { code: "P0132", name: "椰香芒果糯米饭", spec: "单人份", tags: ["招牌"], channel: "主站、饿了么", status: "在售", category: "泰式甜品", dinein: "16", takeout: "20", packing: "2", onlineAt: "2025-06-20", updatedAt: "2026-10-06" },
    { code: "P0133", name: "冬阴功海鲜面", spec: "大份", tags: [], channel: "主站", status: "在售", category: "泰式主食", dinein: "32", takeout: "38", packing: "2", onlineAt: "2025-04-11", updatedAt: "2026-10-05" },
    { code: "P0134", name: "泰式炒河粉", spec: "标准份", tags: [], channel: "主站、美团、饿了么", status: "在售", category: "泰式主食", dinein: "26", takeout: "30", packing: "2", onlineAt: "2025-03-02", updatedAt: "2026-09-29" },
    { code: "P0135", name: "青咖喱鸡饭", spec: "标准份", tags: ["招牌"], channel: "主站、饿了么", status: "在售", category: "泰式主食", dinein: "28", takeout: "33", packing: "2", onlineAt: "2025-02-14", updatedAt: "2026-09-27" },
    { code: "P0136", name: "香茅烤鸡翅", spec: "4只装", tags: ["新品"], channel: "主站、美团", status: "在售", category: "泰式小吃", dinein: "22", takeout: "27", packing: "2", onlineAt: "2026-10-02", updatedAt: "2026-10-02" },
    { code: "P0137", name: "芝士泰奶", spec: "中杯/标准糖", tags: ["新品"], channel: "主站、拼好饭", status: "售罄", category: "泰国红茶", dinein: "22", takeout: "26", packing: "1", onlineAt: "2026-09-25", updatedAt: "2026-10-01" },
    { code: "P0138", name: "斑斓椰奶冻", spec: "单人份", tags: [], channel: "主站", status: "停售", category: "泰式甜品", dinein: "14", takeout: "18", packing: "1", onlineAt: "2024-12-08", updatedAt: "2026-09-18" },
    { code: "P0139", name: "曼谷炸鸡块", spec: "标准份", tags: [], channel: "主站、饿了么", status: "在售", category: "泰式小吃", dinein: "20", takeout: "24", packing: "2", onlineAt: "2025-05-16", updatedAt: "2026-09-15" },
    { code: "P0140", name: "泰式菠萝炒饭", spec: "标准份", tags: [], channel: "主站、美团", status: "在售", category: "泰式主食", dinein: "27", takeout: "32", packing: "2", onlineAt: "2025-01-21", updatedAt: "2026-09-10" },
    { code: "P0141", name: "可可泰奶（冬季限定）", spec: "中杯/热饮", tags: ["新品"], channel: "主站", status: "在售", category: "可可系列", dinein: "21", takeout: "25", packing: "1", onlineAt: "2026-10-28", updatedAt: "2026-10-28" }
  ],
  mapping: {
    platforms: [
      { id: "all", label: "全部" },
      { id: "meituan", label: "美团" },
      { id: "eleme", label: "饿了么" }
    ],
    statuses: [
      { id: "unlinked", label: "未关联" },
      { id: "all", label: "全部" },
      { id: "linked", label: "已关联" },
      { id: "excluded", label: "已排除" }
    ],
    noteAuto: "自动关联范围：美团 + 饿了么的全部未关联商品（不受名称和状态筛选影响）",
    noteSales: "销量：2026-05-01 至 2026-11-12 · 全部门店累计",
    stats: { linked: 241, unlinked: 0, excluded: 60 },
    rows: [
      { platform: "美团", platformName: "泰奶（大杯）", sales: 1286, status: "已关联", standardName: "甄选泰奶", standardCode: "P0129", standardSpec: "大杯/少糖", method: "自动关联" },
      { platform: "饿了么", platformName: "甄选泰式奶茶", sales: 964, status: "已关联", standardName: "甄选泰奶", standardCode: "P0129", standardSpec: "大杯/少糖", method: "人工关联" },
      { platform: "美团", platformName: "招牌泰式奶茶（中杯）", sales: 2311, status: "已关联", standardName: "招牌泰式奶茶", standardCode: "P0130", standardSpec: "中杯/标准糖", method: "自动关联" },
      { platform: "饿了么", platformName: "泰式奶茶", sales: 1877, status: "已关联", standardName: "招牌泰式奶茶", standardCode: "P0130", standardSpec: "中杯/标准糖", method: "自动关联" },
      { platform: "美团", platformName: "手打柠檬茶 大杯", sales: 732, status: "已关联", standardName: "手打柠檬茶", standardCode: "P0131", standardSpec: "大杯/去冰", method: "自动关联" },
      { platform: "饿了么", platformName: "芒果糯米饭", sales: 518, status: "已关联", standardName: "椰香芒果糯米饭", standardCode: "P0132", standardSpec: "单人份", method: "人工关联" },
      { platform: "美团", platformName: "冬阴功海鲜面", sales: 441, status: "已关联", standardName: "冬阴功海鲜面", standardCode: "P0133", standardSpec: "大份", method: "自动关联" },
      { platform: "饿了么", platformName: "泰式炒河粉", sales: 603, status: "已关联", standardName: "泰式炒河粉", standardCode: "P0134", standardSpec: "标准份", method: "自动关联" },
      { platform: "美团", platformName: "青咖喱鸡饭", sales: 389, status: "已关联", standardName: "青咖喱鸡饭", standardCode: "P0135", standardSpec: "标准份", method: "自动关联" },
      { platform: "饿了么", platformName: "香茅烤鸡翅 4只", sales: 276, status: "已关联", standardName: "香茅烤鸡翅", standardCode: "P0136", standardSpec: "4只装", method: "自动关联" }
    ]
  }
};

/* ================= 经营概览 ================= */
window.DASHBOARD_DATA.businessOverview = {
  title: "经营概览",
  updatedAt: "数据更新时间 2026-11-13 08:00",
  filters: {
    quick: ["今日", "昨日", "近7天", "近30天"],
    dateStart: "2026-11-07",
    dateEnd: "2026-11-13",
    regions: ["全部区域", "华东", "华南", "华北", "华中", "西南"],
    channels: ["全部渠道", "美团", "饿了么"],
    storeTypes: ["全部门店类型", "直营", "代理"],
    stores: ["全部门店", "长沙万象城店", "北京三里屯店", "上海新天地店", "深圳湾万象城店"],
    brands: ["全部品牌", "泰柯"]
  },
  kpis: [
    { label: "外卖收入", value: "¥6,065,176", delta: "12.1%", diff: "(-345,885.1)", dir: "down" },
    { label: "外卖GMV（原）", value: "¥9,037,505", delta: "14.6%", diff: "(-1,410,578.4)", dir: "down" },
    { label: "外卖有效订单量", value: "303,769", unit: "单", delta: "13.9%", diff: "(+47,317)", dir: "up" },
    { label: "实收客单价", value: "¥20.0", delta: "1.5%", diff: "(+3.3)", dir: "up" },
    { label: "外卖实付", value: "¥7,718,049", delta: "12.6%", diff: "(+1,105,514.8)", dir: "up" },
    { label: "实付客单价", value: "¥26.7", delta: "0.1%", diff: "(+5)", dir: "up" },
    { label: "外卖实收率（原）", value: "66.3%", delta: "0.3pp", diff: "(+1.9pp)", dir: "up" },
    { label: "进店转化率", value: "47.9%", delta: "5.3%", diff: "(-2.7pp)", dir: "down" },
    { label: "单店日均收入", value: "¥1,394.8", delta: "11.4%", diff: "(+179)", dir: "up" },
    { label: "全渠道收入", value: "¥12,706,916", delta: "7.7%", diff: "(+1,081,335.2)", dir: "up" }
  ],
  tabs: [
    { id: "common", label: "常用指标" },
    { id: "revenue", label: "营收" },
    { id: "traffic", label: "流量" },
    { id: "order", label: "订单" },
    { id: "activity", label: "活动" },
    { id: "profit", label: "利润" },
    { id: "service", label: "服务" }
  ],
  platforms: [
    { key: "total", label: "外卖总" },
    { key: "meituan", label: "美团" },
    { key: "eleme", label: "饿了么" }
  ],
  indicators: {
    common: [
      { label: "营业商家数", cells: [{ v: "372", d: "1.8%", dir: "down" }, { v: "372", d: "1.8%", dir: "down" }, { v: "370", d: "2.1%", dir: "down" }], star: true },
      { label: "外卖收入", cells: [{ v: "¥6,841,927", d: "11.5%", dir: "down" }, { v: "¥2,987,550", d: "6.4%", dir: "down" }, { v: "¥2,854,376", d: "16.3%", dir: "down" }], star: true },
      { label: "有效订单", cells: [{ v: "288,977", d: "12.5%", dir: "down" }, { v: "135,260", d: "8.0%", dir: "down" }, { v: "153,717", d: "16.1%", dir: "down" }], star: false },
      { label: "进店转化率", cells: [{ v: "1.51%", d: "0.1pp", dir: "down" }, { v: "1.81%", d: "0.1pp", dir: "down" }, { v: "1.31%", d: "0.2pp", dir: "down" }], star: false },
      { label: "总曝光人数", cells: [{ v: "14,688,790", d: "5.7%", dir: "down" }, { v: "7,291,206", d: "5.1%", dir: "down" }, { v: "11,378,574", d: "6.0%", dir: "down" }], star: true }
    ],
    revenue: [
      { label: "实收占比", cells: [{ v: "46.2%", d: "2.2pp", dir: "down" }, { v: "23.6%", d: "0.2pp", dir: "up" }, { v: "22.6%", d: "2.3pp", dir: "down" }], star: true },
      { label: "订单占比", cells: [{ v: "48.8%", d: "1.1pp", dir: "down" }, { v: "22.8%", d: "0.7pp", dir: "down" }, { v: "26.0%", d: "3.4pp", dir: "down" }], star: false },
      { label: "营业商家数", cells: [{ v: "372", d: "1.8%", dir: "down" }, { v: "372", d: "1.8%", dir: "down" }, { v: "370", d: "2.1%", dir: "down" }], star: true },
      { label: "外卖GMV（原）", cells: [{ v: "¥8,694,867", d: "13.3%", dir: "down" }, { v: "¥4,342,458", d: "10.0%", dir: "down" }, { v: "¥4,352,409", d: "16.5%", dir: "down" }], star: false },
      { label: "外卖收入", cells: [{ v: "¥5,841,927", d: "11.5%", dir: "down" }, { v: "¥2,987,550", d: "6.4%", dir: "down" }, { v: "¥2,854,376", d: "16.3%", dir: "down" }], star: true },
      { label: "外卖单店日均实收", cells: [{ v: "¥1,395", d: "11.4%", dir: "down" }, { v: "¥679", d: "5.6%", dir: "down" }, { v: "¥651", d: "15.3%", dir: "down" }], star: false },
      { label: "单店外卖日均GMV（原）", cells: [{ v: "¥1,985", d: "12.9%", dir: "down" }, { v: "¥1,000", d: "9.2%", dir: "down" }, { v: "¥996", d: "16.0%", dir: "down" }], star: false },
      { label: "外卖实收率（原）", cells: [{ v: "66.3%", d: "2.0pp", dir: "up" }, { v: "67.7%", d: "3.0pp", dir: "up" }, { v: "65.0%", d: "1.0pp", dir: "up" }], star: false },
      { label: "外卖毛利润（实收口径）", cells: [{ v: "待数据", muted: true }, { v: "待数据", muted: true }, { v: "待数据", muted: true }], star: false },
      { label: "外卖毛利率（实收口径）", cells: [{ v: "待数据", muted: true }, { v: "待数据", muted: true }, { v: "待数据", muted: true }], star: false }
    ],
    traffic: [
      { label: "综合转化率", cells: [{ v: "1.51%", d: "0.1pp", dir: "down" }, { v: "1.81%", d: "0.1pp", dir: "down" }, { v: "1.31%", d: "0.2pp", dir: "down" }], star: true },
      { label: "总曝光人数", cells: [{ v: "18,669,780", d: "5.7%", dir: "down" }, { v: "7,291,206", d: "5.1%", dir: "down" }, { v: "11,378,574", d: "6.0%", dir: "down" }], star: true },
      { label: "店均曝光人数", cells: [{ v: "43,418", d: "6.1%", dir: "down" }, { v: "18,792", d: "5.4%", dir: "down" }, { v: "26,462", d: "6.5%", dir: "down" }], star: false },
      { label: "进店率", cells: [{ v: "7.7%", d: "0.4pp", dir: "down" }, { v: "8.3%", d: "0.4pp", dir: "down" }, { v: "7.3%", d: "0.4pp", dir: "down" }], star: true },
      { label: "下单率", cells: [{ v: "19.5%", d: "0.5pp", dir: "down" }, { v: "21.8%", d: "0.4pp", dir: "up" }, { v: "17.9%", d: "1.1pp", dir: "down" }], star: true },
      { label: "自然曝光占比", cells: [{ v: "54.7%", d: "1.3pp", dir: "down" }, { v: "36.3%", d: "1.1pp", dir: "down" }, { v: "73.3%", d: "0.2pp", dir: "down" }], star: false },
      { label: "曝光新客", cells: [{ v: "15,468,029", d: "5.4%", dir: "down" }, { v: "5,969,917", d: "4.6%", dir: "down" }, { v: "9,493,112", d: "5.9%", dir: "down" }], star: false },
      { label: "新客进店率", cells: [{ v: "6.6%", d: "0.3pp", dir: "down" }, { v: "7.3%", d: "0.2pp", dir: "down" }, { v: "6.2%", d: "0.3pp", dir: "down" }], star: false },
      { label: "新客下单率", cells: [{ v: "14.7%", d: "0.4pp", dir: "down" }, { v: "15.9%", d: "0.3pp", dir: "up" }, { v: "13.8%", d: "0.9pp", dir: "down" }], star: false },
      { label: "老客进店率", cells: [{ v: "13.1%", d: "0.4pp", dir: "down" }, { v: "13.0%", d: "0.4pp", dir: "down" }, { v: "13.1%", d: "0.5pp", dir: "down" }], star: false },
      { label: "老客下单率", cells: [{ v: "31.3%", d: "0.8pp", dir: "down" }, { v: "36.6%", d: "0.6pp", dir: "up" }, { v: "27.6%", d: "1.8pp", dir: "down" }], star: false }
    ],
    order: [
      { label: "有效订单", cells: [{ v: "288,977", d: "12.5%", dir: "down" }, { v: "135,260", d: "8.0%", dir: "down" }, { v: "153,717", d: "16.1%", dir: "down" }], star: true },
      { label: "客单价", cells: [{ v: "¥20.2", d: "1.2%", dir: "up" }, { v: "¥22.1", d: "1.8%", dir: "up" }, { v: "¥18.6", d: "0.1%", dir: "down" }], star: false },
      { label: "单均实付", cells: [{ v: "¥27", d: "0.1%", dir: "down" }, { v: "¥30", d: "2.6%", dir: "down" }, { v: "¥24", d: "1.6%", dir: "up" }], star: false },
      { label: "单均实收", cells: [{ v: "¥20.2", d: "1.2%", dir: "up" }, { v: "¥22.1", d: "1.8%", dir: "up" }, { v: "¥18.6", d: "0.4%", dir: "up" }], star: false },
      { label: "复购订单占比", cells: [{ v: "38.6%", d: "0.7pp", dir: "up" }, { v: "36.2%", d: "0.4pp", dir: "up" }, { v: "40.8%", d: "1.1pp", dir: "up" }], star: false },
      { label: "单均配送费", cells: [{ v: "¥3.6", d: "0.2%", dir: "down" }, { v: "¥3.8", d: "0.3%", dir: "down" }, { v: "¥3.4", d: "0.1%", dir: "up" }], star: false }
    ],
    activity: [
      { label: "补贴及支出", cells: [{ v: "¥5,618,620", d: "11.9%", dir: "down" }, { v: "¥2,814,486", d: "7.7%", dir: "down" }, { v: "¥2,804,134", d: "15.7%", dir: "down" }], star: false },
      { label: "商家活动支出", cells: [{ v: "¥3,444,192", d: "11.5%", dir: "down" }, { v: "¥1,695,149", d: "7.7%", dir: "down" }, { v: "¥1,749,042", d: "15.6%", dir: "down" }], star: false },
      { label: "活动补贴", cells: [{ v: "¥2,804,143", d: "9.5%", dir: "down" }, { v: "¥2,355,309", d: "7.3%", dir: "down" }, { v: "¥448,835", d: "19.4%", dir: "down" }], star: false },
      { label: "平台活动补贴", cells: [{ v: "¥1,512,899", d: "15.4%", dir: "down" }, { v: "¥660,159", d: "6.2%", dir: "down" }, { v: "¥852,740", d: "21.4%", dir: "down" }], star: false },
      { label: "平台服务费（含佣金和配送服务费）", cells: [{ v: "¥1,937,295", d: "12.8%", dir: "down" }, { v: "¥903,506", d: "9.0%", dir: "down" }, { v: "¥1,033,789", d: "16.0%", dir: "down" }], star: false }
    ],
    profit: [
      { label: "外卖毛利润（实收口径）", cells: [{ v: "¥2,650,738", d: "9.6%", dir: "down" }, { v: "¥1,457,620", d: "3.7%", dir: "down" }, { v: "¥1,193,118", d: "16.0%", dir: "down" }], star: false },
      { label: "外卖毛利率（实收口径）", cells: [{ v: "45.4%", d: "0.9pp", dir: "up" }, { v: "48.8%", d: "1.4pp", dir: "up" }, { v: "41.8%", d: "0.1pp", dir: "up" }], star: false },
      { label: "食材成本", cells: [{ v: "¥2,115,480", d: "10.2%", dir: "down" }, { v: "¥1,163,120", d: "4.1%", dir: "down" }, { v: "¥952,360", d: "16.8%", dir: "down" }], star: false },
      { label: "包装成本", cells: [{ v: "¥387,942", d: "8.4%", dir: "down" }, { v: "¥203,071", d: "5.6%", dir: "down" }, { v: "¥184,871", d: "12.9%", dir: "down" }], star: false }
    ],
    service: [
      { label: "无效订单数", cells: [{ v: "5,628", d: "1.3%", dir: "down" }, { v: "2,904", d: "5.9%", dir: "up" }, { v: "2,724", d: "8.1%", dir: "down" }], star: false },
      { label: "无效订单率", cells: [{ v: "1.9%", d: "0.2pp", dir: "up" }, { v: "2.1%", d: "0.3pp", dir: "up" }, { v: "1.7%", d: "0.2pp", dir: "up" }], star: false },
      { label: "商责取消订单", cells: [{ v: "746" }, { v: "145" }, { v: "601" }], star: false },
      { label: "商责取消率", cells: [{ v: "0.25%" }, { v: "0.10%" }, { v: "0.38%" }], star: true },
      { label: "店铺分", cells: [{ v: "不可直接合并", muted: true }, { v: "97", d: "环比持平", dir: "flat" }, { v: "4.08", d: "0.6%", dir: "down" }], star: false },
      { label: "综合体验分", cells: [{ v: "不可直接合并", muted: true }, { v: "4.6", d: "0.2%", dir: "down" }, { v: "源报表未提供", muted: true }], star: false },
      { label: "消息回复率", cells: [{ v: "不可直接合并", muted: true }, { v: "90.1%", d: "0.2pp", dir: "up" }, { v: "85.6%", d: "1.2pp", dir: "down" }], star: false },
      { label: "出餐完成上报率/配送准时率", cells: [{ v: "不可直接合并", muted: true }, { v: "97.8%", d: "0.4pp", dir: "down" }, { v: "96.7%", d: "1.1pp", dir: "down" }], star: false }
    ]
  },
  trendCards: [
    {
      title: "外卖GMV（原）", value: "¥90.4万", delta: "2.9%", dir: "up", unit: "万",
      labels: [
        { a: "11-01", b: "周日" }, { a: "11-02", b: "周一" }, { a: "11-03", b: "周二" },
        { a: "11-04", b: "周三" }, { a: "11-05", b: "周四" }, { a: "11-06", b: "周五" },
        { a: "11-07", b: "周六" }, { a: "11-08", b: "周日" }, { a: "11-09", b: "周一" },
        { a: "11-10", b: "周二" }, { a: "11-11", b: "周三" }, { a: "11-12", b: "周四" }
      ],
      values: [82.4, 88.1, 90.3, 86.7, 84.2, 89.6, 91.8, 87.5, 85.9, 88.4, 90.2, 86.1]
    },
    {
      title: "外卖收入", value: "¥61.8万", delta: "3.4%", dir: "up", unit: "万",
      labels: [
        { a: "11-01", b: "周日" }, { a: "11-02", b: "周一" }, { a: "11-03", b: "周二" },
        { a: "11-04", b: "周三" }, { a: "11-05", b: "周四" }, { a: "11-06", b: "周五" },
        { a: "11-07", b: "周六" }, { a: "11-08", b: "周日" }, { a: "11-09", b: "周一" },
        { a: "11-10", b: "周二" }, { a: "11-11", b: "周三" }, { a: "11-12", b: "周四" }
      ],
      values: [56.2, 60.4, 61.8, 59.1, 57.5, 61.2, 62.7, 59.8, 58.6, 60.1, 61.5, 58.9]
    },
    {
      title: "外卖有效订单", value: "27,412 单", delta: "2.1%", dir: "up", unit: "单",
      labels: [
        { a: "11-01", b: "周日" }, { a: "11-02", b: "周一" }, { a: "11-03", b: "周二" },
        { a: "11-04", b: "周三" }, { a: "11-05", b: "周四" }, { a: "11-06", b: "周五" },
        { a: "11-07", b: "周六" }, { a: "11-08", b: "周日" }, { a: "11-09", b: "周一" },
        { a: "11-10", b: "周二" }, { a: "11-11", b: "周三" }, { a: "11-12", b: "周四" }
      ],
      values: [24812, 26504, 27186, 26044, 25418, 26930, 27562, 26318, 25824, 26612, 27140, 25986]
    }
  ],
  province: {
    title: "各省份店日均实收环比&门店数量（全部 · 门店数 TOP10 省份）",
    labels: ["江苏", "广东", "浙江", "上海", "山东", "北京", "四川", "安徽", "福建", "陕西"],
    bars: [70.4, 68.2, 43.1, 40.6, 26.3, 24.8, 22.5, 18.7, 12.4, 11.2],
    line: [45, 38, 52, 30, 26, 22, 20, 18, 15, 12],
    table: [
      { name: "四川", value: "1,858", delta: "58%", dir: "up" },
      { name: "上海", value: "1,831", delta: "56%", dir: "up" },
      { name: "广东", value: "1,647", delta: "40%", dir: "up" },
      { name: "北京", value: "1,455", delta: "24%", dir: "up" },
      { name: "江苏", value: "1,114", delta: "5%", dir: "down" },
      { name: "浙江", value: "944", delta: "20%", dir: "down" },
      { name: "福建", value: "750", delta: "36%", dir: "down" },
      { name: "安徽", value: "705", delta: "40%", dir: "down" },
      { name: "山东", value: "691", delta: "41%", dir: "down" },
      { name: "陕西", value: "658", delta: "44%", dir: "down" }
    ]
  },
  storeTrend: {
    title: "开店闭店情况（全部 · 近 12 个月趋势）",
    labels: ["11月", "12月", "1月", "2月", "3月", "4月", "5月", "6月", "7月", "8月", "9月", "10月"],
    open: [28, 24, 18, 15, 32, 26, 52, 32, 35, 28, 30, 40],
    close: [6, 5, 9, 12, 8, 10, 2, 8, 5, 18, 22, 18]
  },
  storeRanking: [
    { rank: 1, name: "长沙万象城店", cells: [{ v: "¥68,281", d: "13.1%", dir: "up" }, { v: "¥45,971", d: "11.2%", dir: "up" }, { v: "67.3%", d: "1.7pp", dir: "up" }, { v: "2,195", d: "10.2%", dir: "up" }, { v: "¥29.9", d: "1.2%", dir: "up" }, { v: "113,702", d: "0.3%", dir: "up" }] },
    { rank: 2, name: "北京三里屯店", cells: [{ v: "¥64,209", d: "19.1%", dir: "up" }, { v: "¥42,932", d: "18.9%", dir: "up" }, { v: "66.9%", d: "2.6pp", dir: "up" }, { v: "2,004", d: "16.5%", dir: "up" }, { v: "¥27.4", d: "0.6%", dir: "up" }, { v: "117,672", d: "10.5%", dir: "up" }] },
    { rank: 3, name: "北京朝阳大悦城店", cells: [{ v: "¥57,977", d: "11.5%", dir: "up" }, { v: "¥38,642", d: "12.4%", dir: "up" }, { v: "66.5%", d: "1.0pp", dir: "up" }, { v: "1,559", d: "17.3%", dir: "up" }, { v: "¥19.6", d: "0.4%", dir: "up" }, { v: "158,829", d: "6.6%", dir: "up" }] },
    { rank: 4, name: "上海新天地店", cells: [{ v: "¥56,438", d: "8.2%", dir: "up" }, { v: "¥37,910", d: "7.6%", dir: "up" }, { v: "67.2%", d: "0.9pp", dir: "up" }, { v: "1,806", d: "6.4%", dir: "up" }, { v: "¥28.4", d: "1.1%", dir: "up" }, { v: "121,340", d: "2.2%", dir: "up" }] },
    { rank: 5, name: "深圳湾万象城店", cells: [{ v: "¥54,120", d: "21.4%", dir: "up" }, { v: "¥36,448", d: "20.7%", dir: "up" }, { v: "67.3%", d: "1.4pp", dir: "up" }, { v: "1,712", d: "19.8%", dir: "up" }, { v: "¥26.8", d: "0.8%", dir: "up" }, { v: "109,884", d: "12.6%", dir: "up" }] },
    { rank: 6, name: "广州天河南店", cells: [{ v: "¥51,776", d: "6.7%", dir: "up" }, { v: "¥34,531", d: "5.9%", dir: "up" }, { v: "66.7%", d: "0.5pp", dir: "up" }, { v: "1,654", d: "4.8%", dir: "up" }, { v: "¥25.9", d: "0.7%", dir: "up" }, { v: "104,226", d: "1.8%", dir: "up" }] },
    { rank: 7, name: "上海世博天地店", cells: [{ v: "¥49,882", d: "24.3%", dir: "up" }, { v: "¥33,602", d: "23.5%", dir: "up" }, { v: "67.4%", d: "0.6pp", dir: "up" }, { v: "1,590", d: "22.1%", dir: "up" }, { v: "¥26.3", d: "1.0%", dir: "up" }, { v: "98,740", d: "15.4%", dir: "up" }] },
    { rank: 8, name: "杭州湖滨银泰店", cells: [{ v: "¥47,315", d: "9.9%", dir: "up" }, { v: "¥31,884", d: "9.1%", dir: "up" }, { v: "67.4%", d: "0.7pp", dir: "up" }, { v: "1,522", d: "8.6%", dir: "up" }, { v: "¥25.1", d: "0.5%", dir: "up" }, { v: "96,318", d: "4.3%", dir: "up" }] },
    { rank: 9, name: "南京德基广场店", cells: [{ v: "¥45,906", d: "18.6%", dir: "up" }, { v: "¥30,947", d: "17.9%", dir: "up" }, { v: "67.4%", d: "0.4pp", dir: "up" }, { v: "1,468", d: "16.9%", dir: "up" }, { v: "¥24.7", d: "0.6%", dir: "up" }, { v: "92,105", d: "9.7%", dir: "up" }] },
    { rank: 10, name: "成都春熙路店", cells: [{ v: "¥44,702", d: "3.4%", dir: "down" }, { v: "¥29,981", d: "4.1%", dir: "down" }, { v: "67.1%", d: "0.5pp", dir: "down" }, { v: "1,440", d: "5.2%", dir: "down" }, { v: "¥24.2", d: "0.9%", dir: "up" }, { v: "90,662", d: "6.1%", dir: "down" }] },
    { rank: 11, name: "武汉江汉路店", cells: [{ v: "¥42,118", d: "8.9%", dir: "down" }, { v: "¥28,244", d: "9.6%", dir: "down" }, { v: "67.1%", d: "0.6pp", dir: "down" }, { v: "1,362", d: "10.4%", dir: "down" }, { v: "¥23.9", d: "0.7%", dir: "up" }, { v: "87,430", d: "9.8%", dir: "down" }] },
    { rank: 12, name: "苏州十全街店", cells: [{ v: "¥40,864", d: "5.2%", dir: "up" }, { v: "¥27,502", d: "4.6%", dir: "up" }, { v: "67.3%", d: "0.3pp", dir: "up" }, { v: "1,318", d: "3.9%", dir: "up" }, { v: "¥23.6", d: "0.5%", dir: "up" }, { v: "84,912", d: "2.7%", dir: "up" }] },
    { rank: 13, name: "福州烟台山店", cells: [{ v: "¥38,977", d: "15.8%", dir: "up" }, { v: "¥26,254", d: "15.1%", dir: "up" }, { v: "67.4%", d: "0.2pp", dir: "up" }, { v: "1,246", d: "14.6%", dir: "up" }, { v: "¥23.1", d: "0.4%", dir: "up" }, { v: "81,406", d: "8.5%", dir: "up" }] },
    { rank: 14, name: "泉州古城西街店", cells: [{ v: "¥37,642", d: "7.4%", dir: "up" }, { v: "¥25,344", d: "6.8%", dir: "up" }, { v: "67.3%", d: "0.3pp", dir: "up" }, { v: "1,218", d: "6.1%", dir: "up" }, { v: "¥22.8", d: "0.6%", dir: "up" }, { v: "79,880", d: "3.9%", dir: "up" }] },
    { rank: 15, name: "上海新丸中心店", cells: [{ v: "¥36,518", d: "2.1%", dir: "up" }, { v: "¥24,576", d: "1.6%", dir: "up" }, { v: "67.3%", d: "0.1pp", dir: "up" }, { v: "1,176", d: "1.2%", dir: "up" }, { v: "¥22.5", d: "0.4%", dir: "up" }, { v: "77,214", d: "0.8%", dir: "up" }] },
    { rank: 16, name: "北京国贸店", cells: [{ v: "¥35,206", d: "12.9%", dir: "up" }, { v: "¥23,728", d: "12.2%", dir: "up" }, { v: "67.4%", d: "0.2pp", dir: "up" }, { v: "1,142", d: "11.8%", dir: "up" }, { v: "¥22.1", d: "0.3%", dir: "up" }, { v: "75,662", d: "6.9%", dir: "up" }] },
    { rank: 17, name: "广州东方宝泰店", cells: [{ v: "¥33,984", d: "4.6%", dir: "up" }, { v: "¥22,842", d: "4.1%", dir: "up" }, { v: "67.2%", d: "0.2pp", dir: "up" }, { v: "1,106", d: "3.7%", dir: "up" }, { v: "¥21.8", d: "0.4%", dir: "up" }, { v: "73,105", d: "1.9%", dir: "up" }] },
    { rank: 18, name: "深圳海岸城店", cells: [{ v: "¥32,660", d: "6.2%", dir: "down" }, { v: "¥21,986", d: "6.9%", dir: "down" }, { v: "67.3%", d: "0.4pp", dir: "up" }, { v: "1,074", d: "7.5%", dir: "down" }, { v: "¥21.4", d: "0.6%", dir: "up" }, { v: "71,488", d: "5.3%", dir: "down" }] },
    { rank: 19, name: "长沙IFS店", cells: [{ v: "¥31,420", d: "16.4%", dir: "up" }, { v: "¥21,148", d: "15.7%", dir: "up" }, { v: "67.3%", d: "0.3pp", dir: "up" }, { v: "1,042", d: "15.2%", dir: "up" }, { v: "¥21.1", d: "0.5%", dir: "up" }, { v: "69,872", d: "10.1%", dir: "up" }] },
    { rank: 20, name: "南京新街口店", cells: [{ v: "¥30,118", d: "2.7%", dir: "down" }, { v: "¥20,264", d: "3.3%", dir: "down" }, { v: "67.3%", d: "0.1pp", dir: "up" }, { v: "998", d: "3.8%", dir: "down" }, { v: "¥20.8", d: "0.4%", dir: "up" }, { v: "67,905", d: "3.6%", dir: "down" }] }
  ]
};

/* ================= 流量转化概览 ================= */
window.DASHBOARD_DATA.trafficOverview = {
  title: "流量转化概览",
  updatedAt: "数据更新时间 2026-09-27 09:00",
  filters: {
    quick: ["今日", "昨日", "近7天", "近30天"],
    dateStart: "2026-09-16",
    dateEnd: "2026-09-27",
    platforms: ["全部平台", "美团", "饿了么"],
    stores: ["全部门店", "北京朝阳大悦城店", "上海新天地店", "长沙万象城店"]
  },
  kpis: [
    { label: "总曝光人数", value: "18,669,780", delta: "5.7%", diff: "(-1,127,531)", dir: "down" },
    { label: "总进店人数", value: "4,182,375", delta: "3.9%", diff: "(+18,164)", dir: "up" },
    { label: "入店转化率", value: "7.7%", delta: "4.7%", diff: "(-0.4pp)", dir: "down" },
    { label: "下单转化率", value: "19.5%", delta: "2.9%", diff: "(-0.5pp)", dir: "down" },
    { label: "总转化率", value: "1.5%", delta: "7.6%", diff: "(-0.1pp)", dir: "down" },
    { label: "人均下单频次", value: "待数据", delta: "", diff: "比上月 —（暂无可比数据）", dir: "flat", muted: true }
  ],
  trend: {
    labels: ["09-16", "09-17", "09-18", "09-19", "09-20", "09-21", "09-22", "09-23", "09-24", "09-25", "09-26", "09-27"],
    exposure: [14200, 15100, 14800, 15600, 14900, 15300, 16000, 14700, 15200, 15800, 16100, 15400],
    visits: [1080, 1160, 1140, 1210, 1150, 1190, 1240, 1130, 1180, 1230, 1250, 1190],
    orderRate: [19.2, 19.8, 19.5, 20.1, 19.4, 20.3, 20.8, 19.1, 19.7, 20.2, 20.5, 19.6]
  },
  histograms: {
    enter: { title: "入店转化率分布（双平台汇总）", labels: ["0~2%", "2~4%", "4~6%", "6~8%", "8~10%", "10%+"], values: [128, 462, 824, 638, 306, 92] },
    order: { title: "下单转化率分布（双平台汇总）", labels: ["0~5%", "5~10%", "10~15%", "15~20%", "20%+"], values: [86, 318, 612, 538, 276] }
  },
  scatter: {
    title: "门店流量转化分层（双平台汇总 · 曝光量 × 总转化率）",
    medianX: 52000,
    medianY: 1.25,
    points: (function () {
      const list = [];
      for (let i = 0; i < 56; i++) {
        const x = 6000 + ((i * 7919) % 148000);
        const y = Math.round((0.4 + ((i * 37) % 27) / 10) * 100) / 100;
        list.push({ x: x, y: y });
      }
      return list;
    })()
  },
  stores: [
    { name: "北京朝阳大悦城店", score: "A", exposure: "158,829", enter: "6.1%", order: "19.8%", total: "1.2%", delta: "4.6%", dir: "down" },
    { name: "上海新天地店", score: "B", exposure: "125,783", enter: "5.7%", order: "16.7%", total: "1.0%", delta: "3.8%", dir: "down" },
    { name: "北京三里屯店", score: "A", exposure: "117,672", enter: "6.4%", order: "25.2%", total: "1.6%", delta: "2.6%", dir: "down" },
    { name: "五角场合生汇店", score: "B", exposure: "114,611", enter: "6.3%", order: "21.2%", total: "1.3%", delta: "0.3%", dir: "down" },
    { name: "长沙万象城店", score: "A", exposure: "113,702", enter: "8.4%", order: "21.3%", total: "1.8%", delta: "0.3%", dir: "up" },
    { name: "赣州万象城店", score: "B", exposure: "107,921", enter: "5.8%", order: "13.7%", total: "0.8%", delta: "4.6%", dir: "up" },
    { name: "上海真如环宇城店", score: "C", exposure: "107,429", enter: "5.9%", order: "18.1%", total: "1.1%", delta: "5.9%", dir: "down" },
    { name: "深圳中航城君尚店", score: "A", exposure: "104,713", enter: "6.4%", order: "22.7%", total: "1.4%", delta: "1.2%", dir: "up" },
    { name: "北京枫蓝国际店", score: "B", exposure: "103,552", enter: "7.2%", order: "23.4%", total: "1.7%", delta: "0.4%", dir: "down" },
    { name: "深圳宝安万象店", score: "B", exposure: "101,450", enter: "7.5%", order: "20.6%", total: "1.5%", delta: "2.4%", dir: "down" },
    { name: "深圳壹方天地店", score: "A", exposure: "100,392", enter: "7.1%", order: "23.0%", total: "1.6%", delta: "1.4%", dir: "down" },
    { name: "武汉新天地店", score: "B", exposure: "100,320", enter: "7.1%", order: "18.1%", total: "1.3%", delta: "2.0%", dir: "up" },
    { name: "常州新北万达店", score: "C", exposure: "98,423", enter: "5.7%", order: "18.4%", total: "1.1%", delta: "0.7%", dir: "down" },
    { name: "宁波青秀里店", score: "C", exposure: "96,506", enter: "6.8%", order: "18.4%", total: "1.3%", delta: "5.8%", dir: "down" },
    { name: "杭州恒隆广场店", score: "B", exposure: "92,950", enter: "7.3%", order: "19.2%", total: "1.4%", delta: "10.1%", dir: "down" },
    { name: "海珠宝岗店", score: "B", exposure: "91,958", enter: "6.7%", order: "22.5%", total: "1.5%", delta: "5.7%", dir: "up" }
  ]
};

/* ================= 推广分析 ================= */
window.DASHBOARD_DATA.promotionAnalysis = {
  title: "推广分析",
  updatedAt: "数据更新时间 2026-11-13 08:00",
  filters: {
    platforms: ["全部", "美团", "饿了么"],
    stores: ["全部门店", "广州维多利广场店", "上海新天地店", "北京朝阳大悦城店"],
    dateStart: "2026-10-14",
    dateEnd: "2026-11-12"
  },
  kpis: [
    { label: "推广花费", value: "¥384,918.5", delta: "6.0%", diff: "(-24,393.5)", dir: "down" },
    { label: "推广营业额", value: "¥3,696,621.1", delta: "11.4%", diff: "(+475,777)", dir: "up" },
    { label: "ROI", value: "9.6", delta: "5.7%", diff: "(-0.6)", dir: "down" },
    { label: "推广订单数", value: "84,105", delta: "10.6%", diff: "(-10,003)", dir: "down" },
    { label: "日均推广费", value: "¥89.6", delta: "4.8%", diff: "(-4.6)", dir: "down" },
    { label: "推广成本率", value: "3.7%", delta: "7.2%", diff: "(+0.2pp)", dir: "up" },
    { label: "推广曝光提升数", value: "19,893,611", delta: "1.1%", diff: "(-212,811)", dir: "down" },
    { label: "推广曝光占比", value: "42.4%", delta: "3.7%", diff: "(+1.5pp)", dir: "up" }
  ],
  trend: {
    labels: ["10-14", "10-15", "10-16", "10-17", "10-18", "10-19", "10-20", "10-21", "10-22", "10-23", "10-24", "10-25", "10-26", "10-27", "10-28", "10-29", "10-30", "10-31", "11-01", "11-02", "11-03", "11-04", "11-05", "11-06", "11-07", "11-08", "11-09", "11-10", "11-11", "11-12"],
    overall: [320, 335, 342, 318, 356, 348, 330, 362, 371, 340, 352, 366, 358, 344, 332, 368, 376, 350, 338, 362, 371, 345, 356, 368, 352, 340, 358, 366, 351, 344],
    promo: [46, 52, 48, 44, 56, 53, 47, 58, 61, 49, 54, 57, 55, 51, 48, 59, 62, 52, 50, 56, 60, 51, 54, 58, 55, 52, 57, 60, 53, 50],
    spend: [3.1, 3.4, 3.2, 3.0, 3.5, 3.3, 3.1, 3.6, 3.7, 3.2, 3.4, 3.6, 3.5, 3.3, 3.1, 3.6, 3.8, 3.3, 3.2, 3.5, 3.6, 3.3, 3.4, 3.6, 3.5, 3.3, 3.6, 3.7, 3.4, 3.2]
  },
  roiTrend: {
    spend: [82, 96, 88, 74, 102, 94, 86, 108, 112, 90, 98, 105, 101, 92, 84, 106, 114, 95, 89, 100, 103, 91, 97, 105, 99, 93, 104, 110, 96, 88],
    roi: [9.2, 9.6, 9.8, 9.1, 10.1, 9.7, 9.4, 10.3, 10.5, 9.8, 10.0, 10.2, 10.1, 9.7, 9.3, 10.2, 10.6, 9.6, 9.4, 10.0, 10.1, 9.5, 9.8, 10.2, 10.0, 9.7, 10.1, 10.3, 9.6, 9.4],
    costRate: [3.9, 3.7, 3.6, 4.0, 3.5, 3.6, 3.8, 3.4, 3.3, 3.7, 3.6, 3.5, 3.5, 3.7, 3.9, 3.4, 3.3, 3.6, 3.8, 3.5, 3.4, 3.7, 3.6, 3.5, 3.6, 3.7, 3.5, 3.4, 3.6, 3.8]
  },
  scatter: {
    title: "花费—流水散点（找「高花费低产出」）",
    axisX: "区间花费（元）",
    axisY: "区间流水（元）",
    meituan: (function () {
      const list = [];
      for (let i = 0; i < 110; i++) {
        const x = 240 + ((i * 173) % 6900);
        const base = x * 4.4;
        const y = Math.round(base * (0.55 + ((i * 29) % 55) / 100));
        list.push({ x: x, y: Math.min(30000, y) });
      }
      return list;
    })(),
    eleme: (function () {
      const list = [];
      for (let i = 0; i < 80; i++) {
        const x = 180 + ((i * 211) % 5200);
        const base = x * 3.9;
        const y = Math.round(base * (0.5 + ((i * 41) % 60) / 100));
        list.push({ x: x, y: Math.min(30000, y) });
      }
      return list;
    })()
  },
  products: [
    { name: "点金推广", target: "门店流水", spend: "¥138,377", exposure: "11,964,355", enter: "1.6%", order: "10.7%", orders: "20,742", gmv: "¥690,107", cost: "¥0.71", roi: "6.88" },
    { name: "揽客宝", target: "门店流水", spend: "¥38,133", exposure: "2,170,763", enter: "5.5%", order: "17.5%", orders: "20,974", gmv: "¥706,325", cost: "¥0.32", roi: "25.32" },
    { name: "赏金联盟", target: "门店流水", spend: "¥25,109", exposure: "—", enter: "—", order: "—", orders: "2,378", gmv: "¥65,298", cost: "—", roi: "3.88" },
    { name: "店铺魔方", target: "门店流水", spend: "¥7,274", exposure: "327,164", enter: "2.9%", order: "12.6%", orders: "1,209", gmv: "¥39,634", cost: "¥0.76", roi: "7.16" },
    { name: "津味宝", target: "门店流水", spend: "¥3,797", exposure: "—", enter: "—", order: "—", orders: "1,111", gmv: "¥29,781", cost: "—", roi: "12.40" },
    { name: "铂金展位", target: "门店流水", spend: "¥1,759", exposure: "42,138", enter: "2.3%", order: "5.3%", orders: "52", gmv: "¥1,854", cost: "¥1.80", roi: "1.38" },
    { name: "流量助手", target: "门店流水", spend: "¥1,619", exposure: "25,508", enter: "7.2%", order: "10.8%", orders: "199", gmv: "¥7,344", cost: "¥0.68", roi: "5.82" },
    { name: "超级流量卡", target: "门店流水", spend: "¥544", exposure: "6,775", enter: "3.4%", order: "8.7%", orders: "20", gmv: "¥509", cost: "¥1.49", roi: "2.29" }
  ],
  roiGrid: (function () {
    const columns = ["江苏", "广东", "浙江", "上海", "山东", "北京", "四川", "安徽", "福建", "陕西"];
    const names = ["铂金展位", "超级流量卡", "点金推广", "津味宝", "流量助手", "赏金联盟", "店铺魔方", "揽客宝"];
    return {
      columns: columns,
      rows: names.map((name, i) => ({
        name: name,
        cells: columns.map((c, j) => ({
          roi: Math.round((2.4 + (((i * 7 + j * 11) % 24) + 0.6)) * 10) / 10,
          spend: 500 + ((i * 337 + j * 811) % 4800)
        }))
      }))
    };
  })(),
  storeRows: [
    { name: "广州维多利广场店", tk: "TK0411", platform: "美团", spend: "6,129", roi: "5.20", costRate: "18.40%", orders: "75", exposure: "78,020" },
    { name: "江西新干新百店", tk: "TK0307", platform: "美团", spend: "4,914", roi: "6.57", costRate: "12.62%", orders: "768", exposure: "102,816" },
    { name: "上海新天地店", tk: "TK0083", platform: "饿了么", spend: "3,566", roi: "4.52", costRate: "10.33%", orders: "343", exposure: "85,863" },
    { name: "北京枫蓝国际店", tk: "TK0371", platform: "饿了么", spend: "3,642", roi: "5.62", costRate: "7.97%", orders: "505", exposure: "103,452" },
    { name: "青岛印象城店", tk: "TK0419", platform: "美团", spend: "2,678", roi: "8.54", costRate: "6.12%", orders: "468", exposure: "56,733" },
    { name: "北京三里屯店", tk: "TK0221", platform: "美团", spend: "2,642", roi: "7.78", costRate: "5.22%", orders: "401", exposure: "124,096" },
    { name: "无锡融创茂店", tk: "TK0412", platform: "美团", spend: "2,415", roi: "9.11", costRate: "12.10%", orders: "550", exposure: "71,374" },
    { name: "北京国贸店", tk: "TK0111", platform: "美团", spend: "2,513", roi: "5.05", costRate: "9.12%", orders: "283", exposure: "80,666" },
    { name: "北京朝阳大悦城店", tk: "TK0048", platform: "美团", spend: "2,354", roi: "5.50", costRate: "7.97%", orders: "208", exposure: "140,153" },
    { name: "上海真如环宇城店", tk: "TK0318", platform: "饿了么", spend: "2,308", roi: "5.61", costRate: "10.69%", orders: "292", exposure: "41,320" }
  ]
};

/* ================= 订单结构分析 ================= */
window.DASHBOARD_DATA.orderStructure = {
  title: "订单结构分析",
  updatedAt: "数据更新时间 2026-11-13 08:00",
  filters: {
    quick: ["今日", "昨日", "近7天", "近30天"],
    dateStart: "2026-11-01",
    dateEnd: "2026-11-12",
    platforms: ["全部", "美团", "饿了么"],
    stores: ["门店维度：全部", "深圳湾万象城店", "北京三里屯店", "上海新天地店"]
  },
  summary: {
    title: "订单数据概览",
    period: "2026-11-01 至 2026-11-12",
    platform: "饿了么",
    total: "284,730",
    unit: "单"
  },
  timeSlots: [
    { name: "早餐", range: "06:00-10:00", count: "7,698", share: "2.7%", width: 6 },
    { name: "午餐", range: "10:00-14:00", count: "111,556", share: "39.2%", width: 100 },
    { name: "下午茶", range: "14:00-17:00", count: "81,721", share: "28.7%", width: 73 },
    { name: "晚餐", range: "17:00-20:00", count: "58,015", share: "20.4%", width: 52 },
    { name: "夜宵", range: "20:00-次日06:00", count: "25,740", share: "9.0%", width: 23 }
  ],
  week: [
    { name: "周日", count: "62,542", share: "22.0%", width: 100 },
    { name: "周一", count: "38,740", share: "13.6%", width: 62 },
    { name: "周二", count: "39,321", share: "13.8%", width: 63 },
    { name: "周三", count: "40,297", share: "14.2%", width: 64 },
    { name: "周四", count: "40,722", share: "14.3%", width: 65 },
    { name: "周五", count: "27,673", share: "9.7%", width: 44 },
    { name: "周六", count: "35,435", share: "12.4%", width: 57 }
  ],
  amount: {
    tabs: ["订单量", "用户实付", "商家实收"],
    sample: "金额有效样本 284,730 / 284,730 单",
    step: "5元一档",
    rows: [
      { range: "10元以下", count: "6,402", share: "2.3%" },
      { range: "10-15元", count: "28,542", share: "10.0%" },
      { range: "15-20元", count: "110,815", share: "38.9%" },
      { range: "20-25元", count: "33,672", share: "11.8%" },
      { range: "25-30元", count: "19,356", share: "6.8%" },
      { range: "30-35元", count: "30,303", share: "10.6%" },
      { range: "35-40元", count: "13,097", share: "4.6%" },
      { range: "40-45元", count: "9,111", share: "3.2%" },
      { range: "45-50元", count: "6,833", share: "2.4%" },
      { range: "50-60元", count: "7,972", share: "2.8%" },
      { range: "60-70元", count: "5,410", share: "1.9%" },
      { range: "70-80元", count: "3,986", share: "1.4%" },
      { range: "80-90元", count: "2,847", share: "1.0%" },
      { range: "90-100元", count: "1,993", share: "0.7%" },
      { range: "100元以上", count: "4,391", share: "1.5%" }
    ]
  },
  cups: {
    rows: [
      { range: "1杯", count: "194,195", share: "68.2%" },
      { range: "2杯", count: "68,989", share: "24.2%" },
      { range: "3杯", count: "12,341", share: "4.3%" },
      { range: "4杯", count: "4,745", share: "1.7%" },
      { range: "5杯", count: "1,744", share: "0.6%" },
      { range: "6杯", count: "816", share: "0.3%" },
      { range: "7杯", count: "512", share: "0.2%" },
      { range: "8杯", count: "388", share: "0.1%" },
      { range: "9杯", count: "174", share: "0.1%" },
      { range: "10杯以上", count: "826", share: "0.3%" }
    ]
  }
};

/* ================= 基本面分析 ================= */
window.DASHBOARD_DATA.fundamentalAnalysis = {
  title: "基本面分析",
  updatedAt: "数据更新时间 2026-11-13 08:00",
  filters: {
    quick: ["今日", "昨日", "近7天", "近30天"],
    dateStart: "2026-11-01",
    dateEnd: "2026-11-13",
    platforms: ["全部", "美团", "饿了么"],
    stores: ["门店维度：全部", "深圳湾万象城店", "北京三里屯店", "上海新天地店"]
  },
  kpis: [
    { label: "美团店铺分（店内）", value: "97.0", diff: "比上月 —（暂无同比数据）" },
    { label: "饿了么店铺分（店内）", value: "95.2", delta: "0.9%", diff: "(-0.8)", dir: "down" },
    { label: "商家评分（店铺）", value: "4.6", diff: "比上月 —（暂无同比数据）" },
    { label: "京东店铺分（店内）", value: "—", diff: "比上月 —（暂无同比数据）", muted: true },
    { label: "基础任务完成率（店内）", value: "76.4%", delta: "1.4%", diff: "(-1.1pp)", dir: "down" }
  ],
  sixDim: {
    labels: ["口味", "包装", "基础服务评分", "消费者满意度评分", "履约情况评分", "食品安全评分"],
    meituan: [4.7, 4.7, 3.8, 4.3, 4.9, 4.9],
    eleme: [4.7, 4.8, 4.2, 4.2, 4.0, 4.5]
  },
  growth: {
    donut: [
      { name: "中产阶", value: 62, color: "#4a63d0" },
      { name: "低产阶", value: 26, color: "#98a7cd" },
      { name: "高产阶", value: 12, color: "#c9b26a" }
    ],
    taskBuckets: {
      labels: ["<50%", "50-70%", "70-85%", "85-95%", "≥95%"],
      values: [38, 112, 268, 54, 20]
    }
  },
  scoreDist: {
    eleme: {
      title: "饿了么店铺评分分布（店内）",
      labels: ["店铺综合分", "基础服务分", "商品质量分", "履约服务分", "好评率", "复购分"],
      values: [95, 88, 96, 82, 91, 76]
    },
    meituan: {
      title: "美团店铺评分分布（店内）",
      labels: ["店铺综合分", "商品质量分", "基础服务分", "履约服务分", "好评率", "复购分"],
      values: [97, 94, 89, 92, 96, 80]
    }
  },
  storeScores: [
    { name: "深圳梅园万科店", mt: "99.0", exp: "4.70", quality: "4.60", base: "99.0", task: "68.8%", hh: "4.70", jd: "—" },
    { name: "广州爱家曼哈店", mt: "99.0", exp: "4.50", quality: "4.60", base: "67.0", task: "60.9%", hh: "0.00", jd: "—" },
    { name: "广州番禺永旺店", mt: "99.0", exp: "4.60", quality: "4.60", base: "97.0", task: "81.5%", hh: "4.60", jd: "—" },
    { name: "拉萨万达店", mt: "99.0", exp: "4.60", quality: "4.70", base: "99.0", task: "86.7%", hh: "4.70", jd: "—" },
    { name: "北京航天万源店", mt: "99.0", exp: "4.60", quality: "4.60", base: "90.0", task: "66.7%", hh: "4.60", jd: "—" },
    { name: "深圳振业大厦店", mt: "99.0", exp: "4.60", quality: "4.50", base: "93.0", task: "73.2%", hh: "4.50", jd: "—" },
    { name: "广州维多利广场店", mt: "99.0", exp: "4.70", quality: "4.80", base: "99.0", task: "88.9%", hh: "4.70", jd: "—" },
    { name: "北京三里屯店", mt: "99.0", exp: "4.70", quality: "4.70", base: "96.0", task: "78.4%", hh: "4.70", jd: "—" },
    { name: "上海新天地店", mt: "98.0", exp: "4.60", quality: "4.60", base: "95.0", task: "75.0%", hh: "4.60", jd: "—" },
    { name: "深圳湾万象城店", mt: "98.0", exp: "4.50", quality: "4.50", base: "94.0", task: "72.7%", hh: "4.50", jd: "—" },
    { name: "成都春熙路店", mt: "97.0", exp: "4.50", quality: "4.40", base: "92.0", task: "70.0%", hh: "4.40", jd: "—" },
    { name: "杭州湖滨银泰店", mt: "97.0", exp: "4.40", quality: "4.40", base: "90.0", task: "66.7%", hh: "4.40", jd: "—" }
  ]
};

/* ================= 顾客分析 ================= */
window.DASHBOARD_DATA.customerAnalysis = {
  title: "顾客分析",
  updatedAt: "数据更新时间 2026-11-13 08:00",
  filters: {
    quick: ["今日", "昨日", "近7天", "近30天"],
    dateStart: "2026-11-01",
    dateEnd: "2026-11-12",
    platforms: ["全部", "美团", "饿了么"],
    stores: ["门店维度：全部", "深圳湾万象城店", "北京三里屯店", "上海新天地店"]
  },
  acquisition: [
    { name: "深圳梅园万科店", platform: "美团", date: "2026-11-12", rate: "16.73%" },
    { name: "深圳梅园万科店", platform: "饿了么", date: "2026-11-12", rate: "15.30%" },
    { name: "广州爱家曼哈店", platform: "美团", date: "2026-11-12", rate: "17.46%" },
    { name: "广州爱家曼哈店", platform: "饿了么", date: "2026-11-12", rate: "暂停营业" },
    { name: "广州番禺永旺店", platform: "美团", date: "2026-11-12", rate: "16.88%" },
    { name: "广州番禺永旺店", platform: "饿了么", date: "2026-11-12", rate: "19.50%" },
    { name: "拉萨万达店", platform: "美团", date: "2026-11-12", rate: "22.44%" },
    { name: "拉萨万达店", platform: "饿了么", date: "2026-11-12", rate: "18.60%" },
    { name: "北京航天万源店", platform: "美团", date: "2026-11-12", rate: "10.95%" },
    { name: "北京航天万源店", platform: "饿了么", date: "2026-11-12", rate: "15.60%" },
    { name: "深圳振业大厦店", platform: "美团", date: "2026-11-12", rate: "15.20%" },
    { name: "深圳振业大厦店", platform: "饿了么", date: "2026-11-12", rate: "15.90%" },
    { name: "深圳星河天地店", platform: "美团", date: "2026-11-12", rate: "11.60%" },
    { name: "深圳星河天地店", platform: "饿了么", date: "2026-11-12", rate: "11.60%" },
    { name: "广州维多利广场店", platform: "美团", date: "2026-11-12", rate: "12.74%" },
    { name: "广州维多利广场店", platform: "饿了么", date: "2026-11-12", rate: "14.90%" },
    { name: "北京三里屯店", platform: "美团", date: "2026-11-12", rate: "13.09%" },
    { name: "北京三里屯店", platform: "饿了么", date: "2026-11-12", rate: "12.90%" },
    { name: "深圳前海万象店", platform: "美团", date: "2026-11-12", rate: "16.72%" },
    { name: "深圳前海万象店", platform: "饿了么", date: "2026-11-12", rate: "18.50%" }
  ],
  kpis: [
    { label: "总下单人数", value: "281,192", delta: "12.3%", diff: "(+39,477)", dir: "up" },
    { label: "老客占比", value: "46.6%", delta: "2.3%", diff: "(-0.9pp)", dir: "down" },
    { label: "新客近30日复购率", value: "14.2%", diff: "比上月 —（暂无同比数据）" },
    { label: "人均下单频次", value: "1.0", delta: "0.2%", diff: "(-0.0)", dir: "down" }
  ],
  trend: {
    labels: [
      { a: "11-01", b: "周日" }, { a: "11-02", b: "周一" }, { a: "11-03", b: "周二" },
      { a: "11-04", b: "周三" }, { a: "11-05", b: "周四" }, { a: "11-06", b: "周五" },
      { a: "11-07", b: "周六" }, { a: "11-08", b: "周日" }, { a: "11-09", b: "周一" },
      { a: "11-10", b: "周二" }, { a: "11-11", b: "周三" }, { a: "11-12", b: "周四" }
    ],
    total: [15280, 12044, 12890, 12664, 13092, 14820, 28460, 15210, 12280, 12140, 12610, 12480],
    old: [7160, 5620, 6010, 5900, 6100, 6890, 12640, 7020, 5740, 5680, 5890, 5830],
    newRate: [53.2, 53.3, 53.4, 53.4, 53.4, 53.5, 55.6, 53.8, 53.3, 53.2, 53.3, 53.3],
    oldRate: [46.8, 46.7, 46.6, 46.6, 46.6, 46.5, 44.4, 46.2, 46.7, 46.8, 46.7, 46.7]
  },
  freqTrend: {
    labels: ["11-01", "11-02", "11-03", "11-04", "11-05", "11-06", "11-07", "11-08", "11-09", "11-10", "11-11", "11-12"],
    values: [1.02, 1.01, 1.01, 1.0, 1.0, 1.01, 1.04, 1.02, 1.0, 1.0, 1.01, 1.0]
  },
  storeRows: [
    { name: "成都春熙路店", tk: "TK100100", total: "1,685", newC: "772", old: "913", newRate: "54.2%", acq: "15.86%", repurchase: "14.20%", freq: "1.02", delta: "0.90pp", dir: "up" },
    { name: "北京三里屯店", tk: "TK100201", total: "1,913", newC: "1,029", old: "884", newRate: "46.2%", acq: "13.09%", repurchase: "12.90%", freq: "1.01", delta: "0.25pp", dir: "up" },
    { name: "拉萨万达店", tk: "TK100301", total: "1,769", newC: "893", old: "876", newRate: "49.5%", acq: "20.17%", repurchase: "18.30%", freq: "1.03", delta: "1.56pp", dir: "up" },
    { name: "长沙万象城店", tk: "TK100172", total: "2,022", newC: "1,146", old: "876", newRate: "43.3%", acq: "13.91%", repurchase: "14.20%", freq: "1.03", delta: "2.47pp", dir: "up" },
    { name: "深圳振业大厦店", tk: "TK100155", total: "1,644", newC: "818", old: "826", newRate: "50.2%", acq: "15.38%", repurchase: "15.30%", freq: "1.01", delta: "0.56pp", dir: "up" },
    { name: "深圳梅园万科店", tk: "TK100141", total: "1,571", newC: "771", old: "800", newRate: "50.9%", acq: "16.73%", repurchase: "15.30%", freq: "1.01", delta: "0.34pp", dir: "up" },
    { name: "深圳前海万象店", tk: "TK100244", total: "1,406", newC: "643", old: "763", newRate: "54.9%", acq: "16.72%", repurchase: "18.60%", freq: "1.01", delta: "0.90pp", dir: "up" },
    { name: "广州维多利广场店", tk: "TK100381", total: "1,511", newC: "751", old: "760", newRate: "50.4%", acq: "18.02%", repurchase: "19.90%", freq: "1.04", delta: "1.58pp", dir: "up" },
    { name: "苏州新光天地店", tk: "TK100193", total: "1,331", newC: "572", old: "759", newRate: "57.0%", acq: "18.34%", repurchase: "17.70%", freq: "1.02", delta: "0.85pp", dir: "up" },
    { name: "北京枫蓝国际店", tk: "TK100238", total: "1,749", newC: "999", old: "750", newRate: "42.9%", acq: "14.21%", repurchase: "11.20%", freq: "1.02", delta: "1.41pp", dir: "up" },
    { name: "自贡新玛特店", tk: "TK100354", total: "1,334", newC: "586", old: "748", newRate: "56.1%", acq: "22.53%", repurchase: "23.30%", freq: "1.07", delta: "1.34pp", dir: "up" },
    { name: "北京大悦城店", tk: "TK100118", total: "1,477", newC: "737", old: "740", newRate: "50.1%", acq: "14.39%", repurchase: "14.10%", freq: "1.02", delta: "1.06pp", dir: "up" },
    { name: "拉萨万达广场店", tk: "TK100362", total: "1,099", newC: "369", old: "730", newRate: "66.4%", acq: "22.43%", repurchase: "18.60%", freq: "1.03", delta: "0.56pp", dir: "up" },
    { name: "深圳罗湖商业城店", tk: "TK100292", total: "1,361", newC: "644", old: "717", newRate: "52.7%", acq: "16.77%", repurchase: "15.50%", freq: "1.01", delta: "0.73pp", dir: "up" },
    { name: "南京万象天地店", tk: "TK100415", total: "1,459", newC: "742", old: "717", newRate: "49.1%", acq: "15.31%", repurchase: "15.20%", freq: "1.01", delta: "0.39pp", dir: "up" },
    { name: "北京国贸店", tk: "TK100311", total: "1,868", newC: "1,152", old: "716", newRate: "38.3%", acq: "10.99%", repurchase: "15.60%", freq: "1.04", delta: "0.28pp", dir: "up" }
  ],
  storeTotal: {
    total: "281,192", newC: "150,027", old: "131,165", newRate: "46.6%", acq: "16.40%", repurchase: "15.40%", freq: "1.01"
  }
};

/* ================= 评价分析 ================= */
window.DASHBOARD_DATA.reviewAnalysis = {
  title: "评价分析",
  updatedAt: "数据更新时间 2026-11-13 08:00",
  filters: {
    quick: ["今日", "昨日", "近7天", "近30天"],
    dateStart: "2026-11-01",
    dateEnd: "2026-11-13",
    platforms: ["全部", "美团", "饿了么"],
    stores: ["门店维度：全部", "深圳湾万象城店", "北京三里屯店", "上海新天地店"]
  },
  notice: "部分评价缺少评分或评分状态，相关指标暂不可用。",
  kpis: [
    { label: "评价数（计入）", value: "—", muted: true, diff: "比上月 —（暂无同比数据）" },
    { label: "评价率", value: "—", muted: true, diff: "比上月 —（暂无同比数据）" },
    { label: "好评率", value: "—", muted: true, diff: "比上月 —（暂无同比数据）" },
    { label: "差评数 / 差评率（计入）", value: "—", muted: true, diff: "比上月 —（暂无同比数据）" },
    { label: "评价分析样本", value: "177", delta: "32.7%", diff: "(-86)", dir: "down" },
    { label: "差评回复率", value: "40.7%", delta: "42.1%", diff: "(-30.8pp)", dir: "down" }
  ],
  trend: {
    labels: [
      { a: "11-01", b: "周日" }, { a: "11-02", b: "周一" }, { a: "11-03", b: "周二" },
      { a: "11-04", b: "周三" }, { a: "11-05", b: "周四" }, { a: "11-06", b: "周五" },
      { a: "11-07", b: "周六" }, { a: "11-08", b: "周日" }, { a: "11-09", b: "周一" },
      { a: "11-10", b: "周二" }, { a: "11-11", b: "周三" }, { a: "11-12", b: "周四" }
    ],
    review: [12, 15, 14, 13, 16, 18, 11, 9, 13, 14, 12, 10],
    bad: [2, 3, 2, 2, 3, 4, 1, 1, 2, 3, 2, 1],
    badRate: [16.7, 20.0, 14.3, 15.4, 18.8, 22.2, 9.1, 11.1, 15.4, 21.4, 16.7, 10.0],
    goodRate: [83.3, 80.0, 85.7, 84.6, 81.2, 77.8, 90.9, 88.9, 84.6, 78.6, 83.3, 90.0]
  },
  productRanking: [
    { name: "现酿酸奶", cat: "茉莉红茶", reviews: "1,387", bad: "6", badRate: "0.43%", badAll: "10", reason: "口感口味", keyword: "一次兑、无味、偏甜" },
    { name: "芝士奶盖四季春", cat: "茉莉红茶", reviews: "383", bad: "5", badRate: "1.31%", badAll: "12", reason: "服务态度", keyword: "价格贵、偏贵、分量少" },
    { name: "现酿茉莉奶绿", cat: "茉莉红茶", reviews: "479", bad: "3", badRate: "0.63%", badAll: "6", reason: "口感口味", keyword: "偏酸、不新鲜、太甜" },
    { name: "现酿四季春（清爽版）", cat: "茉莉红茶", reviews: "774", bad: "2", badRate: "0.26%", badAll: "8", reason: "口感口味", keyword: "太甜、无味、偏酸" },
    { name: "红心芭乐白桃乌龙", cat: "茉莉红茶", reviews: "114", bad: "1", badRate: "0.88%", badAll: "3", reason: "温度冰量", keyword: "去冰、少冰、常温" },
    { name: "茉莉奶绿", cat: "茉莉红茶", reviews: "82", bad: "1", badRate: "1.22%", badAll: "2", reason: "服务态度", keyword: "小料少、想加" }
  ],
  storeRanking: [
    { name: "大阅城王府井店", platform: "饿了么", reviews: "17", bad: "0", badRate: "0.00%", badAll: "18" },
    { name: "小汤山医院店", platform: "饿了么", reviews: "13", bad: "0", badRate: "0.00%", badAll: "19" },
    { name: "国创科技东港店", platform: "饿了么", reviews: "29", bad: "0", badRate: "0.00%", badAll: "36" },
    { name: "雨花客厅店", platform: "饿了么", reviews: "9", bad: "0", badRate: "0.00%", badAll: "11" },
    { name: "泰州万象城店", platform: "饿了么", reviews: "1", bad: "0", badRate: "0.00%", badAll: "1" },
    { name: "泰州万象城二店", platform: "饿了么", reviews: "1", bad: "0", badRate: "0.00%", badAll: "2" },
    { name: "泰州万象城三店", platform: "饿了么", reviews: "1", bad: "0", badRate: "0.00%", badAll: "1" },
    { name: "泰州万象城四店", platform: "饿了么", reviews: "1", bad: "0", badRate: "0.00%", badAll: "1" },
    { name: "泰州万象城五店", platform: "饿了么", reviews: "1", bad: "0", badRate: "0.00%", badAll: "1" },
    { name: "泰州万象城六店", platform: "饿了么", reviews: "1", bad: "0", badRate: "0.00%", badAll: "1" }
  ],
  storeTotal: { label: "汇总（39 家）", reviews: "4,962", bad: "18", badRate: "0.39%", badAll: "4,550" },
  productDetail: {
    name: "现酿酸奶",
    code: "商品编号 · 店内分类：茉莉红茶",
    reviews: "1,387",
    bad: "6",
    badRate: "0.43%",
    badAll: "10",
    badAllRate: "1,351",
    words: [
      { word: "一次", count: 1, pct: "16.7%" }, { word: "上次", count: 1, pct: "16.7%" },
      { word: "价格", count: 1, pct: "16.7%" }, { word: "便宜", count: 1, pct: "16.7%" },
      { word: "出品", count: 1, pct: "16.7%" }, { word: "刚开", count: 1, pct: "16.7%" },
      { word: "味道", count: 1, pct: "16.7%" }
    ],
    keywordCloud: ["一次", "上次", "价格", "便宜", "出品", "刚开", "味道", "喝多过", "喝水", "地方", "完好无损", "寡淡", "形态", "很次", "惊艳", "无味", "普通", "水多", "没酒", "泰奶", "浓郁", "珍珠", "硬硬", "稳定", "腻腻", "越来越", "避雷", "餐品", "香味"],
    dimensions: [
      { label: "口感口味", count: 8, pct: "44.4%" },
      { label: "服务态度", count: 1, pct: "16.7%" },
      { label: "价格分量", count: 1, pct: "16.7%" },
      { label: "包装破损", count: 1, pct: "16.7%" },
      { label: "配送太慢", count: 1, pct: "16.7%" },
      { label: "小料分量少", count: 1, pct: "16.7%" }
    ],
    samples: [
      { text: "是没口感，感觉水多了，刚开封的时候还行，放一会儿就寡淡了。", date: "2026-11-05", store: "聊城金鼎店", score: "4星" },
      { text: "喝过很多次，出品越来越不稳定了，这次的珍珠偏硬。", date: "2026-11-04", store: "北京三里屯店", score: "3星" }
    ]
  },
  reviews: [
    { date: "2026-11-12", store: "深圳梅园万科店", platform: "美团", score: "4星", text: "口味还不错，配送有点慢。", tag: "配送太慢" },
    { date: "2026-11-10", store: "广州爱家曼哈店", platform: "饿了么", score: "5星", text: "包装完好，茶味很足。", tag: "好评" },
    { date: "2026-11-08", store: "北京三里屯店", platform: "美团", score: "3星", text: "有点太甜了，下次少糖。", tag: "口感偏甜" },
    { date: "2026-11-06", store: "上海新天地店", platform: "饿了么", score: "4星", text: "整体不错，分量可以再多一点。", tag: "分量少" },
    { date: "2026-11-05", store: "聊城金鼎店", platform: "美团", score: "4星", text: "是没口感，感觉水多了，刚开封的时候还行。", tag: "口感寡淡" },
    { date: "2026-11-03", store: "深圳湾万象城店", platform: "美团", score: "5星", text: "出餐很快，味道稳定。", tag: "好评" }
  ]
};

/* ================= 商品销售概览 ================= */
window.DASHBOARD_DATA.productSales = {
  title: "商品销售概览",
  updatedAt: "统计周期 2026-11-01 ~ 2026-11-12 · 共 12 天",
  filters: {
    quick: ["今日", "昨日", "近7天", "近30天"],
    dateStart: "2026-11-01",
    dateEnd: "2026-11-12",
    platforms: ["全部", "美团", "饿了么"],
    stores: ["门店维度：全部", "安徽工学院店", "深圳湾万象城店", "北京三里屯店"]
  },
  kpis: [
    { label: "动销商品数", value: "74 个", delta: "+10.4%", diff: "(+7)", dir: "up" },
    { label: "商品销量", value: "487,067", delta: "-14.0%", diff: "(-79,406)", dir: "down" },
    { label: "商品销售额", value: "¥11,035,947", delta: "-12.9%", diff: "(-1,633,172.5)", dir: "down" },
    { label: "件均价", value: "¥22.7", delta: "+1.3%", diff: "(+0.3)", dir: "up" }
  ],
  newTrend: {
    dates: [
      { a: "11-01", b: "周日" }, { a: "11-02", b: "周一" }, { a: "11-03", b: "周二" },
      { a: "11-04", b: "周三" }, { a: "11-05", b: "周四" }, { a: "11-06", b: "周五" },
      { a: "11-07", b: "周六" }, { a: "11-08", b: "周日" }, { a: "11-09", b: "周一" },
      { a: "11-10", b: "周二" }, { a: "11-11", b: "周三" }, { a: "11-12", b: "周四" }
    ],
    series: [
      { name: "可可泰奶（冬季限定）", color: "#5b77b8", values: [520, 480, 610, 690, 720, 980, 1120, 1050, 1180, 1240, 1310, 1260] },
      { name: "手打柠檬茶", color: "#8fb2a6", values: [420, 400, 470, 500, 560, 720, 810, 780, 860, 900, 960, 930] },
      { name: "香茅烤鸡翅", color: "#d7a26b", values: [380, 360, 420, 460, 510, 680, 760, 720, 810, 860, 920, 890] },
      { name: "芝士泰奶", color: "#a999c9", values: [260, 240, 300, 330, 360, 470, 520, 500, 560, 590, 640, 620] },
      { name: "其他新品（10）", color: "#df9d9b", values: [300, 280, 330, 360, 390, 520, 580, 550, 600, 630, 670, 650] }
    ],
    newShare: [5.2, 5.0, 5.8, 6.2, 6.5, 8.1, 9.3, 8.9, 9.6, 10.2, 10.8, 10.4]
  },
  reviews: {
    good: [
      { rank: 1, name: "甄选泰奶", goodRate: "100.0%", badRate: "0.0%", count: "1,002" },
      { rank: 2, name: "咸法酪泰奶（清爽版）", goodRate: "100.0%", badRate: "0.0%", count: "456" },
      { rank: 3, name: "招牌泰式奶茶", goodRate: "100.0%", badRate: "0.0%", count: "369" },
      { rank: 4, name: "手打柠檬茶", goodRate: "100.0%", badRate: "0.0%", count: "233" },
      { rank: 5, name: "香茅烤鸡翅", goodRate: "100.0%", badRate: "0.0%", count: "206" },
      { rank: 6, name: "椰香芒果糯米饭", goodRate: "100.0%", badRate: "0.0%", count: "196" },
      { rank: 7, name: "冬阴功海鲜面", goodRate: "100.0%", badRate: "0.0%", count: "161" },
      { rank: 8, name: "泰式炒河粉", goodRate: "100.0%", badRate: "0.0%", count: "128" },
      { rank: 9, name: "青咖喱鸡饭", goodRate: "100.0%", badRate: "0.0%", count: "105" },
      { rank: 10, name: "曼谷炸鸡块", goodRate: "100.0%", badRate: "0.0%", count: "97" }
    ],
    bad: [
      { rank: 1, name: "可可泰奶（冬季限定）", badRate: "1.0%", goodRate: "99.0%", count: "300" },
      { rank: 2, name: "芝士泰奶", badRate: "0.2%", goodRate: "99.8%", count: "648" },
      { rank: 3, name: "斑斓椰奶冻", badRate: "0.1%", goodRate: "99.9%", count: "1,128" },
      { rank: 4, name: "泰式菠萝炒饭", badRate: "0.1%", goodRate: "99.9%", count: "894" },
      { rank: 5, name: "冬阴功海鲜面", badRate: "0.1%", goodRate: "99.9%", count: "1,050" },
      { rank: 6, name: "泰式炒河粉", badRate: "0.1%", goodRate: "99.9%", count: "806" },
      { rank: 7, name: "椰香芒果糯米饭", badRate: "0.1%", goodRate: "99.9%", count: "760" },
      { rank: 8, name: "曼谷炸鸡块", badRate: "0.1%", goodRate: "99.9%", count: "612" },
      { rank: 9, name: "香茅烤鸡翅", badRate: "0.0%", goodRate: "100.0%", count: "540" },
      { rank: 10, name: "青咖喱鸡饭", badRate: "0.0%", goodRate: "100.0%", count: "488" }
    ]
  },
  detail: [
    { name: "甄选泰奶", mapped: "甄选泰奶", onlineAt: "2025-09-01", category: "泰国红茶", qty: "121,109", mom: "-16.0%", dir: "down", amount: "¥249.2万", share: "26.3%", margin: "54.05%" },
    { name: "咸法酪泰奶（清爽版）", mapped: "咸法酪泰奶（清爽版）", onlineAt: "2025-09-01", category: "泰国红茶", qty: "53,724", mom: "-16.4%", dir: "down", amount: "¥110.0万", share: "11.6%", margin: "43.98%" },
    { name: "招牌泰式奶茶", mapped: "招牌泰式奶茶", onlineAt: "2025-08-12", category: "泰式奶茶", qty: "41,822", mom: "-21.3%", dir: "down", amount: "¥72.4万", share: "7.6%", margin: "52.48%" },
    { name: "手打柠檬茶", mapped: "手打柠檬茶", onlineAt: "2026-09-18", category: "泰式果茶", qty: "21,600", mom: "-23.1%", dir: "down", amount: "¥42.4万", share: "4.5%", margin: "42.95%" },
    { name: "椰香芒果糯米饭", mapped: "椰香芒果糯米饭", onlineAt: "2025-06-20", category: "泰式甜品", qty: "17,504", mom: "-7.5%", dir: "down", amount: "¥31.6万", share: "3.3%", margin: "30.88%" },
    { name: "青咖喱鸡饭", mapped: "青咖喱鸡饭", onlineAt: "2025-02-14", category: "泰式主食", qty: "12,665", mom: "-21.0%", dir: "down", amount: "¥27.5万", share: "2.9%", margin: "41.05%" },
    { name: "冬阴功海鲜面", mapped: "冬阴功海鲜面", onlineAt: "2025-04-11", category: "泰式主食", qty: "10,778", mom: "-20.5%", dir: "down", amount: "¥23.1万", share: "2.4%", margin: "39.67%" },
    { name: "芝士泰奶", mapped: "芝士泰奶", onlineAt: "2026-09-25", category: "泰国红茶", qty: "10,198", mom: "+18.6%", dir: "up", amount: "¥21.1万", share: "2.2%", margin: "50.04%" },
    { name: "泰式炒河粉", mapped: "泰式炒河粉", onlineAt: "2025-03-02", category: "泰式主食", qty: "8,149", mom: "-17.9%", dir: "down", amount: "¥17.9万", share: "1.9%", margin: "44.74%" },
    { name: "泰式菠萝炒饭", mapped: "泰式菠萝炒饭", onlineAt: "2025-01-21", category: "泰式主食", qty: "5,830", mom: "-29.2%", dir: "down", amount: "¥12.3万", share: "1.3%", margin: "34.63%" },
    { name: "斑斓椰奶冻", mapped: "斑斓椰奶冻", onlineAt: "2024-12-08", category: "泰式甜品", qty: "2,679", mom: "-12.4%", dir: "down", amount: "¥3.9万", share: "0.4%", margin: "29.71%" },
    { name: "可可泰奶（冬季限定）", mapped: "可可泰奶（冬季限定）", onlineAt: "2026-10-28", category: "可可系列", qty: "2,360", mom: "+18.6%", dir: "up", amount: "¥5.1万", share: "0.5%", margin: "19.34%" }
  ],
  structure: {
    categories: [
      { name: "泰国红茶", value: 56.2, color: "#5b77b8" },
      { name: "泰式小吃", value: 13.1, color: "#8fb2a6" },
      { name: "泰式奶茶", value: 8.2, color: "#d7a26b" },
      { name: "泰式甜品", value: 7.1, color: "#a999c9" },
      { name: "泰式主食", value: 6.4, color: "#df9d9b" },
      { name: "泰式果茶", value: 4.7, color: "#7fa3c9" },
      { name: "可可系列", value: 4.3, color: "#bfc6d4" }
    ],
    ranking: [
      { name: "泰国红茶", count: "273,755", width: 100 },
      { name: "泰式小吃", count: "63,717", width: 23.3 },
      { name: "泰式奶茶", count: "40,154", width: 14.7 },
      { name: "泰式甜品", count: "34,492", width: 12.6 },
      { name: "泰式主食", count: "31,269", width: 11.4 },
      { name: "泰式果茶", count: "22,494", width: 8.2 },
      { name: "可可系列", count: "21,186", width: 7.7 }
    ],
    rows: [
      { name: "泰国红茶", qty: "273,755", qtyShare: "56.2%", amount: "¥647.2万", amountShare: "58.6%", price: "¥23.6", good: "99.8%", bad: "0.2%" },
      { name: "泰式小吃", qty: "63,717", qtyShare: "13.1%", amount: "¥156.7万", amountShare: "14.2%", price: "¥24.6", good: "100.0%", bad: "0.0%" },
      { name: "泰式奶茶", qty: "40,154", qtyShare: "8.2%", amount: "¥85.9万", amountShare: "7.8%", price: "¥21.4", good: "100.0%", bad: "0.0%" },
      { name: "泰式甜品", qty: "34,492", qtyShare: "7.1%", amount: "¥71.4万", amountShare: "6.5%", price: "¥20.7", good: "100.0%", bad: "0.0%" },
      { name: "泰式主食", qty: "31,269", qtyShare: "6.4%", amount: "¥60.2万", amountShare: "5.5%", price: "¥19.3", good: "99.9%", bad: "0.1%" },
      { name: "泰式果茶", qty: "22,494", qtyShare: "4.6%", amount: "¥41.4万", amountShare: "3.8%", price: "¥18.4", good: "100.0%", bad: "0.0%" },
      { name: "可可系列", qty: "21,186", qtyShare: "4.4%", amount: "¥37.7万", amountShare: "3.6%", price: "¥17.8", good: "99.8%", bad: "0.2%" }
    ]
  }
};

/* ================= 商品转化分析 ================= */
window.DASHBOARD_DATA.productConversion = {
  title: "商品转化分析",
  updatedAt: "自然月日历日 2026-11-01 ~ 2026-11-12 · 窗口内 12 天",
  filters: {
    quick: ["今日", "昨日", "近7天", "近30天"],
    dateStart: "2026-11-01",
    dateEnd: "2026-11-12",
    platforms: ["全部", "美团", "饿了么"],
    stores: ["门店维度：全部", "安徽工学院店", "深圳湾万象城店", "北京三里屯店"]
  },
  quadrant: {
    chips: [
      { key: "star", label: "明星产品", count: 6, color: "#4a7d63" },
      { key: "dog", label: "瘦狗产品", count: 3, color: "#b45a55" },
      { key: "cow", label: "金牛商品", count: 3, color: "#5f7fc0" },
      { key: "question", label: "问题产品", count: 2, color: "#8d94a3" }
    ],
    medianX: 900000,
    medianY: 32,
    points: [
      { name: "甄选泰奶", x: 6465157, y: 39.25, key: "star" },
      { name: "咸法酪泰奶（清爽版）", x: 2870037, y: 31.20, key: "cow" },
      { name: "招牌泰式奶茶", x: 2461803, y: 23.63, key: "dog" },
      { name: "手打柠檬茶", x: 1065264, y: 34.92, key: "star" },
      { name: "椰香芒果糯米饭", x: 1357683, y: 28.36, key: "dog" },
      { name: "青咖喱鸡饭", x: 1653491, y: 31.94, key: "cow" },
      { name: "冬阴功海鲜面", x: 1059584, y: 31.13, key: "cow" },
      { name: "芝士泰奶", x: 921697, y: 40.56, key: "star" },
      { name: "泰式炒河粉", x: 909627, y: 23.88, key: "question" },
      { name: "泰式菠萝炒饭", x: 369319, y: 14.70, key: "question" },
      { name: "斑斓椰奶冻", x: 552376, y: 32.53, key: "star" },
      { name: "可可泰奶（冬季限定）", x: 481663, y: 16.70, key: "dog" },
      { name: "曼谷炸鸡块", x: 1068041, y: 21.92, key: "star" },
      { name: "香茅烤鸡翅", x: 574824, y: 28.91, key: "star" }
    ]
  },
  funnel: {
    products: ["甄选泰奶", "咸法酪泰奶（清爽版）", "招牌泰式奶茶", "手打柠檬茶", "椰香芒果糯米饭"],
    defaultProduct: "甄选泰奶",
    stages: [
      { name: "曝光", value: "6,465,157", rate: "" },
      { name: "点击", value: "198,740", rate: "3.07%" },
      { name: "加购", value: "128,395", rate: "64.60%" },
      { name: "下单", value: "50,401", rate: "39.25%" }
    ],
    note: "期末近30天复购率（估算）10.13% · 纳入 270 家 / 有期末记录 386 家"
  },
  rows: [
    { name: "甄选泰奶", qty: "121,109", qtyShare: "26.3%", price: "¥26.00", exposure: "6,465,157", clicks: "198,740", clickRate: "3.07%", adds: "128,395", addRate: "64.60%", orders: "50,401", orderRate: "39.25%", repeat: "8,268" },
    { name: "咸法酪泰奶（清爽版）", qty: "53,724", qtyShare: "11.6%", price: "¥24.00", exposure: "2,870,037", clicks: "111,066", clickRate: "3.87%", adds: "90,156", addRate: "81.17%", orders: "28,132", orderRate: "31.20%", repeat: "6,624" },
    { name: "招牌泰式奶茶", qty: "41,822", qtyShare: "9.3%", price: "¥22.00", exposure: "2,461,803", clicks: "80,646", clickRate: "3.28%", adds: "60,545", addRate: "75.08%", orders: "14,307", orderRate: "23.63%", repeat: "5,012" },
    { name: "手打柠檬茶", qty: "21,600", qtyShare: "4.7%", price: "¥23.00", exposure: "1,065,264", clicks: "45,002", clickRate: "4.22%", adds: "28,395", addRate: "63.10%", orders: "9,915", orderRate: "34.92%", repeat: "1,071" },
    { name: "椰香芒果糯米饭", qty: "17,504", qtyShare: "3.8%", price: "¥20.00", exposure: "1,357,683", clicks: "44,147", clickRate: "3.25%", adds: "28,234", addRate: "63.95%", orders: "8,006", orderRate: "28.36%", repeat: "1,336" },
    { name: "青咖喱鸡饭", qty: "12,665", qtyShare: "2.8%", price: "¥33.00", exposure: "1,653,491", clicks: "24,046", clickRate: "1.45%", adds: "16,372", addRate: "68.09%", orders: "5,230", orderRate: "31.94%", repeat: "454" },
    { name: "冬阴功海鲜面", qty: "10,778", qtyShare: "2.4%", price: "¥38.00", exposure: "1,059,584", clicks: "17,898", clickRate: "1.69%", adds: "13,528", addRate: "75.58%", orders: "4,211", orderRate: "31.13%", repeat: "1,024" },
    { name: "芝士泰奶", qty: "10,198", qtyShare: "2.2%", price: "¥26.00", exposure: "921,697", clicks: "10,580", clickRate: "1.15%", adds: "7,702", addRate: "72.80%", orders: "3,124", orderRate: "40.56%", repeat: "676" },
    { name: "泰式炒河粉", qty: "8,149", qtyShare: "1.8%", price: "¥30.00", exposure: "909,627", clicks: "19,903", clickRate: "2.19%", adds: "10,312", addRate: "51.81%", orders: "2,463", orderRate: "23.88%", repeat: "409" },
    { name: "泰式菠萝炒饭", qty: "5,830", qtyShare: "1.3%", price: "¥32.00", exposure: "369,319", clicks: "21,853", clickRate: "5.92%", adds: "15,832", addRate: "72.45%", orders: "2,327", orderRate: "14.70%", repeat: "65" },
    { name: "斑斓椰奶冻", qty: "2,679", qtyShare: "0.6%", price: "¥18.00", exposure: "552,376", clicks: "10,232", clickRate: "1.85%", adds: "6,164", addRate: "60.24%", orders: "2,005", orderRate: "32.53%", repeat: "584" },
    { name: "可可泰奶（冬季限定）", qty: "2,360", qtyShare: "0.5%", price: "¥25.00", exposure: "481,663", clicks: "19,306", clickRate: "4.01%", adds: "11,844", addRate: "61.35%", orders: "1,978", orderRate: "16.70%", repeat: "37" },
    { name: "曼谷炸鸡块", qty: "2,050", qtyShare: "0.4%", price: "¥24.00", exposure: "1,068,041", clicks: "18,132", clickRate: "1.70%", adds: "5,408", addRate: "29.82%", orders: "1,185", orderRate: "21.92%", repeat: "58" },
    { name: "香茅烤鸡翅", qty: "1,796", qtyShare: "0.4%", price: "¥27.00", exposure: "574,824", clicks: "10,871", clickRate: "1.89%", adds: "5,815", addRate: "53.49%", orders: "1,681", orderRate: "28.91%", repeat: "222" }
  ]
};

/* ================= 商品毛利测算 ================= */
window.DASHBOARD_DATA.productMargin = {
  title: "商品毛利测算",
  updatedAt: "单件测算 · 安徽工学院店 · 美团 · 2026-11-12",
  filters: {
    store: "安徽工学院店 · TK00169",
    platform: "美团",
    discount: 10,
    memberRedPacket: true,
    note: "扣点 6.2% · 保底 ¥0.92 · 起步价 ¥2.80（0-2公里）"
  },
  rows: [
    { name: "甄选泰奶", code: "P0129", cost: 6.07, price: 26.00, pay: 16.00, packing: 1.00, fee: 3.79, income: 13.21, profit: 7.14, margin: "54.05%", dir: "up" },
    { name: "招牌泰式奶茶", code: "P0130", cost: 5.36, price: 22.00, pay: 14.00, packing: 1.00, fee: 3.72, income: 11.28, profit: 5.92, margin: "52.48%", dir: "up" },
    { name: "芝士泰奶", code: "P0137", cost: 6.60, price: 26.00, pay: 16.00, packing: 1.00, fee: 3.79, income: 13.21, profit: 6.61, margin: "50.04%", dir: "up" },
    { name: "泰式炒河粉", code: "P0134", cost: 9.20, price: 30.00, pay: 19.00, packing: 2.00, fee: 4.35, income: 16.65, profit: 7.45, margin: "44.74%", dir: "up" },
    { name: "咸法酪泰奶（清爽版）", code: "P0128", cost: 7.40, price: 24.00, pay: 16.00, packing: 1.00, fee: 3.79, income: 13.21, profit: 5.81, margin: "43.98%", dir: "up" },
    { name: "手打柠檬茶", code: "P0131", cost: 7.00, price: 23.00, pay: 15.00, packing: 1.00, fee: 3.73, income: 12.27, profit: 5.27, margin: "42.95%", dir: "up" },
    { name: "香茅烤鸡翅", code: "P0136", cost: 8.60, price: 27.00, pay: 17.00, packing: 2.00, fee: 4.00, income: 15.00, profit: 6.40, margin: "42.67%", dir: "up" },
    { name: "青咖喱鸡饭", code: "P0135", cost: 10.80, price: 33.00, pay: 21.00, packing: 2.00, fee: 4.68, income: 18.32, profit: 7.52, margin: "41.05%", dir: "up" },
    { name: "冬阴功海鲜面", code: "P0133", cost: 12.50, price: 38.00, pay: 24.00, packing: 2.00, fee: 5.28, income: 20.72, profit: 8.22, margin: "39.67%", dir: "up" },
    { name: "泰式菠萝炒饭", code: "P0140", cost: 11.40, price: 32.00, pay: 20.00, packing: 2.00, fee: 4.56, income: 17.44, profit: 6.04, margin: "34.63%", dir: "up" },
    { name: "曼谷炸鸡块", code: "P0139", cost: 8.90, price: 24.00, pay: 15.00, packing: 2.00, fee: 3.79, income: 13.21, profit: 4.31, margin: "32.63%", dir: "up" },
    { name: "椰香芒果糯米饭", code: "P0132", cost: 7.79, price: 20.00, pay: 13.00, packing: 2.00, fee: 3.73, income: 11.27, profit: 3.48, margin: "30.88%", dir: "up" },
    { name: "斑斓椰奶冻", code: "P0138", cost: 6.20, price: 18.00, pay: 11.00, packing: 1.00, fee: 3.18, income: 8.82, profit: 2.62, margin: "29.71%", dir: "up" },
    { name: "可可泰奶（冬季限定）", code: "P0141", cost: 9.80, price: 25.00, pay: 15.00, packing: 1.00, fee: 3.85, income: 12.15, profit: 2.35, margin: "19.34%", dir: "up" }
  ]
};

/* ================= 新品复盘分析 ================= */
window.DASHBOARD_DATA.newProductReview = {
  title: "新品复盘分析",
  updatedAt: "批次 11/06 · 4 款新品 · 观察至 2026-11-12",
  filters: {
    quick: ["今日", "昨日", "近7天", "近30天"],
    dateStart: "2026-11-06",
    dateEnd: "2026-11-12",
    platforms: ["全部", "美团", "饿了么"],
    stores: ["门店维度：全部", "安徽工学院店", "深圳湾万象城店", "北京三里屯店"]
  },
  current: {
    date: "11/06",
    year: "2026",
    brand: "泰柯",
    count: 4,
    tags: ["可可泰奶（冬季限定）", "手打柠檬茶", "香茅烤鸡翅"],
    more: "+1 款",
    summary: "新品已记录销量占比 8.8%，上架前同期门店实收较上线前 ▼1.79%。",
    range: "2026-11-06 至 2026-11-12",
    window: "T+7",
    status: "可复盘"
  },
  ratio: [
    { name: "可可泰奶（冬季限定）", count: "3.26%", width: 100, color: "#5b77b8" },
    { name: "手打柠檬茶", count: "1.77%", width: 54, color: "#8fb2a6" },
    { name: "香茅烤鸡翅", count: "1.57%", width: 48, color: "#d7a26b" },
    { name: "芝士泰奶", count: "1.45%", width: 44, color: "#a999c9" }
  ],
  market: {
    beforeRange: "上线前 2026-10-30 至 2026-11-05",
    rows: [
      { label: "曝光人数", now: "167.01 万", before: "181.56 万", delta: "-8.01%", dir: "down" },
      { label: "进店率", now: "7.6%", before: "7.43%", delta: "+0.17 pp", dir: "up" },
      { label: "下单率", now: "20.86%", before: "20.5%", delta: "+0.36 pp", dir: "up" },
      { label: "有效订单", now: "2.71 万", before: "2.83 万", delta: "-4.32%", dir: "down" },
      { label: "外卖实收", now: "¥55.83 万", before: "¥56.85 万", delta: "-1.79%", dir: "down" },
      { label: "实收率（单均）", now: "67.3%", before: "64.97%", delta: "+2.34 pp", dir: "up" },
      { label: "外卖毛利率", now: "45.54%", before: "44.84%", delta: "+0.71 pp", dir: "up" }
    ]
  },
  trend: {
    dates: [{ a: "11-06", b: "周五" }, { a: "11-07", b: "周六" }, { a: "11-08", b: "周日" }, { a: "11-09", b: "周一" }, { a: "11-10", b: "周二" }, { a: "11-11", b: "周三" }, { a: "11-12", b: "周四" }],
    series: [
      { name: "可可泰奶（冬季限定）", color: "#5b77b8", values: [420, 390, 455, 480, 510, 530, 505] },
      { name: "手打柠檬茶", color: "#8fb2a6", values: [120, 110, 128, 138, 146, 152, 144] },
      { name: "香茅烤鸡翅", color: "#d7a26b", values: [260, 240, 275, 300, 320, 335, 318] },
      { name: "芝士泰奶", color: "#a999c9", values: [180, 165, 195, 210, 225, 236, 222] }
    ],
    share: [6.2, 5.8, 6.9, 7.4, 7.8, 8.1, 7.9]
  },
  funnels: [
    {
      name: "可可泰奶（冬季限定）",
      stages: [
        { name: "曝光", value: "75,543", rate: "" },
        { name: "点击", value: "5,240", rate: "6.94%" },
        { name: "加购", value: "3,644", rate: "69.54%" },
        { name: "下单", value: "760", rate: "20.86%" }
      ]
    },
    {
      name: "手打柠檬茶",
      stages: [
        { name: "曝光", value: "59,937", rate: "" },
        { name: "点击", value: "3,571", rate: "5.96%" },
        { name: "加购", value: "2,592", rate: "72.58%" },
        { name: "下单", value: "422", rate: "16.28%" }
      ]
    }
  ],
  funnelNote: "可可泰奶（冬季限定）是本批已记录销量最高的商品，共 1,526 件。同店样本实收较上线前 ▼1.79%。",
  history: [
    { date: "10/02", year: "2026", brand: "泰柯", count: 1, tags: ["香茅烤鸡翅"], summary: "新品已记录销量占比 6.34%，上架前同期门店实收较上线前 ▲ 8.41%。", range: "2026-10-02 至 2026-10-08", status: "已复盘" },
    { date: "09/25", year: "2026", brand: "泰柯", count: 1, tags: ["芝士泰奶"], summary: "新品已记录销量占比 18.63%，上架前同期门店实收较上线前 ▲ 49.37%。", range: "2026-09-25 至 2026-10-01", status: "已复盘" },
    { date: "09/18", year: "2026", brand: "泰柯", count: 1, tags: ["手打柠檬茶"], summary: "新品已记录销量占比 4.73%，上架前同期门店实收较上线前 ▼ 4.4%。", range: "2026-09-18 至 2026-09-24", status: "已复盘" },
    { date: "09/01", year: "2025", brand: "泰柯", count: 2, tags: ["咸法酪泰奶（清爽版）", "甄选泰奶"], summary: "新品已记录销量占比 10.25%，上架前同期门店实收较上线前 ▲ 6.18%。", range: "2025-09-01 至 2025-09-07", status: "已复盘" },
    { date: "08/12", year: "2025", brand: "泰柯", count: 1, tags: ["招牌泰式奶茶"], summary: "新品已记录销量占比 12.21%，上架前同期门店实收较上线前 ▲ 1.25%。", range: "2025-08-12 至 2025-08-18", status: "已复盘" },
    { date: "06/20", year: "2025", brand: "泰柯", count: 2, tags: ["椰香芒果糯米饭", "斑斓椰奶冻"], summary: "新品已记录销量占比 3.64%，上架前同期门店实收较上线前 ▲ 4.71%。", range: "2025-06-20 至 2025-06-26", status: "已复盘" },
    { date: "04/11", year: "2025", brand: "泰柯", count: 1, tags: ["冬阴功海鲜面"], summary: "新品已记录销量占比 9.09%，上架前同期门店实收较上线前 ▲ 5.94%。", range: "2025-04-11 至 2025-04-17", status: "已复盘" }
  ]
};

/* ================= 营销支出分析 ================= */
window.DASHBOARD_DATA.marketingSpend = {
  title: "营销支出分析",
  updatedAt: "自然月累计 2026-11-01 ~ 2026-11-12 · 窗口内 12 天",
  filters: {
    quick: ["昨日", "近7天", "近30天"],
    dateStart: "2026-11-01",
    dateEnd: "2026-11-12",
    platforms: ["全部", "美团", "饿了么"],
    stores: ["门店维度：全部", "安徽工学院店", "深圳湾万象城店", "北京三里屯店", "上海世博天地店"]
  },
  kpis: [
    { label: "商家补贴总额", value: "¥3,444,191.6", delta: "-11.9%", diff: "(-463,401.7)", dir: "down" },
    { label: "平台补贴总额", value: "¥1,512,899.3", delta: "-15.4%", diff: "(-275,497.9)", dir: "down" },
    { label: "商家补贴占比", value: "69.5%", delta: "+1.3%", diff: "(+0.9pp)", dir: "up" },
    { label: "商家营销力度", value: "30.8%", delta: "+1.2%", diff: "(+0.4pp)", dir: "up" },
    { label: "活动 ROI", value: "3.3", delta: "-1.2%", diff: "(-0)", dir: "down" }
  ],
  costComposition: [
    { name: "商家成本", value: 69.5, amount: "¥3,444,191.58", avg: "单均 ¥11.92", color: "#5b77b8" },
    { name: "平台成本", value: 30.5, amount: "¥1,512,899.33", avg: "单均 ¥5.24", color: "#a9b8d8" }
  ],
  newOld: {
    title: "新老客商家成本 · 饿了么",
    items: [
      { name: "老客", value: 45.7, amount: "¥791,076.73", avg: "单均 ¥10.92", color: "#5b77b8" },
      { name: "新客", value: 54.3, amount: "¥939,048.88", avg: "单均 ¥11.73", color: "#a9b8d8" }
    ]
  },
  trend: {
    dates: [
      { a: "11-01", b: "周日" }, { a: "11-02", b: "周一" }, { a: "11-03", b: "周二" },
      { a: "11-04", b: "周三" }, { a: "11-05", b: "周四" }, { a: "11-06", b: "周五" },
      { a: "11-07", b: "周六" }, { a: "11-08", b: "周日" }, { a: "11-09", b: "周一" },
      { a: "11-10", b: "周二" }, { a: "11-11", b: "周三" }, { a: "11-12", b: "周四" }
    ],
    merchant: [400000, 250000, 260000, 270000, 250000, 350000, 420000, 330000, 240000, 250000, 250000, 240000],
    platform: [150000, 70000, 90000, 100000, 95000, 150000, 180000, 160000, 80000, 90000, 85000, 95000],
    rate: [31.0, 30.5, 30.6, 30.7, 30.4, 30.9, 31.2, 30.8, 30.2, 30.5, 30.4, 30.3]
  },
  donuts: [
    {
      title: "各类支出占比 · 饿了么",
      items: [
        { name: "爆单红包", value: 41.8, color: "#5b77b8" },
        { name: "减配送费", value: 25.8, color: "#8fb2a6" },
        { name: "配送费", value: 25.3, color: "#d7a26b" },
        { name: "特价菜", value: 2.2, color: "#a999c9" },
        { name: "新客红包", value: 2.1, color: "#df9d9b" },
        { name: "其他", value: 1.7, color: "#bfc6d4" },
        { name: "商家券", value: 1.1, color: "#7fa3c9" }
      ]
    },
    {
      title: "各类支出占比 · 美团",
      items: [
        { name: "红包", value: 35.5, color: "#5b77b8" },
        { name: "神券", value: 31.1, color: "#8fb2a6" },
        { name: "减配送费", value: 26.4, color: "#d7a26b" },
        { name: "特价菜", value: 3.7, color: "#a999c9" },
        { name: "多件优惠", value: 1.7, color: "#df9d9b" },
        { name: "新客优惠", value: 1.2, color: "#bfc6d4" },
        { name: "品类折扣", value: 0.4, color: "#7fa3c9" }
      ]
    }
  ],
  activities: [
    {
      title: "各类活动成本与效果 · 饿了么",
      items: [
        { name: "爆单红包", amount: "¥727,545.48", share: 41.8, orders: "74.3%", roi: "0.68" },
        { name: "减配送费", amount: "¥449,110.10", share: 25.8, orders: "90.8%", roi: "0.68" },
        { name: "起送价", amount: "¥440,198.20", share: 25.3, orders: "73.6%", roi: "0.68" },
        { name: "特价菜", amount: "¥38,367.18", share: 2.2, orders: "94.7%", roi: "5.96" },
        { name: "新客红包", amount: "¥21,603.00", share: 1.2, orders: "51.0%", roi: "2.54" },
        { name: "关注有礼", amount: "¥13,850.00", share: 0.8, orders: "57.2%", roi: "1.21" },
        { name: "其他", amount: "¥12,154.40", share: 0.7, orders: "53.0%", roi: "0.98" },
        { name: "人群营销", amount: "¥8,468.30", share: 0.3, orders: "46.7%", roi: "0.71" }
      ]
    },
    {
      title: "各类活动成本与效果 · 美团",
      items: [
        { name: "红包", amount: "¥577,072.27", share: 35.5, orders: "71.7%", roi: "0.63" },
        { name: "神抢手", amount: "¥505,162.47", share: 31.1, orders: "71.4%", roi: "0.62" },
        { name: "减配送费", amount: "¥428,953.71", share: 26.4, orders: "76.0%", roi: "0.64" },
        { name: "特价菜", amount: "¥57,072.06", share: 3.5, orders: "82.6%", roi: "0.68" },
        { name: "多件优惠", amount: "¥27,222.53", share: 1.7, orders: "75.6%", roi: "0.71" },
        { name: "商家会员券", amount: "¥13,727.70", share: 0.8, orders: "61.4%", roi: "0.55" },
        { name: "到店/自提专享券", amount: "¥6,345.79", share: 0.4, orders: "49.0%", roi: "0.42" },
        { name: "门店新客立减", amount: "¥4,354.00", share: 0.3, orders: "36.9%", roi: "0.38" }
      ]
    }
  ],
  detail: [
    { platform: "美团", type: "红包", merchant: "¥577,072.27", plat: "¥234,084.93", mAvg: "¥8.71", pAvg: "¥3.53", mOrders: "66,231", orders: "74.9%", incomeRate: "42.63", share: "35.5%", verify: "4.89" },
    { platform: "美团", type: "神抢手", merchant: "¥505,162.47", plat: "¥182,461.10", mAvg: "¥7.68", pAvg: "¥2.77", mOrders: "65,742", orders: "93.4%", incomeRate: "40.92", share: "31.1%", verify: "5.32" },
    { platform: "美团", type: "减配送费", merchant: "¥428,953.71", plat: "¥72,987.10", mAvg: "¥9.25", pAvg: "¥1.57", mOrders: "46,378", orders: "97.4%", incomeRate: "41.55", share: "26.4%", verify: "12.77" },
    { platform: "美团", type: "特价菜", merchant: "¥57,072.06", plat: "¥18,633.10", mAvg: "¥5.08", pAvg: "¥1.66", mOrders: "11,235", orders: "93.8%", incomeRate: "45.63", share: "3.5%", verify: "6.11" },
    { platform: "美团", type: "多件优惠", merchant: "¥27,222.53", plat: "¥9,811.20", mAvg: "¥4.92", pAvg: "¥1.77", mOrders: "5,532", orders: "88.4%", incomeRate: "44.91", share: "1.7%", verify: "3.22" },
    { platform: "美团", type: "商家会员券", merchant: "¥13,727.70", plat: "¥3,061.40", mAvg: "¥5.62", pAvg: "¥1.25", mOrders: "2,442", orders: "83.1%", incomeRate: "46.03", share: "0.8%", verify: "2.40" },
    { platform: "美团", type: "到店/自提专享券", merchant: "¥6,345.79", plat: "¥2,230.80", mAvg: "¥4.48", pAvg: "¥1.58", mOrders: "1,416", orders: "79.4%", incomeRate: "47.02", share: "0.4%", verify: "1.87" },
    { platform: "美团", type: "门店新客立减", merchant: "¥4,354.00", plat: "¥2,500.00", mAvg: "¥3.68", pAvg: "¥2.11", mOrders: "1,183", orders: "69.2%", incomeRate: "48.16", share: "0.3%", verify: "0.94" },
    { platform: "饿了么", type: "爆单红包", merchant: "¥727,545.48", plat: "¥0.00", mAvg: "¥10.98", pAvg: "¥0.00", mOrders: "66,244", orders: "74.3%", incomeRate: "40.12", share: "41.8%", verify: "4.89" },
    { platform: "饿了么", type: "减配送费", merchant: "¥449,110.10", plat: "¥0.00", mAvg: "¥9.11", pAvg: "¥0.00", mOrders: "49,298", orders: "90.8%", incomeRate: "39.87", share: "25.8%", verify: "0.68" },
    { platform: "饿了么", type: "起送价", merchant: "¥440,198.20", plat: "¥0.00", mAvg: "¥10.20", pAvg: "¥0.00", mOrders: "43,157", orders: "73.6%", incomeRate: "41.02", share: "25.3%", verify: "0.68" },
    { platform: "饿了么", type: "特价菜", merchant: "¥38,367.18", plat: "¥0.00", mAvg: "¥4.06", pAvg: "¥0.00", mOrders: "9,447", orders: "94.7%", incomeRate: "46.21", share: "2.2%", verify: "5.96" },
    { platform: "饿了么", type: "新客红包", merchant: "¥21,603.00", plat: "¥0.00", mAvg: "¥6.21", pAvg: "¥0.00", mOrders: "3,478", orders: "51.0%", incomeRate: "43.55", share: "1.2%", verify: "2.54" }
  ]
};

/* ================= 营销场景分析 ================= */
window.DASHBOARD_DATA.marketingScene = {
  title: "营销场景分析",
  updatedAt: "自然月累计 2026-11-01 ~ 2026-11-12 · 窗口内 12 天",
  filters: {
    quick: ["昨日", "近7天", "近30天"],
    dateStart: "2026-11-01",
    dateEnd: "2026-11-12",
    platforms: ["全部", "美团", "饿了么"],
    stores: ["门店维度：全部", "安徽工学院店", "深圳湾万象城店", "北京三里屯店", "上海世博天地店"]
  },
  kpiGroups: [
    {
      label: "主站货架",
      items: [
        { label: "实付 GMV", value: "4,440,101", delta: "-9.54%", dir: "down" },
        { label: "GMV 渗透率", value: "58.6%", delta: "+2.2pp", dir: "up" },
        { label: "实收订单量", value: "167,946", delta: "-9.12%", dir: "down" },
        { label: "实收单均价", value: "26.4", delta: "-0.46%", dir: "down" },
        { label: "实收单均补贴", value: "待数据", delta: "—", dir: "" }
      ]
    },
    {
      label: "神抢手（含超抢手）",
      items: [
        { label: "实付 GMV", value: "3,054,791", delta: "-17.63%", dir: "down" },
        { label: "GMV 渗透率", value: "40.3%", delta: "-2.3pp", dir: "down" },
        { label: "实收订单量", value: "108,170", delta: "-18.58%", dir: "down" },
        { label: "实收单均价", value: "28.2", delta: "+1.18%", dir: "up" },
        { label: "实收单均补贴", value: "3.9", delta: "-7.11%", dir: "down" }
      ]
    },
    {
      label: "拼好饭（含拼团）",
      items: [
        { label: "实付 GMV", value: "87,185", delta: "+0.18%", dir: "up" },
        { label: "GMV 渗透率", value: "1.1%", delta: "+0.1pp", dir: "up" },
        { label: "实收订单量", value: "7,184", delta: "+0.60%", dir: "up" },
        { label: "实收单均价", value: "12.1", delta: "-0.45%", dir: "down" },
        { label: "实收单均补贴", value: "待数据", delta: "—", dir: "" }
      ]
    }
  ],
  extraKpis: [
    { label: "拼好饭订单占比（含拼团）", value: "2.5%", delta: "+0.3pp", dir: "up" },
    { label: "神抢手订单占比（含超抢手）", value: "38.2%", delta: "-2.7pp", dir: "down" },
    { label: "主站顾客实付率", value: "64.4%", delta: "+0.1pp", dir: "up" },
    { label: "拼好饭顾客实付率", value: "66.6%", delta: "+0.8pp", dir: "up" }
  ],
  weekly: {
    labels: ["26年W35", "26年W36", "26年W37", "26年W38", "26年W39", "26年W40", "26年W41", "26年W42", "26年W43", "26年W44", "26年W45", "26年W46"],
    charts: [
      {
        title: "神抢手订单占比（淘/美）",
        unit: "pct",
        series: [
          { name: "美团超抢手占比", color: "#5b77b8", values: [43.2, 45.1, 48.6, 52.3, 46.4, 38.2, 45.7, 43.1, 39.6, 41.2, 37.8, 36.4] },
          { name: "饿了么超抢手占比", color: "#8fb2a6", values: [39.8, 40.6, 41.9, 43.2, 41.5, 35.7, 39.4, 38.2, 36.9, 38.6, 36.8, 35.9] }
        ]
      },
      {
        title: "拼好饭订单占比（淘/美）",
        unit: "pct",
        series: [
          { name: "美团拼好饭占比", color: "#5b77b8", values: [1.6, 1.8, 1.7, 1.9, 2.1, 2.0, 2.2, 2.1, 1.9, 1.8, 1.7, 1.8] },
          { name: "饿了么拼团占比", color: "#8fb2a6", values: [2.2, 2.4, 2.3, 2.6, 2.8, 2.7, 2.9, 2.8, 2.6, 2.4, 2.3, 2.5] }
        ]
      }
    ]
  },
  products: {
    labels: ["拼好饭（含拼团）", "神抢手（含超抢手）"],
    sets: [
      {
        leftTitle: "淘宝闪购（饿了么）",
        rightTitle: "美团",
        leftTotal: "总计销量 6,733",
        rightTotal: "总计销量 451",
        left: [
          { name: "甄选泰奶", share: "25.0%", price: "¥17.5", qty: "1,680", width: 100 },
          { name: "小鹿柠檬茶", share: "16.9%", price: "¥11.6", qty: "1,139", width: 68 },
          { name: "生椰泰奶", share: "14.7%", price: "¥14.7", qty: "990", width: 59 },
          { name: "葡萄茉莉冷泡", share: "13.5%", price: "¥14.2", qty: "908", width: 54 },
          { name: "芒果糯米饭", share: "7.7%", price: "¥11.8", qty: "521", width: 31 },
          { name: "红心芭乐山竹冰茶", share: "7.7%", price: "¥15.3", qty: "516", width: 31 },
          { name: "送小菜", share: "14.4%", price: "¥20.9", qty: "990", width: 58 }
        ],
        right: [
          { name: "生椰泰奶", share: "63.2%", price: "¥13.6", qty: "285", width: 100 },
          { name: "生椰糯米饭", share: "14.6%", price: "¥11.2", qty: "66", width: 23 },
          { name: "小鹿柠檬茶", share: "9.5%", price: "¥9.7", qty: "43", width: 15 },
          { name: "葡萄茉莉冷泡", share: "5.3%", price: "¥12.1", qty: "24", width: 8 },
          { name: "送小菜", share: "4.2%", price: "¥27.0", qty: "19", width: 7 },
          { name: "迷你小菜+送小菜", share: "2.4%", price: "¥18.7", qty: "11", width: 4 }
        ]
      },
      {
        leftTitle: "淘宝闪购（饿了么）",
        rightTitle: "美团",
        leftTotal: "总计销量 3,106",
        rightTotal: "总计销量 2,864",
        left: [
          { name: "甄选泰奶", share: "22.3%", price: "¥19.9", qty: "693", width: 100 },
          { name: "咸法酪泰奶（清爽版）", share: "18.6%", price: "¥16.8", qty: "578", width: 83 },
          { name: "招牌泰式奶茶", share: "15.2%", price: "¥15.5", qty: "472", width: 68 },
          { name: "手打柠檬茶", share: "11.4%", price: "¥13.9", qty: "354", width: 51 },
          { name: "芒果糯米饭", share: "8.7%", price: "¥18.2", qty: "270", width: 39 },
          { name: "可可泰奶（冬季限定）", share: "6.3%", price: "¥17.5", qty: "196", width: 28 }
        ],
        right: [
          { name: "甄选泰奶", share: "24.8%", price: "¥20.1", qty: "710", width: 100 },
          { name: "咸法酪泰奶（清爽版）", share: "20.1%", price: "¥17.2", qty: "576", width: 81 },
          { name: "招牌泰式奶茶", share: "16.4%", price: "¥15.8", qty: "470", width: 66 },
          { name: "手打柠檬茶", share: "12.0%", price: "¥14.2", qty: "344", width: 48 },
          { name: "青咖喱鸡饭", share: "8.5%", price: "¥32.0", qty: "243", width: 34 },
          { name: "冬阴功海鲜面", share: "5.9%", price: "¥36.0", qty: "169", width: 24 }
        ]
      }
    ]
  },
  sceneTable: [
    { platform: "美团", scene: "主站", orders: "74,751", gmv: "¥2,951,997", income: "待数据", incomeRate: "待数据", cups: "115,887", avgIncome: "待数据", activitySub: "¥1,610,920.5", avgSub: "¥13.9", profit: "¥1,997,010.15" },
    { platform: "美团", scene: "拼好饭", orders: "451", gmv: "¥6,639", income: "待数据", incomeRate: "待数据", cups: "451", avgIncome: "待数据", activitySub: "¥6,039.05", avgSub: "¥13.39", profit: "¥3,605.12" },
    { platform: "饿了么", scene: "拼好饭", orders: "3,428", gmv: "¥48,762", income: "待数据", incomeRate: "待数据", cups: "4,930", avgIncome: "待数据", activitySub: "¥27,835.44", avgSub: "¥8.12", profit: "¥9,842.20" },
    { platform: "饿了么", scene: "神抢手", orders: "7,184", gmv: "¥87,185", income: "待数据", incomeRate: "待数据", cups: "10,490", avgIncome: "待数据", activitySub: "¥69,180.00", avgSub: "¥9.63", profit: "¥21,004.36" }
  ],
  storeRows: [
    { store: "安徽工学院店", tk: "TK00169", platform: "饿了么", scene: "拼好饭", orders: "23", orderShare: "15.2%", qty: "23", qtyShare: "12.5%", incomeRate: "待数据", avgIncome: "待数据", avgSub: "¥0.00" },
    { store: "安徽工学院店", tk: "TK00169", platform: "饿了么", scene: "神抢手", orders: "18", orderShare: "11.9%", qty: "22", qtyShare: "12.0%", incomeRate: "待数据", avgIncome: "待数据", avgSub: "¥10.92" },
    { store: "安徽工学院店", tk: "TK00169", platform: "饿了么", scene: "主站", orders: "110", orderShare: "72.8%", qty: "139", qtyShare: "75.5%", incomeRate: "待数据", avgIncome: "待数据", avgSub: "¥10.29" },
    { store: "安徽工学院店", tk: "TK00169", platform: "美团", scene: "神抢手", orders: "68", orderShare: "44.4%", qty: "85", qtyShare: "40.9%", incomeRate: "待数据", avgIncome: "待数据", avgSub: "¥11.61" },
    { store: "安徽工学院店", tk: "TK00169", platform: "美团", scene: "主站", orders: "85", orderShare: "55.6%", qty: "123", qtyShare: "59.1%", incomeRate: "待数据", avgIncome: "待数据", avgSub: "¥11.81" },
    { store: "深圳湾万象城店", tk: "TK0143", platform: "饿了么", scene: "拼好饭", orders: "74", orderShare: "17.7%", qty: "74", qtyShare: "13.4%", incomeRate: "待数据", avgIncome: "待数据", avgSub: "¥0.24" },
    { store: "深圳湾万象城店", tk: "TK0143", platform: "饿了么", scene: "神抢手", orders: "49", orderShare: "11.5%", qty: "62", qtyShare: "14.8%", incomeRate: "待数据", avgIncome: "待数据", avgSub: "¥12.50" },
    { store: "深圳湾万象城店", tk: "TK0143", platform: "饿了么", scene: "主站", orders: "295", orderShare: "70.6%", qty: "397", qtyShare: "71.8%", incomeRate: "待数据", avgIncome: "待数据", avgSub: "¥11.12" },
    { store: "深圳湾万象城店", tk: "TK0143", platform: "美团", scene: "神抢手", orders: "122", orderShare: "41.4%", qty: "151", qtyShare: "40.2%", incomeRate: "待数据", avgIncome: "待数据", avgSub: "¥14.63" },
    { store: "深圳湾万象城店", tk: "TK0143", platform: "美团", scene: "主站", orders: "173", orderShare: "58.6%", qty: "225", qtyShare: "59.8%", incomeRate: "待数据", avgIncome: "待数据", avgSub: "¥12.15" }
  ]
};

/* ================= 营销台账记录 ================= */
window.DASHBOARD_DATA.marketingLedger = {
  title: "营销台账记录",
  updatedAt: "活动台账与营销日历 · 记录自动保存草稿",
  filters: {
    quick: ["昨日", "近7天", "近30天"],
    dateStart: "2026-11-01",
    dateEnd: "2026-11-12",
    platforms: ["全部", "美团", "饿了么"],
    stores: ["门店维度：全部", "安徽工学院店", "深圳湾万象城店", "北京三里屯店", "上海世博天地店"]
  },
  tabs: ["活动台账", "营销日历"],
  rows: [
    { name: "双11 爆单红包", goal: "提升下单转化", time: "2026-11-01 ~ 2026-11-12", channel: "美团", milestone: "预热 / 爆发 / 收尾", owners: "运营-沈健 / 门店-李萌", budget: "¥120,000", roi: "3.6", status: "进行中" },
    { name: "冬季新品试饮", goal: "新品拉新", time: "2026-11-06 ~ 2026-11-20", channel: "饿了么", milestone: "上线首周 / 复购召回", owners: "市场-王倩 / 运营-沈健", budget: "¥45,000", roi: "2.4", status: "进行中" },
    { name: "神抢手满减加码", goal: "提升客单价", time: "2026-11-08 ~ 2026-11-15", channel: "美团", milestone: "周末加码 / 数据复盘", owners: "运营-陈晨", budget: "¥80,000", roi: "4.1", status: "已结束" },
    { name: "门店新客立减", goal: "新客首单转化", time: "2026-10-20 ~ 2026-11-30", channel: "全渠道", milestone: "持续投放", owners: "运营-沈健", budget: "¥30,000", roi: "1.9", status: "进行中" }
  ],
  calendar: [
    { date: "11/06", name: "冬季新品试饮上线", channel: "饿了么", owner: "王倩" },
    { date: "11/08", name: "神抢手周末加码", channel: "美团", owner: "陈晨" },
    { date: "11/11", name: "双11 爆单红包爆发", channel: "美团", owner: "沈健" },
    { date: "11/15", name: "神抢手满减加码结束", channel: "美团", owner: "陈晨" }
  ]
};

/* ================= 数据下载 ================= */
window.DASHBOARD_DATA.dataDownload = {
  title: "数据下载",
  updatedAt: "按平台报表导出整理字段 · 单次最多 100000 行 / 400 天",
  cardTitle: "导出整理后的事实字段",
  desc: "按平台报表导出整理字段：最多 100000 行、400 天。缺失值为 \\N，真实零为 0。月报按月首日筛选。",
  reportTypes: ["美团门店日报", "饿了么门店日报", "全平台门店日报", "门店月报"],
  platforms: ["全部", "美团", "饿了么"],
  dateStart: "2026-11-13",
  dateEnd: "2026-11-13",
  tkLabel: "TK 编码（逗号分隔；留空为全部，包含未对应门店）",
  tkPlaceholder: "例：TK00169, TK0143",
  fields: [
    { label: "业务日期", on: true },
    { label: "门店名称", on: true },
    { label: "有效订单", on: true },
    { label: "曝光人数", on: true },
    { label: "商家取消订单", on: true },
    { label: "平台", on: true },
    { label: "平台门店ID", on: true },
    { label: "商品原价", on: true },
    { label: "入店人数", on: true },
    { label: "取消订单", on: true },
    { label: "TK", on: true },
    { label: "营业收入", on: true },
    { label: "顾客实付", on: true },
    { label: "下单人数", on: true }
  ],
  rows: "100000",
  days: "400"
};

/* ================= 门店报告导出 ================= */
window.DASHBOARD_DATA.storeReport = {
  title: "门店报告导出",
  updatedAt: "当前账号授权范围 66 家门店 · 字段固定保留，缺数据用「-」表示",
  tabs: ["日报", "周报", "月报"],
  stores: ["济南万象城店 · TK00011", "上海静安大悦城店 · TK00014", "深圳湾万象城店 · TK0143", "安徽工学院店 · TK00169"],
  platforms: ["全部", "美团", "饿了么"],
  targets: ["查看 PDF", "下载 PDF", "下载 PNG"],
  notes: [
    "如需饿了么 + 京东外卖口径：无数据的日期仍按所选日期展示缺数说明，不自动改为最近有数据日。",
    "若没有有效核心数据（实收与订单均缺失），正式报告禁用下载。"
  ],
  daily: {
    store: "济南万象城店",
    tk: "TK00011",
    date: "2026-11-13",
    weekday: "周五",
    scope: "全部（美团+饿了么+京东外卖）",
    summary: [
      {
        label: "营业总实收",
        value: "¥12,438.50",
        lines: [["较前一日", "+4.2% · 可比 1/1"], ["较上周同日", "-1.8% · 可比 1/1"]],
        monthLabel: "本月累计",
        monthValue: "¥50,422.99",
        monthNote: "较上月同期 +11.9% · 可比 12/13"
      },
      {
        label: "外卖总实收",
        value: "¥3,214.80",
        lines: [["较前一日", "+6.1% · 可比 1/1"], ["较上周同日", "+2.4% · 可比 1/1"]],
        monthLabel: "本月累计",
        monthValue: "¥12,561.79",
        monthNote: "较上月同期 +6.91% · 可比 34/39"
      }
    ],
    cost: {
      label: "成本与毛利",
      rows: [["当日成本", "¥2,845.20"], ["当日毛利额", "¥9,593.30"], ["本月成本", "¥6,227.54 元"], ["本月毛利额", "¥5,945.71 元"]],
      note: "运营估算，覆盖美团、淘宝闪购的可用数据。"
    },
    tiles: [
      {
        name: "堂食",
        today: [["收入", "¥9,223.70"], ["成本", "¥4,227.54"], ["毛利率", "54.2%"], ["毛利额", "¥4,996.16"]],
        month: [["本月收入", "¥37,861.20"], ["本月毛利额", "¥19,013.40"], ["本月毛利率", "50.2%"], ["本月外卖收入", "—"]]
      },
      {
        name: "美团外卖",
        today: [["收入", "¥1,286.40"], ["成本", "¥601.20"], ["毛利率", "53.3%"], ["毛利额", "¥685.20"]],
        month: [["本月收入", "¥6,006.85"], ["本月成本", "¥2,809.25"], ["本月毛利率", "53.23%"], ["本月毛利额", "¥3,197.60"]]
      },
      {
        name: "淘宝闪购",
        today: [["收入", "¥1,928.40"], ["成本", "¥1,016.46"], ["毛利率", "47.3%"], ["毛利额", "¥911.94"]],
        month: [["本月收入", "¥6,166.40"], ["本月成本", "¥3,418.29"], ["本月毛利率", "44.57%"], ["本月毛利额", "¥2,748.11"]]
      },
      {
        name: "外卖合计",
        today: [["收入", "¥3,214.80"], ["成本", "¥1,617.66"], ["毛利率", "49.7%"], ["毛利额", "¥1,597.14"]],
        month: [["本月收入", "¥12,561.79"], ["试算成本", "¥6,227.54"], ["本月毛利率", "48.84%"], ["本月毛利额", "¥5,945.71"]]
      }
    ],
    top5: [
      { name: "甄选泰奶", qty: "32", amount: "¥560.00" },
      { name: "咸法酪泰奶（清爽版）", qty: "26", amount: "¥436.80" },
      { name: "招牌泰式奶茶", qty: "21", amount: "¥325.50" },
      { name: "手打柠檬茶", qty: "17", amount: "¥236.30" },
      { name: "芒果糯米饭", qty: "12", amount: "¥218.40" }
    ],
    funnels: {
      meituan: { label: "美团流量漏斗", exposure: "1,286", visit: "96", order: "31", visitRate: "7.5%", orderRate: "32.3%" },
      eleme: { label: "饿了么流量漏斗", exposure: "1,842", visit: "121", order: "38", visitRate: "6.6%", orderRate: "31.4%" }
    },
    hours: [
      { slot: "10:00-11:00", pct: 8 },
      { slot: "11:00-12:00", pct: 26 },
      { slot: "12:00-13:00", pct: 19 },
      { slot: "13:00-14:00", pct: 7 },
      { slot: "17:00-18:00", pct: 15 },
      { slot: "18:00-19:00", pct: 18 },
      { slot: "19:00-20:00", pct: 7 }
    ],
    basics: {
      meituan: [["近30日日均商家评分", "4.8"], ["独立店铺分", "92"], ["无效订单率", "0.8%"], ["出餐超时率（>15分钟）", "1.2%"]],
      eleme: [["日报店铺评分", "4.7"], ["独立店铺分", "90"], ["无效订单率", "1.1%"], ["出餐超时率（>15分钟）", "1.6%"]]
    },
    reviews: { meituan: "1 条", eleme: "0 条" },
    record: { date: "2026-08-07", value: "¥6,074.27" },
    focus: "本日关注：11:00-13:00 单量占全天 45%，出餐超时集中在午高峰；美团入店转化 7.5% 低于授权门店中位，建议优化门店头图与满减门槛。"
  },
  weekly: {
    store: "上海静安大悦城店",
    city: "上海",
    tk: "TK00014",
    tabLabel: "周报",
    period: "2026-11-02 至 2026-11-08",
    status: "存在待改善指标，建议跟进",
    headline: "总评：外卖总实收 ¥11,883（环比 10.5%），订单 528 单（环比 3.7%）；最弱一项是【入店转化】，只超过授权门店 18% 的门店；亮点：下单转化（超 86% 门店）。",
    kpis: [
      { label: "外卖实收", value: "¥11,883", delta: "+10.5%", extra: "(+1,126.3)", dir: "up" },
      { label: "有效订单", value: "528", delta: "+3.7%", extra: "(+19)", dir: "up" },
      { label: "实收客单价", value: "¥22.5", delta: "+6.5%", extra: "(+1.4)", dir: "up" },
      { label: "到手率（扣）", value: "66.5%", delta: "+1.1%", extra: "(+0.7pp)", dir: "up" },
      { label: "外卖占比", value: "34.0%", delta: "+10.7%", extra: "(+3.3pp)", dir: "up" }
    ],
    donut: [
      { name: "美团 ¥4,620 · 13.2%", pct: 13.2, color: "#5b77b8" },
      { name: "饿了么 ¥7,263 · 20.8%", pct: 20.8, color: "#8fb2a6" },
      { name: "堂食（线下）¥23,088 · 66.0%", pct: 66, color: "#d9b98a" }
    ],
    trend: {
      labels: ["09-14起", "09-21起", "09-28起", "10-05起", "10-12起", "10-19起", "10-26起", "11-02起"],
      bars: [
        { name: "美团收入", color: "#d9a13c", values: [1380, 1520, 1290, 1460, 1510, 1330, 1420, 1560] },
        { name: "饿了么收入", color: "#5b77b8", values: [1870, 2040, 1920, 2010, 2160, 1980, 2100, 2263] }
      ],
      line: { name: "有效订单", color: "#8a8f3c", values: [428, 461, 436, 449, 468, 452, 476, 528] }
    },
    radar: {
      dims: ["实收", "到手率", "下单", "入店", "商家取消"],
      mine: [72, 62, 84, 18, 70],
      median: [50, 50, 50, 50, 50],
      prev: [62, 56, 76, 22, 66]
    },
    compare: [
      ["实收（元）", "¥10,757", "¥11,883", "+10.5%", "¥8,367", "+42.0%", "green"],
      ["有效订单（单）", "509", "528", "+3.7%", "429", "+23.0%", "green"],
      ["实收客单价", "¥21.1", "¥22.5", "+6.5%", "¥20.4", "+10.3%", "green"],
      ["到手率（扣）", "65.8%", "66.5%", "+0.7pp", "66.6%", "-0.0pp", "green"],
      ["曝光量（人）", "30,612", "31,356", "+2.4%", "26,081", "+20.2%", "green"],
      ["入店转化率", "6.3%", "6.6%", "+0.3pp", "7.7%", "-1.2pp", "amber"],
      ["下单转化率", "25.9%", "25.6%", "-0.3pp", "19.8%", "+5.8pp", "green"],
      ["近30日复购率", "14.7%", "13.9%", "-0.7pp", "13.3%", "+0.6pp", "green"],
      ["店铺分", "99", "99", "0.0分", "99", "0.0分", "green"],
      ["商家评分", "4.70", "4.60", "-0.1分", "4.60", "0.0分", "amber"]
    ],
    funnels: {
      meituan: { label: "美团外卖", exposure: "14,860", visit: "982", order: "254", visitRate: "6.6%", orderRate: "25.9%" },
      eleme: { label: "饿了么外卖", exposure: "16,496", visit: "1,092", order: "274", visitRate: "6.6%", orderRate: "25.1%" }
    },
    score: {
      meituan: { score: "4.8", total: "5.0", count: "128 条", items: [["口味", "4.8"], ["包装", "4.7"], ["配送", "4.6"], ["服务", "4.9"]] },
      eleme: { score: "4.7", total: "5.0", count: "96 条", items: [["口味", "4.7"], ["包装", "4.6"], ["配送", "4.5"], ["服务", "4.8"]] }
    },
    diagnosis: [
      "入店转化率 6.6% 低于授权门店中位 1.2pp，建议优化门店头图、店名关键词与起送价门槛。",
      "下单转化率 25.6% 高于参考值 5.8pp，满减与神抢手组合有效，建议维持当前活动力度。",
      "商家评分环比下滑 0.1 分，需关注近期出餐时长与包装完整性。"
    ]
  },
  monthly: {
    store: "上海静安大悦城店",
    city: "上海",
    tk: "TK00014",
    tabLabel: "月报",
    period: "2026-10-01 至 2026-10-31",
    status: "存在待改善指标，建议跟进",
    headline: "总评：外卖总实收 ¥57,276（环比 6.4%），订单 2,549 单（环比 5.2%）；最弱一项是【入店转化】，只超过授权门店 20% 的门店；亮点：下单转化（超 88% 门店）。",
    kpis: [
      { label: "外卖实收", value: "¥57,276", delta: "+6.4%", extra: "(+3,446)", dir: "up" },
      { label: "有效订单", value: "2,549", delta: "+5.2%", extra: "(+126)", dir: "up" },
      { label: "实收客单价", value: "¥22.5", delta: "+1.6%", extra: "(+0.4)", dir: "up" },
      { label: "到手率（扣）", value: "68.6%", delta: "+1.8%", extra: "(+1.2pp)", dir: "up" },
      { label: "外卖占比", value: "29.7%", delta: "-2.4%", extra: "(-0.7pp)", dir: "down" }
    ],
    donut: [
      { name: "美团 ¥49,698 · 49.7%", pct: 49.7, color: "#5b77b8" },
      { name: "饿了么 ¥8,470 · 8.5%", pct: 8.5, color: "#8fb2a6" },
      { name: "堂食（线下）¥41,833 · 41.8%", pct: 41.8, color: "#d9b98a" }
    ],
    trend: {
      labels: ["10-01起", "10-08起", "10-15起", "10-22起", "10-29起"],
      bars: [
        { name: "美团收入", color: "#d9a13c", values: [10800, 12400, 11900, 12800, 11798] },
        { name: "饿了么收入", color: "#5b77b8", values: [2100, 2260, 2080, 2320, 2010] }
      ],
      line: { name: "有效订单", color: "#8a8f3c", values: [612, 668, 640, 672, 585] }
    },
    radar: {
      dims: ["实收", "到手率", "下单", "入店", "商家取消"],
      mine: [68, 66, 88, 20, 72],
      median: [50, 50, 50, 50, 50],
      prev: [58, 52, 74, 24, 64]
    },
    compare: [
      ["实收（元）", "¥53,830", "¥57,276", "+6.4%", "¥8,367", "+584.6%", "green"],
      ["有效订单（单）", "2,423", "2,549", "+5.2%", "429", "+494.2%", "green"],
      ["实收客单价", "¥22.1", "¥22.5", "+1.6%", "¥20.4", "+10.3%", "green"],
      ["到手率（扣）", "66.8%", "68.6%", "+1.8pp", "66.6%", "+2.0pp", "green"],
      ["曝光量（人）", "128,640", "132,180", "+2.8%", "26,081", "+406.8%", "green"],
      ["入店转化率", "6.4%", "6.5%", "+0.1pp", "7.7%", "-1.2pp", "amber"],
      ["下单转化率", "26.4%", "26.8%", "+0.4pp", "19.8%", "+7.0pp", "green"],
      ["近30日复购率", "14.9%", "15.2%", "+0.3pp", "13.3%", "+1.9pp", "green"],
      ["店铺分", "98", "99", "+1.0分", "99", "0.0分", "green"],
      ["商家评分", "4.70", "4.70", "0.0分", "4.60", "+0.1分", "green"]
    ],
    funnels: {
      meituan: { label: "美团外卖", exposure: "62,480", visit: "4,062", order: "1,088", visitRate: "6.5%", orderRate: "26.8%" },
      eleme: { label: "饿了么外卖", exposure: "69,700", visit: "4,531", order: "1,214", visitRate: "6.5%", orderRate: "26.8%" }
    },
    score: {
      meituan: { score: "4.8", total: "5.0", count: "512 条", items: [["口味", "4.8"], ["包装", "4.7"], ["配送", "4.6"], ["服务", "4.9"]] },
      eleme: { score: "4.7", total: "5.0", count: "408 条", items: [["口味", "4.7"], ["包装", "4.6"], ["配送", "4.5"], ["服务", "4.8"]] }
    },
    diagnosis: [
      "入店转化率 6.5% 低于授权门店中位 1.2pp，建议在月初集中优化头图与配送范围。",
      "下单转化率 26.8% 高于参考值 7.0pp，满减与神抢手组合持续有效。",
      "外卖占比环比下降 0.7pp，堂食增长更快，可适当追加外卖渠道补贴。"
    ]
  }
};
