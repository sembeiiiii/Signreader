//select btn frame
Vue.createApp({
  data() {
    return {
      showVideo: false,
      message: [],
      // videoAddress: "",
      videoList: [],
      currentVideoIndex: 0,
      rightBarTextArray: [
        "問候語",
        "住宿",
        "用餐",
        "居家",
        "交通",
        "醫療",
        "緊急",
        "購物",
      ],
      button1Arrays: {
        btnArray1_S: ["你", "我", "他"],
        btnArray1_V: ["加油", "恭喜", "詢問"],
        btnArray1_N: ["小姐", "先生"],
        btnArray1_A: ["吃飽了"],
        btnArray1_F: [
          "謝謝",
          "對不起",
          "沒關係",
          "不客氣",
          "是",
          "不是",
          "你好 ",
          "再見",
        ],
      },
      button2Arrays: {
        btnArray2_S: ["你", "我", "他", "自己"],
        btnArray2_V: ["需要", "服務", "休息", "住宿"],
        btnArray2_N: [
          "人",
          "房間",
          "單人房",
          "雙人房",
          "早餐",
          "網際網路",
          "身分證",
          "健保卡",
        ],
        // btnArray2_A: [""],
        btnArray2_F: ["什麼", "稍等", "其他", "沒有", "有", "何時", "Check-in"],
      },
      button3Arrays: {
        btnArray3_S: ["你", "我", "他", "自己"],
        btnArray3_V: [
          "吃飯",
          "多少",
          "吃",
          "服務",
          "購買",
          "買單",
          "需要",
          "洗手",
          "拿",
          "結帳",
          "刷卡",
          "分開",
        ],
        btnArray3_N: [
          "飯",
          "麵",
          "糖",
          "牛",
          "羊",
          "豬",
          "雞",
          "肉",
          "素食",
          "咖啡",
          "水",
          "酒",
          "可口可樂",
          "飲料",
          "吸管",
          "廁所",
          "地方",
          "其他",
          "湯匙",
          "冰箱",
          "餐具",
          "什麼",
          "衛生紙",
          "錢",
          "塑膠袋",
          "零錢",
          "收據",
          "會員",
        ],
        btnArray3_A: ["辣", "冰", "熱"],
        btnArray3_F: ["沒問題", "吃飽了", "這樣", "有"],
      },
      button4Arrays: {
        btnArray4_S: ["你", "我", "他", "自己"],
        btnArray4_V: [
          "吃",
          "吃飯",
          "拿",
          "給",
          "刷牙",
          "洗臉",
          "洗澡",
          "睡覺",
          "電視",
          "電腦",
          "電話",
          "穿",
          "脫",
          "打開",
          "關",
          "找",
          "幫忙",
          "樓梯",
          "回家",
        ],
        btnArray4_N: [
          "床",
          "被子",
          "枕頭",
          "牙刷",
          "牙膏",
          "冰箱",
          "電腦",
          "手機",
          "電話",
          "遙控器",
          "電視",
          "杯子",
          "碗",
          "盤子",
          "馬桶",
          "桌子",
          "椅子",
          "鑰匙",
          "毛巾",
          "電扇",
          "湯匙",
          "床",
          "雨傘",
          "衣服",
          "褲子",
          "外套",
          "鞋子",
          "襪子",
          "口罩",
          "樓梯",
          "家",
          "廁所",
          "房間",
          "廚房",
          "客廳",
        ],
        // btnArray4_A: [""],
        // btnArray4_F: ["什麼", "稍等", "其他", "沒有", "有", "何時", "Check-in"],
      },
      button5Arrays: {
        btnArray5_S: ["你", "我", "他", "自己"],
        btnArray5_V: [
          "走",
          "跑",
          "爬",
          "坐",
          "騎",
          "規劃",
          "直走",
          "能",
          "開車",
          "過來",
        ],
        btnArray5_N: [
          "汽車",
          "機車",
          "腳踏車",
          "公車",
          "火車",
          "飛機",
          "船",
          "在",
          "可以",
          "後面",
          "上面",
          "外面",
          "這裡",
          "那裡",
          "哪裡",
          "現在",
          "早上",
          "晚上",
          "是",
          "不是",
          "對",
          "有",
          "沒有",
          "好",
        ],
        // btnArray5_A: [],
        // btnArray5_F: [],
      },
      button6Arrays: {
        btnArray6_S: ["你", "我", "他", "自己"],
        btnArray6_V: [
          "不舒服",
          "頭痛",
          "腹痛",
          "刺痛",
          "感冒",
          "生病",
          "咳嗽",
          "反胃",
          "吃藥",
          "接觸",
          "檢查",
          "給",
          "惡化",
          "找",
        ],
        btnArray6_N: [
          "身體",
          "頭",
          "肚子",
          "喉嚨",
          "皮膚",
          "症狀",
          "過敏",
          "問題",
          "人",
          "家族",
          "病歷",
          "體溫",
          "藥",
        ],
        // btnArray6_A: [],
        btnArray6_F: [
          "哪裡",
          "怎麼",
          "還有",
          "什麼",
          "有沒有",
          "請",
          "類似",
          "或者",
          "如果",
          "多久",
          "開始",
          "按時",
          "過去",
          "最近",
          "持續",
          "及時",
        ],
      },
      button7Arrays: {
        btnArray7_S: ["你", "我", "他", "自己"],
        btnArray7_V: [
          "需要",
          "幫忙",
          "留",
          "聯絡",
          "告訴",
          "發生",
          "給",
          "量體溫",
          "量血壓",
        ],
        btnArray7_N: [
          "身分證",
          "方式",
          "事情",
          "時間",
          "細節",
          "健保卡",
          "病歷",
          "過敏",
          "資料",
          "醫生",
        ],
        btnArray7_A: ["不舒服"],
        btnArray7_F: [
          "什麼",
          "請",
          "其他",
          "有",
          "稍等",
          "哪裡",
          "現在",
          "過去",
        ],
      },
      button8Arrays: {
        btnArray8_S: ["你", "我", "他", "自己"],
        btnArray8_V: ["購物", "付錢", "賣", "結帳", "刷卡"],
        btnArray8_N: [
          "大賣場",
          "百貨公司",
          "便利商店",
          "錢",
          "老闆",
          "客人",
          "推車",
          "免費",
        ],
        btnArray8_A: ["貴", "便宜"],
        btnArray8_F: ["哪裡", "賣光", "買一送一"],
      },

      activeIndex: 0, // Initialize activeIndex to null
      currentCategory: "問候語",
    };
  },
  computed: {
    currentContent() {
      switch (this.activeIndex) {
        case 0:
          return this.button1Arrays;
        case 1:
          return this.button2Arrays;
        case 2:
          return this.button3Arrays;
        case 3:
          return this.button4Arrays;
        case 4:
          return this.button5Arrays;
        case 5:
          return this.button6Arrays;
        case 6:
          return this.button7Arrays;
        case 7:
          return this.button8Arrays;
      }
    },
  },
  methods: {
    handleItemClick(index) {
      // Update activeIndex when an item is clicked
      this.activeIndex = index;
      console.log(this.activeIndex);
      return this.activeIndex;
      // You can also perform additional actions here based on the clicked item
    },
    getButtonClass(type) {
      // 分顏色
      const prefixes = {
        S: "btn-S",
        V: "btn-V",
        N: "btn-N",
        A: "btn-A",
        F: "btn-F",
      };
      return prefixes[type.charAt(type.length - 1)];

      // 返回适当的类名
      return prefixes[type];
    },
    currentVideo() {
      if (this.videoList.length > 0) {
        console.log(this.currentVideoIndex);
        return this.videoList[this.currentVideoIndex];
      } else {
        this.showVideo = false;
        console.log(this.currentVideoIndex);
        return ""; // 如果视频列表为空，则返回空字符串
      }
    },
    convertToVideos() {
      this.showVideo = !this.showVideo;
      this.currentVideoIndex = 0;
      this.videoList = []; // 清空视频列表
      for (const word of this.message) {
        const videoAddress = `../static/videos/allVideos/${word}.mp4`;
        this.videoList.push(videoAddress); // 将视频地址添加到视频列表中
      }
    },
    playNextVideo() {
      if (this.currentVideoIndex < this.message.length - 1) {
        this.currentVideoIndex++; // 播放下一个视频
        this.currentVideo();
      } else {
        // 如果当前视频索引已经是最后一个视频，则隐藏视频
        this.showVideo = false;
      }
    },
    displayMessage(word) {
      this.message.push(word);
      console.log(word);
    },
    removeWord(index) {
      this.message.splice(index, 1);
    },
    removeAllWord() {
      this.message = [];
    },
  },
}).mount("#selectBtnFrame");

// v-for="(word, index) in message"
// :key="index"
// v-bind:src="translate(index)"

// button5Arrays: {
//   btnArray5_S: ["你", "我", "他", "自己"],
//   btnArray5_V: [],
//   btnArray5_N: [],
//   btnArray5_A: [],
//   btnArray5_F: [],
// },
