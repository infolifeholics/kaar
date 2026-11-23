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
  html?: string;
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

  const htmlBody = `
    <div style="font-family: Arial, sans-serif; color: #2d3029; line-height: 1.6; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e7e5dc; border-radius: 6px;">
      <h2 style="color: #354332; margin-top: 0;">Order Confirmed!</h2>
      <p>Dear <strong>${order.customerName}</strong>,</p>
      <p>Thank you for choosing LifeHolics · Kaar Ayurveda. Your order <strong>${order.id}</strong> has been received and verified.</p>
      <hr style="border: 0; border-top: 1px solid #e7e5dc; margin: 16px 0;" />
      <h3>Order Details:</h3>
      <p><strong>Items:</strong> ${itemsText}</p>
      <p><strong>Total Amount:</strong> ₹${order.total}</p>
      <p><strong>Delivery Destination:</strong> ${order.address}</p>
      <p><strong>Phone:</strong> ${order.phone || 'N/A'}</p>
      <hr style="border: 0; border-top: 1px solid #e7e5dc; margin: 16px 0;" />
      <p style="font-size: 13px; color: #77786e;">We will send tracking updates as soon as your botanical parcel is dispatched. For queries, contact support@thelifeholics.com or +91 8006880222.</p>
    </div>
  `;

  await logEmailNotification({
    to: recipient,
    subject,
    type: 'order_confirmation',
    orderId: order.id,
    bodySummary: summary,
    html: htmlBody,
  });

  console.info(`[Email Automation] Dispatched customer confirmation to ${recipient} (Subject: "${subject}")`);
  return true;
}

// Admin Notification Email
export async function sendAdminNewOrderEmail(order: Order): Promise<boolean> {
  const subject = `[New Order Alert] ${order.id} - ₹${order.total} by ${order.customerName}`;
  const itemsText = order.items
    .map((i) => `${i.quantity} × ${'product' in i ? i.product.name : i.name}`)
    .join(', ');

  const summary = `New order ${order.id} by ${order.customerName} (Email: ${order.email || 'N/A'}, Phone: ${order.phone || 'N/A'}). Items: ${itemsText}. Total: ₹${order.total}. Address: ${order.address}.`;

  const htmlBody = `
    <div style="font-family: Arial, sans-serif; color: #2d3029; line-height: 1.6; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #354332; border-radius: 6px;">
      <h2 style="color: #354332; margin-top: 0;">New Paid Order Received!</h2>
      <p><strong>Order ID:</strong> ${order.id}</p>
      <p><strong>Customer:</strong> ${order.customerName}</p>
      <p><strong>Email:</strong> ${order.email || order.contact}</p>
      <p><strong>Phone:</strong> ${order.phone || 'N/A'}</p>
      <p><strong>Items:</strong> ${itemsText}</p>
      <p><strong>Total:</strong> ₹${order.total}</p>
      <p><strong>Shipping:</strong> ₹${order.shipping}</p>
      <p><strong>Delivery Address:</strong> ${order.address}</p>
      <p><strong>Razorpay Payment ID:</strong> ${order.razorpayPaymentId || 'N/A'}</p>
    </div>
  `;

  await logEmailNotification({
    to: ADMIN_EMAIL,
    subject,
    type: 'admin_new_order',
    orderId: order.id,
    bodySummary: summary,
    html: htmlBody,
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
  html?: string;
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
    html: data.html,
  };

  try {
    const docRef = doc(collection(db, 'emailLogs'), logId);
    await setDoc(docRef, record);
  } catch (err) {
    console.warn('Firestore emailLog notice:', err);
  }

  // Trigger Firebase Trigger Email extension / mail collection if enabled in Firebase
  try {
    const mailDocRef = doc(collection(db, 'mail'), logId);
    await setDoc(mailDocRef, {
      to: [data.to],
      message: {
        subject: data.subject,
        text: data.bodySummary,
        html: data.html || `<p>${data.bodySummary}</p>`,
      },
    });
  } catch {
    // If mail extension is not installed, emailLogs still tracks the record
  }

  try {
    const existing = JSON.parse(localStorage.getItem('kaar-email-logs') || '[]');
    localStorage.setItem('kaar-email-logs', JSON.stringify([record, ...existing.slice(0, 50)]));
  } catch {
    // ignore
  }
}
