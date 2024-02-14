# piper-wasm

Spawns a web worker to run piper in usinx sherpa onnx in wasm

## Requirements

A data file that is compatible with sherpa-onnx

## Usage

### React

```js
// imports
import Piper from "piper-wasm/index";

// reference holder
const piperRef = useRef<Piper>();

// the function that will be set to the generate function piper-wasm will return on initializazion
const [piperSynthesize, setPiperSynthesize] =
    useState<(text: string) => void>();

// setter handler for the generate function
const setPiperGenerator: (
    generateFunction: (text: string) => void
  ) => void = (genFunc) => {
    setPiperSynthesize(() => genFunc);
  };

// initialization
useEffect(() => {
    if (!piperRef.current) {
      const sitePath =
        window.location.pathname
          .toString()
          .substring(0, window.location.pathname.toString().lastIndexOf("/")) +
        "/";
      piperRef.current = new Piper(
        `${sitePath}voice.data`,
        setPsetPiperGeneratoriperGenerator,
        false
      );
    }
  }, []);
```
