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
    const isEmail = (s: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(s || '');
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

    const info = await transporter.sendMail({
      from: `Tu Agencia <${user}>`,  // FROM = tu cuenta
      to: clientEmail,                // destino dinámico (cliente)
      replyTo: email,                 // para que contesten al remitente
      subject: `Nuevo mensaje de ${name}`,
      html: `<p><b>Nombre:</b> ${name}</p>
             <p><b>Email remitente:</b> ${email}</p>
             <p><b>Mensaje:</b><br>${String(message).replace(/\n/g,'<br>')}</p>`,
      bcc: user, // opcional: cópiate a ti
    });

    return new Response(JSON.stringify({ ok:true, id:info.messageId }), { status:200, headers:cors });
  } catch (e:any) {
    return new Response(JSON.stringify({ ok:false, error:e?.message || 'SMTP error' }), { status:500, headers:cors });
  }
}
