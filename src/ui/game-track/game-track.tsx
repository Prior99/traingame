import * as React from "react";
import classNames from "classnames";
import "./game-track.scss";
import { Game, Card } from "../../game";
import { observer } from "mobx-react";
import { computed } from "mobx";
import { inject, external } from "tsdi";
import { Track, GamePhase } from "../../types";
import { GameCard } from "../game-card";

export interface GameTrackProps {
    track: Track;
    className?: string;
    popupPosition?: "bottom center" | "top center";
    onCardSelect?: (selected: boolean, cardId: string) => void;
    selectedCards: Set<string>;
}

@external
@observer
export class GameTrack extends React.Component<GameTrackProps> {
    @inject private game!: Game;

    @computed private get cards(): Card[] {
        return this.game.cardsOnTrack(this.props.track);
    }

    @computed private get className(): string {
        return classNames("GameTrack", this.props.className);
    }

    public render(): JSX.Element {
        return (
            <div className={this.className}>
                {this.cards.map(card => (
                    <GameCard
                        key={card.cardId}
                        cardId={card.cardId}
                        canAddModifier={this.game.canAddModifier}
                        popupPosition={this.props.popupPosition}
                        showModifiers={this.game.phase !== GamePhase.WRITE_MODIFIERS}
                        showUser={false}
                        className="Track__gameCard"
                        selected={this.props.selectedCards.has(card.cardId)}
                        onSelect={this.props.onCardSelect ? this.props.onCardSelect : undefined}
                    />
                ))}
            </div>
        );
    }
}
