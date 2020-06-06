export * from "./audio";
export * from "./audio-manager";
export * from "./audios";

import audioAudioAddModifier from "../../assets/sound-add-modifier.mp3";

import audioDecisionMade from "../../assets/sound-decision-made.mp3";
import audioHover from "../../assets/sound-hover.mp3";
import audioKilled from "../../assets/sound-killed.mp3";
import audioKillHover from "../../assets/sound-kill-hover.mp3";
import audioNextPhase from "../../assets/sound-next-phase.mp3";
import audioRescue from "../../assets/sound-rescue.mp3";
import audioSkipSwap from "../../assets/sound-skip-swap.mp3";
import audioStart from "../../assets/sound-start.mp3";
import audioSubmitBad from "../../assets/sound-submit-bad.mp3";
import audioSubmitGood from "../../assets/sound-submit-good.mp3";
import audioSwap from "../../assets/sound-swap.mp3";

export {
    audioAudioAddModifier,
    audioDecisionMade,
    audioHover,
    audioKilled,
    audioKillHover,
    audioNextPhase,
    audioRescue,
    audioSkipSwap,
    audioStart,
    audioSubmitBad,
    audioSubmitGood,
    audioSwap,
};

export const allAudios = [
    { url: audioAudioAddModifier, gain: 0.6 },
    { url: audioDecisionMade, gain: 1.0 },
    { url: audioHover, gain: 0.5 },
    { url: audioKilled, gain: 0.8 },
    { url: audioKillHover, gain: 0.4 },
    { url: audioNextPhase, gain: 1.0 },
    { url: audioRescue, gain: 0.8 },
    { url: audioSkipSwap, gain: 0.6 },
    { url: audioStart, gain: 1.0 },
    { url: audioSubmitBad, gain: 0.4 },
    { url: audioSubmitGood, gain: 0.4 },
    { url: audioSwap, gain: 0.7 },
];
