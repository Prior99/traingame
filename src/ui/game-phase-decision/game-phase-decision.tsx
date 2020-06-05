import * as React from "react";
import classNames from "classnames";
import { observer } from "mobx-react";
import { external, inject } from "tsdi";
import { Game } from "../../game";
import "./game-phase-decision.scss";
import { computed } from "mobx";

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

    public render(): JSX.Element {
        return (
            <div className={this.classNames}>
            </div>
        );
    }
}
