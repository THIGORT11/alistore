"use client";

import React, { createContext, useContext, useState, useEffect, useCallback } from "react";
import type { Product } from "@/content/catalog";
import { promotionConfig, type Coupon } from "@/content/promotions";
import { useToast } from "@/hooks/use-toast";
import {
  calculatePromotionAmount,
  findCoupon,
  isCouponUsedOnDevice,
  isPromotionActive,
  recordCouponUse,
} from "@/lib/promotions";

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
  appliedCoupon: Coupon | null;
  couponDiscount: number;
  totalAfterCoupon: number;
  hasRedeemableCoupons: boolean;
  applyCouponCode: (code: string) => "applied" | "invalid" | "used";
  redeemAppliedCoupon: () => void;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export const CartProvider = ({ children }: { children: React.ReactNode }) => {
  const [cart, setCart] = useState<CartItem[]>([]);
  const [appliedCoupon, setAppliedCoupon] = useState<Coupon | null>(null);
  const [usedCouponIds, setUsedCouponIds] = useState<Set<string>>(new Set());
  const { toast } = useToast();

  useEffect(() => {
    try {
      const storedCart = localStorage.getItem("babystore-cart");
      if (storedCart) {
        setCart(JSON.parse(storedCart));
      }
      setUsedCouponIds(new Set(
        promotionConfig.coupons
          .filter((coupon) => isCouponUsedOnDevice(coupon))
          .map((coupon) => coupon.id),
      ));
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

  const cartCount = cart.reduce((count, item) => count + item.quantity, 0);
  const cartTotal = cart.reduce((total, item) => total + item.price * item.quantity, 0);

  const clearCart = useCallback(() => {
    setCart([]);
    setAppliedCoupon(null);
  }, []);

  const applyCouponCode = useCallback((code: string) => {
    const coupon = findCoupon(code);
    if (!coupon) return "invalid";
    if (usedCouponIds.has(coupon.id) || isCouponUsedOnDevice(coupon)) return "used";
    if (coupon.minimumSubtotal !== undefined && cartTotal < coupon.minimumSubtotal) return "invalid";

    setAppliedCoupon(coupon);
    return "applied";
  }, [cartTotal, usedCouponIds]);

  const redeemAppliedCoupon = useCallback(() => {
    if (!appliedCoupon) return;

    try {
      recordCouponUse(appliedCoupon);
    } catch (error) {
      console.error("Could not save coupon redemption to localStorage", error);
    }
    if (isCouponUsedOnDevice(appliedCoupon)) {
      setUsedCouponIds((current) => new Set([...current, appliedCoupon.id]));
    }
    setAppliedCoupon(null);
  }, [appliedCoupon]);

  const couponDiscount = appliedCoupon ? calculatePromotionAmount(cartTotal, appliedCoupon) : 0;
  const totalAfterCoupon = cartTotal - couponDiscount;
  const hasRedeemableCoupons = promotionConfig.coupons.some(
    (coupon) => isPromotionActive(coupon) && !usedCouponIds.has(coupon.id),
  );

  const value = {
    cart,
    addToCart,
    removeFromCart,
    updateQuantity,
    clearCart,
    cartCount,
    cartTotal,
    appliedCoupon,
    couponDiscount,
    totalAfterCoupon,
    hasRedeemableCoupons,
    applyCouponCode,
    redeemAppliedCoupon,
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
