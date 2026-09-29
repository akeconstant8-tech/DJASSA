import { CartItem } from '../types';

export interface SellerCartGroup {
  sellerId: string;
  shopName: string;
  items: CartItem[];
  subtotal: number;
}

export function groupCartBySeller(items: CartItem[]): SellerCartGroup[] {
  const groups = new Map<string, SellerCartGroup>();
  for (const item of items) {
    const { sellerId, sellerShopName } = item.product;
    let group = groups.get(sellerId);
    if (!group) {
      group = { sellerId, shopName: sellerShopName, items: [], subtotal: 0 };
      groups.set(sellerId, group);
    }
    group.items.push(item);
    group.subtotal += item.product.price * item.quantity;
  }
  return Array.from(groups.values());
}
