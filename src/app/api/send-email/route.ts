import nodemailer from 'nodemailer';
import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
  try {
    const { name, email, orderDetails } = await req.json();

    // Configuration for the transporter (using Gmail)
    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.GMAIL_USER, // e.g., aliciababystore25@gmail.com
        pass: process.env.GMAIL_PASS, // your app password
      },
    });

    // 📦 Email to the customer
    await transporter.sendMail({
      from: `"babystore" <${process.env.GMAIL_USER}>`,
      to: email,
      subject: 'Confirmación de tu pedido - babystore',
      html: `
        <div style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
            <h2 style="color: #4F46E5;">¡Gracias por tu pedido, ${name}!</h2>
            <p>Estos son los detalles de tu pedido:</p>
            <pre style="background-color: #f5f5f5; padding: 15px; border-radius: 5px;">${orderDetails}</pre>
            <p>Te contactaremos cuando esté listo para ser enviado. 💌</p>
            <p>Gracias por confiar en babystore.</p>
        </div>
      `,
    });

    // 📧 Email to the store owner
    await transporter.sendMail({
      from: `"Notificación de babystore" <${process.env.GMAIL_USER}>`,
      to: 'aliciababystore25@gmail.com',
      subject: `Nuevo pedido de ${name}`,
      html: `
        <div style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
            <h2>Nuevo pedido recibido</h2>
            <p><strong>Cliente:</strong> ${name}</p>
            <p><strong>Email:</strong> ${email}</p>
            <h3>Detalles del pedido:</h3>
            <pre style="background-color: #f5f5f5; padding: 15px; border-radius: 5px;">${orderDetails}</pre>
        </div>
      `,
    });

    return NextResponse.json({ success: true }, { status: 200 });
  } catch (error) {
    console.error('Error sending email:', error);
    return NextResponse.json({ success: false, error: 'Failed to send email' }, { status: 500 });
  }
}
