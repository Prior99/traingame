import { GameConfig } from "./game-config";
import { UserState, Modifier, Card } from "../game";
import { GamePhase } from "./game-phase";

export enum Track {
    TRACK_A = "track a",
    TRACK_B = "track b",
}

export enum CardType {
    GOOD = "good",
    BAD = "bad",
}

export const enum MessageType {
    WELCOME = "welcome",
    START_GAME = "start game",
    GAME_STATE = "game state",
    CARD_ADD = "card add",
    CARD_RESCUE = "card rescue",
    CARD_SWAP = "card swap",
    CARD_KILL = "card kill",
    CARD_ADD_MODIFIER = "card add modifier",
    DECIDE = "decide",
    NEXT_ROUND = "next round"
}

export interface MessageGameState {
    config: GameConfig;
    userStates: [string, UserState][];
    cards: Card[];
    modifiers: Modifier[];
    turnOrder: string[];
    round: number;
    phase: GamePhase;
    swapped: string[];
}

export interface MessageWelcome {
}

export interface MessageStartGame {
    config: GameConfig;
}

export interface MessageCardAdd {
    title: string;
    cardId: string;
    cardType: CardType;
}

export interface MessageCardRescue {
    cardId: string;
}

export interface MessageCardSwap {
    cardIds: [string, string];
}

export interface MessageCardKill {
    cardId: string;
}

export interface MessageCardAddModifier {
    cardId: string;
    modifierId: string;
    title: string;
}

export interface MessageDecide {
    track: Track;
}

export interface MessageNextRound {
}