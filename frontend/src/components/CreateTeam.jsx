import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate, Link } from 'react-router-dom';
import statesCities from '../../../shared/data/US_States_and_Cities.json' with { type: 'json' };
import sports from '../../../shared/enums/sports.js';

const CreateTeam = () => {
  const navigate = useNavigate();

  const defaultData = {
    name: '',
    description: '',
    state: '',
    city: '',
    preferredSports: [],
    experience: ''
  };

  const [formData, setFormData] = useState(defaultData);
  const [error, setError] = useState(null);
  const [submitting, setSubmitting] = useState(false);

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
      city: '' // reset city when state changes
    }));
  };

  const handleAddSport = (sportName) => {
    if (!sportName) return;

    setFormData((prev) => {
      const current = prev.preferredSports || [];
      if (current.includes(sportName)) return prev; // avoid duplicates

      return {
        ...prev,
        preferredSports: [...current, sportName]
      };
    });
  };

  const handleRemoveSport = (sportName) => {
    setFormData((prev) => ({
      ...prev,
      preferredSports: prev.preferredSports.filter((s) => s !== sportName)
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);

    const { name, description, state, city, preferredSports, experience } =
      formData;

    // Light front-end validation that mirrors your backend checks
    if (!name.trim()) {
      setError('Team name is required.');
      return;
    }

    if (!state) {
      setError('State is required.');
      return;
    }

    if (!city) {
      setError('City is required.');
      return;
    }

    if (!description || description.trim().length < 10) {
      setError('Description must be at least 10 characters.');
      return;
    }

    if (!preferredSports || preferredSports.length === 0) {
      setError('Must include at least one sport.');
      return;
    }

    if (!experience) {
      setError('Skill level is required.');
      return;
    }

    try {
      setSubmitting(true);

      const { data } = await axios.post(
        'http://localhost:3000/team/create',
        {
          name,
          description,
          state,
          city,
          preferredSports,
          experience
        },
        {
          withCredentials: true
        }
      );

      if (data && data._id) {
        navigate(`/`);
      } else {
        navigate('/teams');
      }
    } catch (err) {
    console.error('Server error payload:', err.response?.data);
    const msg =
      err.response?.data?.error ||
      'Failed to create team. Please check your input and try again.';
    setError(typeof msg === 'string' ? msg : JSON.stringify(msg));
  } finally {
    setSubmitting(false);
  }
  };

  return (
    <div className="page">
      <h1>Create a New Team</h1>

      <p>Fill out the details below to create a team that other players can join.</p>

      {error && <p style={{ color: 'red' }}>{error}</p>}

      <form onSubmit={handleSubmit} className="form">
        {/* TEAM NAME */}
        <div className="form-group">
          <label htmlFor="name">Team Name</label>
          <input
            id="name"
            name="name"
            type="text"
            value={formData.name}
            onChange={handleChange}
            placeholder="e.g. Hoboken Hoopers"
          />
        </div>

        {/* DESCRIPTION */}
        <div className="form-group">
          <label htmlFor="description">Description</label>
          <textarea
            id="description"
            name="description"
            value={formData.description}
            onChange={handleChange}
            placeholder="What is this team about?"
          />
        </div>

        {/* STATE */}
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

        {/* CITY */}
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

        {/* PREFERRED SPORTS (using enum like Signup) */}
        <div className="form-group">
          <label>Preferred Sports</label>
          <select
            id="preferredSports"
            // we always reset to ""; the onChange is what matters
            value=""
            onChange={(e) => handleAddSport(e.target.value)}
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
            {formData.preferredSports.map((sport) => (
              <span key={sport} className="tag">
                <button
                  className="sports-buttons"
                  type="button"
                  onClick={() => handleRemoveSport(sport)}
                >
                  • {sport}
                </button>
              </span>
            ))}
          </div>
        </div>

        {/* EXPERIENCE LEVEL (same as before) */}
        <div className="form-group">
          <label htmlFor="experience">Experience Level</label>
          <select
            id="experience"
            name="experience"
            value={formData.experience}
            onChange={handleChange}
          >
            <option value="">Select level</option>
            <option value="beginner">Beginner</option>
            <option value="intermediate">Intermediate</option>
            <option value="advanced">Advanced</option>
          </select>
        </div>

        <button type="submit" disabled={submitting}>
          {submitting ? 'Creating...' : 'Create Team'}
        </button>
      </form>

      <div style={{ marginTop: '1rem' }}>
        <Link className="link" to="/teams">
          Back to Teams
        </Link>
      </div>
    </div>
  );
};

export default CreateTeam;
