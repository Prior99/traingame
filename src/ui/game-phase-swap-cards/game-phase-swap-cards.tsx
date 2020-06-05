import * as React from "react";
import classNames from "classnames";
import { observer } from "mobx-react";
import { external, inject } from "tsdi";
import { Game } from "../../game";
import "./game-phase-swap-cards.scss";
import { computed } from "mobx";

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

    public render(): JSX.Element {
        return (
            <div className={this.classNames}>
            </div>
        );
    }
}
