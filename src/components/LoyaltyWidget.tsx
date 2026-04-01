"use client";

import { useState, useEffect } from "react";
import { useLoyalty } from "@/context/LoyaltyContext";
import { Button } from "@/components/ui/button";
import { Crown, Star, Sparkles, TrendingUp } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export default function LoyaltyWidget() {
  const { points, level, nextLevelPoints } = useLoyalty();
  const [showTooltip, setShowTooltip] = useState(false);

  useEffect(() => {
    const hasSeenTooltip = localStorage.getItem("has-seen-babystore-club");
    if (!hasSeenTooltip) {
      setTimeout(() => setShowTooltip(true), 1500);
    }
  }, []);

  const handleOpenChange = (open: boolean) => {
    if (open && showTooltip) {
      setShowTooltip(false);
      localStorage.setItem("has-seen-babystore-club", "true");
    }
  };

  let levelColor = "text-amber-500";
  let levelBg = "bg-amber-500/10";
  let progressPercent = 0;

  if (level === "Bronce") {
    progressPercent = (points / 250) * 100;
  } else if (level === "Plata") {
    levelColor = "text-slate-300";
    levelBg = "bg-slate-300/10";
    progressPercent = ((points - 250) / 500) * 100;
  } else if (level === "Oro") {
    levelColor = "text-yellow-400";
    levelBg = "bg-yellow-400/10";
    progressPercent = 100;
  }

  return (
    <DropdownMenu onOpenChange={handleOpenChange}>
      <div className="relative">
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" size="icon" className="relative group hover:bg-transparent">
            <div className="flex items-center justify-center w-10 h-10 rounded-full transition-transform group-hover:scale-110 group-hover:shadow-[0_0_15px_rgba(251,191,36,0.5)]">
              <Crown className={`w-6 h-6 stroke-1 ${levelColor} drop-shadow-[0_0_5px_currentColor]`} />
            </div>
          </Button>
        </DropdownMenuTrigger>

        {showTooltip && (
          <div className="absolute top-full right-0 mt-3 w-56 bg-indigo-600 text-white p-3 rounded-lg shadow-2xl animate-bounce z-50 text-sm border border-indigo-500">
            <div className="absolute -top-2 right-4 w-4 h-4 bg-indigo-600 border-l border-t border-indigo-500 transform rotate-45"></div>
            <p className="relative z-10 text-center">¡Descubre el nuevo <strong>Club BabyStore</strong> y gana descuentos gratis!</p>
          </div>
        )}
      </div>

      <DropdownMenuContent className="w-80 border-border/40 bg-zinc-950/95 backdrop-blur-xl p-0 overflow-hidden shadow-2xl" align="end">
        <div className="bg-gradient-to-br from-indigo-950 via-purple-900 to-indigo-900 p-6 relative overflow-hidden">
          {/* Decorative */}
          <div className="absolute top-0 right-0 w-32 h-32 bg-fuchsia-500 rounded-full blur-[60px] opacity-30"></div>
          
          <div className="relative z-10">
            <h3 className="text-white/80 font-medium flex items-center gap-2 mb-1">
              <Star className="w-4 h-4 text-amber-400" />
              Club BabyStore
            </h3>
            <div className="flex items-end gap-2 mb-4">
              <span className="text-4xl font-black text-white tracking-tighter">{points}</span>
              <span className="text-purple-200 text-sm mb-1">PTS</span>
            </div>

            <div className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full ${levelBg} border border-white/10`}>
              <Crown className={`w-4 h-4 ${levelColor}`} />
              <span className={`text-sm font-bold ${levelColor}`}>Socio {level}</span>
            </div>
          </div>
        </div>

        <div className="p-5">
          {level !== "Oro" ? (
            <div className="mb-4">
              <div className="flex justify-between text-xs text-muted-foreground mb-2">
                <span>Progreso hacia el siguiente nivel</span>
                <span>{nextLevelPoints - points} pts restantes</span>
              </div>
              <div className="h-2 bg-muted rounded-full overflow-hidden">
                <div 
                  className="h-full bg-gradient-to-r from-amber-500 to-yellow-400 rounded-full transition-all duration-1000 ease-out"
                  style={{ width: `${Math.min(100, progressPercent)}%` }}
                />
              </div>
            </div>
          ) : (
            <div className="mb-4 flex items-center gap-3 p-3 bg-yellow-400/10 rounded-lg border border-yellow-400/20">
              <Sparkles className="w-5 h-5 text-yellow-400 shrink-0" />
              <p className="text-xs text-yellow-200/90 leading-tight">
                ¡Has alcanzado el nivel máximo! Disfruta de beneficios VIP exclusivos.
              </p>
            </div>
          )}

          <DropdownMenuSeparator className="my-3 opacity-50" />

          <div className="space-y-3">
            <div className="flex gap-3">
              <div className="p-2 bg-primary/10 rounded-md shrink-0 h-min">
                <TrendingUp className="w-4 h-4 text-primary" />
              </div>
              <div>
                <p className="text-sm font-medium">Gana puntos comprando</p>
                <p className="text-xs text-muted-foreground mt-0.5">Recibirás 5 puntos por cada 1€ gastado en la tienda.</p>
              </div>
            </div>
            
            <div className="flex gap-3">
              <div className="p-2 bg-pink-500/10 rounded-md shrink-0 h-min">
                <Sparkles className="w-4 h-4 text-pink-400" />
              </div>
              <div>
                <p className="text-sm font-medium">Canjea por descuentos</p>
                <p className="text-xs text-muted-foreground mt-0.5">Puedes descontar de tu pedido usando puntos (100 = 1€ max 5€).</p>
              </div>
            </div>

            <div className="flex gap-3">
              <div className="p-2 bg-amber-500/10 rounded-md shrink-0 h-min">
                <Crown className="w-4 h-4 text-amber-500" />
              </div>
              <div>
                <p className="text-sm font-medium">Descuento VIP (cada 2 compras)</p>
                <p className="text-xs text-muted-foreground mt-0.5">Si eres Plata ahorras 10% y si eres Oro un 15% extra automáticamente.</p>
              </div>
            </div>
          </div>
        </div>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
