# -*- coding: utf-8 -*-
from flask import Flask, jsonify
from flask_socketio import SocketIO, emit, join_room, leave_room
from flask_babel import Babel
import random
import string

app = Flask(__name__)
app.config['SECRET_KEY'] = 'love-heat-up-secret-2025'
app.config['BABEL_DEFAULT_LOCALE'] = 'zh_CN'
app.config['BABEL_TRANSLATION_DIRECTORIES'] = 'translations'

socketio = SocketIO(app, cors_allowed_origins="*", async_mode='eventlet')
babel = Babel(app)

# 房间管理 (简单字典存储，生产环境需要Redis/数据库)
rooms = {}

def generate_room_id():
    """生成6位随机房间号"""
    return ''.join(random.choices(string.ascii_uppercase + string.digits, k=6))

@app.route('/')
def index():
    return jsonify({
        'game': 'Love Heat Up',
        'version': '0.1.0',
        'status': 'Day 0 Setup Complete'
    })

@app.route('/api/create_room', methods=['POST'])
def create_room():
    """创建房间"""
    room_id = generate_room_id()
    rooms[room_id] = {
        'players': [],
        'game_state': None,
        'created_at': None
    }
    return jsonify({'room_id': room_id})

@socketio.on('connect')
def handle_connect():
    print('Client connected:', flush=True)
    emit('connected', {'message': '欢迎来到Love Heat Up!'})

@socketio.on('disconnect')
def handle_disconnect():
    print('Client disconnected', flush=True)

@socketio.on('join_room')
def on_join(data):
    """加入房间"""
    room_id = data['room_id']
    player_name = data.get('player_name', 'Guest')
    
    if room_id in rooms:
        join_room(room_id)
        rooms[room_id]['players'].append(player_name)
        emit('player_joined', {
            'player_name': player_name,
            'total_players': len(rooms[room_id]['players'])
        }, room=room_id)
        print(f'{player_name} joined room {room_id}', flush=True)
    else:
        emit('error', {'message': '房间不存在'})

if __name__ == '__main__':
    print('Love Heat Up Server Starting...', flush=True)
    print('Server running on http://localhost:5000', flush=True)
    socketio.run(app, debug=True, port=5000, host='0.0.0.0')
