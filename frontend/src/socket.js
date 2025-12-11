import { io } from "socket.io-client";

// Setup socket for frontend to get alerts on all pages
export const socket = io("http://localhost:3000", {
  withCredentials: true,
  autoConnect: false
});