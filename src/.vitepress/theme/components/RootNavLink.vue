<script setup lang="ts">
/**
 * 外部链接导航组件
 *
 * 用于指向站外 URL 的导航菜单项，渲染原生 <a> 标签，
 * 避免 VitePress 的 withBase 自动拼接 base 路径。
 *
 * 支持 title 属性，鼠标悬停时显示提示文字。
 *
 * 通过 nav 的 NavItemComponent 形式使用：
 *   { component: 'RootNavLink', props: { text: '太乙智启', href: 'https://...', title: '通用智能体平台' } }
 */
defineProps<{
  text: string
  href: string
  title?: string
  screenMenu?: boolean
}>()
</script>

<template>
  <a
    class="RootNavLink vp-external-link-icon"
    :class="screenMenu ? 'screen-menu' : 'nav-bar'"
    :href="href"
    :title="title"
    target="_blank"
    rel="noreferrer"
  >
    <span>{{ text }}</span>
  </a>
</template>

<style scoped>
/* 与默认主题 VPNavBarMenuLink 保持一致 */
.RootNavLink.nav-bar {
  display: flex;
  align-items: center;
  padding: 0 12px;
  line-height: var(--vp-nav-height);
  font-size: 14px;
  font-weight: 500;
  color: var(--vp-c-text-1);
  transition: color 0.25s;
}

.RootNavLink.nav-bar:hover {
  color: var(--vp-c-brand-1);
}

/* 与默认主题 VPNavScreenMenuLink 保持一致 */
.RootNavLink.screen-menu {
  display: block;
  padding: 12px 0 11px;
  border-bottom: 1px solid var(--vp-c-divider);
  line-height: 24px;
  font-size: 14px;
  font-weight: 500;
  color: var(--vp-c-text-1);
  transition:
    border-color 0.25s,
    color 0.25s;
}

.RootNavLink.screen-menu:hover {
  color: var(--vp-c-brand-1);
}
</style>
