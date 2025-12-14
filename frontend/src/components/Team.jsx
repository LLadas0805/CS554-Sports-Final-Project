import React, {useState, useEffect} from 'react';
import NotFound from './NotFound';
import axios from 'axios';
import {Link, useParams, useNavigate} from 'react-router-dom';

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

  
  useEffect(() => {
    async function fetchData() {
      try {
        setLoading(true);
        setError('');
        setMessage('');

        const {data: team} = await axios.get(`http://localhost:3000/api/team/${id}`, {
            withCredentials: true
        });

        
        if (team.error){
          throw new Error(team.error);
        }

        setTeamData(team);

        // owner details
        if (team.owner) {
          try {
            const {data: owner} = await axios.get(`http://localhost:3000/api/user/${team.owner}`, {
              withCredentials: true
            });
            setOwnerData(owner);
          } catch (err) {
            console.error('Error fetching owner:', err);
          }
        }

        // members details
        if (team.members && team.members.length > 0) {
          try {
            const memberPromises = team.members.map(m => 
              axios.get(`http://localhost:3000/api/user/${m.userId}`, {
                withCredentials: true
              }).catch(err => {
                console.error(`Error fetching member ${m.userId}:`, err);
                return null;
              })
            );
            const memberResponses = await Promise.all(memberPromises);
            const members = memberResponses
              .filter(r => r !== null)
              .map(r => r.data);
            setMembersData(members);
          } catch (err) {
            console.error('Error fetching members:', err);
          }
        }

        const {data: loggedData} = await axios.get("http://localhost:3000/api/user/auth", {
            withCredentials: true
        });
        if (loggedData.loggedIn) {
            setAuthUser(loggedData.user);
        } else {
            setAuthUser(null);
        }

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
  if (!logged || !authUser || !teamData){
    return false;
  }

  const possibleOwnerIds = [
    teamData.ownerId,
    teamData.owner,
    teamData.teamOwnerId,
    teamData.creatorId,
    teamData.creator,
    teamData.createdBy,
    teamData.userId,
    teamData.user_id
  ]
    .filter(Boolean)
    .map(String);
  console.log(teamData.owner, authUser._id)
  return teamData.owner === authUser._id;
})();

  async function handleJoinRequest() {
    if (!logged || !authUser){
      setMessage('');
      setError('You must be logged in to request to join this team.');
      return;
    }

    try {
      setError('');
      setMessage('');
      await axios.post(
        `http://localhost:3000/api/team/requests/${id}/${authUser._id}`,
        {},
        { withCredentials: true }
      );
      setMessage('Join request sent!');
    } catch (e) {
      console.error(e);
      const msg = e.response?.data?.error || e.message || 'Failed to send join request';
      setError(msg);
    }
  }

  async function handleInvite(e) {
    e.preventDefault();
    if (!inviteUserId.trim()) return;

    try {
      setError('');
      setMessage('');
      await axios.post(
        `http://localhost:3000/api/team/members/${id}/${inviteUserId.trim()}`,
        {},
        { withCredentials: true }
      );
      setMessage('User added to team!');
      setInviteUserId('');

    
      const { data: updated } = await axios.get(`http://localhost:3000/api/team/${id}`, {
        withCredentials: true
      });

      setTeamData(updated);

    } catch (e){
      console.error(e);
      const msg = e.response?.data?.error || e.message || 'Failed to send join request';
      setError(msg);
    }
  }

  if (loading) {
    return (
      <div>
        <h2>Loading....</h2>
      </div>
    );
  }
  
  if (!teamData){
    return <NotFound message={error || 'Team Not Found!'} />;
  }

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
        <p>
          {preferredSports && preferredSports.length > 0
            ? preferredSports.join(', ')
            : 'None listed'}
        </p>

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

        <h2>Team Members ({membersData.length}):</h2>
        {membersData.length > 0 ? (
          <ul>
            {membersData.map(member => (
              <li key={member._id}>
                <Link to={`/users/${member._id}`}>
                  {member.username} ({member.firstName} {member.lastName})
                </Link>
              </li>
            ))}
          </ul>
        ) : (
          <p>No members yet.</p>
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
            <form onSubmit={handleInvite} className="invite-form">
              <label>
                Invite user by ID:
                <input
                  type="text"
                  value={inviteUserId}
                  onChange={(e) => setInviteUserId(e.target.value)}
                  placeholder="User ID"
                />
              </label>
              <button type="submit" className="btn btn-primary">
                Add Member
              </button>
            </form>

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
