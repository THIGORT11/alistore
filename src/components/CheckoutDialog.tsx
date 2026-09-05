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
import { storeConfig } from '@/content/store';
import { calculatePromotionAmount, getApplicableOrderDiscounts } from '@/lib/promotions';

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
    appliedCoupon,
    couponDiscount,
    totalAfterCoupon,
    redeemAppliedCoupon,
    clearCart,
  } = useCart();
  const { addPurchasePoints, points, redeemPoints, level, purchaseCount } = useLoyalty();
  const { toast } = useToast();

  const automaticDiscounts = getApplicableOrderDiscounts(totalAfterCoupon, level, purchaseCount + 1);
  const automaticDiscountLines = automaticDiscounts.reduce<
    Array<{ discount: (typeof automaticDiscounts)[number]; amount: number }>
  >((lines, discount) => {
    const previouslyDiscounted = lines.reduce((total, line) => total + line.amount, 0);
    const amount = calculatePromotionAmount(totalAfterCoupon - previouslyDiscounted, discount);
    return [...lines, { discount, amount }];
  }, []);
  const automaticDiscountAmount = automaticDiscountLines.reduce((total, line) => total + line.amount, 0);
  const totalAfterAutomaticDiscount = totalAfterCoupon - automaticDiscountAmount;

  const maxPointsPossible = Math.min(storeConfig.loyalty.maximumRedeemPoints, points);
  const discountPoints = Math.min(
    Math.floor(totalAfterAutomaticDiscount * storeConfig.loyalty.pointsPerCurrencyUnit),
    maxPointsPossible,
  );
  const discountEuros = discountPoints / storeConfig.loyalty.pointsPerCurrencyUnit;
  const finalTotal = useDiscount && discountPoints >= storeConfig.loyalty.minimumRedeemPoints
    ? Math.max(0, totalAfterAutomaticDiscount - discountEuros)
    : totalAfterAutomaticDiscount;

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
      `- ${item.name} (x${item.quantity}): ${storeConfig.currency.symbol}${(item.price * item.quantity).toFixed(2)}`
    ).join('\n') + `\n\nSubtotal: ${storeConfig.currency.symbol}${cartTotal.toFixed(2)}${appliedCoupon ? `\n${appliedCoupon.name}: -${storeConfig.currency.symbol}${couponDiscount.toFixed(2)}` : ''}${automaticDiscountLines.map(({ discount, amount }) => `\n${discount.displayLabel}: -${storeConfig.currency.symbol}${amount.toFixed(2)}`).join('')}${useDiscount && discountPoints >= storeConfig.loyalty.minimumRedeemPoints ? `\nDescuento Puntos: -${storeConfig.currency.symbol}${discountEuros.toFixed(2)}` : ''}\nTotal: ${storeConfig.currency.symbol}${finalTotal.toFixed(2)}`;

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
        throw new Error(result.error || 'Hubo un problema al enviar la confirmación del pedido.');
      }

      toast({
        title: '¡Pedido Confirmado!',
        description: 'Hemos recibido tu pedido. Recibirás un correo de confirmación pronto.',
      });

      addPurchasePoints(finalTotal);

      redeemAppliedCoupon();
      clearCart();
      form.reset();
      setOpen(false);
    } catch (error) {
      console.error('Failed to process order:', error);
      toast({
        title: 'Error al procesar el pedido',
        description: error instanceof Error ? error.message : 'Hubo un problema al enviar tu pedido. Por favor, inténtalo de nuevo.',
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
            {automaticDiscountLines.map(({ discount, amount }) => (
              <div key={discount.id} className="bg-amber-50 dark:bg-amber-500/10 p-3 rounded-md border border-amber-200 dark:border-amber-500/30 text-amber-800 dark:text-amber-200 text-sm flex justify-between items-center font-medium mt-4 mb-2">
                <span>
                  🎫 {discount.displayLabel} ({discount.discountType === 'percentage'
                    ? `${discount.discountValue}%`
                    : `${storeConfig.currency.symbol}${discount.discountValue.toFixed(2)}`})
                </span>
                <span>-{storeConfig.currency.symbol}{amount.toFixed(2)}</span>
              </div>
            ))}
            {appliedCoupon && (
              <div className="bg-green-50 dark:bg-green-500/10 p-3 rounded-md border border-green-200 dark:border-green-500/30 text-green-800 dark:text-green-200 text-sm flex justify-between items-center font-medium mt-4 mb-2">
                <span>
                  🏷️ {appliedCoupon.name} ({appliedCoupon.discountType === 'percentage'
                    ? `${appliedCoupon.discountValue} %`
                    : `${storeConfig.currency.symbol}${appliedCoupon.discountValue.toFixed(2)}`})
                </span>
                <span>-{storeConfig.currency.symbol}{couponDiscount.toFixed(2)}</span>
              </div>
            )}
            {points >= storeConfig.loyalty.minimumRedeemPoints && (
              <div className="flex items-center space-x-2 bg-indigo-50 dark:bg-indigo-950/30 p-3 rounded-md border border-indigo-100 dark:border-indigo-900/50 mt-4">
                <input 
                  type="checkbox" 
                  id="use-discount" 
                  checked={useDiscount}
                  onChange={(e) => setUseDiscount(e.target.checked)}
                  className="w-4 h-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500 cursor-pointer"
                />
                <label htmlFor="use-discount" className="text-sm cursor-pointer select-none text-muted-foreground flex-1">
                  Usar {discountPoints} puntos por un descuento de <strong>{storeConfig.currency.symbol}{discountEuros.toFixed(2)}</strong>
                </label>
              </div>
            )}
            <DialogFooter>
              <Button type="submit" disabled={isSubmitting} className="w-full mt-2">
                {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                {isSubmitting ? 'Procesando...' : `Confirmar y Pagar ${finalTotal > 0 ? storeConfig.currency.symbol + finalTotal.toFixed(2) : 'GRATIS'}`}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
