import { State } from "../common/state.mjs";
import { element, HTMLElementBuilder } from "./element.mjs";
import { LobbyCard } from "./components/LobbyCard.js";

export const App = ({ lobbies }: State): HTMLElementBuilder => (
    <div class="columns">
        <div class="column">
            {...Object.values(lobbies).map(LobbyCard)}
        </div>
        <div class="column">
            Players here
        </div>
    </div>
);
