import React, {useState, useEffect} from 'react';
import NotFound from './NotFound';
import axios from 'axios';
import {Link, useParams, useNavigate} from 'react-router-dom';

const User = (props) => {
  const [userData, setUserData] = useState(undefined);
  const [teamsData, setTeamsData] = useState([])
  const [loading, setLoading] = useState(true);
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

        const {data: teams} = await axios.get(`http://localhost:3000/team/members/${id}`, {
            withCredentials: true
        });

        setTeamsData(teams);

        if (loggedData.loggedIn && loggedData.user._id === id) {
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
  }, [id]);

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
            <h2>Current Teams:</h2>
            <div className="items-container">
                {teamsData.length === 0 ? (
                    <h3>None</h3>
                ) : (
                    teamsData.map((team) => (
                        <GenericItem
                            key={team._id}
                            name={team.teamName}
                            subtext={`${team.description}`}
                            additional={team.owner === userData._id ? "Owner" : "Member"}
                            link={`/teams/${team._id}`}
                        />
                    ))
                )}
            </div>
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