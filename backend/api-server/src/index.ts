import "dotenv/config";
import http from "http";
import app from "./app";
import { logger } from "./lib/logger";
import { initSocket } from "./lib/socket";

const server = http.createServer(app);
initSocket(server);

const rawPort = process.env["PORT"];
// ... rest of port logic ...
if (!rawPort) {
  throw new Error("PORT environment variable is required");
}
const port = Number(rawPort);

server.listen(port, "0.0.0.0", () => {
  logger.info({ port }, "Server listening with Socket.io");
});
