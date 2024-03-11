/// <reference types="node" />
import { PiperSpeechSynthesisUtterance } from "./piper_speech_synthesis_utterance";
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
} | {
    type: "piperWasmClientInitDone";
} | {
    type: "piperWasmClientStartGenerating";
    data: PiperSpeechSynthesisUtterance;
};
export declare class PiperRunner {
    onWorkerInit: () => void;
    audioCtx?: AudioContext;
    audioQueue: {
        utterance: PiperSpeechSynthesisUtterance;
        audioData: AudioData;
        ttsData: TTSData;
    }[];
    isGenerating: boolean;
    isReading: boolean;
    stopTimeouts: NodeJS.Timeout[];
    currentSource: {
        source: AudioBufferSourceNode;
        utterance: PiperSpeechSynthesisUtterance;
        id: number;
        text: string;
    };
    messageHandler?: (message: ClientMessage) => void;
    constructor(onWorkerInit?: () => any);
    _onWorkerInit(): void;
    _onStartGenerating(): void;
    _onEndGenerating(): void;
    setOnAudio(onAudio: (id: any, text: any) => PiperSpeechSynthesisUtterance): void;
    _onStart(utterance: any, id: any, text: any): void;
    _onEnd(utterance: any, id: any, text: any): void;
    stop(instance: PiperRunner): void;
    skip(instance: PiperRunner): void;
    _onSkip(currentSource: {
        source: AudioBufferSourceNode;
        utterance: PiperSpeechSynthesisUtterance;
        id: number;
        text: string;
    }): void;
    generate(from: {
        utterance: PiperSpeechSynthesisUtterance;
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
    onInit: (generateFunction: (utterance: PiperSpeechSynthesisUtterance) => void) => void;
    utterances: PiperSpeechSynthesisUtterance[];
    generationIndex: number;
    constructor(url: string, onInit: (generateFunction: (utterance: PiperSpeechSynthesisUtterance) => void) => void, tabID?: number);
    postMessageSyncFactory(callback: (type: string, data: any, instance: Piper) => void): ({ type, data }: {
        type: any;
        data?: any;
    }) => Promise<void>;
    isPiper(instance: any): instance is Piper;
    handleWorkerMessage(type: string, data: any, workerInstance: Worker | Piper): void;
    sendMessageToTab(tabID: number, clientMessage: ClientMessage): void;
    initWorker(): Promise<void>;
    handleAudioObj(audio: any): void;
    convertToBase64(file: string, callback: (buffer: ArrayBuffer) => void): void;
}
export default Piper;
