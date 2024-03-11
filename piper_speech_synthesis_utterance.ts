export class PiperSpeechSynthesisUtterance {
  utterance;
  lang;
  pitch;
  rate;
  text;
  voice;
  volume;
  piperID;

  static fromUtterance(utterance: SpeechSynthesisUtterance, piperID) {
    return new PiperSpeechSynthesisUtterance(
      utterance.text,
      utterance.pitch,
      utterance.rate,
      utterance.volume,
      utterance.voice,
      piperID,
      utterance
    );
  }

  constructor(
    text: string,
    pitch?: number,
    rate?: number,
    volume?: number,
    voice?: SpeechSynthesisVoice,
    piperID?: number,
    utterance?: SpeechSynthesisUtterance
  ) {
    this.text = text;
    this.pitch = pitch ?? 1;
    this.rate = rate ?? 1;
    this.volume = volume ?? 1;
    this.voice = voice ?? undefined;
    this.piperID = piperID ?? -1;
    this.utterance = utterance ?? new SpeechSynthesisUtterance(text);
  }
}
