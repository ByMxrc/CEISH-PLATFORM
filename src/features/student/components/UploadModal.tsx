import { useRef, useState } from 'react';

interface Props {
  onConfirm: (file: File, comment: string) => void;
  onCancel: () => void;
  initialFile?: File;
  initialComment?: string;
  mode?: 'create' | 'edit';
}

function formatBytes(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

export function UploadModal({ onConfirm, onCancel, initialFile, initialComment = '', mode = 'create' }: Props) {
  const [file, setFile] = useState<File | null>(initialFile ?? null);
  const [comment, setComment] = useState(initialComment);
  const fileRef = useRef<HTMLInputElement>(null);

  const handleFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    if (f) setFile(f);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    const f = e.dataTransfer.files[0];
    if (f?.type === 'application/pdf') setFile(f);
  };

  const canConfirm = file !== null;

  return (
    <div className="modal-backdrop" onClick={(e) => { if (e.target === e.currentTarget) onCancel(); }}>
      <div className="modal">
        <div className="modal__header">
          <h2 className="modal__title">
            {mode === 'edit' ? 'Editar entrega' : 'Confirmar entrega'}
          </h2>
          <button className="modal__close" onClick={onCancel} aria-label="Cerrar">
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
              <path d="M4 4l8 8M12 4l-8 8" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
            </svg>
          </button>
        </div>

        <div className="modal__body">
          {/* File drop zone */}
          <div
            className={`upload-zone ${file ? 'upload-zone--has-file' : ''}`}
            onDrop={handleDrop}
            onDragOver={(e) => e.preventDefault()}
            onClick={() => fileRef.current?.click()}
          >
            {file ? (
              <div className="upload-zone__preview">
                <svg width="36" height="36" viewBox="0 0 36 36" fill="none">
                  <rect width="36" height="36" rx="8" fill="#eff6ff" />
                  <path d="M10 8h16a3 3 0 013 3v14a3 3 0 01-3 3H10a3 3 0 01-3-3V11a3 3 0 013-3z" stroke="#2563eb" strokeWidth="1.5" fill="none" />
                  <path d="M13 15h10M13 19h10M13 23h6" stroke="#2563eb" strokeWidth="1.5" strokeLinecap="round" />
                </svg>
                <div className="upload-zone__file-info">
                  <p className="upload-zone__file-name">{file.name}</p>
                  <p className="upload-zone__file-meta">
                    {file.name.split('.').pop()?.toUpperCase()} · {formatBytes(file.size)}
                  </p>
                </div>
                <button
                  className="upload-zone__change"
                  onClick={(e) => { e.stopPropagation(); fileRef.current?.click(); }}
                  type="button"
                >
                  Cambiar
                </button>
              </div>
            ) : (
              <div className="upload-zone__empty">
                <svg width="40" height="40" viewBox="0 0 40 40" fill="none">
                  <rect width="40" height="40" rx="10" fill="#f1f5f9" />
                  <path d="M20 12v16M12 20h16" stroke="#94a3b8" strokeWidth="2" strokeLinecap="round" />
                </svg>
                <p className="upload-zone__empty-title">Selecciona un archivo PDF</p>
                <p className="upload-zone__empty-desc">Arrastra aquí o haz clic para explorar</p>
              </div>
            )}
          </div>
          <input ref={fileRef} type="file" accept=".pdf,application/pdf" onChange={handleFile} style={{ display: 'none' }} />

          {/* Comment field */}
          <div className="modal__field">
            <label className="modal__label">Comentario (opcional)</label>
            <textarea
              className="modal__textarea"
              placeholder="Ej: Entrega correspondiente a la primera versión del proyecto..."
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              rows={3}
            />
          </div>
        </div>

        <div className="modal__footer">
          <button className="eval-btn eval-btn--outline" onClick={onCancel}>Cancelar</button>
          <button
            className="eval-btn eval-btn--primary"
            onClick={() => file && onConfirm(file, comment)}
            disabled={!canConfirm}
          >
            {mode === 'edit' ? 'Guardar cambios' : 'Confirmar entrega'}
          </button>
        </div>
      </div>
    </div>
  );
}
