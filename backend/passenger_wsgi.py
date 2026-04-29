import os
import sys

# Добавляем текущую директорию в путь поиска модулей
sys.path.insert(0, os.path.dirname(__file__))

from a2wsgi import ASGIMiddleware
from main import app

# Phusion Passenger ожидает переменную 'application'
# Оборачиваем FastAPI (ASGI) в WSGI
application = ASGIMiddleware(app)
