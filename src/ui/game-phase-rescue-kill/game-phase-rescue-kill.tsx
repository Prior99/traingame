import * as React from "react";
import classNames from "classnames";
import { observer } from "mobx-react";
import { external, inject } from "tsdi";
import { Game } from "../../game";
import "./game-phase-rescue-kill.scss";
import { computed } from "mobx";

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

    public render(): JSX.Element {
        return (
            <div className={this.classNames}>
            </div>
        );
    }
}
