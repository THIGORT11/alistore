
import { CartItem } from '@/context/CartContext';

export const generateEmailHtml = (name: string, cart: CartItem[], total: number) => {
  const itemsHtml = cart.map(item => `
    <tr>
      <td style="padding: 12px 0; border-bottom: 1px solid #eee;">
        <div style="display: flex; align-items: center;">
          <img src="${item.images[0]}" alt="${item.name}" style="width: 60px; height: 60px; object-fit: cover; border-radius: 8px; margin-right: 16px;">
          <div>
            <p style="margin: 0; font-weight: 600; color: #333;">${item.name}</p>
            <p style="margin: 4px 0 0; font-size: 14px; color: #666;">Qty: ${item.quantity}</p>
          </div>
        </div>
      </td>
      <td style="padding: 12px 0; border-bottom: 1px solid #eee; text-align: right;">
        <p style="margin: 0; font-weight: 600; color: #333;">$${(item.price * item.quantity).toFixed(2)}</p>
      </td>
    </tr>
  `).join('');

  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Confirmación de Pedido</title>
    </head>
    <body style="margin: 0; padding: 0; background-color: #f9fafb; font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif;">
      <div style="max-width: 600px; margin: 0 auto; background-color: #ffffff; border-radius: 16px; overflow: hidden; margin-top: 40px; margin-bottom: 40px; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06);">
        
        <!-- Header -->
        <div style="background-color: #4F46E5; padding: 40px 0; text-align: center;">
          <h1 style="margin: 0; color: #ffffff; font-size: 28px; font-weight: 700; letter-spacing: -0.5px;">BabyStore</h1>
        </div>

        <!-- Content -->
        <div style="padding: 40px 32px;">
          <h2 style="margin: 0 0 24px; color: #111827; font-size: 24px; font-weight: 700;">¡Gracias por tu pedido, ${name}!</h2>
          <p style="margin: 0 0 32px; color: #4B5563; font-size: 16px; line-height: 24px;">
            Hemos recibido tu pedido y lo estamos procesando con mucho cariño. Te avisaremos cuando esté en camino.
          </p>

          <!-- Order Summary -->
          <div style="background-color: #F9FAFB; border-radius: 12px; padding: 24px;">
            <h3 style="margin: 0 0 16px; color: #111827; font-size: 18px; font-weight: 600;">Resumen del Pedido</h3>
            <table style="width: 100%; border-collapse: collapse;">
              ${itemsHtml}
              <tr>
                <td style="padding-top: 16px; text-align: right;">
                  <p style="margin: 0; font-size: 16px; color: #666;">Total</p>
                </td>
                <td style="padding-top: 16px; text-align: right;">
                  <p style="margin: 0; font-size: 24px; font-weight: 700; color: #4F46E5;">$${total.toFixed(2)}</p>
                </td>
              </tr>
            </table>
          </div>

          <!-- Next Steps -->
          <div style="margin-top: 32px; padding-top: 32px; border-top: 1px solid #E5E7EB;">
            <h3 style="margin: 0 0 16px; color: #111827; font-size: 18px; font-weight: 600;">¿Qué sigue?</h3>
            <p style="margin: 0; color: #4B5563; font-size: 16px; line-height: 24px;">
              Te enviaremos otro correo con el número de seguimiento en cuanto tu paquete sea enviado. Si tienes alguna pregunta, no dudes en responder a este correo.
            </p>
          </div>
        </div>

        <!-- Footer -->
        <div style="background-color: #F3F4F6; padding: 24px; text-align: center;">
          <p style="margin: 0; color: #6B7280; font-size: 14px;">
            © ${new Date().getFullYear()} BabyStore. Todos los derechos reservados.
          </p>
          <p style="margin: 8px 0 0; color: #6B7280; font-size: 14px;">
            Síguenos en nuestras redes sociales para más novedades.
          </p>
        </div>
      </div>
    </body>
    </html>
  `;
};

export const generateAdminEmailHtml = (name: string, email: string, cart: CartItem[], total: number) => {
  const itemsHtml = cart.map(item => `
    <li>
      <strong>${item.name}</strong> (x${item.quantity}) - $${(item.price * item.quantity).toFixed(2)}
    </li>
  `).join('');

  return `
    <div style="font-family: Arial, sans-serif; color: #333;">
      <h2>Nuevo Pedido Recibido</h2>
      <p><strong>Cliente:</strong> ${name}</p>
      <p><strong>Email:</strong> ${email}</p>
      
      <h3>Detalles del Pedido:</h3>
      <ul>
        ${itemsHtml}
      </ul>
      
      <p><strong>Total:</strong> $${total.toFixed(2)}</p>
    </div>
  `;
};
