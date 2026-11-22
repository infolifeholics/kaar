import {
  collection,
  doc,
  getDocs,
  setDoc,
  updateDoc,
  query,
  where,
  orderBy,
} from 'firebase/firestore';
import { db } from '../firebase';
import { Order } from '../types';
import { syncOrderToGoogleSheets } from './googleSheetsService';
import { sendOrderConfirmationEmail, sendAdminNewOrderEmail, sendOrderStatusUpdateEmail } from './emailService';

const ORDERS_COLLECTION = 'orders';
const LOCAL_ORDERS_KEY = 'kaar-demo-orders';

export function getLocalOrders(): Order[] {
  try {
    const saved = localStorage.getItem(LOCAL_ORDERS_KEY);
    return saved ? JSON.parse(saved) : [];
  } catch {
    return [];
  }
}

export function saveLocalOrders(orders: Order[]) {
  try {
    localStorage.setItem(LOCAL_ORDERS_KEY, JSON.stringify(orders));
  } catch {
    // ignore
  }
}

// Place a new order into Firestore, Google Sheets, and trigger email alerts
export async function createOrder(orderData: Omit<Order, 'id' | 'createdAt'>): Promise<Order> {
  const id = `KAAR-${Date.now().toString().slice(-8)}`;
  const now = new Date().toISOString();

  const newOrder: Order = {
    ...orderData,
    id,
    createdAt: now,
    updatedAt: now,
  };

  try {
    const orderDoc = doc(db, ORDERS_COLLECTION, id);
    await setDoc(orderDoc, newOrder);
  } catch (err) {
    console.warn('Could not write order to Firestore, writing to local storage:', err);
  }

  const current = getLocalOrders();
  const nextOrders = [newOrder, ...current.filter((o) => o.id !== id)];
  saveLocalOrders(nextOrders);

  // Synchronize order to Google Sheets
  syncOrderToGoogleSheets(newOrder).catch((e) => console.warn('Google Sheets sync notice:', e));

  // Send customer and admin notification emails
  sendOrderConfirmationEmail(newOrder).catch((e) => console.warn('Customer email notice:', e));
  sendAdminNewOrderEmail(newOrder).catch((e) => console.warn('Admin email notice:', e));

  return newOrder;
}

// Find customer orders by contact (email or phone)
export async function findOrdersByContact(contact: string): Promise<Order[]> {
  const cleanContact = contact.trim().toLowerCase();
  if (!cleanContact) return [];

  // Try Firestore query first
  try {
    const ordersRef = collection(db, ORDERS_COLLECTION);
    const q = query(ordersRef, where('contact', '==', cleanContact));
    const snapshot = await getDocs(q);
    if (!snapshot.empty) {
      const list: Order[] = [];
      snapshot.forEach((d) => list.push({ id: d.id, ...(d.data() as Omit<Order, 'id'>) }));
      return list;
    }
  } catch (err) {
    console.warn('Firestore order lookup fallback to local:', err);
  }

  // Fallback to local storage
  const localOrders = getLocalOrders();
  return localOrders.filter(
    (o) =>
      o.contact.trim().toLowerCase() === cleanContact ||
      (o.email && o.email.trim().toLowerCase() === cleanContact) ||
      (o.phone && o.phone.replace(/\D/g, '') === cleanContact.replace(/\D/g, ''))
  );
}

// Admin function: Get all orders across the system
export async function getAllOrders(): Promise<Order[]> {
  try {
    const ordersRef = collection(db, ORDERS_COLLECTION);
    const q = query(ordersRef, orderBy('createdAt', 'desc'));
    const snapshot = await getDocs(q);
    if (!snapshot.empty) {
      const list: Order[] = [];
      snapshot.forEach((d) => list.push({ id: d.id, ...(d.data() as Omit<Order, 'id'>) }));
      return list;
    }
  } catch (err: unknown) {
    const error = err as { code?: string };
    if (error?.code !== 'permission-denied') {
      console.warn('Firestore getAllOrders error, returning local:', err);
    }
  }
  return getLocalOrders();
}

// Update order status (for admin)
export async function updateOrderStatus(
  orderId: string,
  updates: Partial<Pick<Order, 'orderStatus' | 'paymentStatus' | 'trackingNumber' | 'shippingCarrier' | 'notes'>>
): Promise<void> {
  const now = new Date().toISOString();
  try {
    const orderDoc = doc(db, ORDERS_COLLECTION, orderId);
    await updateDoc(orderDoc, { ...updates, updatedAt: now });
  } catch (err) {
    console.warn('Firestore updateOrderStatus fallback to local:', err);
  }

  const current = getLocalOrders();
  const nextOrders = current.map((ord) => (ord.id === orderId ? { ...ord, ...updates, updatedAt: now } : ord));
  saveLocalOrders(nextOrders);

  // Notify customer of order status progression
  const targetOrder = nextOrders.find((o) => o.id === orderId);
  if (targetOrder && updates.orderStatus) {
    sendOrderStatusUpdateEmail(targetOrder, updates.orderStatus).catch((e) =>
      console.warn('Status update email notice:', e)
    );
    syncOrderToGoogleSheets(targetOrder).catch((e) =>
      console.warn('Google Sheets update sync notice:', e)
    );
  }
}
