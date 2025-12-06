import React, {useState, useEffect} from 'react';
import NotFound from './NotFound';
import axios from 'axios';
import {Link, useParams, useNavigate} from 'react-router-dom';

const Team = (props) => {
  const [teamData, setTeamData] = useState(undefined);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  // Use this for loading certain elements like team invites/edit/delete
  const [logged, setLogged] = useState(false);
  // const classes = useStyles();
  let {id} = useParams();

  
  useEffect(() => {
    async function fetchData() {
      try {
        const {data} = await axios.get(`http://localhost:3000/team/${id}`, {
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
        setLoading(false);

      } catch (e) {
        console.log(e);
        setLoading(false)
      }
    }
    fetchData();
  }, [id]);


  if (loading) {
    return (
      <div>
        <h2>Loading....</h2>
      </div>
    );
  } else {
    if (!userData) {
       return (
        <NotFound message={"Team Not Found!"}/>
      );
    } else {
      return (
        <div>
          <h1>{teamData.teamName}</h1>
          <div className = "row">
            <h2>{teamData.description}</h2>
          </div>
          <div className = "page">
            <div className = "row">
              <h2 className = "tag">{teamData.city}, {teamData.state}</h2>
            </div>
            <h2 className = "tag">Skill Level:</h2>
            <div className = "row">
                <h3 className = "tag">{teamData.skillLevel}</h3>
            </div>
            <h2>Preferred Sports:</h2>
            <p>
            {teamData.preferredSports && userData.advancedSports.length > 0
                ? userData.advancedSports.join(", ")
                : "None listed"}
            </p>

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

            <Link className='link' to='/teams'>
              Return To Team List
            </Link>
          </div>
        </div>
      );
    }
    
  }
};

export default Team;