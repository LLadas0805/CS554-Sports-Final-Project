export default function setupUser(io) {
  io.on("connection", (socket) => {
    socket.on("joinUser", async ({ userId1, userId2 }) => {
      const room = `dm:${[userId1, userId2].sort().join("-")}`;

      if (socket.userId !== userId1 && socket.userId !== userId2) {
        socket.emit("error", "Permission denied to join this DM");
        return;
      }
      
      socket.join(room);
      socket.emit("joinedUser", room);
    });

    socket.on("sendUser", ({ userId1, userId2, message }) => {
      const room = `dm:${[userId1, userId2].sort().join("-")}`;
      io.to(room).emit("receivedUser", { message, sender: socket.userId });
    });
  });
}
