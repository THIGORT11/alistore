import nodemailer from 'nodemailer';

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_APP_PASSWORD,
  },
});

interface OrderDetails {
  customerName: string;
  customerEmail: string;
  cart: { name: string; quantity: number; price: number }[];
  cartTotal: number;
}

const generateOrderHtml = (details: OrderDetails, forCustomer: boolean) => {
  const { customerName, cart, cartTotal, customerEmail } = details;
  const productRows = cart
    .map(
      (item) => `
    <tr>
      <td style="padding: 8px; border-bottom: 1px solid #ddd;">${item.name}</td>
      <td style="padding: 8px; border-bottom: 1px solid #ddd; text-align: center;">${item.quantity}</td>
      <td style="padding: 8px; border-bottom: 1px solid #ddd; text-align: right;">$${item.price.toFixed(2)}</td>
      <td style="padding: 8px; border-bottom: 1px solid #ddd; text-align: right;">$${(item.price * item.quantity).toFixed(2)}</td>
    </tr>
  `
    )
    .join('');

  const greeting = forCustomer ? `Hola ${customerName},` : `Nuevo Pedido de ${customerName}`;
  const intro = forCustomer
    ? '¡Gracias por tu compra en babystore! Aquí tienes un resumen de tu pedido:'
    : `Se ha realizado un nuevo pedido en la tienda. <br/><strong>Cliente:</strong> ${customerName} <br/><strong>Email:</strong> ${customerEmail}`;

  return `
    <div style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
      <div style="max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #eee; border-radius: 5px;">
        <h2 style="color: #4F46E5;">${greeting}</h2>
        <p>${intro}</p>
        <table style="width: 100%; border-collapse: collapse; margin-top: 20px;">
          <thead>
            <tr>
              <th style="padding: 8px; text-align: left; background-color: #f2f2f2; border-bottom: 1px solid #ddd;">Producto</th>
              <th style="padding: 8px; text-align: center; background-color: #f2f2f2; border-bottom: 1px solid #ddd;">Cantidad</th>
              <th style="padding: 8px; text-align: right; background-color: #f2f2f2; border-bottom: 1px solid #ddd;">Precio Unitario</th>
              <th style="padding: 8px; text-align: right; background-color: #f2f2f2; border-bottom: 1px solid #ddd;">Subtotal</th>
            </tr>
          </thead>
          <tbody>
            ${productRows}
          </tbody>
          <tfoot>
            <tr>
              <td colspan="3" style="text-align: right; font-weight: bold; padding: 10px 8px 0;">Total:</td>
              <td style="text-align: right; font-weight: bold; padding: 10px 8px 0; font-size: 1.2em; color: #4F46E5;">$${cartTotal.toFixed(2)}</td>
            </tr>
          </tfoot>
        </table>
        ${forCustomer ? '<p style="margin-top: 20px;">Gracias por confiar en babystore.</p>' : ''}
      </div>
    </div>
  `;
};

export const sendOrderConfirmationEmail = async (details: OrderDetails) => {
  const ownerMailOptions = {
    from: `"babystore" <${process.env.EMAIL_USER}>`,
    to: process.env.EMAIL_USER,
    subject: `📦 Nuevo Pedido de ${details.customerName}`,
    html: generateOrderHtml(details, false),
  };

  const customerMailOptions = {
    from: `"babystore" <${process.env.EMAIL_USER}>`,
    to: details.customerEmail,
    subject: '✅ Confirmación de tu pedido en babystore',
    html: generateOrderHtml(details, true),
  };

  try {
    const ownerEmail = await transporter.sendMail(ownerMailOptions);
    console.log('Owner confirmation email sent:', ownerEmail.messageId);
    const customerEmail = await transporter.sendMail(customerMailOptions);
    console.log('Customer confirmation email sent:', customerEmail.messageId);
  } catch (error) {
    console.error('Error sending confirmation emails:', error);
    throw new Error('Could not send confirmation emails.');
  }
};
