import type { APIRoute } from 'astro';
import { supabaseClient } from '../../lib/supabase';

interface InvoiceData {
  order_id: string;
  customer_email: string;
  customer_name: string;
  subtotal_cents: number;
  tax_cents: number;
  total_cents: number;
  items: any[];
}

// Función para generar número de factura único
async function generateInvoiceNumber(): Promise<string> {
  const year = new Date().getFullYear();
  
  // Obtener el último número de factura del año
  const { data: lastInvoice, error } = await supabaseClient
    .from('invoices')
    .select('invoice_number')
    .eq('type', 'invoice')
    .gte('issued_at', `${year}-01-01`)
    .lte('issued_at', `${year}-12-31`)
    .order('created_at', { ascending: false })
    .limit(1);

  if (error) {
    console.error('Error fetching last invoice:', error);
  }

  let nextNumber = 1;
  if (lastInvoice && lastInvoice.length > 0) {
    const lastNumber = lastInvoice[0].invoice_number.split('-')[2];
    nextNumber = parseInt(lastNumber) + 1;
  }

  return `FAC-${year}-${String(nextNumber).padStart(4, '0')}`;
}

// Función para generar HTML de la factura
function generateInvoiceHTML(
  invoiceNumber: string,
  customerName: string,
  customerEmail: string,
  items: any[],
  subtotalCents: number,
  taxCents: number,
  totalCents: number,
  issuedDate: string
): string {
  const subtotal = (subtotalCents / 100).toFixed(2);
  const tax = (taxCents / 100).toFixed(2);
  const total = (totalCents / 100).toFixed(2);

  const itemsHTML = items
    .map(
      (item: any) => `
    <tr>
      <td style="padding: 10px; border-bottom: 1px solid #ddd;">${item.product_name || 'Producto'}</td>
      <td style="padding: 10px; border-bottom: 1px solid #ddd; text-align: center;">${item.quantity || 1}</td>
      <td style="padding: 10px; border-bottom: 1px solid #ddd; text-align: right;">€${((item.price_cents || 0) / 100).toFixed(2)}</td>
      <td style="padding: 10px; border-bottom: 1px solid #ddd; text-align: right;">€${(((item.price_cents || 0) * (item.quantity || 1)) / 100).toFixed(2)}</td>
    </tr>
  `
    )
    .join('');

  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="UTF-8">
      <style>
        body {
          font-family: Arial, sans-serif;
          margin: 0;
          padding: 20px;
          background-color: #f5f5f5;
        }
        .invoice {
          max-width: 800px;
          margin: 0 auto;
          background-color: white;
          padding: 40px;
          border-radius: 8px;
          box-shadow: 0 2px 4px rgba(0,0,0,0.1);
        }
        .header {
          display: flex;
          justify-content: space-between;
          align-items: start;
          margin-bottom: 40px;
          border-bottom: 2px solid #1FC0A0;
          padding-bottom: 20px;
        }
        .logo-section h1 {
          margin: 0;
          color: #000;
          font-size: 28px;
        }
        .logo-section p {
          margin: 5px 0 0 0;
          color: #666;
          font-size: 12px;
        }
        .invoice-details {
          text-align: right;
        }
        .invoice-details .title {
          color: #1FC0A0;
          font-weight: bold;
          font-size: 18px;
          margin-bottom: 10px;
        }
        .invoice-details p {
          margin: 5px 0;
          font-size: 13px;
          color: #333;
        }
        .customer-info {
          margin-bottom: 30px;
          padding: 15px;
          background-color: #f9f9f9;
          border-left: 4px solid #1FC0A0;
        }
        .customer-info h3 {
          margin: 0 0 10px 0;
          color: #333;
          font-size: 14px;
          text-transform: uppercase;
        }
        .customer-info p {
          margin: 5px 0;
          font-size: 13px;
          color: #666;
        }
        table {
          width: 100%;
          margin-bottom: 30px;
          border-collapse: collapse;
        }
        table th {
          background-color: #f0f0f0;
          color: #333;
          font-weight: bold;
          padding: 12px;
          text-align: left;
          border-bottom: 2px solid #1FC0A0;
        }
        .totals {
          width: 100%;
          max-width: 400px;
          margin-left: auto;
          margin-right: 0;
        }
        .total-row {
          display: flex;
          justify-content: space-between;
          padding: 12px 0;
          font-size: 14px;
          border-bottom: 1px solid #ddd;
        }
        .total-row.total {
          font-weight: bold;
          font-size: 16px;
          color: #1FC0A0;
          border-bottom: 2px solid #1FC0A0;
          padding: 15px 0;
        }
        .footer {
          margin-top: 40px;
          padding-top: 20px;
          border-top: 1px solid #ddd;
          text-align: center;
          font-size: 11px;
          color: #999;
        }
      </style>
    </head>
    <body>
      <div class="invoice">
        <div class="header">
          <div class="logo-section">
            <h1>TIENDA ONLINE</h1>
            <p>Factura Electrónica</p>
          </div>
          <div class="invoice-details">
            <div class="title">${invoiceNumber}</div>
            <p><strong>Fecha:</strong> ${issuedDate}</p>
          </div>
        </div>

        <div class="customer-info">
          <h3>Información del Cliente</h3>
          <p><strong>Nombre:</strong> ${customerName}</p>
          <p><strong>Email:</strong> ${customerEmail}</p>
        </div>

        <table>
          <thead>
            <tr>
              <th>Producto</th>
              <th style="text-align: center;">Cantidad</th>
              <th style="text-align: right;">Precio Unit.</th>
              <th style="text-align: right;">Subtotal</th>
            </tr>
          </thead>
          <tbody>
            ${itemsHTML}
          </tbody>
        </table>

        <div class="totals">
          <div class="total-row">
            <span>Subtotal:</span>
            <span>€${subtotal}</span>
          </div>
          ${taxCents > 0 ? `
          <div class="total-row">
            <span>Impuestos (IVA):</span>
            <span>€${tax}</span>
          </div>
          ` : ''}
          <div class="total-row total">
            <span>TOTAL:</span>
            <span>€${total}</span>
          </div>
        </div>

        <div class="footer">
          <p>Esta es una factura electrónica generada automáticamente.</p>
          <p>Gracias por su compra.</p>
        </div>
      </div>
    </body>
    </html>
  `;
}

export const GET: APIRoute = async (context) => {
  return handleInvoiceRequest(context);
};

async function handleInvoiceRequest(context: any) {
  try {
    const url = context.url;
    
    // Obtener parámetros de la URL
    let sessionId = url.searchParams?.get('session_id');
    let orderId = url.searchParams?.get('order_id');
    
    // Si searchParams no funciona, intentar parsear manualmente
    if (!sessionId && url.toString().includes('session_id=')) {
      const match = url.toString().match(/session_id=([^&]+)/);
      if (match) {
        sessionId = decodeURIComponent(match[1]);
      }
    }

    console.log('Invoice API called with:', { sessionId, orderId });

    if (!sessionId && !orderId) {
      return new Response(JSON.stringify({ error: 'Missing session_id or order_id' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    // Obtener el pedido desde Stripe session_id o order_id
    let order: any = null;

    if (sessionId) {
      // Buscar por session_id
      let { data: orders, error: orderError } = await supabaseClient
        .from('orders')
        .select('*')
        .eq('session_id', sessionId)
        .single();

      // Si no encuentra, intentar con stripe_session_id (fallback)
      if ((orderError || !orders) && sessionId) {
        const { data: ordersAlt, error: orderErrorAlt } = await supabaseClient
          .from('orders')
          .select('*')
          .eq('stripe_session_id', sessionId)
          .single();
        
        orders = ordersAlt;
        orderError = orderErrorAlt;
      }

      if (orderError || !orders) {
        console.error('Order not found:', orderError);
        return new Response(JSON.stringify({ error: 'Order not found' }), {
          status: 404,
          headers: { 'Content-Type': 'application/json' },
        });
      }
      order = orders;
    } else if (orderId) {
      const { data: orders, error: orderError } = await supabaseClient
        .from('orders')
        .select('*')
        .eq('id', orderId)
        .single();

      if (orderError || !orders) {
        return new Response(JSON.stringify({ error: 'Order not found' }), {
          status: 404,
          headers: { 'Content-Type': 'application/json' },
        });
      }
      order = orders;
    }

    // Verificar si ya existe factura para este pedido
    const { data: existingInvoice } = await supabaseClient
      .from('invoices')
      .select('*')
      .eq('order_id', order.id)
      .eq('type', 'invoice')
      .single();

    let invoiceNumber: string;
    let invoiceId: string;

    if (existingInvoice) {
      // Usar factura existente
      invoiceNumber = existingInvoice.invoice_number;
      invoiceId = existingInvoice.id;
    } else {
      // Crear nueva factura
      invoiceNumber = await generateInvoiceNumber();

      // Extraer items del JSON o de order_items
      let items = [];
      if (order.items && Array.isArray(order.items)) {
        items = order.items;
      }

      const subtotalCents = order.subtotal_cents || order.total_cents - (order.tax_cents || 0);
      const taxCents = order.tax_cents || 0;
      const totalCents = order.total_cents;

      // Guardar factura en BD
      const { data: newInvoice, error: insertError } = await supabaseClient
        .from('invoices')
        .insert({
          invoice_number: invoiceNumber,
          order_id: order.id,
          customer_email: order.customer_email,
          customer_name: order.customer_name,
          type: 'invoice',
          subtotal_cents: subtotalCents,
          tax_cents: taxCents,
          total_cents: totalCents,
          items: items,
          status: 'issued',
          issued_at: new Date().toISOString(),
        })
        .select()
        .single();

      if (insertError) {
        console.error('Error creating invoice:', insertError);
        return new Response(JSON.stringify({ error: 'Error creating invoice' }), {
          status: 500,
          headers: { 'Content-Type': 'application/json' },
        });
      }

      invoiceId = newInvoice.id;
    }

    // Extraer datos para generar PDF
    const items = order.items || [];
    const subtotalCents = order.subtotal_cents || order.total_cents - (order.tax_cents || 0);
    const taxCents = order.tax_cents || 0;
    const totalCents = order.total_cents;
    const issuedDate = new Date().toLocaleDateString('es-ES', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });

    // Generar HTML
    const htmlContent = generateInvoiceHTML(
      invoiceNumber,
      order.customer_name,
      order.customer_email,
      items,
      subtotalCents,
      taxCents,
      totalCents,
      issuedDate
    );

    // Retornar HTML como respuesta
    return new Response(htmlContent, {
      status: 200,
      headers: {
        'Content-Type': 'text/html; charset=utf-8',
        'Content-Disposition': `attachment; filename="Factura-${invoiceNumber}.html"`,
      },
    });
  } catch (error) {
    console.error('Invoice API error:', error);
    return new Response(JSON.stringify({ error: 'Internal server error' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
};
