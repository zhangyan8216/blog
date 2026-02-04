from flask import Blueprint, request, jsonify
from functools import wraps
from datetime import datetime
import uuid
import bcrypt
from utils.jwt_utils import create_token, verify_token, token_required, admin_required

auth_bp = Blueprint('auth', __name__)

# 生成管理员密码哈希
ADMIN_PASSWORD_HASH = bcrypt.hashpw('admin123'.encode('utf-8'), bcrypt.gensalt()).decode('utf-8')

ADMIN_CREDENTIALS = {
    'username': 'admin',
    'password_hash': ADMIN_PASSWORD_HASH
}

users_db = {}

def init_users():
    """初始化用户数据库"""
    global users_db
    users_db = {
        'admin': {
            'id': '1',
            'username': 'admin',
            'password_hash': ADMIN_PASSWORD_HASH,
            'email': 'admin@example.com',
            'role': 'admin',
            'created_at': datetime.now().isoformat()
        }
    }

init_users()

def get_current_user():
    """获取当前登录用户"""
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
    
    return payload

@auth_bp.route('/api/auth/login', methods=['POST'])
def login():
    """用户登录API"""
    data = request.get_json()
    
    if not data:
        return jsonify({'error': 'No data provided'}), 400
    
    username = data.get('username')
    password = data.get('password')
    
    if not username or not password:
        return jsonify({'error': 'Username and password are required'}), 400
    
    user_id = str(uuid.uuid4())
    
    # 验证管理员账号
    if username == ADMIN_CREDENTIALS['username'] and bcrypt.checkpw(password.encode('utf-8'), ADMIN_CREDENTIALS['password_hash'].encode('utf-8')):
        admin_token = create_token(user_id, username, role='admin')
        return jsonify({
            'message': 'Login successful',
            'token': admin_token,
            'user': {
                'id': user_id,
                'username': username,
                'role': 'admin'
            }
        }), 200
    
    # 验证注册用户
    if username in users_db:
        user = users_db[username]
        if bcrypt.checkpw(password.encode('utf-8'), user['password_hash'].encode('utf-8')):
            user_token = create_token(user['id'], username, role=user['role'])
            return jsonify({
                'message': 'Login successful',
                'token': user_token,
                'user': {
                    'id': user['id'],
                    'username': user['username'],
                    'role': user['role']
                }
            }), 200
    
    return jsonify({'error': 'Invalid username or password'}), 401

@auth_bp.route('/api/auth/logout', methods=['POST'])
def logout():
    """用户登出API"""
    return jsonify({'message': 'Logout successful'}), 200

@auth_bp.route('/api/auth/me', methods=['GET'])
def me():
    """获取当前登录用户信息"""
    token = None
    
    if 'Authorization' in request.headers:
        auth_header = request.headers['Authorization']
        if auth_header.startswith('Bearer '):
            token = auth_header[7:]
    
    if not token:
        return jsonify({'error': 'Not authenticated'}), 401
    
    payload = verify_token(token)
    if not payload:
        return jsonify({'error': 'Invalid or expired token'}), 401
    
    return jsonify({
        'id': payload.get('user_id'),
        'username': payload.get('username'),
        'role': payload.get('role', 'user')
    }), 200

@auth_bp.route('/api/auth/check', methods=['GET'])
def check_auth():
    """检查用户是否已登录"""
    user = get_current_user()
    
    if user:
        return jsonify({
            'isAuthenticated': True,
            'user': {
                'id': user.get('user_id'),
                'username': user.get('username'),
                'role': user.get('role', 'user')
            }
        }), 200
    else:
        return jsonify({'isAuthenticated': False}), 200

@auth_bp.route('/api/auth/register', methods=['POST'])
def register():
    """用户注册API"""
    data = request.get_json()
    
    if not data:
        return jsonify({'error': 'No data provided'}), 400
    
    username = data.get('username')
    password = data.get('password')
    email = data.get('email')
    
    # 验证必填字段
    if not username or not password or not email:
        return jsonify({'error': 'All fields are required'}), 400
    
    # 检查用户是否已存在
    if username in users_db:
        return jsonify({'error': 'Username already exists'}), 400
    
    # 创建新用户
    user_id = str(uuid.uuid4())
    password_hash = bcrypt.hashpw(password.encode('utf-8'), bcrypt.gensalt()).decode('utf-8')
    users_db[username] = {
        'id': user_id,
        'username': username,
        'password_hash': password_hash,
        'email': email,
        'role': 'user',
        'created_at': datetime.now().isoformat()
    }
    
    return jsonify({
        'message': 'Registration successful',
        'user': {
            'id': user_id,
            'username': username,
            'email': email,
            'role': 'user'
        }
    }), 201

@auth_bp.route('/api/admin/users', methods=['GET'])
@admin_required
def get_users():
    """获取所有用户列表（管理员）"""
    users_list = []
    for username, user in users_db.items():
        users_list.append({
            'id': user['id'],
            'username': user['username'],
            'email': user['email'],
            'role': user['role'],
            'created_at': user['created_at']
        })
    return jsonify({'users': users_list}), 200

@auth_bp.route('/api/admin/users/<user_id>/role', methods=['PUT'])
@admin_required
def update_user_role(user_id):
    """修改用户角色（管理员）"""
    data = request.get_json()
    new_role = data.get('role')
    
    if not new_role or new_role not in ['admin', 'user']:
        return jsonify({'error': 'Invalid role'}), 400
    
    # 查找用户
    for username, user in users_db.items():
        if user['id'] == user_id:
            users_db[username]['role'] = new_role
            return jsonify({
                'message': 'User role updated successfully',
                'user': {
                    'id': user['id'],
                    'username': user['username'],
                    'role': new_role
                }
            }), 200
    
    return jsonify({'error': 'User not found'}), 404

@auth_bp.route('/api/admin/users/<user_id>', methods=['DELETE'])
@admin_required
def delete_user(user_id):
    """删除用户（管理员）"""
    # 不能删除自己
    current_user = get_current_user()
    if current_user and current_user.get('user_id') == user_id:
        return jsonify({'error': 'Cannot delete yourself'}), 400
    
    # 不能删除admin
    if user_id == '1':
        return jsonify({'error': 'Cannot delete admin'}), 400
    
    # 查找并删除用户
    for username, user in users_db.items():
        if user['id'] == user_id:
            del users_db[username]
            return jsonify({'message': 'User deleted successfully'}), 200
    
    return jsonify({'error': 'User not found'}), 404
