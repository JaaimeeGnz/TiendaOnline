/**
 * src/lib/brevo.ts
 * Utility for sending transactional emails via Brevo (Sendinblue) API
 */

const BREVO_API_KEY = import.meta.env.BREVO_API_KEY;
const BREVO_API_URL = 'https://api.brevo.com/v3/smtp/email';

interface SendEmailOptions {
  to: string;
  subject: string;
  htmlContent: string;
}

async function sendEmail({ to, subject, htmlContent }: SendEmailOptions): Promise<boolean> {
  if (!BREVO_API_KEY) {
    console.error('❌ BREVO_API_KEY not configured');
    return false;
  }

  try {
    const response = await fetch(BREVO_API_URL, {
      method: 'POST',
      headers: {
        'accept': 'application/json',
        'api-key': BREVO_API_KEY,
        'content-type': 'application/json',
      },
      body: JSON.stringify({
        sender: { name: 'JGMarket', email: 'jaimechipiona2006@gmail.com' },
        to: [{ email: to }],
        subject,
        htmlContent,
      }),
    });

    if (!response.ok) {
      const errorData = await response.text();
      console.error('❌ Brevo API error:', response.status, errorData);
      return false;
    }

    console.log('✅ Email sent successfully to', to);
    return true;
  } catch (error) {
    console.error('❌ Error sending email:', error);
    return false;
  }
}

export async function sendDiscountEmail(
  email: string,
  code: string,
  discountPercent: number
): Promise<boolean> {
  const htmlContent = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
    </head>
    <body style="margin:0; padding:0; background-color:#f4f4f4; font-family: Arial, Helvetica, sans-serif;">
      <div style="max-width:600px; margin:0 auto; background-color:#ffffff;">
        <!-- Header -->
        <div style="background-color:#1a1a1a; padding:30px; text-align:center;">
          <h1 style="color:#ffffff; margin:0; font-size:28px; letter-spacing:2px;">
            JG<span style="color:#e53e3e;">Market</span>
          </h1>
        </div>
        
        <!-- Content -->
        <div style="padding:40px 30px; text-align:center;">
          <h2 style="color:#1a1a1a; font-size:24px; margin:0 0 10px;">
            ¡Bienvenido/a a JGMarket! 🎉
          </h2>
          <p style="color:#666666; font-size:16px; line-height:1.6; margin:0 0 30px;">
            Gracias por suscribirte a nuestra newsletter. Aquí tienes tu código de descuento exclusivo:
          </p>
          
          <!-- Discount Code Box -->
          <div style="background: linear-gradient(135deg, #1a1a1a, #333333); border-radius:12px; padding:30px; margin:0 0 30px;">
            <p style="color:#4fd1c5; font-size:14px; text-transform:uppercase; letter-spacing:3px; margin:0 0 10px;">
              Tu código de descuento
            </p>
            <div style="background-color:#ffffff; border-radius:8px; padding:15px 30px; display:inline-block;">
              <span style="font-size:28px; font-weight:bold; color:#1a1a1a; letter-spacing:4px;">
                ${code}
              </span>
            </div>
            <p style="color:#ffffff; font-size:32px; font-weight:bold; margin:15px 0 5px;">
              ${discountPercent}% DESCUENTO
            </p>
            <p style="color:#999999; font-size:12px; margin:0;">
              Válido en tu próxima compra
            </p>
          </div>
          
          <!-- CTA Button -->
          <a href="https://jgmarket.victoriafp.online" 
             style="display:inline-block; background-color:#4fd1c5; color:#ffffff; text-decoration:none; padding:14px 40px; border-radius:6px; font-weight:bold; font-size:14px; text-transform:uppercase; letter-spacing:1px;">
            Comprar Ahora
          </a>
        </div>
        
        <!-- Footer -->
        <div style="background-color:#f8f8f8; padding:20px 30px; text-align:center; border-top:1px solid #eeeeee;">
          <p style="color:#999999; font-size:12px; margin:0;">
            © 2026 JGMarket. Todos los derechos reservados.
          </p>
        </div>
      </div>
    </body>
    </html>
  `;

  return sendEmail({
    to: email,
    subject: `🎁 Tu código de ${discountPercent}% de descuento en JGMarket`,
    htmlContent,
  });
}
