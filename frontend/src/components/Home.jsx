import {Link, useNavigate} from 'react-router-dom';
import React, {useState, useEffect} from 'react';
import axios from 'axios';

function Home(props) {

  const navigate = useNavigate();
  // Use this for loading certain elements like team invites/edit/delete
  const [logged, setLogged] = useState(false);
  const [loading, setLoading] = useState(true);
  const [loggedId, setLoggedId] = useState(null)

  useEffect(() => {
    async function fetchData() {
      try {

        let {data} = await axios.get("http://localhost:3000/user/auth", {
            withCredentials: true
        });
        if (data.loggedIn) {
          setLoggedId(data.user._id)
          setLogged(true);
          
        } else {
            setLogged(false)
        }
        setLoading(false);

      } catch (e) {
        console.log(e);
        setLoading(false)
      }
    }
    fetchData();
  }, []);

  const handleLogout = async () => {
    try {
        await axios.post("http://localhost:3000/user/logout", {}, {
            withCredentials: true
        });
      
        alert("Logout successful!");
        navigate("/login");
    } catch (err) {
        alert("Logout failed!");
        console.error("Logout failed:", err);
    }
  };

  if (loading) {
    return (
      <div>
        <h2>Loading....</h2>
      </div>
    );
  }
  
  return (
    <div>
        <h1>Welcome to Sports Finder</h1>
        <div className="pages">
            <h2>Discover Local Teams, Players, Games and More!</h2>

            {logged ? (
                <div className="pages">
                    <Link className='link' to={`/users/${loggedId}`}>
                        Go to Profile
                    </Link>
                    <Link className='link' to={`/users/`}>
                        View Users
                    </Link>
                    <Link className='link' to={`/teams/`}>
                        View Teams
                    </Link>
                    <button className="link" onClick={handleLogout}>
                        Logout
                    </button>
                </div>
            ) : (
                <div className="pages">
                    <Link className='link' to='/login'>
                        Sign in
                    </Link>
                    <Link className='link' to='/signup'>
                        Create an Account
                    </Link>
                </div>
            )}
        </div>
    </div>
  );
}

export default Home;