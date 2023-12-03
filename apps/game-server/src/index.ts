import 'dotenv/config';
import { createServer } from 'http';
import { Server } from 'socket.io';
import url from 'url';

const PORT = process.env.PORT || 8000;

async function main() {
  const httpServer = createServer();
  const io = new Server(httpServer, {
    cors: {
      origin: '*',
      methods: ['GET', 'POST']
    }
  });

  httpServer.listen(PORT);

  console.log(`Server running on port ${PORT}`);
}

main();
