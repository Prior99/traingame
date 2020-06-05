import * as React from "react";
import { addRoute, RouteProps } from "../../routing";
import { external, inject } from "tsdi";
import { observer } from "mobx-react";
import { LobbyMode, GamePhase } from "../../types";
import "./page-game.scss";
import { Game } from "../../game";
import { computed } from "mobx";
import {
    GamePhaseLobby,
    GamePhaseScores,
    DisconnectedModal,
    GamePhaseWriteCards,
    GamePhaseRescueKill,
    GamePhaseSwapCards,
    GamePhaseWriteModifiers,
    GamePhaseDecision,
} from "../../ui";
import { unreachable } from "../../utils";
import { ReconnectModal, ConnectLoader } from "p2p-networking-semantic-ui-react";

export interface PageGameProps {
    lobbyMode: LobbyMode;
    peerId?: string;
    userId?: string;
}

@external
@observer
export class PageGame extends React.Component<RouteProps<PageGameProps>> {
    @inject private game!: Game;

    async componentDidMount(): Promise<void> {
        const { lobbyMode, peerId, userId } = this.props.match.params;
        if (lobbyMode === LobbyMode.HOST) {
            await this.game.initialize();
        } else {
            if (userId) {
                await this.game.initialize(peerId!, userId);
            } else {
                await this.game.initialize(peerId!);
            }
        }
    }

    @computed public get component(): JSX.Element {
        switch (this.game.phase) {
            case GamePhase.LOBBY:
                return <GamePhaseLobby />;
            case GamePhase.WRITE_GOOD:
                return <GamePhaseWriteCards />;
            case GamePhase.RESCUE:
                return <GamePhaseRescueKill />;
            case GamePhase.SWAP_CARDS:
                return <GamePhaseSwapCards />;
            case GamePhase.WRITE_BAD:
                return <GamePhaseWriteCards />;
            case GamePhase.KILL:
                return <GamePhaseRescueKill />;
            case GamePhase.WRITE_MODIFIERS:
                return <GamePhaseWriteModifiers />;
            case GamePhase.DECISION:
                return <GamePhaseDecision />;
            case GamePhase.SCORES:
                return <GamePhaseScores />;
            default:
                unreachable(this.game.phase);
        }
    }

    public render(): JSX.Element {
        return (
            <div className="PageGame">
                <DisconnectedModal />
                <ReconnectModal peer={this.game.peer} />
                <ConnectLoader peer={this.game.peer} />
                {this.component}
            </div>
        );
    }
}

export const routeGame = addRoute<PageGameProps>({
    path: (lobbyMode: LobbyMode, peerId?: string, userId?: string) => {
        switch (lobbyMode) {
            case LobbyMode.CLIENT:
                if (userId) {
                    return `/game/client/${peerId}/${userId}`;
                }
                return `/game/client/${peerId}`;
            case LobbyMode.HOST:
                return `/game/host`;
        }
    },
    pattern: "/game/:lobbyMode/:peerId?/:userId?",
    component: PageGame,
});
