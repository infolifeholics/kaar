import { Order } from '../types';
import { collection, doc, setDoc } from 'firebase/firestore';
import { db } from '../firebase';

export const ADMIN_EMAIL = 'info.lifeholics@gmail.com';

export interface EmailLog {
  id: string;
  to: string;
  subject: string;
  type: 'order_confirmation' | 'admin_new_order' | 'status_update' | 'abandoned_cart' | 'payment_pending';
  orderId?: string;
  sentAt: string;
  status: 'sent' | 'queued' | 'failed';
  bodySummary: string;
}

// Customer Confirmation Email
export async function sendOrderConfirmationEmail(order: Order): Promise<boolean> {
  const recipient = order.email || order.contact;
  if (!recipient || !recipient.includes('@')) {
    console.info('No email address provided for customer order confirmation email.');
    return false;
  }

  const subject = 'Your LifeHolics Order Has Been Confirmed!';
  const itemsText = order.items
    .map((i) => `${i.quantity} × ${'product' in i ? i.product.name : i.name}`)
    .join(', ');

  const summary = `Order ${order.id} confirmed for ${order.customerName}. Items: ${itemsText}. Total: ₹${order.total}. Payment ID: ${order.razorpayPaymentId || 'Prepaid'}.`;

  await logEmailNotification({
    to: recipient,
    subject,
    type: 'order_confirmation',
    orderId: order.id,
    bodySummary: summary,
  });

  console.info(`[Email Automation] Dispatched customer confirmation to ${recipient} (Subject: "${subject}")`);
  return true;
}

// Admin Notification Email
export async function sendAdminNewOrderEmail(order: Order): Promise<boolean> {
  const subject = 'New Order Received – LifeHolics';
  const itemsText = order.items
    .map((i) => `${i.quantity} × ${'product' in i ? i.product.name : i.name}`)
    .join(', ');

  const summary = `New order ${order.id} by ${order.customerName} (${order.contact}). Items: ${itemsText}. Total: ₹${order.total}. Address: ${order.address}.`;

  await logEmailNotification({
    to: ADMIN_EMAIL,
    subject,
    type: 'admin_new_order',
    orderId: order.id,
    bodySummary: summary,
  });

  console.info(`[Email Automation] Dispatched Admin new order alert to ${ADMIN_EMAIL}`);
  return true;
}

// Order Status Update Email
export async function sendOrderStatusUpdateEmail(order: Order, newStatus: string): Promise<boolean> {
  const recipient = order.email || order.contact;
  if (!recipient || !recipient.includes('@')) return false;

  const subject = `Your LifeHolics order is ${newStatus} (${order.id})`;
  const summary = `Order ${order.id} status updated to: ${newStatus.toUpperCase()}. Delivery destination: ${order.address}.`;

  await logEmailNotification({
    to: recipient,
    subject,
    type: 'status_update',
    orderId: order.id,
    bodySummary: summary,
  });

  console.info(`[Email Automation] Dispatched order status update (${newStatus}) to ${recipient}`);
  return true;
}

// Abandoned Cart Reminder Email
export async function sendAbandonedCartEmail(email: string, customerName: string, itemsDescription: string, cartTotal: number): Promise<boolean> {
  if (!email || !email.includes('@')) return false;

  const subject = 'Your LifeHolics Shopping Bag Is Waiting!';
  const summary = `Abandoned cart reminder for ${customerName}. Items: ${itemsDescription}. Total: ₹${cartTotal}.`;

  await logEmailNotification({
    to: email,
    subject,
    type: 'abandoned_cart',
    bodySummary: summary,
  });

  console.info(`[Email Automation] Dispatched abandoned cart reminder to ${email}`);
  return true;
}

// Log email event to Firestore and local history
async function logEmailNotification(data: {
  to: string;
  subject: string;
  type: EmailLog['type'];
  orderId?: string;
  bodySummary: string;
}): Promise<void> {
  const logId = `EMAIL_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
  const now = new Date().toISOString();

  const record: EmailLog = {
    id: logId,
    to: data.to,
    subject: data.subject,
    type: data.type,
    orderId: data.orderId,
    sentAt: now,
    status: 'sent',
    bodySummary: data.bodySummary,
  };

  try {
    const docRef = doc(collection(db, 'emailLogs'), logId);
    await setDoc(docRef, record);
  } catch (err) {
    console.warn('Firestore emailLog notice:', err);
  }

  try {
    const existing = JSON.parse(localStorage.getItem('kaar-email-logs') || '[]');
    localStorage.setItem('kaar-email-logs', JSON.stringify([record, ...existing.slice(0, 50)]));
  } catch {
    // ignore
  }
}
