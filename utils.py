import numpy as np


class SignRecognizer:
    TARGET_FRAMES = 7

    def __init__(self, actions, actions_chinese, model_path):
        self.actions = np.array(actions)
        self.actions_chinese = np.array(actions_chinese)
        self.sequence = []
        self.frame_count = 0
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

    CONFIDENCE_THRESHOLD = 0.6

    def process_keypoints(self, keypoints, target_action):
        """
        Accept a flat list of 1662 keypoint values (extracted by MediaPipe JS in browser).
        Returns a dict with prediction info, or None if not enough frames yet.
        """
        kp = np.array(keypoints, dtype=np.float32)

        # Validate keypoint count
        if len(kp) != 1662:
            print(f'[WS] bad keypoint count: {len(kp)}, expected 1662')
            return None

        self.sequence.append(kp)
        self.sequence = self.sequence[-30:]

        if len(self.sequence) < 30:
            return None

        res = self.model.predict(np.expand_dims(self.sequence, axis=0), verbose=0)[0]
        predicted = self.actions[np.argmax(res)]
        confidence = float(np.max(res))

        # Debug: log first prediction to check distribution
        if self.frame_count == 0 and len(self.sequence) == 30:
            print(f'[LSTM] prediction: {dict(zip(self.actions.tolist(), [f"{p:.3f}" for p in res]))}')

        # Only count as match if confidence exceeds threshold
        if predicted == target_action and confidence >= self.CONFIDENCE_THRESHOLD:
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
