import React, { useState, useEffect } from 'react';
import {
  getAllInvoices,
  getPendingRefunds,
  getFinancialSummary,
  processRefund,
  markRefundAsProcessed,
  type Invoice,
  type Refund,
} from '../../lib/invoiceAndRefunds';

export default function InvoiceManagement() {
  const [activeTab, setActiveTab] = useState<'invoices' | 'refunds' | 'summary'>('summary');
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [refunds, setRefunds] = useState<Refund[]>([]);
  const [summary, setSummary] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const [invoicesData, refundsData, summaryData] = await Promise.all([
        getAllInvoices(),
        getPendingRefunds(),
        getFinancialSummary(),
      ]);

      setInvoices(invoicesData || []);
      setRefunds(refundsData || []);
      setSummary(summaryData);
      setError(null);
    } catch (err) {
      console.error('Error loading invoice data:', err);
      setError('Error al cargar datos de facturas');
    } finally {
      setLoading(false);
    }
  };

  const handleApproveRefund = async (refundId: string) => {
    if (!confirm('¿Aprobar esta devolución?')) return;

    try {
      const result = await processRefund(refundId, true);
      if (result.success) {
        alert('Devolución aprobada. Factura de abono creada.');
        loadData();
      } else {
        alert('Error: ' + result.message);
      }
    } catch (err) {
      alert('Error al procesar la devolución');
    }
  };

  const handleRejectRefund = async (refundId: string) => {
    if (!confirm('¿Rechazar esta devolución?')) return;

    try {
      const result = await processRefund(refundId, false);
      if (result.success) {
        alert('Devolución rechazada');
        loadData();
      } else {
        alert('Error: ' + result.message);
      }
    } catch (err) {
      alert('Error al rechazar la devolución');
    }
  };

  const handleProcessRefund = async (refundId: string) => {
    try {
      const success = await markRefundAsProcessed(refundId);
      if (success) {
        alert('Devolución marcada como procesada');
        loadData();
      } else {
        alert('Error al procesar la devolución');
      }
    } catch (err) {
      alert('Error');
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-jd-turquoise"></div>
      </div>
    );
  }

  // Generar y descargar factura como archivo
  const downloadInvoice = (invoice: Invoice) => {
    const items = Array.isArray(invoice.items) ? invoice.items : [];
    
    // Generar HTML de la factura
    const invoiceHtml = `
<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8">
  <title>Factura ${invoice.invoice_number}</title>
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body { font-family: 'Segoe UI', Arial, sans-serif; color: #333; padding: 40px; max-width: 800px; margin: 0 auto; }
    .header { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 40px; border-bottom: 3px solid #1a1a1a; padding-bottom: 20px; }
    .logo { font-size: 28px; font-weight: 900; }
    .logo span { color: #e41e31; }
    .invoice-info { text-align: right; }
    .invoice-info h2 { font-size: 24px; color: #1a1a1a; margin-bottom: 8px; }
    .invoice-info p { font-size: 13px; color: #666; }
    .section { margin-bottom: 30px; }
    .section-title { font-size: 14px; font-weight: 700; color: #666; text-transform: uppercase; letter-spacing: 1px; margin-bottom: 10px; }
    .client-info p { font-size: 14px; line-height: 1.6; }
    table { width: 100%; border-collapse: collapse; margin-top: 10px; }
    thead th { background: #1a1a1a; color: white; padding: 12px 16px; text-align: left; font-size: 12px; text-transform: uppercase; letter-spacing: 0.5px; }
    thead th:last-child { text-align: right; }
    tbody td { padding: 12px 16px; border-bottom: 1px solid #eee; font-size: 14px; }
    tbody td:last-child { text-align: right; font-weight: 600; }
    .totals { margin-top: 20px; display: flex; justify-content: flex-end; }
    .totals-table { width: 280px; }
    .totals-table tr td { padding: 8px 0; font-size: 14px; }
    .totals-table tr td:last-child { text-align: right; font-weight: 600; }
    .totals-table .total-row td { font-size: 18px; font-weight: 900; border-top: 2px solid #1a1a1a; padding-top: 12px; }
    .footer { margin-top: 60px; text-align: center; font-size: 12px; color: #999; border-top: 1px solid #eee; padding-top: 20px; }
    .status { display: inline-block; padding: 4px 12px; border-radius: 20px; font-size: 12px; font-weight: 700; }
    .status-paid { background: #d4edda; color: #155724; }
    .status-issued { background: #fff3cd; color: #856404; }
    .status-cancelled { background: #f8d7da; color: #721c24; }
    @media print { body { padding: 20px; } }
  </style>
</head>
<body>
  <div class="header">
    <div class="logo">JG<span>MARKET</span></div>
    <div class="invoice-info">
      <h2>FACTURA</h2>
      <p><strong>${invoice.invoice_number}</strong></p>
      <p>Fecha: ${new Date(invoice.issued_at).toLocaleDateString('es-ES', { day: '2-digit', month: 'long', year: 'numeric' })}</p>
      <p><span class="status ${invoice.status === 'paid' ? 'status-paid' : invoice.status === 'issued' ? 'status-issued' : 'status-cancelled'}">
        ${invoice.status === 'paid' ? 'PAGADA' : invoice.status === 'issued' ? 'EMITIDA' : 'CANCELADA'}
      </span></p>
    </div>
  </div>

  <div class="section">
    <p class="section-title">Cliente</p>
    <div class="client-info">
      <p><strong>${invoice.customer_name}</strong></p>
      <p>${invoice.customer_email}</p>
    </div>
  </div>

  <div class="section">
    <p class="section-title">Detalle</p>
    <table>
      <thead>
        <tr>
          <th>Producto</th>
          <th>Cantidad</th>
          <th>Precio unit.</th>
          <th>Total</th>
        </tr>
      </thead>
      <tbody>
        ${items.length > 0 ? items.map((item: any) => `
          <tr>
            <td>${item.product_name || item.name || 'Producto'}</td>
            <td>${item.quantity || 1}</td>
            <td>${((item.price_cents || item.priceCents || 0) / 100).toFixed(2)}€</td>
            <td>${((item.total_cents || item.totalCents || (item.price_cents || 0) * (item.quantity || 1)) / 100).toFixed(2)}€</td>
          </tr>
        `).join('') : `
          <tr>
            <td colspan="4" style="text-align:center;color:#999;">Compra en JGMarket</td>
          </tr>
        `}
      </tbody>
    </table>
  </div>

  <div class="totals">
    <table class="totals-table">
      <tr>
        <td>Subtotal</td>
        <td>${(invoice.subtotal_cents / 100).toFixed(2)}€</td>
      </tr>
      ${invoice.tax_cents > 0 ? `
      <tr>
        <td>IVA</td>
        <td>${(invoice.tax_cents / 100).toFixed(2)}€</td>
      </tr>
      ` : ''}
      <tr class="total-row">
        <td>TOTAL</td>
        <td>${(invoice.total_cents / 100).toFixed(2)}€</td>
      </tr>
    </table>
  </div>

  <div class="footer">
    <p>JGMarket — Factura generada automáticamente</p>
    <p>Gracias por tu compra</p>
  </div>
</body>
</html>`;

    // Abrir en nueva ventana para imprimir/guardar como PDF
    const newWindow = window.open('', '_blank');
    if (newWindow) {
      newWindow.document.write(invoiceHtml);
      newWindow.document.close();
      // Auto-abrir diálogo de impresión (permite guardar como PDF)
      setTimeout(() => newWindow.print(), 500);
    }
  };

  return (
    <div className="space-y-6">
      {/* Tabs */}
      <div className="flex gap-4 border-b-2 border-gray-200">
        {['summary', 'invoices', 'refunds'].map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab as any)}
            className={`px-6 py-3 font-bold uppercase text-sm transition ${
              activeTab === tab
                ? 'text-jd-turquoise border-b-2 border-jd-turquoise'
                : 'text-gray-600 hover:text-jd-black'
            }`}
          >
            {tab === 'summary' && 'Resumen'}
            {tab === 'invoices' && 'Facturas'}
            {tab === 'refunds' && 'Devoluciones'}
          </button>
        ))}
      </div>

      {/* Summary Tab */}
      {activeTab === 'summary' && summary && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white border-2 border-jd-turquoise rounded-lg p-6">
            <p className="text-sm font-bold text-gray-600 uppercase">Total Facturado</p>
            <p className="text-3xl font-black text-jd-turquoise mt-3">
              {summary.totalInvoices.toFixed(2)}€
            </p>
            <p className="text-xs text-gray-500 mt-2">{summary.invoiceCount} facturas</p>
          </div>

          <div className="bg-white border-2 border-jd-black rounded-lg p-6">
            <p className="text-sm font-bold text-gray-600 uppercase">Neto</p>
            <p className="text-3xl font-black text-jd-black mt-3">
              {summary.netAmount.toFixed(2)}€
            </p>
            <p className="text-xs text-gray-500 mt-2">Total neto</p>
          </div>

          <div className="bg-white border-2 border-orange-400 rounded-lg p-6">
            <p className="text-sm font-bold text-gray-600 uppercase">Devoluciones Pendientes</p>
            <p className="text-3xl font-black text-orange-600 mt-3">
              {refunds.filter(r => r.status === 'pending').length}
            </p>
            <p className="text-xs text-gray-500 mt-2">Require atención</p>
          </div>
        </div>
      )}

      {/* Invoices Tab */}
      {activeTab === 'invoices' && (
        <div className="bg-white border-2 border-gray-200 rounded-lg overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b-2 border-gray-200">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-bold text-gray-700">Factura #</th>
                  <th className="px-6 py-3 text-left text-xs font-bold text-gray-700">Cliente</th>
                  <th className="px-6 py-3 text-right text-xs font-bold text-gray-700">Monto</th>
                  <th className="px-6 py-3 text-left text-xs font-bold text-gray-700">Estado</th>
                  <th className="px-6 py-3 text-left text-xs font-bold text-gray-700">Fecha</th>
                  <th className="px-6 py-3 text-center text-xs font-bold text-gray-700">Acciones</th>
                </tr>
              </thead>
              <tbody>
                {invoices.length > 0 ? (
                  invoices.map((invoice) => (
                    <tr key={invoice.id} className="border-b border-gray-200 hover:bg-gray-50">
                      <td className="px-6 py-3 font-bold text-jd-turquoise">{invoice.invoice_number}</td>
                      <td className="px-6 py-3 text-sm">
                        <p className="font-semibold text-gray-800">{invoice.customer_name}</p>
                        <p className="text-xs text-gray-500">{invoice.customer_email}</p>
                      </td>
                      <td className="px-6 py-3 text-right font-bold">
                        {(invoice.total_cents / 100).toFixed(2)}€
                      </td>
                      <td className="px-6 py-3 text-sm">
                        <span className={`px-3 py-1 rounded-full text-xs font-bold ${
                          invoice.status === 'paid'
                            ? 'bg-green-100 text-green-700'
                            : invoice.status === 'issued'
                            ? 'bg-yellow-100 text-yellow-700'
                            : 'bg-red-100 text-red-700'
                        }`}>
                          {invoice.status === 'paid' && 'Pagada'}
                          {invoice.status === 'issued' && 'Emitida'}
                          {invoice.status === 'cancelled' && 'Cancelada'}
                        </span>
                      </td>
                      <td className="px-6 py-3 text-sm text-gray-600">
                        {new Date(invoice.issued_at).toLocaleDateString('es-ES')}
                      </td>
                      <td className="px-6 py-3 text-center">
                        <button
                          onClick={() => downloadInvoice(invoice)}
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-jd-turquoise text-white rounded font-bold text-xs hover:bg-opacity-90 transition"
                          title="Descargar factura"
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                          </svg>
                          Descargar
                        </button>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={6} className="px-6 py-8 text-center text-gray-500">
                      No hay facturas registradas
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Refunds Tab */}
      {activeTab === 'refunds' && (
        <div className="bg-white border-2 border-gray-200 rounded-lg overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b-2 border-gray-200">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-bold text-gray-700">Cliente</th>
                  <th className="px-6 py-3 text-left text-xs font-bold text-gray-700">Motivo</th>
                  <th className="px-6 py-3 text-right text-xs font-bold text-gray-700">Monto</th>
                  <th className="px-6 py-3 text-left text-xs font-bold text-gray-700">Estado</th>
                  <th className="px-6 py-3 text-left text-xs font-bold text-gray-700">Fecha</th>
                  <th className="px-6 py-3 text-left text-xs font-bold text-gray-700">Acciones</th>
                </tr>
              </thead>
              <tbody>
                {refunds.length > 0 ? (
                  refunds.map((refund) => (
                    <tr key={refund.id} className="border-b border-gray-200 hover:bg-gray-50">
                      <td className="px-6 py-3 font-bold text-jd-black">{refund.customer_name}</td>
                      <td className="px-6 py-3 text-sm text-gray-700">{refund.reason}</td>
                      <td className="px-6 py-3 text-right font-bold text-jd-red">
                        {(refund.refund_amount_cents / 100).toFixed(2)}€
                      </td>
                      <td className="px-6 py-3 text-sm">
                        <span className={`px-3 py-1 rounded-full text-xs font-bold ${
                          refund.status === 'pending'
                            ? 'bg-yellow-100 text-yellow-700'
                            : refund.status === 'approved'
                            ? 'bg-blue-100 text-blue-700'
                            : refund.status === 'processed'
                            ? 'bg-green-100 text-green-700'
                            : 'bg-red-100 text-red-700'
                        }`}>
                          {refund.status === 'pending' && 'Pendiente'}
                          {refund.status === 'approved' && 'Aprobada'}
                          {refund.status === 'processed' && 'Procesada'}
                          {refund.status === 'rejected' && 'Rechazada'}
                        </span>
                      </td>
                      <td className="px-6 py-3 text-sm text-gray-600">
                        {new Date(refund.requested_at).toLocaleDateString('es-ES')}
                      </td>
                      <td className="px-6 py-3 text-sm space-x-2">
                        {refund.status === 'pending' && (
                          <>
                            <button
                              onClick={() => handleApproveRefund(refund.id)}
                              className="px-3 py-1 bg-green-500 text-white rounded font-bold text-xs hover:bg-green-600"
                            >
                              Aprobar
                            </button>
                            <button
                              onClick={() => handleRejectRefund(refund.id)}
                              className="px-3 py-1 bg-red-500 text-white rounded font-bold text-xs hover:bg-red-600"
                            >
                              Rechazar
                            </button>
                          </>
                        )}
                        {refund.status === 'approved' && (
                          <button
                            onClick={() => handleProcessRefund(refund.id)}
                            className="px-3 py-1 bg-blue-500 text-white rounded font-bold text-xs hover:bg-blue-600"
                          >
                            Procesar
                          </button>
                        )}
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={6} className="px-6 py-8 text-center text-gray-500">
                      No hay devoluciones registradas
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
