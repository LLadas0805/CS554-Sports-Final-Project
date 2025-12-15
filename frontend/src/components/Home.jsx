import {Link, useNavigate} from 'react-router-dom';
import React, {useState, useEffect} from 'react';
import axios from 'axios';
import { socket } from "../socket";

function Home(props) {

  const navigate = useNavigate();
  // Use this for loading certain elements like team invites/edit/delete
  const [logged, setLogged] = useState(false);
  const [loading, setLoading] = useState(true);
  const [loggedId, setLoggedId] = useState(null)
  const [activeTeams, setActiveTeams] = useState([]);
  const [pendingInvites, setPendingInvites] = useState([]);
  const [upcomingEvents, setUpcomingEvents] = useState([]);



  useEffect(() => {
    async function fetchData() {
      try {

        let {data} = await axios.get("http://localhost:3000/user/auth", {
            withCredentials: true
        });
        if (data.loggedIn) {
          setLoggedId(data.user._id)
          setLogged(true);

          
          setPendingInvites(data.user.teamInvites || []);

          const teamsRes = await axios.get(
            `http://localhost:3000/team/members/${data.user._id}`,
            { withCredentials: true }
          );

          setActiveTeams(teamsRes.data || []);

          try {
            const eventsRes = await axios.get(
              `http://localhost:3000/events/upcoming/${data.user._id}`,
              { withCredentials: true }
            );
            setUpcomingEvents(eventsRes.data || []);
          } catch (err) {
            console.error("Error fetching upcoming events:", err);
            setUpcomingEvents([]); // fail silently for now
          }
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
        socket.disconnect();
        navigate("/login");
    } catch (err) {
        alert("Logout failed!");
        console.error("Logout failed:", err);
    }
  };

  const handleAcceptInvite = async (invite) => {
    try {
      await axios.post(
        "http://localhost:3000/user/invites/accept",
        {
          teamId: invite.teamId
        },
        { withCredentials: true }
      );

      // Optionally, add the team to activeTeams if backend returns it instead
      // For now we'll just remove the invite from the list
      setPendingInvites((prev) =>
        prev.filter((i) => i._id !== invite._id)
      );

      // If you want to be fancy you could also refetch active teams here
      // or push a new team object into activeTeams.
    } catch (err) {
      console.error("Error accepting invite:", err);
      alert("Failed to accept invite.");
    }
  };

  const handleDeclineInvite = async (invite) => {
    try {
      await axios.post(
        "http://localhost:3000/user/invites/decline",
        {
          teamId: invite.teamId
        },
        { withCredentials: true }
      );

      // Remove the invite locally
      setPendingInvites((prev) =>
        prev.filter((i) => i._id !== invite._id)
      );
    } catch (err) {
      console.error("Error declining invite:", err);
      alert("Failed to decline invite.");
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
                        Browse Users
                    </Link>
                    <Link className='link' to={`/teams/`}>
                        Browse Teams
                    </Link>
                    <Link className='link' to={`/games/`}>
                        Browse Games
                    </Link>
                    <button className="link" onClick={handleLogout}>
                        Logout
                    </button>

                    <section className="home-section">
                      <h2>Your Active Teams</h2>
                      {activeTeams.length === 0 ? (
                        <p>You are not currently on any teams. Go join or create one!</p>
                      ) : (
                        <ul>
                          {activeTeams.map((team) => (
                            <li key={team._id}>
                              <Link to={`/teams/${team._id}`}>
                                {team.teamName} {team.owner === loggedId && "(Owner)"}
                              </Link>
                            </li>
                          ))}
                        </ul>
                      )}
                    </section>


                              {/* Buttons */}
                              <div style={{ marginTop: "0.5rem" }}>
                                <button onClick={() => handleAcceptInvite(invite)}>
                                  Accept
                                </button>
                                <button
                                  onClick={() => handleDeclineInvite(invite)}
                                  style={{ marginLeft: "0.5rem" }}
                                >
                                  Decline
                                </button>
                              </div>
                            </li>
                          ))}
                        </ul>
                      )}
                    </section>

                    <section className="home-section">
                      <h2>Team Join Requests:</h2>
                      {pendingRequests.length === 0 ? (
                        <p>You have no join requests.</p>
                      ) : (
                        <ul>
                          {pendingRequests.map((request) => (
                            <li key={request._id}>
                              <div>
                                {/* User name / info */}
                                {request.userName ? (
                                  <>
                                    Request to join <strong>{request.teamName}</strong> from <strong>{request.userName}</strong>
                                  </>
                                ) : (
                                  <>Team join request (ID: {request.userId})</>
                                )}
                              </div>

                              {/* Buttons */}
                              <div style={{ marginTop: "0.5rem" }}>
                                <button onClick={() => handleAcceptRequest(request)}>
                                  Accept
                                </button>
                                <button
                                  onClick={() => handleDeclineRequest(request)}
                                  style={{ marginLeft: "0.5rem" }}
                                >
                                  Decline
                                </button>
                              </div>
                            </li>
                          ))}
                        </ul>
                      )}
                    </section>
                    
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