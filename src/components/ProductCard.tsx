'use client';

import Image from 'next/image';
import type { Product } from '@/data/products';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Heart, ShoppingCart } from 'lucide-react';
import { useWishlist } from '@/context/WishlistContext';
import { useCart } from '@/context/CartContext';
import { cn } from '@/lib/utils';
import LilySweetyDialog from './LilySweetyDialog';

interface ProductCardProps {
  product: Product;
}

export default function ProductCard({ product }: ProductCardProps) {
  const { isInWishlist, addToWishlist, removeFromWishlist } = useWishlist();
  const { addToCart } = useCart();
  const isWishlisted = isInWishlist(product.id);

  const handleWishlistToggle = () => {
    if (isWishlisted) {
      removeFromWishlist(product.id);
    } else {
      addToWishlist(product.id);
    }
  };

  return (
    <Card className="flex flex-col overflow-hidden h-full transform transition-transform duration-300 hover:scale-105 hover:shadow-lg">
      <CardHeader className="p-0 relative">
        <div className="w-full aspect-[3/2] bg-card flex items-center justify-center">
            <Image
                src={product.images[0]}
                alt={product.name}
                width={600}
                height={400}
                className="object-contain w-full h-full"
                data-ai-hint={product.aiHint}
            />
        </div>
        <Button
          size="icon"
          variant="ghost"
          className="absolute top-2 right-2 bg-background/50 hover:bg-background/80 rounded-full"
          onClick={handleWishlistToggle}
          aria-label={isWishlisted ? "Quitar de la lista de deseos" : "Añadir a la lista de deseos"}
        >
          <Heart className={cn("text-primary", isWishlisted && "fill-current")} />
        </Button>
      </CardHeader>
      <CardContent className="flex-grow p-4 flex flex-col justify-between">
        <div>
          <CardTitle className="text-lg font-medium tracking-tight">
            {product.name}
          </CardTitle>
          {product.description && (
            <p className="mt-2 text-sm text-muted-foreground">
              {product.description}
            </p>
          )}
        </div>
        <p className="text-xl font-semibold text-primary pt-4">
          ${product.price.toFixed(2)}
        </p>
      </CardContent>
      <CardFooter className="p-4 pt-0">
        {product.id === '25' ? (
          <LilySweetyDialog product={product}>
            <Button className="w-full">
              <ShoppingCart className="mr-2 h-4 w-4" />
              Añadir al carrito
            </Button>
          </LilySweetyDialog>
        ) : (
          <Button onClick={() => addToCart(product)} className="w-full">
            <ShoppingCart className="mr-2 h-4 w-4" />
            Añadir al carrito
          </Button>
        )}
      </CardFooter>
    </Card>
  );
}
