import setupUser from './user_chat.js';
import setupTeam from './team_chat.js';
import setupGame from './game_chat.js';

export default function setupSocket(io) {
  setupUser(io);
  setupTeam(io);
  setupGame(io);
}
