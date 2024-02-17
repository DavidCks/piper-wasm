export type TTSData = {
    sampleRate: number;
};
export type AudioData = {
    id: number;
    text: string;
    samples: Object;
    sampleRate: number;
};
type ClientMessage = {
    type: "piperWasmClientAudioObject";
    data: {
        ttsData: TTSData;
        audioData: AudioData;
    };
};
export declare class PiperRunner {
    audioCtx?: AudioContext;
    messageHandler?: (message: ClientMessage) => void;
    constructor();
    setOnAudio(onAudio: (id: any, text: any) => SpeechSynthesisUtterance): void;
    _onStart(utterance: any, id: any, text: any): void;
    _onEnd(utterance: any, id: any, text: any): void;
    generate(from: {
        utterance: SpeechSynthesisUtterance;
        audioData: AudioData;
        ttsData: TTSData;
    }): void;
}
declare class Piper {
    piperRunner: PiperRunner;
    identity: string;
    url: string;
    tabID?: number;
    ttsData?: TTSData;
    onInit: (generateFunction: (utterance: SpeechSynthesisUtterance) => void) => void;
    utterances: SpeechSynthesisUtterance[];
    generationIndex: number;
    constructor(url: string, onInit: (generateFunction: (utterance: SpeechSynthesisUtterance) => void) => void, tabID?: number);
    postMessageSyncFactory(callback: (type: string, data: any, instance: Piper) => void): ({ type, data }: {
        type: any;
        data?: any;
    }) => Promise<void>;
    isPiper(instance: any): instance is Piper;
    handleWorkerMessage(type: string, data: any, workerInstance: Worker | Piper): void;
    initWorker(): Promise<void>;
    handleAudioObj(audio: any): void;
    convertToBase64(file: string, callback: (buffer: ArrayBuffer) => void): void;
}
export default Piper;
