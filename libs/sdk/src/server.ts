import { type Server, type Socket } from 'socket.io';

export class GameServer {
  constructor(private server: Server) {}
}
