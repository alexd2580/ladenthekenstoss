import { state, updateState } from "../common/state.mjs";
import { App } from "./App.js";
import { render } from "./element.mjs";

function rerender(): void {
  render(App(state), "app");
}

function handleRawMessage(rawMessage: MessageEvent<any>) {
  const message = JSON.parse(rawMessage.data);
  updateState(message);
  rerender();
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
