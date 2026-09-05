"use client";

import React, { createContext, useContext, useState, useEffect, useCallback, useRef } from "react";
import { products, type Product } from "@/content/catalog";
import { promotionConfig, type Coupon } from "@/content/promotions";
import { useToast } from "@/hooks/use-toast";
import {
  canAddProduct,
  getCartQuantityForProduct,
  getInventoryProductId,
  isProductOutOfStock,
} from "@/lib/product-stock";
import {
  calculatePromotionAmount,
  findCoupon,
  isCouponUsedOnDevice,
  isPromotionActive,
  recordCouponUse,
} from "@/lib/promotions";

export interface CartItem extends Product {
  inventoryProductId?: string;
  quantity: number;
}

interface CartContextType {
  cart: CartItem[];
  addToCart: (product: Product, inventoryProductId?: string) => void;
  removeFromCart: (productId: string) => void;
  updateQuantity: (productId: string, quantity: number) => void;
  canAddToCart: (product: Product) => boolean;
  canIncrementItem: (productId: string) => boolean;
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

const productsById = new Map(products.map((product) => [product.id, product]));

function resolveStoredInventoryProductId(item: CartItem) {
  if (item.inventoryProductId) return item.inventoryProductId;
  if (productsById.has(item.id)) return item.id;

  return products
    .filter((product) => product.customization && item.id.startsWith(product.id))
    .sort((left, right) => right.id.length - left.id.length)[0]?.id ?? item.id;
}

function normalizeStoredCart(items: CartItem[]) {
  const usedStock = new Map<string, number>();

  return items.flatMap((item) => {
    const inventoryProductId = resolveStoredInventoryProductId(item);
    const currentProduct = productsById.get(inventoryProductId);
    const availability = currentProduct?.availability ?? item.availability;
    const stock = currentProduct ? currentProduct.stock : item.stock;
    const alreadyUsed = usedStock.get(inventoryProductId) ?? 0;
    const requestedQuantity = Number.isFinite(item.quantity) ? Math.max(0, Math.floor(item.quantity)) : 0;
    const quantity = stock === undefined
      ? requestedQuantity
      : Math.min(requestedQuantity, Math.max(0, stock - alreadyUsed));

    if (availability === "out_of_stock" || stock === 0 || quantity === 0) return [];
    usedStock.set(inventoryProductId, alreadyUsed + quantity);

    return [{ ...item, availability, stock, inventoryProductId, quantity }];
  });
}

export const CartProvider = ({ children }: { children: React.ReactNode }) => {
  const [cart, setCart] = useState<CartItem[]>([]);
  const cartRef = useRef<CartItem[]>([]);
  const [appliedCoupon, setAppliedCoupon] = useState<Coupon | null>(null);
  const [usedCouponIds, setUsedCouponIds] = useState<Set<string>>(new Set());
  const { toast } = useToast();

  useEffect(() => {
    try {
      const storedCart = localStorage.getItem("babystore-cart");
      if (storedCart) {
        const parsedCart = JSON.parse(storedCart);
        if (Array.isArray(parsedCart)) {
          const normalizedCart = normalizeStoredCart(parsedCart);
          cartRef.current = normalizedCart;
          setCart(normalizedCart);
        }
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

  const addToCart = useCallback((product: Product, inventoryProductId = product.id) => {
    const previousCart = cartRef.current;
    const inventoryProduct = productsById.get(inventoryProductId) ?? product;
    const quantityInCart = getCartQuantityForProduct(previousCart, inventoryProductId);
    if (!canAddProduct(inventoryProduct, quantityInCart)) {
      toast({
        title: isProductOutOfStock(inventoryProduct) ? "Producto agotado" : "Stock máximo alcanzado",
        description: isProductOutOfStock(inventoryProduct)
          ? `${inventoryProduct.name} no está disponible.`
          : `Solo hay ${inventoryProduct.stock} unidades disponibles de ${inventoryProduct.name}.`,
        variant: "destructive",
      });
      return;
    }

    const existingItem = previousCart.find((item) => item.id === product.id);
    const nextCart = existingItem
      ? previousCart.map((item) => item.id === product.id ? { ...item, quantity: item.quantity + 1 } : item)
      : [...previousCart, { ...product, inventoryProductId, quantity: 1 }];
    cartRef.current = nextCart;
    setCart(nextCart);
    toast({ title: "Añadido al carrito", description: `${product.name} ha sido añadido al carrito.` });
  }, [toast]);

  const removeFromCart = useCallback((productId: string) => {
    const removedItem = cartRef.current.find((item) => item.id === productId);
    if (!removedItem) return;
    const nextCart = cartRef.current.filter((item) => item.id !== productId);
    cartRef.current = nextCart;
    setCart(nextCart);
    toast({ title: "Eliminado del carrito", description: `${removedItem.name} ha sido eliminado del carrito.` });
  }, [toast]);

  const updateQuantity = useCallback((productId: string, quantity: number) => {
    const previousCart = cartRef.current;
    const targetItem = previousCart.find((item) => item.id === productId);
    if (!targetItem) return;

    if (quantity <= 0) {
      const nextCart = previousCart.filter((item) => item.id !== productId);
      cartRef.current = nextCart;
      setCart(nextCart);
      toast({ title: "Eliminado del carrito", description: `${targetItem.name} ha sido eliminado del carrito.` });
      return;
    }

    const inventoryProductId = getInventoryProductId(targetItem);
    const inventoryProduct = productsById.get(inventoryProductId) ?? targetItem;
    if (isProductOutOfStock(inventoryProduct)) {
      const nextCart = previousCart.filter((item) => item.id !== productId);
      cartRef.current = nextCart;
      setCart(nextCart);
      toast({ title: "Producto agotado", description: `${inventoryProduct.name} ya no está disponible.`, variant: "destructive" });
      return;
    }

    const otherQuantity = getCartQuantityForProduct(
      previousCart.filter((item) => item.id !== productId),
      inventoryProductId,
    );
    const maximumForLine = inventoryProduct.stock === undefined
      ? quantity
      : Math.max(0, inventoryProduct.stock - otherQuantity);
    const safeQuantity = Math.min(quantity, maximumForLine);

    if (safeQuantity < quantity) {
      toast({
        title: "Stock máximo alcanzado",
        description: `Solo hay ${inventoryProduct.stock} unidades disponibles de ${inventoryProduct.name}.`,
        variant: "destructive",
      });
    }

    const nextCart = safeQuantity <= 0
      ? previousCart.filter((item) => item.id !== productId)
      : previousCart.map((item) => item.id === productId ? { ...item, quantity: safeQuantity } : item);
    cartRef.current = nextCart;
    setCart(nextCart);
  }, [toast]);

  const canAddToCart = useCallback((product: Product) => (
    canAddProduct(product, getCartQuantityForProduct(cart, product.id))
  ), [cart]);

  const canIncrementItem = useCallback((productId: string) => {
    const item = cart.find((cartItem) => cartItem.id === productId);
    if (!item) return false;
    const inventoryProductId = getInventoryProductId(item);
    const inventoryProduct = productsById.get(inventoryProductId) ?? item;
    return canAddProduct(inventoryProduct, getCartQuantityForProduct(cart, inventoryProductId));
  }, [cart]);

  const cartCount = cart.reduce((count, item) => count + item.quantity, 0);
  const cartTotal = cart.reduce((total, item) => total + item.price * item.quantity, 0);

  const clearCart = useCallback(() => {
    cartRef.current = [];
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
    canAddToCart,
    canIncrementItem,
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
