import React, { useRef, useState } from 'react';
import { Upload, FileText, X, Loader2 } from 'lucide-react';
import { uploadFile } from '../../api/client';

const TYPE_LABELS = {
  notice: 'Notice',
  specs: 'Specifications',
  terms: 'Terms & Conditions',
  corrigendum: 'Corrigendum',
};

const formatSize = (bytes) => {
  if (!bytes) return '';
  return bytes >= 1024 * 1024
    ? `${(bytes / (1024 * 1024)).toFixed(1)} MB`
    : `${Math.max(1, Math.round(bytes / 1024))} KB`;
};

/**
 * Manages the list of documents attached to a tender. Each entry carries an
 * uploaded file plus a category, matching how the public detail modal groups them.
 */
const DocumentListField = ({ documents = [], documentTypes = [], onChange }) => {
  const inputRef = useRef(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [pendingType, setPendingType] = useState('notice');

  const handleSelect = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setBusy(true);
    setError('');
    try {
      const result = await uploadFile(file);
      onChange([
        ...documents,
        { name: result.name, url: result.url, type: pendingType, size: formatSize(result.size) },
      ]);
    } catch (err) {
      setError(err.message);
    } finally {
      setBusy(false);
      if (inputRef.current) inputRef.current.value = '';
    }
  };

  const updateAt = (index, changes) => {
    onChange(documents.map((d, i) => (i === index ? { ...d, ...changes } : d)));
  };

  const removeAt = (index) => {
    onChange(documents.filter((_, i) => i !== index));
  };

  return (
    <div className="admin-field full">
      <label className="admin-label">Tender Documents</label>
      <span className="admin-hint">
        Notice, specifications, terms or corrigendum. These appear in the public tender details.
      </span>

      {documents.length > 0 && (
        <ul className="admin-doc-list">
          {documents.map((doc, i) => (
            <li className="admin-doc-item" key={`${doc.url}-${i}`}>
              <FileText size={15} />

              <input
                className="admin-input admin-doc-name"
                value={doc.name}
                onChange={(e) => updateAt(i, { name: e.target.value })}
                aria-label="Document name"
              />

              <select
                className="admin-select admin-doc-type"
                value={doc.type}
                onChange={(e) => updateAt(i, { type: e.target.value })}
                aria-label="Document category"
              >
                {documentTypes.map((t) => (
                  <option key={t} value={t}>{TYPE_LABELS[t] || t}</option>
                ))}
              </select>

              <span className="admin-hint admin-doc-size">{doc.size}</span>

              <a href={doc.url} target="_blank" rel="noreferrer" className="admin-btn-icon" title="Open file">
                <FileText size={15} />
              </a>

              <button
                type="button"
                className="admin-btn-icon danger"
                onClick={() => removeAt(i)}
                aria-label="Remove document"
              >
                <X size={15} />
              </button>
            </li>
          ))}
        </ul>
      )}

      <div className="admin-file-drop" style={{ marginTop: documents.length ? '0.5rem' : 0 }}>
        <span className="admin-file-name" style={{ gap: '0.5rem' }}>
          <span style={{ color: 'var(--text-light)' }}>Add as</span>
          <select
            className="admin-select"
            style={{ width: 'auto', padding: '0.3rem 0.5rem' }}
            value={pendingType}
            onChange={(e) => setPendingType(e.target.value)}
            aria-label="Category for the next upload"
          >
            {documentTypes.map((t) => (
              <option key={t} value={t}>{TYPE_LABELS[t] || t}</option>
            ))}
          </select>
        </span>

        <button
          type="button"
          className="admin-btn admin-btn-outline admin-btn-sm"
          onClick={() => inputRef.current?.click()}
          disabled={busy}
        >
          {busy ? <Loader2 size={14} /> : <Upload size={14} />}
          {busy ? 'Uploading…' : 'Upload document'}
        </button>
      </div>

      {error && <span className="admin-hint" style={{ color: 'var(--admin-danger)' }}>{error}</span>}

      <input
        ref={inputRef}
        type="file"
        accept=".pdf,.jpg,.jpeg,.png,.webp"
        onChange={handleSelect}
        style={{ display: 'none' }}
      />
    </div>
  );
};

export default DocumentListField;
