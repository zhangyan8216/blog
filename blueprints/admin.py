from flask import Blueprint, render_template, request, redirect, url_for, flash
from blueprints.auth import login_required
from forms import PostForm
from werkzeug.utils import secure_filename
import os
from datetime import datetime
from extensions import db
from models import Post

admin_bp = Blueprint('admin', __name__, url_prefix='/admin')

@admin_bp.context_processor
def inject_current_theme():
    from models import Theme
    current_theme = Theme.query.filter_by(is_active=True).first()
    return dict(current_theme=current_theme)

# 后台首页
@admin_bp.route('/')
@login_required
def dashboard():
    return render_template('admin/dashboard.html')

# 文章管理
@admin_bp.route('/posts')
@login_required
def post_list():
    posts = Post.query.order_by(Post.created_at.desc()).all()
    return render_template('admin/post_list.html', posts=posts)

@admin_bp.route('/posts/create', methods=['GET', 'POST'])
@login_required
def create_post():
    form = PostForm()
    if form.validate_on_submit():
        new_post = Post(
            title=form.title.data,
            content=form.content.data,
            excerpt=form.content.data[:100] + '...' if len(form.content.data) > 100 else form.content.data,
            created_at=datetime.now()
        )
        
        db.session.add(new_post)
        db.session.commit()
        flash('文章创建成功', 'success')
        return redirect(url_for('admin.post_list'))
    
    return render_template('admin/post_form.html', form=form)

@admin_bp.route('/posts/<int:id>/edit', methods=['GET', 'POST'])
@login_required
def edit_post(id):
    post = Post.query.get_or_404(id)
    form = PostForm(obj=post)
    
    if form.validate_on_submit():
        form.populate_obj(post)
        post.excerpt = post.content[:100] + '...' if len(post.content) > 100 else post.content
        post.updated_at = datetime.now()
        
        db.session.commit()
        flash('文章更新成功', 'success')
        return redirect(url_for('admin.post_list'))
    
    return render_template('admin/post_form.html', form=form, post=post)

@admin_bp.route('/posts/<int:id>/delete', methods=['POST'])
@login_required
def delete_post(id):
    post = Post.query.get_or_404(id)
    db.session.delete(post)
    db.session.commit()
    flash('文章删除成功', 'success')
    return redirect(url_for('admin.post_list'))

# 主题管理
@admin_bp.route('/themes')
@login_required
def theme_list():
    try:
        themes = os.listdir('static/themes')
    except FileNotFoundError:
        os.makedirs('static/themes', exist_ok=True)
        # 创建默认主题
        default_themes = ['light', 'dark']
        for theme in default_themes:
            theme_dir = os.path.join('static/themes', theme)
            os.makedirs(theme_dir, exist_ok=True)
            with open(os.path.join(theme_dir, 'style.css'), 'w') as f:
                f.write(f'/* {theme} theme styles */')
        themes = default_themes
    return render_template('admin/theme_list.html', themes=themes)

@admin_bp.route('/themes/activate/<name>')
@login_required
def activate_theme(name):
    themes = os.listdir('static/themes')
    if name not in themes:
        flash('主题不存在', 'error')
        return redirect(url_for('admin.theme_list'))
    
    try:
        # 更新当前主题到数据库
        from models import Theme, db
        # 先取消所有主题的激活状态
        Theme.query.update({'is_active': False})
        # 查找或创建当前主题
        current_theme = Theme.query.filter_by(name=name).first()
        if not current_theme:
            current_theme = Theme(
                name=name,
                css_file=f'/static/themes/{name}/style.css',
                is_active=True,
                description=f'{name} theme'
            )
            db.session.add(current_theme)
        else:
            current_theme.is_active = True
            current_theme.css_file = f'/static/themes/{name}/style.css'
        db.session.commit()
        
        flash(f'主题 {name} 已激活', 'success')
    except Exception as e:
        db.session.rollback()
        flash('主题切换失败', 'error')
    
    return redirect(url_for('admin.theme_list'))