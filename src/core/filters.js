/* Shared filter bar template + useFilters composable */
(function () {
  const { ref } = Vue;

  window.FILTER_BAR = `
    <div class="ov-filters">
      <div class="ov-quick-group">
        <span class="ov-filter-label">日期</span>
        <button v-for="q in data.filters.quick" :key="q" class="ov-quick" :class="{ active: quick === q }" @click="quick = q">{{ q }}</button>
      </div>
      <span class="ov-date">{{ data.filters.dateStart }} 至 {{ data.filters.dateEnd }}</span>
      <div class="tv-seg">
        <button v-for="p in data.filters.platforms" :key="p" :class="{ on: platform === p }" @click="platform = p">{{ p }}</button>
      </div>
      <select class="f-select w160" v-model="store">
        <option v-for="o in data.filters.stores" :key="o">{{ o }}</option>
      </select>
      <button class="btn btn-primary" @click="$emit('notify', '已按筛选条件刷新数据（演示）')">查询</button>
      <button class="btn btn-ghost" @click="reset">重置</button>
      <span class="toolbar-spacer"></span>
      <span class="muted-text">全渠道 · 自动更新</span>
    </div>
  `;

  window.useFilters = (props, emit) => {
    const quick = ref("近7天");
    const platform = ref(props.data.filters.platforms[0]);
    const store = ref(props.data.filters.stores[0]);
    const reset = () => {
      quick.value = "近7天";
      platform.value = props.data.filters.platforms[0];
      store.value = props.data.filters.stores[0];
      emit("notify", "筛选条件已重置（演示）");
    };
    return { quick, platform, store, reset };
  };
})();
