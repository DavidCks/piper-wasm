// @ts-ignore
import Worker from "worker-loader!./worker.js";

class Piper {
  url: string;

  constructor(
    url: string,
    onInit: (generateFunction: (text: string) => void) => void,
    debug: boolean = true
  ) {
    this.url = url;
    if (window.Worker) {
      this.initWorker();
    } else {
      console.error("Critical:", "'Window' object doesn't have 'Worker'");
    }
  }

  initWorker() {
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
      }
    });
    worker.postMessage({ type: "hello" });
    worker.postMessage({ type: "init" });
  }
}

export default Piper;
