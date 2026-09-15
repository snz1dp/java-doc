<script setup lang="ts">
import DefaultTheme from 'vitepress/theme'
import ImageLightbox from './components/ImageLightbox.vue'
import { useImageClickZoom } from './composables/useImageClickZoom'
import { ref } from 'vue'

const lightboxRef = ref<InstanceType<typeof ImageLightbox>>()

useImageClickZoom((src, alt) => {
  lightboxRef.value?.open(src, alt)
})
</script>

<template>
  <DefaultTheme.Layout>
    <template #doc-before>
      <slot name="doc-before" />
    </template>
    <template #doc-after>
      <slot name="doc-after" />
    </template>
  </DefaultTheme.Layout>
  <ImageLightbox ref="lightboxRef" />
</template>
