import { initializeApp, getApps, getApp } from 'firebase/app';
import {
  getFirestore,
  collection,
  addDoc,
  onSnapshot,
  query,
  orderBy,
  serverTimestamp,
  deleteDoc,
  doc
} from 'firebase/firestore';
import firebaseConfigJson from '../../firebase-applet-config.json';
import { Listing, NewListingFormData } from '../types';

const firebaseConfig = {
  apiKey: firebaseConfigJson.apiKey,
  authDomain: firebaseConfigJson.authDomain,
  projectId: firebaseConfigJson.projectId,
  storageBucket: firebaseConfigJson.storageBucket,
  messagingSenderId: firebaseConfigJson.messagingSenderId,
  appId: firebaseConfigJson.appId,
};

// Initialize Firebase App
const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();

// Target provisioned custom firestore database ID or default
const databaseId = firebaseConfigJson.firestoreDatabaseId || '(default)';
export const db = getFirestore(app, databaseId);

// Collection Reference
export const LISTINGS_COLLECTION = 'listings';

/**
 * Client-side image compression to Base64 string.
 * Resizes photos to max 600x600 px at 0.7 JPEG quality to keep
 * document payload under ~50KB-100KB, well below Firestore's 1MB limit.
 */
export function compressImageToBase64(
  file: File,
  maxWidth = 600,
  maxHeight = 600,
  quality = 0.7
): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (event) => {
      const img = new Image();
      img.onload = () => {
        let width = img.width;
        let height = img.height;

        if (width > height) {
          if (width > maxWidth) {
            height = Math.round((height * maxWidth) / width);
            width = maxWidth;
          }
        } else {
          if (height > maxHeight) {
            width = Math.round((width * maxHeight) / height);
            height = maxHeight;
          }
        }

        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;

        const ctx = canvas.getContext('2d');
        if (!ctx) {
          reject(new Error('Canvas 2D context unavailable'));
          return;
        }

        ctx.drawImage(img, 0, 0, width, height);
        const base64DataUrl = canvas.toDataURL('image/jpeg', quality);
        resolve(base64DataUrl);
      };
      img.onerror = (err) => reject(new Error('Failed to load image for compression'));
      img.src = event.target?.result as string;
    };
    reader.onerror = (err) => reject(new Error('Failed to read file'));
    reader.readAsDataURL(file);
  });
}

/**
 * Subscribe to listings collection ordered by createdAt descending in real time.
 */
export function subscribeToListings(
  onUpdate: (listings: Listing[]) => void,
  onError: (err: Error) => void
) {
  const colRef = collection(db, LISTINGS_COLLECTION);
  const q = query(colRef, orderBy('createdAt', 'desc'));

  return onSnapshot(
    q,
    (snapshot) => {
      const listings: Listing[] = snapshot.docs.map((docSnap) => {
        const data = docSnap.data();
        return {
          id: docSnap.id,
          name: data.name || 'Untitled Listing',
          category: data.category || 'Other',
          price: Number(data.price) || 0,
          condition: data.condition || 'Good',
          description: data.description || '',
          imageBase64: data.imageBase64 || '',
          createdAt: data.createdAt,
          sellerId: data.sellerId || 'Anonymous',
        };
      });
      onUpdate(listings);
    },
    (error) => {
      console.warn('Firestore onSnapshot query error, falling back to unordered client stream:', error);
      // Fallback query if index is building or missing
      onSnapshot(
        colRef,
        (fallbackSnap) => {
          const listings: Listing[] = fallbackSnap.docs.map((docSnap) => {
            const data = docSnap.data();
            return {
              id: docSnap.id,
              name: data.name || 'Untitled Listing',
              category: data.category || 'Other',
              price: Number(data.price) || 0,
              condition: data.condition || 'Good',
              description: data.description || '',
              imageBase64: data.imageBase64 || '',
              createdAt: data.createdAt,
              sellerId: data.sellerId || 'Anonymous',
            };
          });
          // Sort client-side
          listings.sort((a, b) => {
            const timeA = a.createdAt?.toMillis ? a.createdAt.toMillis() : (a.createdAt || 0);
            const timeB = b.createdAt?.toMillis ? b.createdAt.toMillis() : (b.createdAt || 0);
            return timeB - timeA;
          });
          onUpdate(listings);
        },
        (fallbackErr) => onError(fallbackErr)
      );
    }
  );
}

/**
 * Create a new document in Firestore.
 */
export async function createListingDoc(formData: NewListingFormData): Promise<string> {
  const colRef = collection(db, LISTINGS_COLLECTION);
  const docRef = await addDoc(colRef, {
    name: formData.name.trim(),
    category: formData.category,
    price: Number(formData.price) || 0,
    condition: formData.condition,
    description: formData.description.trim(),
    imageBase64: formData.imageBase64,
    createdAt: serverTimestamp(),
    sellerId: formData.sellerId || 'seller_' + Math.random().toString(36).substring(2, 8),
  });
  return docRef.id;
}

/**
 * Delete a listing document from Firestore.
 */
export async function deleteListingDoc(id: string): Promise<void> {
  const docRef = doc(db, LISTINGS_COLLECTION, id);
  await deleteDoc(docRef);
}
