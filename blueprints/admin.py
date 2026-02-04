from flask import Blueprint, jsonify

admin_bp = Blueprint('admin', __name__, url_prefix='/admin')

@admin_bp.route('/stats')
def get_stats():
    """获取后台统计数据"""
    return jsonify({
        'posts': 128,
        'categories': 32,
        'tags': 64,
        'users': 10
    })
