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
  const [logged, setLogged] = useState(false);
  let {id} = useParams();

  
  useEffect(() => {
    async function fetchData() {
      try {
        const {data} = await axios.get(`/api/user/${id}`, {
            withCredentials: true
        });

        console.log(data);
        if (data.error) throw "error fetching user"
        setUserData(data);

        const {data: loggedData} = await axios.get("/api/user/auth", {
            withCredentials: true
        });

        console.log(loggedData);

        if (loggedData.loggedIn && loggedData.user._id === id) {
            setLogged(true);
        } else {
            setLogged(false)
        }

        const teamsRes = await axios.get(
            `/api/team/members/${id}`,
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
        await axios.post("/api/user/logout", {}, {
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
           <div className="page user-profile text-left">
              <div className="section user-profile__header">
                <h1 className="user-profile__name">
                  {userData.firstName} {userData.lastName}
                </h1>
                <p className="user-profile__username">@{userData.username}</p>
                <p className="user-profile__meta">
                  {userData.city}, {userData.state}
                </p>

                {logged && (
                  <div className="user-profile__actions">
                    <Link className="link" to={`/users/edit/${id}`}>Edit User</Link>
                    <button className="link" onClick={handleLogout}>Logout</button>
                  </div>
                )}
              </div>

              <div className="user-profile__grid">
                <div className="user-profile__col">
                  <div className="section">
                    <h2>Contact Information</h2>
                    <p className="user-profile__contact">{userData.email}</p>
                    <p className="user-profile__contact">{userData.phoneNumber}</p>
                  </div>

                  <div className="section">
                    <h2>Preferred Sports</h2>

                    <div className="user-profile__sports">
                      <div>
                        <h3>Advanced</h3>
                        <p>
                          {userData.advancedSports?.length
                            ? userData.advancedSports.join(", ")
                            : "None listed"}
                        </p>
                      </div>

                      <div>
                        <h3>Intermediate</h3>
                        <p>
                          {userData.intermediateSports?.length
                            ? userData.intermediateSports.join(", ")
                            : "None listed"}
                        </p>
                      </div>

                      <div>
                        <h3>Beginner</h3>
                        <p>
                          {userData.beginnerSports?.length
                            ? userData.beginnerSports.join(", ")
                            : "None listed"}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="user-profile__col">
                  <div className="section">
                    <h2>Active Teams</h2>
                    {activeTeams.length === 0 ? (
                      <p>None</p>
                    ) : (
                      <ul className="user-profile__teams">
                        {activeTeams.map((team) => (
                          <li key={team._id}>
                            <Link className="user-profile__teamlink" to={`/teams/${team._id}`}>
                              {team.teamName} {team.owner === id && "(Owner)"}
                            </Link>
                          </li>
                        ))}
                      </ul>
                    )}
                  </div>

                  <div className="user-profile__footer">
                    <Link className="link" to="/users">Return To User List</Link>
                    <Link className="link" to="/">Return Home</Link>
                  </div>
                </div>
              </div>
            </div>

          
      );
    }
    
  }
};

export default User;