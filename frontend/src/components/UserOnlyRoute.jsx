import { Navigate } from 'react-router-dom';

const UserOnlyRoute = ({ user, children }) => {
  if (!user) {
    return <Navigate to="/" replace />;
  }
  return children;
};

export default UserOnlyRoute;
