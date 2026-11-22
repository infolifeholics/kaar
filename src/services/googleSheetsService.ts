import { GoogleSheetsCartPayload, GoogleSheetsOrderPayload, CartItem, Order } from '../types';
import { collection, doc, setDoc } from 'firebase/firestore';
import { db } from '../firebase';

export const SPREADSHEET_ID =
  import.meta.env.VITE_GOOGLE_SHEETS_SPREADSHEET_ID ||
  '1couKMsGuunmNDY89HJfCXgRljxytHOqMgqDF0rGYh8k';

export const SPREADSHEET_URL = `https://docs.google.com/spreadsheets/d/${SPREADSHEET_ID}/edit`;

// Webhook / Apps Script Web App URL if configured in .env
export const GOOGLE_APPS_SCRIPT_URL =
  import.meta.env.VITE_GOOGLE_SHEETS_WEBHOOK_URL || '';

export const CART_TAB = 'Cart';
export const ORDERS_TAB = 'Orders';

// Synchronize customer cart items directly to Google Sheets
export async function syncCartToGoogleSheets(
  cart: CartItem[],
  customerInfo?: { userId?: string; name?: string; email?: string }
): Promise<void> {
  if (!cart) return;

  const userId =
    customerInfo?.userId ||
    localStorage.getItem('kaar-user-id') ||
    `guest_${Date.now().toString().slice(-6)}`;
  localStorage.setItem('kaar-user-id', userId);

  const customerName =
    customerInfo?.name || localStorage.getItem('kaar-customer-name') || 'LifeHolics Guest';
  const email =
    customerInfo?.email || localStorage.getItem('kaar-customer-email') || 'info.lifeholics@gmail.com';
  const location = 'India';
  const now = new Date().toLocaleString('en-GB');

  const cartTotal = cart.reduce((sum, item) => sum + item.product.price * item.quantity, 0);

  const payloads: GoogleSheetsCartPayload[] = cart.map((item) => ({
    userId,
    customerName,
    email,
    productId: item.product.id,
    productName: item.product.name,
    quantity: item.quantity,
    unitPrice: item.product.price,
    currency: 'INR',
    cartTotal,
    addedAt: now,
    updatedAt: now,
    location,
  }));

  // 1. Post to Google Apps Script Web App if URL is provided
  if (GOOGLE_APPS_SCRIPT_URL) {
    try {
      await fetch(GOOGLE_APPS_SCRIPT_URL, {
        method: 'POST',
        mode: 'no-cors',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'cart_update',
          spreadsheetId: SPREADSHEET_ID,
          tab: CART_TAB,
          data: payloads,
        }),
      });
      console.info(`[Google Sheets API] Dispatched cart updates directly to ${SPREADSHEET_ID} (Cart)`);
    } catch (error) {
      console.warn('Direct Apps Script webhook notice:', error);
    }
  }

  // 2. Store synchronization snapshot in Firestore
  try {
    const syncDoc = doc(db, 'sheetsSyncLog', `cart_${userId}`);
    await setDoc(
      syncDoc,
      {
        spreadsheetId: SPREADSHEET_ID,
        spreadsheetUrl: SPREADSHEET_URL,
        tab: CART_TAB,
        userId,
        items: payloads,
        syncedAt: new Date().toISOString(),
        status: 'synced',
      },
      { merge: true }
    );
  } catch (err: unknown) {
    const error = err as { code?: string };
    if (error?.code !== 'permission-denied') {
      console.warn('Firestore sheetsSyncLog notice:', err);
    }
  }

  // 3. Backup in local storage
  try {
    const existingSyncLogs = JSON.parse(localStorage.getItem('kaar-sheets-cart-sync') || '[]');
    localStorage.setItem(
      'kaar-sheets-cart-sync',
      JSON.stringify([{ timestamp: now, payloads }, ...existingSyncLogs.slice(0, 40)])
    );
  } catch {
    // ignore
  }

  console.info(`[Google Sheets CRM Sync] Synced ${cart.length} item(s) to Sheet: ${SPREADSHEET_ID} (Tab: ${CART_TAB})`);
}

// Synchronize confirmed order directly to Google Sheets 'Orders' tab
export async function syncOrderToGoogleSheets(order: Order): Promise<void> {
  const now = new Date(order.createdAt).toLocaleString('en-GB');

  const productIds = order.items.map((i) => ('product' in i ? i.product.id : i.productId)).join('; ');
  const productNames = order.items.map((i) => ('product' in i ? i.product.name : i.name)).join('; ');
  const quantities = order.items.map((i) => i.quantity).join('; ');

  const payload: GoogleSheetsOrderPayload = {
    orderId: order.id,
    userId: order.userId || localStorage.getItem('kaar-user-id') || 'guest',
    customerName: order.customerName,
    email: order.email || order.contact,
    phone: order.phone || order.contact,
    productIds,
    productNames,
    quantities,
    subtotal: order.subtotal,
    shipping: order.shipping,
    total: order.total,
    currency: order.currency || 'INR',
    paymentStatus: order.paymentStatus.toUpperCase(),
    orderStatus: order.orderStatus.toUpperCase(),
    razorpayOrderId: order.razorpayOrderId || '',
    razorpayPaymentId: order.razorpayPaymentId || '',
    orderDate: now,
    address: order.address,
  };

  // 1. Post to Google Apps Script Web App if URL is provided
  if (GOOGLE_APPS_SCRIPT_URL) {
    try {
      await fetch(GOOGLE_APPS_SCRIPT_URL, {
        method: 'POST',
        mode: 'no-cors',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'order_create',
          spreadsheetId: SPREADSHEET_ID,
          tab: ORDERS_TAB,
          data: payload,
        }),
      });
      console.info(`[Google Sheets API] Dispatched order ${order.id} directly to ${SPREADSHEET_ID} (Orders)`);
    } catch (error) {
      console.warn('Direct Apps Script webhook notice:', error);
    }
  }

  // 2. Record in Firestore sheets sync log
  try {
    const syncDoc = doc(collection(db, 'sheetsSyncLog'), `order_${order.id}`);
    await setDoc(syncDoc, {
      spreadsheetId: SPREADSHEET_ID,
      spreadsheetUrl: SPREADSHEET_URL,
      tab: ORDERS_TAB,
      orderId: order.id,
      payload,
      syncedAt: new Date().toISOString(),
      status: 'synced',
    });
  } catch (err) {
    console.warn('Firestore order sync log notice:', err);
  }

  // 3. Record in local cache
  try {
    const existingOrdersSync = JSON.parse(localStorage.getItem('kaar-sheets-orders-sync') || '[]');
    localStorage.setItem(
      'kaar-sheets-orders-sync',
      JSON.stringify([payload, ...existingOrdersSync])
    );
  } catch {
    // ignore
  }

  console.info(`[Google Sheets Orders Tab Sync] Logged order ${order.id} to Sheet: ${SPREADSHEET_ID} (Tab: ${ORDERS_TAB})`);
}
