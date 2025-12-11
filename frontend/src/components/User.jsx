import React, {useState, useEffect} from 'react';
import NotFound from './NotFound';
import axios from 'axios';
import {Link, useParams, useNavigate} from 'react-router-dom';
import { socket } from "../socket";

const User = (props) => {
  const [userData, setUserData] = useState(undefined);
  const [loading, setLoading] = useState(true);
  const [activeTeams, setActiveTeams] = useState([]);
  const navigate = useNavigate();
  // Use this for loading certain elements like team invites/edit/delete
  const [logged, setLogged] = useState(false);
  // const classes = useStyles();
  let {id} = useParams();

  
  useEffect(() => {
    async function fetchData() {
      try {
        const {data} = await axios.get(`http://localhost:3000/user/${id}`, {
            withCredentials: true
        });

        console.log(data);
        if (data.error) throw "error fetching user"
        setUserData(data);

        const {data: loggedData} = await axios.get("http://localhost:3000/user/auth", {
            withCredentials: true
        });

        console.log(loggedData);

        if (loggedData.loggedIn && loggedData.user._id === id) {
            setLogged(true);
        } else {
            setLogged(false)
        }

        const teamsRes = await axios.get(
            `http://localhost:3000/team/members/${id}`,
            { withCredentials: true }
          );

        setActiveTeams(teamsRes.data || []);

        setLoading(false);

      } catch (e) {
        console.log(e);
        setLoading(false)
      }
    }
    fetchData();
  }, [id]);

  const handleLogout = async () => {
    try {
        await axios.post("http://localhost:3000/user/logout", {}, {
            withCredentials: true
        });
      
        alert("Logout successful!");
        socket.disconnect();
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
  } else {
    if (!userData) {
       return (
        <NotFound message={"User Not Found!"}/>
      );
    } else {
      return (
        <div>
          <h1>{userData.username}</h1>
          <div className = "row">
            <h2>{userData.firstName} {userData.lastName}</h2>
          </div>
          <div className = "page">
            <div className = "row">
              <h2 className = "tag">{userData.city}, {userData.state}</h2>
            </div>
            <h2 className = "tag">Contact Info:</h2>
            <div className = "row">
                <h3 className = "tag">{userData.email} | {userData.phoneNumber}</h3>
            </div>
            <h2>Preferred Sports:</h2>
            <h3>Advanced</h3>
            <p>
            {userData.advancedSports && userData.advancedSports.length > 0
                ? userData.advancedSports.join(", ")
                : "None listed"}
            </p>

            <h3>Intermediate</h3>
            <p>
            {userData.intermediateSports && userData.intermediateSports.length > 0
                ? userData.intermediateSports.join(", ")
                : "None listed"}
            </p>

            <h3>Beginner</h3>
            <p>
            {userData.beginnerSports && userData.beginnerSports.length > 0
                ? userData.beginnerSports.join(", ")
                : "None listed"}
            </p>
            
            <h2>Active Teams</h2>
              {activeTeams.length === 0 ? (
                <p>None</p>
              ) : (
                <ul>
                  {activeTeams.map((team) => (
                    <li key={team._id}>
                      <Link to={`/teams/${team._id}`}>
                        {team.teamName} {team.owner === id && "(Owner)"}
                      </Link>
                    </li>
                  ))}
                </ul>
              )}

            {logged && (
                <div className = "pages">
                    <Link className='link' to={`/users/edit/${id}`}>
                        Edit User
                    </Link>
                    <button className="link" onClick={handleLogout}>
                        Logout
                    </button>
                </div>
            )}

            <Link className='link' to='/users'>
              Return To User List
            </Link>
          </div>
        </div>
      );
    }
    
  }
};

export default User;