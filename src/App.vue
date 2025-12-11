<script setup lang="ts">
import { ref, onMounted, defineAsyncComponent } from 'vue'
const MemoryMap = defineAsyncComponent(() => import('./components/MemoryMap.vue'))
const ProgrammingBasics = defineAsyncComponent(() => import('./components/ProgrammingBasics.vue'))

const currentView = ref<'memory' | 'basics' | 'settings'>('memory')
const programmingLanguage = ref<'c' | 'rust'>('c')
const isDark = ref(true)
const isSidebarExpanded = ref(false) // Default collapsed

const toggleTheme = () => {
  isDark.value = !isDark.value
  if (isDark.value) {
    document.documentElement.classList.remove('light-theme')
  } else {
    document.documentElement.classList.add('light-theme')
  }
}

// const toggleSidebar = () => {
//   isSidebarExpanded.value = !isSidebarExpanded.value
// }

onMounted(() => {
  // Check system preference or saved preference could go here
})
</script>

<template>
  <div class="app-layout">
    <!-- Sidebar (Floating/Collapsible) -->
    <aside 
      class="sidebar" 
      :class="{ expanded: isSidebarExpanded }"
      @mouseenter="isSidebarExpanded = true"
      @mouseleave="isSidebarExpanded = false"
    >
      <div class="sidebar-header">
        <div class="logo-container">
          <div class="logo-icon">⚡</div>
          <div class="logo-text" v-show="isSidebarExpanded">STM32</div>
        </div>
      </div>
      
      <nav class="sidebar-nav">
        <button 
          class="nav-item" 
          :class="{ active: currentView === 'memory' }" 
          @click="currentView = 'memory'"
          title="Memory Map"
        >
          <span class="icon">🗺️</span>
          <span class="label" v-show="isSidebarExpanded">Memory Map</span>
        </button>

        <button 
          class="nav-item" 
          :class="{ active: currentView === 'basics' }" 
          @click="currentView = 'basics'"
          title="Programming Basics"
        >
          <span class="icon">📚</span>
          <span class="label" v-show="isSidebarExpanded">Programming Basics</span>
        </button>
        
        <button class="nav-item disabled" title="Interrupts (Coming Soon)">
          <span class="icon">⚡</span>
          <span class="label" v-show="isSidebarExpanded">Interrupts</span>
        </button>
        
        <button class="nav-item disabled" title="Clocks (Coming Soon)">
          <span class="icon">⏱️</span>
          <span class="label" v-show="isSidebarExpanded">Clocks</span>
        </button>
        
        <button class="nav-item disabled" title="GPIO (Coming Soon)">
          <span class="icon">🔌</span>
          <span class="label" v-show="isSidebarExpanded">GPIO</span>
        </button>
      </nav>

      <div class="sidebar-footer">
        <button class="nav-item" @click="currentView = 'settings'" title="Settings">
          <span class="icon">⚙️</span>
          <span class="label" v-show="isSidebarExpanded">Settings</span>
        </button>
      </div>
    </aside>

    <!-- Main Content -->
    <div class="main-content">
      <header class="top-bar">
        <div class="view-controls" v-if="currentView === 'basics'">
          <div class="segmented-control">
            <div class="glider" :style="{ transform: programmingLanguage === 'c' ? 'translateX(0)' : 'translateX(100%)' }"></div>
            <button 
              :class="{ active: programmingLanguage === 'c' }" 
              @click="programmingLanguage = 'c'"
            >C 语言</button>
            <button 
              :class="{ active: programmingLanguage === 'rust' }" 
              @click="programmingLanguage = 'rust'"
            >Rust</button>
          </div>
        </div>
        
        <div class="actions">
          <button class="theme-toggle" @click="toggleTheme" :title="isDark ? 'Switch to Light Mode' : 'Switch to Dark Mode'">
            <span class="theme-icon">{{ isDark ? '☀️' : '🌙' }}</span>
          </button>
        </div>
      </header>

      <main class="content-area">
        <MemoryMap v-if="currentView === 'memory'" />
        <ProgrammingBasics v-else-if="currentView === 'basics'" :language="programmingLanguage" />
        <div v-else class="placeholder-view">
          <h2>Settings</h2>
          <p>Configuration options will appear here.</p>
        </div>
      </main>
    </div>
  </div>
</template>

<style scoped>
.app-layout {
  display: flex;
  height: 100vh;
  width: 100%;
  overflow: hidden;
  background-color: var(--ctp-base);
  color: var(--ctp-text);
}

/* Sidebar */
.sidebar {
  position: fixed;
  top: 16px;
  bottom: 16px;
  left: 16px;
  width: 72px; /* Collapsed width */
  border-radius: 24px;
  z-index: 1000;
  
  /* Glassmorphism */
  background: color-mix(in srgb, var(--ctp-mantle), transparent 20%);
  backdrop-filter: blur(20px);
  -webkit-backdrop-filter: blur(20px);
  border: 1px solid color-mix(in srgb, var(--ctp-text), transparent 90%);
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.2);
  
  display: flex;
  flex-direction: column;
  transition: width 0.4s cubic-bezier(0.25, 0.8, 0.25, 1);
  overflow: hidden;
}

.sidebar.expanded {
  width: 260px;
  background: color-mix(in srgb, var(--ctp-mantle), transparent 10%); /* Less transparent when expanded */
  box-shadow: 0 12px 48px rgba(0, 0, 0, 0.3);
}

.sidebar-header {
  height: 80px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-bottom: 1px solid color-mix(in srgb, var(--ctp-text), transparent 90%);
  overflow: hidden;
  flex-shrink: 0;
}

.sidebar.expanded .sidebar-header {
  justify-content: flex-start;
  padding-left: 24px;
}

.logo-container {
  display: flex;
  align-items: center;
  gap: 16px;
}

.logo-icon {
  font-size: 1.8rem;
  min-width: 24px;
  text-align: center;
  filter: drop-shadow(0 0 8px rgba(137, 180, 250, 0.5));
}

.logo-text {
  font-size: 1.4rem;
  font-weight: 800;
  background: linear-gradient(120deg, var(--ctp-blue), var(--ctp-mauve));
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  white-space: nowrap;
}

.sidebar-nav {
  flex: 1;
  padding: 24px 12px;
  display: flex;
  flex-direction: column;
  gap: 12px;
  overflow-y: auto;
  overflow-x: hidden;
}

.nav-item {
  display: flex;
  align-items: center;
  gap: 16px;
  padding: 12px;
  border-radius: 16px;
  border: none;
  background: transparent;
  color: var(--ctp-subtext0);
  cursor: pointer;
  transition: all 0.3s;
  text-align: left;
  font-size: 1rem;
  width: 100%;
  height: 56px;
  white-space: nowrap;
}

.nav-item .icon {
  font-size: 1.4rem;
  min-width: 24px;
  text-align: center;
  display: flex;
  justify-content: center;
}

.nav-item:hover:not(.disabled) {
  background-color: color-mix(in srgb, var(--ctp-surface0), transparent 50%);
  color: var(--ctp-text);
  transform: translateX(4px);
}

.nav-item.active {
  background-color: color-mix(in srgb, var(--ctp-blue), transparent 80%);
  color: var(--ctp-blue);
  font-weight: 600;
  box-shadow: 0 4px 12px rgba(0,0,0,0.1);
}

.nav-item.disabled {
  opacity: 0.4;
  cursor: not-allowed;
}

.sidebar-footer {
  padding: 20px 12px;
  border-top: 1px solid color-mix(in srgb, var(--ctp-text), transparent 90%);
}

/* Main Content */
.main-content {
  flex: 1;
  min-width: 0; /* Prevent flex item from overflowing */
  display: flex;
  flex-direction: column;
  overflow: hidden;
  position: relative;
  margin-left: 72px; /* 72px sidebar + 16px left + 16px gap */
  margin-right: 16px;
  margin-top: 16px;
  margin-bottom: 16px;
  border-radius: 24px;
  background-color: var(--ctp-base); /* Ensure background is solid */
  box-shadow: 0 0 0 1px var(--ctp-surface0); /* Subtle border */
  height: calc(100vh - 32px);
}

.top-bar {
  height: 72px;
  display: flex;
  align-items: center;
  padding: 0 32px;
  border-bottom: 1px solid var(--ctp-surface0);
  background-color: transparent;
  flex-shrink: 0;
}

.view-controls {
  display: flex;
}

.segmented-control {
  background: var(--ctp-surface0);
  padding: 4px;
  border-radius: 8px;
  display: flex;
  gap: 4px;
  position: relative;
  isolation: isolate;
}

.glider {
  position: absolute;
  top: 4px;
  left: 4px;
  width: calc(50% - 4px);
  height: calc(100% - 8px);
  background: var(--ctp-blue);
  border-radius: 6px;
  transition: transform 0.3s cubic-bezier(0.25, 0.8, 0.25, 1);
  z-index: -1;
  box-shadow: 0 2px 4px rgba(0,0,0,0.1);
}

.segmented-control button {
  background: transparent;
  border: none;
  color: var(--ctp-subtext0);
  padding: 4px 16px;
  border-radius: 6px;
  cursor: pointer;
  font-size: 0.9rem;
  font-weight: 500;
  transition: color 0.2s;
  flex: 1;
  min-width: 80px;
}

.segmented-control button:hover {
  color: var(--ctp-text);
}

.segmented-control button.active {
  background: transparent;
  color: var(--ctp-base);
  box-shadow: none;
}

.actions {
  margin-left: auto;
  display: flex;
  align-items: center;
}

.theme-toggle {
  background: var(--ctp-surface0);
  border: 1px solid var(--ctp-surface1);
  width: 40px;
  height: 40px;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.2s;
  padding: 0;
}

.theme-icon {
  font-size: 1.2rem;
  line-height: 1;
}

.theme-toggle:hover {
  transform: translateY(-1px);
  background-color: var(--ctp-surface1);
  box-shadow: 0 4px 12px rgba(0,0,0,0.1);
}

.content-area {
  flex: 1;
  overflow: hidden; /* MemoryMap handles its own scrolling */
  position: relative;
  padding: 0;
}

.placeholder-view {
  padding: 40px;
  text-align: center;
  color: var(--ctp-subtext0);
}
</style>
