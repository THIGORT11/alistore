'use client';

import Image from 'next/image';
import type { Product } from '@/content/catalog';
import { storeConfig } from '@/content/store';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Heart, ShoppingCart } from 'lucide-react';
import { useWishlist } from '@/context/WishlistContext';
import { useCart } from '@/context/CartContext';
import { cn } from '@/lib/utils';
import { getProductPricing } from '@/lib/product-pricing';
import { getProductStockLabel, hasNewProductTag, isProductOutOfStock } from '@/lib/product-stock';
import ProductCustomizationDialog from './ProductCustomizationDialog';

interface ProductCardProps {
  product: Product;
}

export default function ProductCard({ product }: ProductCardProps) {
  const { isInWishlist, addToWishlist, removeFromWishlist } = useWishlist();
  const { addToCart, canAddToCart } = useCart();
  const isWishlisted = isInWishlist(product.id);
  const isOutOfStock = isProductOutOfStock(product);
  const hasNewTag = hasNewProductTag(product);
  const stockLabel = getProductStockLabel(product);
  const isAtStockLimit = !isOutOfStock && !canAddToCart(product);
  const pricing = getProductPricing(product);

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
        {(product.featured || hasNewTag) && (
          <div className="absolute top-2 left-2 z-10 flex flex-col items-start gap-1 pointer-events-none">
            {product.featured ? (
              <span className="rounded-md bg-red-600 px-2 py-1 text-xs font-bold text-white shadow-sm">
                {storeConfig.catalog.featuredBadgeLabel}
              </span>
            ) : null}
            {hasNewTag ? (
              <span className="rounded-md bg-primary px-2 py-1 text-xs font-bold text-primary-foreground shadow-sm">
                {storeConfig.catalog.newBadgeLabel}
              </span>
            ) : null}
          </div>
        )}
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
        <div className="pt-4 flex flex-wrap items-baseline gap-x-2 gap-y-1">
          {product.originalPrice !== undefined && (
            <span className="text-sm text-muted-foreground line-through decoration-1">
              {storeConfig.currency.symbol}{pricing.basePrice.toFixed(2)}
            </span>
          )}
          <span className="text-xl font-semibold text-primary">
            {storeConfig.currency.symbol}{pricing.currentPrice.toFixed(2)}
          </span>
          {pricing.discountPercentage !== undefined && (
            <span className="rounded-full bg-primary/10 px-2 py-0.5 text-xs font-semibold text-primary" aria-label={`${pricing.discountPercentage}% de descuento`}>
              −{pricing.discountPercentage}%
            </span>
          )}
        </div>
        {stockLabel ? (
          <p className={`mt-2 text-sm font-medium ${isOutOfStock ? 'text-destructive' : 'text-muted-foreground'}`}>
            {stockLabel}
          </p>
        ) : null}
      </CardContent>
      <CardFooter className="p-4 pt-0">
        {isOutOfStock ? (
          <Button disabled className="w-full">
            Agotado
          </Button>
        ) : product.customization ? (
          <ProductCustomizationDialog product={product}>
            <Button className="w-full" disabled={isAtStockLimit}>
              <ShoppingCart className="mr-2 h-4 w-4" />
              {isAtStockLimit ? 'Máximo en el carrito' : 'Añadir al carrito'}
            </Button>
          </ProductCustomizationDialog>
        ) : (
          <Button onClick={() => addToCart(product)} className="w-full" disabled={isAtStockLimit}>
            <ShoppingCart className="mr-2 h-4 w-4" />
            {isAtStockLimit ? 'Máximo en el carrito' : 'Añadir al carrito'}
          </Button>
        )}
      </CardFooter>
    </Card>
  );
}
