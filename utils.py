import cv2
import numpy as np
import mediapipe as mp


class SignRecognizer:
    TARGET_FRAMES = 7

    def __init__(self, actions, actions_chinese, model_path):
        self.actions = np.array(actions)
        self.actions_chinese = np.array(actions_chinese)
        self.sequence = []
        self.frame_count = 0

        self.mp_holistic = mp.solutions.holistic
        self.holistic = self.mp_holistic.Holistic(
            min_detection_confidence=0.5,
            min_tracking_confidence=0.5,
            static_image_mode=False,
        )
        self._build_model(model_path)

    def _build_model(self, model_path):
        from tensorflow.keras.models import Sequential
        from tensorflow.keras.layers import LSTM, Dense

        model = Sequential()
        model.add(LSTM(64, return_sequences=True, activation='relu', input_shape=(30, 1662)))
        model.add(LSTM(128, return_sequences=True, activation='relu'))
        model.add(LSTM(64, return_sequences=False, activation='relu'))
        model.add(Dense(64, activation='relu'))
        model.add(Dense(32, activation='relu'))
        model.add(Dense(len(self.actions), activation='softmax'))
        model.load_weights(model_path)
        self.model = model

    def _extract_keypoints(self, results):
        pose = (
            np.array([[r.x, r.y, r.z, r.visibility] for r in results.pose_landmarks.landmark]).flatten()
            if results.pose_landmarks else np.zeros(33 * 4)
        )
        face = (
            np.array([[r.x, r.y, r.z] for r in results.face_landmarks.landmark]).flatten()
            if results.face_landmarks else np.zeros(468 * 3)
        )
        lh = (
            np.array([[r.x, r.y, r.z] for r in results.left_hand_landmarks.landmark]).flatten()
            if results.left_hand_landmarks else np.zeros(21 * 3)
        )
        rh = (
            np.array([[r.x, r.y, r.z] for r in results.right_hand_landmarks.landmark]).flatten()
            if results.right_hand_landmarks else np.zeros(21 * 3)
        )
        return np.concatenate([pose, face, lh, rh])

    def process_frame(self, frame_bytes, target_action):
        """
        Accept a JPEG frame as bytes, run MediaPipe + LSTM.
        Returns a dict with prediction info, or None if not enough frames yet.
        """
        nparr = np.frombuffer(frame_bytes, np.uint8)
        frame = cv2.imdecode(nparr, cv2.IMREAD_COLOR)
        if frame is None:
            return None

        img_rgb = cv2.cvtColor(frame, cv2.COLOR_BGR2RGB)
        img_rgb.flags.writeable = False
        results = self.holistic.process(img_rgb)
        img_rgb.flags.writeable = True

        keypoints = self._extract_keypoints(results)
        self.sequence.append(keypoints)
        self.sequence = self.sequence[-30:]

        if len(self.sequence) < 30:
            return None

        res = self.model.predict(np.expand_dims(self.sequence, axis=0), verbose=0)[0]
        predicted = self.actions[np.argmax(res)]
        confidence = float(np.max(res))

        if predicted == target_action:
            self.frame_count += 1
        else:
            self.frame_count = 0

        return {
            'predicted': predicted,
            'confidence': confidence,
            'frame_count': self.frame_count,
            'success': self.frame_count >= self.TARGET_FRAMES,
            'probs': {a: float(p) for a, p in zip(self.actions, res)},
        }

    def reset(self):
        self.sequence = []
        self.frame_count = 0

    def close(self):
        self.holistic.close()
