export type AppView = 'catalog' | 'checkout' | 'confirmation' | 'seller_admin';

export type Language = 'FR' | 'EN';

export type Currency = 'XOF';

export interface Product {
  id: string;
  sku: string;
  name: string;
  nameEn: string;
  category: string;
  subCategory?: string;
  price: number; // in XOF
  originalPrice?: number; // in XOF
  currency: Currency;
  image: string;
  rating: number;
  reviewsCount: number;
  stock: number;
  maxStock: number;
  status: 'online' | 'draft' | 'moderation';
  visibility: boolean;
  color?: string;
  description: string;
  descriptionEn: string;
  sellerId: string;
  sellerName: string;
  sellerShopName: string;
}

export type NewProductInput = Omit<Product, 'sellerId' | 'sellerName' | 'sellerShopName'>;

export interface CartItem {
  product: Product;
  quantity: number;
}

export type PaymentMethod = 'orange_money' | 'wave' | 'mtn_momo' | 'card';

export interface CustomerOrderInfo {
  fullName: string;
  phone: string;
  city: string;
  district: string;
  address: string;
  notes?: string;
  paymentMethod: PaymentMethod;
}

export interface ConfirmedOrder {
  id: string;
  date: string;
  customer: CustomerOrderInfo;
  items: CartItem[];
  subtotal: number;
  deliveryFee: number;
  total: number;
  paymentStatus: 'paid';
  trackingNumber: string;
  estimatedDelivery: string;
}

export interface SellerProfile {
  isAuthenticated: boolean;
  id: string;
  email: string;
  name: string;
  shopName: string;
  role: string;
}
