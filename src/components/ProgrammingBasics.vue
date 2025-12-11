<script setup lang="ts">
import { ref, watch, defineAsyncComponent } from 'vue'
// @ts-ignore
import mapIntroContent from '../data/map_intro.md?raw'

const MapFileViewer = defineAsyncComponent(() => import('./MapFileViewer.vue'))
const MarkdownViewer = defineAsyncComponent(() => import('./MarkdownViewer.vue'))

const props = defineProps<{
  language: 'c' | 'rust'
}>()

const transitionName = ref('slide-left')
const currentTab = ref<'visualizer' | 'doc'>('visualizer')

watch(() => props.language, (newVal, oldVal) => {
  if (newVal === 'rust' && oldVal === 'c') {
    transitionName.value = 'slide-left'
  } else {
    transitionName.value = 'slide-right'
  }
})
</script>

<template>
  <div class="programming-basics">
    <Transition :name="transitionName" mode="out-in">
      <!-- C Language Content -->
      <div v-if="language === 'c'" class="content-container" key="c">
        <div class="control-bar">
          <button 
            class="nav-btn" 
            :class="{ active: currentTab === 'visualizer' }"
            @click="currentTab = 'visualizer'"
          >
            <span class="icon">📊</span> 可视化解析
          </button>
          <button 
            class="nav-btn" 
            :class="{ active: currentTab === 'doc' }"
            @click="currentTab = 'doc'"
          >
            <span class="icon">📄</span> 详细文档
          </button>
        </div>
        
        <Transition name="fade-up" mode="out-in">
          <MapFileViewer v-if="currentTab === 'visualizer'" />
          <div v-else-if="currentTab === 'doc'" class="doc-container">
            <MarkdownViewer :content="mapIntroContent" />
          </div>
        </Transition>
      </div>

      <!-- Rust Content -->
      <div v-else-if="language === 'rust'" class="content-container" key="rust">
        <div class="placeholder">
          <p>Rust 内容开发中...</p>
        </div>
      </div>
    </Transition>
  </div>
</template>

<style scoped>
.programming-basics {
  padding: 2rem;
  height: 100%;
  overflow-y: auto;
  color: var(--ctp-text);
  overflow-x: hidden; /* Prevent scrollbar during transition */
}

/* Transitions */
.slide-left-enter-active,
.slide-left-leave-active,
.slide-right-enter-active,
.slide-right-leave-active {
  transition: all 0.3s cubic-bezier(0.25, 0.8, 0.25, 1);
}

.slide-left-enter-from {
  transform: translateX(30px);
  opacity: 0;
}
.slide-left-leave-to {
  transform: translateX(-30px);
  opacity: 0;
}

.slide-right-enter-from {
  transform: translateX(-30px);
  opacity: 0;
}
.slide-right-leave-to {
  transform: translateX(30px);
  opacity: 0;
}

.fade-up-enter-active,
.fade-up-leave-active {
  transition: all 0.4s cubic-bezier(0.25, 0.8, 0.25, 1);
}

.fade-up-enter-from {
  opacity: 0;
  transform: translateY(20px);
}
.fade-up-leave-to {
  opacity: 0;
  transform: translateY(-20px);
}

.control-bar {
  display: flex;
  gap: 1rem;
  margin-bottom: 2rem;
  background: var(--ctp-surface0);
  padding: 4px;
  border-radius: 8px;
  width: fit-content;
}

.nav-btn {
  background: transparent;
  border: none;
  color: var(--ctp-subtext0);
  padding: 6px 16px;
  border-radius: 6px;
  cursor: pointer;
  font-size: 0.9rem;
  font-weight: 500;
  transition: all 0.2s;
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.nav-btn .icon {
  font-size: 1.1em;
}

.nav-btn:hover {
  color: var(--ctp-text);
  background: var(--ctp-surface1);
}

.nav-btn.active {
  background: var(--ctp-blue);
  color: var(--ctp-base);
  box-shadow: 0 2px 4px rgba(0,0,0,0.1);
}

.doc-container {
  background: var(--ctp-surface0);
  padding: 2rem;
  border-radius: 12px;
  border: 1px solid var(--ctp-surface1);
  max-width: 800px;
  margin: 0 auto;
}

.placeholder {
  display: flex;
  justify-content: center;
  align-items: center;
  height: 200px;
  color: var(--ctp-subtext0);
}
</style>
