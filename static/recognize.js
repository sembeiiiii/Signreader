/* recognize.js — webcam capture + Socket.IO recognition client */

const socket = io({ transports: ['websocket', 'polling'] });

// DOM refs
const video      = document.getElementById('webcam');
const canvas     = document.getElementById('canvas');
const ctx        = canvas.getContext('2d');
const statusPill = document.getElementById('status-pill');
const predText   = document.getElementById('pred-text');
const targetZh   = document.getElementById('target-zh');
const targetEn   = document.getElementById('target-en');
const progBar    = document.getElementById('prog-bar');
const progCount  = document.getElementById('prog-count');
const probBars   = document.getElementById('prob-bars');
const overlay    = document.getElementById('success-overlay');
const sWord      = document.getElementById('s-word');
const sImg       = document.getElementById('s-img');

let streaming   = false;
let frameTimer  = null;
const FPS       = 8;   // frames per second sent to server

// ── 1. Start webcam ──────────────────────────────────────────────────────────
async function startCamera() {
  try {
    const stream = await navigator.mediaDevices.getUserMedia({
      video: { width: 640, height: 480, facingMode: 'user' },
      audio: false,
    });
    video.srcObject = stream;
    video.onloadedmetadata = () => {
      canvas.width  = video.videoWidth;
      canvas.height = video.videoHeight;
    };
  } catch (err) {
    setStatus('無法開啟攝影機：' + err.message, 'status-wrong');
  }
}

// ── 2. Socket events ─────────────────────────────────────────────────────────
socket.on('connect', () => {
  console.log('WS connected, starting recognition for topic', TOPIC_INDEX);
  setStatus('載入模型中…', 'status-loading');
  socket.emit('start_recognition', { topic_index: TOPIC_INDEX });
});

socket.on('recognition_ready', (data) => {
  targetZh.textContent = data.target_chinese;
  targetEn.textContent = data.target_action;
  resetProgress();
  setStatus('請開始比手語', 'status-ready');
  if (!streaming) startStreaming();
});

socket.on('prediction', (data) => {
  // Update progress
  const pct = Math.min((data.frame_count / 7) * 100, 100);
  progBar.style.width  = pct + '%';
  progCount.textContent = data.frame_count;

  // Status pill
  if (data.predicted === data.target_action) {
    setStatus(`✓ 辨識到：${data.target_chinese}`, 'status-detected');
  } else {
    setStatus(`比對中…`, 'status-ready');
  }

  predText.textContent = `${data.predicted} (${(data.confidence * 100).toFixed(0)}%)`;

  // Probability bars
  renderProbBars(data.probs, data.target_action);

  // Success
  if (data.success) {
    stopStreaming();
    showSuccess(data.target_chinese, data.target_image);
  }
});

socket.on('disconnect', () => {
  stopStreaming();
  setStatus('連線中斷，請重新整理頁面', 'status-wrong');
});

// ── 3. Frame streaming ───────────────────────────────────────────────────────
function startStreaming() {
  streaming = true;
  frameTimer = setInterval(sendFrame, 1000 / FPS);
}

function stopStreaming() {
  streaming = false;
  clearInterval(frameTimer);
  frameTimer = null;
}

function sendFrame() {
  if (!streaming || video.readyState < 2) return;
  ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
  const b64 = canvas.toDataURL('image/jpeg', 0.7).split(',')[1];
  socket.emit('frame', { frame: b64 });
}

// ── 4. UI helpers ─────────────────────────────────────────────────────────────
function setStatus(text, cls) {
  statusPill.textContent = text;
  statusPill.className   = 'status-pill ' + cls;
}

function resetProgress() {
  progBar.style.width   = '0%';
  progCount.textContent = '0';
  predText.textContent  = '';
  probBars.innerHTML    = '';
}

function renderProbBars(probs, targetAction) {
  if (!probs) return;
  probBars.innerHTML = Object.entries(probs)
    .sort((a, b) => b[1] - a[1])
    .map(([action, prob]) => {
      const pct    = (prob * 100).toFixed(1);
      const active = action === targetAction ? 'active' : '';
      return `
        <div class="prob-bar-wrap">
          <div class="d-flex justify-content-between mb-1">
            <span>${action}</span><span>${pct}%</span>
          </div>
          <div class="prob-bar-bg">
            <div class="prob-bar-fill ${active}" style="width:${pct}%"></div>
          </div>
        </div>`;
    }).join('');
}

function showSuccess(chinese, imgPath) {
  sWord.textContent = chinese;
  sImg.src          = imgPath;
  sImg.style.display = 'block';
  overlay.classList.add('show');
}

// ── 5. Next word ──────────────────────────────────────────────────────────────
function nextWord() {
  overlay.classList.remove('show');
  resetProgress();
  setStatus('準備下一個單字…', 'status-loading');
  socket.emit('next_word', {});
}

// ── Init ──────────────────────────────────────────────────────────────────────
startCamera();
