import { inject, external } from "tsdi";

@external
export class Audio {
    @inject("AudioContext") private audioContext!: AudioContext;

    public audioBuffer?: AudioBuffer;

    constructor(public url: string, public gain: number) {}

    public async load(): Promise<void> {
        const response = await fetch(this.url);
        const data = await response.arrayBuffer();
        this.audioBuffer = await this.audioContext.decodeAudioData(data);
    }

    public get duration(): number {
        if (!this.audioBuffer) {
            throw new Error(`Attempted to get duration of audio which was not loaded:${this.url}`);
        }
        return this.audioBuffer.duration;
    }

    public createSource(): { source: AudioBufferSourceNode, gain: GainNode } {
        if (!this.audioBuffer) { throw new Error(`Attempted to play audio which was not loaded: ${this.url}`); }
        const source = this.audioContext.createBufferSource();
        source.buffer = this.audioBuffer;
        const gain = this.audioContext.createGain();
        source.connect(gain);
        gain.gain.value = this.gain;
        return { source, gain };
    }
}
