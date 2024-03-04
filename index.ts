// @ts - ignore
// import Worker from "worker-loader!./worker.js";
import { PiperSpeechSynthesisUtterance } from "piper_speech_synthesis_utterance";
import { handleMessage as postMessageSync } from "./worker";
declare var serviceWorker: any;

export type TTSData = {
  sampleRate: number;
};

export type AudioData = {
  id: number;
  text: string;
  samples: Object;
  sampleRate: number;
};

type ClientMessage =
  | {
      type: "piperWasmClientAudioObject";
      data: { ttsData: TTSData; audioData: AudioData };
    }
  | {
      type: "piperWasmClientInitDone";
    }
  | {
      type: "piperWasmClientStartGenerating";
      data: PiperSpeechSynthesisUtterance;
    };

export class PiperRunner {
  onWorkerInit: () => void;
  audioCtx?: AudioContext;
  audioQueue: {
    utterance: PiperSpeechSynthesisUtterance;
    audioData: AudioData;
    ttsData: TTSData;
  }[] = [];
  isGenerating: boolean = false;
  isReading: boolean = false;
  stopTimeouts: NodeJS.Timeout[] = [];
  messageHandler?: (message: ClientMessage) => void;

  constructor(onWorkerInit = () => null) {
    this.onWorkerInit = onWorkerInit;
  }

  _onWorkerInit() {
    this.onWorkerInit();
  }

  _onStartGenerating() {
    this.isGenerating = true;
  }

  _onEndGenerating() {
    this.isGenerating = false;
  }

  setOnAudio(onAudio: (id, text) => PiperSpeechSynthesisUtterance) {
    if (this.messageHandler) {
      chrome.runtime.onMessage.removeListener(this.messageHandler);
    }
    this.messageHandler = (message: ClientMessage) => {
      switch (message.type) {
        case "piperWasmClientAudioObject":
          const utterance = onAudio(
            message.data.audioData.id,
            message.data.audioData.text
          );
          this.generate({
            utterance: utterance,
            audioData: message.data.audioData,
            ttsData: message.data.ttsData,
          });
          this._onEndGenerating();
          break;
        case "piperWasmClientStartGenerating":
          this._onStartGenerating();
          break;
        case "piperWasmClientInitDone":
          this._onWorkerInit();
          break;
        default:
          break;
      }
    };

    chrome.runtime.onMessage.addListener(this.messageHandler);
  }

  _onStart(utterance, id, text) {
    utterance.dispatchEvent(
      new SpeechSynthesisEvent("start", { utterance: utterance })
    );
    console.log(id, text, "(started reading)");
  }

  _onEnd(utterance, id, text) {
    utterance.dispatchEvent(
      new SpeechSynthesisEvent("end", { utterance: utterance })
    );
    this.isReading = false;
    if (this.audioQueue.length > 0) {
      this.generate(this.audioQueue.at(0));
      this.audioQueue.shift();
    }
    console.log(id, text, "(stopped reading)");
  }

  stop(instance) {
    instance.audioQueue = [];
    instance._onStop(instance);
  }

  skip(instance) {
    instance._onStop(instance);
  }

  _onSkip(currentSource: {
    source: AudioBufferSourceNode;
    utterance: PiperSpeechSynthesisUtterance;
    id: number;
    text: string;
  }) {
    currentSource.source.stop();
    currentSource.source.disconnect();
    this._onEnd(currentSource.utterance, currentSource.id, currentSource.text);
  }

  generate(from: {
    utterance: PiperSpeechSynthesisUtterance;
    audioData: AudioData;
    ttsData: TTSData;
  }) {
    if (this.isReading) {
      this.audioQueue.push({
        utterance: from.utterance,
        audioData: from.audioData,
        ttsData: from.ttsData,
      });
      return;
    }
    this.isReading = true;
    if (!this.audioCtx) {
      this.audioCtx = new AudioContext({
        sampleRate: from.ttsData.sampleRate,
      });
    }
    const sampleLength = Object.entries(from.audioData.samples).length;

    const buffer = this.audioCtx.createBuffer(
      1,
      sampleLength,
      from.ttsData.sampleRate
    );

    const ptr = buffer.getChannelData(0);
    for (let i = 0; i < sampleLength; i++) {
      ptr[i] = from.audioData.samples[i];
    }
    const source = this.audioCtx.createBufferSource();
    source.buffer = buffer;
    const durationMs = (sampleLength / from.audioData.sampleRate) * 1000;

    source.connect(this.audioCtx.destination);
    source.start();
    this._onStart(from.utterance, from.audioData.id, from.audioData.text);
    const currentSource = {
      source: source,
      utterance: from.utterance,
      id: from.audioData.id,
      text: from.audioData.text,
    };
    this.stopTimeouts[from.audioData.id] = setTimeout(() => {
      this._onSkip(currentSource);
    }, durationMs);
  }
}

class Piper {
  piperRunner = new PiperRunner();
  identity = "piper-wasm";
  url: string;
  tabID?: number;
  ttsData?: TTSData;
  onInit: (
    generateFunction: (utterance: PiperSpeechSynthesisUtterance) => void
  ) => void;
  utterances: PiperSpeechSynthesisUtterance[] = [];
  generationIndex: number = 0;

  constructor(
    url: string,
    onInit: (
      generateFunction: (utterance: PiperSpeechSynthesisUtterance) => void
    ) => void,
    tabID?: number
  ) {
    this.url = url;
    this.onInit = onInit;
    this.initWorker();
    this.tabID = tabID;
  }

  postMessageSyncFactory(
    callback: (type: string, data: any, instance: Piper) => void
  ) {
    return async ({ type, data = undefined }) =>
      await postMessageSync(type, data, ({ type, data }) =>
        callback(type, data, this)
      );
  }

  isPiper(instance: any): instance is Piper {
    return (instance as Piper).identity === "piper-wasm";
  }

  handleWorkerMessage(type: string, data: any, workerInstance: Worker | Piper) {
    const workerIsPiper =
      (workerInstance as Piper).isPiper &&
      (workerInstance as Piper).isPiper(workerInstance);
    const postMessage = workerIsPiper
      ? workerInstance.postMessageSyncFactory(
          workerInstance.handleWorkerMessage
        )
      : (workerInstance as Worker).postMessage;

    const piperInstance: Piper | undefined =
      this ?? workerIsPiper ? (workerInstance as Piper) : undefined;
    if (!piperInstance) {
      console.error(
        "Critical:",
        "The class instance got lost somehow. Never had that happen before. Curious."
      );
    }
    switch (type) {
      case "initDone":
        console.log("Initialization completed");
        if (workerIsPiper && piperInstance.tabID) {
          const clientMessage = {
            type: "piperWasmClientInitDone",
          } as const;
          piperInstance.sendMessageToTab(piperInstance.tabID, clientMessage);
        }
        break;
      case "ttsData":
        piperInstance.ttsData = data;
        piperInstance.onInit((utterance: PiperSpeechSynthesisUtterance) => {
          if (workerIsPiper && piperInstance.tabID) {
            const clientMessage = {
              type: "piperWasmClientStartGenerating",
              data: utterance,
            } as const;
            piperInstance.sendMessageToTab(piperInstance.tabID, clientMessage);
          }
          const utteranceID =
            utterance.piperID >= 0
              ? utterance.piperID
              : piperInstance.generationIndex;
          piperInstance.utterances[utteranceID] = utterance;
          postMessage({
            type: "generate",
            data: { text: utterance.text, id: utteranceID },
          });
          piperInstance.generationIndex++;
        });
        break;
      case "audioObj":
        piperInstance.handleAudioObj(data);
    }
  }

  sendMessageToTab(tabID: number, clientMessage: ClientMessage) {
    if (chrome?.tabs?.sendMessage) {
      chrome.tabs.sendMessage(tabID, clientMessage);
    } else if (browser?.tabs?.sendMessage) {
      browser.tabs.sendMessage(tabID, clientMessage);
    }
  }

  async initWorker() {
    let url: URL;
    let worker: Worker | undefined;
    let postMessage;
    try {
      url = new URL("./worker.js", import.meta.url);
      worker = new Worker(url.href, { type: "module" });
      postMessage = worker.postMessage;
    } catch (error) {
      console.warn(
        "Warning:",
        "Piper-wasm couldn't initialize it's own worker.",
        error,
        "\n",
        "Using on current thread."
      );
      postMessage = this.postMessageSyncFactory(this.handleWorkerMessage);
    }

    worker &&
      worker.addEventListener("message", (e: MessageEvent) => {
        const { type, data } = e.data;
        this.handleWorkerMessage(type, data, worker);
      });
    postMessage({ type: "hello" });
    this.convertToBase64(this.url, (buffer: ArrayBuffer) => {
      let workerData = {
        PACKAGE_NAME: this.url,
        DATA: buffer,
      };
      postMessage({ type: "init", data: workerData });
    });
  }

  handleAudioObj(audio: any): void {
    console.log(audio.id, audio.samples.length, audio.sampleRate);

    if (!this.ttsData) {
      console.error(
        "Critical:",
        "An audio object was received but the tts data is missing"
      );
      console.log("Audio\n", audio);
    }

    if ((serviceWorker as ServiceWorker) !== undefined) {
      const clientMessage = {
        type: "piperWasmClientAudioObject",
        data: { ttsData: this.ttsData, audioData: audio as AudioData },
      } as const;
      if (self.postMessage) {
        self.postMessage(clientMessage);
      } else if (this.tabID) {
        this.sendMessageToTab(this.tabID, clientMessage);
      } else {
        console.error(
          "It seems like the main piper-wasm interface is being run inside a worker,",
          "however, 'self' does not have a 'postMessage' method,",
          "so this is probably run inside a background script of a chrome extension.",
          "If this is a chrome extension, then piper-wasm needs a tabID.",
          "Specify it by passing it as the third argument to 'new Piper()'"
        );
      }
      return;
    }

    this.piperRunner.generate({
      utterance: this.utterances[audio.id],
      audioData: audio,
      ttsData: this.ttsData,
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
