import {Link, useNavigate, useParams} from 'react-router-dom';
import React, { useEffect, useState } from 'react';
<<<<<<< HEAD
import statesCities from '../shared/data/US_States_and_Cities.json' with { type: 'json' };
import sports from '../shared/enums/sports.js';
=======
import statesCities from '../../shared/data/US_States_and_Cities.json' with { type: 'json' };
import sports from '../../shared/enums/sports.js';
>>>>>>> dd8435f4a9c6c975135e4d24ff5b0528c658e194
import axios from 'axios';

function GameEdit() {
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();
    const [formData, setFormData] = useState({
        team1Id: "",
        team2Id: "",
        state: "",
        city: "",
        score1: "0",
        score2: "0",
        sport: "",
        date: "",
    });
    const [teams, setTeams] = useState([]);
    const [saving, setSaving] = useState(false);
    let {id} = useParams();
    const isEditPage = id !== undefined;

    useEffect(() => {
        async function fetchData() {
            setLoading(true);
            try {
                const { data } = await axios.get(
<<<<<<< HEAD
                    `/api/game/${id}`,
=======
                    `/game/${id}`,
>>>>>>> dd8435f4a9c6c975135e4d24ff5b0528c658e194
                    { withCredentials: true }
                );

                if (data.error) throw "error fetching user";

                // Populate form
                setFormData({
                    team1Id: data.team1._id,
                    team2Id: data.team2._id,
                    state: data.state,
                    city: data.city,
                    score1: data.team1.score,
                    score2: data.team2.score,
                    sport: data.sport,
                    date: data.date.slice(0, 10),
                });
                setLoading(false);
            } catch (e) {
                console.log(e);
                setLoading(false);
            }
        }

        async function fetchTeams() {
            try {
                const { data } = await axios.get(
<<<<<<< HEAD
                    `/api/team/`,
=======
                    `/team/`,
>>>>>>> dd8435f4a9c6c975135e4d24ff5b0528c658e194
                    { withCredentials: true }
                );
                if (data.error) throw "Error fetching teams";

                setTeams(data);
            } catch (e) {
                console.log(e);
            }
        }

        fetchTeams();

        if(isEditPage) {
            fetchData();
        }
    }, [id]);

    const handleChange = (e) => {
        const { name, value } = e.target;

        setFormData((prev) => ({
            ...prev,
            [name]: value
        }));
    };

    const handleStateChange = (e) => {
        const value = e.target.value;

        setFormData((prev) => ({
            ...prev,
            state: value,
            city: ""
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (saving) return;
        setSaving(true);

        formData.score1 = Number(formData.score1);
        formData.score2 = Number(formData.score2);

        if(isEditPage) {
            try {
<<<<<<< HEAD
                const response = await axios.put(`/api/game/${id}`, formData, { withCredentials: true },{
=======
                const response = await axios.put(`/game/${id}`, formData, { withCredentials: true },{
>>>>>>> dd8435f4a9c6c975135e4d24ff5b0528c658e194
                    headers: { "Content-Type": "application/json" }
                });
                console.log("Edit successful:", response.data);
                alert("Edit successful!");
                navigate(`/games`);
            } catch (err) {
                console.error(err.response?.data?.error);
                alert(err.response?.data?.error || err.message);
            }

        } else {
            try {
<<<<<<< HEAD
                const response = await axios.post(`/api/game/create`,  formData, { withCredentials: true },{
=======
                const response = await axios.post(`/game/create`,  formData, { withCredentials: true },{
>>>>>>> dd8435f4a9c6c975135e4d24ff5b0528c658e194
                    headers: { "Content-Type": "application/json" }
                });
                console.log("New game successful:", response);
                alert("New game successful!");
                navigate(`/games`);
            } catch (err) {
                console.error(err.response?.data?.error);
                alert(err.response?.data?.error || err.message);
            }
        }

        setSaving(false);
    };

    if (loading) {
        return (
        <div>
            <h2>Loading....</h2>
        </div>
        );
    } else {
        return (
            <div>
                <h1>{isEditPage ? "Edit Game" : "New Game"}</h1>
                <div className="form">
                    <form onSubmit={handleSubmit}>

                        <div className="form-group">
                            <label htmlFor="team1Id">Team 1</label>
                            <select
                              id="team1Id"
                              name="team1Id"
                              value={formData.team1Id}
                              onChange={handleChange}
                              className="form-input"
                              disabled={isEditPage}
                            >
                                <option value="">Select a Team</option>
                                {teams.map((team) => (
                                  <option key={team._id} value={team._id}>
                                    {team.teamName}
                                  </option>
                                ))}
                            </select>
                        </div>
                        <div className="form-group">
                            <label htmlFor="score1">Score 1</label>
                            <input
                              id="score1"
                              name="score1"
                              type="number"
                              min="0"
                              max="100"
                              className="form-input"
                              value={formData.score1}
                              onChange={handleChange}
                            />
                        </div>
                        <div className="form-group">
                            <label htmlFor="team2Id">Team 2</label>
                            <select
                              id="team2Id"
                              name="team2Id"
                              value={formData.team2Id}
                              onChange={handleChange}
                              className="form-input"
                              disabled={isEditPage}
                            >
                                <option value="">Select a Team</option>
                                {teams.map((team) => (
                                  <option key={team._id} value={team._id}>
                                      {team.teamName}
                                  </option>
                                ))}
                            </select>
                        </div>
                        
                        <div className="form-group">
                            <label htmlFor="score2">Score 2</label>
                            <input
                              id="score2"
                              name="score2"
                              type="number"
                              min="0"
                              max="100"
                              className="form-input"
                              value={formData.score2}
                              onChange={handleChange}
                            />
                        </div>
                        <div className="form-group">
                            <label>Sport</label>
                            <select
                              id="sport"
                              name="sport"
                              className="form-input"
                              value={formData.sport}
                              onChange={handleChange}
                            >
                                <option value="">Select a sport</option>
                                {sports.map((sport) => (
                                  <option key={sport} value={sport}>
                                      {sport}
                                  </option>
                                ))}
                            </select>
                        </div>
                        <div className="form-group">
                            <label htmlFor="state">State</label>
                            <select
                              id="state"
                              name="state"
                              value={formData.state}
                              onChange={handleStateChange}
                              className="form-input"
                            >
                                <option value="">Select a State</option>
                                {Object.keys(statesCities).map((state) => (
                                  <option key={state} value={state}>
                                      {state}
                                  </option>
                                ))}
                            </select>
                        </div>

                        <div className="form-group">
                            <label htmlFor="city">City</label>
                            <select
                              id="city"
                              name="city"
                              value={formData.city}
                              onChange={handleChange}
                              disabled={!formData.state}
                              className="form-input"
                            >
                                <option value="">Select a city</option>
                                {formData.state &&
                                  statesCities[formData.state].map((city) => (
                                    <option key={city} value={city}>
                                        {city}
                                    </option>
                                  ))}
                            </select>
                        </div>
                        <div className="form-group">
                            <label htmlFor="date">Date</label>
                            <input
                              id="date"
                              name="date"
                              type="date"
                              className="form-input"
                              value={formData.date}
                              onChange={handleChange}
                            />
                        </div>

                        <br />

                        <button type="submit" disabled={saving}>Submit</button>
                    </form>
                </div>

                <div className = "pages">
                    <Link className='link' to={`/games`}>
                        Return To Game List
                    </Link>
                </div>
            </div>
        );
    }
}

export default GameEdit;
