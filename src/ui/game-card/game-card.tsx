import * as React from "react";
import classNames from "classnames";
import "./game-card.scss";
import { Segment, Checkbox, Form, Button, Popup } from "semantic-ui-react";
import { Card, Game, Modifier, LoadingFeatures } from "../../game";
import { observer } from "mobx-react";
import { computed, action, observable } from "mobx";
import { inject, external } from "tsdi";
import { SemanticCOLORS } from "semantic-ui-react/dist/commonjs/generic";
import { CardType, AppUser } from "../../types";

export interface GameCardProps {
    cardId: string;
    selected?: boolean;
    onSelect?: (selected: boolean, cardId: string) => void;
    className?: string;
    showUser?: boolean;
    canAddModifier?: boolean;
    showModifiers?: boolean;
    popupPosition?: "bottom center" | "top center";
    onClick?: (cardId: string) => void;
}

@external
@observer
export class GameCard extends React.Component<GameCardProps> {
    @inject private game!: Game;

    @observable private modifier: string | undefined;

    @computed private get modifiers(): Modifier[] {
        return Array.from(this.game.modifiers.values()).filter((modifier) => modifier.cardId === this.props.cardId);
    }

    @computed private get user(): AppUser | undefined {
        if (!this.card) {
            return;
        }
        return this.game.getUser(this.card.userId);
    }

    @computed private get card(): Card | undefined {
        return this.game.cards.get(this.props.cardId);
    }

    @computed private get className(): string {
        return classNames("GameCard", this.props.className, {
            "GameCard--clickable": this.props.onClick,
            "GameCard--removed": this.card?.removed,
        });
    }

    @computed private get color(): SemanticCOLORS {
        return this.card?.cardType === CardType.BAD ? "red" : "green";
    }

    @action.bound private handleSelectChange(_evt: React.SyntheticEvent<HTMLInputElement>): void {
        if (!this.props.onSelect) {
            return;
        }
        this.props.onSelect(!this.props.selected, this.props.cardId);
    }

    @action.bound private handleAddModifierClick(): void {
        this.modifier = "";
    }

    @action.bound private handleChangeModifier(evt: React.SyntheticEvent<HTMLInputElement>): void {
        this.modifier = evt.currentTarget.value;
    }

    @action.bound private handleModifierSubmit(evt: React.SyntheticEvent<HTMLFormElement>): void {
        evt.preventDefault();
        this.game.sendCardAddModifier(this.modifier ?? "", this.props.cardId);
    }

    @computed private get modifierLoading(): boolean {
        return this.game.loading.has(LoadingFeatures.CARD_ADD_MODIFIER);
    }

    @action.bound private handleClick(): void {
        if (!this.props.onClick) {
            return;
        }
        this.props.onClick(this.props.cardId);
    }

    @computed private get swapLoading(): boolean {
        return this.game.loading.has(LoadingFeatures.CARD_SWAP);
    }

    public render(): JSX.Element {
        return (
            <Popup
                trigger={
                    <Segment className={this.className} inverted color={this.color} onClick={this.handleClick}>
                        <div className="GameCard__title">{this.card?.title}</div>
                        {this.props.canAddModifier &&
                            !this.card?.removed &&
                            (this.modifier === undefined ? (
                                <Button icon="plus" content="Add modifier" onClick={this.handleAddModifierClick} />
                            ) : (
                                <Form className="GameCard__select" onSubmit={this.handleModifierSubmit}>
                                    <Form.Field>
                                        <label>Modifier</label>
                                        <Form.Input value={this.modifier} onChange={this.handleChangeModifier} />
                                    </Form.Field>
                                    <Form.Field>
                                        <label>Add Modifier</label>
                                        <Form.Button
                                            disabled={this.modifierLoading}
                                            loading={this.modifierLoading}
                                            primary
                                            content="Okay"
                                            icon="check"
                                        />
                                    </Form.Field>
                                </Form>
                            ))}
                        {this.props.showUser && <div className="GameCard__user">{this.user?.name}</div>}
                        {this.props.onSelect && !this.card?.removed && (
                            <div className="GameCard__select">
                                <label>
                                    <Checkbox
                                        disabled={this.swapLoading}
                                        checked={this.props.selected}
                                        onChange={this.handleSelectChange}
                                    />{" "}
                                    Select
                                </label>
                            </div>
                        )}
                    </Segment>
                }
                position={this.props.popupPosition}
                inverted
                disabled={!this.props.showModifiers || this.modifiers.length === 0}
                open={Boolean(this.props.showModifiers && this.modifiers.length > 0)}
            >
                <div className="GameCard__modifiers">
                    {this.modifiers.map((modifier) => (
                        <div className="GameCard__modifier" key={modifier.modifierId}>
                            <div className="GameCard__modifierTitle">{modifier.title}</div>
                        </div>
                    ))}
                </div>
            </Popup>
        );
    }
}
