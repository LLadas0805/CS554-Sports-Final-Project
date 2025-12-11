import React, { useState, useEffect } from 'react';
import axios from 'axios';
import sports from '../../../shared/enums/sports.js';
import { Link, useParams, useNavigate } from 'react-router-dom';

const styles = {
  row: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '12px 16px',
    borderBottom: '1px solid #ccc',
    gap: '8px'
  },
  cell: {
    width: '150px',
  },
  actions: {
    width: '260px',
  },
}

const GameList = (props) => {
  const navigate = useNavigate();

  const [sport, setSport] = useState("");
  const [games, setGames] = useState([]);
  const [loading, setLoading] = useState(true);

  async function fetchData() {
    try {
      const { data } = await axios.get(`http://localhost:3000/game/`, {
        withCredentials: true
      });

      console.log(data);

      if (data.error) throw "error fetching game";

      setGames(data);
      setLoading(false);
    } catch (e) {
      console.log(e);
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchData();
  }, []);

  const handleFilter = async () => {
    setLoading(true);
    try {
      if (sport === "") {
        const { data } = await axios.get(`http://localhost:3000/game/`, {
          withCredentials: true
        });
        setGames(data);
      } else {
        setGames(games.filter((game) => game.sport === sport))
      }

      setLoading(false);
    } catch (e) {
      console.error("Filter failed:", e);
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    try {
      const response = await axios.delete(`http://localhost:3000/game/${id}`, {
        withCredentials: true
      });
      alert("Game deleted successfully");
      await fetchData()
    } catch (error) {
      alert(error?.response?.data?.error)
    }
  };

  if (loading) {
    return (
      <div>
        <h2>Loading....</h2>
      </div>
    );
  } else {
    return (
      <div className="list-container">
        <h1>Game List</h1>
        <div className="filters">

          <div className="form-group-inline">
            <label>Sport:</label>
            <select
              id="sport"
              name="sport"
              value={sport}
              onChange={(e) => setSport(e.target.value)}
              className="form-input"
            >
              <option value="">Select a sport</option>
              {sports.map((sport) => (
                <option key={sport} value={sport}>
                  {sport}
                </option>
              ))}
            </select>
          </div>

          <button
            className="btn btn-primary filter-btn"
            onClick={() =>
              handleFilter()
            }
          >
            Apply Filters
          </button>
          <button
            className="btn btn-primary filter-btn"
            style={{ backgroundColor: '#1890ff', color: 'white' }}
            onClick={() => navigate(`/games/add`)}>
            +New Game
          </button>
        </div>

        <div className="items-container">
          {games.length === 0 ? (
            <h2>No games found</h2>
          ) : (
            <>
              <div style={{...styles.row, fontWeight: 'bold'}}>
                <div style={styles.cell}>Sport</div>
                <div style={styles.cell}>State</div>
                <div style={styles.cell}>City</div>
                <div style={styles.cell}>Score1</div>
                <div style={styles.cell}>Score2</div>
                <div style={styles.cell}>Date</div>
                <div style={styles.actions}>Actions</div>
              </div>
              {
                games.map((game) => (
                  <div style={styles.row} key={game._id}>
                    <div style={styles.cell}>{game.sport}</div>
                    <div style={styles.cell}>{game.state}</div>
                    <div style={styles.cell}>{game.city}</div>
                    <div style={styles.cell}>{game.team1.score}</div>
                    <div style={styles.cell}>{game.team2.score}</div>
                    <div style={styles.cell}>{game.date?.substring(0, 10)}</div>
                    <div style={styles.actions}>
                      <button
                        className="btn btn-primary"
                        style={{ backgroundColor: '#f9f9f9', marginRight: '6px' }}
                        onClick={() => navigate(`/games/${game._id}`)}>
                        View
                      </button>
                      {
                        game.canEditOrDelete ? (
                          <>
                            <button
                              className="btn btn-primary"
                              style={{ backgroundColor: '#1890ff', color: 'white', marginRight: '6px' }}
                              onClick={() => navigate(`/games/edit/${game._id}`)}>
                              Edit
                            </button>
                            <button
                              className="btn btn-primary"
                              style={{ backgroundColor: '#f32828', color: 'white' }}
                              onClick={() => handleDelete(game._id)}>
                              Delete
                            </button>
                          </>
                        ) : null
                      }
                    </div>
                  </div>
                ))
              }
            </>
          )}
        </div>
        <br></br>
        <Link className="link" to="/">Return Home</Link>
      </div>
    );
  }
};

export default GameList;
