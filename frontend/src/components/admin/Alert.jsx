import React from 'react';

/** Renders an API error (with its validation details) or a success message. */
const Alert = ({ type = 'error', message, details }) => {
  if (!message) return null;

  return (
    <div className={`admin-alert ${type}`}>
      {message}
      {Array.isArray(details) && details.length > 0 && (
        <ul>{details.map((d) => <li key={d}>{d}</li>)}</ul>
      )}
    </div>
  );
};

export default Alert;
