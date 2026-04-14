import cv2
import numpy as np
from matplotlib import pyplot as plt
import mediapipe as mp
import sys
import os
sys.stdout.reconfigure(encoding='utf-8')

# 住宿
def load(actions, actionsChinese, model_name, random_integer):
    mp_holistic = mp.solutions.holistic # Holistic model
    mp_drawing = mp.solutions.drawing_utils # Drawing utilities

    def mediapipe_detection(image, model):
        image = cv2.cvtColor(image, cv2.COLOR_BGR2RGB) # COLOR CONVERSION BGR 2 RGB
        image.flags.writeable = False                  # Image is no longer writeable
        results = model.process(image)                 # Make prediction
        image.flags.writeable = True                   # Image is now writeable 
        image = cv2.cvtColor(image, cv2.COLOR_RGB2BGR) # COLOR COVERSION RGB 2 BGR
        return image, results

    def draw_landmarks(image, results):
        mp_drawing.draw_landmarks(image, results.face_landmarks, mp_holistic.FACEMESH_CONTOURS) # Draw face connections
        mp_drawing.draw_landmarks(image, results.pose_landmarks, mp_holistic.POSE_CONNECTIONS) # Draw pose connections
        mp_drawing.draw_landmarks(image, results.left_hand_landmarks, mp_holistic.HAND_CONNECTIONS) # Draw left hand connections
        mp_drawing.draw_landmarks(image, results.right_hand_landmarks, mp_holistic.HAND_CONNECTIONS) 

    # 更改面部顏色與線條
    def draw_styled_landmarks(image, results):
        # Draw face connections
    #     第一個錯誤：mp_holistic.FACE_CONNECTIONS 被改過名稱 => mp_holistic.FACEMESH_CONTOURS
        mp_drawing.draw_landmarks(image, results.face_landmarks, mp_holistic.FACEMESH_CONTOURS, 
                                mp_drawing.DrawingSpec(color=(80,110,10), thickness=1, circle_radius=1), 
                                mp_drawing.DrawingSpec(color=(80,256,121), thickness=1, circle_radius=1)
                                ) 
        # Draw pose connections
        mp_drawing.draw_landmarks(image, results.pose_landmarks, mp_holistic.POSE_CONNECTIONS,
                                mp_drawing.DrawingSpec(color=(80,22,10), thickness=2, circle_radius=4), 
                                mp_drawing.DrawingSpec(color=(80,44,121), thickness=2, circle_radius=2)
                                ) 
        # Draw left hand connections
        mp_drawing.draw_landmarks(image, results.left_hand_landmarks, mp_holistic.HAND_CONNECTIONS, 
                                mp_drawing.DrawingSpec(color=(121,22,76), thickness=2, circle_radius=4), 
                                mp_drawing.DrawingSpec(color=(121,44,250), thickness=2, circle_radius=2)
                                ) 
        # Draw right hand connections  
        mp_drawing.draw_landmarks(image, results.right_hand_landmarks, mp_holistic.HAND_CONNECTIONS, 
                                mp_drawing.DrawingSpec(color=(245,117,66), thickness=2, circle_radius=4), 
                                mp_drawing.DrawingSpec(color=(245,66,230), thickness=2, circle_radius=2)
                                ) 
        
    def extract_keypoints(results):
        pose = np.array([[res.x, res.y, res.z, res.visibility] for res in results.pose_landmarks.landmark]).flatten() if results.pose_landmarks else np.zeros(33*4)
        face = np.array([[res.x, res.y, res.z] for res in results.face_landmarks.landmark]).flatten() if results.face_landmarks else np.zeros(468*3)
        lh = np.array([[res.x, res.y, res.z] for res in results.left_hand_landmarks.landmark]).flatten() if results.left_hand_landmarks else np.zeros(21*3)
        rh = np.array([[res.x, res.y, res.z] for res in results.right_hand_landmarks.landmark]).flatten() if results.right_hand_landmarks else np.zeros(21*3)
        return np.concatenate([pose, face, lh, rh])

    # actions = np.array(['', '','','','','' ])
    # actions = np.array(["WIFI", 'NoHave', 'lodging'])
    # actionsChinese = np.array(["網際網路", '沒有', '住宿'])


    from keras.models import Sequential
    from keras.layers import Dense
    from keras.layers import LSTM
    from keras.layers import Dropout

    model = Sequential()
    model.add(LSTM(64, return_sequences=True, activation='relu', input_shape=(30,1662)))
    model.add(LSTM(128, return_sequences=True, activation='relu'))
    model.add(LSTM(64, return_sequences=False, activation='relu'))
    model.add(Dense(64, activation='relu'))
    model.add(Dense(32, activation='relu'))
    model.add(Dense(actions.shape[0], activation='softmax'))

    # model.load_weights('./static/model/latest/lodging, NoHave,WIFI.h5')
    model.load_weights(model_name)
    # C:\Users\chenJu\Downloads\SignReader網站v3.1\SignReader網站\static\model
    # model.load_weights('.\static\model\section.h5')
    from sklearn.metrics import multilabel_confusion_matrix, accuracy_score

    import random

    def generate_random_colors(n):
        colors = []
        for _ in range(n):
            # 生成随机颜色 (R, G, B)
            color = (random.randint(0, 255), random.randint(0, 255), random.randint(0, 255))
            colors.append(color)
        return colors

    # colors = [(245,117,16), (117,245,16), (16,117,245)]
    colors = generate_random_colors(len(actions))

    def prob_viz(res, actions, input_frame, colors):
        output_frame = input_frame.copy()
        
        for num, prob in enumerate(res):
            # 計算每個矩形的寬度，這樣它們就不會重疊
            rect_width = int(prob * 100) if int(prob * 100) > 0 else 1
            
            # 設置矩形的位置
            rect_start = (0, 60 + num * 40)
            rect_end = (rect_start[0] + rect_width, 90 + num * 40)
            
            # 確保 colors 列表的長度足夠大，以滿足索引需求
            if num < len(colors):
                # 繪製矩形
                cv2.rectangle(output_frame, rect_start, rect_end, colors[num], -1)
            else:
                # 如果索引超出 colors 列表範圍，可以使用默認顏色或進行其他處理
                cv2.rectangle(output_frame, rect_start, rect_end, (255, 255, 255), -1)
            
            # 設置文字位置
            text_position = (0, 85 + num * 40)
            
            # 繪製文字
            cv2.putText(output_frame, actions[num], text_position, cv2.FONT_HERSHEY_SIMPLEX, 1, (255, 255, 255), 2, cv2.LINE_AA)
            
        return output_frame

    # 1. 上面只會顯示某個動作 左邊會顯示所有的值 
    sequence = []
    # sentence = []
    # threshold = 0.8 
    
    target_action = actions[random_integer]  # 设置目标动作
    target_action_Chinese = actionsChinese[random_integer]
    target_frame_count = 7  # 达到多少帧表示识别成功
    frame_count = 0  # 添加一个变量来跟踪目标动作的帧数
    
    cap = cv2.VideoCapture(0)
    # Set mediapipe model 
    with mp_holistic.Holistic(min_detection_confidence=0.5, min_tracking_confidence=0.5) as holistic:
        frame_count = 0  # 计数器初始化为0
        sequence = []
        while cap.isOpened():

            # Read feed
            ret, frame = cap.read()

            # Make detections
            # Create/Open window
            cv2.namedWindow('OpenCV Feed', cv2.WINDOW_NORMAL)
            # Resize window
            cv2.resizeWindow('OpenCV Feed', 800, 600)
            cv2.setWindowProperty('OpenCV Feed', cv2.WND_PROP_TOPMOST, 1)


            image, results = mediapipe_detection(frame, holistic)
            print(results)

            # Draw landmarks
            draw_styled_landmarks(image, results)

            # 2. Prediction logic
            keypoints = extract_keypoints(results)
            sequence.append(keypoints)
            sequence = sequence[-30:]

    #         目前抽到的字為
    #         cv2.rectangle(image, (0, 150), (800, 50), (0, 255, 0), -1)
            cv2.putText(image, f'target word: {target_action}', (10, 30),
                        cv2.FONT_HERSHEY_SIMPLEX, 1, (0, 0, 0), 2, cv2.LINE_AA)
            
            if len(sequence) == 30:
                res = model.predict(np.expand_dims(sequence, axis=0))[0]
    #             print(actions[np.argmax(res)])
                print('frame_count: ',frame_count)
                print('actions: ',actions[np.argmax(res)])
                # 判断是否达到目标动作的帧数
                if actions[np.argmax(res)] == target_action:
                    frame_count += 1
                else:
                    frame_count = 0

                # 达到目标帧数后显示识别成功信息
                if frame_count >= target_frame_count:
                    print('Recognition Successful')
                    cv2.rectangle(image, (0, 0), (800, 40), (0, 0, 0), -1)
                    cv2.putText(image, 'Recognition Successful', (10, 30),
                                cv2.FONT_HERSHEY_SIMPLEX, 1, (255, 255, 255), 2, cv2.LINE_AA)
                    # Show to screen
                    cv2.imshow('OpenCV Feed', image)

                    # Wait for 2000 ms (2 seconds)
                    cv2.waitKey(2000)
                    frame_count = 0 # 待測試 24-08-27

                    cv2.destroyAllWindows()  # 关闭当前窗口

                    # 显示新窗口中的图片
                    image_path = os.path.join('static', 'imgs', 'videosCover', f'{target_action_Chinese}.png')
                    
                    print(f'Image path: {image_path}')  # 打印路径

                    if os.path.exists(image_path):
                        print('Image found.')  # 文件存在
                        new_image = cv2.imdecode(np.fromfile(image_path, dtype=np.uint8), cv2.IMREAD_COLOR)
                        # 显示新窗口中的图片
                        if new_image is not None:
                            print('Image loaded successfully.')  # 文件加载成功
                            # 創建一個可調整大小的視窗
                            cv2.namedWindow('New Window', cv2.WINDOW_NORMAL)

                            # 設定視窗的大小，例如 800x600
                            cv2.resizeWindow('New Window', 800, 600)
                            # 顯示在最上層
                            cv2.setWindowProperty('New Window', cv2.WND_PROP_TOPMOST, 1)
                            
                            cv2.imshow('New Window', new_image)
                            cv2.waitKey(1000)  # 显示1秒
                            # cv2.waitKey(0)  # 等待用户按键关闭窗口
                            cv2.destroyAllWindows()  # 关闭新窗口
                        else:
                            print('Failed to load image, no action taken.')
                    else:
                        print('Image not found, no action taken.')

                    break

            # Show to screen
            cv2.imshow('OpenCV Feed', image)

            # Break gracefully
            if cv2.waitKey(10) & 0xFF == ord('q'):
                
                # cap.release()
                cv2.destroyAllWindows()


                # 打开新的视频窗口播放指定路径的影片
                # video_path = os.path.join('static', 'videos', 'allVideos', f'{target_action}.mp4')  
                video_path = os.path.join('static', 'videos', 'showVideos', f'{target_action_Chinese}.mp4')  

                
                # 檢查影片是否存在
                if os.path.exists(video_path):
                    # 替换成你视频的实际路径
                    video_cap = cv2.VideoCapture(video_path)

                    # 创建一个可调整大小的窗口
                    cv2.namedWindow('review', cv2.WINDOW_NORMAL)

                    # 设置窗口的大小 (例如 800x600)
                    cv2.resizeWindow('review', 800, 600)
                    cv2.setWindowProperty('review', cv2.WND_PROP_TOPMOST, 1)

                    while video_cap.isOpened():
                        ret, frame = video_cap.read()
                        if not ret:
                            break
                        cv2.imshow('review', frame)

                        if cv2.waitKey(25) & 0xFF == ord('a'):
                            break
                    video_cap.release()
                    # 等待一秒
                    cv2.waitKey(500)
                    # 關閉第二個視窗
                    cv2.destroyWindow('review')

                break

        
        cap.release()
        cv2.destroyAllWindows()



