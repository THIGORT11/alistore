import assert from 'node:assert/strict';
import test from 'node:test';
import { productSchema } from '../src/content/schema.ts';
import {
  canAddProduct,
  getCartQuantityForProduct,
  getProductStockLabel,
  getStockValidationError,
  hasNewProductTag,
  isProductOutOfStock,
} from '../src/lib/product-stock.ts';

const product = (overrides = {}) => ({
  id: 'producto',
  name: 'Producto',
  description: '',
  price: 10,
  images: ['https://i.imgur.com/example.png'],
  categoryId: 'categoria',
  tags: [],
  aiHint: '',
  availability: 'available',
  featured: false,
  active: true,
  sortOrder: 10,
  ...overrides,
});

test('presenta únicamente cantidades de stock controlado', () => {
  assert.equal(getProductStockLabel(product()), null);
  assert.equal(getProductStockLabel(product({ stock: 1 })), 'Queda 1 unidad');
  assert.equal(getProductStockLabel(product({ stock: 3 })), 'Quedan 3 unidades');
  assert.equal(getProductStockLabel(product({ availability: 'out_of_stock', stock: 0 })), 'Agotado');
  assert.equal(isProductOutOfStock(product({ availability: 'out_of_stock' })), true);
});

test('nuevo y destacado son estados independientes', () => {
  assert.equal(hasNewProductTag(product({ tags: ['regalo', 'nuevo'] })), true);
  assert.equal(hasNewProductTag(product({ featured: true })), false);
  assert.equal(product({ featured: true, tags: ['nuevo'] }).featured, true);
});

test('limita el total de líneas personalizadas por producto físico', () => {
  const lines = [
    { ...product({ id: 'producto-rojo', stock: 3 }), inventoryProductId: 'producto', quantity: 1 },
    { ...product({ id: 'producto-azul', stock: 3 }), inventoryProductId: 'producto', quantity: 1 },
  ];
  const catalogProduct = product({ stock: 3, customization: { options: [] } });

  assert.equal(getCartQuantityForProduct(lines, 'producto'), 2);
  assert.equal(canAddProduct(catalogProduct, 2), true);
  assert.equal(canAddProduct(catalogProduct, 3), false);
  assert.equal(getStockValidationError([...lines, { ...lines[0], quantity: 2 }], [catalogProduct]), 'La cantidad solicitada de Producto supera el stock disponible.');
});

test('rechaza combinaciones incoherentes y normaliza stock null', () => {
  assert.equal(productSchema.safeParse(product({ stock: null })).success, true);
  assert.equal(productSchema.safeParse(product({ stock: 0 })).success, false);
  assert.equal(productSchema.safeParse(product({ availability: 'out_of_stock', stock: 2 })).success, false);
  assert.equal(productSchema.safeParse(product({ availability: 'out_of_stock', stock: 0 })).success, true);
});
