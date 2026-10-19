# 智能排课 V2.1 原型 · GitHub Pages 部署包

这是静态页面包，入口是仓库根目录的 `index.html`。无需安装依赖、运行构建命令或配置后端。

## 部署到 GitHub Pages

1. 新建 GitHub 仓库，解压本文件包，把**压缩包内的文件本身**上传到仓库根目录；不要只上传 ZIP，也不要多套一层文件夹。提交后，仓库根目录应直接看到 `index.html`、`app.js`、CSS 文件和 `ai-dialog-avatar.png`。
2. 在仓库 **Settings → Pages** 中，将发布源设为 **Deploy from a branch**，选择 `main` 分支及 `/(root)`，保存。
3. 待 GitHub Pages 发布完成，在 Pages 设置页打开生成的网址。项目仓库的网址通常形如 `https://用户名.github.io/仓库名/`。

官方说明：[配置 GitHub Pages 发布源](https://docs.github.com/en/pages/getting-started-with-github-pages/configuring-a-publishing-source-for-your-github-pages-site)。

## 包内文件

- `index.html`：页面入口。
- `app.js`：交互与演示数据。
- `styles.css`、`formal-schedule.css`、`legacy-pages.css`、`strategy-layer.css`、`formal-layout-v7.css`：页面样式。
- `ai-dialog-avatar.png`：AI 助手头像。
- `.nojekyll`：禁用 Pages 默认的 Jekyll 构建，按原样发布静态文件。

本包来自 `stitch_output_v7_teacher_selection_prototype`，页面名称为“智能排课V2.1 AI智能算法排课方案”。当前仍是**前端演示原型**：AI 分析、教师覆盖与排课结果不连接真实服务，不能作为生产排课结论；浏览器本地保存的版本不会在不同设备或浏览器之间同步。公开发布前，请复核页面中的演示姓名、编号、电话及排课要求文本是否适合公开。
