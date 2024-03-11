export declare class PiperSpeechSynthesisUtterance {
    utterance: any;
    lang: any;
    pitch: any;
    rate: any;
    text: any;
    voice: any;
    volume: any;
    piperID: any;
    static fromUtterance(utterance: SpeechSynthesisUtterance, piperID: any): PiperSpeechSynthesisUtterance;
    constructor(text: string, pitch?: number, rate?: number, volume?: number, voice?: SpeechSynthesisVoice, piperID?: number, utterance?: SpeechSynthesisUtterance);
}
