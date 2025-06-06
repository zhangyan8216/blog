from flask import Blueprint, render_template, redirect, url_for, flash, jsonify, request
from models import Theme
from extensions import db

theme_bp = Blueprint('theme', __name__)

@theme_bp.route('/themes')
def theme_list():
    themes = Theme.query.all()
    return render_template('themes/list.html', themes=themes)

@theme_bp.route('/theme/set/<int:theme_id>')
def set_theme(theme_id):
    # 取消所有主题的激活状态
    Theme.query.update({'is_active': False})
    db.session.commit()
    
    # 设置新主题为激活状态
    theme = Theme.query.get_or_404(theme_id)
    theme.is_active = True
    db.session.commit()
    
    flash(f'主题已切换为 {theme.name}', 'success')
    return redirect(url_for('theme.theme_list'))

@theme_bp.route('/api/theme', methods=['POST'])
def api_set_theme():
    data = request.get_json()
    if not data or 'theme' not in data:
        return jsonify({'error': 'Invalid request'}), 400
    
    try:
        # 取消所有主题的激活状态
        Theme.query.update({'is_active': False})
        
        # 设置新主题为激活状态
        theme = Theme.query.filter_by(name=data['theme']).first()
        if not theme:
            return jsonify({'error': 'Theme not found'}), 404
            
        theme.is_active = True
        db.session.commit()
        
        return jsonify({
            'success': True,
            'theme': theme.name,
            'message': f'主题已切换为 {theme.name}'
        })
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 500