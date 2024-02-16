# piper-wasm

Spawns a web worker to run piper tts in, using a wasm build of sherpa onnx as the runtime.

## Requirements

A data file that is compatible with sherpa-onnx

## Usage

After Piper has been initialized, it will provide you the function to synthesize speech via a callback. The synthesize function takes a [SpeechSynthesisUtterance](https://developer.mozilla.org/en-US/docs/Web/API/SpeechSynthesisUtterance).


### JavaScript/TypeScript

```ts
// imports
import Piper from "piper-wasm/index";

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
import Piper from "piper-wasm/index";

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