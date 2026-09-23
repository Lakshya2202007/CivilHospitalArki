import React from 'react';

/** Status pill; class names mirror the public table's badge colours. */
const StatusBadge = ({ status }) => (
  <span className={`admin-badge ${String(status).toLowerCase().replace(/\s+/g, '-')}`}>
    {status}
  </span>
);

export default StatusBadge;
