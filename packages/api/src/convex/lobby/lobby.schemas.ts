import { defineTable } from 'convex/server';
import { v, type Validator } from 'convex/values';
import {
  LOBBY_STATUS,
  LOBBY_USER_ROLES,
  type LobbyStatus,
  type LobbyUserRole
} from './lobby.constants';

export const LOBBY_STATUS_VALIDATOR = v.union(
  v.literal(LOBBY_STATUS.ONGOING),
  v.literal(LOBBY_STATUS.WAITING_FOR_PLAYERS)
) as Validator<LobbyStatus>;

export const LOBBY_USER_ROLE_VALIDATOR = v.union(
  v.literal(LOBBY_USER_ROLES.SPECTATOR),
  v.literal(LOBBY_USER_ROLES.PLAYER)
) as Validator<LobbyUserRole>;

export const lobbySchemas = {
  lobbies: defineTable({
    name: v.string(),
    ownerId: v.id('users'),
    formatId: v.optional(v.id('formats')),
    password: v.optional(v.string()),
    status: LOBBY_STATUS_VALIDATOR
  }).index('by_owner_id', ['ownerId']),

  lobbyUsers: defineTable({
    userId: v.id('users'),
    loadoutId: v.optional(v.id('loadouts')),
    lobbyId: v.id('lobbies'),
    role: LOBBY_USER_ROLE_VALIDATOR
  })
    .index('by_lobby_id', ['lobbyId'])
    .index('by_user_id', ['userId'])
    .index('by_lobby_user', ['lobbyId', 'userId']),

  lobbyMessages: defineTable({
    userId: v.id('users'),
    lobbyId: v.id('lobbies')
  }).index('by_lobby_id', ['lobbyId'])
};
