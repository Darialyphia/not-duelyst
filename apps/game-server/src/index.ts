import 'dotenv/config';
import { createServer } from 'http';
import { Server } from 'socket.io';
import url from 'url';

const PORT = process.env.PORT || 8000;

async function main() {
  const httpServer = createServer((req, res) => {
    // Parse the request url
    const reqUrl = url.parse(req.url!).pathname;
    if (reqUrl == '/') {
      res.write('OK');
      res.end();
    }
  });
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
