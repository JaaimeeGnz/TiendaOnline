import type { APIRoute } from 'astro';
import { supabaseClient } from '../../lib/supabase';
import { sendInvoiceEmail } from '../../lib/email';

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
      <td style="padding: 10px; border-bottom: 1px solid #ddd;">${item.name || item.product_name || 'Producto'}</td>
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
        .action-buttons {
          text-align: right;
          margin-bottom: 20px;
          display: flex;
          gap: 10px;
          justify-content: flex-end;
          flex-wrap: wrap;
        }
        .btn {
          padding: 10px 20px;
          border: none;
          border-radius: 5px;
          cursor: pointer;
          font-size: 14px;
          font-weight: bold;
          text-decoration: none;
          display: inline-block;
        }
        .btn-pdf {
          background-color: #dc2626;
          color: white;
        }
        .btn-pdf:hover {
          background-color: #991b1b;
        }
        .btn-print {
          background-color: #1FC0A0;
          color: white;
        }
        .btn-print:hover {
          background-color: #14b8a6;
        }
        @media print {
          .action-buttons {
            display: none;
          }
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
        <div class="action-buttons">
          <button class="btn btn-pdf" onclick="downloadPDF()">Descargar PDF</button>
        </div>
        <div class="header">
          <div class="logo-section">
            <h1>JGMARKET</h1>
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

      <script src="https://cdnjs.cloudflare.com/ajax/libs/html2pdf.js/0.10.1/html2pdf.bundle.min.js"></script>
      <script>
        function downloadPDF() {
          const element = document.querySelector('.invoice');
          const opt = {
            margin: 10,
            filename: 'Factura-${invoiceNumber}.pdf',
            image: { type: 'jpeg', quality: 0.98 },
            html2canvas: { scale: 2 },
            jsPDF: { orientation: 'portrait', unit: 'mm', format: 'a4' }
          };
          html2pdf().set(opt).from(element).save();
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
    
    // Obtener parámetros de la URL - intentar múltiples nombres
    let sessionId = url.searchParams?.get('id') || 
                   url.searchParams?.get('session_id') ||
                   url.searchParams?.get('session-id');
    let orderId = url.searchParams?.get('order_id');
    
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

    console.log('PDF Invoice API called with:', { sessionId, orderId, fullUrl: url.toString() });

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

      // Si no encuentra, intentar con stripe_session_id
      if ((orderError || !orders) && sessionId) {
        const { data: ordersAlt, error: orderErrorAlt } = await supabaseClient
          .from('orders')
          .select('*')
          .eq('stripe_session_id', sessionId)
          .single();
        
        orders = ordersAlt;
        orderError = orderErrorAlt;
      }

      // Si aún no encuentra, intentar buscar por número de factura (FAC-2026-0001)
      if ((orderError || !orders) && sessionId.startsWith('FAC-')) {
        const { data: invoices, error: invoiceError } = await supabaseClient
          .from('invoices')
          .select('order_id')
          .eq('invoice_number', sessionId)
          .single();
        
        if (invoices && !invoiceError) {
          const { data: ordersAlt, error: orderErrorAlt } = await supabaseClient
            .from('orders')
            .select('*')
            .eq('id', invoices.order_id)
            .single();
          
          orders = ordersAlt;
          orderError = orderErrorAlt;
        }
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
      const { data: newInvoice, error: insertError } = await supabaseClient
        .from('invoices')
        .insert({
          invoice_number: invoiceNumber,
          order_id: order.id,
          customer_email: order.customer_email || 'no-email@example.com',
          customer_name: order.customer_name || order.user_name || 'Cliente',
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
    const issuedDate = new Date().toLocaleDateString('es-ES', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });

    // Generar HTML
    const htmlContent = generateInvoiceHTML(
      invoiceNumber,
      order.customer_name || order.user_name || 'Cliente',
      order.customer_email || 'no-email@example.com',
      items,
      subtotalCents,
      taxCents,
      totalCents,
      issuedDate
    );

    // Enviar factura por email (sin esperar respuesta para no bloquear)
    if (order.customer_email && order.customer_email !== 'no-email@example.com') {
      const totalFormatted = (totalCents / 100).toFixed(2);
      sendInvoiceEmail(
        order.customer_email,
        invoiceNumber,
        order.customer_name || order.user_name || 'Cliente',
        htmlContent,
        `€${totalFormatted}`
      ).catch(err => console.error('Error enviando email de factura:', err));
    }

    // Retornar HTML como respuesta
    return new Response(htmlContent, {
      status: 200,
      headers: {
        'Content-Type': 'text/html; charset=utf-8',
        'Content-Disposition': `attachment; filename="Factura-${invoiceNumber}.html"`,
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
