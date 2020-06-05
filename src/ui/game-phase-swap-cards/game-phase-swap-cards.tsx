import * as React from "react";
import classNames from "classnames";
import { observer } from "mobx-react";
import { external, inject } from "tsdi";
import { Game } from "../../game";
import "./game-phase-swap-cards.scss";
import { computed } from "mobx";
import { GameTracks } from "../game-tracks";

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

    public render(): JSX.Element {
        return (
            <div className={this.classNames}>
                <div className="GamePhaseSwapCards__instructions">
                    {this.game.canSwap ? (
                        <>
                            You <b>must</b> swap two cards.
                        </>
                    ) : (
                        <>
                            Please wait for <b>{this.swapUserName}</b> to swap two cards.
                        </>
                    )}
                </div>
                <GameTracks className="GamePhaseSwapCards__tracks" />
            </div>
        );
    }
}
