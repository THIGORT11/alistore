"use client";

import { useState } from "react";
import type { Product } from "@/data/products";
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

interface LilySweetyDialogProps {
  product: Product;
  children: React.ReactNode;
}

export default function LilySweetyDialog({ product, children }: LilySweetyDialogProps) {
  const [open, setOpen] = useState(false);
  const [withHairstyle, setWithHairstyle] = useState(false);
  const [withAccessories, setWithAccessories] = useState(false);
  const { addToCart } = useCart();

  const handleAddToCart = () => {
    let finalPrice = product.price;
    let finalName = product.name;
    const additions = [];

    if (withHairstyle) {
      finalPrice += 2;
      additions.push("con peinado");
    }
    if (withAccessories) {
      finalPrice += 5;
      additions.push("con accesorios");
    }

    if (additions.length > 0) {
      finalName = `${product.name} (${additions.join(" y ")})`;
    }
    
    const cartItemId = `${product.id}${withHairstyle ? '-h' : ''}${withAccessories ? '-a' : ''}`;

    const productWithOptions = {
      ...product,
      id: cartItemId,
      name: finalName,
      price: finalPrice,
    };

    addToCart(productWithOptions);
    setOpen(false);
    setWithHairstyle(false);
    setWithAccessories(false);
  };

  const handleOpenChange = (isOpen: boolean) => {
    setOpen(isOpen);
    if (!isOpen) {
        setWithHairstyle(false);
        setWithAccessories(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Personaliza tu {product.name}</DialogTitle>
          <DialogDescription>
            Añade extras a tu muñeca para hacerla aún más especial.
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="flex items-center space-x-2">
            <Checkbox 
              id="hairstyle" 
              checked={withHairstyle}
              onCheckedChange={(checked) => setWithHairstyle(!!checked)}
            />
            <Label htmlFor="hairstyle" className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
              Cottom doll peinado (+2$)
            </Label>
          </div>
          <div className="flex items-center space-x-2">
            <Checkbox 
              id="accessories" 
              checked={withAccessories}
              onCheckedChange={(checked) => setWithAccessories(!!checked)}
            />
            <Label htmlFor="accessories" className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
              Cottom doll y accesorios (+5$)
            </Label>
          </div>
          <div className="mt-4 p-3 bg-muted/50 rounded-lg">
            <p className="font-semibold text-sm">Si marcas la casilla cottom doll y accesorios obtendrás esto:</p>
            <ul className="list-disc list-inside text-sm text-muted-foreground mt-2 space-y-1">
                <li>1 Taba squissy</li>
                <li>1 biberon y camara</li>
                <li>1 peine cottom doll</li>
                <li>1 certificado cottom doll</li>
            </ul>
            <p className="font-bold text-sm mt-2">¡Y cinco accesorios sorpresa!</p>
          </div>
        </div>
        <DialogFooter>
          <Button onClick={handleAddToCart}>
             <ShoppingCart className="mr-2 h-4 w-4" />
            Añadir al carrito
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
