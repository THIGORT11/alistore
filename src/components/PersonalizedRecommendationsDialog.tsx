"use client";

import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { getPersonalizedRecommendations } from "@/ai/flows/personalized-recommendations";
import { products } from "@/data/products";
import Image from "next/image";
import { WandSparkles, Loader2 } from "lucide-react";
import { Skeleton } from "./ui/skeleton";

type RecommendationResult = {
  id: string;
  name: string;
  image: string;
  aiHint: string;
}

export default function PersonalizedRecommendationsDialog() {
  const [open, setOpen] = useState(false);
  const [interests, setInterests] = useState("");
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState<RecommendationResult[] | null>(null);
  const { toast } = useToast();

  const handleGetRecommendations = async () => {
    if (!interests) {
      toast({
        title: "No se proporcionaron intereses",
        description: "Por favor, ingresa algunos intereses para obtener recomendaciones.",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);
    setResults(null);

    // Mock browsing history
    const browsingHistory = "1,4,8";

    try {
      const response = await getPersonalizedRecommendations({
        browsingHistory,
        interests,
        numberOfRecommendations: 3,
      });
      
      const recommendedProducts = response.recommendations
        .map(id => products.find(p => p.id === id.trim()))
        .filter((p): p is typeof products[0] => !!p)
        .map(p => ({
            id: p.id,
            name: p.name,
            image: p.images[0],
            aiHint: p.aiHint,
        }));

      setResults(recommendedProducts);
    } catch (error) {
      console.error("Failed to get recommendations:", error);
      toast({
        title: "Fallaron las Recomendaciones",
        description: "No se pudieron obtener las recomendaciones. Por favor, inténtalo de nuevo.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };
  
  const resetState = () => {
    setInterests("");
    setResults(null);
    setLoading(false);
  };
  
  const handleOpenChange = (isOpen: boolean) => {
    setOpen(isOpen);
    if (!isOpen) {
      resetState();
    }
  }


  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>
        <Button>
          <WandSparkles className="mr-2 h-4 w-4" />
          Obtener Recomendaciones
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Recomendaciones Personalizadas</DialogTitle>
          <DialogDescription>
            Dinos tus intereses para encontrar coleccionables que te encantarán.
            También consideraremos tu historial de navegación reciente.
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="interests" className="text-right">
              Intereses
            </Label>
            <Input
              id="interests"
              value={interests}
              onChange={(e) => setInterests(e.target.value)}
              placeholder="ej., cámaras vintage, ciencia ficción"
              className="col-span-3"
            />
          </div>
        </div>
        <Button onClick={handleGetRecommendations} disabled={loading}>
          {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          {loading ? "Pensando..." : "Obtener Mis Recomendaciones"}
        </Button>

        {loading && (
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="space-y-2">
                <Skeleton className="h-24 w-full" />
                <Skeleton className="h-4 w-3/4" />
              </div>
            ))}
          </div>
        )}
        
        {results && (
          <div>
            <h3 className="text-lg font-semibold my-4">Aquí están tus recomendaciones:</h3>
            {results.length > 0 ? (
              <div className="grid grid-cols-3 gap-4">
                {results.map((item) => (
                  <div key={item.id} className="border rounded-lg p-2 text-center">
                    <Image
                      src={item.image}
                      alt={item.name}
                      width={100}
                      height={100}
                      className="rounded-md object-cover mx-auto aspect-square"
                      data-ai-hint={item.aiHint}
                    />
                    <h4 className="text-sm font-semibold mt-2">{item.name}</h4>
                  </div>
                ))}
              </div>
            ) : (
                <p>No se encontraron recomendaciones basadas en tus intereses.</p>
            )}
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
