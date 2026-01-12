import { io, Socket } from "socket.io-client";

export function createSocket(serverUrl: string, userId: string, role: string): Socket {
  return io(serverUrl, {
    transports: ["websocket"],
    query: { user_id: userId, role },
  });
}
