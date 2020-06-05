import * as React from "react";
import classNames from "classnames";
import { observer } from "mobx-react";
import { external, inject } from "tsdi";
import { Game, LoadingFeatures } from "../../game";
import "./game-phase-write-cards.scss";
import { computed, observable, action } from "mobx";
import { CardType, GamePhase } from "../../types";
import { Form } from "semantic-ui-react";

export interface GamePhaseWriteCardsProps {
    className?: string;
}

@external
@observer
export class GamePhaseWriteCards extends React.Component<GamePhaseWriteCardsProps> {
    @inject private game!: Game;
    @observable private title = "";

    @computed private get classNames(): string {
        return classNames(this.props.className, "GamePhaseWriteCards", {
            "GamePhaseWriteCards--good": this.cardType === CardType.GOOD,
            "GamePhaseWriteCards--bad": this.cardType === CardType.BAD,
            "GamePhaseWriteCards--conductor": this.game.isConductor,
        });
    }

    @computed private get cardType(): CardType {
        if (this.game.phase === GamePhase.WRITE_GOOD) {
            return CardType.GOOD;
        }
        return CardType.BAD;
    }

    @action.bound private handleTitleChange(evt: React.SyntheticEvent<HTMLInputElement>): void {
        this.title = evt.currentTarget.value;
    }

    @action.bound private async handleSubmit(evt: React.SyntheticEvent<HTMLFormElement>): Promise<void> {
        evt.preventDefault();
        const { cardType, title } = this;
        await this.game.sendCardAdd(title, cardType);
        this.title = "";
    }

    @computed private get disabled(): boolean {
        return this.loading || Boolean(this.game.submittedCard);
    }

    @computed private get loading(): boolean {
        return this.game.loading.has(LoadingFeatures.CARD_ADD);
    }

    @computed private get conductorName(): string {
        return this.game.conductor?.name ?? "";
    }

    public render(): JSX.Element {
        return (
            <div className={this.classNames}>
                <>
                    <div className="GamePhaseWriteCards__instructions">
                        {this.game.isConductor || Boolean(this.game.submittedCard) ? (
                            <>Waiting for {this.game.missingCardUsers.map((user) => user.name).join(", ")}...</>
                        ) : this.cardType === CardType.GOOD ? (
                            <>
                                Write something <b>good</b> that {this.conductorName} would rescue.
                            </>
                        ) : (
                            <>
                                Write something <b>bad</b> that {this.conductorName} would kill.
                            </>
                        )}
                    </div>
                    {!this.game.isConductor && (
                        <Form className="GamePhaseWriteCards__form" onSubmit={this.handleSubmit}>
                            <Form.Field>
                                <Form.Input
                                    disabled={this.disabled}
                                    value={this.title}
                                    onChange={this.handleTitleChange}
                                    inverted
                                />
                            </Form.Field>
                            <Form.Field>
                                <Form.Button
                                    disabled={this.disabled || this.title.length === 0}
                                    loading={this.loading}
                                    content="Okay"
                                    icon="check"
                                    fluid
                                    inverted
                                />
                            </Form.Field>
                        </Form>
                    )}
                </>
            </div>
        );
    }
}
