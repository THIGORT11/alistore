import { Archive } from 'lucide-react';
import Link from 'next/link';

export default function Footer() {
  return (
    <footer className="border-t">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8 flex flex-col sm:flex-row items-center justify-between">
        <div className="flex items-center space-x-2">
          <Archive className="h-6 w-6 text-primary" />
          <span className="font-bold text-lg">Alistore</span>
        </div>
        <p className="text-sm text-muted-foreground mt-4 sm:mt-0">
          © {new Date().getFullYear()} Alistore, Inc. Todos los derechos reservados.
        </p>
        <div className="flex space-x-4 mt-4 sm:mt-0">
          <Link href="#" className="text-muted-foreground hover:text-primary">
            Twitter
          </Link>
          <Link href="#" className="text-muted-foreground hover:text-primary">
            Instagram
          </Link>
          <Link href="#" className="text-muted-foreground hover:text-primary">
            Facebook
          </Link>
        </div>
      </div>
    </footer>
  );
}
