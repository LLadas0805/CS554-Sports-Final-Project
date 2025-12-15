import React, {useState, useEffect} from 'react';
import NotFound from './NotFound';
import axios from 'axios';
import {Link, useParams, useNavigate} from 'react-router-dom';

const Game = (props) => {
  const [game, setGame] = useState(undefined);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  let {id} = useParams();


  useEffect(() => {
    async function fetchData() {
      try {
        const { data: gameData } = await axios.get(`http://localhost:3000/game/${id}`, { withCredentials: true });

        if (!gameData || gameData.error) throw "error fetching game";

       
        const team1Id = String(gameData.team1._id);
        const team2Id = String(gameData.team2._id);
        const team1Name = gameData.team1.name || gameData.team1.teamName || '';
        const team2Name = gameData.team2.name || gameData.team2.teamName || '';

        setGame({
          ...gameData,
          team1: { _id: team1Id, score: gameData.team1.score, name: team1Name },
          team2: { _id: team2Id, score: gameData.team2.score, name: team2Name }
        });

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
    if (!game) {
      return (
        <NotFound message={"Game Not Found!"}/>
      );
    } else {
      return (
        <div>
          <div className = "row">
            <h1>{game.team1.name} vs {game.team2.name}</h1>
          </div>
          <div className = "row">
            <h2>
              Sport: {game.sport}
            </h2>
          </div>
          <div className = "row">
            <h2>
              Location: {game.city}, {game.state}
            </h2>
          </div>
          <div className = "row">
            <h2>
              Game Date: {game.date.slice(0, 10)}
            </h2>
          </div>
          <div className = "row">
            <h2>
              Updated At: {game.updatedAt?.slice(0, 10) || game.createdAt?.slice(0, 10)}
            </h2>    
          </div>

          <br/>

          <table style={{border: '0px solid black', width: '80%'}}>
            <thead>
              <tr>
                <th>Team</th>
                <th>Score</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>
                  <Link to={`/teams/${game.team1._id}`}>
                    {game.team1.name}
                  </Link>
                </td>
                <td>{game.team1.score}</td>
              </tr>
              <tr>
                <td>
                  <Link to={`/teams/${game.team2._id}`}>
                    {game.team2.name}
                  </Link>
                </td>
                <td>{game.team2.score}</td>
              </tr>
            </tbody>
          </table>

          <br/>

          <div className = "page">
            <Link className='link' to='/games'>
              Return To Game List
            </Link>
          </div>
        </div>
      );
    }

  }
};

export default Game;
