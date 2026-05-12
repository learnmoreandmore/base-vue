<script setup lang="ts">
import { computed } from 'vue'

const props = defineProps<{
  /** 展示字符串，可含数字、小数点、百分号等 */
  text: string
}>()

const chars = computed(() => [...props.text])
</script>

<template>
  <div class="flip-board" role="img" :aria-label="`数值 ${text}`" :key="text">
    <span
      v-for="(ch, i) in chars"
      :key="`${i}-${ch}`"
      class="flip-board__cell"
      :class="{ 'flip-board__cell--dim': ch === '.' || ch === '%' || ch === ',' }"
    >
      <span class="flip-board__inner">{{ ch }}</span>
    </span>
  </div>
</template>

<style scoped>
.flip-board {
  display: inline-flex;
  align-items: stretch;
  gap: 4px;
  flex-wrap: nowrap;
}

.flip-board__cell {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-width: 26px;
  height: 36px;
  padding: 0 4px;
  border-radius: 4px;
  background: linear-gradient(180deg, #1c2f44 0%, #0f1a28 45%, #0a121c 100%);
  border: 1px solid rgba(64, 158, 255, 0.35);
  box-shadow:
    inset 0 1px 0 rgba(255, 255, 255, 0.06),
    0 2px 8px rgba(0, 0, 0, 0.35);
  perspective: 120px;
}

.flip-board__cell--dim {
  min-width: 14px;
  font-size: 18px;
  opacity: 0.85;
}

.flip-board__inner {
  font-family: 'DIN Alternate', 'Segoe UI', system-ui, sans-serif;
  font-size: 22px;
  font-weight: 700;
  letter-spacing: 0.02em;
  color: #e8f1ff;
  text-shadow: 0 0 12px rgba(64, 158, 255, 0.35);
  animation: flip-pop 0.45s ease-out;
}

@keyframes flip-pop {
  0% {
    transform: rotateX(-88deg) scale(0.92);
    opacity: 0.35;
  }
  55% {
    transform: rotateX(8deg) scale(1.02);
    opacity: 1;
  }
  100% {
    transform: rotateX(0) scale(1);
    opacity: 1;
  }
}
</style>
