'use server';

/**
 * @fileOverview Processes a customer order by sending confirmation emails.
 *
 * - processOrder - A function that handles sending order emails.
 * - ProcessOrderInput - The input type for the processOrder function.
 */

import { ai } from '@/ai/genkit';
import { z } from 'zod';
import { sendOrderConfirmationEmail } from '@/lib/email';

const CartItemSchema = z.object({
  id: z.string(),
  name: z.string(),
  description: z.string(),
  price: z.number(),
  images: z.array(z.string()),
  category: z.string(),
  tags: z.array(z.string()),
  aiHint: z.string(),
  quantity: z.number(),
});

const ProcessOrderInputSchema = z.object({
  customerName: z.string().min(1, { message: 'El nombre es obligatorio.' }),
  customerEmail: z.string().email({ message: 'Por favor, introduce un correo electrónico válido.' }),
  cart: z.array(CartItemSchema),
  cartTotal: z.number(),
});

export type ProcessOrderInput = z.infer<typeof ProcessOrderInputSchema>;

export async function processOrder(input: ProcessOrderInput): Promise<{ success: boolean }> {
  const validatedInput = ProcessOrderInputSchema.parse(input);
  
  await sendOrderConfirmationEmail({
    customerName: validatedInput.customerName,
    customerEmail: validatedInput.customerEmail,
    cart: validatedInput.cart.map(item => ({ name: item.name, quantity: item.quantity, price: item.price })),
    cartTotal: validatedInput.cartTotal,
  });

  return { success: true };
}

ai.defineFlow(
  {
    name: 'processOrderFlow',
    inputSchema: ProcessOrderInputSchema,
    outputSchema: z.object({ success: z.boolean() }),
  },
  async (input) => {
    return processOrder(input);
  }
);
