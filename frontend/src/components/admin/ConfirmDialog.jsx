import React from 'react';

/** Confirmation step for destructive actions, so a stray click can't delete a record. */
const ConfirmDialog = ({ open, title, message, confirmLabel = 'Delete', busy, onConfirm, onCancel }) => {
  if (!open) return null;

  return (
    <div className="admin-modal-overlay" onClick={onCancel}>
      <div className="admin-modal" onClick={(e) => e.stopPropagation()}>
        <h3>{title}</h3>
        <p>{message}</p>
        <div className="admin-form-actions">
          <button type="button" className="admin-btn admin-btn-outline" onClick={onCancel} disabled={busy}>
            Cancel
          </button>
          <button type="button" className="admin-btn admin-btn-danger" onClick={onConfirm} disabled={busy}>
            {busy ? 'Working…' : confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ConfirmDialog;
