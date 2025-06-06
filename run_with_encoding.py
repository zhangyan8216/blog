#!/usr/bin/env python
# 确保应用使用UTF-8编码启动
import os
import sys
import locale

# 设置环境变量
os.environ['PYTHONIOENCODING'] = 'utf-8'
os.environ['LC_ALL'] = 'en_US.UTF-8'

# 配置编码
if sys.version_info[0] < 3:
    reload(sys)
    sys.setdefaultencoding('utf8')
else:
    locale.setlocale(locale.LC_ALL, 'en_US.UTF-8')

# 启动应用
from app import app
app.run(host='0.0.0.0', port=5000)