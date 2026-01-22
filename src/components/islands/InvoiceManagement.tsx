import React, { useState, useEffect } from 'react';
import {
  getCustomerInvoices,
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
        getCustomerInvoices('*'), // En un caso real, sería del usuario actual
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
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <div className="bg-white border-2 border-jd-turquoise rounded-lg p-6">
            <p className="text-sm font-bold text-gray-600 uppercase">Total Facturado</p>
            <p className="text-3xl font-black text-jd-turquoise mt-3">
              {summary.totalInvoices.toFixed(2)}€
            </p>
            <p className="text-xs text-gray-500 mt-2">{summary.invoiceCount} facturas</p>
          </div>

          <div className="bg-white border-2 border-jd-red rounded-lg p-6">
            <p className="text-sm font-bold text-gray-600 uppercase">Total Abonado</p>
            <p className="text-3xl font-black text-jd-red mt-3">
              {summary.totalCreditNotes.toFixed(2)}€
            </p>
            <p className="text-xs text-gray-500 mt-2">{summary.creditNoteCount} abonos</p>
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
                  <th className="px-6 py-3 text-left text-xs font-bold text-gray-700">Tipo</th>
                  <th className="px-6 py-3 text-right text-xs font-bold text-gray-700">Monto</th>
                  <th className="px-6 py-3 text-left text-xs font-bold text-gray-700">Estado</th>
                  <th className="px-6 py-3 text-left text-xs font-bold text-gray-700">Fecha</th>
                </tr>
              </thead>
              <tbody>
                {invoices.length > 0 ? (
                  invoices.map((invoice) => (
                    <tr key={invoice.id} className="border-b border-gray-200 hover:bg-gray-50">
                      <td className="px-6 py-3 font-bold text-jd-turquoise">{invoice.invoice_number}</td>
                      <td className="px-6 py-3 text-sm text-gray-700">{invoice.customer_name}</td>
                      <td className="px-6 py-3 text-sm">
                        <span className={`px-3 py-1 rounded-full text-xs font-bold ${
                          invoice.type === 'invoice'
                            ? 'bg-blue-100 text-blue-700'
                            : 'bg-orange-100 text-orange-700'
                        }`}>
                          {invoice.type === 'invoice' ? 'Factura' : 'Abono'}
                        </span>
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
