const worker = new Worker("runReco.js");

// 先抓 WASM 檔案
fetch("simple.wasm")
  .then(
    (response) => response.arrayBuffer()
    // 編譯 bytes
  )
  .then(
    (bytes) =>
      // 同步編譯
      WebAssembly.compile(bytes)
    // 將 Module 傳給 worker
  )
  .then((mod) => worker.postMessage(mod));
