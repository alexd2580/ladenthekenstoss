import { v4 as uuidv4 } from 'uuid';
import { Id } from "./id.mjs";

export type Map = "nuke" | "inferno";

export interface Player {
  readonly _typeName: "Player";
  fingerprint?: string;
  name: string;
  lobby?: Id<Lobby>;
};

export interface VetoVoting {
  readonly type: "veto";
};

export interface EliminationVoting {
  readonly type: "elimination";
};

export interface Lobby {
  readonly _typeName: "Lobby";
  owner: Id<Player>;
  name: string;
  members: Id<Player>[]; // Includes owner.
  maps: Set<Map>;

  voting?: VetoVoting | EliminationVoting;
  voting_started: boolean;
};

export interface State {
  players: { [id: string]: Player };
  lobbies: { [id: string]: Lobby };
};

export const state: State = {
  players: {},
  lobbies: {}
};

export interface MessageBase<TType extends string> {
  type: TType;
  sender: Id<Player>;
};

export interface MessagePlayerConnect extends MessageBase<"playerConnect"> { };
export interface MessagePlayerDisconnect extends MessageBase<"playerDisconnect"> { };

export interface MessageSetName extends MessageBase<"setName"> {
  name: string;
};

export interface MessageCreateLobby extends MessageBase<"createLobby"> { };

export interface MessageRenameLobby extends MessageBase<"renameLobby"> {
  id: Id<Lobby>;
  name: string;
};

export interface MessageJoinLobby extends MessageBase<"joinLobby"> {
  id: Id<Lobby>;
};

export interface MessageLeaveLobby extends MessageBase<"leaveLobby"> {
  id: Id<Lobby>;
};

export type Message
  = MessagePlayerConnect
  | MessagePlayerDisconnect
  | MessageSetName
  | MessageCreateLobby
  | MessageRenameLobby
  | MessageJoinLobby
  | MessageLeaveLobby;

export function updateState(message: Message): boolean {
  const { sender: playerId } = message;
  const player = state.players[playerId];

  if (message.type === "playerConnect") {
    state.players[playerId] = { _typeName: "Player", name: uuidv4() };
  } else if (message.type == "playerDisconnect") {

  } else if (message.type == "setName") {
    player.name = message.name;
  } else if (message.type === "createLobby") {
    const id = uuidv4() as Id<Player>;
    state.lobbies[id] = {
      _typeName: "Lobby",
      owner: playerId,
      name: uuidv4(),
      members: [],
      maps: new Set(["nuke", "inferno"]),
      voting_started: false,
    };
  } else if (message.type === "renameLobby") {
    state.lobbies[message.id].name = message.name;
  } else if (message.type === "joinLobby") {
    if (player.lobby !== undefined) {
      return false;
    }
    const lobbyId = message.id;
    state.lobbies[lobbyId].members.push(playerId);
    player.lobby = lobbyId;
  } else if (message.type === "leaveLobby") {
    const prevLobbyId = player.lobby;
    if (prevLobbyId === undefined) {
      return false;
    }

    const prevLobby = state.lobbies[prevLobbyId]
    const members = prevLobby.members;
    const index = members.indexOf(playerId);
    members.splice(index, 1);

    if (members.length === 0) {
      delete state.lobbies[prevLobbyId];
    } else if (prevLobby.owner === playerId) {
      prevLobby.owner = prevLobby.members[0];
    }

    player.lobby = undefined;
  }
  return true;
}
