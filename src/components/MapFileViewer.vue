<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'

// Mock data based on the article
const data = {
  code: 14520,
  roData: 420,
  rwData: 128,
  ziData: 4096
}

const isLoaded = ref(false)

onMounted(() => {
  setTimeout(() => {
    isLoaded.value = true
  }, 100)
})

const totalRom = computed(() => data.code + data.roData + data.rwData)
const totalRam = computed(() => data.rwData + data.ziData)

// Percentage calculations for bars
const romPercentages = computed(() => ({
  code: (data.code / totalRom.value) * 100,
  ro: (data.roData / totalRom.value) * 100,
  rw: (data.rwData / totalRom.value) * 100
}))

const ramPercentages = computed(() => ({
  rw: (data.rwData / totalRam.value) * 100,
  zi: (data.ziData / totalRam.value) * 100
}))

const activeSection = ref<string | null>(null)

const toggleSection = (section: string) => {
  activeSection.value = activeSection.value === section ? null : section
}
</script>

<template>
  <div class="map-viewer">
    <!-- Intro Section -->
    <div class="intro-section" :class="{ visible: isLoaded }">
      <h2>🤔 什么是 .map 文件？</h2>
      <p>
        想象一下，你的单片机就是一栋大楼，代码和变量就是里面的住户。
        <strong>.map 文件就是这栋大楼的“户口本”和“平面图”。</strong>
      </p>
      <p>
        它告诉你：
        <span class="highlight">谁住在哪里（地址）</span>、
        <span class="highlight">占了多大房间（大小）</span>、
        <span class="highlight">谁和谁是邻居（内存分布）</span>。
        当程序“爆内存”或者跑飞的时候，看它准没错！
      </p>
    </div>

    <!-- Summary Cards with Beginner Explanations -->
    <div class="section-title" :class="{ visible: isLoaded }">
      <h3>1. 程序到底有多大？ (Program Size)</h3>
      <p class="subtitle">编译完成后，Keil 会告诉你程序由这四部分组成：</p>
    </div>

    <div class="summary-grid">
      <!-- Code -->
      <div class="stat-card code" :class="{ visible: isLoaded }" style="transition-delay: 0ms">
        <div class="stat-icon">💾</div>
        <div class="stat-info">
          <span class="label">Code (代码)</span>
          <span class="value">{{ data.code }} <small>bytes</small></span>
          <div class="beginner-tip">
            <strong>就是你的代码指令</strong><br>
            CPU 要执行的动作都在这。<br>
            <em>(存放在 Flash 硬盘里)</em>
          </div>
        </div>
      </div>
      
      <!-- RO-data -->
      <div class="stat-card ro" :class="{ visible: isLoaded }" style="transition-delay: 100ms">
        <div class="stat-icon">🔒</div>
        <div class="stat-info">
          <span class="label">RO-data (只读)</span>
          <span class="value">{{ data.roData }} <small>bytes</small></span>
          <div class="beginner-tip">
            <strong>常量数据</strong><br>
            比如 <code>const int a = 10;</code><br>
            <em>(存放在 Flash 硬盘里)</em>
          </div>
        </div>
      </div>

      <!-- RW-data -->
      <div class="stat-card rw" :class="{ visible: isLoaded }" style="transition-delay: 200ms">
        <div class="stat-icon">📝</div>
        <div class="stat-info">
          <span class="label">RW-data (读写)</span>
          <span class="value">{{ data.rwData }} <small>bytes</small></span>
          <div class="beginner-tip">
            <strong>带初值的变量</strong><br>
            比如 <code>int count = 1;</code><br>
            <em>(Flash存初值，RAM里修改)</em>
          </div>
        </div>
      </div>

      <!-- ZI-data -->
      <div class="stat-card zi" :class="{ visible: isLoaded }" style="transition-delay: 300ms">
        <div class="stat-icon">⭕</div>
        <div class="stat-info">
          <span class="label">ZI-data (零值)</span>
          <span class="value">{{ data.ziData }} <small>bytes</small></span>
          <div class="beginner-tip">
            <strong>没初值的变量</strong><br>
            比如 <code>int buffer[100];</code><br>
            <em>(只占 RAM 内存，上电清零)</em>
          </div>
        </div>
      </div>
    </div>

    <!-- Memory Visualization -->
    <div class="memory-vis-container" :class="{ visible: isLoaded }">
      <h3>2. 它们住在哪里？ (Memory Map)</h3>
      <p class="subtitle">单片机主要有两块地皮：Flash (掉电不丢) 和 RAM (掉电丢失)。</p>
      
      <div class="memory-layout">
        <!-- FLASH (ROM) -->
        <div class="memory-block rom">
          <div class="block-header">
            <div class="title-group">
              <span class="block-icon">🏠</span>
              <div>
                <span class="block-title">Flash (ROM)</span>
                <span class="block-desc">相当于电脑的“硬盘”</span>
              </div>
            </div>
            <span class="block-size">{{ totalRom }} bytes</span>
          </div>
          <div class="progress-bar">
            <div class="segment code" :style="{ width: isLoaded ? romPercentages.code + '%' : '0%' }"></div>
            <div class="segment ro" :style="{ width: isLoaded ? romPercentages.ro + '%' : '0%' }"></div>
            <div class="segment rw" :style="{ width: isLoaded ? romPercentages.rw + '%' : '0%' }"></div>
          </div>
          <div class="explanation-box">
            <p>🔥 <strong>烧录的就是这里！</strong></p>
            <p>包含了：<span class="dot code"></span>代码 + <span class="dot ro"></span>常量 + <span class="dot rw"></span>变量的初始值</p>
          </div>
        </div>

        <!-- Arrow Animation -->
        <div class="transfer-arrow">
          <div class="arrow-anim">
            <span class="packet">📦</span>
          </div>
          <span class="arrow-label">上电启动时<br>搬运“初始值”</span>
        </div>

        <!-- RAM -->
        <div class="memory-block ram">
          <div class="block-header">
            <div class="title-group">
              <span class="block-icon">⚡</span>
              <div>
                <span class="block-title">SRAM (RAM)</span>
                <span class="block-desc">相当于电脑的“内存”</span>
              </div>
            </div>
            <span class="block-size">{{ totalRam }} bytes</span>
          </div>
          <div class="progress-bar">
            <div class="segment rw" :style="{ width: isLoaded ? ramPercentages.rw + '%' : '0%' }"></div>
            <div class="segment zi" :style="{ width: isLoaded ? ramPercentages.zi + '%' : '0%' }"></div>
          </div>
          <div class="explanation-box">
            <p>🏃 <strong>程序运行时用这里！</strong></p>
            <p>包含了：<span class="dot rw"></span>搬过来的变量 + <span class="dot zi"></span>全空的变量</p>
          </div>
        </div>
      </div>
    </div>

    <!-- Detailed Sections Accordion -->
    <div class="details-section" :class="{ visible: isLoaded }">
      <h3>3. 还能看到什么秘密？</h3>
      
      <div class="details-accordion">
        <div class="accordion-item" :class="{ active: activeSection === 'cross' }">
          <button class="accordion-header" @click="toggleSection('cross')">
            <div class="header-content">
              <span class="icon">🔗</span>
              <span class="title">谁调用了谁？ (Cross References)</span>
            </div>
            <span class="chevron">▼</span>
          </button>
          <div class="accordion-content">
            <div class="content-inner">
              <p class="beginner-text">
                这就像是“人际关系网”。如果你想知道 <code>main</code> 函数里到底用了哪些模块的功能，就看这里。
              </p>
              <div class="code-block">
                <span class="comment">// main.c 里的 System_Init 引用了 bsp.c 里的 BSP_Init</span><br>
                main.o(i.System_Init) refers to bsp.o(i.BSP_Init)
              </div>
            </div>
          </div>
        </div>

        <div class="accordion-item" :class="{ active: activeSection === 'unused' }">
          <button class="accordion-header" @click="toggleSection('unused')">
            <div class="header-content">
              <span class="icon">🗑️</span>
              <span class="title">哪些代码没用到？ (Unused Sections)</span>
            </div>
            <span class="chevron">▼</span>
          </button>
          <div class="accordion-content">
            <div class="content-inner">
              <p class="beginner-text">
                这是被编译器“优化”掉的内容。你写了函数但没在任何地方调用它，编译器为了省空间，就把它删了。
              </p>
              <div class="code-block">
                <span class="comment">// 移除了 stm32f10x_gpio.c 里没用到的 GPIO_DeInit 函数</span><br>
                Removing stm32f10x_gpio.o(i.GPIO_DeInit), (20 bytes)
              </div>
            </div>
          </div>
        </div>

        <div class="accordion-item" :class="{ active: activeSection === 'symbols' }">
          <button class="accordion-header" @click="toggleSection('symbols')">
            <div class="header-content">
              <span class="icon">📍</span>
              <span class="title">变量住在哪个门牌号？ (Symbol Table)</span>
            </div>
            <span class="chevron">▼</span>
          </button>
          <div class="accordion-content">
            <div class="content-inner">
              <p class="beginner-text">
                这是最详细的“住户列表”。每个函数、每个全局变量的具体地址（门牌号）都在这。调试的时候，如果指针指飞了，查这个表能救命！
              </p>
              <div class="table-preview">
                <div class="row header">
                  <span>住户 (Symbol)</span>
                  <span>门牌号 (Addr)</span>
                  <span>房间大小 (Size)</span>
                </div>
                <div class="row">
                  <span>main (主函数)</span>
                  <span>0x08000131</span>
                  <span>48 字节</span>
                </div>
                <div class="row">
                  <span>SystemInit</span>
                  <span>0x08000245</span>
                  <span>84 字节</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.map-viewer {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
  padding-bottom: 2rem;
}

/* Intro Section */
.intro-section {
  background: var(--ctp-surface0);
  border-radius: 12px;
  padding: 1.5rem;
  border-left: 4px solid var(--ctp-blue);
  opacity: 0;
  transform: translateY(20px);
  transition: all 0.5s ease;
}
.intro-section.visible { opacity: 1; transform: translateY(0); }
.intro-section h2 { font-size: 1.3rem; margin-bottom: 0.75rem; color: var(--ctp-text); }
.intro-section p { color: var(--ctp-subtext0); margin-bottom: 0.5rem; line-height: 1.6; }
.highlight { color: var(--ctp-blue); font-weight: 600; }

/* Section Titles */
.section-title { margin: 1rem 0 0.5rem; opacity: 0; transform: translateY(20px); transition: all 0.5s ease 100ms; }
.section-title.visible { opacity: 1; transform: translateY(0); }
.section-title h3 { font-size: 1.2rem; color: var(--ctp-text); margin-bottom: 0.25rem; }
.section-title .subtitle { font-size: 0.9rem; color: var(--ctp-subtext0); }

/* Summary Grid */
.summary-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
  gap: 1rem;
}

.stat-card {
  background: var(--ctp-surface0);
  border: 1px solid var(--ctp-surface1);
  border-radius: 12px;
  padding: 1.25rem;
  display: flex;
  align-items: flex-start;
  gap: 1rem;
  opacity: 0;
  transform: translateY(20px);
  transition: all 0.5s cubic-bezier(0.25, 0.8, 0.25, 1);
}

.stat-card.visible { opacity: 1; transform: translateY(0); }

.stat-icon {
  font-size: 1.8rem;
  min-width: 48px;
  height: 48px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: var(--ctp-surface1);
  border-radius: 10px;
}

.stat-info { display: flex; flex-direction: column; width: 100%; }
.stat-info .label { font-size: 0.85rem; color: var(--ctp-subtext0); font-weight: 600; }
.stat-info .value { font-size: 1.4rem; font-weight: 700; color: var(--ctp-text); line-height: 1.2; margin-bottom: 0.5rem; }
.stat-info .value small { font-size: 0.8rem; font-weight: 400; color: var(--ctp-subtext0); }

.beginner-tip {
  font-size: 0.8rem;
  color: var(--ctp-subtext0);
  background: var(--ctp-base);
  padding: 0.6rem;
  border-radius: 6px;
  line-height: 1.4;
}
.beginner-tip strong { color: var(--ctp-text); display: block; margin-bottom: 2px; }
.beginner-tip em { color: var(--ctp-overlay0); font-style: normal; font-size: 0.75rem; display: block; margin-top: 4px; }

/* Colors */
.code .stat-icon { color: var(--ctp-blue); background: color-mix(in srgb, var(--ctp-blue), transparent 85%); }
.ro .stat-icon { color: var(--ctp-mauve); background: color-mix(in srgb, var(--ctp-mauve), transparent 85%); }
.rw .stat-icon { color: var(--ctp-yellow); background: color-mix(in srgb, var(--ctp-yellow), transparent 85%); }
.zi .stat-icon { color: var(--ctp-green); background: color-mix(in srgb, var(--ctp-green), transparent 85%); }

/* Memory Visualization */
.memory-vis-container {
  background: var(--ctp-surface0);
  border-radius: 16px;
  padding: 1.5rem;
  opacity: 0;
  transform: translateY(20px);
  transition: all 0.5s cubic-bezier(0.25, 0.8, 0.25, 1);
  transition-delay: 400ms;
}
.memory-vis-container.visible { opacity: 1; transform: translateY(0); }
.memory-vis-container h3 { margin-bottom: 0.25rem; font-size: 1.2rem; color: var(--ctp-text); }
.memory-vis-container .subtitle { font-size: 0.9rem; color: var(--ctp-subtext0); margin-bottom: 1.5rem; }

.memory-layout { display: flex; flex-direction: column; gap: 1.5rem; }
@media (min-width: 768px) { .memory-layout { flex-direction: row; align-items: stretch; } }

.memory-block {
  flex: 1;
  background: var(--ctp-base);
  border: 1px solid var(--ctp-surface1);
  border-radius: 12px;
  padding: 1rem;
  display: flex;
  flex-direction: column;
}

.block-header { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 1rem; }
.title-group { display: flex; align-items: center; gap: 0.75rem; }
.block-icon { font-size: 1.5rem; background: var(--ctp-surface1); width: 40px; height: 40px; display: flex; align-items: center; justify-content: center; border-radius: 8px; }
.block-title { font-weight: 600; color: var(--ctp-text); display: block; }
.block-desc { font-size: 0.75rem; color: var(--ctp-subtext0); }
.block-size { font-family: monospace; color: var(--ctp-subtext0); font-size: 0.85rem; }

.progress-bar { height: 24px; background: var(--ctp-surface1); border-radius: 6px; display: flex; overflow: hidden; margin-bottom: 1rem; }
.segment { height: 100%; transition: width 1s cubic-bezier(0.25, 0.8, 0.25, 1); }
.segment.code { background: var(--ctp-blue); }
.segment.ro { background: var(--ctp-mauve); }
.segment.rw { background: var(--ctp-yellow); }
.segment.zi { background: var(--ctp-green); }

.explanation-box { font-size: 0.85rem; color: var(--ctp-subtext0); background: var(--ctp-surface0); padding: 0.75rem; border-radius: 8px; margin-top: auto; }
.explanation-box p { margin: 0.25rem 0; display: flex; align-items: center; gap: 0.5rem; flex-wrap: wrap; }
.dot { width: 8px; height: 8px; border-radius: 50%; display: inline-block; }
.dot.code { background: var(--ctp-blue); }
.dot.ro { background: var(--ctp-mauve); }
.dot.rw { background: var(--ctp-yellow); }
.dot.zi { background: var(--ctp-green); }

/* Arrow Animation */
.transfer-arrow {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  color: var(--ctp-subtext0);
  font-size: 0.8rem;
  gap: 0.25rem;
  min-width: 100px;
  padding: 0 1rem;
}
.arrow-anim { width: 100%; height: 2px; background: var(--ctp-surface2); position: relative; margin-bottom: 0.5rem; }
.packet { position: absolute; top: 50%; left: 0; transform: translate(-50%, -50%); font-size: 1.2rem; animation: movePacket 2s infinite linear; }
@keyframes movePacket { 0% { left: 0; opacity: 0; } 10% { opacity: 1; } 90% { opacity: 1; } 100% { left: 100%; opacity: 0; } }
.arrow-label { text-align: center; font-size: 0.75rem; }

@media (max-width: 767px) {
  .transfer-arrow { transform: rotate(90deg); margin: 2rem 0; }
  .arrow-label { transform: rotate(-90deg); white-space: nowrap; }
}

/* Details Section */
.details-section { opacity: 0; transform: translateY(20px); transition: all 0.5s cubic-bezier(0.25, 0.8, 0.25, 1); transition-delay: 500ms; }
.details-section.visible { opacity: 1; transform: translateY(0); }
.details-section h3 { margin-bottom: 1rem; font-size: 1.2rem; color: var(--ctp-text); }

.details-accordion { display: flex; flex-direction: column; gap: 0.75rem; }
.accordion-item { background: var(--ctp-surface0); border: 1px solid var(--ctp-surface1); border-radius: 12px; overflow: hidden; transition: all 0.3s; }
.accordion-item.active { border-color: var(--ctp-blue); }

.accordion-header {
  width: 100%;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 1rem;
  background: transparent;
  border: none;
  color: var(--ctp-text);
  font-size: 1rem;
  font-weight: 500;
  cursor: pointer;
}
.header-content { display: flex; align-items: center; gap: 0.75rem; }
.accordion-header .icon { font-size: 1.2rem; }
.accordion-header .chevron { font-size: 0.8rem; transition: transform 0.3s; color: var(--ctp-subtext0); }
.accordion-item.active .chevron { transform: rotate(180deg); }

.accordion-content { max-height: 0; overflow: hidden; transition: max-height 0.3s cubic-bezier(0.25, 0.8, 0.25, 1); background: var(--ctp-base); }
.accordion-item.active .accordion-content { max-height: 300px; }
.content-inner { padding: 1rem; }
.beginner-text { margin-bottom: 1rem; line-height: 1.6; color: var(--ctp-subtext0); font-size: 0.9rem; }

.code-block {
  background: var(--ctp-mantle);
  padding: 0.75rem;
  border-radius: 6px;
  font-family: monospace;
  font-size: 0.85rem;
  color: var(--ctp-green);
  border: 1px solid var(--ctp-surface1);
}
.comment { color: var(--ctp-overlay0); display: block; margin-bottom: 0.25rem; }

.table-preview { border: 1px solid var(--ctp-surface1); border-radius: 6px; overflow: hidden; }
.table-preview .row { display: grid; grid-template-columns: 2fr 1.5fr 1fr; padding: 0.5rem; font-size: 0.85rem; border-bottom: 1px solid var(--ctp-surface1); color: var(--ctp-subtext0); }
.table-preview .row:last-child { border-bottom: none; }
.table-preview .header { background: var(--ctp-surface1); font-weight: 600; color: var(--ctp-text); }
</style>
