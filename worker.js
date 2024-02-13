// Import the initModule and sherpaInit functions directly
import { initModule } from "./app";
import { init as sherpaInit } from "./sherpa-onnx-wasm-main";

let module;
let generate;

async function initialize() {
  module = initModule((genFunc) => {
    generate = genFunc;
  });
  await sherpaInit(module);
  self.postMessage({ type: "initDone" });
}

addEventListener("message", async (e) => {
  const { type, data } = e.data;
  switch (type) {
    case "hello":
      self.postMessage({ type: "Hello World!" });
    case "init":
      await initialize();
      break;
  }
});
