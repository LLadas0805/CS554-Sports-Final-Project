import { Link } from "react-router-dom";
import "./styles/Navbar.css";

const Navbar = ({ loggedIn, userId, onLogout }) => {
  return (
    <nav className="navbar">

      <div className="navbar-inner">

        <div className="navbar-left">
          <Link to="/" className="navbar-logo">
            Sports Finder
          </Link>
        </div>

        <div className="navbar-right">
          {loggedIn ? (
            <>
            <Link to="/" className="navbar-link">
                Home
              </Link>
              <Link to={`/users/${userId}`} className="navbar-link">
                Profile
              </Link>
              <Link to="/users" className="navbar-link">
                Users
              </Link>
              <Link to="/teams" className="navbar-link">
                Teams
              </Link>
              <Link to="/games" className="navbar-link">
                Games
              </Link>
              <button className="navbar-button" onClick={onLogout}>
                Logout
              </button>
            </>
          ) : (
            <>
              <Link to="/login" className="navbar-link">
                Login
              </Link>
              <Link to="/signup" className="navbar-link">
                Sign Up
              </Link>
            </>
          )}
        </div>

      </div>
      
    </nav>
  );
};

export default Navbar;
