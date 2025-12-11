import {teams, users} from '../config/mongoCollections.js';
import {ObjectId} from 'mongodb';

export default function setupTeam(io) {
  io.on("connection", (socket) => {
    socket.on("joinTeam", async ({ teamId }) => {
        const room = `team:${teamId}`;
        const team = await teams.getTeamById(teamId);
        if (!team.members.includes(new ObjectId(socket.userId))) {
          socket.emit("error", "Permission denied to join this team chat");
          return;
        }

        socket.join(room);
        socket.emit("joinedTeam", room);
    });

    socket.on("sendTeamMessage", ({ teamId, message }) => {
      const room = `team:${teamId}`;
      io.to(room).emit("receiveTeamMessage", { message, sender: socket.userId });
    });
  });
}
