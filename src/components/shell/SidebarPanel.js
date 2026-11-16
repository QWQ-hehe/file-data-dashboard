/* Sidebar panel */
(function () {
  const { ref, computed } = Vue;

  window.SidebarPanel = {
    name: "SidebarPanel",
    props: {
      menus: Array,
      collapsed: Boolean,
      activeMenu: { type: String, default: "workbench" }
    },
    emits: ["toggle", "select"],
    setup() {
      const closed = ref({});
      const isOpen = (id) => closed.value[id] !== true;
      const toggleGroup = (id) => {
        closed.value[id] = isOpen(id);
      };
      return { isOpen, toggleGroup };
    },
    template: `
      <aside class="sidebar" :class="{ collapsed }">
        <div class="brand">
          <div class="brand-logo" :title="collapsed ? '展开侧边栏' : 'XXX'" @click="collapsed && $emit('toggle')">
            <svg class="i"><use href="#i-logo" /></svg>
          </div>
          <div class="brand-name">XXX · 外卖运营看板</div>
          <button class="brand-toggle" title="收起侧边栏" @click="$emit('toggle')">
            <svg class="i i-12"><use href="#i-chev-left" /></svg>
          </button>
        </div>

        <nav class="nav">
          <div v-for="m in menus" :key="m.id">
            <div v-if="m.type === 'item'" class="nav-item" :class="{ active: m.id === activeMenu }" @click="$emit('select', m)">
              <svg class="i nav-icon"><use :href="'#i-' + m.icon" /></svg>
              <span class="nav-label">{{ m.label }}</span>
            </div>

            <template v-else>
              <div class="nav-item group" @click="toggleGroup(m.id)">
                <svg class="i nav-icon"><use :href="'#i-' + m.icon" /></svg>
                <span class="nav-label">{{ m.label }}</span>
                <svg class="i nav-chevron" :class="{ open: isOpen(m.id) }"><use href="#i-chev-down" /></svg>
              </div>
              <div class="nav-sub" v-show="isOpen(m.id)">
                <div class="nav-item" v-for="c in m.children" :key="c.id" :class="{ active: c.id === activeMenu }" @click="$emit('select', c)">
                  <span class="nav-label">{{ c.label }}</span>
                </div>
              </div>
            </template>

            <div v-if="m.divider" class="nav-divider"></div>
          </div>
        </nav>

        <div class="user">
          <div class="avatar" aria-hidden="true">
            <svg viewBox="0 0 32 32">
              <circle cx="16" cy="16" r="16" fill="#ffffff" />
              <ellipse cx="11.6" cy="17.4" rx="2.4" ry="3" fill="#22262e" />
              <ellipse cx="20.4" cy="17.4" rx="2.4" ry="3" fill="#22262e" />
              <path d="M13.4 12.4c1.6-1.3 3.6-1.3 5.2 0" stroke="#22262e" stroke-width="1.2" fill="none" stroke-linecap="round" />
            </svg>
          </div>
          <div class="user-meta">
            <div class="user-name">沈健</div>
            <div class="user-role">个人中心</div>
          </div>
          <svg class="i user-chevron"><use href="#i-chev-down" /></svg>
        </div>
      </aside>
    `
  };

})();
