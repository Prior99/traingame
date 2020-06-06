import * as React from "react";
import classNames from "classnames";
import "./game-card.scss";
import { Segment, Form, Button, Popup, Icon } from "semantic-ui-react";
import { Card, Game, Modifier, LoadingFeatures } from "../../game";
import { observer } from "mobx-react";
import { computed, action, observable } from "mobx";
import { inject, external } from "tsdi";
import { SemanticCOLORS } from "semantic-ui-react/dist/commonjs/generic";
import { CardType, AppUser } from "../../types";
import { Audios, audioHover } from "../../audio";

export interface GameCardProps {
    cardId: string;
    selected?: boolean;
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
    @inject private audios!: Audios;

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
            "GameCard--selected": this.props.selected,
            "GameCard--removed": this.card?.removed,
        });
    }

    @computed private get color(): SemanticCOLORS {
        return this.card?.cardType === CardType.BAD ? "red" : "green";
    }

    @action.bound private handleAddModifierClick(): void {
        this.modifier = "";
    }

    @action.bound private handleChangeModifier(evt: React.SyntheticEvent<HTMLInputElement>): void {
        this.modifier = evt.currentTarget.value;
    }

    @action.bound private handleModifierSubmit(evt: React.SyntheticEvent<unknown>): void {
        evt.preventDefault();
        this.game.sendCardAddModifier(this.modifier ?? "", this.props.cardId);
    }

    @computed private get modifierLoading(): boolean {
        return this.game.loading.has(LoadingFeatures.CARD_ADD_MODIFIER);
    }

    @action.bound private handleHover(): void {
        if (!this.props.onClick) {
            return;
        }
        this.audios.play(audioHover);
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
                    <Segment.Group raised className={this.className} onClick={this.handleClick} onMouseEnter={this.handleHover}>
                        <Segment inverted color={this.color} className="GameCard__title">
                        {this.card?.userId === this.game.userId && <Icon className="GameCard__myIcon" name="heart" />}
                            {this.card?.title}
                        </Segment>
                        {this.props.canAddModifier && (
                            <Segment>
                                {!this.card?.removed &&
                                    (this.modifier === undefined ? (
                                        <Button
                                            size="tiny"
                                            icon="plus"
                                            fluid
                                            content="Add modifier"
                                            onClick={this.handleAddModifierClick}
                                        />
                                    ) : (
                                        <Form className="GameCard__modifier" onSubmit={this.handleModifierSubmit}>
                                            <Form.Input
                                                fluid
                                                value={this.modifier}
                                                onChange={this.handleChangeModifier}
                                                action={
                                                    <Form.Button
                                                        disabled={this.modifierLoading}
                                                        loading={this.modifierLoading}
                                                        icon="check"
                                                        attached="right"
                                                        type="submit"
                                                        onClick={this.handleModifierSubmit}
                                                    />
                                                }
                                            />
                                        </Form>
                                    ))}
                            </Segment>
                        )}
                        {this.props.showUser && <Segment className="GameCard__user">{this.user?.name}</Segment>}
                    </Segment.Group>
                }
                position={this.props.popupPosition}
                disabled={!this.props.showModifiers || this.modifiers.length === 0}
                open={Boolean(this.props.showModifiers && this.modifiers.length > 0)}
            >
                <ul className="GameCard__modifiers">
                    {this.modifiers.map((modifier) => (
                        <li className="GameCard__modifier" key={modifier.modifierId}>
                            {modifier.title}
                        </li>
                    ))}
                </ul>
            </Popup>
        );
    }
}
