import * as React from "react";
import classNames from "classnames";
import { observer } from "mobx-react";
import { external, inject } from "tsdi";
import { Game } from "../../game";
import "./game-phase-rescue-kill.scss";
import { computed, action } from "mobx";
import { GamePhase, CardType } from "../../types";
import { GameCard } from "../game-card";

export interface GamePhaseRescueKillProps {
    className?: string;
}

@external
@observer
export class GamePhaseRescueKill extends React.Component<GamePhaseRescueKillProps> {
    @inject private game!: Game;

    @computed private get classNames(): string {
        return classNames(this.props.className, "GamePhaseRescueKill");
    }

    @action.bound private handleClick(cardId: string): void {
        if (this.game.phase === GamePhase.RESCUE) {
            this.game.sendCardRescue(cardId);
        }
        if (this.game.phase === GamePhase.KILL) {
            this.game.sendCardKill(cardId);
        }
    }

    @computed private get conductorName(): string {
        return this.game.conductor?.name ?? "";
    }

    public render(): JSX.Element {
        return (
            <div className={this.classNames}>
                <div className="GamePhaseRescueKill__instructions">
                    {!this.game.isConductor ? (
                        this.game.phase === GamePhase.KILL ? (
                            <>
                                Please wait for <b>{this.conductorName}</b> to select one card to <b>kill</b>.
                            </>
                        ) : (
                            <>
                                Please wait for <b>{this.conductorName}</b> to select one card to <b>rescue</b>.
                            </>
                        )
                    ) : this.game.phase === GamePhase.KILL ? (
                        <>
                            Select one card to <b>kill</b>.
                        </>
                    ) : (
                        <>
                            Select one card to <b>rescue</b>.
                        </>
                    )}
                </div>
                <div className="GamePhaseRescueKill__cards">
                    {Array.from(this.game.cards.values())
                        .filter((card) => {
                            if (this.game.phase === GamePhase.RESCUE) {
                                return card.cardType === CardType.GOOD;
                            }
                            if (this.game.phase === GamePhase.KILL) {
                                return card.cardType === CardType.BAD;
                            }
                        })
                        .map((card) => (
                            <GameCard
                                key={card.cardId}
                                cardId={card.cardId}
                                className="GamePhaseRescueKill__card"
                                onClick={this.game.isConductor ? () => this.handleClick(card.cardId) : undefined}
                            />
                        ))}
                </div>
            </div>
        );
    }
}
