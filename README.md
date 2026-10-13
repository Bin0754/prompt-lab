# Prompt Lab · 每日提示词炼化实验室

在线访问：https://bin0754.github.io/prompt-lab/

纯静态站点（HTML/CSS/原生 JS，无构建步骤），由 GitHub Pages 从 `main` 分支根目录发布。

## 目录结构
```
index.html  style.css  app.js
data/index.json            # {"dates": ["2026-10-13", ...]} 日期列表（新→旧）
data/YYYY-MM-DD.json       # 当天 10 个模板
images/YYYY-MM-DD/01.jpg   # 测试图，编号对应模板 id
scripts/md2json.py         # 模板 Markdown → JSON
publish.sh                 # 一键添加新的一天并推送
```

每条 entry：`id, name, photoRef(★), tagline, scenarios[], variables[{name,desc,example}], template, example, image`。

## 新增一天

**方式 A（从 Markdown + 图片）：**
```bash
./publish.sh 2026-10-14 /path/prompt_templates_10.md img1.jpg img2.jpg ... img10.jpg
```
Markdown 需沿用现有格式（`### 模板 N｜★ 名称`、`**一句话卖点**：`、`**适用场景**：`、变量表、```代码块```正文、`**示例**：`）。图片按顺序对应模板 1–10，自动压缩为 ≤1600px 宽 JPG。

**方式 B（手动）：** 放入 `data/2026-10-14.json` 和 `images/2026-10-14/01..10.jpg`，然后运行 `./publish.sh 2026-10-14`（会更新 `data/index.json`、提交并推送）。

推送后约 1 分钟 Pages 自动更新。
