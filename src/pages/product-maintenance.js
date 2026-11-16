/* Page: product maintenance */
(function () {
  const { ref, computed, watch, onMounted, onUnmounted, reactive, nextTick } = Vue;

  window.ProductMaintenancePage = {
    name: "ProductMaintenancePage",
    props: { data: Object, tab: String },
    emits: ["change", "notify"],
    setup(props, { emit }) {
      const keyword = ref("");
      const category = ref("全部分类");
      const status = ref("全部状态");
      const tag = ref("全部标签");
      const channel = ref("全部渠道");
      const platform = ref("全部平台");
      const checked = ref([]);

      const mPlatform = ref("all");
      const mKeyword = ref("");
      const mStatus = ref("unlinked");

      const list = computed(() => {
        const k = keyword.value.trim().toLowerCase();
        return props.data.products.filter((p) => {
          const hitK =
            !k ||
            [p.name, p.spec, p.code].some((t) => String(t || "").toLowerCase().includes(k));
          const hitC = category.value === "全部分类" || p.category === category.value;
          const hitS = status.value === "全部状态" || p.status === status.value;
          const hitT =
            tag.value === "全部标签" ||
            (tag.value === "无标签" ? !p.tags.length : p.tags.includes(tag.value));
          const hitCh = channel.value === "全部渠道" || p.channel.includes(channel.value);
          return hitK && hitC && hitS && hitT && hitCh;
        });
      });

      const allChecked = computed({
        get: () =>
          list.value.length > 0 && list.value.every((p) => checked.value.includes(p.code)),
        set: (on) => {
          const codes = list.value.map((p) => p.code);
          if (on) checked.value = Array.from(new Set(checked.value.concat(codes)));
          else checked.value = checked.value.filter((c) => !codes.includes(c));
        }
      });

      const mapRows = computed(() => {
        if (mStatus.value === "unlinked" || mStatus.value === "excluded") return [];
        let rows = props.data.mapping.rows;
        if (mPlatform.value !== "all") {
          const label = mPlatform.value === "meituan" ? "美团" : "饿了么";
          rows = rows.filter((r) => r.platform === label);
        }
        const k = mKeyword.value.trim().toLowerCase();
        if (k) {
          rows = rows.filter((r) =>
            [r.platformName, r.standardName, r.standardCode, r.standardSpec]
              .join(" ")
              .toLowerCase()
              .includes(k)
          );
        }
        return rows;
      });

      const goTab = (id) => {
        if (id !== props.tab) emit("change", id);
      };

      return {
        keyword, category, status, tag, channel, platform, checked, list, allChecked,
        mPlatform, mKeyword, mStatus, mapRows, goTab
      };
    },
    template: `
      <div class="module-page">
        <header class="module-topbar">
          <div class="module-head-left">
            <h1 class="page-title">{{ data.title }}</h1>
            <svg class="i i-14 info-ic" title="产品资料由共享资料统一维护"><use href="#i-info" /></svg>
            <span class="count-badge">{{ data.badge }}</span>
          </div>
          <button class="bell-btn" title="通知" @click="$emit('notify', '暂无新的通知')">
            <svg class="i"><use href="#i-bell" /></svg>
          </button>
        </header>

        <div class="page-tabs-row">
          <div class="page-tabs">
            <button
              v-for="t in data.tabs" :key="t.id"
              class="page-tab" :class="{ active: tab === t.id }"
              @click="goTab(t.id)">
              {{ t.label }}
            </button>
          </div>
          <div class="tabs-right">
            <select class="f-select w130" @change="$emit('notify', '已切换环比口径（演示）')">
              <option>显示环比数据</option>
              <option>隐藏环比数据</option>
            </select>
            <span class="muted-text">暂无历史数据</span>
          </div>
        </div>

        <!-- 产品信息 -->
        <article class="module-panel" v-if="tab === 'product-info'">
          <div class="p-stats">
            <div class="p-stat" v-for="o in data.overview" :key="o.label">
              <div class="p-stat-label">{{ o.label }}</div>
              <div class="p-stat-value">{{ o.value }}<span class="p-stat-unit">{{ o.unit }}</span></div>
              <div class="p-stat-foot">{{ data.overviewNote }}</div>
            </div>
          </div>

          <div class="toolbar">
            <input class="f-input w200" v-model="keyword" placeholder="搜索产品名 / 规格 / 编号" />
            <select class="f-select" v-model="category">
              <option v-for="c in data.filters.categories" :key="c">{{ c }}</option>
            </select>
            <select class="f-select" v-model="status">
              <option v-for="s in data.filters.statuses" :key="s">{{ s }}</option>
            </select>
            <select class="f-select" v-model="tag">
              <option v-for="t in data.filters.tags" :key="t">{{ t }}</option>
            </select>
            <select class="f-select" v-model="channel">
              <option v-for="c in data.filters.channels" :key="c">{{ c }}</option>
            </select>
            <select class="f-select" v-model="platform">
              <option v-for="p in data.filters.platforms" :key="p">{{ p }}</option>
            </select>
            <span class="toolbar-spacer"></span>
            <button class="btn btn-primary" @click="$emit('notify', '新增产品：演示环境不保存数据')">+ 新增产品</button>
            <button class="btn btn-ghost" @click="$emit('notify', '批量标签（已勾选 ' + checked.length + ' 项）')">批量标签</button>
            <button class="btn btn-ghost" @click="$emit('notify', '批量删除（已勾选 ' + checked.length + ' 项）')">批量删除</button>
            <button class="btn btn-ghost" @click="$emit('notify', '批量修改（已勾选 ' + checked.length + ' 项）')">批量修改</button>
            <button class="btn btn-ghost" @click="$emit('notify', '已下载产品导入模板（演示）')">下载Excel模板</button>
            <button class="btn btn-ghost" @click="$emit('notify', '已打开上传模板同步（演示）')">上传模板同步</button>
            <button class="btn btn-ghost" @click="$emit('notify', '已打开变更记录（演示）')">变更记录</button>
          </div>

          <div class="table-scroll">
            <table class="tbl product-tbl">
              <thead>
                <tr>
                  <th class="col-check"><input type="checkbox" :checked="allChecked" @change="allChecked = $event.target.checked" /></th>
                  <th>产品编号</th>
                  <th>标准名称 / 规格</th>
                  <th>标签</th>
                  <th>销售场域</th>
                  <th>状态</th>
                  <th>分类</th>
                  <th>堂食价</th>
                  <th>外卖A级价</th>
                  <th>包装费</th>
                  <th>上线日期</th>
                  <th>更新时间</th>
                  <th class="col-op">操作</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="p in list" :key="p.code">
                  <td class="col-check"><input type="checkbox" :value="p.code" v-model="checked" /></td>
                  <td>{{ p.code }}</td>
                  <td class="cell-two">
                    <div class="cell-main">{{ p.name }}</div>
                    <div class="cell-sub">{{ p.spec }}</div>
                  </td>
                  <td>
                    <template v-if="p.tags.length">
                      <span class="tag-chip" v-for="t in p.tags" :key="t">{{ t }}</span>
                    </template>
                    <span v-else class="cell-muted">无标签</span>
                  </td>
                  <td class="cell-muted">{{ p.channel }}</td>
                  <td>
                    <span class="status-dot" :class="p.status === '在售' ? 'ok' : (p.status === '售罄' ? 'warn' : 'off')">{{ p.status }}</span>
                  </td>
                  <td>{{ p.category }}</td>
                  <td>¥{{ p.dinein }}</td>
                  <td>¥{{ p.takeout }}</td>
                  <td>¥{{ p.packing }}</td>
                  <td>{{ p.onlineAt }}</td>
                  <td>{{ p.updatedAt }}</td>
                  <td class="col-op">
                    <a class="op-link" @click="$emit('notify', '查看产品详情：' + p.name)">详情</a>
                    <a class="op-link" @click="$emit('notify', '编辑产品：' + p.name)">编辑</a>
                    <a class="op-link danger" @click="$emit('notify', '删除产品：' + p.name)">删除</a>
                  </td>
                </tr>
                <tr v-if="!list.length">
                  <td colspan="13" class="row-empty">没有符合筛选的产品</td>
                </tr>
              </tbody>
            </table>
          </div>

          <div class="panel-foot">
            <span>已展示 {{ list.length }} 个产品 · 勾选 {{ checked.length }} 个</span>
            <span class="foot-note">产品资料与主站同步（演示数据）</span>
          </div>
        </article>

        <!-- 商品映射 -->
        <article class="module-panel" v-else>
          <div class="toolbar">
            <select class="f-select w100" v-model="mPlatform">
              <option v-for="p in data.mapping.platforms" :key="p.id" :value="p.id">{{ p.label }}</option>
            </select>
            <input class="f-input w240" v-model="mKeyword" placeholder="平台商品名称 / 标准产品" />
            <select class="f-select w110" v-model="mStatus">
              <option v-for="s in data.mapping.statuses" :key="s.id" :value="s.id">{{ s.label }}</option>
            </select>
            <button class="btn btn-primary" @click="$emit('notify', '已按条件查询（演示）')">查询</button>
            <button class="btn btn-ghost" @click="mPlatform = 'all'; mKeyword = ''; mStatus = 'unlinked'">重置</button>
            <button class="btn btn-ghost" @click="$emit('notify', '列表已刷新（演示）')">刷新列表</button>
            <button class="btn btn-primary" @click="$emit('notify', '已执行自动关联（演示）')">自动关联</button>
            <button class="btn btn-ghost" @click="$emit('notify', '已下载未映射门店明细（演示）')">未映射门店明细下载</button>
          </div>

          <div class="map-note">
            <div>{{ data.mapping.noteAuto }}</div>
            <div>{{ data.mapping.noteSales }}</div>
          </div>

          <div class="map-stats">
            已关联 {{ data.mapping.stats.linked }} · 未关联 {{ data.mapping.stats.unlinked }} · 已排除 {{ data.mapping.stats.excluded }}
          </div>

          <div class="table-scroll" v-if="mapRows.length">
            <table class="tbl map-tbl">
              <thead>
                <tr>
                  <th>平台</th>
                  <th>平台商品名称</th>
                  <th>累计销量</th>
                  <th>关联状态</th>
                  <th>标准产品名称</th>
                  <th>标准产品编号</th>
                  <th>标准规格</th>
                  <th>关联方式</th>
                  <th class="col-op">操作</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="(r, i) in mapRows" :key="i">
                  <td><span class="plat-chip" :class="r.platform === '美团' ? 'mt' : 'ele'">{{ r.platform }}</span></td>
                  <td class="cell-name">{{ r.platformName }}</td>
                  <td>{{ r.sales }}</td>
                  <td><span class="status-dot ok">{{ r.status }}</span></td>
                  <td>{{ r.standardName }}</td>
                  <td>{{ r.standardCode }}</td>
                  <td>{{ r.standardSpec }}</td>
                  <td class="cell-muted">{{ r.method }}</td>
                  <td class="col-op">
                    <a class="op-link" @click="$emit('notify', '修改关联：' + r.platformName)">修改</a>
                    <a class="op-link" @click="$emit('notify', '取消关联：' + r.platformName)">取消关联</a>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>

          <div class="empty-state" v-else>
            <div class="empty-title">没有符合筛选的商品</div>
            <div class="empty-sub">当前状态下暂无数据，可切换筛选条件查看</div>
          </div>

          <div class="pagination">
            <div class="pagination-left">
              <span>每页 20 条</span>
              <span class="muted-text">|</span>
              <span>共 {{ mapRows.length }} 条</span>
              <span class="muted-text">|</span>
              <span>第 1 页</span>
            </div>
            <div class="pagination-right">
              <button class="page-btn" disabled>上一页</button>
              <button class="page-btn" disabled>下一页</button>
            </div>
          </div>
        </article>
      </div>
    `
  };
})();
