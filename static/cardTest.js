Vue.createApp({
  data() {
    return {
      titleArray: [
        "問候語",
        "住宿",
        "用餐",
        "居家",
        "交通",
        "醫療",
        "緊急",
        "購物",
      ],
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
    };
  },
  methods: {
    getAction(index) {
      // 返回相应的路由
      console.log("/rec" + index);
      return "/rec" + index;
    },
    submitForm(index) {
      let form = document.createElement("form");
      form.method = "post";
      form.action = "/rec" + index;
      document.body.appendChild(form);
      form.submit();
    },
    // submitForm(index) {
    //   // 可以在这里做一些点击按钮后的逻辑处理
    //   console.log("Button clicked with index:", index);
    //   // 如果需要，在这里可以继续调用其他方法或者处理其他逻辑
    //   // 然后再提交表单
    //   document.getElementById("myForm").submit();
    // },
    // getAction(index) {
    //   // 根據 index 返回不同的 action
    //   switch (index) {
    //     case 0:
    //       console.log("index = 0");
    //       return "/rec0";
    //     case 1:
    //       console.log("index = 1");
    //       return "/rec1";
    //     case 2:
    //       console.log("index = 2");
    //       return "/rec2";
    //     case 3:
    //       console.log("index = 3");
    //       return "/rec3";
    //     case 4:
    //       console.log("index = 4");
    //       return "/rec4";
    //     case 5:
    //       console.log("index = 5");
    //       return "/rec5";
    //     case 6:
    //       console.log("index = 6");
    //       return "/rec6";
    //     case 7:
    //       console.log("index = 7");
    //       return "/rec7";
    //     default:
    //       return "/default";
    //   }
    // },
  },
}).mount("#card");
