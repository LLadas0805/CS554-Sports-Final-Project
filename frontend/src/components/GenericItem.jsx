import React from "react";
import { Link} from 'react-router-dom';

function GenericItem({ name, subtext, additional, link }) {
  return (
    <div className="list-item">
      <div className="list-item-info">
        <div className="list-item-name">
            <Link to={link}>{name}</Link>
        </div>
        <div className="list-item-subtext">{subtext}</div>
      </div>
      <div className="list-item-additional">{additional}</div>
    </div>
  );
}

export default GenericItem;