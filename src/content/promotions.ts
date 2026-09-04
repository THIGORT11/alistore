import rawPromotions from './promotions.json';
import { promotionsSchema } from './schema';
import { loyaltyLevels } from './store';
import { assertUnique } from './validation';

export const promotionConfig = promotionsSchema.parse(rawPromotions);

assertUnique(promotionConfig.discounts.map((discount) => discount.id), 'IDs de descuento');
assertUnique(promotionConfig.coupons.map((coupon) => coupon.id), 'IDs de cupón');
assertUnique(
  promotionConfig.coupons.map((coupon) => coupon.code.trim().replace(/\s+/g, ' ').toUpperCase()),
  'Códigos de cupón',
);
assertUnique(promotionConfig.banners.map((banner) => banner.id), 'IDs de banner');

const loyaltyLevelIds = new Set(loyaltyLevels.map((level) => level.id));
for (const discount of promotionConfig.discounts) {
  for (const level of discount.loyaltyLevels ?? []) {
    if (!loyaltyLevelIds.has(level)) {
      throw new Error(`El descuento ${discount.id} referencia el nivel inexistente ${level}`);
    }
  }
}

export type { AutomaticDiscount, Banner, Coupon } from './schema';
