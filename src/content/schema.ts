import { z } from 'zod';

const idSchema = z.string().min(1).regex(/^[a-z0-9][a-z0-9-]*$/);
const imageUrlSchema = z.string().url().refine((value) => {
  const hostname = new URL(value).hostname;
  return hostname === 'i.imgur.com' || hostname === 'placehold.co';
}, 'La imagen debe estar alojada en i.imgur.com o placehold.co');

const sortOrderSchema = z.number().int().nonnegative();

const customizationOptionSchema = z.object({
  id: idSchema,
  label: z.string().min(1),
  priceDelta: z.number().nonnegative(),
  nameSuffix: z.string().min(1),
  cartSuffix: z.string().min(1),
});

export const categorySchema = z.object({
  id: idSchema,
  name: z.string().min(1),
  active: z.boolean(),
  sortOrder: sortOrderSchema,
});

export const productSchema = z.object({
  id: z.string().min(1),
  name: z.string().min(1),
  description: z.string(),
  price: z.number().nonnegative(),
  originalPrice: z.number().positive().optional(),
  images: z.array(imageUrlSchema).min(1),
  categoryId: idSchema,
  tags: z.array(z.string().min(1)),
  aiHint: z.string(),
  availability: z.enum(['available', 'out_of_stock']),
  stock: z.number().int().nonnegative().optional(),
  featured: z.boolean(),
  active: z.boolean(),
  sortOrder: sortOrderSchema,
  customization: z.object({
    dialogDescription: z.string().min(1),
    options: z.array(customizationOptionSchema).min(1),
    information: z.object({
      heading: z.string().min(1),
      items: z.array(z.string().min(1)),
      footer: z.string().min(1),
    }),
  }).optional(),
}).refine((product) => product.originalPrice === undefined || product.originalPrice >= product.price, {
  message: 'originalPrice no puede ser inferior a price',
  path: ['originalPrice'],
});

export const catalogSchema = z.object({
  schemaVersion: z.literal(1),
  categories: z.array(categorySchema),
  products: z.array(productSchema),
});

const discountFields = {
  id: idSchema,
  name: z.string().min(1),
  active: z.boolean(),
  discountType: z.enum(['percentage', 'fixed']),
  discountValue: z.number().positive(),
  sortOrder: sortOrderSchema,
};

export const automaticDiscountSchema = z.object({
  ...discountFields,
  displayLabel: z.string().min(1),
  appliesTo: z.literal('order'),
  loyaltyLevels: z.array(z.string().min(1)).optional(),
  everyNthPurchase: z.number().int().positive().optional(),
  minimumSubtotal: z.number().nonnegative().optional(),
  startsAt: z.string().datetime({ offset: true }).optional(),
  endsAt: z.string().datetime({ offset: true }).optional(),
  stackable: z.boolean(),
}).refine(
  (discount) => discount.discountType !== 'percentage' || discount.discountValue <= 100,
  { message: 'Un porcentaje no puede superar 100', path: ['discountValue'] },
).refine(
  (discount) => !discount.startsAt || !discount.endsAt || discount.startsAt < discount.endsAt,
  { message: 'endsAt debe ser posterior a startsAt', path: ['endsAt'] },
);

export const couponSchema = z.object({
  ...discountFields,
  code: z.string().trim().min(1),
  usageLimitPerDevice: z.number().int().positive().optional(),
  minimumSubtotal: z.number().nonnegative().optional(),
  startsAt: z.string().datetime({ offset: true }).optional(),
  endsAt: z.string().datetime({ offset: true }).optional(),
  legacyStorageKeys: z.array(z.string().min(1)).optional(),
}).refine(
  (coupon) => coupon.discountType !== 'percentage' || coupon.discountValue <= 100,
  { message: 'Un porcentaje no puede superar 100', path: ['discountValue'] },
).refine(
  (coupon) => !coupon.startsAt || !coupon.endsAt || coupon.startsAt < coupon.endsAt,
  { message: 'endsAt debe ser posterior a startsAt', path: ['endsAt'] },
);

export const bannerSchema = z.object({
  id: idSchema,
  placement: z.enum(['catalog-top']),
  title: z.string().min(1),
  body: z.string(),
  imageUrl: imageUrlSchema.optional(),
  linkLabel: z.string().min(1).optional(),
  linkHref: z.string().min(1).refine(
    (value) => value.startsWith('/') || value.startsWith('https://'),
    'El enlace debe ser una ruta interna o una URL HTTPS',
  ).optional(),
  active: z.boolean(),
  startsAt: z.string().datetime({ offset: true }).optional(),
  endsAt: z.string().datetime({ offset: true }).optional(),
  sortOrder: sortOrderSchema,
}).refine((banner) => Boolean(banner.linkLabel) === Boolean(banner.linkHref), {
  message: 'linkLabel y linkHref deben definirse juntos',
});

export const promotionsSchema = z.object({
  schemaVersion: z.literal(1),
  discounts: z.array(automaticDiscountSchema),
  coupons: z.array(couponSchema),
  banners: z.array(bannerSchema),
});

const loyaltyLevelSchema = z.object({
  id: z.string().min(1),
  minimumPoints: z.number().int().nonnegative(),
  sortOrder: sortOrderSchema,
});

export const storeSchema = z.object({
  schemaVersion: z.literal(1),
  brand: z.object({
    name: z.string().min(1),
    displayName: z.string().min(1),
    logoUrl: imageUrlSchema,
    faviconUrl: imageUrlSchema,
  }),
  metadata: z.object({
    title: z.string().min(1),
    description: z.string().min(1),
  }),
  catalog: z.object({
    heading: z.string().min(1),
    searchPlaceholder: z.string().min(1),
    allCategoriesLabel: z.string().min(1),
    newBadgeLabel: z.string().min(1),
    featuredBadgeLabel: z.string().min(1),
  }),
  footer: z.object({
    companyName: z.string().min(1),
    copyrightSuffix: z.string().min(1),
    socialLinks: z.array(z.object({
      id: idSchema,
      label: z.string().min(1),
      href: z.string().min(1),
      sortOrder: sortOrderSchema,
    })),
  }),
  orders: z.object({
    adminEmail: z.string().email(),
  }),
  currency: z.object({
    code: z.string().length(3),
    symbol: z.string().min(1),
  }),
  loyalty: z.object({
    name: z.string().min(1),
    tooltip: z.object({
      prefix: z.string(),
      highlightedText: z.string().min(1),
      suffix: z.string(),
    }),
    pointsPerEuro: z.number().int().positive(),
    pointsPerCurrencyUnit: z.number().int().positive(),
    minimumRedeemPoints: z.number().int().positive(),
    maximumRedeemPoints: z.number().int().positive(),
    levels: z.array(loyaltyLevelSchema).min(1),
    copy: z.object({
      earnTitle: z.string().min(1),
      earnDescription: z.string().min(1),
      redeemTitle: z.string().min(1),
      redeemDescription: z.string().min(1),
      vipTitle: z.string().min(1),
      vipDescription: z.string().min(1),
      maximumLevelMessage: z.string().min(1),
    }),
  }),
});

export type Category = z.infer<typeof categorySchema>;
export type Product = z.infer<typeof productSchema>;
export type Coupon = z.infer<typeof couponSchema>;
export type AutomaticDiscount = z.infer<typeof automaticDiscountSchema>;
export type Banner = z.infer<typeof bannerSchema>;
