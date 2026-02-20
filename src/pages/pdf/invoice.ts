import type { APIRoute } from 'astro';
import { sendInvoiceEmail } from '../../lib/email';
import { createClient } from '@supabase/supabase-js';

// Marcar como dinámico para acceder a query parameters
export const prerender = false;

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
async function generateInvoiceNumber(adminClient: any): Promise<string> {
  const year = new Date().getFullYear();

  // Obtener el último número de factura del año
  const { data: lastInvoice, error } = await adminClient
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
  issuedDate: string,
  orderNumber: string
): string {
  const subtotal = (subtotalCents / 100).toFixed(2);
  const tax = (taxCents / 100).toFixed(2);
  const total = (totalCents / 100).toFixed(2);

  const itemsHTML = items
    .map(
      (item: any) => {
        let priceCents = item.price_cents || 0;
        if (priceCents === 0 && item.price) {
          priceCents = Math.round(item.price * 100);
        }
        const quantity = item.quantity || 1;
        const itemSubtotal = priceCents * quantity;

        return `
    <tr>
      <td style="padding: 14px 16px; border-bottom: 1px solid #eef0f3; color: #1a1a2e; font-size: 14px;">
        <div style="font-weight: 600;">${item.name || item.product_name || 'Producto'}</div>
        ${item.size ? `<span style="font-size: 12px; color: #6b7280;">Talla: ${item.size}</span>` : ''}
        ${item.color ? `<span style="font-size: 12px; color: #6b7280; margin-left: 8px;">Color: ${item.color}</span>` : ''}
      </td>
      <td style="padding: 14px 16px; border-bottom: 1px solid #eef0f3; text-align: center; color: #374151; font-size: 14px;">${quantity}</td>
      <td style="padding: 14px 16px; border-bottom: 1px solid #eef0f3; text-align: right; color: #374151; font-size: 14px;">€${(priceCents / 100).toFixed(2)}</td>
      <td style="padding: 14px 16px; border-bottom: 1px solid #eef0f3; text-align: right; color: #1a1a2e; font-weight: 600; font-size: 14px;">€${(itemSubtotal / 100).toFixed(2)}</td>
    </tr>
  `;
      }
    )
    .join('');

  const taxHTML = taxCents > 0 ? `
                <div class="total-row tax">
                  <span>IVA (21%)</span>
                  <span>&euro;${tax}</span>
                </div>
                ` : '';

  return `<!DOCTYPE html>
    <html lang="es">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Factura ${invoiceNumber} - JGMarket</title>
      <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body {
          font-family: 'Segoe UI', system-ui, -apple-system, sans-serif;
          background-color: #f0f2f5;
          padding: 30px 20px;
          color: #1a1a2e;
          -webkit-print-color-adjust: exact;
          print-color-adjust: exact;
        }
        .invoice-wrapper {
          max-width: 820px;
          margin: 0 auto;
        }
        .action-bar {
          display: flex;
          gap: 12px;
          justify-content: flex-end;
          margin-bottom: 20px;
        }
        .btn {
          padding: 12px 24px;
          border: none;
          border-radius: 8px;
          cursor: pointer;
          font-size: 14px;
          font-weight: 600;
          text-decoration: none;
          display: inline-flex;
          align-items: center;
          gap: 8px;
          transition: all 0.2s;
        }
        .btn-pdf {
          background: linear-gradient(135deg, #dc2626, #b91c1c);
          color: white;
          box-shadow: 0 2px 8px rgba(220, 38, 38, 0.3);
        }
        .btn-pdf:hover { transform: translateY(-1px); box-shadow: 0 4px 12px rgba(220, 38, 38, 0.4); }
        .btn-print {
          background: white;
          color: #374151;
          border: 2px solid #e5e7eb;
        }
        .btn-print:hover { border-color: #9ca3af; background: #f9fafb; }
        @media print {
          body { padding: 0; background: white; }
          .action-bar { display: none !important; }
          .invoice-card { box-shadow: none !important; }
        }
        .invoice-card {
          background: white;
          border-radius: 16px;
          box-shadow: 0 4px 24px rgba(0,0,0,0.08);
          overflow: hidden;
        }
        .invoice-header {
          background: linear-gradient(135deg, #1a1a2e 0%, #16213e 100%);
          padding: 40px;
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
        }
        .brand h1 {
          font-size: 32px;
          font-weight: 800;
          color: white;
          letter-spacing: -0.5px;
        }
        .brand h1 span { color: #dc2626; }
        .brand p {
          color: rgba(255,255,255,0.6);
          font-size: 13px;
          margin-top: 4px;
          letter-spacing: 2px;
          text-transform: uppercase;
        }
        .invoice-meta {
          text-align: right;
          color: white;
        }
        .invoice-meta .invoice-num {
          font-size: 22px;
          font-weight: 700;
          color: #dc2626;
          margin-bottom: 8px;
        }
        .invoice-meta p {
          font-size: 13px;
          color: rgba(255,255,255,0.7);
          margin: 3px 0;
        }
        .invoice-meta p strong { color: rgba(255,255,255,0.9); }
        .invoice-body { padding: 40px; }
        .info-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 24px;
          margin-bottom: 36px;
        }
        .info-card {
          background: #f8f9fb;
          border-radius: 12px;
          padding: 20px 24px;
          border: 1px solid #eef0f3;
        }
        .info-card h3 {
          font-size: 11px;
          text-transform: uppercase;
          letter-spacing: 1.5px;
          color: #9ca3af;
          font-weight: 600;
          margin-bottom: 12px;
        }
        .info-card p {
          font-size: 14px;
          color: #374151;
          margin: 6px 0;
          line-height: 1.5;
        }
        .info-card p strong { color: #1a1a2e; }
        table {
          width: 100%;
          border-collapse: collapse;
          margin-bottom: 32px;
        }
        table thead th {
          background: #f8f9fb;
          color: #6b7280;
          font-weight: 600;
          font-size: 11px;
          text-transform: uppercase;
          letter-spacing: 1px;
          padding: 14px 16px;
          text-align: left;
          border-bottom: 2px solid #eef0f3;
        }
        .totals-section {
          display: flex;
          justify-content: flex-end;
        }
        .totals-box {
          width: 320px;
          background: #f8f9fb;
          border-radius: 12px;
          padding: 20px 24px;
          border: 1px solid #eef0f3;
        }
        .total-row {
          display: flex;
          justify-content: space-between;
          padding: 10px 0;
          font-size: 14px;
          color: #374151;
        }
        .total-row.subtotal { border-bottom: 1px solid #eef0f3; }
        .total-row.tax { border-bottom: 1px solid #eef0f3; }
        .total-row.grand-total {
          padding-top: 14px;
          margin-top: 4px;
          font-size: 18px;
          font-weight: 700;
          color: #1a1a2e;
        }
        .total-row.grand-total span:last-child { color: #dc2626; }
        .invoice-footer {
          background: #f8f9fb;
          border-top: 1px solid #eef0f3;
          padding: 24px 40px;
          text-align: center;
        }
        .invoice-footer p {
          font-size: 12px;
          color: #9ca3af;
          line-height: 1.6;
        }
        .invoice-footer .brand-footer {
          font-weight: 700;
          color: #1a1a2e;
          font-size: 13px;
          margin-top: 8px;
        }
      </style>
    </head>
    <body>
      <div class="invoice-wrapper">
        <div class="action-bar">
          <button class="btn btn-print" onclick="window.print()">
            <svg width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z"/></svg>
            Imprimir
          </button>
          <button class="btn btn-pdf" onclick="downloadPDF()">
            <svg width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"/></svg>
            Descargar PDF
          </button>
        </div>

        <div class="invoice-card">
          <div class="invoice-header">
            <div class="brand">
              <h1>JG<span>MARKET</span></h1>
              <p>Factura electr&oacute;nica</p>
            </div>
            <div class="invoice-meta">
              <div class="invoice-num">${invoiceNumber}</div>
              <p><strong>Fecha:</strong> ${issuedDate}</p>
              <p><strong>Pedido:</strong> #${orderNumber}</p>
            </div>
          </div>

          <div class="invoice-body">
            <div class="info-grid">
              <div class="info-card">
                <h3>Datos del Cliente</h3>
                <p><strong>${customerName}</strong></p>
                <p>${customerEmail}</p>
              </div>
              <div class="info-card">
                <h3>Datos de la Empresa</h3>
                <p><strong>JGMarket</strong></p>
                <p>CIF: B-12345678</p>
                <p>info@jgmarket.com</p>
              </div>
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

            <div class="totals-section">
              <div class="totals-box">
                <div class="total-row subtotal">
                  <span>Subtotal</span>
                  <span>&euro;${subtotal}</span>
                </div>
                ${taxHTML}
                <div class="total-row grand-total">
                  <span>Total</span>
                  <span>&euro;${total}</span>
                </div>
              </div>
            </div>
          </div>

          <div class="invoice-footer">
            <p>Esta es una factura electr&oacute;nica generada autom&aacute;ticamente.</p>
            <p>Gracias por confiar en nosotros.</p>
            <p class="brand-footer">JGMarket &mdash; Tu tienda de moda online</p>
          </div>
        </div>
      </div>

      <script src="https://cdnjs.cloudflare.com/ajax/libs/html2pdf.js/0.10.1/html2pdf.bundle.min.js"></script>
      <script>
        function downloadPDF() {
          const element = document.querySelector('.invoice-card');
          const buttons = document.querySelector('.action-bar');
          if (buttons) buttons.style.display = 'none';
          const opt = {
            margin: [10, 10, 10, 10],
            filename: 'Factura-${invoiceNumber}.pdf',
            image: { type: 'jpeg', quality: 0.98 },
            html2canvas: { scale: 2, useCORS: true },
            jsPDF: { orientation: 'portrait', unit: 'mm', format: 'a4' }
          };
          html2pdf().set(opt).from(element).save().then(() => {
            if (buttons) buttons.style.display = 'flex';
          });
        }
      </script>
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
    
    // Crear cliente admin inline
    const supabaseUrl = import.meta.env.PUBLIC_SUPABASE_URL;
    const supabaseServiceKey = import.meta.env.SUPABASE_SERVICE_ROLE_KEY;
    const adminClient = createClient(supabaseUrl!, supabaseServiceKey!);

    // Obtener parámetros de la URL
    let sessionId = url.searchParams?.get('id') ||
      url.searchParams?.get('session_id') ||
      url.searchParams?.get('session-id');
    let orderId = url.searchParams?.get('order_id');
    
    // Parámetros de nombre y email del cliente (del modal)
    const paramCustomerName = url.searchParams?.get('customer_name');
    const paramCustomerEmail = url.searchParams?.get('customer_email');

    // Si searchParams no funciona, intentar parsear manualmente
    if (!sessionId && (url.toString().includes('id=') || url.toString().includes('session'))) {
      let match = url.toString().match(/id=([^&]+)/);
      if (!match) {
        match = url.toString().match(/session[_-]?id=([^&]+)/);
      }
      if (match) {
        sessionId = decodeURIComponent(match[1]);
      }
    }

    console.log('PDF Invoice API called with:', { sessionId, orderId, paramCustomerName, paramCustomerEmail });

    if (!sessionId && !orderId) {
      return new Response(JSON.stringify({ error: 'Missing session_id or order_id' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    // Obtener el pedido con sus items desde order_items
    let order: any = null;
    let actualOrderId = orderId || sessionId;

    // Si el id tiene formato de número de factura (FAC-YYYY-NNNN), buscar primero en invoices
    if (actualOrderId && /^FAC-\d{4}-\d+$/i.test(actualOrderId)) {
      console.log('Detected invoice number format, looking up in invoices table:', actualOrderId);
      const { data: invoice, error: invoiceError } = await adminClient
        .from('invoices')
        .select('order_id')
        .eq('invoice_number', actualOrderId)
        .single();

      if (invoiceError || !invoice) {
        console.error('Invoice not found by number:', invoiceError);
        return new Response(JSON.stringify({ error: 'Invoice not found', details: invoiceError }), {
          status: 404,
          headers: { 'Content-Type': 'application/json' },
        });
      }
      actualOrderId = invoice.order_id;
      console.log('Resolved invoice to order_id:', actualOrderId);
    }

    if (actualOrderId) {
      const { data: orders, error: orderError } = await adminClient
        .from('orders')
        .select('*, items:order_items(*)')
        .eq('id', actualOrderId)
        .single();

      if (orderError || !orders) {
        console.error('Order not found by id:', orderError);
        return new Response(JSON.stringify({ error: 'Order not found', details: orderError }), {
          status: 404,
          headers: { 'Content-Type': 'application/json' },
        });
      }
      order = orders;
    } else {
      return new Response(JSON.stringify({ error: 'Missing order_id or session_id' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    // Usar nombre/email del modal, o fallback a datos de la BD
    let customerName = paramCustomerName || '';
    let customerEmail = paramCustomerEmail || order.customer_email || '';

    // Si no vienen del modal, intentar obtener del usuario
    if (!customerName && order.user_id) {
      const { data: user } = await adminClient
        .from('users')
        .select('full_name, email')
        .eq('id', order.user_id)
        .single();

      if (user) {
        customerName = customerName || user.full_name || 'Cliente';
        customerEmail = customerEmail || user.email || '';
      }
    }
    if (!customerName) customerName = 'Cliente';
    if (!customerEmail) customerEmail = 'no-email@example.com';

    // Verificar si ya existe factura para este pedido
    const { data: existingInvoice } = await adminClient
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
      invoiceNumber = await generateInvoiceNumber(adminClient);

      // Extraer items del JSON
      let items = [];
      if (order.items && Array.isArray(order.items)) {
        items = order.items.map((item: any) => {
          // Asegurar que cada item tenga los campos necesarios
          return {
            name: item.name || item.product_name || 'Producto',
            quantity: item.quantity || 1,
            price_cents: item.price_cents || item.unit_price_cents || Math.round((item.subtotal_cents || 0) / (item.quantity || 1)),
            product_id: item.product_id,
            size: item.size,
            color: item.color
          };
        });
      }

      const subtotalCents = order.subtotal_cents || order.total_cents - (order.tax_cents || 0);
      const taxCents = order.tax_cents || 0;
      const totalCents = order.total_cents;

      // Guardar factura en BD
      const { data: newInvoice, error: insertError } = await adminClient
        .from('invoices')
        .insert({
          invoice_number: invoiceNumber,
          order_id: order.id,
          customer_email: customerEmail,
          customer_name: customerName,
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
        return new Response(JSON.stringify({ error: 'Error creating invoice: ' + insertError.message }), {
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
    const orderNumber = order.order_number || order.id.substring(0, 8).toUpperCase();
    const issuedDate = new Date().toLocaleDateString('es-ES', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });

    // Generar HTML
    const htmlContent = generateInvoiceHTML(
      invoiceNumber,
      customerName,
      customerEmail,
      items,
      subtotalCents,
      taxCents,
      totalCents,
      issuedDate,
      orderNumber
    );

    // Enviar factura por email (sin esperar respuesta para no bloquear)
    if (customerEmail && customerEmail !== 'no-email@example.com') {
      const totalFormatted = (totalCents / 100).toFixed(2);
      sendInvoiceEmail(
        customerEmail,
        invoiceNumber,
        customerName,
        htmlContent,
        `€${totalFormatted}`
      ).catch(err => console.error('Error enviando email de factura:', err));
    }

    // Retornar HTML como respuesta
    return new Response(htmlContent, {
      status: 200,
      headers: {
        'Content-Type': 'text/html; charset=utf-8',
        'Content-Disposition': `inline; filename="Factura-${invoiceNumber}.html"`,
      },
    });
  } catch (error) {
    console.error('PDF Invoice error:', error);
    return new Response(JSON.stringify({ error: 'Internal server error' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
}
