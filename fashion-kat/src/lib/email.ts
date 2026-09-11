import { prisma } from '@/lib/prisma';

// ==========================================================
// SISTEMA DE CORREOS
// PROVEEDOR CONFIGURABLE POR VARIABLE DE ENTORNO: log | smtp | resend
// SI NO HAY CREDENCIALES, EL CORREO SE REGISTRA EN CONSOLA Y EN LA TABLA EmailLog.
// ==========================================================

export type EmailTemplate =
  | 'REGISTRO'
  | 'PEDIDO_CONFIRMADO'
  | 'PEDIDO_ACTUALIZADO'
  | 'RECUPERAR_PASSWORD'
  | 'MENSAJE_CONTACTO'
  | 'CUPON_BIENVENIDA';

type SendInput = {
  to: string;
  subject: string;
  template: EmailTemplate;
  heading: string;
  intro: string;
  rows?: { label: string; value: string }[];
  ctaText?: string;
  ctaUrl?: string;
  footnote?: string;
};

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000';

export function renderEmail(input: SendInput): string {
  const rows = (input.rows ?? [])
    .map(
      (r) =>
        `<tr><td style="padding:8px 0;color:#6D6D6D;font-size:12px;letter-spacing:.06em">${r.label}</td><td style="padding:8px 0;text-align:right;color:#0A0A0A;font-size:13px;font-weight:600">${r.value}</td></tr>`
    )
    .join('');

  const cta =
    input.ctaText && input.ctaUrl
      ? `<a href="${input.ctaUrl}" style="display:inline-block;background:#F0508C;color:#fff;text-decoration:none;padding:14px 28px;font-size:12px;letter-spacing:.12em;font-weight:700;border-radius:2px">${input.ctaText}</a>`
      : '';

  return `<!doctype html><html lang="es"><body style="margin:0;background:#F4F4F5;font-family:Helvetica,Arial,sans-serif">
<table width="100%" cellpadding="0" cellspacing="0"><tr><td align="center" style="padding:32px 16px">
<table width="560" cellpadding="0" cellspacing="0" style="background:#fff;border:1px solid #E4E4E7">
<tr><td style="background:#0A0A0A;padding:24px;text-align:center">
<span style="color:#fff;font-size:18px;letter-spacing:.28em;font-weight:700">FASHION KAT</span>
<div style="color:#F0508C;font-size:10px;letter-spacing:.2em;margin-top:6px">TU ESTILO, TU ACTITUD, TU MOMENTO.</div>
</td></tr>
<tr><td style="padding:32px">
<h1 style="margin:0 0 12px;font-size:18px;letter-spacing:.1em;color:#0A0A0A">${input.heading}</h1>
<p style="margin:0 0 20px;font-size:13px;line-height:1.7;color:#3D3D3D;letter-spacing:.04em">${input.intro}</p>
${rows ? `<table width="100%" style="border-top:1px solid #E4E4E7;border-bottom:1px solid #E4E4E7;margin-bottom:24px">${rows}</table>` : ''}
${cta}
${input.footnote ? `<p style="margin:24px 0 0;font-size:11px;color:#888;letter-spacing:.06em">${input.footnote}</p>` : ''}
</td></tr>
<tr><td style="background:#F4F4F5;padding:20px;text-align:center;font-size:10px;color:#6D6D6D;letter-spacing:.1em">
FASHION KAT · ENVÍOS A TODA COLOMBIA<br/><a href="${SITE_URL}" style="color:#F0508C;text-decoration:none">${SITE_URL}</a>
</td></tr>
</table></td></tr></table></body></html>`;
}

export async function sendEmail(input: SendInput): Promise<{ sent: boolean; reason?: string }> {
  const provider = (process.env.EMAIL_PROVIDER || 'log').toLowerCase();
  const html = renderEmail(input);
  let status = 'REGISTRADO';
  let error: string | null = null;

  try {
    if (provider === 'resend' && process.env.RESEND_API_KEY) {
      const res = await fetch('https://api.resend.com/emails', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${process.env.RESEND_API_KEY}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          from: process.env.EMAIL_FROM || 'FASHION KAT <no-reply@fashionkat.co>',
          to: [input.to],
          subject: input.subject,
          html,
        }),
      });
      status = res.ok ? 'ENVIADO' : 'FALLIDO';
      if (!res.ok) error = `RESEND ${res.status}`;
    } else if (provider === 'smtp' && process.env.SMTP_HOST) {
      // PARA ACTIVAR SMTP: npm install nodemailer  Y DESCOMENTAR EL BLOQUE SIGUIENTE.
      // const nodemailer = await import('nodemailer');
      // const transport = nodemailer.createTransport({
      //   host: process.env.SMTP_HOST,
      //   port: Number(process.env.SMTP_PORT ?? 587),
      //   auth: { user: process.env.SMTP_USER, pass: process.env.SMTP_PASSWORD },
      // });
      // await transport.sendMail({ from: process.env.EMAIL_FROM, to: input.to, subject: input.subject, html });
      // status = 'ENVIADO';
      status = 'REGISTRADO';
      error = 'SMTP REQUIERE INSTALAR NODEMAILER (VER src/lib/email.ts).';
    } else {
      // MODO REGISTRO — ÚTIL EN DESARROLLO
      console.info(`[FASHION KAT][EMAIL] PARA: ${input.to} · ASUNTO: ${input.subject}`);
    }
  } catch (e) {
    status = 'FALLIDO';
    error = e instanceof Error ? e.message : 'ERROR DESCONOCIDO';
  }

  try {
    await prisma.emailLog.create({
      data: { to: input.to, subject: input.subject, template: input.template, status, error },
    });
  } catch {
    // NO INTERRUMPIR EL FLUJO SI FALLA EL REGISTRO
  }

  return { sent: status === 'ENVIADO', reason: error ?? undefined };
}
