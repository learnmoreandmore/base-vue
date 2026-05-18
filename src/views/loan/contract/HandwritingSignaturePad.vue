<script setup lang="ts">
import { nextTick, onMounted, ref } from 'vue'

const wrapRef = ref<HTMLElement | null>(null)
const canvasRef = ref<HTMLCanvasElement | null>(null)

let ctx: CanvasRenderingContext2D | null = null
const hasInk = ref(false)

const resizeAndClear = () => {
  const canvas = canvasRef.value
  const wrap = wrapRef.value
  if (!canvas || !wrap) return
  const dpr = window.devicePixelRatio || 1
  const w = wrap.clientWidth
  const h = wrap.clientHeight
  if (w < 2 || h < 2) return
  canvas.width = Math.floor(w * dpr)
  canvas.height = Math.floor(h * dpr)
  canvas.style.width = `${w}px`
  canvas.style.height = `${h}px`
  ctx = canvas.getContext('2d')
  if (!ctx) return
  ctx.setTransform(1, 0, 0, 1, 0, 0)
  ctx.scale(dpr, dpr)
  ctx.fillStyle = '#ffffff'
  ctx.fillRect(0, 0, w, h)
  ctx.strokeStyle = '#1a1a1a'
  ctx.lineWidth = 2.5
  ctx.lineCap = 'round'
  ctx.lineJoin = 'round'
  hasInk.value = false
}

const drawing = ref(false)

const coords = (e: PointerEvent) => {
  const canvas = canvasRef.value!
  const rect = canvas.getBoundingClientRect()
  return { x: e.clientX - rect.left, y: e.clientY - rect.top }
}

const onPointerDown = (e: PointerEvent) => {
  if (!ctx || e.button !== 0) return
  e.preventDefault()
  canvasRef.value?.setPointerCapture(e.pointerId)
  drawing.value = true
  const { x, y } = coords(e)
  ctx.beginPath()
  ctx.moveTo(x, y)
}

const onPointerMove = (e: PointerEvent) => {
  if (!drawing.value || !ctx) return
  e.preventDefault()
  const { x, y } = coords(e)
  ctx.lineTo(x, y)
  ctx.stroke()
  hasInk.value = true
}

const onPointerUp = (e: PointerEvent) => {
  if (!drawing.value) return
  drawing.value = false
  try {
    canvasRef.value?.releasePointerCapture(e.pointerId)
  } catch {
    /* ignore */
  }
}

const clear = () => {
  resizeAndClear()
}

const isEmpty = () => !hasInk.value

const toDataUrl = (type = 'image/png', quality?: number) => canvasRef.value?.toDataURL(type, quality) ?? ''

const relayout = async () => {
  await nextTick()
  await new Promise<void>((resolve) => {
    requestAnimationFrame(() => {
      requestAnimationFrame(() => resolve())
    })
  })
  resizeAndClear()
}

onMounted(() => {
  void relayout()
})

defineExpose({ clear, isEmpty, toDataUrl, relayout })
</script>

<template>
  <div ref="wrapRef" class="sig-pad">
    <canvas
      ref="canvasRef"
      class="sig-pad__canvas"
      @pointerdown="onPointerDown"
      @pointermove="onPointerMove"
      @pointerup="onPointerUp"
      @pointercancel="onPointerUp"
      @pointerleave="onPointerUp"
    />
    <div class="sig-pad__toolbar">
      <el-button size="small" @click="clear">清除</el-button>
    </div>
  </div>
</template>

<style scoped>
.sig-pad {
  position: relative;
  width: 100%;
  height: 160px;
  border: 1px solid #dcdfe6;
  border-radius: 4px;
  background: #fff;
  touch-action: none;
}

.sig-pad__canvas {
  display: block;
  width: 100%;
  height: 100%;
  cursor: crosshair;
}

.sig-pad__toolbar {
  position: absolute;
  right: 8px;
  bottom: 8px;
}
</style>
