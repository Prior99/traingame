import * as React from "react";
import classNames from "classnames";
import { observer } from "mobx-react";
import { external, inject } from "tsdi";
import { Game } from "../../game";
import "./game-phase-write-cards.scss";
import { computed } from "mobx";

export interface GamePhaseWriteCardsProps {
    className?: string;
}

@external
@observer
export class GamePhaseWriteCards extends React.Component<GamePhaseWriteCardsProps> {
    @inject private game!: Game;

    @computed private get classNames(): string {
        return classNames(this.props.className, "GamePhaseWriteCards");
    }

    public render(): JSX.Element {
        return (
            <div className={this.classNames}>
            </div>
        );
    }
}
