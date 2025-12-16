import React from "react";
import { Link } from "react-router-dom";

//card maker
const TeamCard = ({ team , user}) => {
  const teamName = team?.teamName || team?.name || "Unnamed Team";
  const description = (team?.description || "").trim();
  const descShort = description.length > 500 ? description.slice(0, 500) + "..." : description;

  const userSports = user
  ? new Set(
      [
        ...(user.advancedSports || []),
        ...(user.intermediateSports || []),
        ...(user.beginnerSports || [])
      ].map((s) => (s || "").toLowerCase().trim())
    )
  : new Set();


  const sports = Array.isArray(team?.preferredSports) ? team.preferredSports : [];
  const city = team?.city || "";
  const state = team?.state || "";
  const locationText = [city, state].filter(Boolean).join(", ") || "Location not listed";

  const experience = team?.experience || "Not listed";

  return (
    <Link to={`/teams/${team._id}`} className="team-card">
      <div className="team-card__top">
        <h3 className="team-card__title">{teamName}</h3>
        <span className="team-card__badge">{experience}</span>
      </div>

      <p className="team-card__desc">{descShort || "No description provided."}</p>

      <div className="team-card__meta">
        <div><strong>Sports:</strong> {sports.length ? (
            sports.map((sp, i) => {
            const match = userSports.has((sp || "").toLowerCase().trim());
            return (
                <span key={`${sp}-${i}`}>
                {match ? <strong className="sport-match">{sp}</strong> : sp}
                {i < sports.length - 1 ? ", " : ""}
                </span>
            );
            })
        ) : (
            "No sports listed"
        )}</div>
        <div><strong>Location:</strong> {locationText}</div>
      </div>

      <div className="team-card__cta">View Team</div>
    </Link>
  );
};

export default TeamCard;
