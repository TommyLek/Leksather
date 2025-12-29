import { useState, useCallback } from 'react';
import { storageService } from '../services/storageService';
import { useAuth } from '../AuthContext';

export function usePhotos() {
  const [photos, setPhotos] = useState([]);
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState(null);
  const { user, isAuthenticated } = useAuth();

  // Hämta alla bilder
  const fetchPhotos = useCallback(async () => {
    if (!isAuthenticated) {
      setError('Du måste vara inloggad');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const photosList = await storageService.listPhotos();
      setPhotos(photosList);
    } catch (err) {
      console.error('Failed to fetch photos:', err);
      setError('Kunde inte hämta bilder: ' + err.message);
    } finally {
      setLoading(false);
    }
  }, [isAuthenticated]);

  // Ladda upp en bild
  const uploadPhoto = useCallback(async (file) => {
    if (!isAuthenticated || !user) {
      throw new Error('Du måste vara inloggad');
    }

    setUploading(true);
    setError(null);

    try {
      const newPhoto = await storageService.uploadPhoto(
        file,
        user.uid,
        user.displayName || 'Okänd'
      );

      // Lägg till den nya bilden först i listan
      setPhotos(prev => [newPhoto, ...prev]);

      return newPhoto;
    } catch (err) {
      console.error('Failed to upload photo:', err);
      setError('Kunde inte ladda upp: ' + err.message);
      throw err;
    } finally {
      setUploading(false);
    }
  }, [isAuthenticated, user]);

  // Ta bort en bild
  const deletePhoto = useCallback(async (photoId, storagePath) => {
    if (!isAuthenticated) {
      throw new Error('Du måste vara inloggad');
    }

    try {
      await storageService.deletePhoto(photoId, storagePath);
      setPhotos(prev => prev.filter(p => p.id !== photoId));
    } catch (err) {
      console.error('Failed to delete photo:', err);
      setError('Kunde inte ta bort: ' + err.message);
      throw err;
    }
  }, [isAuthenticated]);

  return {
    photos,
    loading,
    uploading,
    error,
    isReady: isAuthenticated,
    fetchPhotos,
    uploadPhoto,
    deletePhoto,
  };
}
