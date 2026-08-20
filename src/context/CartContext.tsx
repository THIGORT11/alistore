"use client";

import React, { createContext, useContext, useState, useEffect, useCallback } from "react";
import type { Product } from "@/data/products";
import { useToast } from "@/hooks/use-toast";

export interface CartItem extends Product {
  quantity: number;
}

interface CartContextType {
  cart: CartItem[];
  addToCart: (product: Product) => void;
  removeFromCart: (productId: string) => void;
  updateQuantity: (productId: string, quantity: number) => void;
  clearCart: () => void;
  cartCount: number;
  cartTotal: number;
  promoApplied: boolean;
  promoAlreadyUsed: boolean;
  promoDiscount: number;
  totalAfterPromo: number;
  applyPromoCode: (code: string) => "applied" | "invalid" | "used";
  redeemPromoCode: () => void;
}

const CartContext = createContext<CartContextType | undefined>(undefined);
const PROMO_CODE = "CUM BS";
const PROMO_USED_KEY = "babystore-promo-cum-bs-used";

export const CartProvider = ({ children }: { children: React.ReactNode }) => {
  const [cart, setCart] = useState<CartItem[]>([]);
  const [promoApplied, setPromoApplied] = useState(false);
  const [promoAlreadyUsed, setPromoAlreadyUsed] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    try {
      const storedCart = localStorage.getItem("babystore-cart");
      if (storedCart) {
        setCart(JSON.parse(storedCart));
      }
      setPromoAlreadyUsed(localStorage.getItem(PROMO_USED_KEY) === "true");
    } catch (error) {
      console.error("Could not load cart from localStorage", error);
    }
  }, []);

  useEffect(() => {
    try {
      localStorage.setItem("babystore-cart", JSON.stringify(cart));
    } catch (error) {
      console.error("Could not save cart to localStorage", error);
    }
  }, [cart]);

  const addToCart = useCallback((product: Product) => {
    setCart((prev) => {
      const existingItem = prev.find((item) => item.id === product.id);
      if (existingItem) {
        return prev.map((item) =>
          item.id === product.id
            ? { ...item, quantity: item.quantity + 1 }
            : item
        );
      }
      return [...prev, { ...product, quantity: 1 }];
    });
    toast({ title: "Añadido al carrito", description: `${product.name} ha sido añadido al carrito.` });
  }, [toast]);

  const removeFromCart = useCallback((productId: string) => {
    setCart((prev) => {
      const updatedCart = prev.filter((item) => item.id !== productId);
      const removedItem = prev.find((item) => item.id === productId);
      if (removedItem) {
        toast({ title: "Eliminado del carrito", description: `${removedItem.name} ha sido eliminado del carrito.` });
      }
      return updatedCart;
    });
  }, [toast]);

  const updateQuantity = useCallback((productId: string, quantity: number) => {
    setCart((prev) => {
      if (quantity <= 0) {
        const updatedCart = prev.filter((item) => item.id !== productId);
        const removedItem = prev.find((item) => item.id === productId);
        if (removedItem) {
          toast({ title: "Eliminado del carrito", description: `${removedItem.name} ha sido eliminado del carrito.` });
        }
        return updatedCart;
      }
      return prev.map((item) =>
        item.id === productId ? { ...item, quantity } : item
      );
    });
  }, [toast]);

  const clearCart = useCallback(() => {
    setCart([]);
    setPromoApplied(false);
  }, []);

  const applyPromoCode = useCallback((code: string) => {
    if (promoAlreadyUsed) return "used";

    const normalizedCode = code.trim().replace(/\s+/g, " ").toUpperCase();
    if (normalizedCode !== PROMO_CODE) return "invalid";

    setPromoApplied(true);
    return "applied";
  }, [promoAlreadyUsed]);

  const redeemPromoCode = useCallback(() => {
    if (!promoApplied) return;

    try {
      localStorage.setItem(PROMO_USED_KEY, "true");
    } catch (error) {
      console.error("Could not save promo redemption to localStorage", error);
    }
    setPromoAlreadyUsed(true);
    setPromoApplied(false);
  }, [promoApplied]);

  const cartCount = cart.reduce((count, item) => count + item.quantity, 0);
  const cartTotal = cart.reduce((total, item) => total + item.price * item.quantity, 0);
  const promoDiscount = promoApplied ? cartTotal * 0.5 : 0;
  const totalAfterPromo = cartTotal - promoDiscount;

  const value = {
    cart,
    addToCart,
    removeFromCart,
    updateQuantity,
    clearCart,
    cartCount,
    cartTotal,
    promoApplied,
    promoAlreadyUsed,
    promoDiscount,
    totalAfterPromo,
    applyPromoCode,
    redeemPromoCode,
  };

  return (
    <CartContext.Provider value={value}>
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => {
  const context = useContext(CartContext);
  if (context === undefined) {
    throw new Error("useCart must be used within a CartProvider");
  }
  return context;
};
