export interface Review {
  id: string;
  productId?: string | number;
  productName?: string;
  userName: string;
  review: string;
  rating?: number; // 1-5 default 5
  status: 'pending' | 'approved' | 'rejected';
  createdAt: string;
  updatedAt?: string;
}
