import type { Product } from '@/content/catalog';

export type StockCartLine = Pick<Product, 'id' | 'availability' | 'stock'> & {
  inventoryProductId?: string;
  quantity: number;
};

export function isProductOutOfStock(product: Pick<Product, 'availability' | 'stock'>) {
  return product.availability === 'out_of_stock' || product.stock === 0;
}

export function hasNewProductTag(product: Pick<Product, 'tags'>) {
  return product.tags.some((tag) => tag.trim().toLocaleLowerCase('es') === 'nuevo');
}

export function getProductStockLabel(product: Pick<Product, 'availability' | 'stock'>) {
  if (isProductOutOfStock(product)) return 'Agotado';
  if (product.stock === undefined) return null;
  return product.stock === 1 ? 'Queda 1 unidad' : `Quedan ${product.stock} unidades`;
}

export function getInventoryProductId(line: Pick<StockCartLine, 'id' | 'inventoryProductId'>) {
  return line.inventoryProductId ?? line.id;
}

export function getCartQuantityForProduct(lines: StockCartLine[], productId: string) {
  return lines.reduce(
    (quantity, line) => getInventoryProductId(line) === productId ? quantity + line.quantity : quantity,
    0,
  );
}

export function canAddProduct(
  product: Pick<Product, 'availability' | 'stock'>,
  quantityInCart: number,
) {
  return !isProductOutOfStock(product)
    && (product.stock === undefined || quantityInCart < product.stock);
}

export function getStockValidationError(
  lines: StockCartLine[],
  catalogProducts: Product[],
) {
  const productsById = new Map(catalogProducts.map((product) => [product.id, product]));
  const quantities = new Map<string, number>();

  for (const line of lines) {
    if (!Number.isInteger(line.quantity) || line.quantity <= 0) {
      return 'El carrito contiene una cantidad no válida.';
    }

    const requestedInventoryId = line.inventoryProductId;
    const requestedProduct = requestedInventoryId ? productsById.get(requestedInventoryId) : undefined;
    const exactProduct = productsById.get(line.id);
    const customizedProduct = catalogProducts
      .filter((product) => product.customization && line.id.startsWith(product.id))
      .sort((left, right) => right.id.length - left.id.length)[0];
    const productId = requestedProduct
      && (line.id === requestedProduct.id || (requestedProduct.customization && line.id.startsWith(requestedProduct.id)))
      ? requestedProduct.id
      : exactProduct?.id ?? customizedProduct?.id;

    if (!productId) return 'Uno de los productos del carrito ya no está disponible.';
    quantities.set(productId, (quantities.get(productId) ?? 0) + line.quantity);
  }

  for (const [productId, quantity] of quantities) {
    const product = productsById.get(productId);
    if (!product || isProductOutOfStock(product)) {
      return 'Uno de los productos del carrito ya no está disponible.';
    }
    if (product.stock !== undefined && quantity > product.stock) {
      return `La cantidad solicitada de ${product.name} supera el stock disponible.`;
    }
  }

  return null;
}
