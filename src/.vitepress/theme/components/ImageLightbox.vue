<template>
  <Teleport to="body">
    <Transition name="image-lightbox">
      <div v-if="visible" class="image-lightbox-overlay" @click.self="close" @wheel.prevent="onWheel">
        <!-- 工具栏 -->
        <div class="image-lightbox-toolbar">
          <button class="ilb-btn" title="放大" @click="zoomIn">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/><line x1="11" y1="8" x2="11" y2="14"/><line x1="8" y1="11" x2="14" y2="11"/></svg>
          </button>
          <button class="ilb-btn" title="缩小" @click="zoomOut">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/><line x1="8" y1="11" x2="14" y2="11"/></svg>
          </button>
          <button class="ilb-btn" title="重置" @click="resetZoom">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8"/><path d="M3 3v5h5"/></svg>
          </button>
          <span class="ilb-zoom-label">{{ Math.round(scale * 100) }}%</span>
          <button class="ilb-btn ilb-close" title="关闭 (Esc)" @click="close">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
          </button>
        </div>

        <!-- 图片容器 -->
        <div
          class="image-lightbox-content"
          :style="{ transform: `translate(${pan.x}px, ${pan.y}px) scale(${scale})` }"
          @mousedown.prevent="startDrag"
        >
          <img v-if="imageUrl" :src="imageUrl" :alt="imageAlt" draggable="false" />
          <!-- Mermaid SVG 直接内嵌渲染，保留内部样式 -->
          <div v-else-if="svgHtml" class="image-lightbox-svg" v-html="svgHtml"></div>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted, nextTick } from 'vue'

const visible = ref(false)
const imageUrl = ref('')
const imageAlt = ref('')
const svgHtml = ref('')
const scale = ref(1)
const pan = ref({ x: 0, y: 0 })

const MIN_SCALE = 0.2
const MAX_SCALE = 5
const ZOOM_STEP = 0.15

let isDragging = false
let dragStart = { x: 0, y: 0 }
let panStart = { x: 0, y: 0 }

function open(src: string, alt: string, svg?: string) {
  imageUrl.value = src
  imageAlt.value = alt
  svgHtml.value = svg || ''
  scale.value = 1
  pan.value = { x: 0, y: 0 }
  visible.value = true

  nextTick(() => {
    document.body.style.overflow = 'hidden'
  })
}

function close() {
  visible.value = false
  imageUrl.value = ''
  svgHtml.value = ''
  document.body.style.overflow = ''
}

function zoomIn() {
  scale.value = Math.min(scale.value + ZOOM_STEP, MAX_SCALE)
}

function zoomOut() {
  scale.value = Math.max(scale.value - ZOOM_STEP, MIN_SCALE)
}

function resetZoom() {
  scale.value = 1
  pan.value = { x: 0, y: 0 }
}

function onWheel(e: WheelEvent) {
  const delta = e.deltaY > 0 ? -ZOOM_STEP : ZOOM_STEP
  scale.value = Math.min(Math.max(scale.value + delta, MIN_SCALE), MAX_SCALE)
}

function startDrag(e: MouseEvent) {
  isDragging = true
  dragStart = { x: e.clientX, y: e.clientY }
  panStart = { ...pan.value }
  document.addEventListener('mousemove', onDrag)
  document.addEventListener('mouseup', stopDrag)
}

function onDrag(e: MouseEvent) {
  if (!isDragging) return
  pan.value = {
    x: panStart.x + (e.clientX - dragStart.x),
    y: panStart.y + (e.clientY - dragStart.y)
  }
}

function stopDrag() {
  isDragging = false
  document.removeEventListener('mousemove', onDrag)
  document.removeEventListener('mouseup', stopDrag)
}

function onKeydown(e: KeyboardEvent) {
  if (!visible.value) return
  if (e.key === 'Escape') close()
  if (e.key === '+' || e.key === '=') zoomIn()
  if (e.key === '-') zoomOut()
  if (e.key === '0') resetZoom()
}

onMounted(() => {
  document.addEventListener('keydown', onKeydown)
})

onUnmounted(() => {
  document.removeEventListener('keydown', onKeydown)
  document.removeEventListener('mousemove', onDrag)
  document.removeEventListener('mouseup', stopDrag)
})

defineExpose({ open, close })
</script>

<style scoped>
.image-lightbox-overlay {
  position: fixed;
  inset: 0;
  z-index: 9999;
  background: rgba(0, 0, 0, 0.75);
  display: flex;
  align-items: center;
  justify-content: center;
  backdrop-filter: blur(4px);
}

.image-lightbox-toolbar {
  position: absolute;
  top: 16px;
  left: 50%;
  transform: translateX(-50%);
  display: flex;
  align-items: center;
  gap: 6px;
  background: rgba(30, 30, 30, 0.85);
  border-radius: 8px;
  padding: 6px 12px;
  z-index: 10;
}

.ilb-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 32px;
  height: 32px;
  border: none;
  border-radius: 6px;
  background: transparent;
  color: #e0e0e0;
  cursor: pointer;
  transition: background 0.15s;
}

.ilb-btn:hover {
  background: rgba(255, 255, 255, 0.15);
}

.ilb-close {
  margin-left: 8px;
}

.ilb-zoom-label {
  color: #a0a0a0;
  font-size: 12px;
  min-width: 42px;
  text-align: center;
  user-select: none;
}

.image-lightbox-content {
  cursor: grab;
  transition: transform 0.1s ease-out;
  max-width: 90vw;
  max-height: 85vh;
  display: flex;
  align-items: center;
  justify-content: center;
}

.image-lightbox-content:active {
  cursor: grabbing;
}

.image-lightbox-content img {
  max-width: 90vw;
  max-height: 85vh;
  object-fit: contain;
  border-radius: 4px;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.4);
}

/* Mermaid SVG 内嵌渲染样式 */
.image-lightbox-svg {
  max-width: 90vw;
  max-height: 85vh;
  display: flex;
  align-items: center;
  justify-content: center;
}

.image-lightbox-svg svg {
  max-width: 90vw;
  max-height: 85vh;
  width: auto;
  height: auto;
  background: #fff;
  border-radius: 4px;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.4);
}

/* 过渡动画 */
.image-lightbox-enter-active,
.image-lightbox-leave-active {
  transition: opacity 0.2s ease;
}

.image-lightbox-enter-from,
.image-lightbox-leave-to {
  opacity: 0;
}
</style>
