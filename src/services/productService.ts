import {
  collection,
  doc,
  getDocs,
  getDoc,
  setDoc,
  deleteDoc,
  query,
  orderBy,
  onSnapshot,
} from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { db, storage } from '../firebase';
import { Product } from '../types';
import { INITIAL_PRODUCTS } from '../data/initialProducts';

const PRODUCTS_COLLECTION = 'products';
const LOCAL_STORAGE_KEY = 'kaar-synced-products';

// Helper to read local products cache fallback
export function getLocalProducts(): Product[] {
  try {
    const raw = localStorage.getItem(LOCAL_STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed) && parsed.length > 0) return parsed;
    }
  } catch {
    // ignore
  }
  return INITIAL_PRODUCTS;
}

export function saveLocalProducts(products: Product[]) {
  try {
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(products));
  } catch {
    // ignore
  }
}

// Subscribe to products real-time from Firestore, falling back seamlessly
export function subscribeToProducts(callback: (products: Product[]) => void): () => void {
  try {
    const q = query(collection(db, PRODUCTS_COLLECTION), orderBy('createdAt', 'desc'));
    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        if (!snapshot.empty) {
          const list: Product[] = [];
          snapshot.forEach((docSnap) => {
            list.push({ id: docSnap.id, ...(docSnap.data() as Omit<Product, 'id'>) });
          });
          saveLocalProducts(list);
          callback(list);
        } else {
          // If collection is empty, trigger seed and return fallback
          seedInitialProductsIfEmpty().then((seeded) => {
            callback(seeded);
          });
        }
      },
      (error) => {
        console.warn('Firestore products subscription error (using fallback):', error.message);
        callback(getLocalProducts());
      }
    );
    return unsubscribe;
  } catch (error) {
    console.warn('Failed to start Firestore listener:', error);
    callback(getLocalProducts());
    return () => {};
  }
}

// Seed initial products if collection is completely empty
export async function seedInitialProductsIfEmpty(): Promise<Product[]> {
  try {
    const colRef = collection(db, PRODUCTS_COLLECTION);
    const existing = await getDocs(colRef);
    if (existing.empty) {
      for (const prod of INITIAL_PRODUCTS) {
        const docRef = doc(colRef, String(prod.id));
        await setDoc(docRef, prod);
      }
      saveLocalProducts(INITIAL_PRODUCTS);
      return INITIAL_PRODUCTS;
    }
    const list: Product[] = [];
    existing.forEach((d) => list.push({ id: d.id, ...(d.data() as Omit<Product, 'id'>) }));
    saveLocalProducts(list);
    return list;
  } catch (e) {
    console.warn('Seeding skipped or Firestore offline:', e);
    return getLocalProducts();
  }
}

// Get single product by id or slug
export async function getProductById(idOrSlug: string | number): Promise<Product | null> {
  const localList = getLocalProducts();
  const foundLocal = localList.find(
    (p) => String(p.id) === String(idOrSlug) || (p.slug && p.slug === String(idOrSlug))
  );

  try {
    const docRef = doc(db, PRODUCTS_COLLECTION, String(idOrSlug));
    const snap = await getDoc(docRef);
    if (snap.exists()) {
      return { id: snap.id, ...(snap.data() as Omit<Product, 'id'>) };
    }
  } catch {
    // ignore
  }

  return foundLocal || null;
}

// Save or Create Product
export async function saveProduct(product: Partial<Product> & { name: string }): Promise<Product> {
  const id = product.id ? String(product.id) : `KAAR-PRD-${Date.now()}`;
  const slug =
    product.slug ||
    product.name
      .toLowerCase()
      .replace(/[^\w\s-]/g, '')
      .replace(/\s+/g, '-');

  const now = new Date().toISOString();
  const fullProduct: Product = {
    id,
    name: product.name,
    slug,
    category: product.category || 'Daily Rituals',
    subcategory: product.subcategory || '',
    price: Number(product.price) || 0,
    compareAt: product.compareAt ? Number(product.compareAt) : undefined,
    shortDescription: product.shortDescription || '',
    description: product.description || '',
    note: product.note || 'Mindful · Natural · Balanced',
    accent: product.accent || 'sage',
    label: product.label || '',
    bestseller: Boolean(product.bestseller),
    newArrival: Boolean(product.newArrival),
    stockQuantity: Number(product.stockQuantity) || 0,
    stockStatus: product.stockStatus || 'in_stock',
    sku: product.sku || `SKU-${Date.now().toString().slice(-6)}`,
    status: product.status || 'published',
    isFeatured: Boolean(product.isFeatured),
    images: product.images || [],
    thumbnail: product.thumbnail || (product.images && product.images[0]) || '',
    features: product.features || [],
    specifications: product.specifications || {},
    seoTitle: product.seoTitle || `${product.name} | Kaar Ayurveda`,
    seoDescription: product.seoDescription || product.description?.slice(0, 155) || '',
    createdAt: product.createdAt || now,
    updatedAt: now,
  };

  // Sync to Firestore
  try {
    const docRef = doc(db, PRODUCTS_COLLECTION, id);
    await setDoc(docRef, fullProduct, { merge: true });
  } catch (err) {
    console.warn('Could not save to Firestore, updating local cache:', err);
  }

  // Update local storage
  const current = getLocalProducts();
  const idx = current.findIndex((p) => String(p.id) === id);
  let updatedList: Product[];
  if (idx >= 0) {
    updatedList = [...current];
    updatedList[idx] = fullProduct;
  } else {
    updatedList = [fullProduct, ...current];
  }
  saveLocalProducts(updatedList);

  return fullProduct;
}

// Delete Product
export async function deleteProduct(productId: string | number): Promise<boolean> {
  const id = String(productId);
  try {
    const docRef = doc(db, PRODUCTS_COLLECTION, id);
    await deleteDoc(docRef);
  } catch (err) {
    console.warn('Could not delete from Firestore, deleting from local cache:', err);
  }

  const current = getLocalProducts().filter((p) => String(p.id) !== id);
  saveLocalProducts(current);
  return true;
}

// Upload Product Image to Firebase Storage (with base64 fallback)
export async function uploadProductImage(file: File): Promise<string> {
  try {
    const fileExt = file.name.split('.').pop() || 'jpg';
    const fileName = `products/${Date.now()}_${Math.random().toString(36).substring(2, 8)}.${fileExt}`;
    const storageRef = ref(storage, fileName);

    const snapshot = await uploadBytes(storageRef, file);
    const downloadUrl = await getDownloadURL(snapshot.ref);
    return downloadUrl;
  } catch (err) {
    console.warn('Firebase Storage upload failed, converting to permanent data URL:', err);
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = (e) => reject(e);
      reader.readAsDataURL(file);
    });
  }
}
