import React, {useState, useEffect} from 'react';
import GenericItem from './GenericItem';
import NotFound from './NotFound';
import axios from 'axios';
import sports from '../../../shared/enums/sports.js';
import {Link, useParams, useNavigate} from 'react-router-dom';

const TeamList = () => {
    const [teamsData, setTeamsData] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    const [name, setName] = useState('');
    const [sport, setSport] = useState('');
    const [skillLevel, setSkillLevel] = useState('');
    const [distance, setDistance] = useState('');

    useEffect(() => {
        async function fetchData(){
        try{
            setLoading(true);
            setError('');
            const { data } = await axios.get(`http://localhost:3000/team/`, {
            withCredentials: true
            });

            if (data.error){
                throw new Error(data.error);
            }

            setTeamsData(data);

        } catch (e){
            console.log(e);
            setError(e.message || 'Error fetching teams');

        } finally{
            setLoading(false);
        }
        }
        fetchData();
    }, []);

  
  const handleApplyFilters = async () => {
    try{
      setLoading(true);
      setError('');

      const body = {
        name: name || undefined,
        distance: distance || undefined,
        skillLevel: skillLevel || undefined,
        sport: sport || undefined
      };

      const { data } = await axios.post(`http://localhost:3000/team/filter`, body, {
        withCredentials: true
      });

      if (data.error){
        throw new Error(data.error);
      }

      setTeamsData(data);

    } catch (e){
      console.log(e);
      setError(e.message || 'Error filtering teams');

    } finally{
      setLoading(false);
    }
  };

  if (loading){
    return (
      <div>
        <h2>Loading....</h2>
      </div>
    );
  }

  return (
    <div className="list-container">
      <h1>Team List</h1>

      <Link className="btn btn-primary" to="/teams/new">
        + Create Team
      </Link>
      
      <div className="filters">
        <div className="form-group-inline">
          <label htmlFor="name-filter">Team Name</label>
          <input
          id="name-filter"
          type="text"
          className="form-input"
          placeholder="Filter by team name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          />
      </div>

      <div className="form-group-inline">
      <label>Distance (miles):</label>
      <select
          value={distance}
          onChange={(e) => setDistance(e.target.value)}
          className="form-input"
      >
          <option value="">Enter a distance range</option>
          <option value="close">Close (0-15 miles)</option>
          <option value="moderate">Moderate (15-30 miles)</option>
          <option value="far">Far (30-100 miles)</option>
      </select>
      </div>

      <div className="form-group-inline">
          <label>Skill Level:</label>
          <select
              value={skillLevel}
              onChange={(e) => setSkillLevel(e.target.value)}
              className="form-input"
          >
              <option value="any">Enter a Skill Level</option>
              <option value="beginner">Beginner</option>
              <option value="intermediate">Intermediate</option>
              <option value="advanced">Advanced</option>
          </select>
      </div>

      <div className="form-group-inline">
          <label>Preferred Sport:</label>
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
          onClick={handleApplyFilters}
        >
          Apply Filters
        </button>
      </div>

      {error && <p className="error">{error}</p>}

      <div className="list-container">
        {teamsData.map((team) => (
          <GenericItem
            key={team._id}
            name={team.name || team.teamName || 'Unnamed Team'}
            subtext={`${team.description.slice(0 , 30) + '...'}`}
            additional={`${team.city}, ${team.state}`}
            link={`/teams/${team._id}`}
          />
        ))}
      </div>

      <br />
      <Link className="link" to="/">
        Return Home
      </Link>
    </div>
  );
};

export default TeamList;
 