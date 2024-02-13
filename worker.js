// Import the initModule and sherpaInit functions directly
import { initModule } from "./app";
import { init as sherpaInit } from "./sherpa-onnx-wasm-main";

let module;
let generate;

async function initialize(data) {
  module = initModule((genFunc) => {
    generate = genFunc;
  }, data);
  await sherpaInit(module, data);
  self.postMessage({ type: "initDone" });
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
  }
});
