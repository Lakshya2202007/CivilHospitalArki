import React, { useRef, useState } from 'react';
import { Upload, FileText, X, Loader2 } from 'lucide-react';
import { uploadFile } from '../../api/client';

/**
 * Uploads a PDF or image and reports back the stored URL + original name.
 * Used for Plan Document, Notice Attachment and Banner Image.
 */
const FileUploadField = ({
  label,
  hint,
  accept = '.pdf,.jpg,.jpeg,.png,.webp',
  value,
  fileName,
  onChange,
  preview = false,
}) => {
  const inputRef = useRef(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');

  const handleSelect = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setBusy(true);
    setError('');
    try {
      const result = await uploadFile(file);
      onChange({ url: result.url, name: result.name });
    } catch (err) {
      setError(err.message);
    } finally {
      setBusy(false);
      // Allow re-picking the same file after a failure.
      if (inputRef.current) inputRef.current.value = '';
    }
  };

  const clear = () => {
    onChange({ url: '', name: '' });
    setError('');
  };

  const isImage = value && /\.(jpe?g|png|webp)$/i.test(value);

  return (
    <div className="admin-field full">
      <label className="admin-label">{label}</label>

      <div className="admin-file-drop">
        {value ? (
          <>
            <span className="admin-file-name">
              <FileText size={15} />
              <a href={value} target="_blank" rel="noreferrer">{fileName || value.split('/').pop()}</a>
            </span>
            <button type="button" className="admin-btn-icon danger" onClick={clear} aria-label="Remove file">
              <X size={16} />
            </button>
          </>
        ) : (
          <>
            <span className="admin-file-name" style={{ color: 'var(--text-light)' }}>
              {busy ? 'Uploading…' : 'No file selected'}
            </span>
            <button
              type="button"
              className="admin-btn admin-btn-outline admin-btn-sm"
              onClick={() => inputRef.current?.click()}
              disabled={busy}
            >
              {busy ? <Loader2 size={14} className="spin" /> : <Upload size={14} />} Choose file
            </button>
          </>
        )}
      </div>

      {preview && isImage && <img src={value} alt="" className="admin-file-preview" />}
      {hint && !error && <span className="admin-hint">{hint}</span>}
      {error && <span className="admin-hint" style={{ color: 'var(--admin-danger)' }}>{error}</span>}

      <input
        ref={inputRef}
        type="file"
        accept={accept}
        onChange={handleSelect}
        style={{ display: 'none' }}
      />
    </div>
  );
};

export default FileUploadField;
