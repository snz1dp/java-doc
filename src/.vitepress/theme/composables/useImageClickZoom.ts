import { onMounted, onUnmounted } from 'vue'

/**
 * 通过事件委托监听文档内容区域内的图片点击事件，
 * 触发图片放大预览回调。
 *
 * 处理 .vp-doc 容器内的 img 元素和 Mermaid SVG 图表。
 */
export function useImageClickZoom(onZoom: (src: string, alt: string) => void) {
  function handleClick(e: MouseEvent) {
    const target = e.target as HTMLElement

    // 确保是文档内容区域内的
    const docContainer = target.closest('.vp-doc')
    if (!docContainer) return

    // 处理普通图片
    if (target.tagName === 'IMG') {
      const img = target as HTMLImageElement
      const src = img.currentSrc || img.src
      if (!src) return

      e.preventDefault()
      e.stopPropagation()
      onZoom(src, img.alt || '')
      return
    }

    // 处理 Mermaid SVG 图表
    const mermaidContainer = target.closest('.mermaid')
    if (mermaidContainer) {
      const svg = mermaidContainer.querySelector('svg')
      if (!svg) return

      e.preventDefault()
      e.stopPropagation()

      // 克隆 SVG 并序列化为 data URL
      const clone = svg.cloneNode(true) as SVGElement
      clone.setAttribute('xmlns', 'http://www.w3.org/2000/svg')
      const svgData = new XMLSerializer().serializeToString(clone)
      const dataUrl = 'data:image/svg+xml;charset=utf-8,' + encodeURIComponent(svgData)

      onZoom(dataUrl, 'Mermaid 图表')
    }
  }

  onMounted(() => {
    document.addEventListener('click', handleClick)
  })

  onUnmounted(() => {
    document.removeEventListener('click', handleClick)
  })
}
