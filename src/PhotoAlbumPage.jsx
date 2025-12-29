import { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { usePhotos } from './hooks/usePhotos';
import { useAuth } from './AuthContext';

export default function PhotoAlbumPage() {
  const { user } = useAuth();
  const {
    photos,
    loading,
    uploading,
    error,
    isReady,
    fetchPhotos,
    uploadPhoto,
    deletePhoto,
  } = usePhotos();

  const [selectedPhoto, setSelectedPhoto] = useState(null);
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [dragActive, setDragActive] = useState(false);
  const fileInputRef = useRef(null);

  // Hämta bilder vid start
  useEffect(() => {
    if (isReady) {
      fetchPhotos();
    }
  }, [isReady, fetchPhotos]);

  // Hantera filuppladdning
  const handleFileSelect = async (files) => {
    if (!files || files.length === 0) return;

    for (const file of files) {
      if (!file.type.startsWith('image/') && !file.type.startsWith('video/')) {
        alert(`${file.name} är inte en bild eller video`);
        continue;
      }

      try {
        await uploadPhoto(file);
      } catch (err) {
        alert(`Kunde inte ladda upp ${file.name}: ${err.message}`);
      }
    }

    setShowUploadModal(false);
  };

  // Drag and drop handlers
  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      handleFileSelect(e.dataTransfer.files);
    }
  };

  // Navigera mellan bilder i lightbox
  const navigatePhoto = (direction) => {
    if (!selectedPhoto) return;
    const currentIndex = photos.findIndex(p => p.id === selectedPhoto.id);
    const newIndex = currentIndex + direction;
    if (newIndex >= 0 && newIndex < photos.length) {
      setSelectedPhoto(photos[newIndex]);
    }
  };

  // Ta bort bild
  const handleDelete = async () => {
    if (!selectedPhoto) return;
    if (!confirm('Är du säker på att du vill ta bort denna bild?')) return;

    try {
      await deletePhoto(selectedPhoto.id, selectedPhoto.storagePath);
      setSelectedPhoto(null);
    } catch (err) {
      alert('Kunde inte ta bort bilden: ' + err.message);
    }
  };

  // Tangentbordsnavigering
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (!selectedPhoto) return;
      if (e.key === 'ArrowLeft') navigatePhoto(-1);
      if (e.key === 'ArrowRight') navigatePhoto(1);
      if (e.key === 'Escape') setSelectedPhoto(null);
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [selectedPhoto, photos]);

  // Formatera datum
  const formatDate = (dateString) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleDateString('sv-SE', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  return (
    <div className="photos-container">
      <header className="photos-header">
        <Link to="/" className="back-link">← Tillbaka</Link>
        <h1>Fotoalbum</h1>
        <div className="photos-header-actions">
          <button
            className="upload-btn"
            onClick={() => setShowUploadModal(true)}
            disabled={!isReady || uploading}
          >
            {uploading ? 'Laddar upp...' : '+ Ladda upp'}
          </button>
          {user?.photoURL && <img src={user.photoURL} alt="" className="avatar-small" />}
        </div>
      </header>

      {error && <div className="photos-error">{error}</div>}

      <div className="photos-info">
        <span>{photos.length} bilder</span>
      </div>

      <div className="photos-grid">
        {photos.map((photo) => (
          <div
            key={photo.id}
            className="photo-item"
            onClick={() => setSelectedPhoto(photo)}
          >
            <img
              src={photo.url}
              alt={photo.fileName || 'Bild'}
              loading="lazy"
            />
            {photo.contentType?.startsWith('video/') && (
              <div className="video-indicator">▶</div>
            )}
          </div>
        ))}
      </div>

      {loading && (
        <div className="photos-loading">
          <div className="loading-spinner"></div>
          <p>Laddar bilder...</p>
        </div>
      )}

      {!loading && photos.length === 0 && isReady && (
        <div className="photos-empty">
          <p>Inga bilder i albumet ännu.</p>
          <button onClick={() => setShowUploadModal(true)} className="upload-btn">
            Ladda upp första bilden
          </button>
        </div>
      )}

      {/* Lightbox */}
      {selectedPhoto && (
        <div className="lightbox" onClick={() => setSelectedPhoto(null)}>
          <button
            className="lightbox-close"
            onClick={() => setSelectedPhoto(null)}
          >
            ×
          </button>

          <button
            className="lightbox-nav lightbox-prev"
            onClick={(e) => {
              e.stopPropagation();
              navigatePhoto(-1);
            }}
            disabled={photos.findIndex(p => p.id === selectedPhoto.id) === 0}
          >
            ‹
          </button>

          <div className="lightbox-content" onClick={(e) => e.stopPropagation()}>
            {selectedPhoto.contentType?.startsWith('video/') ? (
              <video
                src={selectedPhoto.url}
                controls
                autoPlay
                className="lightbox-media"
              />
            ) : (
              <img
                src={selectedPhoto.url}
                alt={selectedPhoto.fileName || 'Bild'}
                className="lightbox-media"
              />
            )}
            <div className="lightbox-info">
              <p className="lightbox-date">
                {formatDate(selectedPhoto.createdAt)}
              </p>
              <p className="lightbox-uploader">
                Uppladdad av {selectedPhoto.uploadedByName}
              </p>
              <button onClick={handleDelete} className="btn-delete" style={{ marginTop: '12px' }}>
                Ta bort bild
              </button>
            </div>
          </div>

          <button
            className="lightbox-nav lightbox-next"
            onClick={(e) => {
              e.stopPropagation();
              navigatePhoto(1);
            }}
            disabled={photos.findIndex(p => p.id === selectedPhoto.id) === photos.length - 1}
          >
            ›
          </button>
        </div>
      )}

      {/* Upload Modal */}
      {showUploadModal && (
        <div className="modal-overlay" onClick={() => setShowUploadModal(false)}>
          <div
            className={`upload-modal ${dragActive ? 'drag-active' : ''}`}
            onClick={(e) => e.stopPropagation()}
            onDragEnter={handleDrag}
            onDragLeave={handleDrag}
            onDragOver={handleDrag}
            onDrop={handleDrop}
          >
            <h3>Ladda upp bilder</h3>
            <div className="upload-area">
              <p>Dra och släpp bilder här</p>
              <p>eller</p>
              <button
                onClick={() => fileInputRef.current?.click()}
                className="btn-save"
              >
                Välj filer
              </button>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*,video/*"
                multiple
                onChange={(e) => handleFileSelect(e.target.files)}
                style={{ display: 'none' }}
              />
            </div>
            <button
              onClick={() => setShowUploadModal(false)}
              className="btn-cancel"
              style={{ marginTop: '16px' }}
            >
              Avbryt
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
