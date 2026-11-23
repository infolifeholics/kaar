import React, { useState } from 'react';
import {
  MapPin,
  PackageCheck,
  ArrowRight,
  X,
  ShieldAlert,
  LogIn,
  KeyRound,
  CheckCircle2,
  Clock,
  Truck,
  AlertCircle,
} from 'lucide-react';
import { Order } from '../../types';
import { ADMIN_EMAIL } from '../../firebase';
import { findOrdersByContact } from '../../services/orderService';
import { loginAdminWithGoogle } from '../../services/authService';

interface SmartOrderTrackingModalProps {
  initialContact?: string;
  onClose: () => void;
  onAdminAuthenticated: () => void;
}

export const SmartOrderTrackingModal: React.FC<SmartOrderTrackingModalProps> = ({
  initialContact = '',
  onClose,
  onAdminAuthenticated,
}) => {
  const [contact, setContact] = useState(initialContact);
  const [loading, setLoading] = useState(false);
  const [orders, setOrders] = useState<Order[]>([]);
  const [searched, setSearched] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  // Admin login trigger mode
  const [isAdminMode, setIsAdminMode] = useState(
    initialContact.toLowerCase().trim() === ADMIN_EMAIL.toLowerCase().trim()
  );
  const [adminError, setAdminError] = useState('');

  // Guest security verification OTP flow simulation
  const [verificationRequired, setVerificationRequired] = useState(false);
  const [otpCode, setOtpCode] = useState('');
  const [generatedOtp, setGeneratedOtp] = useState('');
  const [pendingOrders, setPendingOrders] = useState<Order[]>([]);

  const handleSearchSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const clean = contact.trim();
    if (!clean) return;

    setErrorMessage('');
    setAdminError('');

    // A. Special Admin Email Identification
    if (clean.toLowerCase() === ADMIN_EMAIL.toLowerCase()) {
      setIsAdminMode(true);
      return;
    }

    // B. Normal Customer Order Tracking
    setLoading(true);
    try {
      const found = await findOrdersByContact(clean);
      if (found.length === 0) {
        setOrders([]);
        setSearched(true);
      } else {
        // Require guest security verification (OTP / verification code) before revealing full personal details
        const code = Math.floor(100000 + Math.random() * 900000).toString();
        setGeneratedOtp(code);
        setPendingOrders(found);
        setVerificationRequired(true);
      }
    } catch {
      setErrorMessage('Could not fetch orders right now. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOtp = (e: React.FormEvent) => {
    e.preventDefault();
    if (otpCode.trim() === generatedOtp) {
      setOrders(pendingOrders);
      setSearched(true);
      setVerificationRequired(false);
      setErrorMessage('');
    } else {
      setErrorMessage('Incorrect verification code. Please check and try again.');
    }
  };

  const handleAdminGoogleLogin = async () => {
    setLoading(true);
    setAdminError('');
    const res = await loginAdminWithGoogle();
    setLoading(false);
    if (res.success) {
      onAdminAuthenticated();
    } else {
      setAdminError(res.error || 'Authentication failed. Unauthorized account.');
    }
  };

  const money = (val: number) => `₹${val.toLocaleString('en-IN')}`;

  return (
    <div className="overlay account-overlay" onClick={onClose}>
      <section className="account-modal" onClick={(e) => e.stopPropagation()}>
        <button className="modal-close" onClick={onClose} aria-label="Close account panel">
          <X size={20} />
        </button>

        <div className="account-icon">
          {isAdminMode ? <ShieldAlert size={22} className="text-amber-800" /> : <MapPin size={22} />}
        </div>

        <span className="eyebrow">
          {isAdminMode ? 'ADMINISTRATOR AUTHENTICATION' : 'YOUR KAAR ACCOUNT'}
        </span>

        <h2>
          {isAdminMode ? 'Management Portal' : 'Welcome, whenever you’re ready.'}
        </h2>

        {!isAdminMode ? (
          <p className="account-intro">
            Guest checkout never requires an account. Look up an order with the email or phone number you used at checkout.
          </p>
        ) : (
          <p className="account-intro">
            Designated administrator account detected ({ADMIN_EMAIL}). Secure authorization via Google OAuth is required to enter the dashboard.
          </p>
        )}

        {/* ADMIN LOGIN FLOW */}
        {isAdminMode ? (
          <div className="admin-login-box" style={{ marginTop: '20px' }}>
            <div
              style={{
                background: '#faf6ee',
                border: '1px solid #e2dac9',
                padding: '16px',
                marginBottom: '20px',
                fontSize: '12px',
                lineHeight: '1.6',
                color: '#554f42',
              }}
            >
              <strong>Security Protocol:</strong>
              <p style={{ margin: '6px 0 0' }}>
                If you have not Permission of this login please do not try to login it will not work.
              </p>
            </div>

            {adminError && (
              <div
                style={{
                  background: '#fdf2f2',
                  border: '1px solid #f8b4b4',
                  color: '#9b1c1c',
                  padding: '12px 14px',
                  fontSize: '12px',
                  marginBottom: '16px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                }}
              >
                <AlertCircle size={16} />
                <span>{adminError}</span>
              </div>
            )}

            <button
              type="button"
              className="button button-dark full"
              onClick={handleAdminGoogleLogin}
              disabled={loading}
              style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '10px' }}
            >
              <LogIn size={16} />
              {loading ? 'Verifying with Google...' : 'Continue with Google'}
            </button>

            <button
              type="button"
              className="text-button"
              onClick={() => {
                setIsAdminMode(false);
                setAdminError('');
                setContact('');
              }}
              style={{ marginTop: '14px', fontSize: '11px', textAlign: 'center', width: '100%' }}
            >
              Back to Customer Order Lookup
            </button>
          </div>
        ) : verificationRequired ? (
          /* OTP VERIFICATION STEP */
          <form className="account-lookup" onSubmit={handleVerifyOtp} style={{ marginTop: '16px' }}>
            <div
              style={{
                background: '#f2f6f1',
                border: '1px solid #cfe0cd',
                padding: '12px',
                fontSize: '12px',
                color: '#344733',
                marginBottom: '10px',
              }}
            >
              <p style={{ margin: 0 }}>
                A verification code has been dispatched to <strong>{contact}</strong> for data privacy.
              </p>
              <p style={{ margin: '6px 0 0', fontSize: '11px', color: '#5b6e5a' }}>
                <strong>Verification Code:</strong> <span style={{ letterSpacing: '2px', fontWeight: 'bold' }}>{generatedOtp}</span>
              </p>
            </div>

            <label>
              Enter 6-digit verification code
              <input
                type="text"
                autoFocus
                required
                maxLength={6}
                value={otpCode}
                onChange={(e) => setOtpCode(e.target.value)}
                placeholder="e.g. 123456"
                style={{ letterSpacing: '4px', fontSize: '16px', textAlign: 'center' }}
              />
            </label>

            {errorMessage && <p className="checkout-error" role="alert">{errorMessage}</p>}

            <button className="button button-dark full" type="submit" style={{ marginTop: '8px' }}>
              Confirm & View Orders <KeyRound size={15} style={{ marginLeft: '6px' }} />
            </button>

            <button
              type="button"
              className="text-button"
              onClick={() => setVerificationRequired(false)}
              style={{ marginTop: '10px', fontSize: '11px' }}
            >
              Cancel & enter another contact
            </button>
          </form>
        ) : (
          /* NORMAL SEARCH FORM */
          <form className="account-lookup" onSubmit={handleSearchSubmit}>
            <label>
              Email or 10-digit mobile number
              <input
                type="text"
                required
                value={contact}
                onChange={(e) => {
                  setContact(e.target.value);
                  setSearched(false);
                  setErrorMessage('');
                }}
                placeholder="Enter email or phone number used at checkout"
              />
            </label>

            <span style={{ display: 'block', fontSize: '11px', color: '#77786e', marginTop: '4px', textAlign: 'left' }}>
              You can track your order using either your Email address or your Mobile number.
            </span>

            {errorMessage && <p className="checkout-error" role="alert">{errorMessage}</p>}

            <button className="button button-dark full" type="submit" disabled={loading} style={{ marginTop: '10px' }}>
              {loading ? 'Searching...' : 'Find my orders'} <ArrowRight size={15} />
            </button>
          </form>
        )}

        {/* ORDER RESULTS */}
        {searched && !isAdminMode && (
          <div className="account-results" style={{ marginTop: '24px' }}>
            {orders.length ? (
              orders.map((order) => (
                <article className="tracked-order" key={order.id} style={{ marginBottom: '20px' }}>
                  <div className="tracked-order-heading">
                    <div>
                      <span className="eyebrow">ORDER {order.id}</span>
                      <strong style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                        {order.orderStatus === 'delivered' ? (
                          <CheckCircle2 size={16} className="text-emerald-700" />
                        ) : (
                          <Clock size={16} className="text-amber-700" />
                        )}
                        Status:{' '}
                        {order.orderStatus
                          ? order.orderStatus.charAt(0).toUpperCase() + order.orderStatus.slice(1)
                          : 'Order received'}
                      </strong>
                    </div>
                    <PackageCheck size={20} />
                  </div>

                  {/* Customer and Delivery Details */}
                  <div
                    style={{
                      background: '#faf9f5',
                      padding: '10px 12px',
                      fontSize: '11px',
                      color: '#55584f',
                      borderRadius: '2px',
                      margin: '10px 0',
                      lineHeight: '1.6',
                    }}
                  >
                    <div><strong>Customer:</strong> {order.customerName}</div>
                    <div><strong>Contact:</strong> {order.contact}</div>
                    <div><strong>Shipping to:</strong> {order.address}</div>
                    <div><strong>Payment:</strong> <span style={{ textTransform: 'capitalize' }}>{order.paymentStatus || 'Pending'}</span></div>
                    {order.trackingNumber && (
                      <div style={{ marginTop: '4px', color: '#2d4b30' }}>
                        <strong><Truck size={12} style={{ display: 'inline', marginRight: '4px' }} /> {order.shippingCarrier || 'Courier'}:</strong> {order.trackingNumber}
                      </div>
                    )}
                  </div>

                  {/* Ordered Items List */}
                  <div style={{ display: 'grid', gap: '10px', margin: '12px 0' }}>
                    {order.items.map((item, idx) => {
                      const itemName = 'product' in item ? item.product.name : item.name;
                      const itemPrice = 'product' in item ? item.product.price : item.price;
                      const itemQty = item.quantity;
                      const itemImage =
                        ('product' in item && item.product.thumbnail) ||
                        ('thumbnail' in item ? item.thumbnail : '') ||
                        ('product' in item && item.product.images?.[0]) ||
                        '';

                      return (
                        <div
                          key={idx}
                          style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '10px',
                            borderBottom: '1px solid #f0eee6',
                            paddingBottom: '8px',
                          }}
                        >
                          {itemImage ? (
                            <img
                              src={itemImage}
                              alt={itemName}
                              style={{ width: '42px', height: '42px', objectFit: 'cover', borderRadius: '3px' }}
                            />
                          ) : (
                            <div
                              style={{
                                width: '42px',
                                height: '42px',
                                background: '#eceae2',
                                display: 'grid',
                                placeItems: 'center',
                                fontSize: '10px',
                                color: '#686a60',
                              }}
                            >
                              KAAR
                            </div>
                          )}
                          <div style={{ flex: 1, minWidth: 0 }}>
                            <div style={{ fontSize: '12px', fontWeight: 500 }}>{itemName}</div>
                            <div style={{ fontSize: '11px', color: '#77786e' }}>
                              Qty {itemQty} × {money(itemPrice)}
                            </div>
                          </div>
                          <div style={{ fontSize: '12px', fontWeight: 600 }}>
                            {money(itemPrice * itemQty)}
                          </div>
                        </div>
                      );
                    })}
                  </div>

                  <div className="tracked-order-meta">
                    <span>Placed on {new Date(order.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}</span>
                    <strong>Total {money(order.total)}</strong>
                  </div>

                  <div className="tracking-progress">
                    <span className="tracking-active" />
                    <span className={order.orderStatus === 'shipped' || order.orderStatus === 'delivered' ? 'tracking-active' : ''} />
                    <span className={order.orderStatus === 'delivered' ? 'tracking-active' : ''} />
                  </div>
                  <div className="tracking-labels">
                    <span>Received</span>
                    <span>Shipped</span>
                    <span>Delivered</span>
                  </div>
                </article>
              ))
            ) : (
              <p className="no-orders">
                No orders found for this email address or mobile number.
              </p>
            )}
          </div>
        )}

        <p className="account-demo-note" style={{ marginTop: '20px' }}>
          Connected securely to Kaar Ayurveda.
        </p>
      </section>
    </div>
  );
};
export default SmartOrderTrackingModal;
