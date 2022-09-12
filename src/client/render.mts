import { Id } from "../common/id.mjs";
import { state, updateState, Player, Lobby, State } from "../common/state.mjs";
import {  } from "../client/render.mjs";

function handleRawMessage(rawMessage: MessageEvent<any>) {
  const message = JSON.parse(rawMessage.data);
  updateState(message);
  renderState(document.getElementById("state")!, state);
}

let ws: WebSocket;

function connectToWsBackend(): void {
  if (!("WebSocket" in window)) {
    alert("WebSocket is not supported by your Browser!");
    return;
  }

  ws = new WebSocket("ws://localhost:2580");
  ws.onopen = () => console.log("Connected");
  ws.onmessage = handleRawMessage;
  ws.onclose = () => alert("Connection is closed...");
};

Object.defineProperty(window, "connectToWsBackend", { value: connectToWsBackend });


function setName(): void {
  ws.send(JSON.stringify({ type: "setName", "name": (new Date()).toString() }));
}

Object.defineProperty(window, "setName", { value: setName });

function getOrAppend(parent: HTMLElement, tag: "div" | "p", id: string): HTMLElement {
  let element = document.getElementById(id);
  if (element === null) {
    element = document.createElement(tag);
    element.setAttribute("id", id);
    parent.appendChild(element);
  }
  return element;
}

function renderState(appDiv: HTMLElement, state: State): void {
  const playersDiv = getOrAppend(appDiv, "div", "players-div");
  renderPlayers(playersDiv, state.players);
  const lobbiesDiv = getOrAppend(appDiv, "div", "lobbies-div");
  renderLobbies(lobbiesDiv, state.lobbies);
}

function renderPlayers(playersDiv: HTMLElement, players: { [key: string]: Player }): void {
  Object.entries(players).forEach(([id, player]) => {
    const playerDiv = getOrAppend(playersDiv, "div", id);
    playerDiv.className = "card";
    // playerDiv.style.border = "1px solid black";
    renderPlayer(playerDiv, id as Id<Player>, player)
  });
}

function renderPlayer(playerDiv: HTMLElement, id: Id<Player>, player: Player): void {
  const playerName = getOrAppend(playerDiv, "p", `${id}-name`);
  playerName.innerHTML = `Name: ${player.name}`;
}

function renderLobbies(lobbiesDiv: HTMLElement, lobbies: { [key: string]: Lobby }) {
  Object.entries(lobbies).forEach(([id, lobby]) => {
    const lobbyDiv = getOrAppend(lobbiesDiv, "div", id);
    lobbyDiv.className = "card";
    lobbyDiv.style.border = "1px solid black";
    renderLobby(lobbyDiv, id as Id<Lobby>, lobby)
  });
}

function renderLobby(lobbyDiv: HTMLElement, id: Id<Lobby>, lobby: Lobby): void {
  const lobbyName = getOrAppend(lobbyDiv, "p", `${id}-name`);
  lobbyName.innerHTML = `Name: ${lobby.name}`;
}

