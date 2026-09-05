"use client";

import { useState } from "react";
import type { Product } from "@/content/catalog";
import { useCart } from "@/context/CartContext";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from "@/components/ui/dialog";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { ShoppingCart } from "lucide-react";

interface ProductCustomizationDialogProps {
  product: Product;
  children: React.ReactNode;
}

export default function ProductCustomizationDialog({ product, children }: ProductCustomizationDialogProps) {
  const [open, setOpen] = useState(false);
  const [selectedOptions, setSelectedOptions] = useState<string[]>([]);
  const { addToCart, canAddToCart } = useCart();
  const customization = product.customization;

  if (!customization) return children;

  const handleAddToCart = () => {
    const chosenOptions = customization.options.filter((option) => selectedOptions.includes(option.id));
    const additions = chosenOptions.map((option) => option.nameSuffix);
    const priceDelta = chosenOptions.reduce((total, option) => total + option.priceDelta, 0);

    addToCart({
      ...product,
      id: `${product.id}${chosenOptions.map((option) => option.cartSuffix).join("")}`,
      name: additions.length > 0 ? `${product.name} (${additions.join(" y ")})` : product.name,
      price: product.price + priceDelta,
      originalPrice: product.originalPrice === undefined ? undefined : product.originalPrice + priceDelta,
    }, product.id);
    setOpen(false);
    setSelectedOptions([]);
  };

  const handleOpenChange = (isOpen: boolean) => {
    setOpen(isOpen);
    if (!isOpen) setSelectedOptions([]);
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Personaliza tu {product.name}</DialogTitle>
          <DialogDescription>{customization.dialogDescription}</DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          {customization.options.map((option) => (
            <div key={option.id} className="flex items-center space-x-2">
              <Checkbox
                id={`${product.id}-${option.id}`}
                checked={selectedOptions.includes(option.id)}
                onCheckedChange={(checked) => setSelectedOptions((current) =>
                  checked
                    ? [...current, option.id]
                    : current.filter((optionId) => optionId !== option.id)
                )}
              />
              <Label htmlFor={`${product.id}-${option.id}`} className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                {option.label}
              </Label>
            </div>
          ))}
          <div className="mt-4 p-3 bg-muted/50 rounded-lg">
            <p className="font-semibold text-sm">{customization.information.heading}</p>
            <ul className="list-disc list-inside text-sm text-muted-foreground mt-2 space-y-1">
              {customization.information.items.map((item) => <li key={item}>{item}</li>)}
            </ul>
            <p className="font-bold text-sm mt-2">{customization.information.footer}</p>
          </div>
        </div>
        <DialogFooter>
          <Button onClick={handleAddToCart} disabled={!canAddToCart(product)}>
            <ShoppingCart className="mr-2 h-4 w-4" />
            {canAddToCart(product) ? 'Añadir al carrito' : 'Máximo en el carrito'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
