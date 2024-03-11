console.log("Worker should exist");

// Import the initModule and sherpaInit functions directly
import { initModule } from "./app.js"; // Adjust the path as necessary
import { init as sherpaInit } from "./sherpa-onnx-wasm-main.js"; // Adjust the path as necessary

let module;
let generate;

async function initialize(data, messageCallback = undefined) {
  let postMessage;
  if (messageCallback) {
    postMessage = messageCallback;
  } else {
    postMessage = (msg) => self.postMessage(msg);
  }
  module = initModule((tts, genFunc) => {
    const ttsDataMessage = {
      type: "ttsData",
      data: { sampleRate: tts.sampleRate },
    };
    generate = genFunc;
    postMessage(ttsDataMessage);
    postMessage({ type: "initDone" });
  }, data);
  await sherpaInit(module, data);
}

export const handleMessage = async (
  type,
  data,
  messageCallback = undefined
) => {
  let postMessage;
  if (messageCallback) {
    postMessage = messageCallback;
  } else {
    postMessage = (msg) => self.postMessage(msg);
  }
  switch (type) {
    case "hello":
      postMessage({ type: "Hello World!" });
      break;
    case "init":
      await initialize(data, postMessage);
      break;
    case "generate":
      const audioObj = generate(data.text);
      const audioObjMessage = {
        type: "audioObj",
        data: {
          id: data.id,
          text: data.text,
          samples: audioObj.samples,
          sampleRate: audioObj.sampleRate,
        },
      };
      postMessage(audioObjMessage);
      break;
  }
};

if (
  typeof WorkerGlobalScope !== "undefined" &&
  self instanceof WorkerGlobalScope &&
  typeof self.addEventListener !== "undefined"
) {
  self.addEventListener("message", async (e) => {
    const { type, data } = e.data;
    handleMessage(type, data);
  });
}
