import Image from 'next/image';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { getActiveBanners } from '@/lib/promotions';
import type { Banner } from '@/content/promotions';

export default function CommercialBanners({ placement }: { placement: Banner['placement'] }) {
  const banners = getActiveBanners(placement);
  if (banners.length === 0) return null;

  return (
    <section className="space-y-4 pt-8" aria-label="Promociones">
      {banners.map((banner) => (
        <div key={banner.id} className="relative overflow-hidden rounded-xl border bg-card p-6 md:p-8">
          {banner.imageUrl && (
            <Image
              src={banner.imageUrl}
              alt=""
              fill
              className="object-cover opacity-20"
              sizes="(max-width: 1280px) 100vw, 1280px"
            />
          )}
          <div className="relative max-w-2xl">
            <h2 className="text-2xl font-bold">{banner.title}</h2>
            {banner.body && <p className="mt-2 text-muted-foreground">{banner.body}</p>}
            {banner.linkLabel && banner.linkHref && (
              <Button asChild className="mt-4">
                <Link href={banner.linkHref}>{banner.linkLabel}</Link>
              </Button>
            )}
          </div>
        </div>
      ))}
    </section>
  );
}
