import type { NextRequest } from 'next/server';
export const runtime = 'nodejs';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',          // si quieres, cámbialo a tu dominio
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type',
};

export async function OPTIONS() {
  // Respuesta al preflight CORS
  return new Response(null, { status: 204, headers: corsHeaders });
}

export async function POST(req: NextRequest) {
  try {
    const { name, email, message, clientEmail } = await req.json();

    // Validación mínima
    const isEmail = (s: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(String(s || ''));
    if (!name || !isEmail(email) || !message || !isEmail(clientEmail)) {
      return new Response(
        JSON.stringify({ ok: false, error: 'Datos inválidos' }),
        { status: 400, headers: corsHeaders }
      );
    }

    const user = process.env.EMAIL_SERVER_USER;
    const pass = process.env.EMAIL_SERVER_PASSWORD;

    if (!user || !pass) {
      return new Response(
        JSON.stringify({ ok: false, error: 'ENV_MISSING' }),
        { status: 500, headers: corsHeaders }
      );
    }

    const nodemailer = await import('nodemailer');
    const transporter = nodemailer.createTransport({
      host: 'smtp.gmail.com',
      port: 465,
      secure: true,
      auth: { user, pass },
    });

    // Comprueba credenciales/conexión SMTP (saca errores claros en logs)
    await transporter.verify();

    const info = await transporter.sendMail({
      from: `Tu Agencia <${user}>`, // FROM debe ser la cuenta del App Password
      to: clientEmail,              // destinatario dinámico (cliente)
      replyTo: email,               // para que el cliente responda al remitente original
      subject: `Nuevo mensaje de ${name}`,
      html: `
        <h1>Nuevo contacto</h1>
        <p><b>Nombre:</b> ${name}</p>
        <p><b>Email remitente:</b> ${email}</p>
        <h2>Mensaje</h2>
        <p>${String(message).replace(/\n/g, '<br>')}</p>
      `,
      // opcional: cópiate a ti para verificar entrega
      bcc: user,
    });

    return new Response(
      JSON.stringify({ ok: true, id: info.messageId }),
      { status: 200, headers: corsHeaders }
    );
  } catch (e: any) {
    // Log detallado en Vercel Runtime Logs
    console.error('mailer error:', e);
    const msg =
      (typeof e?.response === 'string' && e.response) ||
      e?.message ||
      'SMTP error';
    return new Response(
      JSON.stringify({ ok: false, error: msg }),
      { status: 500, headers: corsHeaders }
    );
  }
}
