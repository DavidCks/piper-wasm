import { initSherpaOnnxOfflineTts, OfflineTts } from "./sherpa-onnx.js";

export type TtsModule = {
  onRuntimeInitialized: (Module: TtsModule) => void;
  expectedDataFileDownloads?: number;
};

export function initModule(
  onInit: (generateFunction: (text: string) => void) => void
): TtsModule {
  let Module: TtsModule = {
    onRuntimeInitialized: (Module) => {
      console.log("Model files downloaded!");
      console.log("Initializing tts ......");
      const tts = initSherpaOnnxOfflineTts(Module);
      const genFunc = generateFactory(tts);
      onInit(genFunc);
    },
  };
  return Module;
}

function generateFactory(tts: OfflineTts): (text: string) => void {
  const audioCtx = new AudioContext({ sampleRate: tts.sampleRate });
  const gen = (text: string) => {
    generate(text, audioCtx, tts);
  };
  return gen;
}

function generate(text: string, audioCtx: AudioContext, tts: OfflineTts) {
  text = text.trim();
  console.log("text", text);

  let audio = tts.generate({
    text: text,
    sid: 1,
    speed: 1,
  });

  console.log(audio.samples.length, audio.sampleRate);

  if (!audioCtx) {
    audioCtx = new AudioContext({ sampleRate: tts.sampleRate });
  }

  const buffer = audioCtx.createBuffer(1, audio.samples.length, tts.sampleRate);

  const ptr = buffer.getChannelData(0);
  for (let i = 0; i < audio.samples.length; i++) {
    ptr[i] = audio.samples[i];
  }
  const source = audioCtx.createBufferSource();
  source.buffer = buffer;
  source.connect(audioCtx.destination);
  source.start();
}

// this function is copied/modified from
// https://gist.github.com/meziantou/edb7217fddfbb70e899e
// export function toWav(floatSamples, sampleRate) {
//   let samples = new Int16Array(floatSamples.length);
//   for (let i = 0; i < samples.length; ++i) {
//     let s = floatSamples[i];
//     if (s >= 1) s = 1;
//     else if (s <= -1) s = -1;

//     samples[i] = s * 32767;
//   }

//   let buf = new ArrayBuffer(44 + samples.length * 2);
//   var view = new DataView(buf);

//   // http://soundfile.sapp.org/doc/WaveFormat/
//   //                   F F I R
//   view.setUint32(0, 0x46464952, true); // chunkID
//   view.setUint32(4, 36 + samples.length * 2, true); // chunkSize
//   //                   E V A W
//   view.setUint32(8, 0x45564157, true); // format
//   //
//   //                      t m f
//   view.setUint32(12, 0x20746d66, true); // subchunk1ID
//   view.setUint32(16, 16, true); // subchunk1Size, 16 for PCM
//   view.setUint32(20, 1, true); // audioFormat, 1 for PCM
//   view.setUint16(22, 1, true); // numChannels: 1 channel
//   view.setUint32(24, sampleRate, true); // sampleRate
//   view.setUint32(28, sampleRate * 2, true); // byteRate
//   view.setUint16(32, 2, true); // blockAlign
//   view.setUint16(34, 16, true); // bitsPerSample
//   view.setUint32(36, 0x61746164, true); // Subchunk2ID
//   view.setUint32(40, samples.length * 2, true); // subchunk2Size

//   let offset = 44;
//   for (let i = 0; i < samples.length; ++i) {
//     view.setInt16(offset, samples[i], true);
//     offset += 2;
//   }

//   return new Blob([view], { type: "audio/wav" });
// }
