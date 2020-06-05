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
            "GamePhaseWriteCard--good": this.cardType === CardType.GOOD,
            "GamePhaseWriteCard--bad": this.cardType === CardType.BAD,
            "GamePhaseWriteCard--conductor": this.game.isConductor,
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
                {this.game.isConductor ? (
                    <div className="GamePhaseWriteCard__conductor">Please wait for other players...</div>
                ) : (
                    <>
                        <div className="GamePhaseWriteModifiers__instructions">
                            {this.cardType === CardType.GOOD ? (
                                <>
                                    Write something <b>good</b> that {this.conductorName} would consider worth rescuing.
                                </>
                            ) : (
                                <>
                                    Write something <b>bad</b> that {this.conductorName} would want to see run over by a
                                    train..
                                </>
                            )}
                        </div>
                        <Form className="GamePhaseWriteCard__form" onSubmit={this.handleSubmit}>
                            <Form.Field>
                                <label>Title</label>
                                <Form.Input
                                    disabled={this.disabled}
                                    value={this.title}
                                    onChange={this.handleTitleChange}
                                />
                            </Form.Field>
                            <Form.Field>
                                <label>Done</label>
                                <Form.Button
                                    disabled={this.disabled}
                                    loading={this.loading}
                                    content="Okay"
                                    icon="check"
                                    primary
                                />
                            </Form.Field>
                        </Form>
                    </>
                )}
            </div>
        );
    }
}
