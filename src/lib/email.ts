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
 * Enviar correo de confirmación de pedido
 */
export async function sendOrderConfirmationEmail(
  email: string,
  orderNumber: number,
  items: any[],
  subtotal: number,
  shipping: number,
  total: number
) {
  const apiKey = getBrevoApiKey();
  if (!apiKey) {
    return { success: false, error: "API Key no configurada" };
  }

  // Formatear items
  const itemsHtml = items
    .map(
      (item) =>
        `
        <tr style="border-bottom: 1px solid #e5e7eb;">
          <td style="padding: 12px; text-align: left;">${item.name}</td>
          <td style="padding: 12px; text-align: center;">${item.quantity}</td>
          <td style="padding: 12px; text-align: right;">€${(item.price * item.quantity).toFixed(2)}</td>
        </tr>
      `
    )
    .join("");

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
        subject: `Pedido Confirmado - Pedido #PED-${String(orderNumber).padStart(6, "0")}`,
        htmlContent: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <div style="background: linear-gradient(to right, #dc2626, #991b1b); color: white; padding: 30px; text-align: center;">
              <h1 style="margin: 0; font-size: 32px;">JGMARKET</h1>
              <p style="margin: 10px 0 0 0;">La mejor moda deportiva actual</p>
            </div>
            
            <div style="padding: 30px; background-color: #f3f4f6;">
              <h2 style="color: #1f2937; margin-top: 0;">¡Pedido Confirmado! ✓</h2>
              <p style="color: #4b5563; line-height: 1.6;">
                Hola,
              </p>
              <p style="color: #4b5563; line-height: 1.6;">
                Gracias por tu pedido. Te confirmamos que lo hemos recibido y estamos preparándolo para enviarlo.
              </p>
              
              <div style="background-color: white; border-left: 4px solid #14b8a6; padding: 20px; margin: 20px 0;">
                <h3 style="margin: 0 0 15px 0; color: #1f2937; font-size: 16px;">Detalles del Pedido</h3>
                
                <div style="margin-bottom: 15px;">
                  <p style="margin: 0 0 5px 0; color: #6b7280; font-size: 12px;">NÚMERO DE PEDIDO</p>
                  <p style="margin: 0; font-size: 20px; font-weight: bold; color: #dc2626;">Pedido #PED-${String(orderNumber).padStart(6, "0")}</p>
                </div>
                
                <div style="margin-bottom: 15px;">
                  <p style="margin: 0 0 5px 0; color: #6b7280; font-size: 12px;">CORREO DE CONTACTO</p>
                  <p style="margin: 0; color: #1f2937;">${email}</p>
                </div>
              </div>
              
              <div style="background-color: white; padding: 20px; margin: 20px 0; border-radius: 8px;">
                <h3 style="margin: 0 0 15px 0; color: #1f2937; font-size: 16px;">Artículos Pedidos</h3>
                <table style="width: 100%; border-collapse: collapse;">
                  <thead>
                    <tr style="background-color: #f3f4f6; border-bottom: 2px solid #e5e7eb;">
                      <th style="padding: 12px; text-align: left; color: #1f2937; font-weight: 600;">Producto</th>
                      <th style="padding: 12px; text-align: center; color: #1f2937; font-weight: 600;">Cantidad</th>
                      <th style="padding: 12px; text-align: right; color: #1f2937; font-weight: 600;">Precio</th>
                    </tr>
                  </thead>
                  <tbody>
                    ${itemsHtml}
                  </tbody>
                </table>
              </div>
              
              <div style="background-color: white; padding: 20px; margin: 20px 0; border-radius: 8px;">
                <div style="display: flex; justify-content: space-between; margin-bottom: 10px; border-bottom: 1px solid #e5e7eb; padding-bottom: 10px;">
                  <span style="color: #4b5563;">Subtotal</span>
                  <span style="color: #1f2937; font-weight: 600;">€${(subtotal / 100).toFixed(2)}</span>
                </div>
                <div style="display: flex; justify-content: space-between; margin-bottom: 10px; border-bottom: 1px solid #e5e7eb; padding-bottom: 10px;">
                  <span style="color: #4b5563;">Envío</span>
                  <span style="color: #1f2937; font-weight: 600;">€${(shipping / 100).toFixed(2)}</span>
                </div>
                <div style="display: flex; justify-content: space-between; padding-top: 10px; background-color: #f3f4f6; padding: 10px; margin-top: 10px; border-radius: 6px;">
                  <span style="color: #1f2937; font-weight: 700; font-size: 16px;">TOTAL</span>
                  <span style="color: #dc2626; font-weight: 700; font-size: 16px;">€${(total / 100).toFixed(2)}</span>
                </div>
              </div>
              
              <div style="background-color: #eff6ff; border-left: 4px solid #3b82f6; padding: 15px; margin: 20px 0; border-radius: 6px;">
                <p style="margin: 0; color: #1e40af; font-weight: 600;">📦 Próximos Pasos</p>
                <p style="margin: 8px 0 0 0; color: #3730a3; font-size: 14px;">
                  Tu pedido está siendo preparado. Recibirás un email con el número de seguimiento cuando se envíe.
                </p>
              </div>
              
              <p style="color: #4b5563; line-height: 1.6; margin-top: 20px;">
                Si tienes alguna pregunta sobre tu pedido, no dudes en contactarnos. Estamos aquí para ayudarte.
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

    console.log("✅ Email de confirmación enviado:", data.messageId);
    return { success: true, messageId: data.messageId };
  } catch (error: any) {
    console.error("❌ Error enviando email de confirmación:", error);
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

/**
 * Enviar email promocional de productos a suscriptores
 */
export async function sendPromotionalEmail(
  email: string,
  productName: string,
  productImage: string,
  productPrice: number,
  productUrl: string,
  discount?: number
) {
  const apiKey = getBrevoApiKey();
  if (!apiKey) {
    return { success: false, error: "API Key no configurada" };
  }

  const discountText = discount ? `¡Con un ${discount}% de descuento exclusivo!` : '';
  const formattedPrice = (productPrice / 100).toFixed(2);

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
        subject: `Última noticia: ${productName} está disponible en JGMarket`,
        htmlContent: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <div style="background: linear-gradient(to right, #dc2626, #991b1b); color: white; padding: 30px; text-align: center;">
              <h1 style="margin: 0; font-size: 32px;">JGMARKET</h1>
              <p style="margin: 10px 0 0 0;">La mejor moda deportiva actual</p>
            </div>
            
            <div style="padding: 30px; background-color: #f3f4f6;">
              <h2 style="color: #1f2937; margin-top: 0;">¡Te tenemos una sorpresa!</h2>
              <p style="color: #4b5563; line-height: 1.6;">
                Acaba de llegar algo que sabemos que te encantará.
              </p>
              
              <div style="background-color: white; border-radius: 8px; overflow: hidden; margin: 20px 0;">
                <img src="${productImage}" alt="${productName}" style="width: 100%; height: auto; display: block;" />
                <div style="padding: 20px;">
                  <h3 style="margin: 0 0 10px 0; color: #1f2937; font-size: 20px;">${productName}</h3>
                  <div style="display: flex; align-items: center; gap: 10px; margin: 15px 0;">
                    <p style="margin: 0; font-size: 28px; font-weight: bold; color: #dc2626;">€${formattedPrice}</p>
                    ${discountText ? `<p style="margin: 0; color: #4b5563; font-size: 14px;">${discountText}</p>` : ''}
                  </div>
                </div>
              </div>
              
              <div style="text-align: center; margin: 20px 0;">
                <a href="${productUrl}" style="display: inline-block; background-color: #14b8a6; color: white; padding: 12px 30px; text-decoration: none; border-radius: 6px; font-weight: bold;">
                  Ver Producto
                </a>
              </div>
              
              <p style="color: #4b5563; line-height: 1.6; font-size: 12px; text-align: center;">
                Si no deseas recibir estos emails, puedes darte de baja desde tu cuenta.
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

    console.log("✅ Email promocional enviado:", data.messageId);
    return { success: true, messageId: data.messageId };
  } catch (error: any) {
    console.error("❌ Error enviando email promocional:", error);
    return { success: false, error: error.message };
  }
}

/**
 * Enviar newsletter de oferta especial a todos los suscriptores
 */
export async function sendNewsletterPromotion(
  subscribers: string[],
  promotionTitle: string,
  promotionDescription: string,
  productsList: Array<{ name: string; image: string; price: number; url: string }>
) {
  const apiKey = getBrevoApiKey();
  if (!apiKey) {
    return { success: false, error: "API Key no configurada", sent: 0 };
  }

  const productsHtml = productsList
    .map(
      (product) =>
        `
        <div style="background-color: white; border-radius: 8px; overflow: hidden; margin-bottom: 15px;">
          <img src="${product.image}" alt="${product.name}" style="width: 100%; height: 250px; object-fit: cover; display: block;" />
          <div style="padding: 15px;">
            <h4 style="margin: 0 0 8px 0; color: #1f2937;">${product.name}</h4>
            <p style="margin: 0; font-size: 20px; font-weight: bold; color: #dc2626;">€${(product.price / 100).toFixed(2)}</p>
            <a href="${product.url}" style="display: inline-block; margin-top: 10px; background-color: #14b8a6; color: white; padding: 8px 16px; text-decoration: none; border-radius: 4px; font-size: 12px; font-weight: bold;">
              Ver Producto
            </a>
          </div>
        </div>
      `
    )
    .join('');

  let sentCount = 0;
  const errors: string[] = [];

  for (const email of subscribers) {
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
          subject: promotionTitle,
          htmlContent: `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
              <div style="background: linear-gradient(to right, #dc2626, #991b1b); color: white; padding: 30px; text-align: center;">
                <h1 style="margin: 0; font-size: 32px;">JGMARKET</h1>
                <p style="margin: 10px 0 0 0;">La mejor moda deportiva actual</p>
              </div>
              
              <div style="padding: 30px; background-color: #f3f4f6;">
                <h2 style="color: #1f2937; margin-top: 0;">${promotionTitle}</h2>
                <p style="color: #4b5563; line-height: 1.6;">
                  ${promotionDescription}
                </p>
                
                <div style="margin: 30px 0;">
                  ${productsHtml}
                </div>
              </div>
              
              <div style="background-color: #1f2937; color: white; padding: 20px; text-align: center; font-size: 12px;">
                <p style="margin: 0;">© 2026 JGMarket. Todos los derechos reservados.</p>
              </div>
            </div>
          `,
        }),
      });

      if (response.ok) {
        const data = await response.json();
        console.log(`✅ Email promocional enviado a ${email}`);
        sentCount++;
      } else {
        const errorText = await response.text();
        errors.push(`${email}: ${response.status}`);
      }
    } catch (error: any) {
      errors.push(`${email}: ${error.message}`);
    }
  }

  return {
    success: sentCount > 0,
    sent: sentCount,
    total: subscribers.length,
    errors: errors.length > 0 ? errors : undefined,
  };
}

