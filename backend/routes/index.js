//Here you will import route files and export the constructor method as shown in lecture code and worked in previous labs.
import userRoutes from './user_routes.js';
import teamRoutes from './team_routes.js';
import gameRoutes from './game_routes.js';

const constructorMethod = (app) => {
  app.use('/api/user', userRoutes);
  app.use('/api/team', teamRoutes);
  app.use('/api/game', gameRoutes);
  app.use('/api', (req, res) => {
    res.status(404).json({ error: 'API route not found' });
  });
};

export default constructorMethod;