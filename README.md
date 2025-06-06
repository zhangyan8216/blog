# Flask Markdown 博客系统

这是一个使用 Flask 框架构建的简单博客系统，支持 Markdown 格式的文章。它具有简洁的界面设计，支持代码高亮显示，并且完全响应式，可以在各种设备上良好显示。

## 功能特点

- 使用 Flask 框架构建
- 支持 Markdown 格式文章
- YAML 格式的文章元数据
- 响应式设计，适配各种设备
- 代码块语法高亮
- 图片点击放大预览
- 文章标签支持
- 简洁美观的界面
- 亮/暗主题切换功能
- 后台管理系统
- RESTful API支持

## 安装说明

1. 克隆项目到本地：

```bash
git clone <repository-url>
cd flask-markdown-blog
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

## 数据库配置

1. 初始化数据库：
```bash
flask db init
flask db migrate
flask db upgrade
```

2. 配置数据库连接：
在 `instance/config.py` 中设置数据库URI：
```python
SQLALCHEMY_DATABASE_URI = 'sqlite:///blog.db'
```

## API 文档

### 主题切换
- 端点: `POST /api/theme`
- 请求格式:
```json
{
  "theme": "light"  # 或 "dark"
}
```
- 响应示例:
```json
{
  "success": true,
  "theme": "dark",
  "message": "主题已切换为 dark"
}
```

## 主题切换功能

1. 系统会自动检测用户设备的主题偏好
2. 手动切换方式：
   - 点击导航栏的主题切换按钮
   - 主题偏好会保存在本地存储中
   - 下次访问时自动应用上次选择的主题

## 后台管理

1. 访问 `/admin` 进入后台
2. 默认登录凭证：
   - 用户名: admin
   - 密码: admin123
   
   ⚠️ 安全提示：首次登录后请立即修改默认密码！

3. 修改密码方法：
```bash
flask user change-password --username admin --new-password 你的新密码
```

4. 功能包括：
   - 文章管理
   - 用户管理
   - 主题管理
   - 系统设置

## 使用说明

1. 启动博客系统：

## 部署指南

### 生产环境部署
```bash
gunicorn -w 4 -b 127.0.0.1:5000 app:app
```

### Nginx配置示例
```nginx
server {
    listen 80;
    server_name yourdomain.com;
    
    location / {
        proxy_pass http://127.0.0.1:5000;
    }
}
```

## 开发贡献

1. 安装开发依赖：
```bash
pip install -r requirements-dev.txt
```

2. 开发流程：
- 创建新分支
- 编写测试用例
- 提交Pull Request

## 许可证

MIT License

## 联系方式

如有问题请联系：your-email@example.com

```bash
python app.py
```

2. 在浏览器中访问：`http://localhost:5000`

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

## 目录结构

```
flask-markdown-blog/
├── app.py              # 主应用程序文件
├── requirements.txt    # 项目依赖
├── content/           # Markdown 文章目录
├── static/           # 静态文件目录
│   ├── css/         # CSS 样式文件
│   └── js/          # JavaScript 文件
└── templates/        # 模板文件目录
    ├── base.html    # 基础模板
    ├── index.html   # 首页模板
    ├── post.html    # 文章页模板
    └── about.html   # 关于页面模板
```

## 自定义主题

你可以通过修改 `static/css/style.css` 文件来自定义博客的外观。主要的样式类包括：

- `.blog-post`: 文章容器
- `.blog-post-content`: 文章内容
- `.card`: 文章卡片（在首页）
- `.navbar`: 导航栏

## 依赖项

- Flask
- Python-Markdown
- PyYAML
- Python-Frontmatter
- Pygments（用于代码高亮）

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

MIT License - 详见 LICENSE 文件

## 作者

[你的名字]

## 致谢

- Bootstrap
- Prism.js
- Flask 社区

## 更新日志

### v1.0.0 (2024-06-06)
- 初始版本发布
- 基本的博客功能实现
- Markdown 支持
- 响应式设计
=======
# blog
>>>>>>> 4a2c0473d4794204dce27c5109ff739ef033fae4
