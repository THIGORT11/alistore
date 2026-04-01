"use client";

import React, { createContext, useContext, useState, useEffect, useCallback } from "react";
import { useToast } from "@/hooks/use-toast";

type LoyaltyLevel = "Bronce" | "Plata" | "Oro";

interface LoyaltyContextType {
  points: number;
  level: LoyaltyLevel;
  nextLevelPoints: number;
  purchaseCount: number;
  addPurchasePoints: (amountEuros: number) => void;
  redeemPoints: (pointsToRedeem: number) => boolean;
}

const LoyaltyContext = createContext<LoyaltyContextType | undefined>(undefined);

export const LoyaltyProvider = ({ children }: { children: React.ReactNode }) => {
  const [points, setPoints] = useState<number>(0);
  const [purchaseCount, setPurchaseCount] = useState<number>(0);
  const { toast } = useToast();

  useEffect(() => {
    try {
      const storedPoints = localStorage.getItem("ali-store-loyalty-points");
      if (storedPoints) {
        setPoints(parseInt(storedPoints, 10));
      }
      const storedCount = localStorage.getItem("ali-store-purchase-count");
      if (storedCount) {
        setPurchaseCount(parseInt(storedCount, 10));
      }
    } catch (error) {
      console.error("Could not load points from localStorage", error);
    }
  }, []);

  useEffect(() => {
    try {
      localStorage.setItem("ali-store-loyalty-points", points.toString());
      localStorage.setItem("ali-store-purchase-count", purchaseCount.toString());
    } catch (error) {
      console.error("Could not save points to localStorage", error);
    }
  }, [points, purchaseCount]);

  const addPurchasePoints = useCallback((amountEuros: number) => {
    setPurchaseCount((prev) => prev + 1);
    const earned = Math.floor(amountEuros) * 5;
    if (earned > 0) {
      setPoints((prev) => prev + earned);
      toast({
        title: "¡Puntos conseguidos!",
        description: `Sumaste ${earned} puntos al Club BabyStore por tu compra.`,
      });
    }
  }, [toast]);

  const redeemPoints = useCallback((pointsToRedeem: number) => {
    if (points >= pointsToRedeem) {
      setPoints((prev) => prev - pointsToRedeem);
      return true;
    }
    return false;
  }, [points]);

  let level: LoyaltyLevel = "Bronce";
  let nextLevelPoints = 250;

  if (points >= 750) {
    level = "Oro";
    nextLevelPoints = 0; // max level
  } else if (points >= 250) {
    level = "Plata";
    nextLevelPoints = 750;
  }

  const value = {
    points,
    level,
    nextLevelPoints,
    purchaseCount,
    addPurchasePoints,
    redeemPoints,
  };

  return (
    <LoyaltyContext.Provider value={value}>
      {children}
    </LoyaltyContext.Provider>
  );
};

export const useLoyalty = () => {
    const context = useContext(LoyaltyContext);
    if (context === undefined) {
      throw new Error("useLoyalty must be used within a LoyaltyProvider");
    }
    return context;
};
