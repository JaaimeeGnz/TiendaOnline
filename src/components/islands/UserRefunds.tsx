import { useEffect, useState } from 'react';
import { supabaseClient } from '../../lib/supabase';

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

interface Refund {
    id: string;
    order_id: string;
    customer_email: string;
    customer_name: string;
    reason: string;
    status: string;
    refund_amount_cents: number;
    returned_items: any[];
    requested_at: string;
    processed_at?: string;
}

export default function UserRefunds() {
    const [refunds, setRefunds] = useState<Refund[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchRefunds();
    }, []);

    const fetchRefunds = async () => {
        try {
            setLoading(true);

            const { data: { session } } = await supabaseClient.auth.getSession();
            let userEmail = session?.user?.email;

            if (!userEmail) {
                const localSessionStr = localStorage.getItem(`sb-${import.meta.env.PUBLIC_SUPABASE_URL.split('//')[1].split('.')[0]}-auth-token`);
                if (localSessionStr) {
                    try {
                        const parsed = JSON.parse(localSessionStr);
                        userEmail = parsed.user?.email;
                    } catch (e) { }
                }
                if (!userEmail) {
                    userEmail = localStorage.getItem('userEmail') || undefined;
                }
            }

            if (!userEmail) {
                setLoading(false);
                return;
            }

            const { data, error } = await supabaseClient
                .from('refunds')
                .select('*')
                .eq('customer_email', userEmail)
                .order('requested_at', { ascending: false });

            if (!error && data) {
                setRefunds(data as Refund[]);
            }
        } catch (e) {
            console.warn('Error cargando devoluciones:', e);
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return (
            <div className="flex justify-center items-center py-12">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-600"></div>
                <span className="ml-3 text-gray-600">Cargando devoluciones...</span>
            </div>
        );
    }

    if (refunds.length === 0) {
        return (
            <div className="bg-gray-50 border-2 border-dashed border-gray-300 rounded-lg p-12 text-center">
                <div className="w-16 h-16 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <svg className="w-8 h-8 text-orange-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 15v-1a4 4 0 00-4-4H8m0 0l3 3m-3-3l3-3m9 14V5a2 2 0 00-2-2H6a2 2 0 00-2 2v16l4-2 4 2 4-2 4 2z" />
                    </svg>
                </div>
                <p className="text-gray-500 text-lg mb-2">No tienes devoluciones</p>
                <p className="text-sm text-gray-400">Aquí aparecerán tus devoluciones si solicitas alguna</p>
            </div>
        );
    }

    return (
        <div className="space-y-4">
            {refunds.map((refund) => {
                const returnedItems = Array.isArray(refund.returned_items) ? refund.returned_items : [];
                const refundDate = refund.processed_at || refund.requested_at;
                const refundAmount = (refund.refund_amount_cents / 100).toFixed(2);

                return (
                    <div key={refund.id} className="bg-white border-2 border-orange-200 rounded-xl shadow-sm overflow-hidden">
                        {/* Header devolución */}
                        <div className="px-6 py-4 bg-orange-50 border-b border-orange-200">
                            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
                                <div className="flex items-center gap-3">
                                    <span className="bg-orange-600 text-white px-3 py-1 rounded-full text-xs font-bold">
                                        Devolución
                                    </span>
                                    <span className="text-sm text-gray-500">
                                        {new Date(refundDate).toLocaleDateString('es-ES')}
                                    </span>
                                </div>
                                <div className="flex items-center gap-3">
                                    <span className="px-3 py-1 rounded-full text-xs font-bold bg-green-100 text-green-700">
                                        {refund.status === 'processed' ? 'Procesada' : refund.status === 'pending' ? 'Pendiente' : refund.status}
                                    </span>
                                    <span className="text-xl font-black text-orange-600">-{refundAmount}€</span>
                                </div>
                            </div>
                        </div>

                        {/* Contenido */}
                        <div className="p-6">
                            {/* Motivo */}
                            <div className="bg-orange-50 border border-orange-200 rounded-lg p-3 mb-4">
                                <p className="text-sm text-orange-800">
                                    <span className="font-semibold">Motivo:</span> {translateReason(refund.reason)}
                                </p>
                            </div>

                            {/* Productos devueltos */}
                            <div className="space-y-2">
                                {returnedItems.map((item: any, idx: number) => (
                                    <div key={idx} className="flex justify-between text-sm items-center">
                                        <div className="flex items-center gap-2">
                                            <span className="font-medium text-gray-900">{item.quantity || 1}x</span>
                                            <span className="text-gray-600">
                                                {item.product_name || 'Producto'}
                                                {item.size ? ` (Talla: ${item.size})` : ''}
                                            </span>
                                        </div>
                                        <span className="font-medium text-gray-900">
                                            -{(((item.price_cents || 0) * (item.quantity || 1)) / 100).toFixed(2)}€
                                        </span>
                                    </div>
                                ))}
                            </div>

                            {/* Info reembolso */}
                            <div className="mt-4 pt-4 border-t border-gray-100">
                                <p className="text-xs text-gray-500">
                                    El reembolso de <strong className="text-orange-600">{refundAmount}€</strong> se procesará al método de pago original en 5-7 días hábiles.
                                </p>
                            </div>
                        </div>
                    </div>
                );
            })}
        </div>
    );
}
