import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { createTeam, getTeamById, updateTeam, deleteTeam } from '../api/teamApi';

import statesCities from '../../../shared/data/US_States_and_Cities.json' with { type: 'json' };
import sports from '../../../shared/enums/sports.js';
import skills from '../../../shared/enums/skills.js';

const TeamForm = ({ mode }) => {
  const isEdit = mode === 'edit';
  const { id } = useParams();
  const navigate = useNavigate();

  const [form, setForm] = useState({
    name: '',
    description: '',
    state: '',
    city: '',
    preferredSports: [],
    experience: ''
  });

  const [loading, setLoading] = useState(isEdit);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const [selectedSport, setSelectedSport] = useState('');

  useEffect(() => {
    if (!isEdit || !id){
        return;
    }

    async function load(){
      try{
        setLoading(true);
        setError('');
        const data = await getTeamById(id);

        setForm({
          name: data.name || '',
          description: data.description || '',
          state: data.state || '',
          city: data.city || '',
          preferredSports: Array.isArray(data.preferredSports) ? data.preferredSports : (data.preferredSports ? [data.preferredSports] : []),
          experience: data.experience || ''
        });

      } catch (e){
        console.error(e);
        setError(e.message || 'Failed to load team');
      } finally{
        setLoading(false);
      }
    }

    load();
  }, [isEdit, id]);



  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };


  const handleStateChange = (e) => {
    const value = e.target.value;
    setForm((prev) => ({
      ...prev,
      state: value,
      city: ''
    }));
  };

  const handleAddSport = (sportName) => {
    if (!sportName){
        return;
    }

    setForm((prev) => {
      if (prev.preferredSports.includes(sportName)){
        return prev;
      }

      return {
        ...prev,
        preferredSports: [...prev.preferredSports, sportName]
      };
    });

    setSelectedSport('');
  };

  const handleRemoveSport = (sportName) => {
    setForm((prev) => ({
      ...prev,
      preferredSports: prev.preferredSports.filter((s) => s !== sportName)
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError('');


    const payload = {
      name: form.name.trim(),
      description: form.description.trim(),
      state: form.state.trim(),
      city: form.city.trim(),
      preferredSports: form.preferredSports,
      experience: form.experience.trim()
    };

    try {
      if (isEdit){
        await updateTeam(id, payload);
      }
      
      else{
        await createTeam(payload);
      }

      navigate('/teams');

    } catch (e){
      console.error(e);
      
      if (e.response && e.response.data && e.response.data.error){
        setError(e.response.data.error);
      }

      else{
        setError(e.message || 'Failed to save team');
      }
    
    } finally{
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!isEdit || !id){
        return;
    }

    if (!window.confirm('Delete this team?')){
        return;
    }

    try{
      setSaving(true);
      setError('');
      await deleteTeam(id);
      navigate('/teams');

    } catch (e){
      console.error(e);
      setError(e.message || 'Failed to delete team');
    } finally{
      setSaving(false);
    }
  };

  if (loading){
    return (
      <div>
        <h2>Loading…</h2>
      </div>
    );
  }

  return (
    <div className="page">
      <h1>{isEdit ? 'Edit Team' : 'Create Team'}</h1>
      {error && <p className="error">{error}</p>}

      <form onSubmit={handleSubmit} className="form">
        <label>
          Team name
          <input
            name="name"
            value={form.name}
            onChange={handleChange}
            required
            className="form-input"
          />
        </label>

        <label>
          Description
          <textarea
            name="description"
            value={form.description}
            onChange={handleChange}
            required
            className="form-input"
          />
        </label>

        <label>
          State
          <select
            name="state"
            value={form.state}
            onChange={handleStateChange}
            className="form-input"
            required
          >
            <option value="">Select a state</option>
            {Object.keys(statesCities).map((state) => (
              <option key={state} value={state}>
                {state}
              </option>
            ))}
          </select>
        </label>

        <label>
          City
          <select
            name="city"
            value={form.city}
            onChange={handleChange}
            disabled={!form.state}
            className="form-input"
            required
          >
            <option value="">Select a city</option>
            {form.state &&
              statesCities[form.state].map((city) => (
                <option key={city} value={city}>
                  {city}
                </option>
              ))}
          </select>
        </label>

        <label>
          Preferred sports
          <select
            name="sport-picker"
            value={selectedSport}
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
        </label>

        <div className="selected-sports">
        {Array.isArray(form.preferredSports) &&
            form.preferredSports.map((sport) => (
            <button
                key={sport}
                type="button"
                className="sports-buttons"
                onClick={() => handleRemoveSport(sport)}
            >
                • {sport}
            </button>
            ))}
        </div>

        <label>
          Skill level
          <select
            name="experience"
            value={form.experience}
            onChange={handleChange}
            className="form-input"
            required
          >
            <option value="">Select a skill level</option>
            {skills.map((level) => (
              <option key={level} value={level}>
                {level}
              </option>
            ))}
          </select>
        </label>

        <button type="submit" disabled={saving}>
          {saving ? 'Saving…' : isEdit ? 'Save changes' : 'Create team'}
        </button>

        {isEdit && (
          <button
            type="button"
            className="btn-danger"
            disabled={saving}
            onClick={handleDelete}
          >
            Delete team
          </button>
        )}
      </form>
    </div>
  );
};

export default TeamForm;
