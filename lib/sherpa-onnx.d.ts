export function initSherpaOnnxOfflineTts(Module: any, data: any): OfflineTts;
export class OfflineTts {
    constructor(configObj: any);
    configObj: any;
    handle: any;
    sampleRate: any;
    numSpeakers: any;
    free(config: any): void;
    generate(config: any): {
        samples: Float32Array;
        sampleRate: any;
    };
}
