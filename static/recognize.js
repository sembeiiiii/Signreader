/* recognize.js — MediaPipe Holistic (browser) + Socket.IO LSTM prediction */

// ── DOM refs ─────────────────────────────────────────────────────────────────
const video      = document.getElementById('webcam');
const canvas     = document.getElementById('output-canvas');
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

let streaming = false;   // only send keypoints when server is ready

// ── 1. MediaPipe Holistic setup ──────────────────────────────────────────────
const holistic = new Holistic({
  locateFile: (file) => `https://cdn.jsdelivr.net/npm/@mediapipe/holistic/${file}`
});

holistic.setOptions({
  modelComplexity: 1,
  smoothLandmarks: true,
  minDetectionConfidence: 0.5,
  minTrackingConfidence: 0.5,
});

holistic.onResults(onResults);

// ── 2. Camera setup (getUserMedia via @mediapipe/camera_utils) ───────────────
const camera = new Camera(video, {
  onFrame: async () => {
    await holistic.send({ image: video });
  },
  width: 640,
  height: 480,
});

// Start camera immediately — MediaPipe WASM loads on first frame
camera.start().then(() => {
  console.log('Camera started');
}).catch((err) => {
  console.error('Camera error:', err);
  setStatus('無法開啟攝影機：' + err.message, 'status-wrong');
});

// ── 3. Socket.IO ─────────────────────────────────────────────────────────────
const socket = io({ transports: ['websocket', 'polling'] });

socket.on('connect', () => {
  console.log('WS connected, starting recognition for topic', TOPIC_INDEX);
  setStatus('連線伺服器中…', 'status-loading');
  socket.emit('start_recognition', { topic_index: TOPIC_INDEX });
});

socket.on('recognition_ready', (data) => {
  targetZh.textContent = data.target_chinese;
  targetEn.textContent = data.target_action;
  resetProgress();
  streaming = true;
  setStatus('請開始比手語', 'status-ready');
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
    setStatus('比對中…', 'status-ready');
  }

  predText.textContent = `${data.predicted} (${(data.confidence * 100).toFixed(0)}%)`;

  // Probability bars
  renderProbBars(data.probs, data.target_action);

  // Success
  if (data.success) {
    streaming = false;
    showSuccess(data.target_chinese, data.target_image);
  }
});

socket.on('disconnect', () => {
  streaming = false;
  setStatus('連線中斷，請重新整理頁面', 'status-wrong');
});

// ── 4. MediaPipe onResults — draw skeleton + send keypoints ──────────────────
function onResults(results) {
  // Draw camera image + skeleton on canvas
  canvas.width  = results.image.width;
  canvas.height = results.image.height;

  ctx.save();
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  ctx.drawImage(results.image, 0, 0, canvas.width, canvas.height);

  // Face mesh contours (matching original Python colors, BGR→RGB)
  if (results.faceLandmarks) {
    drawConnectors(ctx, results.faceLandmarks, FACEMESH_CONTOURS, {
      color: '#79FF50', lineWidth: 1
    });
  }

  // Pose connections
  if (results.poseLandmarks) {
    drawConnectors(ctx, results.poseLandmarks, POSE_CONNECTIONS, {
      color: '#792C50', lineWidth: 2
    });
    drawLandmarks(ctx, results.poseLandmarks, {
      color: '#0A1650', fillColor: '#0A1650', lineWidth: 2, radius: 3
    });
  }

  // Left hand
  if (results.leftHandLandmarks) {
    drawConnectors(ctx, results.leftHandLandmarks, HAND_CONNECTIONS, {
      color: '#FA2C79', lineWidth: 2
    });
    drawLandmarks(ctx, results.leftHandLandmarks, {
      color: '#4C1679', fillColor: '#4C1679', lineWidth: 2, radius: 3
    });
  }

  // Right hand
  if (results.rightHandLandmarks) {
    drawConnectors(ctx, results.rightHandLandmarks, HAND_CONNECTIONS, {
      color: '#E642F5', lineWidth: 2
    });
    drawLandmarks(ctx, results.rightHandLandmarks, {
      color: '#4275F5', fillColor: '#4275F5', lineWidth: 2, radius: 3
    });
  }

  ctx.restore();

  // Send keypoints to server for LSTM prediction
  if (streaming) {
    const keypoints = extractKeypoints(results);
    socket.emit('keypoints', { keypoints: keypoints });
  }
}

// ── 5. Keypoint extraction (must match Python: pose+face+lh+rh = 1662) ──────
function extractKeypoints(results) {
  // pose: 33 landmarks * 4 (x, y, z, visibility) = 132
  const pose = results.poseLandmarks
    ? results.poseLandmarks.flatMap(l => [l.x, l.y, l.z, l.visibility || 0])
    : new Array(33 * 4).fill(0);

  // face: 468 landmarks * 3 (x, y, z) = 1404
  const face = results.faceLandmarks
    ? results.faceLandmarks.flatMap(l => [l.x, l.y, l.z])
    : new Array(468 * 3).fill(0);

  // left hand: 21 landmarks * 3 (x, y, z) = 63
  const lh = results.leftHandLandmarks
    ? results.leftHandLandmarks.flatMap(l => [l.x, l.y, l.z])
    : new Array(21 * 3).fill(0);

  // right hand: 21 landmarks * 3 (x, y, z) = 63
  const rh = results.rightHandLandmarks
    ? results.rightHandLandmarks.flatMap(l => [l.x, l.y, l.z])
    : new Array(21 * 3).fill(0);

  // Total: 132 + 1404 + 63 + 63 = 1662
  return [...pose, ...face, ...lh, ...rh];
}

// ── 6. UI helpers ────────────────────────────────────────────────────────────
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

// ── 7. Next word ─────────────────────────────────────────────────────────────
function nextWord() {
  overlay.classList.remove('show');
  resetProgress();
  setStatus('準備下一個單字…', 'status-loading');
  socket.emit('next_word', {});
}
