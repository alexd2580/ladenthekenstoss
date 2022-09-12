import express from 'express';
import * as ws from 'ws';
import * as R from "ramda";
import { v4 as uuidv4 } from 'uuid';
import { Message, Player, state, updateState, Lobby } from "../common/state.mjs";
import { Id } from "../common/id.mjs";

function hostFiles(): express.Express {
  const app = express();
  app.use(express.static('dist'))
  app.use(express.static('static'))
  return app
}

const sockets: Record<Id<Player>, ws.WebSocket> = {};

function send(socket: ws.WebSocket, message: Message) {
  socket.send(JSON.stringify(message));
}

function broadcast(message: Message) {
  const payload = JSON.stringify(message);
  R.values(sockets).forEach((socket: ws.WebSocket) => socket.send(payload));
}

function sendState(socket: ws.WebSocket): void {
  R.forEachObjIndexed((player: Player, id: Id<Player>) => {
    send(socket, { type: "playerConnect", sender: id });
    send(socket, { type: "setName", sender: id, name: player.name });
  }, state.players as Record<Id<Player>, Player>);
  R.forEachObjIndexed((lobby: Lobby, id: Id<Lobby>) => {
    send(socket, { type: "createLobby", sender: lobby.owner });
    send(socket, { type: "renameLobby", sender: lobby.owner, id, name: lobby.name });
  }, state.lobbies as Record<Id<Lobby>, Lobby>);
}

// https://www.typescriptlang.org/docs/handbook/2/conditional-types.html#distributive-conditional-types
type DistributiveOmit<Type, Key extends keyof Type> = Type extends any ? Omit<Type, Key> : never;

function handleMessage(id: Id<Player>, messageNoId: DistributiveOmit<Message, "sender">) {
  const message = { ...messageNoId, sender: id };
  if (updateState(message)) {
    broadcast(message);
  }
};

function handleWebsockets(): ws.WebSocketServer {
  const app = new ws.WebSocketServer({ noServer: true });
  app.on('connection', socket => {
    const id = uuidv4() as Id<Player>;
    sockets[id] = socket;
    sendState(socket);
    const connectMessage = { type: "playerConnect" as "playerConnect", sender: id };
    handleMessage(id, connectMessage);

    socket.on('message', (raw) => handleMessage(id, JSON.parse(raw.toString())));
    socket.on('close', () => {
      const disconnectMessage = { type: "playerDisconnect" as "playerDisconnect", sender: id };
      handleMessage(id, disconnectMessage);
      delete sockets[id];
    });
  });
  return app;
}

function main(): void {
  const expressApp = hostFiles();
  const websocketServer = handleWebsockets();

  const server = expressApp.listen(2580);
  server.on('upgrade', (request, socket, head) =>
    websocketServer.handleUpgrade(request, socket, head,
      (ws) => websocketServer.emit('connection', ws, request)
    )
  );
}

main()
