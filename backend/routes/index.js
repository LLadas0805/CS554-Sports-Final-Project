//Here you will import route files and export the constructor method as shown in lecture code and worked in previous labs.
import userRoutes from './user_routes.js';
import teamRoutes from './team_routes.js';

const constructorMethod = (app) => {
  app.use('/user', userRoutes);
  app.use('/team', userRoutes);
  app.use(/(.*)/, (req, res) => {
    res.status(404).json({error: 'Route Not found'});
  });
};

export default constructorMethod;