import type { APIRoute } from 'astro';
import { createClient } from '@supabase/supabase-js';

export const prerender = false;

const BREVO_API_URL = 'https://api.brevo.com/v3/smtp/email';

const supabaseUrl = import.meta.env.PUBLIC_SUPABASE_URL;
const supabaseServiceKey = import.meta.env.SUPABASE_SERVICE_ROLE_KEY;

const supabase = createClient(supabaseUrl, supabaseServiceKey || import.meta.env.PUBLIC_SUPABASE_ANON_KEY, {
  auth: { autoRefreshToken: false, persistSession: false },
});

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

/**
 * POST /api/orders/refund
 * Crea una devolución para productos de un pedido completado
 * Body: { orderId, items: [{ order_item_id, product_name, quantity, price_cents, size }], reason, customerEmail, customerName }
 */
export const POST: APIRoute = async ({ request }) => {
  try {
    const body = await request.json();
    const { orderId, items, reason, customerEmail, customerName } = body;

    console.log('🔄 Solicitud de devolución:', { orderId, items: items?.length, reason });

    if (!orderId || !items || items.length === 0 || !reason || !customerEmail) {
      return new Response(
        JSON.stringify({ error: 'Faltan datos requeridos (orderId, items, reason, customerEmail)' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    // 1. Verificar que el pedido existe y está completado
    const { data: order, error: orderError } = await supabase
      .from('orders')
      .select('*, items:order_items(*)')
      .eq('id', orderId)
      .single();

    if (orderError || !order) {
      return new Response(
        JSON.stringify({ error: 'Pedido no encontrado' }),
        { status: 404, headers: { 'Content-Type': 'application/json' } }
      );
    }

    if (order.status !== 'completed') {
      return new Response(
        JSON.stringify({ error: 'Solo se pueden devolver pedidos completados' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    // 2. Calcular monto total de devolución
    const refundAmountCents = items.reduce((sum: number, item: any) => {
      return sum + (item.price_cents * item.quantity);
    }, 0);

    // Traducir motivo a español
    const reasonSpanish = translateReason(reason);

    // 3. Crear la devolución directamente como procesada
    const { data: refund, error: refundError } = await supabase
      .from('refunds')
      .insert({
        order_id: orderId,
        customer_email: customerEmail,
        customer_name: customerName || 'Cliente',
        reason: reasonSpanish,
        returned_items: items,
        refund_amount_cents: refundAmountCents,
        refund_method: 'original_payment',
        status: 'processed',
        processed_at: new Date().toISOString(),
        refund_date: new Date().toISOString(),
      })
      .select()
      .single();

    if (refundError) {
      console.error('❌ Error creando devolución:', refundError);
      return new Response(
        JSON.stringify({ error: 'Error al crear la devolución', details: refundError.message }),
        { status: 500, headers: { 'Content-Type': 'application/json' } }
      );
    }

    console.log('✅ Devolución creada:', refund.id);

    // 4. Restaurar stock por talla de los productos devueltos
    for (const item of items) {
      if (item.product_id && item.size) {
        const { error: stockError } = await supabase.rpc('increment_stock', {
          p_product_id: item.product_id,
          p_size: item.size,
          p_quantity: item.quantity,
        });

        if (stockError) {
          // Intentar update directo si la RPC no existe
          console.warn('RPC increment_stock no disponible, update directo');
          await supabase
            .from('product_sizes')
            .update({ stock: supabase.rpc('', {}) }) // fallback
            .eq('product_id', item.product_id)
            .eq('size', item.size);
        }
      }
    }

    // 5. Crear factura de abono (credit note) en invoices
    let creditNote = null;
    try {
      // Generar número de factura de abono
      const creditNoteNumber = `ABN-${Date.now()}-${Math.random().toString(36).substr(2, 6).toUpperCase()}`;

      const { data: creditNoteData, error: cnError } = await supabase
        .from('invoices')
        .insert({
          invoice_number: creditNoteNumber,
          order_id: orderId,
          customer_email: customerEmail,
          customer_name: customerName || 'Cliente',
          type: 'credit_note',
          subtotal_cents: -refundAmountCents,
          tax_cents: 0,
          total_cents: -refundAmountCents,
          items: items,
          status: 'issued',
          reason: reasonSpanish,
          reference_invoice_id: null,
        })
        .select()
        .single();

      if (cnError) {
        console.warn('⚠️ Error creando factura de abono:', cnError);
      } else {
        creditNote = creditNoteData;
        console.log('✅ Factura de abono creada:', creditNote.id);

        // Actualizar refund con el credit_note_id
        await supabase
          .from('refunds')
          .update({ credit_note_id: creditNote.id })
          .eq('id', refund.id);
      }
    } catch (invoiceErr) {
      console.warn('⚠️ Error en factura de abono:', invoiceErr);
    }

    // 6. Enviar email de confirmación de devolución directamente via Brevo
    try {
      const brevoApiKey = import.meta.env.BREVO_API_KEY;
      if (brevoApiKey) {
        const refundAmountFormatted = (refundAmountCents / 100).toFixed(2);
        const returnedItems = Array.isArray(items) ? items : [];

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
            <div style="background: linear-gradient(135deg, #ea580c, #c2410c); color: white; padding: 30px; text-align: center;">
              <h1 style="margin: 0; font-size: 28px; font-weight: 900;">JGMARKET</h1>
              <p style="margin: 8px 0 0 0; font-size: 14px; opacity: 0.9;">Confirmación de Devolución</p>
            </div>
            <div style="padding: 30px; background-color: white;">
              <div style="text-align: center; margin-bottom: 24px;">
                <div style="display: inline-block; width: 60px; height: 60px; background-color: #fff7ed; border-radius: 50%; line-height: 60px; font-size: 28px;">✅</div>
              </div>
              <h2 style="color: #1f2937; text-align: center; margin-top: 0; font-size: 22px;">Devolución Procesada</h2>
              <p style="color: #4b5563; line-height: 1.6; text-align: center;">Hola <strong>${customerName || 'Cliente'}</strong>, tu devolución ha sido procesada correctamente.</p>
              ${order.order_number ? `<div style="text-align: center; margin: 16px 0;"><span style="background-color: #f3f4f6; padding: 6px 16px; border-radius: 20px; font-size: 13px; color: #6b7280;">Pedido: <strong>${order.order_number}</strong></span></div>` : ''}
              <div style="background-color: #fff7ed; border: 1px solid #fed7aa; border-radius: 8px; padding: 14px; margin: 20px 0;">
                <p style="margin: 0; font-size: 13px; color: #9a3412;"><strong>Motivo:</strong> ${reasonSpanish}</p>
              </div>
              <table style="width: 100%; border-collapse: collapse; margin: 20px 0;">
                <thead><tr style="background-color: #ea580c;">
                  <th style="padding: 10px 16px; text-align: left; color: white; font-size: 12px; text-transform: uppercase;">Producto</th>
                  <th style="padding: 10px 16px; text-align: center; color: white; font-size: 12px; text-transform: uppercase;">Cant.</th>
                  <th style="padding: 10px 16px; text-align: right; color: white; font-size: 12px; text-transform: uppercase;">Importe</th>
                </tr></thead>
                <tbody>${itemsHtml}</tbody>
              </table>
              <div style="background-color: #fef2f2; border: 2px solid #fca5a5; border-radius: 8px; padding: 16px; text-align: center; margin: 20px 0;">
                <p style="margin: 0; font-size: 13px; color: #991b1b;">Total a reembolsar</p>
                <p style="margin: 8px 0 0 0; font-size: 28px; font-weight: 900; color: #dc2626;">${refundAmountFormatted}€</p>
                <p style="margin: 8px 0 0 0; font-size: 12px; color: #991b1b;">El reembolso se procesará en 5-7 días hábiles</p>
              </div>
              ${creditNote?.invoice_number ? `<p style="text-align: center; font-size: 13px; color: #6b7280; margin-top: 16px;">Factura de abono: <strong>${creditNote.invoice_number}</strong></p>` : ''}
              <div style="background-color: #eff6ff; border: 1px solid #bfdbfe; border-radius: 8px; padding: 14px; margin-top: 20px;">
                <p style="margin: 0; font-size: 13px; color: #1e40af;"><strong>ℹ️ Información:</strong> El reembolso se realizará al método de pago original utilizado en la compra.</p>
              </div>
            </div>
            <div style="background-color: #1f2937; color: #9ca3af; padding: 20px; text-align: center; font-size: 12px;">
              <p style="margin: 0;">© 2026 JGMarket. Todos los derechos reservados.</p>
            </div>
          </div>
        `;

        const emailResponse = await fetch(BREVO_API_URL, {
          method: 'POST',
          headers: {
            'api-key': brevoApiKey,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            sender: { email: 'jaimechipiona2006@gmail.com', name: 'JGMarket' },
            to: [{ email: customerEmail }],
            subject: `Devolución Procesada - JGMarket${order.order_number ? ` | Pedido ${order.order_number}` : ''}`,
            htmlContent: htmlContent,
          }),
        });

        if (emailResponse.ok) {
          const emailData = await emailResponse.json();
          console.log('📧 Email de devolución enviado:', emailData.messageId);
        } else {
          const errText = await emailResponse.text();
          console.warn('⚠️ Error enviando email Brevo:', emailResponse.status, errText);
        }
      } else {
        console.warn('⚠️ BREVO_API_KEY no configurada, email no enviado');
      }
    } catch (emailErr) {
      console.warn('⚠️ Error en email:', emailErr);
    }

    return new Response(
      JSON.stringify({
        success: true,
        message: 'Devolución procesada exitosamente',
        refund: refund,
        creditNote: creditNote,
        refundAmount: (refundAmountCents / 100).toFixed(2),
      }),
      { status: 200, headers: { 'Content-Type': 'application/json' } }
    );
  } catch (error: any) {
    console.error('❌ Error en refund endpoint:', error);
    return new Response(
      JSON.stringify({ error: 'Error interno del servidor', details: error.message }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
};
