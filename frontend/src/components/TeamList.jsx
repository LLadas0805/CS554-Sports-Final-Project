import React, {useState, useEffect} from 'react';
import GenericItem from './GenericItem';
import NotFound from './NotFound';
import axios from 'axios';
import {Link, useParams, useNavigate} from 'react-router-dom';

const TeamList = () => {
    const [name, setName] = useState("")
    const [teamsData, setTeamsData] = useState([]);
    const [loading, setLoading] = useState(true);
    useEffect(() => {
        async function fetchData() {
        try {
            const {data} = await axios.get(`http://localhost:3000/team/`, {
                withCredentials: true
            });

            console.log(data);
            if (data.error) throw "error fetching team"
            setUsersData(data);    
            setLoading(false);

        } catch (e) {
            console.log(e);
            setLoading(false)
        }
        }
        fetchData();
    }, []);
    if (loading) {
        return (
        <div>
            <h2>Loading....</h2>
        </div>
        );
    } else {
        return(
            <div className="list-container">
                <h1>Team List</h1>
                <Link></Link>
                <div className="filters">
                    <div className="form-group-inline">
                        <label htmlFor="name-filter">Name</label>
                        <input
                        id="name-filter"
                        type="text"
                        className="form-input"
                        placeholder="Filter by team name"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        />
                    </div>

                    <button
                        className="btn btn-primary filter-btn"
                        onClick={() =>
                        setFilters({
                            name
                        })
                        }
                    >
                        Apply Filters
                    </button>
                    </div>
                    <div className="list-container">
                        {teamsData.map((team) => (
                        <GenericItem
                            key={team._id}
                            name={`${team.teamName}`}
                            subtext={`${team.description}`}
                            additional={`${team.city}, ${team.state}`}
                            link={`/teams/${user._id}`}
                        />
                        ))}
                    </div>
                <br></br>
                <Link className="link" to="/">Return Home</Link>
            </div>
        );
    }
}

export default TeamList;