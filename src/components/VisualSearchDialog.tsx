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
import { useToast } from "@/hooks/use-toast";
import { visualSearch, VisualSearchOutput } from "@/ai/flows/visual-search";
import { Camera, Loader2, Image as ImageIcon } from "lucide-react";
import Image from "next/image";
import { Skeleton } from "./ui/skeleton";

export default function VisualSearchDialog() {
  const [open, setOpen] = useState(false);
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState<VisualSearchOutput | null>(null);
  const { toast } = useToast();

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      setFile(selectedFile);
      setResults(null);
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreview(reader.result as string);
      };
      reader.readAsDataURL(selectedFile);
    }
  };

  const handleSearch = async () => {
    if (!file || !preview) {
      toast({
        title: "No image selected",
        description: "Please select an image file to search.",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);
    setResults(null);

    try {
      const result = await visualSearch({ photoDataUri: preview });
      setResults(result);
    } catch (error) {
      console.error("Visual search failed:", error);
      toast({
        title: "Search Failed",
        description: "Could not find similar items. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const resetState = () => {
    setFile(null);
    setPreview(null);
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
        <Button variant="outline">
          <Camera className="mr-2 h-4 w-4" />
          Visual Search
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[625px]">
        <DialogHeader>
          <DialogTitle>Visual Search</DialogTitle>
          <DialogDescription>
            Upload a photo of a collectible to find similar items in our store.
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="flex flex-col items-center gap-4">
            <div className="w-full h-48 border-2 border-dashed rounded-lg flex items-center justify-center bg-muted">
              {preview ? (
                <Image src={preview} alt="Image preview" width={192} height={192} className="object-contain h-full w-full" />
              ) : (
                <div className="text-center text-muted-foreground">
                  <ImageIcon className="mx-auto h-12 w-12" />
                  <p>Image preview will appear here</p>
                </div>
              )}
            </div>
            <Input id="picture" type="file" accept="image/*" onChange={handleFileChange} className="max-w-xs" />
          </div>
          <Button onClick={handleSearch} disabled={loading || !file}>
            {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            {loading ? "Searching..." : "Find Similar Items"}
          </Button>
        </div>
        {loading && (
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="space-y-2">
                <Skeleton className="h-32 w-full" />
                <Skeleton className="h-4 w-3/4" />
                <Skeleton className="h-4 w-1/2" />
              </div>
            ))}
          </div>
        )}
        {results && (
          <div>
            <h3 className="text-lg font-semibold mb-4">Similar Items Found</h3>
            {results.collectibles.length > 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                {results.collectibles.map((item, index) => (
                    <div key={index} className="border rounded-lg p-2">
                    <Image src={item.imageUrl || "https://placehold.co/300x200.png"} alt={item.name} width={300} height={200} className="rounded-md object-cover w-full aspect-[3/2]" data-ai-hint={item.name.toLowerCase()}/>
                    <h4 className="font-semibold mt-2">{item.name}</h4>
                    <p className="text-sm text-muted-foreground truncate">{item.description}</p>
                    </div>
                ))}
                </div>
            ) : (
                <p>No similar items found.</p>
            )}
         </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
