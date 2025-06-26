'use client';

import { useState, useMemo } from 'react';
import { products } from '@/data/products';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import ProductCard from '@/components/ProductCard';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Search, WandSparkles } from 'lucide-react';
import VisualSearchDialog from '@/components/VisualSearchDialog';
import PersonalizedRecommendationsDialog from '@/components/PersonalizedRecommendationsDialog';

export default function Home() {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('Todos');

  const featuredItems = useMemo(
    () => products.filter(p => p.tags.includes('popular')).slice(0, 4),
    []
  );
  
  const newArrivals = useMemo(
    () => products.filter(p => p.tags.includes('new-arrival')).slice(0, 8),
    []
  );

  const categories = useMemo(() => {
    const allCategories = products.map(p => p.category);
    return ['Todos', ...Array.from(new Set(allCategories))];
  }, []);

  const filteredProducts = useMemo(() => {
    return products.filter(product => {
      const matchesCategory = selectedCategory === 'Todos' || product.category === selectedCategory;
      const matchesSearch = product.name.toLowerCase().includes(searchTerm.toLowerCase());
      return matchesCategory && matchesSearch;
    });
  }, [searchTerm, selectedCategory]);

  return (
    <div className="flex flex-col min-h-screen">
      <Header />
      <main className="flex-grow container mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <section className="text-center py-12 md:py-20 animate-fade-in-down">
          <h1 className="text-4xl md:text-6xl font-bold font-headline tracking-tight text-primary-foreground">
            Descubre Tu Próxima Obsesión
          </h1>
          <p className="mt-4 max-w-2xl mx-auto text-lg text-muted-foreground">
            Alistore es tu destino principal para coleccionables de alta calidad, seleccionados de todo el mundo.
          </p>
          <div className="mt-8 flex flex-col sm:flex-row gap-4 justify-center">
            <VisualSearchDialog />
            <PersonalizedRecommendationsDialog />
          </div>
        </section>

        <section id="featured" className="py-12">
          <h2 className="text-3xl font-bold text-center mb-8 font-headline">
            Artículos Destacados
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {featuredItems.map(product => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        </section>

        <section id="all-products" className="py-12">
          <div className="flex flex-col md:flex-row justify-between items-center mb-8 gap-4">
            <h2 className="text-3xl font-bold font-headline">
              Todos los Coleccionables
            </h2>
            <div className="relative w-full md:w-1/3">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" size={20} />
              <Input
                type="text"
                placeholder="Buscar coleccionables..."
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>

          <div className="flex flex-wrap justify-center gap-2 mb-8">
            {categories.map(category => (
              <Button
                key={category}
                variant={selectedCategory === category ? 'default' : 'outline'}
                onClick={() => setSelectedCategory(category)}
              >
                {category}
              </Button>
            ))}
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {filteredProducts.map(product => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        </section>

        <section id="new-arrivals" className="py-12">
          <h2 className="text-3xl font-bold text-center mb-8 font-headline">
            Novedades
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {newArrivals.map(product => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
}
