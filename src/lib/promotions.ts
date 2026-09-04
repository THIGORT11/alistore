import { promotionConfig, type AutomaticDiscount, type Banner, type Coupon } from '@/content/promotions';

export function normalizeCouponCode(code: string) {
  return code.trim().replace(/\s+/g, ' ').toUpperCase();
}

export function isPromotionActive(
  promotion: { active: boolean; startsAt?: string; endsAt?: string },
  now = new Date(),
) {
  if (!promotion.active) return false;
  if (promotion.startsAt && now < new Date(promotion.startsAt)) return false;
  if (promotion.endsAt && now > new Date(promotion.endsAt)) return false;
  return true;
}

export function findCoupon(code: string): Coupon | undefined {
  const normalizedCode = normalizeCouponCode(code);
  return promotionConfig.coupons.find(
    (coupon) => isPromotionActive(coupon) && normalizeCouponCode(coupon.code) === normalizedCode,
  );
}

export function calculatePromotionAmount(
  subtotal: number,
  promotion: { discountType: 'percentage' | 'fixed'; discountValue: number },
) {
  const amount = promotion.discountType === 'percentage'
    ? subtotal * (promotion.discountValue / 100)
    : promotion.discountValue;
  return Math.min(subtotal, Math.max(0, amount));
}

export function getCouponStorageKey(coupon: Coupon) {
  return `babystore-coupon-${coupon.id}-redemptions`;
}

export function isCouponUsedOnDevice(coupon: Coupon) {
  if (!coupon.usageLimitPerDevice || typeof window === 'undefined') return false;

  const uses = Number.parseInt(localStorage.getItem(getCouponStorageKey(coupon)) ?? '0', 10);
  const legacyUse = (coupon.legacyStorageKeys ?? []).some(
    (key) => localStorage.getItem(key) === 'true',
  );
  return legacyUse || uses >= coupon.usageLimitPerDevice;
}

export function recordCouponUse(coupon: Coupon) {
  if (!coupon.usageLimitPerDevice || typeof window === 'undefined') return;
  const storageKey = getCouponStorageKey(coupon);
  const uses = Number.parseInt(localStorage.getItem(storageKey) ?? '0', 10);
  localStorage.setItem(storageKey, String(uses + 1));
}

export function getApplicableOrderDiscounts(
  subtotal: number,
  loyaltyLevel: string,
  nextPurchaseNumber: number,
): AutomaticDiscount[] {
  const eligibleDiscounts = [...promotionConfig.discounts]
    .filter((discount) => {
      if (!isPromotionActive(discount) || discount.appliesTo !== 'order') return false;
      if (discount.minimumSubtotal !== undefined && subtotal < discount.minimumSubtotal) return false;
      if (discount.loyaltyLevels && !discount.loyaltyLevels.includes(loyaltyLevel)) return false;
      if (discount.everyNthPurchase && nextPurchaseNumber % discount.everyNthPurchase !== 0) return false;
      return true;
    })
    .sort((a, b) => a.sortOrder - b.sortOrder);

  return eligibleDiscounts.reduce<AutomaticDiscount[]>((selected, discount) => {
    if (selected.length === 0) return [discount];
    if (discount.stackable && selected.every((item) => item.stackable)) {
      return [...selected, discount];
    }
    return selected;
  }, []);
}

export function getActiveBanners(placement: Banner['placement'], now = new Date()) {
  return promotionConfig.banners
    .filter((banner) => banner.placement === placement && isPromotionActive(banner, now))
    .sort((a, b) => a.sortOrder - b.sortOrder);
}
