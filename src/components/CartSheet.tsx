"use client";

import { useState } from "react";
import Image from "next/image";
import { useCart } from "@/context/CartContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
  SheetFooter,
} from "@/components/ui/sheet";
import { ShoppingCart, Trash2, Plus, Minus, Tag } from "lucide-react";
import CheckoutDialog from "./CheckoutDialog";
import { storeConfig } from "@/content/store";
import { promotionConfig } from "@/content/promotions";
import { findCoupon } from "@/lib/promotions";
import { getProductPricing } from "@/lib/product-pricing";

export default function CartSheet() {
  const [promoCode, setPromoCode] = useState("");
  const [promoMessage, setPromoMessage] = useState("");
  const {
    cart,
    removeFromCart,
    updateQuantity,
    cartCount,
    cartTotal,
    appliedCoupon,
    couponDiscount,
    totalAfterCoupon,
    hasRedeemableCoupons,
    applyCouponCode,
  } = useCart();

  const handleApplyPromo = () => {
    const matchingCoupon = findCoupon(promoCode);
    const result = applyCouponCode(promoCode);

    if (result === "applied" && matchingCoupon) {
      const discountDescription = matchingCoupon.discountType === "percentage"
        ? `${matchingCoupon.discountValue} %`
        : `${storeConfig.currency.symbol}${matchingCoupon.discountValue.toFixed(2)}`;
      setPromoMessage(`Código aplicado: tienes un ${discountDescription} de descuento.`);
      setPromoCode("");
    } else if (result === "used") {
      setPromoMessage("Este código ya se utilizó y solo puede canjearse una vez.");
    } else {
      setPromoMessage("El código introducido no es válido.");
    }
  };

  return (
    <Sheet>
      <SheetTrigger asChild>
        <Button variant="ghost" size="icon" aria-label="Carrito de compras">
          <div className="relative">
            <ShoppingCart />
            {cartCount > 0 && (
              <span className="absolute -top-2 -right-2 flex h-5 w-5 items-center justify-center rounded-full bg-primary text-xs text-primary-foreground">
                {cartCount}
              </span>
            )}
          </div>
        </Button>
      </SheetTrigger>
      <SheetContent className="flex flex-col w-full sm:max-w-md">
        <SheetHeader>
          <SheetTitle>Carrito de Compras ({cartCount})</SheetTitle>
        </SheetHeader>
        {cart.length === 0 ? (
          <div className="flex flex-1 items-center justify-center">
            <p className="text-muted-foreground">Tu carrito está vacío.</p>
          </div>
        ) : (
          <>
            <ScrollArea className="flex-1 -mx-6">
              <div className="px-6 divide-y divide-border">
                {cart.map((item) => {
                  const pricing = getProductPricing(item);

                  return <div key={item.id} className="flex items-center gap-4 py-4">
                    <Image
                      src={item.images[0]}
                      alt={item.name}
                      width={64}
                      height={64}
                      className="rounded-md object-contain aspect-square border"
                      data-ai-hint={item.aiHint}
                    />
                    <div className="flex-1 space-y-2">
                      <div className="flex justify-between items-start">
                        <p className="font-medium text-sm leading-tight">{item.name}</p>
                        <Button
                            variant="ghost"
                            size="icon"
                            className="h-6 w-6 shrink-0"
                            onClick={() => removeFromCart(item.id)}
                            >
                            <Trash2 className="h-4 w-4 text-destructive" />
                        </Button>
                      </div>
                      <div className="flex items-center justify-between">
                         <div className="flex items-center gap-2">
                            <Button
                            variant="outline"
                            size="icon"
                            className="h-7 w-7"
                            onClick={() => updateQuantity(item.id, item.quantity - 1)}
                            >
                            <Minus className="h-3.5 w-3.5" />
                            </Button>
                            <Input
                            type="number"
                            value={item.quantity}
                            className="w-12 h-7 text-center"
                            readOnly
                            />
                            <Button
                            variant="outline"
                            size="icon"
                            className="h-7 w-7"
                            onClick={() => updateQuantity(item.id, item.quantity + 1)}
                            >
                            <Plus className="h-3.5 w-3.5" />
                            </Button>
                        </div>
                        <div className="flex flex-wrap items-baseline justify-end gap-x-1.5">
                          {item.originalPrice !== undefined ? <span className="text-xs text-muted-foreground line-through">{storeConfig.currency.symbol}{pricing.basePrice.toFixed(2)}</span> : null}
                          <span className="text-sm font-semibold text-primary">{storeConfig.currency.symbol}{pricing.currentPrice.toFixed(2)}</span>
                        </div>
                      </div>
                    </div>
                  </div>;
                })}
              </div>
            </ScrollArea>
            <SheetFooter className="mt-auto pt-4 border-t">
                <div className="w-full space-y-4">
                    <div className="space-y-2">
                      <label htmlFor="promo-code" className="text-sm font-medium flex items-center gap-2">
                        <Tag className="h-4 w-4" />
                        Código de descuento
                      </label>
                      <div className="flex gap-2">
                        <Input
                          id="promo-code"
                          value={promoCode}
                          onChange={(event) => {
                            setPromoCode(event.target.value);
                            setPromoMessage("");
                          }}
                          onKeyDown={(event) => {
                            if (event.key === "Enter") {
                              event.preventDefault();
                              handleApplyPromo();
                            }
                          }}
                          placeholder="Introduce tu código"
                          disabled={Boolean(appliedCoupon) || !hasRedeemableCoupons}
                          aria-describedby="promo-message"
                        />
                        <Button
                          type="button"
                          variant="outline"
                          onClick={handleApplyPromo}
                          disabled={!promoCode.trim() || Boolean(appliedCoupon) || !hasRedeemableCoupons}
                        >
                          Canjear
                        </Button>
                      </div>
                      {(promoMessage || !hasRedeemableCoupons) && (
                        <p
                          id="promo-message"
                          className={`text-xs ${appliedCoupon ? "text-green-600" : "text-muted-foreground"}`}
                        >
                          {promoMessage || (promotionConfig.coupons.length === 1
                            ? `El código ${promotionConfig.coupons[0].code} ya se utilizó en este dispositivo.`
                            : "No quedan cupones disponibles para este dispositivo.")}
                        </p>
                      )}
                    </div>
                    {appliedCoupon && (
                      <div className="space-y-2 rounded-md border border-green-200 bg-green-50 p-3 text-sm dark:border-green-900 dark:bg-green-950/30">
                        <div className="flex justify-between text-muted-foreground">
                          <span>Subtotal</span>
                          <span>{storeConfig.currency.symbol}{cartTotal.toFixed(2)}</span>
                        </div>
                        <div className="flex justify-between font-medium text-green-700 dark:text-green-400">
                          <span>
                            {appliedCoupon.name} ({appliedCoupon.discountType === "percentage"
                              ? `${appliedCoupon.discountValue} %`
                              : `${storeConfig.currency.symbol}${appliedCoupon.discountValue.toFixed(2)}`})
                          </span>
                          <span>-{storeConfig.currency.symbol}{couponDiscount.toFixed(2)}</span>
                        </div>
                      </div>
                    )}
                    <div className="flex justify-between font-bold text-lg">
                        <span>Total:</span>
                        <span>{storeConfig.currency.symbol}{totalAfterCoupon.toFixed(2)}</span>
                    </div>
                    <CheckoutDialog />
                </div>
            </SheetFooter>
          </>
        )}
      </SheetContent>
    </Sheet>
  );
}
