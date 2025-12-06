<script setup lang="ts">
import { ref } from 'vue'

const title = ref('编程基础')
</script>

<template>
  <div class="programming-basics">
    <div class="header">
      <h1>{{ title }}</h1>
      <p class="subtitle">STM32 嵌入式开发基础知识</p>
    </div>
    
    <div class="content-grid">
      <div class="card">
        <h3>C 语言基础</h3>
        <p>指针、结构体、位操作等嵌入式开发必备知识。</p>
        <button class="action-btn">开始学习</button>
      </div>
      
      <div class="card">
        <h3>寄存器操作</h3>
        <p>理解寄存器映射、位带操作与直接地址访问。</p>
        <button class="action-btn">开始学习</button>
      </div>
      
      <div class="card">
        <h3>编译与链接</h3>
        <p>GCC 工具链、Makefile、链接脚本 (.ld) 解析。</p>
        <button class="action-btn">开始学习</button>
      </div>

      <div class="card">
        <h3>调试技巧</h3>
        <p>GDB 使用、OpenOCD 配置与常见故障排查。</p>
        <button class="action-btn">开始学习</button>
      </div>
    </div>
  </div>
</template>

<style scoped>
.programming-basics {
  padding: 2rem;
  height: 100%;
  overflow-y: auto;
  color: var(--ctp-text);
}

.header {
  margin-bottom: 3rem;
}

h1 {
  font-size: 2.5rem;
  margin-bottom: 0.5rem;
  background: linear-gradient(135deg, var(--ctp-green) 0%, var(--ctp-blue) 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
}

.subtitle {
  font-size: 1.1rem;
  color: var(--ctp-subtext0);
}

.content-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 2rem;
}

.card {
  background: var(--ctp-surface0);
  border: 1px solid var(--ctp-surface1);
  border-radius: 12px;
  padding: 1.5rem;
  transition: transform 0.2s, box-shadow 0.2s;
}

.card:hover {
  transform: translateY(-4px);
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.1);
  border-color: var(--ctp-blue);
}

.card h3 {
  font-size: 1.25rem;
  margin-bottom: 0.75rem;
  color: var(--ctp-text);
}

.card p {
  color: var(--ctp-subtext0);
  margin-bottom: 1.5rem;
  line-height: 1.6;
}

.action-btn {
  background: var(--ctp-blue);
  color: var(--ctp-base);
  border: none;
  padding: 0.5rem 1rem;
  border-radius: 6px;
  cursor: pointer;
  font-weight: 600;
  transition: opacity 0.2s;
}

.action-btn:hover {
  opacity: 0.9;
}
</style>
