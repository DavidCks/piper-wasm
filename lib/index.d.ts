declare class Piper {
    url: string;
    audioCtx?: AudioContext;
    ttsData?: {
        sampleRate: number;
    };
    onInit: (generateFunction: (utterance: SpeechSynthesisUtterance) => void) => void;
    onStart: {
        [id: number]: (id: number, text: string) => void;
    };
    onEnd: {
        [id: number]: (id: number, text: string) => void;
    };
    generationIndex: number;
    constructor(url: string, onInit: (generateFunction: (utterance: SpeechSynthesisUtterance) => void) => void, _debug?: boolean);
    initWorker(): Promise<void>;
    handleAudioObj(audio: any): void;
    convertToBase64(file: string, callback: (buffer: ArrayBuffer) => void): void;
}
export default Piper;
