'use client';

import { useMemo } from 'react';
import { useWishlist } from '@/context/WishlistContext';
import { useAuth } from '@/context/AuthContext';
import { products } from '@/content/catalog';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import ProductCard from '@/components/ProductCard';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { Heart } from 'lucide-react';

export default function WishlistPage() {
  const { user, loading } = useAuth();
  const { wishlist } = useWishlist();

  const wishlistedProducts = useMemo(() => {
    return products.filter(product => wishlist.includes(product.id));
  }, [wishlist]);

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <p>Cargando...</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-screen">
      <Header />
      <main className="flex-grow container mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex items-center mb-8">
          <Heart className="w-8 h-8 mr-4 text-primary" />
          <h1 className="text-4xl font-bold font-headline">Mi Lista de Deseos</h1>
        </div>
        
        {!user ? (
          <div className="text-center py-20">
            <h2 className="text-2xl font-semibold mb-4">Por favor, inicia sesión para ver tu lista de deseos.</h2>
            <p className="text-muted-foreground mb-6">Crea una cuenta o inicia sesión para guardar tus artículos favoritos.</p>
            <div className="flex justify-center gap-4">
              <Button asChild>
                <Link href="/login">Iniciar Sesión</Link>
              </Button>
              <Button variant="outline" asChild>
                <Link href="/signup">Registrarse</Link>
              </Button>
            </div>
          </div>
        ) : wishlistedProducts.length === 0 ? (
          <div className="text-center py-20">
            <h2 className="text-2xl font-semibold mb-4">Tu lista de deseos está vacía.</h2>
            <p className="text-muted-foreground mb-6">Explora nuestras colecciones para encontrar algo que te encante.</p>
            <Button asChild>
              <Link href="/">Comenzar a Comprar</Link>
            </Button>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {wishlistedProducts.map(product => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        )}
      </main>
      <Footer />
    </div>
  );
}
