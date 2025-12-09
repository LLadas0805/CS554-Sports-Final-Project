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
        const { data: teamList } = await axios.get(`http://localhost:3000/team/`, { withCredentials: true } );

        if (gameData.error) throw "error fetching game";
        if (teamList.error) throw "Error fetching teams";

        setGame({
          ...gameData,
          team1: {
            _id: gameData.team1._id,
            score: gameData.team1.score,
            name: teamList.find((team) => team._id === gameData.team1._id).name,
          },
          team2: {
            _id: gameData.team2._id,
            score: gameData.team2.score,
            name: teamList.find((team) => team._id === gameData.team2._id).name,
          }
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
          <h1>Game Detail</h1>
          {/*<div className = "row">*/}
          {/*  <h2>{game.firstName} {game.lastName}</h2>*/}
          {/*</div>*/}
          <div>
            Sport: {game.sport}
          </div>
          <div>
            State: {game.state}
          </div>
          <div>
            City: {game.city}
          </div>
          <div>
            Location(lat,lon): {game.location?.coordinates.join(',')}
          </div>
          <div>
           Game Date: {game.date.slice(0, 10)}
          </div>
          <div>
            Created At: {game.createdAt?.slice(0, 10)}
          </div>
          <div>
            Updated At: {game.updatedAt?.slice(0, 10)}
          </div>

          <br/>

          <table style={{border: '1px solid black', width: '100%'}}>
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