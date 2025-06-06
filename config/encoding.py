# 编码配置设置
import sys
import locale

def configure_encoding():
    """配置应用默认编码为UTF-8"""
    # 设置系统默认编码
    if sys.version_info[0] < 3:
        reload(sys)
        sys.setdefaultencoding('utf8')
    else:
        locale.setlocale(locale.LC_ALL, 'en_US.UTF-8')
    
    # 确保标准流使用UTF-8
    sys.stdin = open(sys.stdin.fileno(), 'r', encoding='utf-8', buffering=1)
    sys.stdout = open(sys.stdout.fileno(), 'w', encoding='utf-8', buffering=1)
    sys.stderr = open(sys.stderr.fileno(), 'w', encoding='utf-8', buffering=1)

# 自动配置
configure_encoding()