# 开发环境配置指南

由于这是一台新电脑，我们需要先配置 Node.js 环境才能运行 Vue 项目。

## 1. 安装 Node.js

推荐使用 `nvm` (Node Version Manager) 来管理 Node.js 版本，或者直接从官网下载。

### 方法 A: 直接安装 (简单)
1. 访问 [Node.js 官网](https://nodejs「方案选单」.org/)。
2. 下载 **LTS (长期支持版)**。
3. 按照安装向导完成安装。
4. 打开终端 (Terminal)，输入以下命令检查是否安装成功：
   ```bash
   node -v
   npm -v
   ```

### 方法 B: 使用 nvm (推荐，方便切换版本)
1. 在终端运行安装脚本 (Linux/Mac):
   ```bash
   curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.7/install.sh | bash
   ```
2. 重启终端，安装 Node.js LTS 版本：
   ```bash
   nvm install --lts
   ```

## 2. 启动项目

本项目基于 Vite + Vue 构建。

1. 在终端中进入项目目录：
   ```bash
   cd /home/wj/ai_copilot/stm32f103_reg_v1
   ```

2. 安装依赖：
   ```bash
   npm install
   ```

3. 启动开发服务器：
   ```bash
   npm run dev
   ```

4. 按住 `Ctrl` 点击终端显示的链接 (通常是 `http://localhost:5173`) 即可在浏览器查看。
