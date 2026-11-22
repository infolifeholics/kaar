export interface Product {
  id: string | number;
  name: string;
  slug?: string;
  category: string;
  subcategory?: string;
  price: number;
  compareAt?: number;
  shortDescription?: string;
  description: string;
  note: string;
  accent: string;
  label?: string;
  bestseller?: boolean;
  newArrival?: boolean;
  images?: string[];
  thumbnail?: string;
  specifications?: Record<string, string>;
  features?: string[];
  variants?: string[];
  stockQuantity?: number;
  stockStatus?: 'in_stock' | 'low_stock' | 'out_of_stock';
  sku?: string;
  status?: 'published' | 'draft' | 'archived';
  isFeatured?: boolean;
  seoTitle?: string;
  seoDescription?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface CartItem {
  product: Product;
  quantity: number;
  selectedVariant?: string;
}

export interface CheckoutDetails {
  contact: string;
  firstName: string;
  lastName: string;
  address: string;
  apartment: string;
  city: string;
  state: string;
  postalCode: string;
  landmark?: string;
}

export interface OrderItem {
  productId: string | number;
  name: string;
  category?: string;
  price: number;
  quantity: number;
  thumbnail?: string;
  accent?: string;
  variant?: string;
}

export interface Order {
  id: string;
  userId?: string;
  customerId?: string;
  createdAt: string;
  updatedAt?: string;
  contact: string; // email or phone
  customerName: string;
  email?: string;
  phone?: string;
  address: string;
  shippingAddress?: {
    street: string;
    apartment?: string;
    city: string;
    state: string;
    postalCode: string;
    country: string;
  };
  items: CartItem[] | OrderItem[];
  subtotal: number;
  shipping: number;
  total: number;
  currency?: string;
  paymentMethod?: string;
  paymentStatus: 'pending' | 'paid' | 'failed' | 'refunded' | 'created';
  orderStatus: 'received' | 'processing' | 'shipped' | 'delivered' | 'cancelled';
  razorpayOrderId?: string;
  razorpayPaymentId?: string;
  razorpaySignature?: string;
  trackingNumber?: string;
  shippingCarrier?: string;
  notes?: string;
  googleSheetsSynced?: boolean;
}

export interface Category {
  name: string;
  subtitle: string;
  accent: string;
  icon: string;
  image?: string;
}

export interface GoogleSheetsCartPayload {
  userId: string;
  customerName: string;
  email: string;
  productId: string | number;
  productName: string;
  quantity: number;
  unitPrice: number;
  currency: string;
  cartTotal: number;
  addedAt: string;
  updatedAt: string;
  location: string;
}

export interface GoogleSheetsOrderPayload {
  orderId: string;
  userId: string;
  customerName: string;
  email: string;
  phone: string;
  productIds: string;
  productNames: string;
  quantities: string;
  subtotal: number;
  shipping: number;
  total: number;
  currency: string;
  paymentStatus: string;
  orderStatus: string;
  razorpayOrderId: string;
  razorpayPaymentId: string;
  orderDate: string;
  address: string;
}

export interface Review {
  id: string;
  productId?: string | number;
  productName?: string;
  userName: string;
  review: string;
  rating?: number;
  status: 'pending' | 'approved' | 'rejected';
  createdAt: string;
  updatedAt?: string;
}
