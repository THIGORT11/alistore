'use client';

import { useState, useMemo } from 'react';
import { products } from '@/data/products';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import ProductCard from '@/components/ProductCard';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Search } from 'lucide-react';
import VisualSearchDialog from '@/components/VisualSearchDialog';
import PersonalizedRecommendationsDialog from '@/components/PersonalizedRecommendationsDialog';

export default function Home() {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('Todos');

  const categories = ['Todos', 'Muñecos', 'Figuras', 'Cajas', 'Otros', 'Libros', 'Packs', 'Accesorios', 'Cottom Doll'];

  const normalizeString = (str: string) =>
    str
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '');

  const filteredProducts = useMemo(() => {
    const normalizedSearchTerm = normalizeString(searchTerm);
    
    return products.filter(product => {
      const matchesCategory = selectedCategory === 'Todos' || product.category === selectedCategory;
      const matchesSearch = normalizeString(product.name).includes(normalizedSearchTerm);
      return matchesCategory && matchesSearch;
    });
  }, [searchTerm, selectedCategory]);

  return (
    <div className="flex flex-col min-h-screen">
      <Header />
      <main className="flex-grow container mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <section className="text-center py-8">
          <h1 className="text-4xl sm:text-5xl font-bold font-headline mb-4">Bienvenido a babystore</h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto mb-8">
            Los mejores productos para tu bebé, seleccionados para ti. Encuentra todo lo que necesitas para tu pequeño.
          </p>
          <div className="flex justify-center gap-4">
            <PersonalizedRecommendationsDialog />
            <VisualSearchDialog />
          </div>
        </section>

        <section id="all-products" className="py-12">
          <div className="flex flex-col md:flex-row justify-between items-center mb-8 gap-4">
            <h2 className="text-3xl font-bold font-headline text-center md:text-left">
              Todos los Coleccionables
            </h2>
            <div className="relative w-full max-w-sm md:w-1/3">
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
                className="text-xs sm:text-sm"
              >
                {category}
              </Button>
            ))}
          </div>
          
          <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
            {filteredProducts.map(product => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
}
