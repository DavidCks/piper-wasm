// @ts-ignore
import Worker from "worker-loader!./worker.js";

class Piper {
  url: string;
  audioCtx?: AudioContext;
  ttsData?: {
    sampleRate: number;
  };
  onInit: (
    generateFunction: (
      text: string,
      onStart?: (id: number, text: string) => void,
      onEnd?: (id: number, text: string) => void
    ) => void
  ) => void;
  onStart: { [id: number]: (id: number, text: string) => void } = {};
  onEnd: { [id: number]: (id: number, text: string) => void } = {};
  generationIndex: number = 0;

  constructor(
    url: string,
    onInit: (
      generateFunction: (
        text: string,
        onStart?: (id: number, text: string) => void,
        onEnd?: (id: number, text: string) => void
      ) => void
    ) => void,
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
          this.onInit(
            (
              text: string,
              onStart?: (id: number, text: string) => void,
              onEnd?: (id: number, text: string) => void
            ) => {
              this.onStart[this.generationIndex] =
                onStart ??
                ((_id, _text) => console.log(_id, _text, "(started reading)"));
              this.onEnd[this.generationIndex] =
                onEnd ??
                ((_id, _text) => console.log(_id, _text, "(ended reading)"));
              worker.postMessage({
                type: "generate",
                data: { text: text, id: this.generationIndex },
              });
              this.generationIndex++;
            }
          );
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
    console.log(audio.id, audio.samples.length, audio.sampleRate);

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
    this.onStart[audio.id](audio.id, audio.text);
    source.addEventListener("ended", () => {
      this.onEnd[audio.id](audio.id, audio.text);
    });
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
