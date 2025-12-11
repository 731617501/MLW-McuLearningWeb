# Markdown 查看器功能使用说明

本项目已集成 Markdown 文件渲染功能，允许在应用内直接展示 `.md` 文档。

## 1. 功能演示

在 **Programming Basics (编程基础)** -> **C 语言** 页面中，现在有两个选项卡：
- **📊 可视化解析**：原有的 Map 文件可视化工具。
- **📄 详细文档**：新增加的 Markdown 文档查看器，目前展示了 "Keil Map 文件全面解析" 文档。

## 2. 如何添加新的 Markdown 文档

### 步骤一：准备文档
将你的 `.md` 文件放入 `src/data/` 目录（或其他合适的位置）。
例如：`src/data/my_guide.md`

### 步骤二：导入文档
在需要使用的 Vue 组件中（例如 `src/components/ProgrammingBasics.vue`），使用 `?raw` 后缀导入文档内容：

```typescript
// 导入 markdown 文件内容为字符串
import myGuideContent from '../data/my_guide.md?raw'
```

### 步骤三：使用组件
引入 `MarkdownViewer` 组件并将内容传递给 `content` 属性：

```vue
<script setup>
import { defineAsyncComponent } from 'vue'
// 异步加载组件（推荐）
const MarkdownViewer = defineAsyncComponent(() => import('./MarkdownViewer.vue'))
</script>

<template>
  <MarkdownViewer :content="myGuideContent" />
</template>
```

## 3. 依赖说明

本功能依赖以下 npm 包：
- `marked`: 用于将 Markdown 解析为 HTML。
- `dompurify`: 用于清理 HTML，防止 XSS 攻击。

如果你在运行项目时遇到 "Module not found" 错误，请确保已安装依赖：

```bash
npm install marked dompurify
npm install -D @types/marked @types/dompurify
```

## 4. 样式自定义

Markdown 的渲染样式定义在 `src/components/MarkdownViewer.vue` 的 `<style>` 块中。
你可以根据需要修改字体、颜色、间距等样式，以匹配你的设计需求。
目前样式已适配 Catppuccin 主题。
