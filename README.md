 # Memory-Blog 博客系统

这是一个现代化的博客系统，由 Flask 后端和 React 前端组成，支持 Markdown 格式的文章。它具有简洁美观的界面设计，支持代码高亮显示，并且完全响应式，可以在各种设备上良好显示。

## 功能特点

### 后端功能
- 使用 Flask 框架构建
- 支持 Markdown 格式文章
- YAML 格式的文章元数据
- RESTful API支持
- 后台管理系统
- 文章标签支持

### 前端功能
- 使用 React + TypeScript 构建
- 使用 Framer Motion 实现流畅的动画效果
- 使用 React Router 实现路由管理
- 响应式设计，适配各种设备
- 代码块语法高亮
- 图片点击放大预览
- 简洁美观的界面
- 亮/暗主题切换功能
- 文章详情页支持

## 项目结构

```
Memory-Blog/
├── app.py              # 后端主应用程序文件
├── requirements.txt    # 后端项目依赖
├── content/           # Markdown 文章目录
├── frontend/          # 前端项目目录
│   ├── src/           # 前端源代码
│   │   ├── components/ # 前端组件
│   │   ├── pages/      # 前端页面
│   │   ├── services/    # API 服务
│   │   ├── styles/      # 样式文件
│   │   └── App.tsx      # 前端主应用
│   ├── package.json    # 前端依赖
│   └── vite.config.ts   # Vite 配置
└── README.md          # 项目说明文件
```

## 安装说明

### 后端安装

1. 克隆项目到本地：

```bash
git clone <repository-url>
cd Memory-Blog
```

2. 创建并激活虚拟环境：

```bash
# Windows
python -m venv venv
venv\Scripts\activate

# Linux/macOS
python3 -m venv venv
source venv/bin/activate
```

3. 安装依赖包：

```bash
pip install -r requirements.txt
```

### 前端安装

1. 进入前端目录：

```bash
cd frontend
```

2. 安装依赖包：

```bash
npm install
```

## 运行说明

### 运行后端服务器

1. 在项目根目录下运行：

```bash
python app.py
```

2. 后端服务器将运行在 `http://127.0.0.1:5000`

### 运行前端开发服务器

1. 在前端目录下运行：

```bash
npm run dev
```

2. 前端开发服务器将运行在 `http://localhost:3000/personal-blog-frontend/`

## 构建前端项目

在前端目录下运行：

```bash
npm run build
```

构建完成后，生产版本的文件将位于 `frontend/dist` 目录中。

## API 文档

### 获取文章列表
- 端点: `GET /api/posts`
- 响应示例:
```json
[
  {
    "filename": "test-tech-article",
    "title": "测试技术文章",
    "date": "2026-02-04",
    "summary": "这是一篇测试技术文章的摘要...",
    "content": "---\ntitle: 测试技术文章\n...",
    "metadata": {"title": "测试技术文章"},
    "tags": ["技术", "测试"]
  }
]
```

### 获取单篇文章
- 端点: `GET /api/posts/{filename}`
- 响应示例:
```json
{
  "filename": "test-tech-article",
  "title": "测试技术文章",
  "date": "2026-02-04",
  "summary": "这是一篇测试技术文章的摘要...",
  "content": "---\ntitle: 测试技术文章\n...",
  "metadata": {"title": "测试技术文章"},
  "tags": ["技术", "测试"]
}
```

## 创建新文章

1. 在 `content` 目录下创建新的 `.md` 文件
2. 在文件开头添加 YAML 格式的元数据：

```yaml
---
title: 文章标题
date: YYYY-MM-DD
tags: [标签1, 标签2]
---
```

3. 使用 Markdown 格式编写文章内容

## 文章元数据说明

- `title`: 文章标题（必需）
- `date`: 发布日期，格式为 YYYY-MM-DD（必需）
- `tags`: 文章标签，以数组形式提供（可选）

## 部署指南

### 前端部署

前端项目配置了 GitHub Actions 工作流，可以自动部署到 GitHub Pages：

1. 推送到 `main` 分支
2. GitHub Actions 将自动构建并部署到 GitHub Pages
3. 访问 `https://zhangyan8216.github.io/personal-blog-frontend/` 查看部署结果

### 后端部署

可以使用 Gunicorn 部署后端：

```bash
gunicorn -w 4 -b 127.0.0.1:5000 app:app
```

## 依赖项

### 后端依赖
- Flask
- Python-Markdown
- PyYAML
- Pygments（用于代码高亮）

### 前端依赖
- React
- TypeScript
- Framer Motion
- React Router DOM
- React Icons
- Marked
- Sass

## 浏览器支持

- Chrome (推荐)
- Firefox
- Safari
- Edge

## 贡献指南

1. Fork 项目
2. 创建特性分支：`git checkout -b my-new-feature`
3. 提交改动：`git commit -am 'Add some feature'`
4. 推送到分支：`git push origin my-new-feature`
5. 提交 Pull Request

## 许可证

MIT License

## 作者

R0ck3t

## 致谢

- Flask 社区
- React 社区
- Framer Motion
- Marked

## 更新日志

### v1.0.0 (2026-02-04)
- 初始版本发布
- 基本的博客功能实现
- Markdown 支持
- 响应式设计
- 前端使用 React + TypeScript 构建
- 后端使用 Flask 构建
- 支持 GitHub Pages 自动部署