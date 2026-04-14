import os
import random
import base64

import numpy as np
from flask import Flask, render_template, redirect, url_for
from flask_socketio import SocketIO, emit

app = Flask(__name__)
app.secret_key = os.environ.get('SECRET_KEY', 'signreader_secret_2024')
socketio = SocketIO(app, cors_allowed_origins='*', async_mode='eventlet')

# ── Topic configurations ──────────────────────────────────────────────────────
TOPIC_CONFIGS = [
    {
        'name': '問候語',
        'actions': ['Fighting', 'Yes', 'No'],
        'actions_chinese': ['加油', '是', '不是'],
        'model': './static/model/latest/Fighting, Yes, No.h5',
    },
    {
        'name': '住宿',
        'actions': ['WIFI', 'NoHave', 'lodging'],
        'actions_chinese': ['網際網路', '沒有', '住宿'],
        'model': './static/model/latest/lodging, NoHave,WIFI.h5',
    },
    {
        'name': '用餐',
        'actions': ['Noodles', 'Pig', 'Rice'],
        'actions_chinese': ['麵', '豬', '飯'],
        'model': './static/model/latest/Noodles,Pig,Rice.h5',
    },
    {
        'name': '居家',
        'actions': ['Light', 'Dish', 'Phone'],
        'actions_chinese': ['燈', '盤子', '手機'],
        'model': './static/model/latest/Light, Dish, Phone.h5',
    },
    {
        'name': '交通',
        'actions': ['right', 'Drive', 'Night'],
        'actions_chinese': ['右轉', '開車', '晚上'],
        'model': './static/model/latest/right, Drive, Night.h5',
    },
    {
        'name': '醫療',
        'actions': ['Medicine', 'Also', 'Check'],
        'actions_chinese': ['藥', '還有', '檢查'],
        'model': './static/model/latest/Medicine, Also, Check.h5',
    },
    {
        'name': '緊急',
        'actions': ['Contact', 'Now', 'Data'],
        'actions_chinese': ['聯絡', '現在', '資料'],
        'model': './static/model/latest/Contact, Now, Data.h5',
    },
    {
        'name': '購物',
        'actions': ['Money', 'Where', 'CreditCard'],
        'actions_chinese': ['錢', '哪裡', '信用卡'],
        'model': './static/model/latest/Money, Where, CreditCard.h5',
    },
]

# ── Per-connection state ──────────────────────────────────────────────────────
_recognizers = {}   # sid -> SignRecognizer
_states = {}        # sid -> {target_action, target_chinese, topic_index}


def _pick_random_word(topic_index):
    config = TOPIC_CONFIGS[topic_index]
    idx = random.randint(0, len(config['actions']) - 1)
    return config['actions'][idx], config['actions_chinese'][idx]


# ── HTTP routes ───────────────────────────────────────────────────────────────
@app.route('/')
def index():
    return render_template('page.html')


@app.route('/home.html')
def home():
    return render_template('home.html')


@app.route('/card.html')
def card():
    return render_template('card.html')


@app.route('/cardTest.html')
def cardTest():
    return render_template('cardTest.html')


@app.route('/page.html')
def page():
    return render_template('page.html')


@app.route('/book_upNav.html')
def book_upNav():
    return render_template('book_upNav.html')


@app.route('/recognize/<int:index>')
def recognize(index):
    if index < 0 or index >= len(TOPIC_CONFIGS):
        return redirect(url_for('cardTest'))
    config = TOPIC_CONFIGS[index]
    return render_template(
        'recognize.html',
        topic_index=index,
        topic_name=config['name'],
    )


# ── Socket.IO events ──────────────────────────────────────────────────────────
@socketio.on('connect')
def on_connect():
    print(f'[WS] connected: {_sid()}')


@socketio.on('start_recognition')
def on_start(data):
    from flask_socketio import request as ws_request
    sid = ws_request.sid
    topic_index = int(data.get('topic_index', 0))

    # Clean up previous recognizer for this connection
    if sid in _recognizers:
        _recognizers[sid].close()
        del _recognizers[sid]

    config = TOPIC_CONFIGS[topic_index]
    from utils import SignRecognizer
    rec = SignRecognizer(
        config['actions'],
        config['actions_chinese'],
        config['model'],
    )
    _recognizers[sid] = rec

    target_action, target_chinese = _pick_random_word(topic_index)
    _states[sid] = {
        'target_action': target_action,
        'target_chinese': target_chinese,
        'topic_index': topic_index,
    }

    emit('recognition_ready', _build_ready_payload(target_action, target_chinese))


@socketio.on('frame')
def on_frame(data):
    from flask_socketio import request as ws_request
    sid = ws_request.sid
    if sid not in _recognizers or sid not in _states:
        return

    rec = _recognizers[sid]
    state = _states[sid]

    try:
        frame_bytes = base64.b64decode(data['frame'])
        result = rec.process_frame(frame_bytes, state['target_action'])
        if result is None:
            return

        payload = {
            'predicted': result['predicted'],
            'confidence': result['confidence'],
            'frame_count': result['frame_count'],
            'success': result['success'],
            'target_action': state['target_action'],
            'target_chinese': state['target_chinese'],
            'target_image': f"/static/imgs/videosCover/{state['target_chinese']}.png",
            'show_video': f"/static/videos/showVideos/{state['target_chinese']}.mp4",
        }
        emit('prediction', payload)
    except Exception as e:
        print(f'[WS] frame error: {e}')


@socketio.on('next_word')
def on_next_word(_data):
    from flask_socketio import request as ws_request
    sid = ws_request.sid
    if sid not in _recognizers or sid not in _states:
        return

    _recognizers[sid].reset()
    state = _states[sid]
    target_action, target_chinese = _pick_random_word(state['topic_index'])
    state['target_action'] = target_action
    state['target_chinese'] = target_chinese

    emit('recognition_ready', _build_ready_payload(target_action, target_chinese))


@socketio.on('disconnect')
def on_disconnect():
    from flask_socketio import request as ws_request
    sid = ws_request.sid
    if sid in _recognizers:
        _recognizers[sid].close()
        del _recognizers[sid]
    _states.pop(sid, None)
    print(f'[WS] disconnected: {sid}')


# ── Helpers ───────────────────────────────────────────────────────────────────
def _sid():
    from flask_socketio import request as ws_request
    return ws_request.sid


def _build_ready_payload(target_action, target_chinese):
    return {
        'target_action': target_action,
        'target_chinese': target_chinese,
        'target_image': f'/static/imgs/videosCover/{target_chinese}.png',
    }


if __name__ == '__main__':
    port = int(os.environ.get('PORT', 5501))
    socketio.run(app, host='0.0.0.0', port=port, debug=False)
