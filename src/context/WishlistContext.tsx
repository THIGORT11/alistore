"use client";

import React, { createContext, useContext, useState, useEffect, useCallback } from "react";
import { useToast } from "@/hooks/use-toast";

interface WishlistContextType {
  wishlist: string[];
  addToWishlist: (productId: string) => void;
  removeFromWishlist: (productId: string) => void;
  isInWishlist: (productId: string) => boolean;
}

const WishlistContext = createContext<WishlistContextType | undefined>(undefined);

export const WishlistProvider = ({ children }: { children: React.ReactNode }) => {
  const [wishlist, setWishlist] = useState<string[]>([]);
  const { toast } = useToast();

  useEffect(() => {
    try {
      const storedWishlist = localStorage.getItem("babystore-wishlist");
      if (storedWishlist) {
        setWishlist(JSON.parse(storedWishlist));
      }
    } catch (error) {
      console.error("Could not load wishlist from localStorage", error);
    }
  }, []);

  useEffect(() => {
    try {
      localStorage.setItem("babystore-wishlist", JSON.stringify(wishlist));
    } catch (error) {
      console.error("Could not save wishlist to localStorage", error);
    }
  }, [wishlist]);

  const addToWishlist = useCallback((productId: string) => {
    setWishlist((prev) => {
      if (prev.includes(productId)) {
        return prev;
      }
      toast({ title: "Añadido a la Lista de Deseos", description: "El artículo ha sido añadido a tu lista de deseos." });
      return [...prev, productId];
    });
  }, [toast]);

  const removeFromWishlist = useCallback((productId: string) => {
    setWishlist((prev) => {
      if (!prev.includes(productId)) {
        return prev;
      }
      toast({ title: "Eliminado de la Lista de Deseos", description: "El artículo ha sido eliminado de tu lista de deseos." });
      return prev.filter((id) => id !== productId);
    });
  }, [toast]);

  const isInWishlist = useCallback((productId: string) => {
    return wishlist.includes(productId);
  }, [wishlist]);

  const value = {
    wishlist,
    addToWishlist,
    removeFromWishlist,
    isInWishlist,
  };

  return (
    <WishlistContext.Provider value={value}>
      {children}
    </WishlistContext.Provider>
  );
};

export const useWishlist = () => {
  const context = useContext(WishlistContext);
  if (context === undefined) {
    throw new Error("useWishlist must be used within a WishlistProvider");
  }
  return context;
};
