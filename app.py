from flask import Flask, request, jsonify, make_response, url_for
from flask_cors import CORS
from blueprints.admin import admin_bp
from blueprints.auth import auth_bp
import os
from datetime import datetime
import markdown
import yaml
from collections import defaultdict
import feedgenerator
import json
from urllib.parse import urljoin
from dotenv import load_dotenv
from utils.jwt_utils import verify_token, admin_required, user_required

# 加载环境变量
load_dotenv()

SECRET_KEY = os.getenv('FLASK_SECRET_KEY', 'dev-secret-key')

app = Flask(__name__)
app.secret_key = SECRET_KEY

# 配置 CORS
CORS(app, resources={
    r"/api/*": {
        "origins": ["*"],  # 在生产环境中应该设置具体的域名
        "methods": ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
        "allow_headers": ["Content-Type", "Authorization"],
        "expose_headers": ["Content-Length"],
        "supports_credentials": True
    }
})

app.register_blueprint(admin_bp, url_prefix='/admin')
app.register_blueprint(auth_bp)

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

@app.context_processor
def utility_processor():
    def render_markdown(text):
        return markdown.markdown(text, extensions=['fenced_code', 'tables', 'toc'])
    return dict(markdown=render_markdown)

def get_current_user_from_token():
    """从请求中获取当前用户"""
    token = None
    
    if 'Authorization' in request.headers:
        auth_header = request.headers['Authorization']
        if auth_header.startswith('Bearer '):
            token = auth_header[7:]
    
    if not token:
        token = request.cookies.get('token')
    
    if not token:
        return None
    
    payload = verify_token(token)
    if not payload:
        return None
    
    return {
        'id': payload.get('user_id'),
        'username': payload.get('username'),
        'role': payload.get('role')
    }

def get_posts():
    posts = []
    for filename in os.listdir('content'):
        if filename.endswith('.md'):
            with open(os.path.join('content', filename), 'r', encoding='utf-8') as f:
                content = f.read()
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
                
                if 'title' not in metadata:
                    metadata['title'] = os.path.splitext(filename)[0]
                
                if 'date' not in metadata:
                    file_mtime = os.path.getmtime(os.path.join('content', filename))
                    metadata['date'] = datetime.fromtimestamp(file_mtime)
                else:
                    from datetime import date
                    if isinstance(metadata['date'], str):
                        try:
                            metadata['date'] = datetime.fromisoformat(metadata['date'])
                        except ValueError:
                            metadata['date'] = datetime.now()
                    elif isinstance(metadata['date'], date) and not isinstance(metadata['date'], datetime):
                        metadata['date'] = datetime.combine(metadata['date'], datetime.min.time())
                
                html_content = markdown.markdown(content)
                import re
                plain_text = re.sub('<[^<]+?>', '', html_content)
                summary = plain_text[:200] + '...' if len(plain_text) > 200 else plain_text
                
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
                    'tags': tags,
                    'author_id': metadata.get('author_id'),
                    'author_name': metadata.get('author_name')
                })
    
    return sorted(posts, key=lambda x: x['date'], reverse=True)

def get_tags():
    posts = get_posts()
    tags = defaultdict(int)
    
    for post in posts:
        for tag in post.get('tags', []):
            tags[tag] += 1
    
    return dict(tags)

def get_posts_by_tag():
    posts = get_posts()
    tag_posts = defaultdict(list)
    
    for post in posts:
        for tag in post.get('tags', []):
            tag_posts[tag].append(post)
    
    for tag in tag_posts:
        tag_posts[tag] = sorted(tag_posts[tag], key=lambda x: x['date'], reverse=True)
    
    return dict(tag_posts)

class Pagination:
    def __init__(self, items, page, per_page):
        self.items = items
        self.page = page
        self.per_page = per_page
        self.total = len(items)
        self.pages = (self.total + per_page - 1) // per_page
        self.page = max(1, min(self.page, self.pages))
        start = (page - 1) * per_page
        end = start + per_page
        self.items = items[start:end]

@app.route('/api/posts')
def api_posts():
    all_posts = get_posts()
    return jsonify(all_posts)

@app.route('/api/posts/<filename>')
def api_post(filename):
    posts = get_posts()
    post = next((post for post in posts if post['filename'] == filename), None)
    if post is None:
        return jsonify({'error': 'Post not found'}), 404
    return jsonify(post)

@app.route('/api/tags')
def api_tags():
    tags = get_tags()
    tag_posts = get_posts_by_tag()
    return jsonify({
        'tags': tags,
        'tag_posts': tag_posts
    })

@app.route('/api/archive')
def api_archive():
    articles = get_posts()
    return jsonify({
        'articles': articles
    })

@app.route('/api/about')
def api_about():
    return jsonify({'message': 'About page data'})

@app.route('/api/admin/categories', methods=['GET'])
@admin_required
def api_get_categories():
    """获取所有分类"""
    posts = get_posts()
    categories_count = defaultdict(int)
    
    for post in posts:
        category = post.get('metadata', {}).get('category')
        if category:
            categories_count[category] += 1
    
    categories = []
    for name, count in categories_count.items():
        categories.append({
            'name': name,
            'slug': name.lower().replace(' ', '-'),
            'article_count': count,
            'created_at': datetime.now().isoformat()
        })
    
    categories = sorted(categories, key=lambda x: x['article_count'], reverse=True)
    
    return jsonify({'categories': categories}), 200

@app.route('/api/admin/categories', methods=['POST'])
@admin_required
def api_create_category():
    """创建分类"""
    data = request.get_json()
    name = data.get('name')
    
    if not name:
        return jsonify({'error': 'Category name is required'}), 400
    
    return jsonify({
        'message': 'Category created successfully',
        'category': {
            'name': name,
            'slug': name.lower().replace(' ', '-'),
            'article_count': 0,
            'created_at': datetime.now().isoformat()
        }
    }), 201

@app.route('/api/admin/categories/<category_name>', methods=['PUT'])
@admin_required
def api_update_category(category_name):
    """更新分类"""
    data = request.get_json()
    new_name = data.get('name')
    
    if not new_name:
        return jsonify({'error': 'Category name is required'}), 400
    
    return jsonify({
        'message': 'Category updated successfully',
        'category': {
            'name': new_name,
            'slug': new_name.lower().replace(' ', '-'),
            'created_at': datetime.now().isoformat()
        }
    }), 200

@app.route('/api/admin/categories/<category_name>', methods=['DELETE'])
@admin_required
def api_delete_category(category_name):
    """删除分类"""
    return jsonify({'message': 'Category deleted successfully'}), 200

@app.route('/api/admin/tags', methods=['GET'])
@admin_required
def api_get_tags():
    """获取所有标签统计"""
    posts = get_posts()
    tags_count = defaultdict(int)
    tags_posts = defaultdict(list)
    
    for post in posts:
        tags = post.get('tags', [])
        for tag in tags:
            tags_count[tag] += 1
            tags_posts[tag].append({
                'filename': post['filename'],
                'title': post['title']
            })
    
    tags = []
    for name, count in tags_count.items():
        tags.append({
            'name': name,
            'slug': name.lower().replace(' ', '-'),
            'article_count': count,
            'articles': tags_posts[name][:5]
        })
    
    tags = sorted(tags, key=lambda x: x['article_count'], reverse=True)
    
    return jsonify({'tags': tags}), 200

@app.route('/api/admin/settings', methods=['GET'])
@admin_required
def api_get_settings():
    """获取网站设置"""
    settings_file = 'data/settings.json'
    if os.path.exists(settings_file):
        with open(settings_file, 'r', encoding='utf-8') as f:
            settings = json.load(f)
        return jsonify(settings), 200
    else:
        default_settings = {
            'site_title': 'Memory Blog',
            'site_description': '一个分享技术与生活的个人博客',
            'site_keywords': '博客,技术,编程,生活',
            'site_author': '博主',
            'social_links': {
                'github': '',
                'twitter': '',
                'weibo': '',
                'zhihu': ''
            },
            'seo': {
                'baidu_verification': '',
                'google_verification': '',
                'ga_measurement_id': ''
            },
            'features': {
                'comments_enabled': True,
                'rss_enabled': True,
                'toc_enabled': True
            }
        }
        return jsonify(default_settings), 200

@app.route('/api/admin/settings', methods=['PUT'])
@admin_required
def api_update_settings():
    """更新网站设置"""
    data = request.get_json()
    settings_file = 'data/settings.json'
    
    current_settings = {}
    if os.path.exists(settings_file):
        with open(settings_file, 'r', encoding='utf-8') as f:
            current_settings = json.load(f)
    
    current_settings.update(data)
    current_settings['updated_at'] = datetime.now().isoformat()
    
    with open(settings_file, 'w', encoding='utf-8') as f:
        json.dump(current_settings, f, ensure_ascii=False, indent=2)
    
    return jsonify({
        'message': 'Settings updated successfully',
        'settings': current_settings
    }), 200

@app.route('/api/posts', methods=['POST'])
@user_required
def api_create_post():
    data = request.get_json()
    if not data:
        return jsonify({'error': 'No data provided'}), 400
    
    title = data.get('title')
    content = data.get('content')
    
    # 从 request 对象获取用户信息（由 user_required 装饰器设置）
    current_user = {
        'id': request.user_id,
        'username': request.username,
        'role': request.user_role
    }
    
    timestamp = int(datetime.now().timestamp())
    filename = f"{timestamp}.md"
    
    # 验证输入
    if not title or not isinstance(title, str) or len(title) > 200:
        return jsonify({'error': 'Invalid title'}), 400
    
    if not content or not isinstance(content, str):
        return jsonify({'error': 'Invalid content'}), 400
    
    # 验证标签和分类
    tags = data.get('tags', [])
    if tags and not isinstance(tags, list):
        return jsonify({'error': 'Invalid tags format'}), 400
    
    category = data.get('category')
    if category and not isinstance(category, str):
        return jsonify({'error': 'Invalid category format'}), 400
    
    metadata = {
        'title': title,
        'date': datetime.now().isoformat(),
        'tags': tags,
        'category': category,
        'author_id': current_user['id'],
        'author_name': current_user['username']
    }
    
    article_content = '---\n'
    for key, value in metadata.items():
        if value:
            if isinstance(value, list):
                article_content += f'{key}: {value}\n'
            else:
                article_content += f'{key}: {value}\n'
    article_content += '---\n\n'
    article_content += content
    
    try:
        # 确保 filename 不包含路径遍历字符
        if '..' in filename or '/' in filename or '\\' in filename:
            return jsonify({'error': 'Invalid filename'}), 400
        
        # 确保 content 目录存在
        os.makedirs('content', exist_ok=True)
        
        # 安全的文件路径
        file_path = os.path.join('content', filename)
        # 确保文件路径在 content 目录内
        if not os.path.abspath(file_path).startswith(os.path.abspath('content')):
            return jsonify({'error': 'Invalid file path'}), 400
        
        with open(file_path, 'w', encoding='utf-8') as f:
            f.write(article_content)
        return jsonify({'message': 'Post created successfully', 'filename': filename}), 201
    except Exception as e:
        return jsonify({'error': 'Failed to create post'}), 500

@app.route('/api/posts/<filename>', methods=['PUT'])
@user_required
def api_update_post(filename):
    data = request.get_json()
    if not data:
        return jsonify({'error': 'No data provided'}), 400
    
    title = data.get('title')
    content = data.get('content')
    
    # 从 request 对象获取用户信息（由 user_required 装饰器设置）
    current_user = {
        'id': request.user_id,
        'username': request.username,
        'role': request.user_role
    }
    
    # 验证输入
    if not title or not isinstance(title, str) or len(title) > 200:
        return jsonify({'error': 'Invalid title'}), 400
    
    if not content or not isinstance(content, str):
        return jsonify({'error': 'Invalid content'}), 400
    
    # 验证标签和分类
    tags = data.get('tags', [])
    if tags and not isinstance(tags, list):
        return jsonify({'error': 'Invalid tags format'}), 400
    
    category = data.get('category')
    if category and not isinstance(category, str):
        return jsonify({'error': 'Invalid category format'}), 400
    
    # 验证 filename
    if '..' in filename or '/' in filename or '\\' in filename:
        return jsonify({'error': 'Invalid filename'}), 400
    
    # 检查文章是否存在
    post_file = os.path.join('content', f"{filename}.md")
    # 确保文件路径在 content 目录内
    if not os.path.abspath(post_file).startswith(os.path.abspath('content')):
        return jsonify({'error': 'Invalid file path'}), 400
    
    if not os.path.exists(post_file):
        return jsonify({'error': 'Post not found'}), 404
    
    # 检查用户是否有权限编辑文章
    post = next((post for post in get_posts() if post['filename'] == filename), None)
    if not post:
        return jsonify({'error': 'Post not found'}), 404
    
    if post['author_id'] != current_user['id'] and current_user['role'] != 'admin':
        return jsonify({'error': 'Permission denied'}), 403
    
    # 更新文章
    metadata = {
        'title': title,
        'date': post['date'].isoformat() if hasattr(post['date'], 'isoformat') else post['date'],
        'tags': tags,
        'category': category,
        'author_id': post['author_id'],
        'author_name': post['author_name']
    }
    
    article_content = '---\n'
    for key, value in metadata.items():
        if value:
            if isinstance(value, list):
                article_content += f'{key}: {value}\n'
            else:
                article_content += f'{key}: {value}\n'
    article_content += '---\n\n'
    article_content += content
    
    try:
        with open(post_file, 'w', encoding='utf-8') as f:
            f.write(article_content)
        return jsonify({'message': 'Post updated successfully'}), 200
    except Exception as e:
        return jsonify({'error': 'Failed to update post'}), 500

@app.route('/debug/giscus')
def debug_giscus():
    return jsonify({
        'giscus_config': app.config['GISCUS'],
        'debug_enabled': app.config.get('DEBUG_GISCUS', False),
        'current_url': request.url,
        'base_url': request.base_url,
        'path': request.path,
        'host': request.host,
        'scheme': request.scheme
    })

def get_site_stats():
    posts = get_posts()
    tags = get_tags()
    start_date = datetime(2024, 1, 1)
    days_running = (datetime.now() - start_date).days
    return {
        'post_count': len(posts),
        'tag_count': len(tags),
        'days_running': days_running
    }

@app.template_filter('format_date')
def format_date(date):
    if isinstance(date, str):
        try:
            date = datetime.strptime(date, '%Y-%m-%d')
        except ValueError:
            return date
    return date.strftime('%Y-%m-%d')

@app.route('/feed.xml')
def feed():
    posts = get_posts()
    
    feed = feedgenerator.Rss201rev2Feed(
        title="我的博客",
        link=request.url_root,
        description="我的个人博客RSS订阅",
        language="zh-cn",
        author_name="博客作者",
        feed_url=urljoin(request.url_root, url_for('feed')),
        image_url=urljoin(request.url_root, 'static/favicon.ico'),
        copyright=f"Copyright {datetime.now().year} 博客作者",
        ttl=60
    )

    for post in posts[:10]:
        pub_date = post['date']
        if isinstance(pub_date, str):
            try:
                pub_date = datetime.strptime(pub_date, '%Y-%m-%d')
            except ValueError:
                pub_date = datetime.now()
        
        post_url = urljoin(request.url_root, url_for('api_post', filename=post['filename']))
        
        feed.add_item(
            title=post['title'],
            link=post_url,
            description=post['summary'],
            pubdate=pub_date,
            categories=post.get('tags', [])
        )
    
    response = make_response(feed.writeString('utf-8'))
    response.headers['Content-Type'] = 'application/rss+xml; charset=utf-8'
    return response

@app.errorhandler(404)
def page_not_found(e):
    return jsonify({'error': 'Page not found'}), 404

@app.errorhandler(401)
def unauthorized_error(e):
    return jsonify({'error': 'Unauthorized access'}), 401

@app.errorhandler(403)
def forbidden_error(e):
    return jsonify({'error': 'Access forbidden'}), 403

@app.errorhandler(400)
def bad_request_error(e):
    return jsonify({'error': 'Bad request'}), 400

@app.errorhandler(500)
def internal_error(e):
    # 记录错误日志
    app.logger.error(f'Internal error: {str(e)}')
    # 在生产环境中不暴露详细错误信息
    if os.getenv('FLASK_ENV') == 'production':
        return jsonify({'error': 'Internal server error'}), 500
    else:
        # 开发环境中可以显示详细错误信息
        return jsonify({'error': f'Internal server error: {str(e)}'}), 500



if __name__ == '__main__':
    app.run(debug=True)
