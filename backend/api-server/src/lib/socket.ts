import { Server } from "socket.io";
import type { Server as HTTPServer } from "http";
import { logger } from "./logger";

let io: Server;

export function initSocket(server: HTTPServer) {
  io = new Server(server, {
    cors: {
      origin: "*", // Adjust in production
      methods: ["GET", "POST"]
    }
  });

  io.on("connection", (socket) => {
    logger.info({ socketId: socket.id }, "User connected to socket");

    socket.on("join", (userId: string) => {
      socket.join(userId);
      logger.info({ userId }, "User joined their personal room");
    });

    socket.on("disconnect", () => {
      logger.info({ socketId: socket.id }, "User disconnected from socket");
    });
  });

  return io;
}

export function getIO() {
  if (!io) {
    throw new Error("Socket.io not initialized");
  }
  return io;
}

export function sendNotification(userId: string, notification: any) {
  if (io) {
    io.to(userId).emit("notification", notification);
  }
}

export function sendMessage(userId: string, message: any) {
  if (io) {
    io.to(userId).emit("message", message);
  }
}
