from flask import Flask, render_template, request, jsonify, make_response, session, redirect, url_for
from flask_migrate import Migrate
from extensions import db
from blueprints.admin import admin_bp
from blueprints.auth import auth_bp
from themes.views import theme_bp
import os
from datetime import datetime
import markdown
import yaml
from collections import defaultdict
import feedgenerator
from urllib.parse import urljoin

# 配置密钥（生产环境应从环境变量获取）
SECRET_KEY = os.getenv('FLASK_SECRET_KEY', 'dev-secret-key')

app = Flask(__name__)
app.secret_key = SECRET_KEY

# 数据库配置
app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///D:/自己的项目/instance/site.db'
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False

# 初始化数据库和迁移
db.init_app(app)
migrate = Migrate(app, db)

# 注册蓝图
app.register_blueprint(admin_bp, url_prefix='/admin')
app.register_blueprint(auth_bp)
app.register_blueprint(theme_bp, url_prefix='/themes')

# Giscus 配置
app.config['GISCUS'] = {
    'repo': 'zhangyan8216/comments',
    'repo_id': 'R_kgDOK4TURA',
    'category': 'Announcements',
    'category_id': 'DIC_kwDOK4TURA4CbzEA',
    'mapping': 'pathname',
    'reactions_enabled': '1',
    'theme': 'light',
    'lang': 'zh-CN'
}
app.config['DEBUG_GISCUS'] = True

# 配置生产环境设置
if os.getenv('FLASK_ENV') == 'production':
    app.config.update(
        SESSION_COOKIE_SECURE=True,
        SESSION_COOKIE_HTTPONLY=True,
        SESSION_COOKIE_SAMESITE='Lax'
    )

# Giscus 配置 - 使用最基本的设置
app.config['GISCUS'] = {
    'repo': 'zhangyan8216/comments',
    'repo_id': 'R_kgDOK4TURA',
    'category': 'Announcements',  # 使用默认分类
    'category_id': 'DIC_kwDOK4TURA4CbzEA',
    'mapping': 'pathname',  # 使用路径名而不是 URL
    'reactions_enabled': '1',
    'theme': 'light',
    'lang': 'zh-CN'
}

# 添加调试配置
app.config['DEBUG_GISCUS'] = True

# 添加markdown函数到模板上下文
@app.context_processor
def utility_processor():
    def render_markdown(text):
        return markdown.markdown(text, extensions=['fenced_code', 'tables', 'toc'])
    return dict(markdown=render_markdown)

def get_posts():
    posts = []
    for filename in os.listdir('content'):
        if filename.endswith('.md'):
            with open(os.path.join('content', filename), 'r', encoding='utf-8') as f:
                content = f.read()
                # 分离元数据和内容
                if content.startswith('---'):
                    parts = content.split('---', 2)[1:]
                    if len(parts) == 2:
                        metadata = yaml.safe_load(parts[0])
                        content = parts[1]
                    else:
                        metadata = {}
                        content = content
                else:
                    metadata = {}
                
                # 如果没有标题，使用文件名作为标题
                if 'title' not in metadata:
                    metadata['title'] = os.path.splitext(filename)[0]
                
                # 如果没有日期，使用文件修改时间
                if 'date' not in metadata:
                    file_mtime = os.path.getmtime(os.path.join('content', filename))
                    metadata['date'] = datetime.fromtimestamp(file_mtime)
                
                # 生成文章摘要
                html_content = markdown.markdown(content)
                summary = html_content[:200] + '...' if len(html_content) > 200 else html_content
                
                # 确保标签是列表格式
                tags = metadata.get('tags', [])
                if isinstance(tags, str):
                    tags = [tag.strip() for tag in tags.split(',')]
                
                posts.append({
                    'filename': os.path.splitext(filename)[0],
                    'title': metadata.get('title'),
                    'date': metadata.get('date'),
                    'summary': summary,
                    'content': content,
                    'metadata': metadata,
                    'tags': tags
                })
    
    # 按日期排序
    return sorted(posts, key=lambda x: x['date'], reverse=True)

def get_tags():
    """获取所有标签及其文章数量"""
    posts = get_posts()
    tags = defaultdict(int)
    
    for post in posts:
        for tag in post.get('tags', []):
            tags[tag] += 1
    
    return dict(tags)

def get_posts_by_tag():
    """获取每个标签下的所有文章"""
    posts = get_posts()
    tag_posts = defaultdict(list)
    
    for post in posts:
        for tag in post.get('tags', []):
            tag_posts[tag].append(post)
    
    # 对每个标签下的文章按日期排序
    for tag in tag_posts:
        tag_posts[tag] = sorted(tag_posts[tag], key=lambda x: x['date'], reverse=True)
    
    return dict(tag_posts)

class Pagination:
    def __init__(self, items, page, per_page):
        self.items = items
        self.page = page
        self.per_page = per_page
        
        # 计算总页数
        self.total = len(items)
        self.pages = (self.total + per_page - 1) // per_page
        
        # 确保当前页在有效范围内
        self.page = max(1, min(self.page, self.pages))
        
        # 获取当前页的数据
        start = (page - 1) * per_page
        end = start + per_page
        self.items = items[start:end]

@app.route('/')
def index():
    # 获取当前页码，默认为1
    page = request.args.get('page', 1, type=int)
    per_page = 5  # 每页显示5篇文章
    
    # 获取所有文章
    all_posts = get_posts()
    
    # 创建分页对象
    pagination = Pagination(all_posts, page, per_page)
    
    # 获取标签统计
    tags = get_tags()
    
    # 获取最新文章（取前5篇）
    recent_posts = all_posts[:5]
    
    return render_template('index.html', 
                         posts=pagination.items,
                         pagination=pagination,
                         tags=tags,
                         recent_posts=recent_posts)

@app.route('/post/<filename>')
def post(filename):
    posts = get_posts()
    post = next((post for post in posts if post['filename'] == filename), None)
    if post is None:
        return 'Post not found', 404
    
    # 使用基本的 Giscus 配置
    return render_template('post.html', post=post, giscus=app.config['GISCUS'], config=app.config)

@app.route('/debug/giscus')
def debug_giscus():
    """调试 Giscus 配置的路由"""
    return jsonify({
        'giscus_config': app.config['GISCUS'],
        'debug_enabled': app.config.get('DEBUG_GISCUS', False),
        'current_url': request.url,
        'base_url': request.base_url,
        'path': request.path,
        'host': request.host,
        'scheme': request.scheme
    })

@app.route('/tags')
def tags():
    """标签页面，显示所有标签和每个标签下的文章"""
    return render_template('tags.html', 
                          tags=get_tags(), 
                          tag_posts=get_posts_by_tag())

@app.route('/tag/<tag>')
def tag(tag):
    """显示特定标签下的所有文章"""
    tag_posts = get_posts_by_tag()
    if tag in tag_posts:
        posts = tag_posts[tag]
        return render_template('index.html', 
                              posts=posts, 
                              title=f"标签: {tag}")
    return render_template('index.html', 
                          posts=[], 
                          title=f"标签: {tag}",
                          message=f"没有找到标签为 '{tag}' 的文章")

def get_site_stats():
    """获取网站统计信息"""
    posts = get_posts()
    tags = get_tags()
    
    # 计算网站运行天数
    start_date = datetime(2024, 1, 1)  # 网站开始运行的日期
    days_running = (datetime.now() - start_date).days
    
    return {
        'post_count': len(posts),
        'tag_count': len(tags),
        'days_running': days_running
    }

@app.route('/archive')
def archive():
    """归档页面，按年份组织所有文章"""
    articles = get_posts()
    stats = get_site_stats()
    return render_template('archive.html', 
                         articles=articles,
                         stats=stats)

@app.route('/about')
def about():
    """关于页面"""
    stats = get_site_stats()
    return render_template('about.html', stats=stats)

@app.template_filter('format_date')
def format_date(date):
    """自定义日期格式化过滤器"""
    if isinstance(date, str):
        try:
            date = datetime.strptime(date, '%Y-%m-%d')
        except ValueError:
            return date
    return date.strftime('%Y-%m-%d')

@app.route('/feed.xml')
def feed():
    """生成RSS feed"""
    posts = get_posts()
    
    # 创建feed
    feed = feedgenerator.Rss201rev2Feed(
        title="我的博客",
        link=request.url_root,
        description="我的个人博客RSS订阅",
        language="zh-cn",
        author_name="博客作者",
        feed_url=urljoin(request.url_root, url_for('feed')),
        image_url=urljoin(request.url_root, 'static/favicon.ico'),
        copyright=f"Copyright {datetime.now().year} 博客作者",
        ttl=60  # 60分钟缓存
    )

    # 添加文章到feed
    for post in posts:
        feed.add_item(
            title=post.metadata.title,
            link=urljoin(request.url_root, url_for('post', slug=post.slug)),
            description=post.html,
            author_name="博客作者",
            pubdate=post.date,
            unique_id=post.slug
        )

    # 生成feed内容
    rss_feed = feed.writeString('utf-8')
    
    # 设置正确的Content-Type
    response = make_response(rss_feed)
    response.headers['Content-Type'] = 'application/rss+xml; charset=utf-8'
    return response
    
    # 添加文章到feed
    for post in posts[:10]:  # 只包含最新的10篇文章
        # 确保日期是datetime对象
        pub_date = post['date']
        if isinstance(pub_date, str):
            try:
                pub_date = datetime.strptime(pub_date, '%Y-%m-%d')
            except ValueError:
                pub_date = datetime.now()
        
        # 生成文章链接
        post_url = urljoin(request.url_root, url_for('post', filename=post['filename']))
        
        # 添加文章到feed
        feed.add_item(
            title=post['title'],
            link=post_url,
            description=post['summary'],
            pubdate=pub_date,
            categories=post.get('tags', [])
        )
    
    # 生成RSS XML
    response = make_response(feed.writeString('utf-8'))
    response.headers['Content-Type'] = 'application/rss+xml; charset=utf-8'
    return response

@app.errorhandler(404)
def page_not_found(e):
    """自定义404错误页面"""
    return render_template('404.html'), 404

if __name__ == '__main__':
    app.run(debug=True)