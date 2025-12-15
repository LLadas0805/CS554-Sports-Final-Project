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

        const { data: team } = await axios.get(`http://localhost:3000/team/${id}`, {
          withCredentials: true
        });

        if (team.error) {
          throw new Error(team.error);
        }

        setTeamData(team);

        // Owner details
        if (team.owner) {
          try {
            const { data: owner } = await axios.get(`http://localhost:3000/user/${team.owner}`, {
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
              axios.get(`http://localhost:3000/user/${m}`, { withCredentials: true }).catch(() => null)
            );
            const memberResponses = await Promise.all(memberPromises);
            const members = memberResponses.filter((r) => r !== null).map((r) => r.data);
            setMembersData(members);
          } catch (err) {
            console.error('Error fetching members:', err);
          }
        }

        // Authenticated user
        const { data: loggedData } = await axios.get('http://localhost:3000/user/auth', {
          withCredentials: true
        });
        if (loggedData.loggedIn) {
          setAuthUser(loggedData.user);
        } else {
          setAuthUser(null);
        }

        // Games
        const { data: games } = await axios.get(`http://localhost:3000/game/team/${id}`, {
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
        `http://localhost:3000/team/requests/${id}/${authUser._id}`,
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
        `http://localhost:3000/user/invites/${inviteUserId}/${id}`,
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
      await axios.delete(`http://localhost:3000/team/members/${id}/${memberId}`, {
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
    <div>
      <h1>{displayName}</h1>

      <div className="row">
        <h2>{description}</h2>
      </div>

      <div className="page">
        <div className="row">
          <h2 className="tag">
            {city}, {state}
          </h2>
        </div>

        <h2 className="tag">Skill Level: {experience}</h2>

        <h2>Preferred Sports:</h2>
        <p>{preferredSports?.length > 0 ? preferredSports.join(', ') : 'None listed'}</p>

        <h2>Team Owner:</h2>
        {ownerData ? (
          <p>
            <Link to={`/users/${ownerData._id}`}>
              {ownerData.username} ({ownerData.firstName} {ownerData.lastName})
            </Link>
          </p>
        ) : (
          <p>Loading owner...</p>
        )}

        <h2>Team Members:</h2>
        {membersData.length > 0 ? (
          <ul>
            {membersData.map((member) => {
              const memberIdStr = String(member._id);
              const isSelf = authUser && authUser._id === memberIdStr;
              const isOwnerMember = teamData.owner && String(teamData.owner) === memberIdStr;
              return (
                <li key={member._id}>
                  <Link to={`/users/${member._id}`}>
                    {member.username} ({member.firstName} {member.lastName})
                  </Link>
                  {logged && isOwner && !isOwnerMember && (
                    <button
                      onClick={async () => await handleRemoveMember(memberIdStr)}
                      style={{ marginLeft: 'auto', background: 'transparent', border: 'none', cursor: 'pointer' }}
                    >
                      Remove
                    </button>
                  )}
                  {logged && isSelf && !isOwnerMember && (
                    <button
                      onClick={async () => await handleRemoveMember(memberIdStr)}
                      style={{ marginLeft: 'auto', background: 'transparent', border: 'none', cursor: 'pointer' }}
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

        <h2>Game History:</h2>
        {gamesData.length > 0 ? (
          <ul>
            {gamesData.map((game) => (
              <li key={game._id}>
                <Link to={`/games/${game._id}`}>
                  {game.team1.name} vs. {game.team2.name} - {game.date.slice(0, 10)}
                </Link>
              </li>
            ))}
          </ul>
        ) : (
          <p>No games yet.</p>
        )}

        {message && <p className="success">{message}</p>}
        {error && <p className="error">{error}</p>}

        {logged && !isOwner && (
          <button className="btn btn-primary" onClick={handleJoinRequest}>
            Request to Join Team
          </button>
        )}

        {logged && isOwner && (
          <div className="pages">
            <div className="form">
              <form onSubmit={handleInvite} className="invite-form">
                <label>
                  Invite user by ID:
                  <input
                    type="text"
                    value={inviteUserId}
                    className="form-input"
                    onChange={(e) => setInviteUserId(e.target.value)}
                    placeholder="Enter an ID from User URL"
                  />
                </label>
                <button type="submit" className="btn btn-primary">
                  Add Member
                </button>
              </form>
            </div>

            <Link className="link" to={`/teams/${id}/edit`}>
              Edit Team
            </Link>
          </div>
        )}

        <Link className="link" to="/teams">
          Return To Team List
        </Link>
      </div>
    </div>
  );
};

export default Team;