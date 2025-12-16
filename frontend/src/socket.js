import { io } from "socket.io-client";

// Setup socket for frontend to get alerts on all pages
export const socket = io("", {
  withCredentials: true,
  autoConnect: false
});