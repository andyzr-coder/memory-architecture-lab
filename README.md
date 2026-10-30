# 存储架构研习室

面向已有 CPU、GPU 或 SoC 架构基础、希望深入存储芯片架构的中文学习课程。

[公开学习网站](https://andyzr-coder.github.io/memory-architecture-lab/) · [完整 PDF 手册](https://andyzr-coder.github.io/memory-architecture-lab/downloads/memory-architecture-handbook.pdf) · [离线 HTML 手册](https://andyzr-coder.github.io/memory-architecture-lab/downloads/memory-architecture-handbook.html)

资料核对截至 **2026 年 10 月 30 日**。这是一个有明确截止日期的研究学习版本，不会自动更新厂商路线图和论文状态。

完整课程包含 **22 个模块、35 篇论文与技术案例、69 项原始资料、90 道面试问答、66 道自测和 8 个交互实验**。主线是 DRAM 内部结构 → 控制器与 GPU → HBM/HBF 分层 → PIM/CIM → 架构方案评审。

## 内容

- DRAM 内部结构：1T1C、电荷分享、感放、阵列层级、局部与全局 I/O、预取架构、时序、刷新、可靠性与设计取舍。
- 控制器与 GPU：地址映射、调度与公平性、PHY、合并访问、MLP/BLP、Roofline、模型权重与 KV cache。
- HBM、HBF 与 PIM：堆叠、封装、NAND 粒度、分层放置、预取、寿命、存内与近存计算。
- CIM：数字位乘与加法树、模拟电流/电荷/时间计算、数模混合、精度与能效边界，以及 SRAM、RRAM、PCM、FeFET 等器件的瓶颈。
- 原始论文的机制、代价、证据等级、适用条件；面试参考回答、自测和复现实验方案。

## 网站功能

可点击并折叠的知识树、全文搜索、章节目录、八个可调参数实验、论文并排比较、自动判题与错题回顾、口述面试训练、学习进度、笔记导入导出、手机布局与深色模式。学习数据仅使用浏览器 `localStorage`，不上传到服务器。

八个实验分别演示电荷分享、DRAM 首数据时序、Roofline、权重与 KV 容量、HBF 并发与读放大、模拟 CIM 量化、系统能量分解及数字 CIM 补码部分积。

## 如何使用

面试前一天可以先走网站的精读路线；三天路线会连接原理、方案与追问。完整研读建议结合论文原文和一个真实复现实验。

教学数值不等于产品规格。厂商目标、协议规格、器件实测、系统仿真和解析模型分别标注。论文结果不能跨精度、基线或统计边界直接比较。未经实施的复现实验应表述为拟议方案，不代表实际项目经验。

## 本地运行

需要 Node.js 18 或更新版本。网站无前端框架和外部 CDN 依赖。

```sh
node tools/build.cjs
node tools/serve.cjs 4173
```

打开 `http://127.0.0.1:4173/`。不需要安装依赖即可构建、运行网站和执行数值自检。

```sh
node tools/test-models.cjs
node tools/validate-content.cjs
```

浏览器端验证和 PDF 生成使用 Playwright 与本机 Chromium/Edge；在通用环境中可安装 Playwright 后运行 `tools/browser-qa.cjs` 和 `tools/render-handbook.cjs`。Windows 脚本默认使用已安装的 Edge，其他系统使用 Playwright 的 Chromium。执行前需启动上述本地服务器。`TEST_URL` 可指定其他测试地址。

## 文件结构

| 目录 | 内容 |
| --- | --- |
| `research/` | 结构化原创课程、论文卡片与来源记录 |
| `dist/` | 可直接托管的静态网站 |
| `dist/downloads/` | PDF、离线 HTML 与课程数据 |
| `tools/` | 构建、数值自检、浏览器验证与 PDF 输出脚本 |

源文件位于 `codex/source` 分支，GitHub Pages 从 `codex/pages` 分支的根目录发布。修改课程后重新运行构建、检查和 PDF 生成，再同步静态输出即可发布新版本。

原论文和厂商文档版权归原作者或发布方。本站提供原始来源链接，不镜像论文全文。示意图与交互模型用于教学，不能作为 SPICE、协议合规验证或硬件实测的替代。
