import type { APIRoute } from 'astro';

export const prerender = false;

const BREVO_API_URL = "https://api.brevo.com/v3/smtp/email";

// Mapa de motivos en español
const REASON_MAP: Record<string, string> = {
  defective: 'Producto defectuoso o dañado',
  wrong_size: 'Talla incorrecta',
  not_as_described: 'No coincide con la descripción',
  wrong_product: 'Recibí un producto equivocado',
  not_satisfied: 'No estoy satisfecho con la calidad',
  other: 'Otro motivo',
};

function translateReason(reason: string): string {
  return REASON_MAP[reason] || reason;
}

export const POST: APIRoute = async ({ request }) => {
  try {
    const body = await request.json();
    const { email, customerName, orderNumber, items, refundAmount, reason, refundId, creditNoteNumber } = body;

    if (!email) {
      return new Response(
        JSON.stringify({ error: 'Email es requerido' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    const apiKey = import.meta.env.BREVO_API_KEY;
    if (!apiKey) {
      console.warn('⚠️ BREVO_API_KEY no configurada');
      return new Response(
        JSON.stringify({ success: false, error: 'API Key no configurada' }),
        { status: 200, headers: { 'Content-Type': 'application/json' } }
      );
    }

    const returnedItems = Array.isArray(items) ? items : [];
    const refundAmountFormatted = ((refundAmount || 0) / 100).toFixed(2);

    // Generar HTML de items devueltos
    const itemsHtml = returnedItems.map((item: any) => `
      <tr>
        <td style="padding: 10px 16px; border-bottom: 1px solid #f3f4f6; font-size: 14px;">
          ${item.product_name || 'Producto'}${item.size ? ` <span style="color: #9ca3af;">(Talla: ${item.size})</span>` : ''}
        </td>
        <td style="padding: 10px 16px; border-bottom: 1px solid #f3f4f6; font-size: 14px; text-align: center;">${item.quantity || 1}</td>
        <td style="padding: 10px 16px; border-bottom: 1px solid #f3f4f6; font-size: 14px; text-align: right; font-weight: 600;">
          ${(((item.price_cents || 0) * (item.quantity || 1)) / 100).toFixed(2)}€
        </td>
      </tr>
    `).join('');

    const htmlContent = `
      <div style="font-family: 'Segoe UI', Arial, sans-serif; max-width: 600px; margin: 0 auto; background-color: #f9fafb;">
        <!-- Header -->
        <div style="background: linear-gradient(135deg, #ea580c, #c2410c); color: white; padding: 30px; text-align: center;">
          <h1 style="margin: 0; font-size: 28px; font-weight: 900;">JGMARKET</h1>
          <p style="margin: 8px 0 0 0; font-size: 14px; opacity: 0.9;">Confirmación de Devolución</p>
        </div>

        <!-- Body -->
        <div style="padding: 30px; background-color: white;">
          <div style="text-align: center; margin-bottom: 24px;">
            <div style="display: inline-block; width: 60px; height: 60px; background-color: #fff7ed; border-radius: 50%; line-height: 60px; font-size: 28px;">
              ✅
            </div>
          </div>

          <h2 style="color: #1f2937; text-align: center; margin-top: 0; font-size: 22px;">
            Devolución Procesada
          </h2>
          
          <p style="color: #4b5563; line-height: 1.6; text-align: center;">
            Hola <strong>${customerName || 'Cliente'}</strong>, tu devolución ha sido procesada correctamente.
          </p>

          ${orderNumber ? `
          <div style="text-align: center; margin: 16px 0;">
            <span style="background-color: #f3f4f6; padding: 6px 16px; border-radius: 20px; font-size: 13px; color: #6b7280;">
              Pedido: <strong>${orderNumber}</strong>
            </span>
          </div>
          ` : ''}

          <!-- Motivo -->
          <div style="background-color: #fff7ed; border: 1px solid #fed7aa; border-radius: 8px; padding: 14px; margin: 20px 0;">
            <p style="margin: 0; font-size: 13px; color: #9a3412;">
              <strong>Motivo:</strong> ${translateReason(reason || 'No especificado')}
            </p>
          </div>

          <!-- Productos devueltos -->
          <table style="width: 100%; border-collapse: collapse; margin: 20px 0;">
            <thead>
              <tr style="background-color: #ea580c;">
                <th style="padding: 10px 16px; text-align: left; color: white; font-size: 12px; text-transform: uppercase;">Producto</th>
                <th style="padding: 10px 16px; text-align: center; color: white; font-size: 12px; text-transform: uppercase;">Cant.</th>
                <th style="padding: 10px 16px; text-align: right; color: white; font-size: 12px; text-transform: uppercase;">Importe</th>
              </tr>
            </thead>
            <tbody>
              ${itemsHtml}
            </tbody>
          </table>

          <!-- Total reembolso -->
          <div style="background-color: #fef2f2; border: 2px solid #fca5a5; border-radius: 8px; padding: 16px; text-align: center; margin: 20px 0;">
            <p style="margin: 0; font-size: 13px; color: #991b1b;">Total a reembolsar</p>
            <p style="margin: 8px 0 0 0; font-size: 28px; font-weight: 900; color: #dc2626;">${refundAmountFormatted}€</p>
            <p style="margin: 8px 0 0 0; font-size: 12px; color: #991b1b;">El reembolso se procesará en 5-7 días hábiles</p>
          </div>

          ${creditNoteNumber ? `
          <p style="text-align: center; font-size: 13px; color: #6b7280; margin-top: 16px;">
            Factura de abono: <strong>${creditNoteNumber}</strong>
          </p>
          ` : ''}

          <!-- Info -->
          <div style="background-color: #eff6ff; border: 1px solid #bfdbfe; border-radius: 8px; padding: 14px; margin-top: 20px;">
            <p style="margin: 0; font-size: 13px; color: #1e40af;">
              <strong>ℹ️ Información:</strong> El reembolso se realizará al método de pago original utilizado en la compra.
              Si tienes alguna duda, no dudes en contactarnos.
            </p>
          </div>
        </div>

        <!-- Footer -->
        <div style="background-color: #1f2937; color: #9ca3af; padding: 20px; text-align: center; font-size: 12px;">
          <p style="margin: 0;">© 2026 JGMarket. Todos los derechos reservados.</p>
          <p style="margin: 4px 0 0 0;">Gracias por tu confianza</p>
        </div>
      </div>
    `;

    const response = await fetch(BREVO_API_URL, {
      method: 'POST',
      headers: {
        'api-key': apiKey,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        sender: { email: 'jaimechipiona2006@gmail.com', name: 'JGMarket' },
        to: [{ email: email }],
        subject: `Devolución Procesada - JGMarket${orderNumber ? ` | Pedido ${orderNumber}` : ''}`,
        htmlContent: htmlContent,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('❌ Error Brevo:', response.status, errorText);
      return new Response(
        JSON.stringify({ success: false, error: `Error ${response.status}` }),
        { status: 200, headers: { 'Content-Type': 'application/json' } }
      );
    }

    const data = await response.json();
    console.log('✅ Email de devolución enviado:', data.messageId);

    return new Response(
      JSON.stringify({ success: true, messageId: data.messageId }),
      { status: 200, headers: { 'Content-Type': 'application/json' } }
    );
  } catch (error: any) {
    console.error('❌ Error:', error);
    return new Response(
      JSON.stringify({ success: false, error: error.message }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
};
