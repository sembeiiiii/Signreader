# SignReader — AI 手語辨識的跨領域創新應用

<p align="center">
  <img src="static/imgs/logo-no-background.png" alt="SignReader Logo" width="280">
</p>

<p align="center">
  <strong>即時手語辨識 · 互動學習 · 無障礙溝通</strong>
</p>

---

## Demo Site

> **線上體驗**：[https://signreader.onrender.com](https://signreader.onrender.com)
>
> *(需要攝影機權限以使用手語辨識功能)*

---

## 專案簡介

**SignReader** 是一套結合 **AI 影像辨識** 與 **互動式學習** 的台灣手語學習系統，透過「影像辨識模組」與「手語影片模組」，為聽障兒童及其周遭利害關係人（家長、教師、同儕）提供即時、有趣且有效的手語學習體驗。

與教育部現有手語學習系統相比，SignReader 在 **使用者滿意度（4.26 vs. 3.51）** 與 **系統品質（4.31 vs. 3.68）** 上均顯著優於傳統學習方式。

---

## 針對對象

| 對象 | 說明 |
|------|------|
| **聽障兒童（2–10 歲）** | 系統的主要使用者，透過互動式練習學習手語 |
| **家長** | 與孩子一同學習手語，建立家庭溝通橋樑 |
| **教師** | 輔助課堂教學，追蹤學生學習進度 |
| **一般使用者** | 任何想學習台灣手語的人 |

---

## 解決的問題與痛點

### 1. 學習模式僵化
現有手語學習平台多採用被動觀看示範影片的方式，缺乏互動練習與即時回饋，導致學習者無法確認自身動作是否正確。

### 2. 缺乏生活情境連結
傳統學習內容與日常生活脫節，學習者難以在真實場景中應用所學。

### 3. 翻譯服務匱乏
聽障家庭在日常溝通中往往缺乏即時的翻譯支援，增加了溝通障礙。

### 4. 周遭關係人參與不足
家長、教師等關鍵人物缺乏便利的手語學習工具，無法有效與聽障兒童互動。

---

## 解決方法

### 核心技術架構

```
攝影機輸入 → MediaPipe Holistic（擷取 543 個人體關鍵點）
                    ↓
            手部特徵提取（左右手各 21 個節點）
                    ↓
            LSTM 深度學習模型（時間序列辨識）
                    ↓
            即時手語辨識結果 + 回饋
```

### 三大核心功能模組

#### 1. 情境練習模組
涵蓋 **八大生活主題**，提供貼近日常的手語學習內容：

| 主題 | 手語詞彙 |
|------|----------|
| 問候語 | 加油、是、不是 |
| 住宿 | 網際網路、沒有、住宿 |
| 用餐 | 麵、豬、飯 |
| 居家 | 燈、盤子、手機 |
| 交通 | 右轉、開車、晚上 |
| 醫療 | 藥、還有、檢查 |
| 溝通 | 聯絡、現在、資料 |
| 購物 | 錢、哪裡、信用卡 |

#### 2. 即時辨識模組
透過 MediaPipe Holistic 擷取使用者手部關鍵點，結合 LSTM 模型進行動作辨識，即時提供動作準確度回饋與修正建議。

#### 3. 電子詞彙語句功能
使用者可透過點擊文字組件組合語句，系統即時轉換為對應的手語影片，幫助聽障家庭進行日常溝通。

### 理論基礎

- **Fogg 行為模型** — 透過動機（Motivation）、能力（Ability）、觸發點（Trigger）三要素促進學習行為改變
- **經驗學習法（Experiential Learning）** — 從具體經驗 → 反思觀察 → 抽象概念化 → 主動實驗的四階段學習循環
- **個體環境理論** — 關注聽障兒童與家庭、學校、社會環境的互動關係

---

## 技術架構

### 前端
- **HTML / CSS / JavaScript**
- **Bootstrap 5** — 響應式排版
- **Vue.js** — 動態互動元件

### 後端
- **Python / Flask** — Web 伺服器與 API
- **MediaPipe Holistic** — 人體姿態、臉部、手部 543 個關鍵點擷取
- **Keras / TensorFlow（LSTM）** — 深度學習手語辨識模型
- **OpenCV** — 即時影像處理

### 模型架構
```
LSTM(64, return_sequences=True)
  → LSTM(128, return_sequences=True)
    → LSTM(64, return_sequences=False)
      → Dense(64) → Dense(32) → Dense(N, softmax)
```
每個動作以 **30 幀影像** 作為一組時間序列輸入，模型透過學習手部動作的時間變化規律進行辨識。

---

## 快速開始

### 環境需求
- Python 3.10+
- 攝影機裝置

### 安裝與執行

```bash
# 1. Clone 專案
git clone https://github.com/sembeiiiii/Signreader.git
cd Signreader

# 2. 安裝 Python 套件
pip install -r requirements.txt

# 3. 啟動伺服器
python app.py
```

伺服器啟動後，開啟瀏覽器前往 `http://localhost:5500` 即可使用。

---

## 專案結構

```
SignReader/
├── app.py                  # Flask 主應用程式
├── utils.py                # 手語辨識核心邏輯（MediaPipe + LSTM）
├── rec0.py ~ rec7.py       # 八大主題辨識模組
├── requirements.txt        # Python 套件依賴
├── Dockerfile              # Docker 部署設定
├── templates/              # HTML 頁面模板
│   ├── page.html           # 首頁
│   ├── home.html           # 主選單
│   ├── card.html           # 主題卡片
│   └── cardTest.html       # 辨識測驗頁面
├── static/
│   ├── imgs/               # 圖片資源
│   ├── videos/             # 手語教學影片
│   ├── model/latest/       # LSTM 預訓練模型（.h5）
│   ├── *.js                # 前端 JavaScript
│   └── bootstrap.min.*     # Bootstrap 框架
└── gensen-font-master/     # 中文字型
```

---

## 團隊成員

| 姓名 | 角色 |
|------|------|
| 陳柏丞 | 專題組長 |
| 周宸偉 | 專題組員 |
| 吳冠宇 | 專題組員 |
| 葉品瑄 | 專題組員 |
| 周佳潔 | 專題組員 |
| 蔡宇宸 | 專題組員 |

**指導教師**：國立台中科技大學

---

## 授權

本專案僅供學術研究與教育用途。
