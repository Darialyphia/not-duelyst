import { type Server, type Socket } from 'socket.io';

export class GameServer {
  private nextEventId = 0;
  constructor(private server: Server) {}
}
