import React, { createContext, useContext, useState, ReactNode, useEffect } from "react";
import { CartItem, Product } from "@/types/shop";
import { useToast } from "@/hooks/use-toast";
import { cartAPI } from "@/lib/api";

interface CartContextType {
  items: CartItem[];
  addToCart: (product: Product, shopId: string, shopName: string) => void;
  removeFromCart: (productId: string) => void;
  updateQuantity: (productId: string, quantity: number) => void;
  clearCart: () => void;
  getItemCount: () => number;
  getTotal: () => number;
  getShopItems: (shopId: string) => CartItem[];
  loadCart: () => Promise<void>;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export const CartProvider = ({ children }: { children: ReactNode }) => {
  const [items, setItems] = useState<CartItem[]>([]);
  const { toast } = useToast();

  // Load cart from database on mount
  useEffect(() => {
    loadCart();
  }, []);

  const loadCart = async () => {
    try {
      const response = await cartAPI.get();
      const mappedItems = (response.items || []).map((item: any) => ({
        id: item.productId,
        name: item.productName,
        price: item.price,
        quantity: item.quantity,
        shopId: item.shopId,
        shopName: item.shopName,
        image: item.image,
        unit: item.unit,
        category: item.category || 'General',
        inStock: true,
      }));
      setItems(mappedItems as CartItem[]);
    } catch (error) {
      console.error("Failed to load cart:", error);
    }
  };

  const addToCart = async (product: Product, shopId: string, shopName: string) => {
    try {
      // Add to database
      await cartAPI.add(product, shopId, shopName, 1);

      // Update local state
      setItems((prev) => {
        const existingItem = prev.find((item) => item.id === product.id);
        if (existingItem) {
          return prev.map((item) =>
            item.id === product.id
              ? { ...item, quantity: item.quantity + 1 }
              : item
          );
        }
        return [...prev, { ...product, quantity: 1, shopId, shopName }];
      });

      toast({
        title: "Added to cart",
        description: `${product.name} added to your cart`,
      });
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to add to cart",
        variant: "destructive",
      });
    }
  };

  const removeFromCart = (productId: string) => {
    setItems((prev) => prev.filter((item) => item.id !== productId));
  };

  const updateQuantity = (productId: string, quantity: number) => {
    if (quantity <= 0) {
      removeFromCart(productId);
      return;
    }
    setItems((prev) =>
      prev.map((item) =>
        item.id === productId ? { ...item, quantity } : item
      )
    );
  };

  const clearCart = () => {
    setItems([]);
  };

  const getItemCount = () => {
    return items.reduce((total, item) => total + item.quantity, 0);
  };

  const getTotal = () => {
    return items.reduce((total, item) => total + item.price * item.quantity, 0);
  };

  const getShopItems = (shopId: string) => {
    return items.filter((item) => item.shopId === shopId);
  };

  return (
    <CartContext.Provider
      value={{
        items,
        addToCart,
        removeFromCart,
        updateQuantity,
        clearCart,
        getItemCount,
        getTotal,
        getShopItems,
        loadCart,
      }}
    >
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error("useCart must be used within a CartProvider");
  }
  return context;
};
