import express from 'express';
import { createServer } from 'http';
import { Server } from 'socket.io';
import { setupRabbitMQ } from './rabbitmq';
import { handleMatchingRequest, handleDisconnected } from './matchingService';

const app = express();
const server = createServer(app);
export const io = new Server(server, {
  cors: {
    origin: "http://localhost:3000",
  }
});

const PORT = process.env.PORT || 3003;

function setupSocketIO(io: Server) {
  io.on('connection', (socket) => {
    console.log('A user connected:', socket.id);

    socket.on('matching_request', async (userRequest) => {
      console.log('Matching request received:', userRequest);
      await handleMatchingRequest(userRequest, socket.id);
    });

    socket.on('disconnect', async () => {
      console.log('User disconnected:', socket.id);
      await handleDisconnected(socket.id);
    });
  });
}

async function startServer() {
  try {
    await setupRabbitMQ();

    setupSocketIO(io);

    server.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
    });
  } catch (error) {
    console.error("Failed to start server:", error);
  }
}

startServer();