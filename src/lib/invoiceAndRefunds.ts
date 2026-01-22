import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.PUBLIC_SUPABASE_URL;
const supabaseKey = import.meta.env.PUBLIC_SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

export interface Invoice {
  id: string;
  invoice_number: string;
  order_id: string;
  customer_email: string;
  customer_name: string;
  type: 'invoice' | 'credit_note';
  subtotal_cents: number;
  tax_cents: number;
  total_cents: number;
  status: 'draft' | 'issued' | 'paid' | 'cancelled';
  issued_at: string;
  due_date?: string;
  items: any[];
  reference_invoice_id?: string;
  reason?: string;
}

export interface Refund {
  id: string;
  order_id: string;
  invoice_id: string;
  customer_email: string;
  customer_name: string;
  reason: string;
  status: 'pending' | 'approved' | 'rejected' | 'processed';
  refund_amount_cents: number;
  returned_items: any[];
  refund_method: 'original_payment' | 'store_credit';
  requested_at: string;
  credit_note_id?: string;
}

/**
 * Crea una factura para una orden
 */
export async function createInvoice(
  orderId: string,
  customerEmail: string,
  customerName: string,
  items: any[],
  subtotalCents: number,
  taxCents: number = 0
): Promise<Invoice | null> {
  try {
    const totalCents = subtotalCents + taxCents;
    
    // Obtener número de factura
    const { data: invNumber, error: numError } = await supabase
      .rpc('generate_invoice_number');

    if (numError) {
      console.error('Error generating invoice number:', numError);
      return null;
    }

    // Crear factura
    const { data, error } = await supabase
      .from('invoices')
      .insert({
        invoice_number: invNumber,
        order_id: orderId,
        customer_email: customerEmail,
        customer_name: customerName,
        type: 'invoice',
        subtotal_cents: subtotalCents,
        tax_cents: taxCents,
        total_cents: totalCents,
        items: items,
        status: 'issued',
      })
      .select()
      .single();

    if (error) {
      console.error('Error creating invoice:', error);
      return null;
    }

    return data as Invoice;
  } catch (error) {
    console.error('Error in createInvoice:', error);
    return null;
  }
}

/**
 * Obtiene todas las facturas de un cliente
 */
export async function getCustomerInvoices(customerEmail: string): Promise<Invoice[]> {
  try {
    const { data, error } = await supabase
      .from('invoices')
      .select('*')
      .eq('customer_email', customerEmail)
      .order('issued_at', { ascending: false });

    if (error) {
      console.error('Error fetching invoices:', error);
      return [];
    }

    return (data || []) as Invoice[];
  } catch (error) {
    console.error('Error in getCustomerInvoices:', error);
    return [];
  }
}

/**
 * Obtiene una factura específica
 */
export async function getInvoice(invoiceId: string): Promise<Invoice | null> {
  try {
    const { data, error } = await supabase
      .from('invoices')
      .select('*')
      .eq('id', invoiceId)
      .single();

    if (error) {
      console.error('Error fetching invoice:', error);
      return null;
    }

    return data as Invoice;
  } catch (error) {
    console.error('Error in getInvoice:', error);
    return null;
  }
}

/**
 * Marca una factura como pagada
 */
export async function markInvoiceAsPaid(invoiceId: string): Promise<boolean> {
  try {
    const { error } = await supabase
      .from('invoices')
      .update({
        status: 'paid',
        paid_at: new Date().toISOString(),
      })
      .eq('id', invoiceId);

    if (error) {
      console.error('Error marking invoice as paid:', error);
      return false;
    }

    return true;
  } catch (error) {
    console.error('Error in markInvoiceAsPaid:', error);
    return false;
  }
}

/**
 * Crea una solicitud de devolución
 */
export async function createRefundRequest(
  orderId: string,
  invoiceId: string,
  customerEmail: string,
  customerName: string,
  reason: string,
  returnedItems: any[],
  refundAmountCents: number,
  refundMethod: 'original_payment' | 'store_credit' = 'original_payment'
): Promise<Refund | null> {
  try {
    const { data, error } = await supabase
      .from('refunds')
      .insert({
        order_id: orderId,
        invoice_id: invoiceId,
        customer_email: customerEmail,
        customer_name: customerName,
        reason: reason,
        returned_items: returnedItems,
        refund_amount_cents: refundAmountCents,
        refund_method: refundMethod,
        status: 'pending',
      })
      .select()
      .single();

    if (error) {
      console.error('Error creating refund request:', error);
      return null;
    }

    return data as Refund;
  } catch (error) {
    console.error('Error in createRefundRequest:', error);
    return null;
  }
}

/**
 * Obtiene las devoluciones de un cliente
 */
export async function getCustomerRefunds(customerEmail: string): Promise<Refund[]> {
  try {
    const { data, error } = await supabase
      .from('refunds')
      .select('*')
      .eq('customer_email', customerEmail)
      .order('requested_at', { ascending: false });

    if (error) {
      console.error('Error fetching refunds:', error);
      return [];
    }

    return (data || []) as Refund[];
  } catch (error) {
    console.error('Error in getCustomerRefunds:', error);
    return [];
  }
}

/**
 * Obtiene todas las devoluciones pendientes (solo para admin)
 */
export async function getPendingRefunds(): Promise<Refund[]> {
  try {
    const { data, error } = await supabase
      .from('refunds')
      .select('*')
      .eq('status', 'pending')
      .order('requested_at', { ascending: false });

    if (error) {
      console.error('Error fetching pending refunds:', error);
      return [];
    }

    return (data || []) as Refund[];
  } catch (error) {
    console.error('Error in getPendingRefunds:', error);
    return [];
  }
}

/**
 * Aprueba o rechaza una devolución (usa RPC)
 */
export async function processRefund(refundId: string, approve: boolean): Promise<{ success: boolean; creditNoteId?: string; message: string }> {
  try {
    const { data, error } = await supabase
      .rpc('process_refund', {
        p_refund_id: refundId,
        p_approve: approve,
      });

    if (error) {
      console.error('Error processing refund:', error);
      return { success: false, message: error.message };
    }

    return {
      success: true,
      creditNoteId: data?.[0]?.credit_note_id,
      message: data?.[0]?.message || 'Devolución procesada',
    };
  } catch (error) {
    console.error('Error in processRefund:', error);
    return { success: false, message: 'Error al procesar la devolución' };
  }
}

/**
 * Marca una devolución como procesada
 */
export async function markRefundAsProcessed(refundId: string, refundDate?: string): Promise<boolean> {
  try {
    const { error } = await supabase
      .from('refunds')
      .update({
        status: 'processed',
        refund_date: refundDate || new Date().toISOString(),
        processed_at: new Date().toISOString(),
      })
      .eq('id', refundId);

    if (error) {
      console.error('Error marking refund as processed:', error);
      return false;
    }

    return true;
  } catch (error) {
    console.error('Error in markRefundAsProcessed:', error);
    return false;
  }
}

/**
 * Obtiene el resumen financiero de facturas y abonos
 */
export async function getFinancialSummary(
  startDate?: string,
  endDate?: string
): Promise<{
  totalInvoices: number;
  totalCreditNotes: number;
  netAmount: number;
  invoiceCount: number;
  creditNoteCount: number;
}> {
  try {
    let query = supabase.from('invoices').select('total_cents, type');
    
    if (startDate) {
      query = query.gte('issued_at', startDate);
    }
    if (endDate) {
      query = query.lte('issued_at', endDate);
    }

    const { data, error } = await query;

    if (error) {
      console.error('Error fetching financial summary:', error);
      return { totalInvoices: 0, totalCreditNotes: 0, netAmount: 0, invoiceCount: 0, creditNoteCount: 0 };
    }

    let totalInvoices = 0;
    let totalCreditNotes = 0;
    let invoiceCount = 0;
    let creditNoteCount = 0;

    data?.forEach((item: any) => {
      if (item.type === 'invoice') {
        totalInvoices += item.total_cents;
        invoiceCount++;
      } else {
        totalCreditNotes += item.total_cents; // Será negativo
        creditNoteCount++;
      }
    });

    const netAmount = totalInvoices + totalCreditNotes; // totalCreditNotes es negativo

    return {
      totalInvoices: totalInvoices / 100,
      totalCreditNotes: Math.abs(totalCreditNotes) / 100,
      netAmount: netAmount / 100,
      invoiceCount,
      creditNoteCount,
    };
  } catch (error) {
    console.error('Error in getFinancialSummary:', error);
    return { totalInvoices: 0, totalCreditNotes: 0, netAmount: 0, invoiceCount: 0, creditNoteCount: 0 };
  }
}
