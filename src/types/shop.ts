export interface Shop {
  id: string;
  name: string;
  image: string;
  rating: number;
  deliveryTime: string;
  distance: string;
  categories: string[];
  isOpen: boolean;
}

export interface Product {
  id: string;
  name: string;
  image: string;
  price: number;
  originalPrice?: number;
  unit: string;
  category: string;
  inStock: boolean;
  description?: string;
}

export interface CartItem extends Product {
  quantity: number;
  shopId: string;
  shopName: string;
}
