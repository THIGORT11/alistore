import assert from 'node:assert/strict';
import test from 'node:test';
import { getProductPricing } from '../src/lib/product-pricing.ts';

test('renderiza un producto normal con un único precio', () => {
  assert.deepEqual(getProductPricing({ price: 29.99 }), {
    basePrice: 29.99,
    currentPrice: 29.99,
  });
});

test('calcula la presentación de un producto rebajado', () => {
  assert.deepEqual(getProductPricing({ price: 24.99, originalPrice: 29.99 }), {
    basePrice: 29.99,
    currentPrice: 24.99,
    savings: 5,
    discountPercentage: 17,
  });
});
