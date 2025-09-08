"use client";

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
import { ShoppingCart, Trash2, Plus, Minus } from "lucide-react";
import CheckoutDialog from "./CheckoutDialog";

export default function CartSheet() {
  const { cart, removeFromCart, updateQuantity, cartCount, cartTotal } = useCart();

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
                {cart.map((item) => (
                  <div key={item.id} className="flex items-center gap-4 py-4">
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
                        <p className="text-sm font-semibold">${item.price.toFixed(2)}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </ScrollArea>
            <SheetFooter className="mt-auto pt-4 border-t">
                <div className="w-full space-y-4">
                    <div className="flex justify-between font-bold text-lg">
                        <span>Total:</span>
                        <span>${cartTotal.toFixed(2)}</span>
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
