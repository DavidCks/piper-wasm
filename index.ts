// @ts-ignore
import Worker from "worker-loader!./worker.js";

class Piper {
  url: string;
  audioCtx?: AudioContext;
  ttsData?: {
    sampleRate: number;
  };
  onInit: (generateFunction: (text: string) => void) => void;

  constructor(
    url: string,
    onInit: (generateFunction: (text: string) => void) => void,
    debug: boolean = true
  ) {
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
    worker.onerror = function (event: MessageEvent) {
      console.error("Worker error:", event);
    };
    worker.addEventListener("message", (e: MessageEvent) => {
      const { type, data } = e.data;
      switch (type) {
        case "initDone":
          console.log("Initialization completed");
          break;
        case "ttsData":
          this.ttsData = data;
          this.onInit((text: string) => {
            worker.postMessage({ type: "generate", data: { text: text } });
          });
          break;
        case "audioObj":
          this.handleAudioObj(data);
      }
    });
    worker.postMessage({ type: "hello" });
    this.convertToBase64(this.url, (buffer: ArrayBuffer) => {
      let workerData = {
        PACKAGE_NAME: this.url,
        DATA: buffer,
      };
      worker.postMessage({ type: "init", data: workerData });
    });
  }

  handleAudioObj(audio: any) {
    console.log(audio.samples.length, audio.sampleRate);

    if (!this.ttsData) {
      console.error(
        "Critical:",
        "An audio object was received but the tts data is missing"
      );
      console.error(audio);
    }

    if (!this.audioCtx) {
      this.audioCtx = new AudioContext({
        sampleRate: this.ttsData!.sampleRate,
      });
    }

    const buffer = this.audioCtx.createBuffer(
      1,
      audio.samples.length,
      this.ttsData!.sampleRate
    );

    const ptr = buffer.getChannelData(0);
    for (let i = 0; i < audio.samples.length; i++) {
      ptr[i] = audio.samples[i];
    }
    const source = this.audioCtx.createBufferSource();
    source.buffer = buffer;
    source.connect(this.audioCtx.destination);
    source.start();
  }

  convertToBase64(file: string, callback: (buffer: ArrayBuffer) => void) {
    fetch(file)
      .then((response) => response.arrayBuffer())
      .then((data) => {
        callback(data);
      })
      .catch((error) => console.error("Fetching error:", error));
  }
}

export default Piper;
