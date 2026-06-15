const nodemailer = require('nodemailer');

const hasSMTP = !!(process.env.SMTP_HOST && process.env.SMTP_USER && process.env.SMTP_PASS);

const transporter = hasSMTP
  ? nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: parseInt(process.env.SMTP_PORT) || 587,
      secure: process.env.SMTP_SECURE === 'true',
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
    })
  : null;

/**
 * Envia e-mail de verificação com o código de 6 dígitos.
 * Se SMTP não estiver configurado, imprime no console (modo dev).
 */
async function sendVerificationEmail(to, name, code) {
  const html = `
    <div style="font-family:Arial,sans-serif;max-width:520px;margin:0 auto;background:#0f1117;color:#fff;border-radius:12px;overflow:hidden;">
      <div style="background:linear-gradient(135deg,#6366f1,#8b5cf6);padding:32px;text-align:center;">
        <h1 style="margin:0;font-size:24px;font-weight:800;">SweatTrack</h1>
        <p style="margin:8px 0 0;opacity:.7;font-size:14px;">Verificação de e-mail</p>
      </div>
      <div style="padding:36px;">
        <p style="margin:0 0 8px;">Olá, <strong>${name}</strong>!</p>
        <p style="color:rgba(255,255,255,.6);margin:0 0 28px;font-size:14px;">
          Use o código abaixo para confirmar o seu e-mail. Ele expira em <strong>15 minutos</strong>.
        </p>
        <div style="background:#1a1d2e;border:1px solid rgba(99,102,241,.3);border-radius:12px;padding:24px;text-align:center;">
          <span style="font-size:40px;font-weight:900;letter-spacing:12px;color:#a5b4fc;">${code}</span>
        </div>
        <p style="color:rgba(255,255,255,.35);font-size:12px;margin:24px 0 0;text-align:center;">
          Se você não criou uma conta no SweatTrack, ignore este e-mail.
        </p>
      </div>
    </div>
  `;

  if (!transporter) {
    console.log('\n========================================');
    console.log(`📧  CÓDIGO DE VERIFICAÇÃO para ${to}`);
    console.log(`    CÓDIGO: ${code}`);
    console.log('========================================\n');
    return;
  }

  await transporter.sendMail({
    from: process.env.SMTP_FROM || `"SweatTrack" <${process.env.SMTP_USER}>`,
    to,
    subject: `${code} — seu código de verificação SweatTrack`,
    html,
  });
}

module.exports = { sendVerificationEmail };
