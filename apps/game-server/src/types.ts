import { UserDto } from '@hc/api';
import { Server, Socket } from 'socket.io';
import { ConvexHttpClient } from 'convex/browser';

export type GameServer = Server<
  any,
  any,
  Record<string, never>,
  {
    convexClient: ConvexHttpClient;
    user: UserDto;
  }
>;

export type GameSocket = Socket<
  any,
  any,
  Record<string, never>,
  {
    convexClient: ConvexHttpClient;
    user: UserDto;
  }
>;
