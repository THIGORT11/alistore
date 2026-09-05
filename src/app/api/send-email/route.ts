import nodemailer from 'nodemailer';
import { NextRequest, NextResponse } from 'next/server';
import { generateEmailHtml, generateAdminEmailHtml } from '@/lib/email-template';
import { storeConfig } from '@/content/store';
import { products } from '@/content/catalog';
import type { CartItem } from '@/context/CartContext';
import { getStockValidationError } from '@/lib/product-stock';

export async function POST(req: NextRequest) {
  try {
    const { name, email, cart, total } = await req.json() as {
      name: string;
      email: string;
      cart?: CartItem[];
      total: number;
    };

    if (!cart?.length) {
      return NextResponse.json({ success: false, error: 'El carrito está vacío' }, { status: 400 });
    }

    const stockError = getStockValidationError(cart, products);
    if (stockError) {
      return NextResponse.json({ success: false, error: stockError }, { status: 409 });
    }

    if (!process.env.GMAIL_USER || !process.env.GMAIL_PASS) {
      console.error('Missing GMAIL_USER or GMAIL_PASS environment variables');
      return NextResponse.json({ success: false, error: 'Server configuration error' }, { status: 500 });
    }

    // Configuration for the transporter (using Gmail)
    const transporter = nodemailer.createTransport({
      host: 'smtp.gmail.com',
      port: 465,
      secure: true, // true for 465, false for other ports
      auth: {
        user: process.env.GMAIL_USER,
        pass: process.env.GMAIL_PASS,
      },
    });

    // Verify connection configuration
    try {
      await transporter.verify();
      console.log('Transporter verified successfully');
    } catch (verifyError) {
      console.error('Transporter verification failed:', verifyError);
      return NextResponse.json({ success: false, error: 'Failed to connect to email server' }, { status: 500 });
    }

    // Generate HTML content after validating the submitted inventory quantities.
    const customerHtml = generateEmailHtml(name, cart, total);
    const adminHtml = generateAdminEmailHtml(name, email, cart, total);

    // 📦 Email to the customer
    await transporter.sendMail({
      from: `"${storeConfig.brand.displayName}" <${process.env.GMAIL_USER}>`,
      to: email,
      subject: 'Confirmación de tu pedido - BabyStore',
      html: customerHtml,
    });

    // 📧 Email to the store owner
    await transporter.sendMail({
      from: `"Notificación de ${storeConfig.brand.displayName}" <${process.env.GMAIL_USER}>`,
      to: storeConfig.orders.adminEmail,
      subject: `Nuevo pedido de ${name}`,
      html: adminHtml,
    });

    return NextResponse.json({ success: true }, { status: 200 });
  } catch (error) {
    console.error('Error sending email:', error);
    return NextResponse.json({ success: false, error: 'Failed to send email' }, { status: 500 });
  }
}
