import * as React from "react";
import classNames from "classnames";
import "./game-tracks.scss";
import { Game, LoadingFeatures } from "../../game";
import { observer } from "mobx-react";
import { computed, observable, action } from "mobx";
import { inject, external } from "tsdi";
import { Track, GamePhase } from "../../types";
import { GameTrack } from "../game-track/game-track";

export interface GameTracksProps {
    className?: string;
}

@external
@observer
export class GameTracks extends React.Component<GameTracksProps> {
    @inject private game!: Game;

    @observable private selectedCards = new Set<string>();

    @computed private get className(): string {
        return classNames("GameTracks", this.props.className);
    }

    @action.bound private async handleSelect(selected: boolean, cardId: string): Promise<void> {
        if (this.game.loading.has(LoadingFeatures.CARD_SWAP)) {
            return;
        }
        if (selected) {
            this.selectedCards.add(cardId);
        } else {
            this.selectedCards.delete(cardId);
        }
        if (this.selectedCards.size === 2) {
            await this.game.sendCardSwap(Array.from(this.selectedCards.values()) as [string, string]);
            this.selectedCards.clear();
        }
    }

    @computed private get decideTrack(): boolean {
        return this.game.isConductor && this.game.phase === GamePhase.DECISION;
    }

    @action.bound private handleClick(track: Track): void {
        this.game.sendDecide(track);
    }

    @computed private get decideLoading(): boolean {
        return this.game.loading.has(LoadingFeatures.DECIDE);
    }

    private isCardOnTrackSelected(track: Track): boolean {
        if (this.selectedCards.size !== 1) {
            return false;
        }
        return this.game.cards.get(Array.from(this.selectedCards.values())[0])?.track === track;
    }

    public render(): JSX.Element {
        return (
            <div className={this.className}>
                {[Track.TRACK_A, Track.TRACK_B].map((track) => (
                    <div key={track} className="GameTracks__trackWrapper">
                        <GameTrack
                            onClick={!this.decideLoading && this.decideTrack ? () => this.handleClick(track) : undefined}
                            track={track}
                            className="GameTracks__track"
                            popupPosition={track === Track.TRACK_A ? "top center" : "bottom center"}
                            onCardSelect={this.game.canSwap && !this.isCardOnTrackSelected(track) ? this.handleSelect : undefined}
                            selectedCards={this.selectedCards}
                        />
                    </div>
                ))}
            </div>
        );
    }
}
