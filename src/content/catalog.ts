import rawCatalog from './catalog.json';
import { catalogSchema } from './schema';
import { assertUnique } from './validation';

const catalogData = catalogSchema.parse(rawCatalog);

assertUnique(catalogData.categories.map((category) => category.id), 'IDs de categoría');
assertUnique(
  catalogData.categories.map((category) => category.name.trim().toLocaleLowerCase('es')),
  'Nombres de categoría',
);
assertUnique(catalogData.products.map((product) => product.id), 'IDs de producto');

const categoryIds = new Set(catalogData.categories.map((category) => category.id));
const activeCategoryIds = new Set(
  catalogData.categories.filter((category) => category.active).map((category) => category.id),
);

for (const product of catalogData.products) {
  if (!categoryIds.has(product.categoryId)) {
    throw new Error(`El producto ${product.id} referencia la categoría inexistente ${product.categoryId}`);
  }
}

export const categories = catalogData.categories
  .filter((category) => category.active)
  .sort((a, b) => a.sortOrder - b.sortOrder);

export const products = catalogData.products
  .filter((product) => product.active && activeCategoryIds.has(product.categoryId))
  .sort((a, b) => Number(b.featured) - Number(a.featured) || a.sortOrder - b.sortOrder);

export type { Category, Product } from './schema';
