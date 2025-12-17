import React, { useState, useEffect } from 'react';
import NotFound from './NotFound';
import axios from 'axios';
import { Link, useParams } from 'react-router-dom';

const Team = (props) => {
  const { id } = useParams();

  const [teamData, setTeamData] = useState(null);
  const [authUser, setAuthUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');

  const [inviteUserId, setInviteUserId] = useState('');
  const [ownerData, setOwnerData] = useState(null);
  const [membersData, setMembersData] = useState([]);
  const [gamesData, setGamesData] = useState([]);

  useEffect(() => {
    async function fetchData() {
      try {
        setLoading(true);
        setError('');
        setMessage('');

        const {data: team} = await axios.get(`/api/team/${id}`, {
            withCredentials: true
        });

        if (team.error) {
          throw new Error(team.error);
        }

        setTeamData(team);

        // Owner details
        if (team.owner) {
          try {
            const {data: owner} = await axios.get(`/api/user/${team.owner}`, {
              withCredentials: true
            });
            setOwnerData(owner);
          } catch (err) {
            console.error('Error fetching owner:', err);
          }
        }

        // Members details
        if (team.members && team.members.length > 0) {
          try {
            const memberPromises = team.members.map((m) =>
              axios.get(`/api/user/${m}`, { withCredentials: true }).catch(() => null)
            );
            const memberResponses = await Promise.all(memberPromises);
            const members = memberResponses.filter((r) => r !== null).map((r) => r.data);
            setMembersData(members);
          } catch (err) {
            console.error('Error fetching members:', err);
          }
        }

        const {data: loggedData} = await axios.get("/api/user/auth", {
            withCredentials: true
        });
        if (loggedData.loggedIn) {
          setAuthUser(loggedData.user);
        } else {
          setAuthUser(null);
        }

        // Games
        const { data: games } = await axios.get(`/api/game/team/${id}`, {
          withCredentials: true
        });
        if (games) setGamesData(games);
      } catch (e) {
        console.log(e);
        setError(e.message || 'Error loading team');
      } finally {
        setLoading(false);
      }
    }

    fetchData();
  }, [id]);

  const logged = !!authUser;

  const isOwner = (() => {
    if (!logged || !authUser || !teamData) return false;
    return String(teamData.owner) === String(authUser._id);
  })();

  async function handleJoinRequest() {
    if (!logged || !authUser) {
      setMessage('');
      setError('You must be logged in to request to join this team.');
      return;
    }

    try {
      setError('');
      setMessage('');
      await axios.post(
        `/api/team/requests/${id}/${authUser._id}`,
        {},
        { withCredentials: true }
      );
      setMessage('Join request sent!');
    } catch (e) {
      console.error(e);
      setError(e.response?.data?.error || e.message || 'Failed to send join request');
    }
  }

  async function handleInvite(e) {
    e.preventDefault();

    try {
      setError('');
      setMessage('');
  
      await axios.post(
        `/api/user/invites/${inviteUserId}/${id}`,
        {},
        { withCredentials: true }
      );
      setMessage('Invite sent to user!');
      setInviteUserId('');

    } catch (e) {
      console.error(e);
      setError(e.response?.data?.error || e.message || 'Failed to invite user');
    }
  }

  async function handleRemoveMember(memberId) {
    if (!authUser) {
      setError('You must be logged in to perform this action.');
      return;
    }

    try {
      setError('');
      setMessage('');
      await axios.delete(`/api/team/members/${id}/${memberId}`, {
        withCredentials: true
      });

      setTeamData((prev) => {
        if (!prev) return prev;
        const newMembers = Array.isArray(prev.members)
          ? prev.members.filter((m) => String(m) !== memberId)
          : [];
        return { ...prev, members: newMembers };
      });

      setMembersData((prev) => prev.filter((m) => String(m._id) !== memberId));
      setMessage('Member removed');
    } catch (e) {
      console.error('Error removing member:', e);
      setError(e.response?.data?.error || e.message || 'Failed to remove member');
    }
  }

  if (loading) return <h2>Loading...</h2>;
  if (!teamData) return <NotFound message={error || 'Team Not Found!'} />;

  const { description, city, state, preferredSports, experience, name, teamName } = teamData;
  const displayName = name || teamName || 'Unnamed Team';

  return (
    <div className="page team-view text-left">
      <div className="section team-view__header">
        <h1 className="team-view__title">{displayName}</h1>
        <p className="team-view__desc">{description}</p>

        <div className="team-view__meta">
          <span>{city}, {state}</span>
          <span>Skill: {experience}</span>
          <span>
            Sports: {preferredSports?.length ? preferredSports.join(", ") : "None listed"}
          </span>
        </div>

        <div className="team-view__headerActions">
          {!isOwner && logged && (
            <button className="btn btn-primary" onClick={handleJoinRequest}>
              Request to Join Team
            </button>
          )}
          <Link className="link" to="/teams">Return To Team List</Link>
          <Link className="link" to="/">Return Home</Link>
        </div>

        {message && <p className="success">{message}</p>}
        {error && <p className="error">{error}</p>}
      </div>

    

      <div className="team-view__grid">
        <div className="team-view__col">
          <div className="section">
            <h2>Owner</h2>
            {ownerData ? (
              <p>
                <Link to={`/users/${ownerData._id}`}>
                  {ownerData.username} ({ownerData.firstName} {ownerData.lastName})
                </Link>
              </p>
            ) : (
              <p>Loading owner...</p>
            )}
          </div>

          <div className="section">
            <h2>Members</h2>
            {membersData.length > 0 ? (
              <ul className="team-view__list">
                {membersData.map((member) => {
                  const memberIdStr = String(member._id);
                  const isSelf = authUser && String(authUser._id) === memberIdStr;
                  const isOwnerMember = teamData.owner && String(teamData.owner) === memberIdStr;

                  return (
                    <li key={member._id} className="team-view__listItem">
                      <Link to={`/users/${member._id}`}>
                        {member.username} ({member.firstName} {member.lastName})
                      </Link>

                      {(logged && isOwner && !isOwnerMember) && (
                        <button
                          className="btn btn-danger team-view__smallBtn"
                          onClick={() => handleRemoveMember(memberIdStr)}
                        >
                          Remove
                        </button>
                      )}

                      {(logged && isSelf && !isOwnerMember) && (
                        <button
                          className="btn btn-danger team-view__smallBtn"
                          onClick={() => handleRemoveMember(memberIdStr)}
                        >
                          Leave
                        </button>
                      )}
                    </li>
                  );
                })}
              </ul>
            ) : (
              <p>No members yet.</p>
            )}
          </div>

          {logged && isOwner && (
            <div className="section">
              <h2>Owner Tools</h2>

              <form onSubmit={handleInvite} className="team-view__invite">
                <label className="form-group">
                  Invite user by ID:
                  <input
                    type="text"
                    value={inviteUserId}
                    className="form-input"
                    onChange={(e) => setInviteUserId(e.target.value)}
                    placeholder="Enter a User ID"
                  />
                </label>

                <button type="submit" className="btn btn-primary">
                  Add Member
                </button>
              </form>

              <div style={{ marginTop: "0.75rem" }}>
                <Link className="link" to={`/teams/${id}/edit`}>Edit Team</Link>
              </div>
            </div>
          )}
        </div>
        <div className="team-view__col">
          <div className="section">
            <h2>Game History</h2>
            {gamesData.length > 0 ? (
              <ul className="team-view__list">
                {gamesData.map((game) => (
                  <li key={game._id} className="team-view__listItem">
                    <Link to={`/games/${game._id}`}>
                      {game.team1.name} vs. {game.team2.name} — {game.date.slice(0, 10)}
                    </Link>
                  </li>
                ))}
              </ul>
            ) : (
              <p>No games yet.</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Team;