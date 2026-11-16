/* 应用骨架：侧边栏 + 视图分发 + toast */
(function () {
  const { ref, computed } = Vue;
  const D = window.DASHBOARD_DATA;

  window.AppLayout = {
    components: {
      SidebarPanel: window.SidebarPanel,
      WorkbenchPage: window.WorkbenchPage,
      StoreRelationPage: window.StoreRelationPage,
      ProductMaintenancePage: window.ProductMaintenancePage,
      BusinessOverviewPage: window.BusinessOverviewPage,
      TrafficOverviewPage: window.TrafficOverviewPage,
      PromotionAnalysisPage: window.PromotionAnalysisPage,
      OrderStructurePage: window.OrderStructurePage,
      FundamentalAnalysisPage: window.FundamentalAnalysisPage,
      CustomerAnalysisPage: window.CustomerAnalysisPage,
      ReviewAnalysisPage: window.ReviewAnalysisPage,
      ProductSalesPage: window.ProductSalesPage,
      ProductConversionPage: window.ProductConversionPage,
      ProductMarginPage: window.ProductMarginPage,
      NewProductReviewPage: window.NewProductReviewPage,
      MarketingSpendPage: window.MarketingSpendPage,
      MarketingScenePage: window.MarketingScenePage,
      MarketingLedgerPage: window.MarketingLedgerPage,
      DataDownloadPage: window.DataDownloadPage,
      StoreReportPage: window.StoreReportPage
    },
    setup() {
      const activeWarningId = ref(D.warnings[0].id);
      const collapsed = ref(false);
      const toast = ref("");
      const view = ref(window.AppRouter.initial());
      let timer = null;

      const notify = (msg) => {
        toast.value = msg;
        clearTimeout(timer);
        timer = setTimeout(() => (toast.value = ""), 2200);
      };

      const activeMenu = computed(() => window.AppRouter.activeMenu(view.value));
      const isStore = computed(() => activeMenu.value === "store-relation");

      const onMenuSelect = (menu) => {
        const next = window.AppRouter.menuMap[menu.id];
        if (next) view.value = next;
        else notify("「" + menu.label + "」为演示导航，暂未接入");
      };

      return {
        D, activeWarningId, collapsed, toast, view, activeMenu,
        isStore, notify, onMenuSelect
      };
    },
    template: `
      <div class="app">
        <sidebar-panel
          :menus="D.menus"
          :collapsed="collapsed"
          :active-menu="activeMenu"
          @toggle="collapsed = !collapsed"
          @select="onMenuSelect" />

        <div class="main">
          <workbench-page
            v-if="view === 'workbench'"
            :stats="D.stats"
            :todo="D.todo"
            :warnings="D.warnings"
            :active-id="activeWarningId"
            :donut="D.donut"
            :monitor="D.monitor"
            :ranking="D.ranking"
            @select="activeWarningId = $event"
            @notify="notify" />

          <div class="content module-content" v-else>
            <business-overview-page
              v-if="view === 'business-overview'"
              :data="D.businessOverview"
              @notify="notify" />
            <traffic-overview-page
              v-else-if="view === 'traffic-overview'"
              :data="D.trafficOverview"
              @notify="notify" />
            <promotion-analysis-page
              v-else-if="view === 'promotion-analysis'"
              :data="D.promotionAnalysis"
              @notify="notify" />
            <order-structure-page
              v-else-if="view === 'order-structure'"
              :data="D.orderStructure"
              @notify="notify" />
            <fundamental-analysis-page
              v-else-if="view === 'fundamental'"
              :data="D.fundamentalAnalysis"
              @notify="notify" />
            <customer-analysis-page
              v-else-if="view === 'customer-analysis'"
              :data="D.customerAnalysis"
              @notify="notify" />
            <review-analysis-page
              v-else-if="view === 'review-analysis'"
              :data="D.reviewAnalysis"
              @notify="notify" />
            <product-sales-page
              v-else-if="view === 'product-sales'"
              :data="D.productSales"
              @notify="notify" />
            <product-conversion-page
              v-else-if="view === 'product-conversion'"
              :data="D.productConversion"
              @notify="notify" />
            <product-margin-page
              v-else-if="view === 'product-margin'"
              :data="D.productMargin"
              @notify="notify" />
            <new-product-review-page
              v-else-if="view === 'new-product-review'"
              :data="D.newProductReview"
              @notify="notify" />
            <marketing-spend-page
              v-else-if="view === 'marketing-spend'"
              :data="D.marketingSpend"
              @notify="notify" />
            <marketing-scene-page
              v-else-if="view === 'marketing-scene'"
              :data="D.marketingScene"
              @notify="notify" />
            <marketing-ledger-page
              v-else-if="view === 'marketing-ledger'"
              :data="D.marketingLedger"
              @notify="notify" />
            <data-download-page
              v-else-if="view === 'data-download'"
              :data="D.dataDownload"
              @notify="notify" />
            <store-report-page
              v-else-if="view === 'store-report'"
              :data="D.storeReport"
              @notify="notify" />
            <store-relation-page
              v-else-if="isStore"
              :data="D.storeRelation"
              :tab="view"
              @change="view = $event"
              @notify="notify" />
            <product-maintenance-page
              v-else
              :data="D.productMaintenance"
              :tab="view"
              @change="view = $event"
              @notify="notify" />
          </div>
        </div>

        <transition name="fade">
          <div class="toast" v-if="toast">{{ toast }}</div>
        </transition>
      </div>
    `
  };
})();
