// index.ts
class Piper {
  url;
  audioCtx;
  ttsData;
  onInit;
  onStart = {};
  onEnd = {};
  generationIndex = 0;
  constructor(url, onInit, _debug = true) {
    this.url = url;
    this.onInit = onInit;
    if (window.Worker) {
      this.initWorker();
    } else {
      console.error("Critical:", "'Window' object doesn't have 'Worker'");
    }
  }
  async initWorker() {
    const url = new URL("./worker.js", import.meta.url);
    const worker = new Worker(url.href, { type: "module" });
    worker.addEventListener("message", (e) => {
      const { type, data } = e.data;
      switch (type) {
        case "initDone":
          console.log("Initialization completed");
          break;
        case "ttsData":
          this.ttsData = data;
          this.onInit((utterance) => {
            this.onStart[this.generationIndex] = (_id, _text) => {
              utterance.dispatchEvent(new Event("start"));
              console.log(_id, _text, "(started reading)");
            };
            this.onEnd[this.generationIndex] = (_id, _text) => {
              utterance.dispatchEvent(new Event("end"));
              console.log(_id, _text, "(started reading)");
            };
            worker.postMessage({
              type: "generate",
              data: { text: utterance.text, id: this.generationIndex }
            });
            this.generationIndex++;
          });
          break;
        case "audioObj":
          this.handleAudioObj(data);
      }
    });
    worker.postMessage({ type: "hello" });
    this.convertToBase64(this.url, (buffer) => {
      let workerData = {
        PACKAGE_NAME: this.url,
        DATA: buffer
      };
      worker.postMessage({ type: "init", data: workerData });
    });
  }
  handleAudioObj(audio) {
    console.log(audio.id, audio.samples.length, audio.sampleRate);
    if (!this.ttsData) {
      console.error("Critical:", "An audio object was received but the tts data is missing");
      console.error(audio);
    }
    if (!this.audioCtx) {
      this.audioCtx = new AudioContext({
        sampleRate: this.ttsData.sampleRate
      });
    }
    const buffer = this.audioCtx.createBuffer(1, audio.samples.length, this.ttsData.sampleRate);
    const ptr = buffer.getChannelData(0);
    for (let i = 0;i < audio.samples.length; i++) {
      ptr[i] = audio.samples[i];
    }
    const source = this.audioCtx.createBufferSource();
    source.buffer = buffer;
    source.connect(this.audioCtx.destination);
    source.start();
    this.onStart[audio.id](audio.id, audio.text);
    source.addEventListener("ended", () => {
      this.onEnd[audio.id](audio.id, audio.text);
    });
  }
  convertToBase64(file, callback) {
    fetch(file).then((response) => response.arrayBuffer()).then((data) => {
      callback(data);
    }).catch((error) => console.error("Fetching error:", error));
  }
}
var piper_wasm_default = Piper;
export {
  piper_wasm_default as default
};
