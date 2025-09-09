import type { NextRequest } from 'next/server';
export const runtime = 'nodejs';

const cors = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type',
};

export async function OPTIONS() {
  return new Response(null, { status: 204, headers: cors });
}

export async function POST(req: NextRequest) {
  try {
    const { name, email, message, clientEmail } = await req.json();
    const isEmail = (s: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(String(s || ''));
    if (!name || !isEmail(email) || !message || !isEmail(clientEmail)) {
      return new Response(JSON.stringify({ ok:false, error:'Datos inválidos' }), { status:400, headers:cors });
    }

    const user = process.env.EMAIL_SERVER_USER;
    const pass = process.env.EMAIL_SERVER_PASSWORD;
    if (!user || !pass) {
      return new Response(JSON.stringify({ ok:false, error:'ENV_MISSING' }), { status:500, headers:cors });
    }

    const nodemailer = await import('nodemailer');
    const transporter = nodemailer.createTransport({
      host: 'smtp.gmail.com',
      port: 465,
      secure: true,
      auth: { user, pass },
    });

    await transporter.verify(); // muestra "Invalid login" si hay problema de credenciales

    const info = await transporter.sendMail({
      from: `AliStore <${user}>`,   // debe ser tu Gmail (el del App Password)
      to: clientEmail,              // destinatario dinámico
      replyTo: email,               // para que el cliente conteste al comprador
      subject: `Pedido confirmado de ${name}`,
      html: `<p><b>Nombre:</b> ${name}</p>
             <p><b>Email comprador:</b> ${email}</p>
             <p><b>Detalles:</b><br>${String(message).replace(/\n/g,'<br>')}</p>`,
      bcc: user, // opcional: cópiate para verificar entrega
    });

    return new Response(JSON.stringify({ ok:true, id:info.messageId }), { status:200, headers:cors });
  } catch (e:any) {
    console.error('contact api error:', e);
    const msg = (typeof e?.response === 'string' && e.response) || e?.message || 'SMTP error';
    return new Response(JSON.stringify({ ok:false, error: msg }), { status:500, headers:cors });
  }
}
