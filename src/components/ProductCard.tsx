'use client';

import Image from 'next/image';
import type { Product } from '@/data/products';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Heart } from 'lucide-react';
import { useWishlist } from '@/context/WishlistContext';
import { cn } from '@/lib/utils';

interface ProductCardProps {
  product: Product;
}

export default function ProductCard({ product }: ProductCardProps) {
  const { isInWishlist, addToWishlist, removeFromWishlist } = useWishlist();
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
        <Image
          src={product.images[0]}
          alt={product.name}
          width={600}
          height={400}
          className="object-cover w-full aspect-[3/2]"
          data-ai-hint={product.aiHint}
        />
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
      <CardContent className="flex-grow p-4">
        <CardTitle className="text-lg font-medium tracking-tight">
          {product.name}
        </CardTitle>
      </CardContent>
      <CardFooter className="p-4 pt-0">
        <p className="text-xl font-semibold text-primary-foreground">
          ${product.price.toFixed(2)}
        </p>
      </CardFooter>
    </Card>
  );
}
