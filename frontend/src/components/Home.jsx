import {Link, useNavigate} from 'react-router-dom';
import React, {useState, useEffect} from 'react';
import axios from 'axios';
import { socket } from "../socket";

function Home(props) {

  const navigate = useNavigate();
  const [logged, setLogged] = useState(false);
  const [loading, setLoading] = useState(true);
  const [loggedId, setLoggedId] = useState(null)
  const [activeTeams, setActiveTeams] = useState([]);
  const [pendingInvites, setPendingInvites] = useState([]);
  const [pendingRequests, setPendingRequests] = useState([]);
  const [upcomingEvents, setUpcomingEvents] = useState([]);


  useEffect(() => {
    async function fetchData() {
      try {

        let {data} = await axios.get("/api/user/auth", {
            withCredentials: true
        });
        if (data.loggedIn) {
          setLoggedId(data.user._id)
          setLogged(true);

          try {
            const invitesRes = await axios.get(
              `/api/user/invites/${data.user._id}`,
              { withCredentials: true }
            );
            console.log(invitesRes);
            setPendingInvites(Array.isArray(invitesRes.data)
              ? invitesRes.data
              : invitesRes.data.invites || []
            );
          } catch (err) {
            console.error("Error fetching invites:", err);
          }
          
          const teamsRes = await axios.get(
            `/api/team/members/${data.user._id}`,
            { withCredentials: true }
          );

          setActiveTeams(teamsRes.data || []);

          try {
            const eventsRes = await axios.get(
              `/api/game/${data.user._id}/upcoming`,
              { withCredentials: true }
            );
            setUpcomingEvents(eventsRes.data || []);
          } catch (err) {
            console.error("Error fetching upcoming events:", err);
            setUpcomingEvents([]);
          }

          const teamOwned = await axios.get( `/api/team/user/${data.user._id}/owned/`,
            { withCredentials: true })

          if (teamOwned.data) {
            setPendingRequests(
              Array.isArray(teamOwned.data?.joinRequests)
                ? teamOwned.data.joinRequests
                : []
            );
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

  const handleAcceptInvite = async (invite) => {
    try {
      await axios.post(
        "/api/user/invites/accept",
        {
          teamId: invite.teamId
        },
        { withCredentials: true }
      );

      setPendingInvites((prev) =>
        prev.filter((i) => i._id !== invite._id)
      );

      let {data} = await axios.get("/api/user/auth", {
          withCredentials: true
      });

      const teamsRes = await axios.get(
        `/api/team/members/${data.user._id}`,
        { withCredentials: true }
      );

      setActiveTeams(teamsRes.data || activeTeams);
    
    } catch (err) {
      console.error("Error accepting invite:", err);
      alert("Failed to accept invite.");
    }
  };

  const handleDeclineInvite = async (invite) => {
    try {
      await axios.delete(
        `/api/user/invites/${loggedId}/${invite.teamId}`,
        { withCredentials: true }
      );
      setPendingInvites((prev) =>
        prev.filter((i) => i._id !== invite._id)
      );
    } catch (err) {
      console.error("Error declining invite:", err);
      alert("Failed to decline invite.");
    }
  };

  const handleAcceptRequest = async (request) => {
    try {
      const result = await axios.post(
        `/api/team/members/${request.teamId}/${request.userId}`,
        {},
        { withCredentials: true }
      );

      console.log(result);

      setPendingRequests((prev) =>
        prev.filter((i) => i._id !== request._id)
      );

    } catch (err) {
      console.error("Error accepting request:", err);
      alert("Failed to accept request.");
    }
  };

  const handleDeclineRequest = async (request) => {
    try {
      await axios.delete(
        `/api/team/requests/${request.teamId}/${request.userId}`,
        { withCredentials: true }
      );
      setPendingRequests((prev) =>
        prev.filter((i) => i._id !== request._id)
      );
    } catch (err) {
      console.error("Error declining request:", err);
      alert("Failed to decline request.");
    }
  };

  if (loading) {
    return (
      <div className="container">
        <h2>Loading....</h2>
      </div>
    );
  }

  return (
    <div>
      {logged && (
        <nav className="navbar">
          <Link to="/" className="navbar-brand">Sports Finder</Link>
          <div className="navbar-links">
            <Link className='link' to={`/users/${loggedId}`}>Profile</Link>
            <Link className='link' to='/users'>Users</Link>
            <Link className='link' to='/teams'>Teams</Link>
            <Link className='link' to='/games'>Games</Link>
            <button className="link" onClick={handleLogout}>Logout</button>
          </div>
        </nav>
      )}

      <div className="container">
        {!logged ? (
          <>
            <div className="hero-section">
              <h1>Welcome to Sports Finder</h1>
              <p>Discover Local Teams, Players, Games and More!</p>
            </div>
            <div className="button-group">
              <Link className='link' to='/login'>
                <button>Sign In</button>
              </Link>
              <Link className='link' to='/signup'>
                <button>Create an Account</button>
              </Link>
            </div>
          </>
        ) : (
          <>
            <div className="hero-section">
              <h1>Welcome Back!</h1>
              <p>Here's what's happening with your teams</p>
            </div>

            <section className="home-section">
              <h2>Your Active Teams</h2>
              <div className="section-content">
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
              </div>
            </section>

            <section className="home-section">
              <h2>Pending Team Invites</h2>
              <div className="section-content">
                {pendingInvites.length === 0 ? (
                  <p>You have no pending invites.</p>
                ) : (
                  <ul>
                    {pendingInvites.map((invite) => (
                      <li key={invite._id}>
                        <div>
                          Invite to join <strong>{invite.team.teamName}</strong>
                        </div>
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
              </div>
            </section>

            <section className="home-section">
              <h2>Team Join Requests</h2>
              <div className="section-content">
                {pendingRequests.length === 0 ? (
                  <p>You have no join requests.</p>
                ) : (
                  <ul>
                    {pendingRequests.map((request) => (
                      <li key={request._id}>
                        <div>
                          {request.userName ? (
                            <>
                              Request to join <strong>{request.teamName}</strong> from <strong>{request.userName}</strong>
                            </>
                          ) : (
                            <>Team join request (ID: {request.userId})</>
                          )}
                        </div>
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
              </div>
            </section>

            <section className="home-section">
              <h2>Upcoming Events</h2>
              <div className="section-content">
                {upcomingEvents.length === 0 ? (
                  <p>No upcoming events. Once your teams schedule games or practices, they'll show up here.</p>
                ) : (
                  <ul>
                    {upcomingEvents.map((event) => (
                      <li key={event._id}>
                        <Link to={`/games/${event._id}`}>
                          <strong>{event.team1.name} vs. {event.team2.name}</strong>
                          {event.teamName && <> — {event.teamName}</>}
                        </Link>
                        {event.date && (
                          <div>
                            {new Date(event.date).toLocaleString(undefined, {
                              dateStyle: "medium",
                              timeStyle: "short"
                            })}
                          </div>
                        )}
                        <div>{event.city}, {event.state}</div>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            </section>
          </>
        )}
      </div>
    </div>
  );
}

export default Home;