import React, {useState, useEffect} from 'react';
import GenericItem from './GenericItem';
import NotFound from './NotFound';
import axios from 'axios';
import sports from '../../../shared/enums/sports.js';
import skills from '../../../shared/enums/skills.js';
import TeamCard from "./TeamCard";
import {Link, useParams, useNavigate} from 'react-router-dom';

const TeamList = () => {
    const [teamsRaw, setTeamsRaw] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    const [name, setName] = useState('');
    const [sport, setSport] = useState('');
    const [skillLevel, setSkillLevel] = useState('');
    const [distance, setDistance] = useState('');
    const [userPref, setUserPref] = useState(null);
    const [page, setPage] = useState(0);
    const pageSize = 6;


    
     //score helpers
  const normalize = (s) => (s || "").toLowerCase().trim();

  const getUserSkillForSport = (user, sport) => {
    const sp = normalize(sport);
    if (!user) return null;

    if ((user.advancedSports || []).some(x => normalize(x) === sp)) return "Advanced";
    if ((user.intermediateSports || []).some(x => normalize(x) === sp)) return "Intermediate";
    if ((user.beginnerSports || []).some(x => normalize(x) === sp)) return "Beginner";
    return null;
  };
  //sorts by higher level to lower level sport, skill level match to not skill level match
  const teamScore = (team, user) => {
    if (!user) return 0;

    const teamSports = team.preferredSports || [];
    let bestSportWeight = 0;
    let matchedSport = null;

    // score getter
    for (const s of teamSports) {
      const userLevel = getUserSkillForSport(user, s);
      if (userLevel === "Advanced" && bestSportWeight < 300) {
        bestSportWeight = 300;
        matchedSport = s;
      } else if (userLevel === "Intermediate" && bestSportWeight < 200) {
        bestSportWeight = 200;
        matchedSport = s;
      } else if (userLevel === "Beginner" && bestSportWeight < 100) {
        bestSportWeight = 100;
        matchedSport = s;
      }
    }
    let skillBonus = 0;
    if (matchedSport) {
      const userLevel = getUserSkillForSport(user, matchedSport);
      if (normalize(team.experience) === normalize(userLevel)) {
        skillBonus = 50;
      }
    }

    
    return bestSportWeight + skillBonus;
  };

  const userSportsSet = (user) => {
    if (!user) return new Set();

    return new Set(
      [
        ...(user.advancedSports || []),
        ...(user.intermediateSports || []),
        ...(user.beginnerSports || [])
      ].map(s => s.toLowerCase())
    );
  };
    
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

          setTeamsRaw(data);
          setPage(0);

      } catch (e){
          console.log(e);
          setError(e.message || 'Error fetching teams');

      } finally{
          setLoading(false);
      }
      }
      fetchData();
  }, []);

  useEffect(() => {
  async function fetchUser() {
    try {

      const authRes = await axios.get(
        "http://localhost:3000/user/auth",
        { withCredentials: true }
      );

      if (!authRes.data.loggedIn) {
        setUserPref(null);
        return;
      }

      const userId = authRes.data.user._id;
      const userRes = await axios.get(`http://localhost:3000/user/${userId}`,
        { withCredentials: true }
      );
      console.log("", userRes.data);
      setUserPref(userRes.data);

    } catch (e) {
      setUserPref(null);
    }
  }

  fetchUser();
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
     
      const ranked = userPref
        ? [...data].sort((a, b) => teamScore(b, userPref) - teamScore(a, userPref))
        : data;
      

      setTeamsRaw(ranked);
      setPage(0);

    } catch (e){
      console.log(e);
      setError(e.message || 'Error filtering teams');

    } finally{
      setLoading(false);
    }
  };


  const teamsSorted = React.useMemo(() => {
      if (!teamsRaw || teamsRaw.length === 0) return [];
      if (!userPref) return teamsRaw;

      return [...teamsRaw].sort((a, b) => teamScore(b, userPref) - teamScore(a, userPref));
    }, [teamsRaw, userPref]);

    const visibleTeams = teamsSorted.slice(page * pageSize, page * pageSize + pageSize);
    const maxPage = Math.max(0, Math.ceil(teamsRaw.length / pageSize) - 1);


  if (loading){
    return (
      <div>
        <h2>Loading....</h2>
      </div>
    );
  }

 return (
      <div className="page">
        <div className="team-page">

          <aside className="team-filters">

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
                  <option value="15">Close (0-15 miles)</option>
                  <option value="30">Moderate (15-30 miles)</option>
                  <option value="100">Far (30-100 miles)</option>
                </select>
              </div>

              <div className="form-group-inline">
                <label>Skill Level:</label>
                <select
                  value={skillLevel}
                  onChange={(e) => setSkillLevel(e.target.value)}
                  className="form-input"
                >
                  <option value="">Enter a Skill Level</option>
                  {skills.map((lvl) => (
                    <option key={lvl} value={lvl}>
                      {lvl}
                    </option>
                  ))}
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
                  {sports.map((sp) => (
                    <option key={sp} value={sp}>
                      {sp}
                    </option>
                  ))}
                </select>
              </div>

              <button className="btn btn-primary filter-btn" onClick={handleApplyFilters}>
                Apply Filters
              </button>

              {error && <p className="error">{error}</p>}
            </div>

            <div className="mt">
              <Link className="link" to="/">
                Return Home
              </Link>
            </div>

          </aside>

          <div className = "team-right">
          <section className="team-results">
            {visibleTeams.map((team) => (
              <TeamCard key={team._id} team={team} user={userPref}/>
            ))}
          </section>
          <div className="pager">
            <button disabled={page === 0} onClick={() => setPage(p => Math.max(0, p - 1))}>
              Prev
            </button>

            <span>
              Page {page + 1} of {maxPage + 1}
            </span>

            <button disabled={page === maxPage} onClick={() => setPage(p => Math.min(maxPage, p + 1))}>
              Next
            </button>
          </div>
          </div>
        </div>
      </div>
    );

};

export default TeamList;
 