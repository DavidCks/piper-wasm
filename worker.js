// Import the initModule and sherpaInit functions directly
import { initModule } from "./app.js"; // Adjust the path as necessary
import { init as sherpaInit } from "./sherpa-onnx-wasm-main.js"; // Adjust the path as necessary

let module;
let generate;

async function initialize(data) {
  module = initModule((tts, genFunc) => {
    self.postMessage({ type: "ttsData", data: { sampleRate: tts.sampleRate } });
    generate = genFunc;
    self.postMessage({ type: "initDone" });
  }, data);
  await sherpaInit(module, data);
}

addEventListener("message", async (e) => {
  const { type, data } = e.data;
  switch (type) {
    case "hello":
      self.postMessage({ type: "Hello World!" });
      break;
    case "init":
      await initialize(data);
      break;
    case "generate":
      const audioObj = generate(data.text);
      self.postMessage({
        type: "audioObj",
        data: {
          id: data.id,
          text: data.text,
          samples: audioObj.samples,
          sampleRate: audioObj.sampleRate,
        },
      });
      break;
  }
});
