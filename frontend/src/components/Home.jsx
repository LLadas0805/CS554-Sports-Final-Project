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

          const ownedTeams = teamOwned.data || [];
          const allRequests = ownedTeams.flatMap(t => (t.joinRequests || []).map(r => ({
            ...r,
            teamName: r.teamName || t.teamName,  
            teamId: r.teamId || t._id
          })));
          setPendingRequests(allRequests);
          
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
      // Remove the invite locally
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
      alert("Failed to decline request.");
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
      <div className="pages">
        <h1>Welcome to Sports Finder</h1>
            <h2>Discover Local Teams, Players, Games and More!</h2>

            {logged ? (
                <div className="pages">
                  <div className="home-grid">
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

                    <section className="home-section">
                      <h2>Pending Team Invites</h2>
                      {pendingInvites.length === 0 ? (
                        <p>You have no pending invites.</p>
                      ) : (
                        <ul>
                          {pendingInvites.map((invite) => (
                            <li key={invite._id}>
                              <div>
                                {/* Team name / info */}                               
                                  <>
                                    Invite to join <strong>{invite.team.teamName}</strong>                                 
                                  </>
                              </div>

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

                     <section className="home-section">

                      <h2>Upcoming Events</h2>
                      {upcomingEvents.length === 0 ? (
                        <p>No upcoming events. Once your teams schedule games or practices, they’ll show up here.</p>
                      ) : (
                        <ul>
                          {upcomingEvents.map((event) => (
                            <li key={event._id}>
                              <Link to={`/games/${event._id}`}>
                                  <strong>{event.team1.name} vs. {event.team2.name}</strong>
                                  {event.teamName && <> – {event.teamName}</>} 
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
                    </section>
                    </div>
                </div>
            ) : (
                <div className="pages">
                     <p>
                        Sports Finder helps you discover local teams, players, and games based on
                        your interests and location.
                      </p>

                      <p>
                        Create an account to join teams, send and receive invitations, schedule
                        games, and connect with other players in your area.
                      </p>

                      <p>
                        To get started, use the navigation bar above to <strong>sign up</strong> for
                        a new account or <strong>log in</strong> if you already have one.
                      </p>
                </div>
            )}
        </div>
    </div>
  );
}

export default Home;