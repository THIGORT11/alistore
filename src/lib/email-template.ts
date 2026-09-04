
import type { CartItem } from '@/context/CartContext';
import { storeConfig } from '@/content/store';

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
        <p style="margin: 0; font-weight: 600; color: #333;">${storeConfig.currency.symbol}${(item.price * item.quantity).toFixed(2)}</p>
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
          <h1 style="margin: 0; color: #ffffff; font-size: 28px; font-weight: 700; letter-spacing: -0.5px;">${storeConfig.brand.displayName}</h1>
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
                  <p style="margin: 0; font-size: 24px; font-weight: 700; color: #4F46E5;">${storeConfig.currency.symbol}${total.toFixed(2)}</p>
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
            © ${new Date().getFullYear()} ${storeConfig.brand.displayName}. Todos los derechos reservados.
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
        <p style="margin: 0; font-weight: 600; color: #333;">${storeConfig.currency.symbol}${(item.price * item.quantity).toFixed(2)}</p>
      </td>
    </tr>
  `).join('');

    return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Nuevo Pedido Recibido</title>
    </head>
    <body style="margin: 0; padding: 0; background-color: #f9fafb; font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif;">
      <div style="max-width: 600px; margin: 0 auto; background-color: #ffffff; border-radius: 16px; overflow: hidden; margin-top: 40px; margin-bottom: 40px; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06);">
        
        <!-- Header -->
        <div style="background-color: #111827; padding: 32px 0; text-align: center;">
          <h1 style="margin: 0; color: #ffffff; font-size: 24px; font-weight: 700; letter-spacing: -0.5px;">Nuevo Pedido 🚀</h1>
        </div>

        <!-- Content -->
        <div style="padding: 40px 32px;">
          
          <!-- Customer Info Card -->
          <div style="background-color: #EEF2FF; border: 1px solid #C7D2FE; border-radius: 12px; padding: 20px; margin-bottom: 32px;">
            <h2 style="margin: 0 0 12px; color: #3730A3; font-size: 18px; font-weight: 700;">Detalles del Cliente</h2>
            <p style="margin: 0 0 8px; color: #1F2937; font-size: 16px;"><strong>Nombre:</strong> ${name}</p>
            <p style="margin: 0; color: #1F2937; font-size: 16px;"><strong>Email:</strong> <a href="mailto:${email}" style="color: #4F46E5; text-decoration: none;">${email}</a></p>
          </div>

          <!-- Order Summary -->
          <div style="background-color: #F9FAFB; border-radius: 12px; padding: 24px;">
            <h3 style="margin: 0 0 16px; color: #111827; font-size: 18px; font-weight: 600;">Productos Solicitados</h3>
            <table style="width: 100%; border-collapse: collapse;">
              ${itemsHtml}
              <tr>
                <td style="padding-top: 16px; text-align: right;">
                  <p style="margin: 0; font-size: 16px; color: #666;">Total del Pedido</p>
                </td>
                <td style="padding-top: 16px; text-align: right;">
                  <p style="margin: 0; font-size: 24px; font-weight: 700; color: #111827;">${storeConfig.currency.symbol}${total.toFixed(2)}</p>
                </td>
              </tr>
            </table>
          </div>

          <!-- Action Button -->
          <div style="margin-top: 32px; text-align: center;">
            <a href="mailto:${email}" style="display: inline-block; background-color: #4F46E5; color: #ffffff; padding: 12px 24px; border-radius: 8px; text-decoration: none; font-weight: 600; font-size: 16px;">Contactar al Cliente</a>
          </div>

        </div>

        <!-- Footer -->
        <div style="background-color: #F3F4F6; padding: 24px; text-align: center;">
          <p style="margin: 0; color: #6B7280; font-size: 14px;">
            Notificación automática del sistema de ${storeConfig.brand.displayName}.
          </p>
        </div>
      </div>
    </body>
    </html>
  `;
};
