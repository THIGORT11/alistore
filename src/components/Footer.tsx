import Image from 'next/image';
import Link from 'next/link';
import { storeConfig } from '@/content/store';

export default function Footer() {
  return (
    <footer className="border-t">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8 flex flex-col sm:flex-row items-center justify-between">
        <div className="flex items-center space-x-2">
          <Image src={storeConfig.brand.logoUrl} alt={`${storeConfig.brand.displayName} Logo`} width={24} height={24} className="h-6 w-6" />
          <span className="font-bold text-lg">{storeConfig.footer.companyName}</span>
        </div>
        <p className="text-sm text-muted-foreground mt-4 sm:mt-0 flex-1 text-center">
          © {new Date().getFullYear()} {storeConfig.footer.companyName}, {storeConfig.footer.copyrightSuffix}
        </p>
        <div className="flex space-x-4 mt-4 sm:mt-0">
          {[...storeConfig.footer.socialLinks]
            .sort((a, b) => a.sortOrder - b.sortOrder)
            .map((link) => (
              <Link key={link.id} href={link.href} className="text-muted-foreground hover:text-primary">
                {link.label}
              </Link>
            ))}
        </div>
      </div>
    </footer>
  );
}
