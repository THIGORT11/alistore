"use client";

import React, { createContext, useContext, useState, useEffect, useCallback } from "react";
import { useToast } from "@/hooks/use-toast";
import { loyaltyLevels, storeConfig } from "@/content/store";

type LoyaltyLevel = string;

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
    const earned = Math.floor(amountEuros) * storeConfig.loyalty.pointsPerEuro;
    if (earned > 0) {
      setPoints((prev) => prev + earned);
      toast({
        title: "¡Puntos conseguidos!",
        description: `Sumaste ${earned} puntos al ${storeConfig.loyalty.name} por tu compra.`,
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

  const currentLevelIndex = loyaltyLevels.reduce(
    (selectedIndex, candidate, index) => points >= candidate.minimumPoints ? index : selectedIndex,
    0,
  );
  const level: LoyaltyLevel = loyaltyLevels[currentLevelIndex].id;
  const nextLevelPoints = loyaltyLevels[currentLevelIndex + 1]?.minimumPoints ?? 0;

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
