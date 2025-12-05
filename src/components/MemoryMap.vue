<script setup lang="ts">
import { ref, computed, onMounted, nextTick, watch, onUnmounted } from 'vue'

import { memoryData, type MemoryRegion } from '../data/memoryData'

// 状态管理
const selectedLevel0 = ref<MemoryRegion | null>(null)
const selectedLevel1 = ref<MemoryRegion | null>(null)
const selectedLevel2 = ref<MemoryRegion | null>(null)
const selectedLevel3 = ref<MemoryRegion | null>(null)
const windowWidth = ref(window.innerWidth)
const isTransitioning = ref(false)

// DOM Refs
const level0Refs = ref<Map<string, HTMLElement>>(new Map())
const level1Refs = ref<Map<string, HTMLElement>>(new Map())
const level2Refs = ref<Map<string, HTMLElement>>(new Map())
const level3Refs = ref<Map<string, HTMLElement>>(new Map())
const level1ContainerRef = ref<HTMLElement | null>(null)
const level2ContainerRef = ref<HTMLElement | null>(null)
const level3ContainerRef = ref<HTMLElement | null>(null)
const level4ContainerRef = ref<HTMLElement | null>(null)
const containerRef = ref<HTMLElement | null>(null)

// Connector Paths
// const path0to1 = ref<string>('')
// const path1to2 = ref<string>('')
// const path2to3 = ref<string>('')
// const path3to4 = ref<string>('')

// Direct DOM refs for paths to bypass Vue reactivity overhead during animation
const path0to1Ref = ref<SVGPathElement | null>(null)
const path1to2Ref = ref<SVGPathElement | null>(null)
const path2to3Ref = ref<SVGPathElement | null>(null)
const path3to4Ref = ref<SVGPathElement | null>(null)

// 计算属性
const level1Items = computed(() => selectedLevel0.value?.children || [])
const level2Items = computed(() => selectedLevel1.value?.children || [])
const level3Items = computed(() => selectedLevel2.value?.children || [])

const sortedBitFields = computed(() => {
  if (!selectedLevel3.value?.bitFields) return []
  return [...selectedLevel3.value.bitFields].sort((a, b) => b.endBit - a.endBit)
})

const currentDepth = computed(() => {
  if (selectedLevel3.value) return 4
  if (selectedLevel2.value) {
    // If selectedLevel2 has children (registers), we are at depth 3 (showing list)
    // If it has no children, we are at depth 3 (showing info)
    // But if we select a register (level 3 item), we go to depth 4 (info)
    return 3
  }
  if (selectedLevel1.value) return 2
  if (selectedLevel0.value) return 1
  return 0
})

// Compression Logic
const shouldCompressLevel0 = computed(() => {
  if (currentDepth.value <= 1) return false
  if (currentDepth.value === 2) return windowWidth.value < 1200
  if (currentDepth.value === 3) return windowWidth.value < 1600
  if (currentDepth.value === 4) return windowWidth.value < 1800
  return false
})

const shouldCompressLevel1 = computed(() => {
  if (currentDepth.value <= 2) return false
  if (currentDepth.value === 3) return windowWidth.value < 1300
  if (currentDepth.value === 4) return windowWidth.value < 1500
  return false
})

const shouldCompressLevel2 = computed(() => {
  if (currentDepth.value <= 3) return false
  if (currentDepth.value === 4) return windowWidth.value < 1600
  return false
})

// 处理点击
const selectLevel0 = (item: MemoryRegion) => {
  if (item.type === 'reserved') return
  
  // 如果点击已选中的
  if (selectedLevel0.value?.id === item.id) {
    // 如果当前处于更深层级，则只返回到当前层级（折叠子层级）
    if (currentDepth.value > 1) {
      selectedLevel1.value = null
      selectedLevel2.value = null
      selectedLevel3.value = null
    } else {
      // 否则取消选中
      selectedLevel0.value = null
      selectedLevel1.value = null
      selectedLevel2.value = null
      selectedLevel3.value = null
    }
  } else {
    selectedLevel0.value = item
    selectedLevel1.value = null
    selectedLevel2.value = null
    selectedLevel3.value = null
  }
  
  // 等待 DOM 更新后重绘连接线并滚动
  nextTick(() => {
    // 滚动到视野中心
    const el = level0Refs.value.get(item.id)
    if (el) {
      el.scrollIntoView({ behavior: 'smooth', block: 'center', inline: 'nearest' })
    }
  })
}

const selectLevel1 = (item: MemoryRegion) => {
  if (item.type === 'reserved') return
  
  if (selectedLevel1.value?.id === item.id) {
    if (currentDepth.value > 2) {
      selectedLevel2.value = null
      selectedLevel3.value = null
    } else {
      selectedLevel1.value = null
      selectedLevel2.value = null
      selectedLevel3.value = null
    }
  } else {
    selectedLevel1.value = item
    selectedLevel2.value = null
    selectedLevel3.value = null
  }
  
  nextTick(() => {
    const el = level1Refs.value.get(item.id)
    if (el) {
      el.scrollIntoView({ behavior: 'smooth', block: 'center', inline: 'nearest' })
    }
  })
}

const selectLevel2 = (item: MemoryRegion) => {
  if (selectedLevel2.value?.id === item.id) {
    if (currentDepth.value > 3) {
      selectedLevel3.value = null
    } else {
      selectedLevel2.value = null
      selectedLevel3.value = null
    }
  } else {
    selectedLevel2.value = item
    selectedLevel3.value = null
  }
  
  // Also scroll level 2 items to center
  nextTick(() => {
    const el = level2Refs.value.get(item.id)
    if (el) {
      el.scrollIntoView({ behavior: 'smooth', block: 'center', inline: 'nearest' })
    }
  })
}

const selectLevel3 = (item: MemoryRegion) => {
  if (selectedLevel3.value?.id === item.id) {
    selectedLevel3.value = null
  } else {
    selectedLevel3.value = item
  }
}

const expandLevel = (level: number) => {
  if (level === 0 && currentDepth.value > 1) {
    selectedLevel1.value = null
    selectedLevel2.value = null
    selectedLevel3.value = null
  } else if (level === 1 && currentDepth.value > 2) {
    selectedLevel2.value = null
    selectedLevel3.value = null
  } else if (level === 2 && currentDepth.value > 3) {
    selectedLevel3.value = null
  }
}

// 贝塞尔曲线生成器
const createBezierPath = (startX: number, startY: number, endX: number, endY: number, startHeight: number, endHeight: number) => {
  // 控制点偏移量，决定曲线的弯曲程度
  const controlOffset = Math.abs(endX - startX) * 0.5
  
  // 上边缘曲线
  const topPath = `M ${startX} ${startY} C ${startX + controlOffset} ${startY}, ${endX - controlOffset} ${endY}, ${endX} ${endY}`
  
  // 下边缘曲线 (反向)
  const bottomPath = `L ${endX} ${endY + endHeight} C ${endX - controlOffset} ${endY + endHeight}, ${startX + controlOffset} ${startY + startHeight}, ${startX} ${startY + startHeight} Z`
  
  return topPath + ' ' + bottomPath
}



// 更新连接线
const updateConnectors = () => {
  if (!containerRef.value) return

  const containerRect = containerRef.value.getBoundingClientRect()

  // Helper to update path directly
  const updatePath = (pathRef: SVGPathElement | null, d: string) => {
    if (pathRef) {
      if (d) {
        pathRef.setAttribute('d', d)
        pathRef.style.display = 'block'
      } else {
        pathRef.style.display = 'none'
      }
    }
  }

  // Connector 0 -> 1
  let p0 = ''
  if (selectedLevel0.value && level1ContainerRef.value) {
    const sourceEl = level0Refs.value.get(selectedLevel0.value.id)
    const targetEl = level1ContainerRef.value
    
    if (sourceEl && targetEl) {
      const sourceRect = sourceEl.getBoundingClientRect()
      // Use content rect instead of container rect to avoid including padding
      const targetRect = targetEl.getBoundingClientRect()
      
      // 相对坐标
      const startX = sourceRect.right - containerRect.left
      const startY = sourceRect.top - containerRect.top
      const startH = sourceRect.height
      
      const endX = targetRect.left - containerRect.left
      const endY = targetRect.top - containerRect.top
      const endH = targetRect.height
      
      // 只有当目标可见时才绘制
      if (targetRect.width > 0 && targetRect.height > 0) {
        p0 = createBezierPath(startX, startY, endX, endY, startH, endH)
      }
    }
  }
  updatePath(path0to1Ref.value, p0)

  // Connector 1 -> 2
  let p1 = ''
  if (selectedLevel1.value && level2ContainerRef.value) {
    const sourceEl = level1Refs.value.get(selectedLevel1.value.id)
    const targetEl = level2ContainerRef.value
    
    if (sourceEl && targetEl) {
      const sourceRect = sourceEl.getBoundingClientRect()
      const targetRect = targetEl.getBoundingClientRect()
      
      const startX = sourceRect.right - containerRect.left
      const startY = sourceRect.top - containerRect.top
      const startH = sourceRect.height
      
      const endX = targetRect.left - containerRect.left
      const endY = targetRect.top - containerRect.top
      const endH = targetRect.height
      
      if (targetRect.width > 0 && targetRect.height > 0) {
        p1 = createBezierPath(startX, startY, endX, endY, startH, endH)
      }
    }
  }
  updatePath(path1to2Ref.value, p1)

  // Connector 2 -> 3
  let p2 = ''
  if (selectedLevel2.value && level3ContainerRef.value) {
    const sourceEl = level2Refs.value.get(selectedLevel2.value.id)
    const targetEl = level3ContainerRef.value
    
    if (sourceEl && targetEl) {
      const sourceRect = sourceEl.getBoundingClientRect()
      const targetRect = targetEl.getBoundingClientRect()
      
      const startX = sourceRect.right - containerRect.left
      const startY = sourceRect.top - containerRect.top
      const startH = sourceRect.height
      
      const endX = targetRect.left - containerRect.left
      const endY = targetRect.top - containerRect.top
      const endH = targetRect.height
      
      if (targetRect.width > 0 && targetRect.height > 0) {
        // If level 3 is a list (registers), use full height connector
        // If level 3 is info panel, use fixed height
        const isList = selectedLevel2.value.children && selectedLevel2.value.children.length > 0
        p2 = createBezierPath(startX, startY, endX, endY, startH, isList ? endH : 100)
      }
    }
  }
  updatePath(path2to3Ref.value, p2)

  // Connector 3 -> 4
  let p3 = ''
  if (selectedLevel3.value && level4ContainerRef.value) {
    const sourceEl = level3Refs.value.get(selectedLevel3.value.id)
    const targetEl = level4ContainerRef.value
    
    if (sourceEl && targetEl) {
      const sourceRect = sourceEl.getBoundingClientRect()
      const targetRect = targetEl.getBoundingClientRect()
      
      const startX = sourceRect.right - containerRect.left
      const startY = sourceRect.top - containerRect.top
      const startH = sourceRect.height
      
      const endX = targetRect.left - containerRect.left
      const endY = targetRect.top - containerRect.top
      
      if (targetRect.width > 0 && targetRect.height > 0) {
        p3 = createBezierPath(startX, startY, endX, endY, startH, 100)
      }
    }
  }
  updatePath(path3to4Ref.value, p3)
}

// Ref helpers
const setLevel0Ref = (el: any, id: string) => { if (el) level0Refs.value.set(id, el) }
const setLevel1Ref = (el: any, id: string) => { if (el) level1Refs.value.set(id, el) }
const setLevel2Ref = (el: any, id: string) => { if (el) level2Refs.value.set(id, el) }
const setLevel3Ref = (el: any, id: string) => { if (el) level3Refs.value.set(id, el) }

// 监听窗口大小变化
let resizeObserver: ResizeObserver | null = null
let rafId: number | null = null
let transitionTimeout: any = null

// 优化后的更新调度器，防止在一帧内多次计算
const scheduleUpdate = () => {
  if (rafId !== null) return
  rafId = requestAnimationFrame(() => {
    updateConnectors()
    rafId = null
  })
}

const handleResize = () => {
  windowWidth.value = window.innerWidth
  scheduleUpdate()
}

onMounted(() => {
  updateConnectors()
  
  window.addEventListener('resize', handleResize)
  
  if (containerRef.value) {
    resizeObserver = new ResizeObserver(() => {
      scheduleUpdate()
    })
    resizeObserver.observe(containerRef.value)
  }
  
  // 使用 capture: true 来捕获子元素的滚动
  window.addEventListener('scroll', scheduleUpdate, true)
})

onUnmounted(() => {
  if (resizeObserver) resizeObserver.disconnect()
  window.removeEventListener('resize', handleResize)
  window.removeEventListener('scroll', scheduleUpdate, true)
  
  if (rafId !== null) {
    cancelAnimationFrame(rafId)
    rafId = null
  }
  if (transitionTimeout) {
    clearTimeout(transitionTimeout)
    transitionTimeout = null
  }
})

watch([selectedLevel0, selectedLevel1, selectedLevel2, selectedLevel3], () => {
  // 激进优化：在布局转换期间隐藏连接线，避免每帧重排
  isTransitioning.value = true
  
  if (transitionTimeout) clearTimeout(transitionTimeout)
  
  // 配合 CSS transition: all 0.5s
  transitionTimeout = setTimeout(() => {
    updateConnectors()
    isTransitioning.value = false
    transitionTimeout = null
  }, 550)
})
</script>

<template>
  <div class="visualizer-wrapper" ref="containerRef">
    
    <!-- SVG Layer -->
    <svg class="connector-layer" :class="{ 'faded': isTransitioning }">
      <path ref="path0to1Ref" class="connector-path" />
      <path ref="path1to2Ref" class="connector-path" />
      <path ref="path2to3Ref" class="connector-path" />
      <path ref="path3to4Ref" class="connector-path" />
    </svg>

    <!-- Spacer Left -->
    <div class="layout-spacer" :class="{ collapsed: selectedLevel0 }"></div>

    <!-- Column 1: Level 0 -->
    <div 
      class="column level-0 sticky-column" 
      :class="{ 'compressed': shouldCompressLevel0 }"
      @click="expandLevel(0)"
    >
      <div class="column-header">
        <h3>Global Map</h3>
        <span class="subtitle">4GB Space</span>
      </div>
      <div class="stack-container">
        <div 
          v-for="block in memoryData" 
          :key="block.id"
          :ref="(el) => setLevel0Ref(el, block.id)"
          class="memory-cell"
          :class="[
            block.type, 
            { active: selectedLevel0?.id === block.id },
            { 'dimmed': selectedLevel0 && selectedLevel0.id !== block.id }
          ]"
          @click.stop="selectLevel0(block)"
          :style="{ 
            '--cell-color': block.color,
            '--flex-weight': block.heightWeight || 1
          }"
        >
          <div class="cell-content">
            <div class="cell-main">
              <span class="cell-name">{{ block.name }}</span>
              <span class="cell-desc" v-if="block.description && block.heightWeight && block.heightWeight > 1">{{ block.description }}</span>
            </div>
            <div class="addr-tag top">{{ block.end }}</div>
            <div class="addr-tag bottom">{{ block.start }}</div>
          </div>
        </div>
      </div>
    </div>

    <!-- Column 2: Level 1 -->
    <div 
      class="column level-1 sticky-column" 
      :class="{ visible: selectedLevel0, 'compressed': shouldCompressLevel1 }"
      @click="expandLevel(1)"
    >
      <div class="column-header" v-if="selectedLevel0">
        <h3>{{ selectedLevel0.name }}</h3>
        <span class="subtitle">Sub-regions</span>
      </div>
      <div class="stack-container" v-if="selectedLevel0">
        <div class="content-wrapper" ref="level1ContainerRef">
          <div 
            v-for="region in level1Items" 
            :key="region.id"
            :ref="(el) => setLevel1Ref(el, region.id)"
            class="memory-cell"
            :class="[
              region.type, 
              { active: selectedLevel1?.id === region.id },
              { 'dimmed': selectedLevel1 && selectedLevel1.id !== region.id }
            ]"
            @click.stop="selectLevel1(region)"
            :style="{ 
              '--cell-color': region.color || selectedLevel0.color,
              '--flex-weight': region.heightWeight || 1
            }"
          >
            <div class="cell-content">
              <div class="cell-main">
                <span class="cell-name">{{ region.name }}</span>
                <span class="cell-desc" v-if="region.description && region.heightWeight && region.heightWeight >= 1">{{ region.description }}</span>
              </div>
              <div class="addr-tag top">{{ region.end }}</div>
              <div class="addr-tag bottom">{{ region.start }}</div>
            </div>
          </div>
        </div>
      </div>
      <div v-else class="empty-state">
        <span>Select a block to expand</span>
      </div>
    </div>

    <!-- Column 3: Level 2 -->
    <div class="column level-2" :class="{ visible: selectedLevel1, 'compressed': shouldCompressLevel2 }">
      <div class="column-header" v-if="selectedLevel1">
        <h3>{{ selectedLevel1.name }}</h3>
        <span class="subtitle">Details</span>
      </div>
      <div class="list-container" v-if="selectedLevel1">
        <div class="content-wrapper" ref="level2ContainerRef">
          <div 
            v-for="detail in level2Items" 
            :key="detail.id"
            :ref="(el) => setLevel2Ref(el, detail.id)"
            class="detail-item"
            :class="{ active: selectedLevel2?.id === detail.id }"
            @click="selectLevel2(detail)"
          >
            <div class="detail-info">
              <span class="detail-name">{{ detail.name }}</span>
              <span class="detail-addr">{{ detail.start }}</span>
            </div>
            <div class="detail-bar"></div>
          </div>
        </div>
      </div>
      <div v-else class="empty-state">
        <span>Select a region to view details</span>
      </div>
    </div>

    <!-- Column 4: Level 3 (Registers or Info) -->
    <div class="column level-3" :class="{ visible: selectedLevel2 }">
      <div class="column-header" v-if="selectedLevel2">
        <h3>{{ selectedLevel2.name }}</h3>
        <span class="subtitle">{{ level3Items.length > 0 ? 'Registers' : 'Information' }}</span>
      </div>
      
      <!-- If it has children (Registers), show list -->
      <div class="list-container" v-if="selectedLevel2 && level3Items.length > 0">
        <div class="content-wrapper" ref="level3ContainerRef">
          <div 
            v-for="reg in level3Items" 
            :key="reg.id"
            :ref="(el) => setLevel3Ref(el, reg.id)"
            class="detail-item"
            :class="{ active: selectedLevel3?.id === reg.id }"
            @click="selectLevel3(reg)"
          >
            <div class="detail-info">
              <span class="detail-name">{{ reg.name }}</span>
              <span class="detail-addr">{{ reg.start }}</span>
            </div>
            <div class="detail-bar"></div>
          </div>
        </div>
      </div>

      <!-- If no children, show Info Panel directly -->
      <div class="info-panel" ref="level3ContainerRef" v-else-if="selectedLevel2">
        <div class="info-card">
          <div class="info-header">
            <h4>{{ selectedLevel2.name }}</h4>
            <span class="info-addr">{{ selectedLevel2.start }} - {{ selectedLevel2.end }}</span>
          </div>
          <div class="info-body">
            <p class="info-desc">{{ selectedLevel2.longDescription || selectedLevel2.description || 'No detailed description available.' }}</p>
            
            <div v-if="selectedLevel2.features" class="info-features">
              <h5>Key Features</h5>
              <ul>
                <li v-for="feature in selectedLevel2.features" :key="feature">{{ feature }}</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
      
      <div v-else class="empty-state">
        <span>Select an item to view details</span>
      </div>
    </div>

    <!-- Column 5: Level 4 (Info Panel for Registers) -->
    <div class="column level-4" :class="{ visible: selectedLevel3 }">
      <div class="column-header" v-if="selectedLevel3">
        <h3>{{ selectedLevel3.name }}</h3>
        <span class="subtitle">Register Info</span>
      </div>
      <div class="info-panel" ref="level4ContainerRef" v-if="selectedLevel3">
        <div class="info-card">
          <div class="info-header">
            <div class="header-row">
              <h4>{{ selectedLevel3.name }}</h4>
              <span class="info-addr">{{ selectedLevel3.offset ? 'Offset: ' + selectedLevel3.offset : selectedLevel3.start }}</span>
            </div>
            <div class="reset-value" v-if="selectedLevel3.resetValue">
              Reset value: <code>{{ selectedLevel3.resetValue }}</code>
            </div>
          </div>

          <!-- Bit Visualization -->
          <div v-if="selectedLevel3.bitFields" class="bit-visualizer">
            <div class="bit-scale">
              <span v-for="i in (selectedLevel3.size || 32)" :key="i" class="scale-mark">
                {{ (selectedLevel3.size || 32) - i }}
              </span>
            </div>
            <div class="bit-bar">
              <div 
                v-for="field in sortedBitFields" 
                :key="field.name"
                class="bit-field"
                :class="[field.access, { 'reserved': field.access === 'res' }]"
                :style="{ flex: field.endBit - field.startBit + 1 }"
                :title="field.description"
              >
                <div class="field-content">
                  <span class="field-name">{{ field.name }}</span>
                  <span class="field-access" v-if="field.access !== 'res'">{{ field.access }}</span>
                </div>
              </div>
            </div>
          </div>

          <div class="info-body">
            <p class="info-desc">{{ selectedLevel3.longDescription || selectedLevel3.description }}</p>
            
            <div v-if="selectedLevel3.bitFields" class="fields-list">
              <h5>Bit Fields</h5>
              <div class="fields-grid">
                <div v-for="field in sortedBitFields" :key="field.name" class="field-detail-item" :class="{ 'is-reserved': field.access === 'res' }">
                  <div class="fd-header">
                    <span class="fd-name">{{ field.name }}</span>
                    <span class="fd-range">Bits {{ field.endBit }}:{{ field.startBit }}</span>
                  </div>
                  <div class="fd-meta">
                    <span class="fd-access badge" :class="field.access">{{ field.access }}</span>
                  </div>
                  <p class="fd-desc">{{ field.description }}</p>
                </div>
              </div>
            </div>

            <div v-else-if="selectedLevel3.features" class="info-features">
              <h5>Details</h5>
              <ul>
                <li v-for="feature in selectedLevel3.features" :key="feature">{{ feature }}</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
      <div v-else class="empty-state">
        <span>Select a register</span>
      </div>
    </div>

    <!-- Spacer Right -->
    <div class="layout-spacer" :class="{ collapsed: selectedLevel0 }"></div>

  </div>
</template>

<style scoped>
.visualizer-wrapper {
  width: 100%;
  min-height: 80vh;
  position: relative;
  padding: 20px;
  background-color: var(--ctp-base);
  border-radius: 24px;
  user-select: none;
  overflow-x: auto; /* Allow horizontal scrolling */
  display: flex;
  gap: 20px;
  align-items: flex-start;
}

/* SVG Layer */
.connector-layer {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  pointer-events: none;
  z-index: 0;
  transition: opacity 0.2s ease-in-out;
  will-change: opacity;
}

.connector-layer.faded {
  opacity: 0;
}

.connector-path {
  fill: none; /* No fill for connectors */
  stroke: var(--ctp-surface2);
  stroke-width: 2px;
  stroke-dasharray: 5,5;
  animation: dash 30s linear infinite;
  transition: d 0.4s cubic-bezier(0.25, 0.8, 0.25, 1);
}

@keyframes dash {
  to { stroke-dashoffset: 1000; }
}

/* Columns */
.column {
  flex: 1 1 300px;
  min-width: 280px;
  max-width: 500px;
  display: flex;
  flex-direction: column;
  z-index: 1;
  transition: all 0.5s cubic-bezier(0.25, 0.8, 0.25, 1);
  opacity: 0.4;
  transform: translateY(20px) scale(0.98);
  will-change: flex-grow, width, opacity, transform; /* Optimize for animation */
}

.column.level-3 {
  flex: 1.2 1 320px;
  min-width: 300px;
  max-width: 600px;
}

.column.level-4 {
  flex: 2 1 400px;
  min-width: 350px;
  max-width: 1200px;
}

/* Hide inactive columns to save space */
.column:not(.visible):not(.level-0) {
  flex: 0 0 0;
  width: 0 !important;
  min-width: 0 !important;
  padding: 0 !important;
  margin: 0 !important;
  opacity: 0;
  pointer-events: none;
  border: none;
}

.column.sticky-column {
  position: sticky;
  left: 0;
  height: calc(100vh - 80px);
  overflow-y: auto;
  scrollbar-width: none;
  contain: layout; /* 优化：限制布局计算范围 */
}

.column.level-0 {
  opacity: 1;
  transform: none;
}

.column.visible {
  opacity: 1;
  transform: none;
}

/* Compressed State */
.column.compressed {
  flex: 0 0 60px;
  width: 60px;
  min-width: 60px;
  max-width: 60px;
  opacity: 0.8;
  cursor: pointer;
  overflow: hidden;
}

.column.compressed:hover {
  opacity: 1;
  background-color: rgba(255,255,255,0.05);
  border-radius: 16px;
}

.column.compressed .column-header h3,
.column.compressed .column-header .subtitle,
.column.compressed .cell-content,
.column.compressed .addr-tag {
  opacity: 0;
  pointer-events: none;
  display: none; /* Hide content to save layout */
}

.column.compressed .column-header {
  height: 40px;
  position: relative;
}

.column.compressed .column-header::after {
  content: '...';
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  color: var(--ctp-subtext0);
  font-size: 20px;
}

.column.compressed .memory-cell {
  border-radius: 4px;
  margin: 0 10px; /* Narrower bars */
}

.column-header {
  margin-bottom: 1.5rem;
  text-align: center;
  flex-shrink: 0;
  transition: opacity 0.3s;
}

.column-header h3 {
  margin: 0;
  color: var(--ctp-text);
  font-size: 1.2rem;
  white-space: nowrap;
}

.column-header .subtitle {
  font-size: 0.85rem;
  color: var(--ctp-subtext0);
  text-transform: uppercase;
  letter-spacing: 1px;
}

/* Stack Container (Memory Bars) */
.stack-container {
  flex: 1;
  display: flex;
  flex-direction: column-reverse; /* Bottom to Top */
  border-radius: 16px;
  padding: 8px;
  /* Add padding to allow scrolling elements to center */
  padding-bottom: 50vh;
  padding-top: 0;
  gap: 8px;
  overflow: visible;
}

.stack-container .content-wrapper {
  display: flex;
  flex-direction: column-reverse;
  gap: 8px;
  width: 100%;
  flex: 1; /* Ensure wrapper fills the container so children can flex-grow */
}

/* Memory Cell */
.memory-cell {
  position: relative;
  flex-grow: var(--flex-weight);
  min-height: 50px;
  background-color: var(--ctp-surface0); /* Use theme variable */
  border-radius: 12px;
  cursor: pointer;
  transition: transform 0.3s ease, background-color 0.3s;
  border: 1px solid var(--ctp-surface1); /* Use theme variable */
  overflow: visible;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  will-change: transform;
}

.memory-cell:hover {
  transform: scale(1.02) translateX(2px);
  z-index: 10;
  background-color: var(--ctp-surface1); /* Use theme variable */
  border-color: var(--ctp-surface2);
}

.memory-cell.active {
  background-color: var(--cell-color) !important;
  color: var(--ctp-base);
  /* box-shadow: 0 0 20px var(--cell-color); Removed glow */
  z-index: 20;
  border-color: rgba(255,255,255,0.3);
  transform: scale(1.02) translateX(5px);
}

.memory-cell.dimmed {
  opacity: 0.5;
  filter: grayscale(0.6); /* Reduced filter */
  transform: scale(0.98);
}

.memory-cell.reserved {
  background: repeating-linear-gradient(
    45deg,
    rgba(17, 17, 27, 0.5),
    rgba(17, 17, 27, 0.5) 10px,
    rgba(24, 24, 37, 0.5) 10px,
    rgba(24, 24, 37, 0.5) 20px
  );
  border: 1px dashed var(--ctp-surface1);
  cursor: default;
}

/* Cell Content */
.cell-content {
  height: 100%;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  padding: 0.5rem;
  padding-bottom: 1.2rem; /* Push content up slightly */
  position: relative;
  transition: opacity 0.2s;
}

.cell-main {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 4px;
}

.cell-name {
  font-weight: 700;
  font-size: 0.95rem;
  text-align: center;
  line-height: 1.2;
}

.cell-desc {
  font-size: 0.75rem;
  opacity: 0.8;
  text-align: center;
  max-width: 100%;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

/* Address Tags */
.addr-tag {
  position: absolute;
  font-family: 'JetBrains Mono', monospace;
  font-size: 0.85rem;
  font-weight: 600;
  background-color: var(--ctp-surface0);
  color: var(--ctp-text);
  padding: 4px 8px;
  border-radius: 6px;
  opacity: 0;
  transition: opacity 0.2s;
  pointer-events: none;
  white-space: nowrap;
  z-index: 5;
  box-shadow: 0 4px 8px rgba(0,0,0,0.3);
  border: 1px solid var(--ctp-surface1);
}

.memory-cell:hover .addr-tag,
.memory-cell.active .addr-tag {
  opacity: 1;
}

.addr-tag.top {
  top: 2px;
  right: 4px;
}

.addr-tag.bottom {
  bottom: 6px;
  right: 4px;
}

/* List Container (Level 2) */
.list-container {
  padding-right: 8px;
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.list-container .content-wrapper {
  display: flex;
  flex-direction: column;
  gap: 8px;
  width: 100%;
}

.detail-item {
  background-color: var(--ctp-surface0);
  padding: 12px 16px;
  border-radius: 8px;
  cursor: pointer;
  display: flex;
  justify-content: space-between;
  align-items: center;
  transition: transform 0.2s, background-color 0.2s;
  border-left: 4px solid transparent;
}

.detail-item:hover {
  background-color: var(--ctp-surface1);
  transform: translateX(4px);
}

.detail-item.active {
  background-color: var(--ctp-surface1);
  border-left-color: var(--ctp-blue);
}

.detail-info {
  display: flex;
  flex-direction: column;
}

.detail-name {
  font-weight: 600;
  color: var(--ctp-text);
}

.detail-addr {
  font-family: monospace;
  font-size: 0.8rem;
  color: var(--ctp-subtext0);
}

/* Info Panel (Level 3) */
.info-panel {
  flex: 1;
}

.info-card {
  background-color: var(--ctp-surface0);
  border-radius: 16px;
  padding: 24px;
  box-shadow: 0 8px 24px rgba(0,0,0,0.2);
  border: 1px solid var(--ctp-surface1);
}

.info-header {
  border-bottom: 1px solid var(--ctp-surface1);
  padding-bottom: 16px;
  margin-bottom: 16px;
}

.info-header h4 {
  margin: 0 0 8px 0;
  font-size: 1.4rem;
  color: var(--ctp-blue);
}

.info-addr {
  font-family: 'JetBrains Mono', monospace;
  font-size: 0.9rem;
  color: var(--ctp-subtext0);
  background: var(--ctp-mantle);
  padding: 4px 8px;
  border-radius: 4px;
}

.info-body {
  color: var(--ctp-text);
}

/* Bit Visualizer */
.bit-visualizer {
  margin-bottom: 24px;
  background: var(--ctp-mantle);
  padding: 16px;
  border-radius: 12px;
  border: 1px solid var(--ctp-surface1);
  overflow-x: auto;
}

.bit-scale {
  display: flex;
  margin-bottom: 4px;
  font-family: 'JetBrains Mono', monospace;
  font-size: 0.7rem;
  color: var(--ctp-subtext0);
}

.scale-mark {
  flex: 1;
  text-align: center;
  border-left: 1px solid var(--ctp-surface1);
}

.scale-mark:last-child {
  border-right: 1px solid var(--ctp-surface1);
}

.bit-bar {
  display: flex;
  height: 48px;
  border: 1px solid var(--ctp-surface2);
  border-radius: 4px;
  overflow: hidden;
}

.bit-field {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  border-right: 1px solid rgba(0,0,0,0.2);
  background-color: var(--ctp-surface0);
  font-size: 0.75rem;
  overflow: hidden;
  transition: all 0.2s;
  cursor: help;
  min-width: 0; /* Allow shrinking */
}

.bit-field:last-child {
  border-right: none;
}

.bit-field:hover {
  filter: brightness(1.1);
}

.bit-field.rw { background-color: color-mix(in srgb, var(--ctp-blue), transparent 80%); color: var(--ctp-blue); }
.bit-field.r { background-color: color-mix(in srgb, var(--ctp-green), transparent 80%); color: var(--ctp-green); }
.bit-field.w { background-color: color-mix(in srgb, var(--ctp-red), transparent 80%); color: var(--ctp-red); }
.bit-field.reserved { background-color: var(--ctp-surface0); opacity: 0.5; background-image: repeating-linear-gradient(45deg, transparent, transparent 5px, rgba(0,0,0,0.1) 5px, rgba(0,0,0,0.1) 10px); }

.field-content {
  display: flex;
  flex-direction: column;
  align-items: center;
  width: 100%;
  padding: 0 2px;
}

.field-name {
  font-weight: 700;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  max-width: 100%;
}

.field-access {
  font-size: 0.65rem;
  text-transform: uppercase;
  opacity: 0.8;
}

/* Fields List */
.fields-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
  gap: 12px;
  margin-top: 16px;
}

.field-detail-item {
  background: var(--ctp-surface0);
  padding: 12px;
  border-radius: 8px;
  border: 1px solid var(--ctp-surface1);
}

.field-detail-item.is-reserved {
  opacity: 0.5;
}

.fd-header {
  display: flex;
  justify-content: space-between;
  align-items: baseline;
  margin-bottom: 8px;
}

.fd-name {
  font-weight: 700;
  color: var(--ctp-text);
}

.fd-range {
  font-family: monospace;
  font-size: 0.8rem;
  color: var(--ctp-subtext0);
}

.fd-meta {
  margin-bottom: 8px;
}

.badge {
  font-size: 0.7rem;
  padding: 2px 6px;
  border-radius: 4px;
  text-transform: uppercase;
  font-weight: 600;
}

.badge.rw { background: color-mix(in srgb, var(--ctp-blue), transparent 80%); color: var(--ctp-blue); }
.badge.r { background: color-mix(in srgb, var(--ctp-green), transparent 80%); color: var(--ctp-green); }
.badge.res { background: var(--ctp-surface1); color: var(--ctp-subtext0); }

.fd-desc {
  font-size: 0.85rem;
  color: var(--ctp-subtext0);
  margin: 0;
  line-height: 1.4;
}

.header-row {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
}

.reset-value {
  font-family: 'JetBrains Mono', monospace;
  font-size: 0.9rem;
  color: var(--ctp-subtext0);
}

.reset-value code {
  background: var(--ctp-surface1);
  padding: 2px 6px;
  border-radius: 4px;
  color: var(--ctp-text);
}

.info-desc {
  line-height: 1.6;
  margin-bottom: 24px;
}

.info-features h5 {
  margin: 0 0 12px 0;
  color: var(--ctp-subtext1);
  text-transform: uppercase;
  font-size: 0.85rem;
  letter-spacing: 1px;
}

.info-features ul {
  margin: 0;
  padding-left: 20px;
}

.info-features li {
  margin-bottom: 8px;
  color: var(--ctp-subtext0);
}

.empty-state {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--ctp-overlay0);
  font-style: italic;
  border: 2px dashed var(--ctp-surface0);
  border-radius: 16px;
  min-height: 200px;
}

/* Layout Spacers for Centering */
.layout-spacer {
  flex-grow: 1;
  flex-shrink: 1;
  flex-basis: 0%;
  transition: flex-grow 0.5s cubic-bezier(0.25, 0.8, 0.25, 1);
  min-width: 0;
}

.layout-spacer.collapsed {
  flex-grow: 0.00001; /* Effectively 0 but keeps it in layout calculation if needed, though 0 is usually fine */
  flex-basis: 0;
}
</style>
