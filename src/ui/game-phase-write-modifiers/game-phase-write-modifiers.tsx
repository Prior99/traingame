import * as React from "react";
import classNames from "classnames";
import { observer } from "mobx-react";
import { external, inject } from "tsdi";
import { Game } from "../../game";
import "./game-phase-write-modifiers.scss";
import { computed } from "mobx";
import { GameTracks } from "../game-tracks";

export interface GamePhaseWriteModifiersProps {
    className?: string;
}

@external
@observer
export class GamePhaseWriteModifiers extends React.Component<GamePhaseWriteModifiersProps> {
    @inject private game!: Game;

    @computed private get classNames(): string {
        return classNames(this.props.className, "GamePhaseWriteModifiers");
    }

    public render(): JSX.Element {
        return (
            <div className={this.classNames}>
                <div className="GamePhaseWriteModifiers__instructions">
                    Add a modifier to <b>one</b> card of your choice.
                </div>
                <GameTracks className="GamePhaseWriteModifiers__tracks" />
            </div>
        );
    }
}
