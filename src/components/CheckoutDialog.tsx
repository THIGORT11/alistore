'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useCart } from '@/context/CartContext';
import { useLoyalty } from '@/context/LoyaltyContext';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from '@/components/ui/dialog';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Loader2 } from 'lucide-react';

const formSchema = z.object({
  name: z.string().min(2, { message: 'El nombre debe tener al menos 2 caracteres.' }),
  email: z.string().email({ message: 'Por favor, introduce un correo válido.' }),
});

export default function CheckoutDialog() {
  const [open, setOpen] = useState(false);
  const [useDiscount, setUseDiscount] = useState(false);
  const {
    cart,
    cartTotal,
    promoApplied,
    promoDiscount,
    totalAfterPromo,
    redeemPromoCode,
    clearCart,
  } = useCart();
  const { addPurchasePoints, points, redeemPoints, level, purchaseCount } = useLoyalty();
  const { toast } = useToast();

  let tierDiscountPercent = 0;
  if ((purchaseCount + 1) % 2 === 0) {
    if (level === "Plata") tierDiscountPercent = 10;
    else if (level === "Oro") tierDiscountPercent = 15;
  }
  const tierDiscountAmount = (totalAfterPromo * tierDiscountPercent) / 100;
  const totalAfterTierDiscount = totalAfterPromo - tierDiscountAmount;

  const maxPointsPossible = Math.min(500, points);
  const discountPoints = Math.min(Math.floor(totalAfterTierDiscount * 100), maxPointsPossible);
  const discountEuros = discountPoints / 100;
  const finalTotal = useDiscount && discountPoints >= 100 ? Math.max(0, totalAfterTierDiscount - discountEuros) : totalAfterTierDiscount;

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: '',
      email: '',
    },
  });

  const { isSubmitting } = form.formState;

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    if (useDiscount && discountPoints >= 100) {
      redeemPoints(discountPoints);
    }

    const orderDetails = cart.map(item =>
      `- ${item.name} (x${item.quantity}): $${(item.price * item.quantity).toFixed(2)}`
    ).join('\n') + `\n\nSubtotal: $${cartTotal.toFixed(2)}${promoApplied ? `\nCódigo CUM BS (50%): -$${promoDiscount.toFixed(2)}` : ''}${tierDiscountPercent > 0 ? `\nDescuento VIP ${level} (${tierDiscountPercent}%): -$${tierDiscountAmount.toFixed(2)}` : ''}${useDiscount && discountPoints >= 100 ? `\nDescuento Puntos: -$${discountEuros.toFixed(2)}` : ''}\nTotal: $${finalTotal.toFixed(2)}`;

    try {
      const response = await fetch('/api/send-email', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: values.name,
          email: values.email,
          cart,
          total: finalTotal,
        }),
      });

      const result = await response.json();

      if (!response.ok || !result.success) {
        throw new Error('Hubo un problema al enviar la confirmación del pedido.');
      }

      toast({
        title: '¡Pedido Confirmado!',
        description: 'Hemos recibido tu pedido. Recibirás un correo de confirmación pronto.',
      });

      addPurchasePoints(finalTotal);

      redeemPromoCode();
      clearCart();
      form.reset();
      setOpen(false);
    } catch (error) {
      console.error('Failed to process order:', error);
      toast({
        title: 'Error al procesar el pedido',
        description: 'Hubo un problema al enviar tu pedido. Por favor, inténtalo de nuevo.',
        variant: 'destructive',
      });
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="w-full">Proceder al Pago</Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Confirmar Pedido</DialogTitle>
          <DialogDescription>
            Por favor, introduce tu nombre y correo electrónico para completar la compra.
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Nombre</FormLabel>
                  <FormControl>
                    <Input placeholder="Tu nombre completo" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Correo Electrónico</FormLabel>
                  <FormControl>
                    <Input placeholder="tu@ejemplo.com" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            {tierDiscountPercent > 0 && (
              <div className="bg-amber-50 dark:bg-amber-500/10 p-3 rounded-md border border-amber-200 dark:border-amber-500/30 text-amber-800 dark:text-amber-200 text-sm flex justify-between items-center font-medium mt-4 mb-2">
                <span>🎫 Descuento VIP {level} ({tierDiscountPercent}%)</span>
                <span>-${tierDiscountAmount.toFixed(2)}</span>
              </div>
            )}
            {promoApplied && (
              <div className="bg-green-50 dark:bg-green-500/10 p-3 rounded-md border border-green-200 dark:border-green-500/30 text-green-800 dark:text-green-200 text-sm flex justify-between items-center font-medium mt-4 mb-2">
                <span>🏷️ Código CUM BS (50 %)</span>
                <span>-${promoDiscount.toFixed(2)}</span>
              </div>
            )}
            {points >= 100 && (
              <div className="flex items-center space-x-2 bg-indigo-50 dark:bg-indigo-950/30 p-3 rounded-md border border-indigo-100 dark:border-indigo-900/50 mt-4">
                <input 
                  type="checkbox" 
                  id="use-discount" 
                  checked={useDiscount}
                  onChange={(e) => setUseDiscount(e.target.checked)}
                  className="w-4 h-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500 cursor-pointer"
                />
                <label htmlFor="use-discount" className="text-sm cursor-pointer select-none text-muted-foreground flex-1">
                  Usar {discountPoints} puntos por un descuento de <strong>${discountEuros.toFixed(2)}</strong>
                </label>
              </div>
            )}
            <DialogFooter>
              <Button type="submit" disabled={isSubmitting} className="w-full mt-2">
                {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                {isSubmitting ? 'Procesando...' : `Confirmar y Pagar ${finalTotal > 0 ? '$' + finalTotal.toFixed(2) : 'GRATIS'}`}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
