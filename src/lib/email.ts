/**
 * src/lib/email.ts
 * Servicio de email con Brevo (API REST)
 */

const BREVO_API_URL = "https://api.brevo.com/v3/smtp/email";

/**
 * Obtener API Key de forma segura
 */
function getBrevoApiKey(): string {
  const apiKey = import.meta.env.BREVO_API_KEY;
  if (!apiKey) {
    console.error("❌ BREVO_API_KEY no está configurada en .env.local");
    return "";
  }
  return apiKey;
}

/**
 * Enviar correo de bienvenida al newsletter
 */
export async function sendNewsletterWelcomeEmail(email: string, discountCode: string) {
  const apiKey = getBrevoApiKey();
  if (!apiKey) {
    return { success: false, error: "API Key no configurada" };
  }

  try {
    const response = await fetch(BREVO_API_URL, {
      method: "POST",
      headers: {
        "api-key": apiKey,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        sender: { email: "jaimechipiona2006@gmail.com", name: "JGMarket" },
        to: [{ email: email }],
        subject: "¡Bienvenido a JGMarket! Tu código de descuento te espera",
        htmlContent: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <div style="background: linear-gradient(to right, #dc2626, #991b1b); color: white; padding: 30px; text-align: center;">
              <h1 style="margin: 0; font-size: 32px;">JGMARKET</h1>
              <p style="margin: 10px 0 0 0;">La mejor moda deportiva actual</p>
            </div>
            
            <div style="padding: 30px; background-color: #f3f4f6;">
              <h2 style="color: #1f2937; margin-top: 0;">¡Gracias por suscribirte!</h2>
              <p style="color: #4b5563; line-height: 1.6;">
                Hemos recibido tu suscripción a nuestro newsletter. Te mantendremos informado de nuestras mejores ofertas y novedades en zapatillas y ropa deportiva.
              </p>
              
              <div style="background-color: white; border: 2px solid #14b8a6; border-radius: 8px; padding: 20px; text-align: center; margin: 20px 0;">
                <p style="margin: 0 0 10px 0; color: #4b5563; font-size: 14px;">Tu código de descuento</p>
                <p style="margin: 0; font-size: 28px; font-weight: bold; color: #dc2626; font-family: monospace;">${discountCode}</p>
                <p style="margin: 10px 0 0 0; color: #4b5563; font-size: 12px;">Válido para tu primera compra</p>
              </div>
              
              <p style="color: #4b5563; line-height: 1.6;">
                En JGMarket encontrarás las mejores marcas de zapatillas y ropa deportiva a precios increíbles.
              </p>
            </div>
            
            <div style="background-color: #1f2937; color: white; padding: 20px; text-align: center; font-size: 12px;">
              <p style="margin: 0;">© 2026 JGMarket. Todos los derechos reservados.</p>
            </div>
          </div>
        `,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("❌ Error de Brevo:", response.status, errorText);
      return { success: false, error: `Error ${response.status}: ${errorText}` };
    }

    let data;
    try {
      data = await response.json();
    } catch (e) {
      console.error("❌ Error parseando JSON de Brevo:", e);
      return { success: false, error: "Error parseando respuesta de Brevo" };
    }

    console.log("✅ Email newsletter enviado:", data.messageId);
    return { success: true, messageId: data.messageId };
  } catch (error: any) {
    console.error("❌ Error enviando email newsletter:", error);
    return { success: false, error: error.message };
  }
}

/**
 * Enviar correo de registro
 */
export async function sendRegistrationEmail(email: string, userName?: string) {
  const apiKey = getBrevoApiKey();
  if (!apiKey) {
    return { success: false, error: "API Key no configurada" };
  }

  try {
    const response = await fetch(BREVO_API_URL, {
      method: "POST",
      headers: {
        "api-key": apiKey,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        sender: { email: "jaimechipiona2006@gmail.com", name: "JGMarket" },
        to: [{ email: email }],
        subject: "¡Cuenta creada! Bienvenido a JGMarket",
        htmlContent: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <div style="background: linear-gradient(to right, #dc2626, #991b1b); color: white; padding: 30px; text-align: center;">
              <h1 style="margin: 0; font-size: 32px;">JGMARKET</h1>
              <p style="margin: 10px 0 0 0;">La mejor moda deportiva actual</p>
            </div>
            
            <div style="padding: 30px; background-color: #f3f4f6;">
              <h2 style="color: #1f2937; margin-top: 0;">¡Bienvenido a JGMarket!</h2>
              <p style="color: #4b5563; line-height: 1.6;">
                Hola${userName ? ` ${userName}` : ""},
              </p>
              <p style="color: #4b5563; line-height: 1.6;">
                Tu cuenta ha sido creada exitosamente con el correo <strong>${email}</strong>. Ya puedes iniciar sesión y comenzar a explorar nuestro catálogo de zapatillas y ropa deportiva.
              </p>
              
              <div style="background-color: white; border-left: 4px solid #14b8a6; padding: 15px; margin: 20px 0;">
                <h3 style="margin: 0 0 10px 0; color: #1f2937;">¿Qué viene a continuación?</h3>
                <ul style="margin: 0; padding-left: 20px; color: #4b5563;">
                  <li>Explora nuestras colecciones de zapatillas</li>
                  <li>Descubre ofertas exclusivas</li>
                  <li>Recibe notificaciones de nuevas llegadas</li>
                </ul>
              </div>
              
              <p style="color: #4b5563; line-height: 1.6;">
                Si tienes alguna pregunta, no dudes en contactarnos.
              </p>
            </div>
            
            <div style="background-color: #1f2937; color: white; padding: 20px; text-align: center; font-size: 12px;">
              <p style="margin: 0;">© 2026 JGMarket. Todos los derechos reservados.</p>
            </div>
          </div>
        `,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("❌ Error de Brevo:", response.status, errorText);
      return { success: false, error: `Error ${response.status}: ${errorText}` };
    }

    let data;
    try {
      data = await response.json();
    } catch (e) {
      console.error("❌ Error parseando JSON de Brevo:", e);
      return { success: false, error: "Error parseando respuesta de Brevo" };
    }

    console.log("✅ Email registro enviado:", data.messageId);
    return { success: true, messageId: data.messageId };
  } catch (error: any) {
    console.error("❌ Error enviando email registro:", error);
    return { success: false, error: error.message };
  }
}

/**
 * Enviar correo genérico
 */
export async function sendEmail(
  to: string,
  subject: string,
  htmlContent: string,
  fromName: string = "JGMarket"
) {
  const apiKey = getBrevoApiKey();
  if (!apiKey) {
    return { success: false, error: "API Key no configurada" };
  }

  try {
    const response = await fetch(BREVO_API_URL, {
      method: "POST",
      headers: {
        "api-key": apiKey,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        sender: { email: "jaimechipiona2006@gmail.com", name: fromName },
        to: [{ email: to }],
        subject: subject,
        htmlContent: htmlContent,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("❌ Error de Brevo:", response.status, errorText);
      return { success: false, error: `Error ${response.status}: ${errorText}` };
    }

    let data;
    try {
      data = await response.json();
    } catch (e) {
      console.error("❌ Error parseando JSON de Brevo:", e);
      return { success: false, error: "Error parseando respuesta de Brevo" };
    }

    console.log("✅ Email enviado:", data.messageId);
    return { success: true, messageId: data.messageId };
  } catch (error: any) {
    console.error("❌ Error enviando email:", error);
    return { success: false, error: error.message };
  }
}
