import { lengthBytesUTF8, stringToUTF8, setValue } from "./common/utils";

function freeConfig(config) {
  if ("buffer" in config) {
    config.funcs["__free"](config.buffer);
  }

  if ("config" in config) {
    config.config.funcs = config.funcs;
    freeConfig(config.config);
  }

  config.funcs["__free"](config.ptr);
}

// The user should free the returned pointers
function initSherpaOnnxOfflineTtsVitsModelConfig(Vitsconfig, config) {
  let modelLen = lengthBytesUTF8(Vitsconfig.model) + 1;
  let lexiconLen = lengthBytesUTF8(Vitsconfig.lexicon) + 1;
  let tokensLen = lengthBytesUTF8(Vitsconfig.tokens) + 1;
  let dataDirLen = lengthBytesUTF8(Vitsconfig.dataDir) + 1;

  let n = modelLen + lexiconLen + tokensLen + dataDirLen;

  let buffer = config.funcs["__malloc"](n);

  let len = 7 * 4;
  let ptr = config.funcs["__malloc"](len);

  let offset = 0;
  stringToUTF8(Vitsconfig.model, buffer + offset, modelLen, config.HEAPS);
  offset += modelLen;

  stringToUTF8(Vitsconfig.lexicon, buffer + offset, lexiconLen, config.HEAPS);
  offset += lexiconLen;

  stringToUTF8(Vitsconfig.tokens, buffer + offset, tokensLen, config.HEAPS);
  offset += tokensLen;

  stringToUTF8(Vitsconfig.dataDir, buffer + offset, dataDirLen, config.HEAPS);
  offset += dataDirLen;

  offset = 0;
  setValue(ptr, buffer + offset, "i8*", config.HEAPS);
  offset += modelLen;

  setValue(ptr + 4, buffer + offset, "i8*", config.HEAPS);
  offset += lexiconLen;

  setValue(ptr + 8, buffer + offset, "i8*", config.HEAPS);
  offset += tokensLen;

  setValue(ptr + 12, buffer + offset, "i8*", config.HEAPS);
  offset += dataDirLen;

  setValue(ptr + 16, Vitsconfig.noiseScale, "float", config.HEAPS);
  setValue(ptr + 20, Vitsconfig.noiseScaleW, "float", config.HEAPS);
  setValue(ptr + 24, Vitsconfig.lengthScale, "float", config.HEAPS);

  return {
    buffer: buffer,
    ptr: ptr,
    len: len,
  };
}

function initSherpaOnnxOfflineTtsModelConfig(config) {
  let vitsModelConfig = initSherpaOnnxOfflineTtsVitsModelConfig(
    config.offlineTtsModelConfig.offlineTtsVitsModelConfig,
    config
  );

  let len = vitsModelConfig.len + 3 * 4;
  let ptr = config.funcs["__malloc"](len);

  let offset = 0;
  config.funcs["__CopyHeap"](
    vitsModelConfig.ptr,
    vitsModelConfig.len,
    ptr + offset
  );
  offset += vitsModelConfig.len;

  setValue(ptr + offset, config.numThreads, "i32", config.HEAPS);
  offset += 4;

  setValue(ptr + offset, config.debug, "i32", config.HEAPS);
  offset += 4;

  let providerLen = lengthBytesUTF8(config.offlineTtsModelConfig.provider) + 1;
  let buffer = config.funcs["__malloc"](providerLen);
  stringToUTF8(
    config.offlineTtsModelConfig.provider,
    buffer,
    providerLen,
    config.HEAPS
  );
  setValue(ptr + offset, buffer, "i8*", config.HEAPS);

  return {
    buffer: buffer,
    ptr: ptr,
    len: len,
    config: vitsModelConfig,
  };
}

function initSherpaOnnxOfflineTtsConfig(config) {
  let modelConfig = initSherpaOnnxOfflineTtsModelConfig(config);
  let len = modelConfig.len + 2 * 4;
  let ptr = config.funcs["__malloc"](len);

  let offset = 0;
  config.funcs["__CopyHeap"](modelConfig.ptr, modelConfig.len, ptr + offset);
  offset += modelConfig.len;

  let ruleFstsLen = lengthBytesUTF8(config.ruleFsts) + 1;
  let buffer = config.funcs["__malloc"](ruleFstsLen);
  stringToUTF8(config.ruleFsts, buffer, ruleFstsLen, config.HEAPS);
  setValue(ptr + offset, buffer, "i8*", config.HEAPS);
  offset += 4;

  setValue(ptr + offset, config.maxNumSentences, "i32", config.HEAPS);

  return {
    buffer: buffer,
    ptr: ptr,
    len: len,
    config: modelConfig,
    funcs: config.funcs,
  };
}

export class OfflineTts {
  constructor(configObj) {
    this.configObj = configObj;
    let config = initSherpaOnnxOfflineTtsConfig(configObj);
    let handle = configObj.funcs["__SherpaOnnxCreateOfflineTts"](config.ptr);

    freeConfig(config);

    this.handle = handle;
    this.sampleRate = configObj.funcs["__SherpaOnnxOfflineTtsSampleRate"](
      this.handle
    );
    this.numSpeakers = configObj.funcs["__SherpaOnnxOfflineTtsNumSpeakers"](
      this.handle
    );
  }

  free(config) {
    config["__SherpaOnnxDestroyOfflineTts"](this.handle);
    this.handle = 0;
  }

  // {
  //   text: "hello",
  //   sid: 1,
  //   speed: 1.0
  // }
  generate(config) {
    let textLen = lengthBytesUTF8(config.text) + 1;
    let textPtr = this.configObj.funcs["__malloc"](textLen);
    stringToUTF8(config.text, textPtr, textLen, this.configObj.HEAPS);

    let h = this.configObj.funcs["__SherpaOnnxOfflineTtsGenerate"](
      this.handle,
      textPtr,
      config.sid,
      config.speed
    );

    let numSamples = this.configObj.HEAPS["__HEAP32"][h / 4 + 1];
    let sampleRate = this.configObj.HEAPS["__HEAP32"][h / 4 + 2];

    let samplesPtr = this.configObj.HEAPS["__HEAP32"][h / 4] / 4;
    let samples = new Float32Array(numSamples);
    for (let i = 0; i < numSamples; i++) {
      samples[i] = this.configObj.HEAPS["__HEAPF32"][samplesPtr + i];
    }

    this.configObj.funcs["__SherpaOnnxDestroyOfflineTtsGeneratedAudio"](h);
    return { samples: samples, sampleRate: sampleRate };
  }
}

export function initSherpaOnnxOfflineTts(Module, data) {
  let offlineTtsVitsModelConfig = {
    model: "./model.onnx",
    lexicon: "",
    tokens: "./tokens.txt",
    dataDir: "./espeak-ng-data",
    noiseScale: 0.667,
    noiseScaleW: 0.8,
    lengthScale: 1.0,
  };
  let offlineTtsModelConfig = {
    offlineTtsVitsModelConfig: offlineTtsVitsModelConfig,
    numThreads: 1,
    debug: 1,
    provider: "cpu",
  };
  let offlineTtsConfig = {
    offlineTtsModelConfig: offlineTtsModelConfig,
    ruleFsts: "",
    maxNumSentences: 1,
    funcs: {
      __malloc: Module["__malloc"],
      __free: Module["__free"],
      __CopyHeap: Module["__CopyHeap"],
      __SherpaOnnxOfflineTtsGenerate: Module["__SherpaOnnxOfflineTtsGenerate"],
      __SherpaOnnxCreateOfflineTts: Module["__SherpaOnnxCreateOfflineTts"],
      __SherpaOnnxOfflineTtsSampleRate:
        Module["__SherpaOnnxOfflineTtsSampleRate"],
      __SherpaOnnxDestroyOfflineTtsGeneratedAudio:
        Module["__SherpaOnnxDestroyOfflineTtsGeneratedAudio"],
      __SherpaOnnxOfflineTtsNumSpeakers:
        Module["__SherpaOnnxOfflineTtsNumSpeakers"],
      __SherpaOnnxDestroyOfflineTts: Module["__SherpaOnnxDestroyOfflineTts"],
    },
    HEAPS: {
      __HEAP8: Module["HEAP8"],
      __HEAPU8: Module["HEAPU8"],
      __HEAP16: Module["HEAP16"],
      __HEAPU16: Module["HEAPU16"],
      __HEAP32: Module["HEAP32"],
      __HEAPF32: Module["HEAPF32"],
      __HEAPF64: Module["HEAPF64"],
      __HEAPU32: Module["HEAPU32"],
    },
  };

  return new OfflineTts(offlineTtsConfig);
}
