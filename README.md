# AI Test Projects · 纯前端测试项目集

本目录收录了 5 个使用不同 AI 生成的独立前端项目。所有项目均为**纯 HTML5 + CSS3 + 原生 JavaScript** 架构，零构建依赖、零打包，双击 `index.html` 即可直接运行。

---

## 📋 项目总览

| 一级目录 (英文) | 一句话简介 | 原目录名 | 技术栈 |
|---|---|---|---|
| [`block-game`](./block-game/) | **3D 方块沙盒游戏**（网页版 Minecraft） | `eGLM` | 纯 WebGL 1.0 + 原生模块化 JS |
| [`learn-lang`](./learn-lang/) | **多语种语言学习应用**（3D 闪卡 + 单词发音） | `aWebsite` | 纯 HTML5 + CSS3 + 原生 JS |
| [`iot-hub`](./iot-hub/) | **物联网设备监控面板**（万级数据虚拟滚动） | `bOpencodeXAlpha` | 单文件纯 HTML + CSS + JS |
| [`space-energy`](./space-energy/) | **3D 星际能源控制台**（同一 Prompt 双模型横向对标：Gemini / MuseSpark） | `cGoogleGemini` & `dMuseSpark` | 纯 WebGL 2.0 + 原生 GLSL |

---

## 🚀 启动与运行

1. **直接双击运行**：进入任意子目录，双击其中的 `index.html` 即可离线体验。
2. **本地静态服务（可选）**：
   ```bash
   cd /Users/fortrust/Documents/AItestProjects
   python3 -m http.server 8080
   ```
   - [http://localhost:8080/block-game/](http://localhost:8080/block-game/)
   - [http://localhost:8080/learn-lang/](http://localhost:8080/learn-lang/)
   - [http://localhost:8080/iot-hub/](http://localhost:8080/iot-hub/)
   - [http://localhost:8080/space-energy/](http://localhost:8080/space-energy/)（聚合主页，含 Gemini 版与 MuseSpark 版双向切换）
