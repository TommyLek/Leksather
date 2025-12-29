import { ref, uploadBytes, getDownloadURL, listAll, deleteObject } from 'firebase/storage';
import { collection, addDoc, getDocs, deleteDoc, doc, query, orderBy } from 'firebase/firestore';
import { storage, db } from '../firebase';

const PHOTOS_FOLDER = 'family-photos';
const PHOTOS_COLLECTION = 'photos';

export const storageService = {
  // Ladda upp en bild
  async uploadPhoto(file, userId, userName) {
    // Skapa unikt filnamn
    const timestamp = Date.now();
    const fileName = `${timestamp}_${file.name}`;
    const storageRef = ref(storage, `${PHOTOS_FOLDER}/${fileName}`);

    // Ladda upp till Storage
    const snapshot = await uploadBytes(storageRef, file);
    const downloadURL = await getDownloadURL(snapshot.ref);

    // Spara metadata i Firestore
    const photoData = {
      fileName: file.name,
      storagePath: `${PHOTOS_FOLDER}/${fileName}`,
      url: downloadURL,
      contentType: file.type,
      size: file.size,
      uploadedBy: userId,
      uploadedByName: userName,
      createdAt: new Date().toISOString(),
    };

    const docRef = await addDoc(collection(db, PHOTOS_COLLECTION), photoData);

    return {
      id: docRef.id,
      ...photoData,
    };
  },

  // Hämta alla bilder
  async listPhotos() {
    const photosQuery = query(
      collection(db, PHOTOS_COLLECTION),
      orderBy('createdAt', 'desc')
    );

    const snapshot = await getDocs(photosQuery);
    const photos = [];

    snapshot.forEach((doc) => {
      photos.push({
        id: doc.id,
        ...doc.data(),
      });
    });

    return photos;
  },

  // Ta bort en bild
  async deletePhoto(photoId, storagePath) {
    // Ta bort från Storage
    const storageRef = ref(storage, storagePath);
    await deleteObject(storageRef);

    // Ta bort från Firestore
    await deleteDoc(doc(db, PHOTOS_COLLECTION, photoId));
  },
};
