import type { Values } from '@game/shared';

export const LOBBY_STATUS = {
  WAITING_FOR_PLAYERS: 'WAITING_FOR_PLAYERS',
  CREATING_GAME: 'CREATING_GAME',
  ONGOING: 'ONGOING'
} as const;

export type LobbyStatus = Values<typeof LOBBY_STATUS>;

export const LOBBY_USER_ROLES = {
  PLAYER: 'PLAYER',
  SPECTATOR: 'SPECTATOR'
} as const;

export type LobbyUserRole = Values<typeof LOBBY_USER_ROLES>;

export const MAX_PLAYERS_PER_LOBBY = 2;
