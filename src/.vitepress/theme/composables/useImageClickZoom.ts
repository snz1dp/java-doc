import { onMounted, onUnmounted } from 'vue'

/**
 * 通过事件委托监听文档内容区域内的图片点击事件，
 * 触发图片放大预览回调。
 *
 * 处理 .vp-doc 容器内的 img 元素和 Mermaid SVG 图表。
 *
 * onZoom 回调参数：
 *   - 普通图片：(src, alt)
 *   - Mermaid SVG：('', alt, svgHtml) — svgHtml 为克隆后的 SVG 外层 HTML
 */
export function useImageClickZoom(onZoom: (src: string, alt: string, svgHtml?: string) => void) {
  /**
   * 克隆 SVG 并内联计算样式，确保脱离原 DOM 后样式不丢失。
   * Mermaid SVG 内部通常有 <style> 标签，但部分样式仍来自外部 CSS，
   * 因此遍历所有元素将 computed style 内联到 style 属性。
   */
  function cloneSvgWithInlinedStyles(svg: SVGElement): string {
    const clone = svg.cloneNode(true) as SVGElement
    clone.setAttribute('xmlns', 'http://www.w3.org/2000/svg')

    // 确保克隆的 SVG 有明确尺寸，避免渲染为 0x0
    const rect = svg.getBoundingClientRect()
    if (rect.width > 0 && rect.height > 0) {
      clone.setAttribute('width', String(rect.width))
      clone.setAttribute('height', String(rect.height))
    }

    // 关键 SVG 样式属性列表
    const styleProps = [
      'fill', 'fill-opacity',
      'stroke', 'stroke-width', 'stroke-dasharray', 'stroke-dashoffset',
      'stroke-opacity', 'stroke-linecap', 'stroke-linejoin',
      'font-size', 'font-family', 'font-weight', 'font-style',
      'text-anchor', 'text-decoration',
      'opacity', 'visibility', 'display',
      'background-color', 'color',
      'transform', 'transform-origin'
    ]

    // 遍历原 SVG 及其所有子元素，将计算样式内联到克隆节点
    const originalElements: Element[] = [svg, ...Array.from(svg.querySelectorAll('*'))]
    const clonedElements: Element[] = [clone, ...Array.from(clone.querySelectorAll('*'))]

    for (let i = 0; i < originalElements.length; i++) {
      const computed = window.getComputedStyle(originalElements[i])
      let styleStr = ''
      for (const prop of styleProps) {
        const val = computed.getPropertyValue(prop)
        if (val && val !== 'none' && val !== 'normal' && val !== 'auto') {
          styleStr += `${prop}: ${val}; `
        }
      }
      if (styleStr) {
        (clonedElements[i] as HTMLElement).setAttribute('style', styleStr)
      }
    }

    return new XMLSerializer().serializeToString(clone)
  }

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

      const svgHtml = cloneSvgWithInlinedStyles(svg)
      onZoom('', 'Mermaid 图表', svgHtml)
    }
  }

  onMounted(() => {
    document.addEventListener('click', handleClick)
  })

  onUnmounted(() => {
    document.removeEventListener('click', handleClick)
  })
}
