import {Link, useNavigate, useParams} from 'react-router-dom';
import React, { useEffect, useState } from 'react';
import statesCities from '../shared/data/US_States_and_Cities.json' with { type: 'json' };
import sports from '../shared/enums/sports.js';
import axios from 'axios';

function UserEdit(props) {
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();
    // Use this for loading certain elements like team invites/edit/delete
    const [logged, setLogged] = useState(false);
    // const classes = useStyles();
    let {id} = useParams();
    const [saving, setSaving] = useState(false);

    const [formData, setFormData] = useState({});
    const [advancedSearch, setAdvancedSearch] = useState('');

    useEffect(() => {
        async function fetchData() {
            try {
                const { data } = await axios.get(
                    `/api/user/${id}`,
                    { withCredentials: true }
                );

                console.log(id)
                if (data.error) throw "error fetching user";
                console.log(data.state)
                // Populate form with user data
                setFormData({
                    username: data.username || "",
                    firstName: data.firstName || "",
                    lastName: data.lastName || "",
                    email: data.email || "",
                    phoneNumber: data.phoneNumber || "",
                    state: data.state || "",
                    city: data.city || "",
                    birthday: data.birthday?.slice(0, 10) || "",
                    advancedSports: data.advancedSports || [],
                    intermediateSports: data.intermediateSports || [],
                    beginnerSports: data.beginnerSports || [],
                });

                // Check auth
                const { data: loggedData } = await axios.get(
                    "/api/user/auth",
                    { withCredentials: true }
                );

                if (loggedData.loggedIn && loggedData.user._id === id) {
                    setLogged(true);
                } else {
                    setLogged(false);
                    navigate(`/users/`);
                }

                setLoading(false);
            } catch (e) {
                console.log(e);
                setLoading(false);
            }
        }

        fetchData();
    }, [id]);


    const handleChange = (e) => {
        const { name, value } = e.target;

        setFormData((prev) => ({
            ...prev,
            [name]: value
        }));
    };

    
    const handleAddSport = (level, sportName) => {
        setFormData((prev) => {
            const currentList = prev[level] || [];
            if (currentList.includes(sportName)) return prev; // avoid duplicates

            return {
            ...prev,
            [level]: [...currentList, sportName]
            };
        });

        // clear search box for advanced level
        if (level === 'advancedSports') {
            setAdvancedSearch('');
        }
    };

    
    const handleRemoveSport = (level, sportName) => {
        setFormData((prev) => ({
        ...prev,
        [level]: prev[level].filter((s) => s !== sportName)
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
        try {
            const response = await axios.put(`/api/user/${id}`,  formData, { withCredentials: true },{
                headers: { "Content-Type": "application/json" }
            });
            console.log("Edit successful:", response.data);
            alert("Edit successful!");
            navigate(`/users/${id}`);
        } catch (err) {
            console.error(err.response?.data?.error);
            alert(err.response?.data?.error || err.message);
        } finally {
            setSaving(false);
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
            <div>
                <h1>Edit Your Account</h1>
                <div className="form">
                    <form onSubmit={handleSubmit}>
                        <div className="form-group">
                            <label htmlFor="username">Username</label>
                            <input
                            id="username"
                            name="username"
                            className="form-input"
                            placeholder="Username"
                            value={formData.username}
                            onChange={handleChange}
                            />
                        </div>

                        <div className="form-group">
                            <label htmlFor="firstName">First Name</label>
                            <input
                            id="firstName"
                            name="firstName"
                            className="form-input"
                            placeholder="First Name"
                            value={formData.firstName}
                            onChange={handleChange}
                            />
                        </div>

                        <div className="form-group">
                            <label htmlFor="lastName">Last Name</label>
                            <input
                            id="lastName"
                            name="lastName"
                            className="form-input"
                            placeholder="Last Name"
                            value={formData.lastName}
                            onChange={handleChange}
                            />
                        </div>

                        <div className="form-group">
                            <label htmlFor="email">Email</label>
                            <input
                            id="email"
                            name="email"
                            className="form-input"
                            placeholder="Email"
                            value={formData.email}
                            onChange={handleChange}
                            />
                        </div>

                        <div className="form-group">
                            <label htmlFor="phoneNumber">Phone Number</label>
                            <input
                            id="phoneNumber"
                            name="phoneNumber"
                            className="form-input"
                            placeholder="Phone Number"
                            value={formData.phoneNumber}
                            onChange={handleChange}
                            />
                        </div>

                        <div className="form-group">
                            <label htmlFor="birthday">Date of Birth</label>
                            <input
                            id="birthday"
                            name="birthday"
                            type="date"
                            className="form-input"
                            value={formData.birthday}
                            onChange={handleChange}
                            />
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
                        <br></br>
                        {/* ADVANCED SPORTS */}
                        <div className="form-group">
                            <label>Advanced Sports</label>
                            <select
                            id="advancedSports"
                            name="advancedSports"
                            value={advancedSearch}
                            onChange={(e) => handleAddSport('advancedSports', e.target.value)}
                            className="form-input"
                            >
                            <option value="">Select a sport</option>
                            {sports.map((sport) => (
                                <option key={sport} value={sport}>
                                {sport}
                                </option>
                            ))}
                            </select>
                            <div className="selected-sports">
                            {formData.advancedSports.map((sport) => (
                                <span key={sport} className="tag">
                                
                                <button
                                    className = "sports-buttons"
                                    type="button"
                                    onClick={() =>
                                    handleRemoveSport('advancedSports', sport)
                                    }
                                >
                                    • {sport}
                                </button>
                                </span>
                            ))}
                            </div>
                        </div>

                        {/* INTERMEDIATE SPORTS */}
                        <div className="form-group">
                            <label>Intermediate Sports</label>
                            <select
                            id="intermediateSports"
                            name="intermediateSports"
                            value={advancedSearch}
                            onChange={(e) => handleAddSport('intermediateSports', e.target.value)}
                            className="form-input"
                            >
                            <option value="">Select a sport</option>
                            {sports.map((sport) => (
                                <option key={sport} value={sport}>
                                {sport}
                                </option>
                            ))}
                            </select>
                            <div className="selected-sports">
                            {formData.intermediateSports.map((sport) => (
                                <span key={sport} className="tag">
                                
                                <button
                                    className = "sports-buttons"
                                    type="button"
                                    onClick={() =>
                                    handleRemoveSport('intermediateSports', sport)
                                    }
                                >
                                    • {sport}
                                </button>
                                </span>
                            ))}
                            </div>
                        </div>

                        {/* BEGINNER SPORTS */}
                        <div className="form-group">
                            <label>Beginner Sports</label>
                            <select
                            id="beginnerSports"
                            name="beginnerSports"
                            value={advancedSearch}
                            onChange={(e) => handleAddSport('beginnerSports', e.target.value)}
                            className="form-input"
                            >
                            <option value="">Select a sport</option>
                            {sports.map((sport) => (
                                <option key={sport} value={sport}>
                                {sport}
                                </option>
                            ))}
                            </select>
                            <div className="selected-sports">
                            {formData.beginnerSports.map((sport) => (
                                <span key={sport} className="tag">
                                
                                <button
                                    className = "sports-buttons"
                                    type="button"
                                    onClick={() =>
                                    handleRemoveSport('beginnerSports', sport)
                                    }
                                >
                                    • {sport} 
                                </button>
                                </span>
                            ))}
                            </div>
                        </div>

                        <br />
                        
                        <button type="submit" disabled={saving}>Edit Account</button>
                    </form>
                </div>
                <div className = "pages">
                    <Link className='link' to={`/users/${id}`}>
                        Return To Profile
                    </Link>
                </div>
            </div>
        );
    }
}

export default UserEdit;