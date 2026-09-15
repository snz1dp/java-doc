import { onMounted, onUnmounted } from 'vue'

/**
 * 通过事件委托监听文档内容区域内的图片点击事件，
 * 触发图片放大预览回调。
 *
 * 仅处理 .vp-doc 容器内的 img 元素，避免影响 UI 图标等。
 */
export function useImageClickZoom(onZoom: (src: string, alt: string) => void) {
  function handleClick(e: MouseEvent) {
    const target = e.target as HTMLElement
    if (target.tagName !== 'IMG') return

    // 确保是文档内容区域内的图片
    const docContainer = target.closest('.vp-doc')
    if (!docContainer) return

    // 排除 Mermaid SVG（已有独立的 Mermaid 点击预览）
    const mermaidContainer = target.closest('.mermaid')
    if (mermaidContainer) return

    const img = target as HTMLImageElement
    const src = img.currentSrc || img.src
    if (!src) return

    e.preventDefault()
    e.stopPropagation()
    onZoom(src, img.alt || '')
  }

  onMounted(() => {
    document.addEventListener('click', handleClick)
  })

  onUnmounted(() => {
    document.removeEventListener('click', handleClick)
  })
}
