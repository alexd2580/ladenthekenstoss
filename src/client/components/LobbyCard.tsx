// import { Id } from "../common/id.mjs";
// // import {  } from "../client/render.mjs";
// import { renderSync } from "./render.mjs";
// import { element } from "../render.mjs";


//
// function renderState(appDiv: HTMLElement, state: State): void {
//     const playersDiv = getOrAppend(appDiv, "div", "players-div");
//     renderPlayers(playersDiv, state.players);
//     const lobbiesDiv = getOrAppend(appDiv, "div", "lobbies-div");
//     renderLobbies(lobbiesDiv, state.lobbies);
// }
//
// function renderPlayers(playersDiv: HTMLElement, players: { [key: string]: Player }): void {
//     Object.entries(players).forEach(([id, player]) => {
//         const playerDiv = getOrAppend(playersDiv, "div", id);
//         playerDiv.className = "card";
//         // playerDiv.style.border = "1px solid black";
//         renderPlayer(playerDiv, id as Id<Player>, player)
//     });
// }
//
// function renderPlayer(playerDiv: HTMLElement, id: Id<Player>, player: Player): void {
//     const playerName = getOrAppend(playerDiv, "p", `${id}-name`);
//     playerName.innerHTML = `Name: ${player.name}`;
// }
//
// function renderLobbies(lobbiesDiv: HTMLElement, lobbies: { [key: string]: Lobby }) {
//     Object.entries(lobbies).forEach(([id, lobby]) => {
//         const lobbyDiv = getOrAppend(lobbiesDiv, "div", id);
//         lobbyDiv.className = "card";
//         lobbyDiv.style.border = "1px solid black";
//         renderLobby(lobbyDiv, id as Id<Lobby>, lobby)
//     });
// }
//
// function renderLobby(lobbyDiv: HTMLElement, id: Id<Lobby>, lobby: Lobby): void {
//     const lobbyName = getOrAppend(lobbyDiv, "p", `${id}-name`);
//     lobbyName.innerHTML = `Name: ${lobby.name}`;
// }


import { Lobby } from "../../common/state.mjs";
import { element, HTMLElementBuilder } from "../element.mjs";

export const LobbyCard = ({ owner, name, members, maps, voting, voting_started }: Lobby): HTMLElementBuilder => (
    <div class="card">
        <header class="card-header">
            <p class="card-header-title">
                {name}
            </p>
        </header>
        <div class="card-content" style="lol">
            <div class="content">
                Lorem ipsum leo risus, porta ac consectetur ac, vestibulum at eros. Donec id elit non mi porta gravida at eget metus. Cum sociis natoque penatibus et magnis dis parturient montes, nascetur ridiculus mus. Cras mattis consectetur purus sit amet fermentum.
            </div>
        </div>
    </div>
);
