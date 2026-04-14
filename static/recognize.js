/* recognize.js — MediaPipe Holistic (browser) + Socket.IO LSTM prediction */

// ── DOM refs ─────────────────────────────────────────────────────────────────
const video      = document.getElementById('webcam');
const canvas     = document.getElementById('output-canvas');
const ctx        = canvas.getContext('2d');
const statusPill = document.getElementById('status-pill');
const predText   = document.getElementById('pred-text');
const targetZh   = document.getElementById('target-zh');
const targetEn   = document.getElementById('target-en');
const targetImg  = document.getElementById('target-img');
const btnHint    = document.getElementById('btn-show-hint');
const hintWrap   = document.getElementById('hint-video-wrap');
const hintVideo  = document.getElementById('hint-video');
const wrongFb    = document.getElementById('wrong-feedback');
const wrongText  = document.getElementById('wrong-text');
const progBar    = document.getElementById('prog-bar');
const progCount  = document.getElementById('prog-count');
const probBars   = document.getElementById('prob-bars');
const overlay    = document.getElementById('success-overlay');
const sWord      = document.getElementById('s-word');
const sImg       = document.getElementById('s-img');

let streaming = false;
let currentShowVideo = '';  // path to demo video for current target
let lastSendTime = 0;
const SEND_INTERVAL = 150;  // ms between keypoint sends (~6-7 FPS to server)

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

  // Show reference image
  targetImg.src = data.target_image;
  targetImg.style.display = 'block';
  targetImg.onerror = () => { targetImg.style.display = 'none'; };

  // Store demo video path
  currentShowVideo = data.show_video || '';
  btnHint.style.display = currentShowVideo ? 'inline-block' : 'none';
  hintWrap.style.display = 'none';

  // Reset
  wrongFb.style.display = 'none';
  resetProgress();
  streaming = true;
  setStatus('請開始比手語', 'status-ready');
});

socket.on('prediction', (data) => {
  // Update progress
  const pct = Math.min((data.frame_count / 7) * 100, 100);
  progBar.style.width  = pct + '%';
  progCount.textContent = data.frame_count;

  // Status pill + wrong sign feedback
  if (data.predicted === data.target_action) {
    setStatus(`✓ 辨識到：${data.target_chinese}`, 'status-detected');
    wrongFb.style.display = 'none';
  } else {
    const predZh = data.predicted_chinese || data.predicted;
    setStatus(`✗ 你比的是「${predZh}」`, 'status-wrong');
    wrongText.innerHTML = `你比的是「<b>${predZh}</b>」，目標是「<b>${data.target_chinese}</b>」<br><span style="font-size:0.8rem; color:#888;">請參考上方圖片調整手勢</span>`;
    wrongFb.style.display = 'block';
  }

  predText.textContent = `${data.predicted} (${(data.confidence * 100).toFixed(0)}%)`;

  // Probability bars
  renderProbBars(data.probs, data.target_action);

  // Success
  if (data.success) {
    streaming = false;
    wrongFb.style.display = 'none';
    showSuccess(data.target_chinese, data.target_image);
  }
});

socket.on('disconnect', () => {
  streaming = false;
  setStatus('連線中斷，請重新整理頁面', 'status-wrong');
});

// ── 4. MediaPipe onResults — draw skeleton + send keypoints ──────────────────
function onResults(results) {
  canvas.width  = results.image.width;
  canvas.height = results.image.height;

  ctx.save();
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  ctx.drawImage(results.image, 0, 0, canvas.width, canvas.height);

  // Face mesh contours
  if (results.faceLandmarks) {
    drawConnectors(ctx, results.faceLandmarks, FACEMESH_CONTOURS, {
      color: '#79FF50', lineWidth: 1
    });
  }

  // Pose
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

  if (streaming) {
    // Throttle: only send keypoints at ~6-7 FPS to reduce server load
    const now = Date.now();
    if (now - lastSendTime < SEND_INTERVAL) return;
    lastSendTime = now;

    const keypoints = extractKeypoints(results);
    socket.emit('keypoints', { keypoints: keypoints });
  }
}

// ── 5. Keypoint extraction (must match Python: pose+face+lh+rh = 1662) ──────
function extractKeypoints(results) {
  const pose = results.poseLandmarks
    ? results.poseLandmarks.flatMap(l => [l.x, l.y, l.z, l.visibility || 0])
    : new Array(33 * 4).fill(0);

  const face = results.faceLandmarks
    ? results.faceLandmarks.flatMap(l => [l.x, l.y, l.z])
    : new Array(468 * 3).fill(0);

  const lh = results.leftHandLandmarks
    ? results.leftHandLandmarks.flatMap(l => [l.x, l.y, l.z])
    : new Array(21 * 3).fill(0);

  const rh = results.rightHandLandmarks
    ? results.rightHandLandmarks.flatMap(l => [l.x, l.y, l.z])
    : new Array(21 * 3).fill(0);

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

// ── 7. Hint video toggle ─────────────────────────────────────────────────────
function toggleHintVideo() {
  if (hintWrap.style.display === 'none') {
    hintVideo.src = currentShowVideo;
    hintWrap.style.display = 'block';
    btnHint.textContent = '收起示範影片';
  } else {
    hintVideo.pause();
    hintVideo.src = '';
    hintWrap.style.display = 'none';
    btnHint.textContent = '查看示範影片';
  }
}

// ── 8. Next word ─────────────────────────────────────────────────────────────
function nextWord() {
  overlay.classList.remove('show');
  hintWrap.style.display = 'none';
  hintVideo.pause();
  hintVideo.src = '';
  wrongFb.style.display = 'none';
  resetProgress();
  setStatus('準備下一個單字…', 'status-loading');
  socket.emit('next_word', {});
}
