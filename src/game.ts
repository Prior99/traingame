import { create as randomSeed } from "random-seed";
import NomineLipsum from "nomine-lipsum";
import { MessageFactory, PeerOptions } from "p2p-networking";
import { ObservablePeer, createObservableClient, createObservableHost } from "p2p-networking-mobx";
import { computed, action, observable } from "mobx";
import { component } from "tsdi";
import {
    GameConfig,
    GamePhase,
    AppUser,
    MessageType,
    MessageGameState,
    MessageWelcome,
    MessageStartGame,
    MessageCardRescue,
    MessageCardSwap,
    MessageCardKill,
    MessageCardAddModifier,
    MessageDecide,
    MessageNextRound,
    CardType,
    MessageCardAdd,
    Track,
} from "./types";
import { v4 } from "uuid";
import { shuffle } from "./utils";

declare const SOFTWARE_VERSION: string;

export interface Score {
    rank: number;
    score: number;
    playerName: string;
    playerId: string;
}

export const enum LoadingFeatures {
    START_GAME = "start game",
    NEXT_ROUND = "next round",
    CARD_RESCUE = "card rescue",
    CARD_SWAP = "card swap",
    CARD_ADD = "card add",
    CARD_KILL = "card kill",
    DECIDE = "decide",
}

export interface UserState {
    score: number;
}

export interface Card {
    cardId: string;
    title: string;
    cardType: CardType;
    userId: string;
    track: Track;
}

export interface Modifier {
    modifierId: string;
    cardId: string;
    userId: string;
    title: string;
}

@component
export class Game {
    @observable.ref public peer: ObservablePeer<AppUser, MessageType> | undefined = undefined;
    @observable public config: GameConfig = { seed: v4() };
    @observable public phase = GamePhase.LOBBY;

    @observable public round = 0;
    @observable public loading = new Set<LoadingFeatures>();
    @observable public userStates = new Map<string, UserState>();
    @observable public turnOrder: string[] = [];
    @observable public cards = new Map<string, Card>();
    @observable public modifiers = new Map<string, Modifier>();
    @observable public swapped = new Set<string>();

    private messageGameState?: MessageFactory<MessageType, MessageGameState>;
    private messageStartGame?: MessageFactory<MessageType, MessageStartGame>;
    private messageCardAdd?: MessageFactory<MessageType, MessageCardAdd>;
    private messageCardRescue?: MessageFactory<MessageType, MessageCardRescue>;
    private messageCardSwap?: MessageFactory<MessageType, MessageCardSwap>;
    private messageCardKill?: MessageFactory<MessageType, MessageCardKill>;
    private messageCardAddModifier?: MessageFactory<MessageType, MessageCardAddModifier>;
    private messageDecide?: MessageFactory<MessageType, MessageDecide>;
    private messageNextRound?: MessageFactory<MessageType, MessageNextRound>;

    @computed public get userName(): string {
        console.log(this.peer?.disconnectedUsers);
        return this.user?.name ?? "";
    }

    @computed public get userId(): string {
        return this.peer?.userId ?? "";
    }

    @computed public get scoreList(): Score[] {
        return Array.from(this.userStates.entries())
            .sort(([_idA, a], [_idB, b]) => b.score - a.score)
            .map(([playerId, { score }], index) => ({
                playerId,
                playerName: this.getUser(playerId)?.name ?? "",
                score,
                rank: index + 1,
            }));
    }

    @computed public get userList(): AppUser[] {
        return this.peer?.users ?? [];
    }

    @computed public get user(): AppUser | undefined {
        return this.getUser(this.userId);
    }

    public getUser(userId: string): AppUser | undefined {
        return this.peer?.getUser(userId);
    }

    public getRank(playerId: string): number {
        return this.scoreList.find((entry) => entry.playerId === playerId)?.rank ?? 0;
    }

    public changeName(newName: string): void {
        this.peer?.updateUser({ name: newName });
    }

    public async sendStartGame(): Promise<void> {
        if (!this.messageStartGame) {
            throw new Error("Network not initialized.");
        }
        this.loading.add(LoadingFeatures.START_GAME);
        try {
            await this.messageStartGame.send({ config: this.config }).waitForAll();
        } finally {
            this.loading.delete(LoadingFeatures.START_GAME);
        }
    }

    public async sendNextRound(): Promise<void> {
        if (!this.messageNextRound) {
            throw new Error("Network not initialized.");
        }
        this.loading.add(LoadingFeatures.NEXT_ROUND);
        try {
            await this.messageNextRound.send({ config: this.config }).waitForAll();
        } finally {
            this.loading.delete(LoadingFeatures.NEXT_ROUND);
        }
    }

    public async sendRescue(cardId: string): Promise<void> {
        if (!this.messageCardRescue) {
            throw new Error("Network not initialized.");
        }
        this.loading.add(LoadingFeatures.CARD_RESCUE);
        try {
            await this.messageCardRescue.send({ cardId }).waitForAll();
        } finally {
            this.loading.delete(LoadingFeatures.CARD_RESCUE);
        }
    }

    public async sendCardSwap(cardIds: [string, string]): Promise<void> {
        if (!this.messageCardSwap) {
            throw new Error("Network not initialized.");
        }
        this.loading.add(LoadingFeatures.CARD_SWAP);
        try {
            await this.messageCardSwap.send({ cardIds }).waitForAll();
        } finally {
            this.loading.delete(LoadingFeatures.CARD_SWAP);
        }
    }

    public async sendCardAdd(title: string, cardType: CardType): Promise<void> {
        if (!this.messageCardAdd) {
            throw new Error("Network not initialized.");
        }
        this.loading.add(LoadingFeatures.CARD_ADD);
        try {
            await this.messageCardAdd.send({ cardId: v4(), title, cardType }).waitForAll();
        } finally {
            this.loading.delete(LoadingFeatures.CARD_ADD);
        }
    }

    public async sendCardKill(cardId: string): Promise<void> {
        if (!this.messageCardKill) {
            throw new Error("Network not initialized.");
        }
        this.loading.add(LoadingFeatures.CARD_KILL);
        try {
            await this.messageCardKill.send({ cardId }).waitForAll();
        } finally {
            this.loading.delete(LoadingFeatures.CARD_KILL);
        }
    }

    public async sendDecide(track: Track): Promise<void> {
        if (!this.messageDecide) {
            throw new Error("Network not initialized.");
        }
        this.loading.add(LoadingFeatures.DECIDE);
        try {
            await this.messageDecide.send({ track }).waitForAll();
        } finally {
            this.loading.delete(LoadingFeatures.DECIDE);
        }
    }

    @computed public get canSwap(): boolean {
        return this.swappingUser?.id === this.userId;
    }

    @computed public get submittedCard(): Card | undefined {
        const cardType = this.phase === GamePhase.WRITE_GOOD ? CardType.GOOD : CardType.BAD;
        return Array.from(this.cards.values()).find(
            (card) => card.cardType === cardType && card.userId === this.userId,
        );
    }

    @computed public get swappingUser(): AppUser | undefined {
        return this.allManiacs.find((user) => !this.swapped.has(user.id));
    }

    public isUserConductor(userId: string): boolean {
        return this.turnOrder[this.round % this.turnOrder.length] === userId;
    }

    @computed public get isConductor(): boolean {
        return this.isUserConductor(this.userId);
    }

    public isUserManiac(userId: string): boolean {
        return !this.isUserConductor(userId);
    }

    @computed public get isManiac(): boolean {
        return this.isUserManiac(this.userId);
    }

    @computed public get allManiacs(): AppUser[] {
        return this.turnOrder.filter((id) => !this.isUserConductor(id)).map((id) => this.getUser(id)!);
    }

    @action.bound private handleKill(card: Card): void {
        const userState = this.userStates.get(card.userId);
        if (!userState) {
            throw new Error(`Unknown user: ${card.userId}`);
        }
        if (card.cardType === CardType.GOOD) {
            userState.score -= 10;
        }
        if (card.cardType === CardType.BAD) {
            userState.score += 20;
        }
    }

    @action.bound private handleRescue(card: Card): void {
        const userState = this.userStates.get(card.userId);
        if (!userState) {
            throw new Error(`Unknown user: ${card.userId}`);
        }
        if (card.cardType === CardType.GOOD) {
            userState.score += 50;
        }
        if (card.cardType === CardType.BAD) {
            userState.score -= 10;
        }
    }

    public getUserDefaultTrack(userId: string): Track {
        return [Track.TRACK_A, Track.TRACK_B][this.turnOrder.indexOf(userId) % 2];
    }

    @action.bound private startTurn(): void {
        for (const { id } of this.userList) {
            const state = this.userStates.get(id);
            if (!state) {
                this.userStates.set(id, {
                    score: 0,
                });
            }
            this.cards.clear();
            this.modifiers.clear();
            this.swapped.clear();
        }
        if (!this.peer) {
            throw new Error("Network not initialized.");
        }
        this.phase = GamePhase.WRITE_GOOD;
    }

    @action.bound public async initialize(networkId?: string, userId?: string): Promise<void> {
        const options: PeerOptions<AppUser> = {
            applicationProtocolVersion: `${SOFTWARE_VERSION}`,
            peerJsOptions: {
                host: "peerjs.92k.de",
                secure: true,
            },
            pingInterval: 4,
            timeout: 10,
        };
        const user = {
            name: NomineLipsum.full(),
        };
        this.peer =
            typeof networkId === "string"
                ? await createObservableClient(options, networkId, userId ? userId : user)
                : await createObservableHost(options, user);
        this.messageGameState = this.peer.message<MessageGameState>(MessageType.GAME_STATE);
        this.messageStartGame = this.peer.message<MessageStartGame>(MessageType.START_GAME);
        this.messageCardAdd = this.peer.message<MessageCardAdd>(MessageType.CARD_ADD);
        this.messageCardRescue = this.peer.message<MessageCardRescue>(MessageType.CARD_RESCUE);
        this.messageCardSwap = this.peer.message<MessageCardSwap>(MessageType.CARD_SWAP);
        this.messageCardKill = this.peer.message<MessageCardKill>(MessageType.CARD_KILL);
        this.messageCardAddModifier = this.peer.message<MessageCardAddModifier>(MessageType.CARD_ADD_MODIFIER);
        this.messageDecide = this.peer.message<MessageDecide>(MessageType.DECIDE);
        this.messageNextRound = this.peer.message<MessageNextRound>(MessageType.NEXT_ROUND);

        this.messageGameState?.subscribe(
            action(({ config, userStates, cards, modifiers, turnOrder, round, phase, swapped }) => {
                this.config = config;
                this.userStates = new Map(userStates);
                this.cards = new Map(cards.map((card) => [card.cardId, card]));
                this.modifiers = new Map(modifiers.map((modifier) => [modifier.modifierId, modifier]));
                this.turnOrder = turnOrder;
                this.round = round;
                this.phase = phase;
                this.swapped = new Set(swapped);
            }),
        );
        this.messageCardAdd.subscribe(({ title, cardId, cardType }, userId) => {
            this.cards.set(cardId, { title, cardId, userId, cardType, track: this.getUserDefaultTrack(userId) });
            if (this.cards.size < this.allManiacs.length) {
                return;
            }
            if (this.phase === GamePhase.WRITE_GOOD) {
                if (this.allManiacs.length % 2 !== 0) {
                    this.phase = GamePhase.RESCUE;
                } else {
                    this.phase = GamePhase.SWAP_CARDS;
                }
            }
            if (this.phase === GamePhase.WRITE_BAD) {
                if (this.allManiacs.length % 2 !== 0) {
                    this.phase = GamePhase.KILL;
                } else {
                    this.phase = GamePhase.WRITE_MODIFIERS;
                }
            }
        });
        this.messageCardRescue.subscribe(({ cardId }) => {
            const card = this.cards.get(cardId);
            if (!card) {
                throw new Error(`Unknown card: ${cardId}`);
            }
            this.handleRescue(card);
            this.phase = GamePhase.SWAP_CARDS;
        });
        this.messageCardSwap.subscribe(({ cardIds }, userId) => {
            cardIds.forEach((cardId) => {
                const card = this.cards.get(cardId);
                if (!card) {
                    throw new Error(`Unknown card: ${cardId}`);
                }
                card.track = card.track === Track.TRACK_A ? Track.TRACK_B : Track.TRACK_A;
            });
            this.swapped.add(userId);
            if (this.allManiacs.every(({ id }) => this.swapped.has(id))) {
                this.phase = GamePhase.WRITE_BAD;
            }
        });
        this.messageCardKill.subscribe(({ cardId }) => {
            const card = this.cards.get(cardId);
            if (!card) {
                throw new Error(`Unknown card: ${cardId}`);
            }
            this.handleKill(card);
            this.phase = GamePhase.WRITE_MODIFIERS;
        });
        this.messageCardAddModifier.subscribe(({ cardId, modifierId, title }, userId) => {
            this.modifiers.set(modifierId, { title, cardId, userId, modifierId });
            if (this.modifiers.size === this.allManiacs.length) {
                this.phase = GamePhase.DECISION;
            }
        });
        this.messageDecide.subscribe(({ track }) => {
            this.cards.forEach((card) => {
                if (card.track === track) {
                    this.handleKill(card);
                } else {
                    this.handleRescue(card);
                }
            });
            this.phase = GamePhase.SCORES;
        });
        this.messageStartGame.subscribe(({ config }) => {
            this.config = config;
            const rng = randomSeed(config.seed);
            this.turnOrder = shuffle(
                this.userList.map(({ id }) => id),
                () => rng.floatBetween(0, 1),
            );
            this.startTurn();
        });
        this.messageNextRound.subscribe(() => {
            this.round++;
            this.startTurn();
        });
        this.peer.on("userreconnect", (user) => {
            if (!this.peer?.isHost) {
                return;
            }
            this.messageGameState?.send(
                {
                    config: this.config,
                    cards: Array.from(this.cards.values()),
                    userStates: Array.from(this.userStates.entries()),
                    modifiers: Array.from(this.modifiers.values()),
                    turnOrder: this.turnOrder,
                    round: this.round,
                    phase: this.phase,
                    swapped: Array.from(this.swapped.values()),
                },
                user.id,
            );
        });
    }
}
