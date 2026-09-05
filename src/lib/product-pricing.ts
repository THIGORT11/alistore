import type { Product } from '@/content/catalog';

export function getProductPricing(product: Pick<Product, 'price' | 'originalPrice'>) {
  if (product.originalPrice === undefined) {
    return { basePrice: product.price, currentPrice: product.price };
  }
  const savings = Math.round((product.originalPrice - product.price + Number.EPSILON) * 100) / 100;
  return {
    basePrice: product.originalPrice,
    currentPrice: product.price,
    savings,
    discountPercentage: Math.round((savings / product.originalPrice) * 100),
  };
}
