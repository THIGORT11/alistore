'use client';

import { useState } from 'react';

export default function ConfirmarPedidoForm() {
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState<string | null>(null);
  const [err, setErr] = useState<string | null>(null);

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setErr(null); setMsg(null); setLoading(true);

    try {
      const f = new FormData(e.currentTarget);
      const name = String(f.get('name') || '').trim();
      const email = String(f.get('email') || '').trim();
      const clientEmail = String(f.get('clientEmail') || '').trim(); // destino del cliente
      const message = `Pedido confirmado.\nCliente: ${name}\nEmail: ${email}`;

      const res = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, message, clientEmail }),
      });

      const out = await res.json().catch(() => ({}));
      if (!res.ok || !out?.ok) {
        throw new Error(out?.error || `HTTP ${res.status}`);
      }

      setMsg('✅ Pedido enviado correctamente. Revisa tu correo.');
      (e.currentTarget as HTMLFormElement).reset();
    } catch (e: any) {
      setErr(`❌ Error al enviar: ${e?.message || 'desconocido'}`);
      console.error('confirmar-pedido error:', e);
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={onSubmit} style={{ display:'grid', gap:12, maxWidth:420 }}>
      <input name="name" placeholder="Nombre" required />
      <input name="email" type="email" placeholder="Correo electrónico" required />
      {/* El email del cliente (destinatario). Puedes ocultarlo si ya lo sabes en tu lógica */}
      <input name="clientEmail" type="email" placeholder="Email del cliente (destino)" required />

      <button type="submit" disabled={loading}>
        {loading ? 'Enviando…' : 'Confirmar y Pagar'}
      </button>

      {msg && <p style={{ color:'#0a0' }}>{msg}</p>}
      {err && <p style={{ color:'#c00' }}>{err}</p>}
    </form>
  );
}
