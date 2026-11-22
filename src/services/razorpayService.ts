declare global {
  interface Window {
    Razorpay: new (options: RazorpayOptions) => { open: () => void };
  }
}

export interface RazorpayOptions {
  key: string;
  amount: number; // in paise (e.g. 100 INR = 10000 paise)
  currency: string;
  name: string;
  description: string;
  image?: string;
  order_id?: string;
  prefill: {
    name?: string;
    email?: string;
    contact?: string;
  };
  theme?: {
    color?: string;
  };
  handler: (response: {
    razorpay_payment_id: string;
    razorpay_order_id?: string;
    razorpay_signature?: string;
  }) => void;
  modal?: {
    ondismiss?: () => void;
  };
}

export const RAZORPAY_KEY_ID =
  import.meta.env.VITE_RAZORPAY_KEY_ID ||
  import.meta.env.NEXT_PUBLIC_RAZORPAY_KEY_ID ||
  'rzp_live_TPZ7Awg2KxAFNO';

// Dynamically load Razorpay checkout script if not present
export function loadRazorpayScript(): Promise<boolean> {
  return new Promise((resolve) => {
    if (window.Razorpay) {
      resolve(true);
      return;
    }
    const script = document.createElement('script');
    script.src = 'https://checkout.razorpay.com/v1/checkout.js';
    script.async = true;
    script.onload = () => resolve(true);
    script.onerror = () => {
      console.warn('Failed to load Razorpay SDK');
      resolve(false);
    };
    document.body.appendChild(script);
  });
}

// Initiate Razorpay checkout popup
export async function openRazorpayCheckout({
  amount,
  customerName,
  email,
  contact,
  orderRef,
  onSuccess,
  onDismiss,
}: {
  amount: number; // In Rupees
  customerName: string;
  email: string;
  contact: string;
  orderRef: string;
  onSuccess: (paymentResult: { paymentId: string; orderId?: string }) => void;
  onDismiss: () => void;
}): Promise<void> {
  const loaded = await loadRazorpayScript();
  if (!loaded) {
    alert('Razorpay payment gateway is currently unavailable. Please verify your connection.');
    onDismiss();
    return;
  }

  const options: RazorpayOptions = {
    key: RAZORPAY_KEY_ID,
    amount: Math.round(amount * 100), // convert to paise
    currency: 'INR',
    name: 'LifeHolics / Kaar Ayurveda',
    description: `Order Payment Ref: ${orderRef}`,
    image: '/kaar-ayurveda-logo-transparent.png',
    prefill: {
      name: customerName,
      email: email,
      contact: contact,
    },
    theme: {
      color: '#354332',
    },
    handler: (response) => {
      onSuccess({
        paymentId: response.razorpay_payment_id,
        orderId: response.razorpay_order_id,
      });
    },
    modal: {
      ondismiss: () => {
        onDismiss();
      },
    },
  };

  const rzp = new window.Razorpay(options);
  rzp.open();
}
