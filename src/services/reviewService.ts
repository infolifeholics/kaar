import {
  collection,
  doc,
  getDocs,
  setDoc,
  deleteDoc,
  updateDoc,
  query,
  orderBy,
  onSnapshot,
} from 'firebase/firestore';
import { db } from '../firebase';
import { Review } from '../types';

export const REVIEWS_COLLECTION = 'reviews';
const LOCAL_STORAGE_KEY = 'kaar-reviews-cache';

export const INITIAL_APPROVED_REVIEWS: Review[] = [
  {
    id: 'rev-init-1',
    userName: 'Aanya Sharma',
    productName: 'Nourish Abhyanga Oil',
    review: 'It has become my favourite part of the evening — a small, grounding reminder to slow down and reconnect with my body.',
    rating: 5,
    status: 'approved',
    createdAt: '2026-10-15T10:00:00.000Z',
  },
  {
    id: 'rev-init-2',
    userName: 'Vikramaditya Roy',
    productName: 'Soma Sleep Elixir',
    review: 'Within 20 minutes of taking this elixir, my racing thoughts settle down completely. Deeper, uninterrupted sleep naturally.',
    rating: 5,
    status: 'approved',
    createdAt: '2026-10-20T14:30:00.000Z',
  },
  {
    id: 'rev-init-3',
    userName: 'Meera Nambiar',
    productName: 'Prana Breath Mist',
    review: 'The sacred holy basil and sandalwood aroma instantly clears my head between busy work meetings. Pure botanical luxury.',
    rating: 5,
    status: 'approved',
    createdAt: '2026-11-01T09:15:00.000Z',
  },
  {
    id: 'rev-init-4',
    userName: 'Dr. Priya Singhania',
    productName: 'Chandra Face Masque',
    review: 'Authentic Ayurvedic formulation without any artificial fragrance or fillers. My skin feels deeply purified and velvety soft.',
    rating: 5,
    status: 'approved',
    createdAt: '2026-11-05T16:20:00.000Z',
  },
  {
    id: 'rev-init-5',
    userName: 'Rohan Mehra',
    productName: 'Agni Digestive Chai',
    review: 'Light, soothing, and so gentle on the stomach after heavy dinners. You can genuinely taste the freshness of the wild-harvested herbs.',
    rating: 5,
    status: 'approved',
    createdAt: '2026-11-12T11:45:00.000Z',
  },
  {
    id: 'rev-init-6',
    userName: 'Kavita Chawla',
    productName: 'Dhyana Incense Cones',
    review: 'The subtle sacred smoke completely cleanses negative energy in my living space. Very soothing and long lasting aroma.',
    rating: 5,
    status: 'approved',
    createdAt: '2026-11-18T18:10:00.000Z',
  },
];

// Helper to get cached reviews
export function getLocalReviews(): Review[] {
  try {
    const raw = localStorage.getItem(LOCAL_STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed) && parsed.length > 0) return parsed;
    }
  } catch {
    // fallback
  }
  return INITIAL_APPROVED_REVIEWS;
}

// Helper to save to local cache
export function saveLocalReviews(reviews: Review[]): void {
  try {
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(reviews));
  } catch {
    // ignore
  }
}

// Seed initial demo reviews to Firestore if collection is empty
export async function seedDemoReviewsIfEmpty(): Promise<Review[]> {
  try {
    const colRef = collection(db, REVIEWS_COLLECTION);
    const existing = await getDocs(colRef);
    if (existing.empty) {
      for (const rev of INITIAL_APPROVED_REVIEWS) {
        const docRef = doc(colRef, rev.id);
        await setDoc(docRef, rev);
      }
      saveLocalReviews(INITIAL_APPROVED_REVIEWS);
      return INITIAL_APPROVED_REVIEWS;
    }
  } catch (err) {
    console.warn('Review seeding notice:', err);
  }
  return getLocalReviews();
}

// Subscribe to approved reviews for public testimonials display
export function subscribeToApprovedReviews(callback: (reviews: Review[]) => void): () => void {
  try {
    const colRef = collection(db, REVIEWS_COLLECTION);
    const q = query(colRef, orderBy('createdAt', 'desc'));

    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        if (!snapshot.empty) {
          const list: Review[] = [];
          snapshot.forEach((docSnap) => {
            const data = docSnap.data() as Omit<Review, 'id'>;
            list.push({ id: docSnap.id, ...data });
          });
          const allReviews = list;
          saveLocalReviews(allReviews);
          // Return only approved reviews
          const approved = allReviews.filter((r) => r.status === 'approved');
          callback(approved.length > 0 ? approved : INITIAL_APPROVED_REVIEWS);
        } else {
          // If empty, trigger seed in background
          seedDemoReviewsIfEmpty();
          callback(getLocalReviews().filter((r) => r.status === 'approved'));
        }
      },
      (error) => {
        if (error.code !== 'permission-denied') {
          console.warn('Reviews subscription warning:', error.message);
        }
        callback(getLocalReviews().filter((r) => r.status === 'approved'));
      }
    );
    return unsubscribe;
  } catch {
    callback(getLocalReviews().filter((r) => r.status === 'approved'));
    return () => {};
  }
}

// Fetch all reviews for admin panel (pending, approved, rejected)
export async function getAllReviews(): Promise<Review[]> {
  try {
    const colRef = collection(db, REVIEWS_COLLECTION);
    const q = query(colRef, orderBy('createdAt', 'desc'));
    const snapshot = await getDocs(q);
    if (!snapshot.empty) {
      const list: Review[] = [];
      snapshot.forEach((d) => list.push({ id: d.id, ...(d.data() as Omit<Review, 'id'>) }));
      saveLocalReviews(list);
      return list;
    } else {
      // If Firestore has no documents, seed and return demo reviews
      await seedDemoReviewsIfEmpty();
    }
  } catch (err: unknown) {
    const error = err as { code?: string };
    if (error?.code !== 'permission-denied') {
      console.warn('getAllReviews error:', err);
    }
  }
  return getLocalReviews();
}

// Public user submit a new review (enters 'pending' status for admin approval)
export async function submitProductReview(data: {
  userName: string;
  review: string;
  productId?: string | number;
  productName?: string;
  rating?: number;
}): Promise<Review> {
  const newReview: Review = {
    id: `rev_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
    userName: data.userName.trim(),
    review: data.review.trim(),
    productId: data.productId || '',
    productName: data.productName || 'General Ritual Experience',
    rating: data.rating || 5,
    status: 'pending',
    createdAt: new Date().toISOString(),
  };

  // 1. Save in Firestore
  try {
    const docRef = doc(db, REVIEWS_COLLECTION, newReview.id);
    await setDoc(docRef, newReview);
  } catch (err) {
    console.warn('Firestore submit review fallback to local:', err);
  }

  // 2. Save in local cache
  const localList = getLocalReviews();
  const nextList = [newReview, ...localList.filter((r) => r.id !== newReview.id)];
  saveLocalReviews(nextList);

  return newReview;
}

// Admin approves review -> becomes visible in community testimonials
export async function approveReview(reviewId: string): Promise<void> {
  const now = new Date().toISOString();
  try {
    const docRef = doc(db, REVIEWS_COLLECTION, reviewId);
    await updateDoc(docRef, { status: 'approved', updatedAt: now });
  } catch (err) {
    console.warn('Firestore approveReview fallback:', err);
  }

  const list = getLocalReviews();
  const updated = list.map((r) => (r.id === reviewId ? { ...r, status: 'approved' as const, updatedAt: now } : r));
  saveLocalReviews(updated);
}

// Admin rejects review -> deletes it immediately as requested ("jaise h reject krega to delte jo jeyega")
export async function rejectOrDeleteReview(reviewId: string): Promise<void> {
  try {
    const docRef = doc(db, REVIEWS_COLLECTION, reviewId);
    await deleteDoc(docRef);
  } catch (err) {
    console.warn('Firestore deleteReview fallback:', err);
  }

  const list = getLocalReviews();
  const filtered = list.filter((r) => r.id !== reviewId);
  saveLocalReviews(filtered);
}
