<script setup lang="ts">
import { Close } from '@element-plus/icons-vue'
import { nextTick, ref, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useTabsStore, type TabHistoryItem } from '@/stores/tabs'

const route = useRoute()
const router = useRouter()
const tabsStore = useTabsStore()

const scrollRef = ref<HTMLElement | null>(null)
const dragOverIndex = ref<number | null>(null)
const dragOverAfter = ref(false)
let suppressNavUntil = 0

const go = (tab: TabHistoryItem) => {
  if (Date.now() < suppressNavUntil) {
    return
  }
  if (route.fullPath !== tab.fullPath) {
    void router.push(tab.fullPath)
  }
}

const closeOne = (tab: TabHistoryItem) => {
  tabsStore.closeTab(tab.fullPath)
}

const tabIndex = (fullPath: string) => tabsStore.tabs.findIndex((t) => t.fullPath === fullPath)

const closableOthersCount = (tab: TabHistoryItem) =>
  tabsStore.tabs.filter((t) => t.fullPath !== tab.fullPath && !t.affix).length

const hasRightTabs = (tab: TabHistoryItem) => tabIndex(tab.fullPath) < tabsStore.tabs.length - 1

const onMenuCommand = (cmd: string | number, tab: TabHistoryItem) => {
  const c = String(cmd)
  switch (c) {
    case 'close':
      tabsStore.closeTab(tab.fullPath)
      break
    case 'refresh':
      tabsStore.refreshTab(tab.fullPath)
      break
    case 'closeOthers':
      tabsStore.closeOthers(tab.fullPath)
      break
    case 'closeRight':
      tabsStore.closeRightOf(tab.fullPath)
      break
    default:
      break
  }
}

const onDragStart = (e: DragEvent, index: number, tab: TabHistoryItem) => {
  if (tab.affix) {
    e.preventDefault()
    return
  }
  e.dataTransfer?.setData('text/plain', String(index))
  e.dataTransfer?.setData('application/tab-index', String(index))
  e.dataTransfer!.effectAllowed = 'move'
}

const onDragEnd = () => {
  dragOverIndex.value = null
  dragOverAfter.value = false
  suppressNavUntil = Date.now() + 180
}

const hasTabDragData = (dt: DataTransfer | null) =>
  !!dt && (dt.types.includes('text/plain') || dt.types.includes('application/tab-index'))

const onDragOverTab = (e: DragEvent, index: number) => {
  if (!hasTabDragData(e.dataTransfer)) {
    return
  }
  e.preventDefault()
  e.dataTransfer!.dropEffect = 'move'
  const el = e.currentTarget as HTMLElement
  const rect = el.getBoundingClientRect()
  const after = e.clientX > rect.left + rect.width / 2
  dragOverIndex.value = index
  dragOverAfter.value = after
}

const onDropTab = (e: DragEvent, targetIndex: number) => {
  e.preventDefault()
  const raw = e.dataTransfer?.getData('text/plain') || e.dataTransfer?.getData('application/tab-index')
  const fromIndex = Number.parseInt(raw ?? '', 10)
  if (Number.isNaN(fromIndex)) {
    return
  }
  const el = e.currentTarget as HTMLElement
  const rect = el.getBoundingClientRect()
  const after = e.clientX > rect.left + rect.width / 2
  let insertBefore = after ? targetIndex + 1 : targetIndex
  tabsStore.reorderTabs(fromIndex, insertBefore)
  dragOverIndex.value = null
  dragOverAfter.value = false
}

const onDragOverScroll = (e: DragEvent) => {
  if (hasTabDragData(e.dataTransfer)) {
    e.preventDefault()
    e.dataTransfer!.dropEffect = 'move'
  }
}

const scrollActiveIntoView = () => {
  void nextTick(() => {
    const wrap = scrollRef.value
    if (!wrap) {
      return
    }
    const el = wrap.querySelector<HTMLElement>('.tab-history__tab--active')
    if (!el) {
      return
    }
    const pad = 24
    const elL = el.offsetLeft
    const elR = elL + el.offsetWidth
    const viewL = wrap.scrollLeft
    const viewR = viewL + wrap.clientWidth
    if (elL < viewL + pad) {
      wrap.scrollTo({ left: Math.max(0, elL - pad), behavior: 'smooth' })
    } else if (elR > viewR - pad) {
      wrap.scrollTo({ left: elR - wrap.clientWidth + pad, behavior: 'smooth' })
    }
  })
}

watch(
  () => route.fullPath,
  () => {
    scrollActiveIntoView()
  },
)
</script>

<template>
  <div class="tab-history">
    <div
      ref="scrollRef"
      class="tab-history__scroll"
      @dragover="onDragOverScroll"
    >
      <el-dropdown
        v-for="(tab, index) in tabsStore.tabs"
        :key="tab.fullPath"
        trigger="contextmenu"
        placement="bottom-start"
        @command="(cmd: string | number) => onMenuCommand(cmd, tab)"
      >
        <div
          class="tab-history__tab-wrap"
          :class="{
            'tab-history__tab-wrap--over-before':
              dragOverIndex === index && !dragOverAfter,
            'tab-history__tab-wrap--over-after':
              dragOverIndex === index && dragOverAfter,
          }"
          @dragover="onDragOverTab($event, index)"
          @drop="onDropTab($event, index)"
        >
          <div
            class="tab-history__tab"
            :class="{ 'tab-history__tab--active': route.fullPath === tab.fullPath }"
            role="tab"
            :aria-selected="route.fullPath === tab.fullPath"
            :draggable="!tab.affix"
            @dragstart="onDragStart($event, index, tab)"
            @dragend="onDragEnd"
            @click="go(tab)"
          >
            <span class="tab-history__drag-hint" aria-hidden="true" />
            <span class="tab-history__title">{{ tab.title }}</span>
            <button
              v-if="!tab.affix"
              type="button"
              class="tab-history__close"
              aria-label="关闭标签"
              @click.stop="closeOne(tab)"
            >
              <el-icon :size="14"><Close /></el-icon>
            </button>
          </div>
        </div>
        <template #dropdown>
          <el-dropdown-menu>
            <el-dropdown-item command="close" :disabled="tab.affix"> 关闭当前标签页 </el-dropdown-item>
            <el-dropdown-item command="refresh"> 刷新主内容页面 </el-dropdown-item>
            <el-dropdown-item command="closeOthers" :disabled="closableOthersCount(tab) === 0">
              关闭其他标签页
            </el-dropdown-item>
            <el-dropdown-item command="closeRight" :disabled="!hasRightTabs(tab)">
              关闭右侧标签页
            </el-dropdown-item>
          </el-dropdown-menu>
        </template>
      </el-dropdown>
    </div>
  </div>
</template>

<style scoped>
.tab-history {
  width: 100%;
  min-width: 0;
  border-top: 1px solid var(--el-border-color-lighter);
  background: var(--el-bg-color-page);
}

.tab-history__scroll {
  display: flex;
  flex-wrap: nowrap;
  align-items: stretch;
  gap: 4px;
  padding: 6px 0 8px;
  overflow-x: auto;
  overflow-y: hidden;
  scrollbar-width: thin;
}

.tab-history__scroll::-webkit-scrollbar {
  height: 6px;
}

.tab-history__scroll::-webkit-scrollbar-thumb {
  background: var(--el-border-color);
  border-radius: 3px;
}

.tab-history :deep(.el-dropdown) {
  flex-shrink: 0;
  max-width: 200px;
}

.tab-history__tab-wrap {
  position: relative;
  flex-shrink: 0;
  max-width: 200px;
}

.tab-history__tab-wrap--over-before::before {
  content: '';
  position: absolute;
  left: -3px;
  top: 4px;
  bottom: 4px;
  width: 3px;
  border-radius: 2px;
  background: var(--el-color-primary);
  z-index: 2;
}

.tab-history__tab-wrap--over-after::after {
  content: '';
  position: absolute;
  right: -3px;
  top: 4px;
  bottom: 4px;
  width: 3px;
  border-radius: 2px;
  background: var(--el-color-primary);
  z-index: 2;
}

.tab-history__tab {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  max-width: 200px;
  height: 32px;
  padding: 0 10px;
  border: 1px solid var(--el-border-color);
  border-radius: 6px;
  background: var(--el-fill-color-blank);
  color: var(--el-text-color-regular);
  font-size: 13px;
  line-height: 1.2;
  cursor: grab;
  user-select: none;
  transition:
    background 0.15s,
    border-color 0.15s,
    color 0.15s;
}

.tab-history__tab:active {
  cursor: grabbing;
}

.tab-history__tab[draggable='false'] {
  cursor: pointer;
}

.tab-history__drag-hint {
  width: 3px;
  height: 14px;
  margin-left: -4px;
  margin-right: -2px;
  border-radius: 2px;
  background: var(--el-border-color);
  flex-shrink: 0;
  opacity: 0.55;
}

.tab-history__tab[draggable='false'] .tab-history__drag-hint {
  display: none;
}

.tab-history__tab:hover {
  border-color: var(--el-color-primary-light-5);
  color: var(--el-text-color-primary);
}

.tab-history__tab--active {
  border-color: var(--el-color-primary-light-3);
  background: var(--el-color-primary-light-9);
  color: var(--el-color-primary);
  font-weight: 600;
}

.tab-history__title {
  flex: 1 1 auto;
  min-width: 0;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.tab-history__close {
  flex-shrink: 0;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 22px;
  height: 22px;
  margin: 0 -4px 0 0;
  padding: 0;
  border: none;
  border-radius: 4px;
  background: transparent;
  color: inherit;
  cursor: pointer;
  opacity: 0.65;
}

.tab-history__close:hover {
  opacity: 1;
  background: var(--el-fill-color);
}
</style>
