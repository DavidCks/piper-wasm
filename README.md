# piper-wasm

## Disclaimer

This is an **unofficial** package. I have no affiliation to the people in charge of piper-tts or sherpa-onnx.

I'm sure one of them will develop and maintain a package that isn't as hacky as this. In the meantime, feel free to use this package (outside of production) and contribute if you can!

## What it does

Spawns a web worker to run piper tts in, using a wasm build of sherpa onnx as the runtime.

## Requirements

A data file that is compatible with sherpa-onnx

## Usage

```bash
npm install piper-wasm
```

After the runtime has been initialized, it will provide you the function to synthesize speech via a callback. The synthesize function takes a [SpeechSynthesisUtterance](https://developer.mozilla.org/en-US/docs/Web/API/SpeechSynthesisUtterance).

### JavaScript/TypeScript

```ts
// imports
import Piper from "piper-wasm/lib/index";

function onInit(generate: (utterance: SpeechSynthesisUtterance) => void): void {
  const utterance = new SpeechSynthesisUtterance("Hello, World!");
  generate(utterance);
}

const piper = new Piper(`path_to_model.data`, onInit);
```

### React

```ts
// imports
import React, { useRef, useState, useEffect } from 'react';
import Piper from "piper-wasm/lib/index";

function PiperComponent() {
  // reference holder
  const piperRef = useRef<Piper>();

  // the function that will be set to the generate function piper-wasm will return on initializazion
  const [piperSynthesize, setPiperSynthesize] =
      useState<(utterance: SpeechSynthesisUtterance) => void>();

  // setter handler for the generate function
  const setPiperGenerator: (
      generateFunction: (utterance: SpeechSynthesisUtterance) => void
    ) => void = (generateFunction) => {
      setPiperSynthesize(() => generateFunction);
    };

  // initialization
  useEffect(() => {
    if (!piperRef.current) {
      piperRef.current = new Piper(
        `path_to_model.data`,
        setPiperGenerator
      );
    }
  }, []);

  return (
    <button 
      disabled={!piperSynthesize}
      onClick={() => {
        if (piperSynthesize) {
          piperSynthesize("Hello, World!");
        } else {
          console.warn("Piper has not yet been initialized");
        }
      }}
    >
      Click me
    </button>
  );
}
```

### Chrome Extension

Google is weirdly strict about spawning web workers from content scripts and running wasm. So there's a few things that you have to do.

First, you need to build an api that wraps the capabilities of piper-wasm inside a worker:

#### worker.js

```js

let piper; // Piper
let generate; // (utterance: SpeechSynthesisUtterance) => void
let isInitializing = false;

function initPiper(tabID /* number */, utterance: /* SpeechSynthesisUtterance | undefined */) /*: Piper */ {
  if (isInitializing) {
    console.warn('Warning:', 'piper-wasm is already being initialized', 'aborting');
    return;
  }
  const benv = chrome ?? browser;
  isInitializing = true;
  return new Piper(
    benv.runtime.getURL(path_to_voice.data),
    genFunc => {
      generate = genFunc;
      isInitializing = false;
      if (utterance) {
        initGenerate(utterance, tabID);
      }
    },
    tabID,
  );
}

function initGenerate(utterance: MimicSpeechSynthesisUtterance, tabID) {
  if (isInitializing) {
    console.warn(
      'Warning:',
      'piper-wasm is initializing.',
      'refrain from calling the generate function before piper-wasm has finished initializing',
      'aborting',
    );
    return;
  }
  piper = piper ?? initPiper(tabID);
  generate ? generate(utterance) : initPiper(tabID, utterance);
}

chrome.runtime.onMessage.addListener((message: WorkerMessage, sender: chrome.runtime.MessageSender) => {
  switch (message.type) {
    case 'init':
      piper = piper ?? initPiper(sender.tab.id);
      break;
    case 'generate':
      initGenerate(message.data, sender.tab.id);
      break;
    default:
      console.error(`Message type '${message.type}' does not exist`);
      break;
  }
});
```

Next, you'll need to add that worker as a background script and also allow 'wasm-unsafe-eval' as a script-src.

#### manifest.js

add this to the manifest:

```js
  content_security_policy: {
    extension_pages: "script-src 'wasm-unsafe-eval';",
  },

  background: {
    service_worker: 'path_to_worker.js',
    type: 'module',
  },
```

#### usePiperBackground.js

(this is just explanation text, feel free to skip to the code below)


Now, we need an interface to communicate with the background worker. If piper-wasm detects that you are running piper from within a background script, it will automatically try to communicate with the PiperRunner through messages. Since you can't pass a SpeechSynthesisUtterance to a worker and have it retain its callbacks, the runner will need a way to fetch that utterance from within the content script.
For that purpose, it will call the setOnAudio function to retrieve an utterance in order to invoke events such as "start" and "end" at the appropriate times. For managing utterances, it will give you the actual text that piper will synthesize and a unique id for the utterance in order to give you the ability to manage the utterances that way.

The id is a simple number starting from 0 that is being incemented by 1 each time the internal generate function is called.

So if you need to do some more advanced management, say, when you want to synthesize speech but dont want to wait for the last utterance to be finished to start the synthesization process, you could run a variable in parallel that counts up from 0 every time you call the generate function and store the utterances inside a dict with that id being the key.

```js
// import the runner inside your content script
import { PiperRunner } from 'piper-wasm/lib/index';

function sendMessageToBackground(message: unknown) {
  (chrome ?? browser).runtime.sendMessage(message);
}

function init() {
  sendMessageToBackground({ type: 'init' });
}

function generate(utterance) {
  sendMessageToBackground({ type: 'generate', data: mimicUtterance });
}

const usePiperBackground = () => {
  init();
  const piperRunner = new PiperRunner();
  const generateFunc = (utterance) => {
    piperRunner.setOnAudio((_id, _text) => utterance);
    generate(utterance);
  };

  return generateFunc;
};

export default usePiperBackground;
```

#### Finally using the damn thing

```js
import usePiperBackground from './usePiperBackground';
const piperSynthesize = usePiperBackground();
```

## Implemented features of SpeechSynthesisUtterance

### Instance properties

- [x] text
- [ ] lang
- [ ] pitch
- [ ] rate
- [ ] voice
- [ ] volume

### Events

- [x] start
- [x] end
- [ ] boundary
- [ ] error
- [ ] mark
- [ ] pause
- [ ] resume

## Contributing

If you have some spare time, send a PR and I'll try to check and merge as soon as possible.

## Credits

- Sherpa-Onnx: <https://github.com/k2-fsa/sherpa-onnx>
- JS + WASM implementation of Piper: <https://huggingface.co/spaces/k2-fsa/web-assembly-tts-sherpa-onnx-en/tree/main>