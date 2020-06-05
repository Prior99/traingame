import * as React from "react";
import classNames from "classnames";
import { observer } from "mobx-react";
import { external, inject } from "tsdi";
import { Game } from "../../game";
import "./game-phase-decision.scss";
import { computed } from "mobx";
import { GameTracks } from "../game-tracks";

export interface GamePhaseDecisionProps {
    className?: string;
}

@external
@observer
export class GamePhaseDecision extends React.Component<GamePhaseDecisionProps> {
    @inject private game!: Game;

    @computed private get classNames(): string {
        return classNames(this.props.className, "GamePhaseDecision");
    }

    @computed private get conductorName(): string {
        return this.game.conductor?.name ?? "";
    }

    public render(): JSX.Element {
        return (
            <div className={this.classNames}>
                <div className="GamePhaseDecision__instructions">
                    {this.game.isConductor ? (
                        <>Decide for one track to eradicate.</>
                    ) : (
                        <>
                            Waiting for <b>{this.conductorName}</b> to make a decision...
                        </>
                    )}
                </div>
                <GameTracks className="GamePhaseDecision__tracks" />
            </div>
        );
    }
}
