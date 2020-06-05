import * as React from "react";
import classNames from "classnames";
import { observer } from "mobx-react";
import { external, inject } from "tsdi";
import { Game, LoadingFeatures } from "../../game";
import "./game-phase-swap-cards.scss";
import { computed, action } from "mobx";
import { GameTracks } from "../game-tracks";
import { Button } from "semantic-ui-react";

export interface GamePhaseSwapCardsProps {
    className?: string;
}

@external
@observer
export class GamePhaseSwapCards extends React.Component<GamePhaseSwapCardsProps> {
    @inject private game!: Game;

    @computed private get classNames(): string {
        return classNames(this.props.className, "GamePhaseSwapCards");
    }

    @computed private get swapUserName(): string {
        return this.game.swappingUser?.name ?? "";
    }

    @action.bound private handleSwapSkip(): void {
        this.game.sendCardSwap();
    }

    @computed private get swapLoading(): boolean {
        return this.game.loading.has(LoadingFeatures.CARD_SWAP);
    }

    public render(): JSX.Element {
        return (
            <div className={this.classNames}>
                <div className="GamePhaseSwapCards__instructions">
                    {this.game.canSwap ? (
                        <>
                            You <b>can</b> swap two cards.
                        </>
                    ) : (
                        <>
                            Please wait for <b>{this.swapUserName}</b> to swap two cards.
                        </>
                    )}
                </div>
                <GameTracks className="GamePhaseSwapCards__tracks" />
                {this.game.canSwap && (
                    <Button
                        inverted
                        disabled={this.swapLoading}
                        loading={this.swapLoading}
                        onClick={this.handleSwapSkip}
                        icon="redo"
                        content="No, thanks"
                    />
                )}
            </div>
        );
    }
}
