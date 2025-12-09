import {games, teams} from '../config/mongoCollections.js';
import {ObjectId} from 'mongodb';

export default function setupGame(io) {
  io.on("connection", (socket) => {
    socket.on("joinGame", async ({ gameId }) => {
        const room = `game:${gameId}`;
        const game = await games.getGameById(gameId);   
        if (!game) {
            socket.emit("error", "Game not found");
        }
        const team1 = await teams.getTeamById(game.team1Id);  
        const team2 = await teams.getTeamById(game.team2Id);
        if (!team1.members.includes(new ObjectId(socket.userId)) && !team2.members.includes(new ObjectId(socket.userId))) {
          socket.emit("error", "Permission denied to join this game chat");
          return;
        }
        
        socket.join(room);
        socket.emit("joinedGame", room);
    });

    socket.on("sendGameMessage", ({ gameId, message }) => {
      const room = `game:${gameId}`;
      io.to(room).emit("receiveGameMessage", { message, sender: socket.userId });
    });
  });
}
