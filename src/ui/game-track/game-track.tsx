import * as React from "react";
import classNames from "classnames";
import "./game-track.scss";
import { Game, Card } from "../../game";
import { observer } from "mobx-react";
import { computed, action } from "mobx";
import { inject, external } from "tsdi";
import { Track, GamePhase } from "../../types";
import { GameCard } from "../game-card";
import { Audios, audioKillHover } from "../../audio";

export interface GameTrackProps {
    track: Track;
    className?: string;
    popupPosition?: "bottom center" | "top center";
    onCardSelect?: (cardId: string) => void;
    selectedCards: Set<string>;
    onClick?: (track: Track) => void;
}

@external
@observer
export class GameTrack extends React.Component<GameTrackProps> {
    @inject private game!: Game;
    @inject private audios!: Audios;

    @computed private get cards(): Card[] {
        return this.game.cardsOnTrack(this.props.track);
    }

    @computed private get className(): string {
        return classNames("GameTrack", this.props.className, {
            "GameTrack--killable": this.canKill,
            "GameTrack--killed": this.game.decidedTrack === this.props.track,
        });
    }

    @computed private get canKill(): boolean {
        return this.game.isConductor && this.game.phase === GamePhase.DECISION;
    }

    @action.bound private handleHover(): void {
        if (!this.props.onClick) {
            return;
        }
        this.audios.play(audioKillHover);
    }

    @action.bound private handleClick(): void {
        if (!this.props.onClick) {
            return;
        }
        this.props.onClick(this.props.track);
    }

    public render(): JSX.Element {
        return (
            <div className={this.className} onClick={this.handleClick} onMouseEnter={this.handleHover}>
                {this.cards
                    .filter((card) => !card.removed)
                    .map((card) => (
                        <GameCard
                            key={card.cardId}
                            cardId={card.cardId}
                            canAddModifier={this.game.canAddModifier}
                            popupPosition={this.props.popupPosition}
                            showModifiers={this.game.phase !== GamePhase.WRITE_MODIFIERS}
                            showUser={false}
                            className="GameTrack__gameCard"
                            selected={this.props.selectedCards.has(card.cardId)}
                            onClick={this.props.onCardSelect ? () => this.props.onCardSelect!(card.cardId) : undefined}
                        />
                    ))}
                <div className="GameTrack__killer">{this.game.decidedTrack ? "Killed!" : "Kill them all!"}</div>
            </div>
        );
    }
}
