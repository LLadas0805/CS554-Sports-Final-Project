import React, {useState, useEffect} from 'react';
import GenericItem from './GenericItem';
import NotFound from './NotFound';
import axios from 'axios';
import sports from '../shared/enums/sports.js';
import {Link, useParams, useNavigate} from 'react-router-dom';

const UserList = () => {
    const [name, setName] = useState("");
    const [distance, setDistance] = useState(""); 
    const [skillLevel, setSkillLevel] = useState("any");
    const [sport, setSport] = useState("");
    const [usersData, setUsersData] = useState([]);
    const [loading, setLoading] = useState(true);
    useEffect(() => {
        async function fetchData() {
        try {
            const {data} = await axios.get(`http://localhost:3000/api/user/`, {
                withCredentials: true
            });

            console.log(data);
            if (data.error) throw "error fetching user"
            setUsersData(data);

            
            setLoading(false);

        } catch (e) {
            console.log(e);
            setLoading(false)
        }
        }
        fetchData();
    }, []);

    const handleFilter = async () => {
        setLoading(true);
        try {
            if (name === "" && distance == "" && skillLevel == "any" && sport == "") {
                const {data} = await axios.get(`http://localhost:3000/api/user/`, {
                    withCredentials: true
                });
                setUsersData(data);
            } else {
                
                let { data } = await axios.post("http://localhost:3000/api/user/filter",
                    { name, distance, sport, skillLevel},
                { withCredentials: true });
                setUsersData(data);
            }
            
            setLoading(false);
        } catch (e) {
            console.error("Filter failed:", e);
            setLoading(false);
        }
    };

    if (loading) {
        return (
        <div>
            <h2>Loading....</h2>
        </div>
        );
    } else {
        return(
            <div className="list-container">
                <h1>User List</h1>
                <div className="filters">
                    <div className="form-group-inline">
                        <label htmlFor="name-filter">User/First/Last Name</label>
                        <input
                        id="name-filter"
                        type="text"
                        className="form-input"
                        placeholder="Filter by names"
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
                        onClick={() =>
                        handleFilter()
                        }
                    >
                        Apply Filters
                    </button>
                    </div>

                    <div className="items-container">
                        {usersData.map((user) => (
                        <GenericItem
                            key={user._id}
                            name={`${user.username}`}
                            subtext={`${user.firstName} ${user.lastName}`}
                            additional={`${user.city}, ${user.state}`}
                            link={`/users/${user._id}`}
                        />
                        ))}
                    </div>
                <br></br>
                
                <Link className="link" to="/">Return Home</Link>
            </div>
        );
    }
}

export default UserList;