import type { Metadata } from 'next';
import './globals.css';
import { Toaster } from '@/components/ui/toaster';
import { AuthProvider } from '@/context/AuthContext';
import { WishlistProvider } from '@/context/WishlistContext';
import { CartProvider } from '@/context/CartContext';
import { LoyaltyProvider } from '@/context/LoyaltyContext';
import { storeConfig } from '@/content/store';

export const metadata: Metadata = {
  title: storeConfig.metadata.title,
  description: storeConfig.metadata.description,
  icons: {
    icon: storeConfig.brand.faviconUrl,
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es" className="dark">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="font-body antialiased bg-background">
        <AuthProvider>
          <WishlistProvider>
            <CartProvider>
              <LoyaltyProvider>
                {children}
                <Toaster />
              </LoyaltyProvider>
            </CartProvider>
          </WishlistProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
