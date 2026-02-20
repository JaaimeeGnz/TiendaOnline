import { useEffect, useState } from 'react';
import { supabaseClient } from '../../lib/supabase';
import OrderDetails from './OrderDetails';

// Configurar URL/Key para el cliente autenticado temporal
const supabaseUrl = import.meta.env.PUBLIC_SUPABASE_URL;

interface Order {
    id: string;
    session_id?: string;
    stripe_session_id?: string;
    order_number?: number;
    items: any[];
    total_cents: number;
    status: string;
    created_at: string;
    created_at_formatted?: string;
    payment_method?: string;
}

// Modal para pedir nombre y email antes de generar factura
function InvoiceModal({ isOpen, onClose, onSubmit }: {
    isOpen: boolean;
    onClose: () => void;
    onSubmit: (name: string, email: string) => void;
}) {
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');

    // Prellenar email desde la sesión
    useEffect(() => {
        if (isOpen) {
            supabaseClient.auth.getSession().then(({ data: { session } }) => {
                if (session?.user?.email) {
                    setEmail(session.user.email);
                }
                if (session?.user?.user_metadata?.full_name) {
                    setName(session.user.user_metadata.full_name);
                }
            });
        }
    }, [isOpen]);

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4" onClick={onClose}>
            <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-6 animate-fadeIn" onClick={e => e.stopPropagation()}>
                <div className="flex items-center gap-3 mb-6">
                    <div className="w-10 h-10 bg-red-100 rounded-full flex items-center justify-center">
                        <svg className="w-5 h-5 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                        </svg>
                    </div>
                    <div>
                        <h3 className="text-lg font-bold text-gray-900">Datos para la Factura</h3>
                        <p className="text-sm text-gray-500">Estos datos aparecerán en tu factura</p>
                    </div>
                </div>

                <div className="space-y-4">
                    <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-1">Nombre completo *</label>
                        <input
                            type="text"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            placeholder="Ej: Jaime García"
                            className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500 outline-none transition text-gray-900"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-1">Correo electrónico *</label>
                        <input
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            placeholder="Ej: correo@ejemplo.com"
                            className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500 outline-none transition text-gray-900"
                        />
                    </div>
                </div>

                <div className="flex gap-3 mt-6">
                    <button
                        onClick={onClose}
                        className="flex-1 px-4 py-2.5 border border-gray-300 text-gray-700 rounded-lg font-semibold hover:bg-gray-50 transition"
                    >
                        Cancelar
                    </button>
                    <button
                        onClick={() => {
                            if (!name.trim() || !email.trim()) return;
                            onSubmit(name.trim(), email.trim());
                            onClose();
                        }}
                        disabled={!name.trim() || !email.trim()}
                        className="flex-1 px-4 py-2.5 bg-red-600 text-white rounded-lg font-semibold hover:bg-red-700 transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                    >
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                        </svg>
                        Generar Factura
                    </button>
                </div>
            </div>
        </div>
    );
}

// Modal de cancelación con cuestionario
function CancellationModal({ isOpen, onClose, onConfirm }: {
    isOpen: boolean;
    onClose: () => void;
    onConfirm: (reason: string) => void;
}) {
    const [selectedReason, setSelectedReason] = useState<string>('');
    const [comments, setComments] = useState<string>('');

    const reasons = [
        { id: 'wrong_product', label: 'Pedí el producto equivocado' },
        { id: 'price', label: 'Encontré un precio mejor' },
        { id: 'delivery', label: 'Tiempo de envío muy largo' },
        { id: 'changed_mind', label: 'Cambié de opinión' },
        { id: 'quality', label: 'Preocupación por calidad' },
        { id: 'other', label: 'Otro motivo' },
    ];

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4" onClick={onClose}>
            <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-6 animate-fadeIn" onClick={e => e.stopPropagation()}>
                <div className="flex items-center gap-3 mb-6">
                    <div className="w-10 h-10 bg-red-100 rounded-full flex items-center justify-center">
                        <svg className="w-5 h-5 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4v2m0 4v2m0-10H8m4 0h4m-8-4h8a2 2 0 012 2v8a2 2 0 01-2 2h-8a2 2 0 01-2-2v-8a2 2 0 012-2z" />
                        </svg>
                    </div>
                    <div>
                        <h3 className="text-lg font-bold text-gray-900">Cancelar Pedido</h3>
                        <p className="text-sm text-gray-500">¿Cuál es el motivo de tu cancelación?</p>
                    </div>
                </div>

                <div className="space-y-3 mb-6">
                    {reasons.map((reason) => (
                        <label key={reason.id} className="flex items-center p-3 border-2 border-gray-200 rounded-lg cursor-pointer hover:bg-gray-50 transition" style={{
                            borderColor: selectedReason === reason.id ? '#dc2626' : '#e5e7eb',
                            backgroundColor: selectedReason === reason.id ? '#fee2e2' : 'transparent'
                        }}>
                            <input
                                type="radio"
                                name="reason"
                                value={reason.id}
                                checked={selectedReason === reason.id}
                                onChange={(e) => setSelectedReason(e.target.value)}
                                className="w-4 h-4 cursor-pointer"
                            />
                            <span className="ml-3 text-gray-700 font-medium text-sm">{reason.label}</span>
                        </label>
                    ))}
                </div>

                {selectedReason === 'other' && (
                    <div className="mb-6">
                        <label className="block text-sm font-semibold text-gray-700 mb-2">Cuéntanos más (opcional)</label>
                        <textarea
                            value={comments}
                            onChange={(e) => setComments(e.target.value)}
                            placeholder="Tu comentario nos ayudará a mejorar..."
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500 outline-none transition text-gray-900 text-sm"
                            rows={3}
                        />
                    </div>
                )}

                <div className="flex gap-3">
                    <button
                        onClick={onClose}
                        className="flex-1 px-4 py-2.5 border border-gray-300 text-gray-700 rounded-lg font-semibold hover:bg-gray-50 transition"
                    >
                        No Cancelar
                    </button>
                    <button
                        onClick={() => {
                            onConfirm(selectedReason);
                            setSelectedReason('');
                            setComments('');
                        }}
                        disabled={!selectedReason}
                        className="flex-1 px-4 py-2.5 bg-red-600 text-white rounded-lg font-semibold hover:bg-red-700 transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                    >
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                        Cancelar Pedido
                    </button>
                </div>
            </div>
        </div>
    );
}

// Modal de éxito
function SuccessModal({ isOpen, onClose, message }: {
    isOpen: boolean;
    onClose: () => void;
    message: string;
}) {
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4" onClick={onClose}>
            <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-8 animate-fadeIn text-center" onClick={e => e.stopPropagation()}>
                <div className="flex justify-center mb-6">
                    <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center animate-pulse">
                        <svg className="w-8 h-8 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                    </div>
                </div>
                
                <h3 className="text-2xl font-bold text-gray-900 mb-2">¡Perfecto!</h3>
                <p className="text-gray-600 mb-6">{message}</p>
                
                <button
                    onClick={onClose}
                    className="w-full px-6 py-3 bg-green-600 text-white rounded-lg font-semibold hover:bg-green-700 transition"
                >
                    Entendido
                </button>
            </div>
        </div>
    );
}

// Modal de devolución - permite seleccionar productos a devolver
function RefundModal({ isOpen, onClose, onConfirm, order }: {
    isOpen: boolean;
    onClose: () => void;
    onConfirm: (selectedItems: any[], reason: string) => void;
    order: Order | null;
}) {
    const [selectedItems, setSelectedItems] = useState<{ [key: string]: { selected: boolean; quantity: number } }>({});
    const [reason, setReason] = useState('');
    const [step, setStep] = useState<'items' | 'reason'>('items');

    const reasons = [
        { id: 'defective', label: 'Producto defectuoso o dañado' },
        { id: 'wrong_size', label: 'Talla incorrecta' },
        { id: 'not_as_described', label: 'No coincide con la descripción' },
        { id: 'wrong_product', label: 'Recibí un producto equivocado' },
        { id: 'not_satisfied', label: 'No estoy satisfecho con la calidad' },
        { id: 'other', label: 'Otro motivo' },
    ];

    // Reset when modal opens
    useEffect(() => {
        if (isOpen && order) {
            const items = Array.isArray(order.items) ? order.items : [];
            const initial: any = {};
            items.forEach((item: any, idx: number) => {
                initial[idx] = { selected: false, quantity: item.quantity || 1 };
            });
            setSelectedItems(initial);
            setReason('');
            setStep('items');
        }
    }, [isOpen, order]);

    if (!isOpen || !order) return null;

    const items = Array.isArray(order.items) ? order.items : [];
    const hasSelection = Object.values(selectedItems).some(s => s.selected);
    
    const totalRefund = items.reduce((sum: number, item: any, idx: number) => {
        if (selectedItems[idx]?.selected) {
            return sum + ((item.price_cents || 0) * (selectedItems[idx]?.quantity || 1));
        }
        return sum;
    }, 0);

    const handleSelectAll = () => {
        const allSelected = Object.values(selectedItems).every(s => s.selected);
        const updated: any = {};
        items.forEach((item: any, idx: number) => {
            updated[idx] = { selected: !allSelected, quantity: item.quantity || 1 };
        });
        setSelectedItems(updated);
    };

    const handleConfirm = () => {
        const returnItems = items
            .map((item: any, idx: number) => {
                if (selectedItems[idx]?.selected) {
                    return {
                        order_item_id: item.id,
                        product_id: item.product_id,
                        product_name: item.product_name || item.name || 'Producto',
                        quantity: selectedItems[idx].quantity,
                        price_cents: item.price_cents || 0,
                        total_cents: (item.price_cents || 0) * selectedItems[idx].quantity,
                        size: item.size || null,
                    };
                }
                return null;
            })
            .filter(Boolean);

        onConfirm(returnItems, reason);
    };

    return (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4" onClick={onClose}>
            <div className="bg-white rounded-2xl shadow-2xl max-w-lg w-full max-h-[90vh] overflow-y-auto animate-fadeIn" onClick={e => e.stopPropagation()}>
                <div className="p-6">
                    <div className="flex items-center gap-3 mb-6">
                        <div className="w-10 h-10 bg-orange-100 rounded-full flex items-center justify-center">
                            <svg className="w-5 h-5 text-orange-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 15v-1a4 4 0 00-4-4H8m0 0l3 3m-3-3l3-3m9 14V5a2 2 0 00-2-2H6a2 2 0 00-2 2v16l4-2 4 2 4-2 4 2z" />
                            </svg>
                        </div>
                        <div>
                            <h3 className="text-lg font-bold text-gray-900">Solicitar Devolución</h3>
                            <p className="text-sm text-gray-500">
                                {step === 'items' ? 'Selecciona los productos a devolver' : 'Indica el motivo de la devolución'}
                            </p>
                        </div>
                    </div>

                    {step === 'items' && (
                        <>
                            {/* Seleccionar todos */}
                            <div className="flex items-center justify-between mb-4 pb-3 border-b border-gray-200">
                                <span className="text-sm font-semibold text-gray-700">Productos del pedido</span>
                                <button
                                    onClick={handleSelectAll}
                                    className="text-xs font-bold text-orange-600 hover:text-orange-700 transition"
                                >
                                    {Object.values(selectedItems).every(s => s.selected) ? 'Deseleccionar todos' : 'Seleccionar todos'}
                                </button>
                            </div>

                            <div className="space-y-3 mb-6">
                                {items.map((item: any, idx: number) => (
                                    <label
                                        key={idx}
                                        className="flex items-center gap-3 p-3 border-2 rounded-lg cursor-pointer hover:bg-gray-50 transition"
                                        style={{
                                            borderColor: selectedItems[idx]?.selected ? '#ea580c' : '#e5e7eb',
                                            backgroundColor: selectedItems[idx]?.selected ? '#fff7ed' : 'transparent',
                                        }}
                                    >
                                        <input
                                            type="checkbox"
                                            checked={selectedItems[idx]?.selected || false}
                                            onChange={(e) => {
                                                setSelectedItems(prev => ({
                                                    ...prev,
                                                    [idx]: { ...prev[idx], selected: e.target.checked },
                                                }));
                                            }}
                                            className="w-4 h-4 text-orange-600 rounded cursor-pointer"
                                        />
                                        <div className="flex-1 min-w-0">
                                            <p className="font-medium text-gray-900 text-sm truncate">
                                                {item.product_name || item.name || 'Producto'}
                                            </p>
                                            <p className="text-xs text-gray-500">
                                                {item.size && `Talla: ${item.size} · `}
                                                Cant: {item.quantity || 1} · {((item.price_cents || 0) / 100).toFixed(2)}€/ud
                                            </p>
                                        </div>
                                        <span className="font-bold text-gray-900 text-sm">
                                            {(((item.price_cents || 0) * (item.quantity || 1)) / 100).toFixed(2)}€
                                        </span>
                                    </label>
                                ))}
                            </div>

                            {hasSelection && (
                                <div className="bg-orange-50 border border-orange-200 rounded-lg p-3 mb-4">
                                    <div className="flex justify-between items-center">
                                        <span className="text-sm font-semibold text-orange-800">Importe a devolver:</span>
                                        <span className="text-lg font-black text-orange-600">{(totalRefund / 100).toFixed(2)}€</span>
                                    </div>
                                </div>
                            )}

                            <div className="flex gap-3">
                                <button onClick={onClose} className="flex-1 px-4 py-2.5 border border-gray-300 text-gray-700 rounded-lg font-semibold hover:bg-gray-50 transition">
                                    Cancelar
                                </button>
                                <button
                                    onClick={() => setStep('reason')}
                                    disabled={!hasSelection}
                                    className="flex-1 px-4 py-2.5 bg-orange-600 text-white rounded-lg font-semibold hover:bg-orange-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    Continuar
                                </button>
                            </div>
                        </>
                    )}

                    {step === 'reason' && (
                        <>
                            <div className="space-y-3 mb-6">
                                {reasons.map((r) => (
                                    <label
                                        key={r.id}
                                        className="flex items-center p-3 border-2 rounded-lg cursor-pointer hover:bg-gray-50 transition"
                                        style={{
                                            borderColor: reason === r.id ? '#ea580c' : '#e5e7eb',
                                            backgroundColor: reason === r.id ? '#fff7ed' : 'transparent',
                                        }}
                                    >
                                        <input
                                            type="radio"
                                            name="refund-reason"
                                            value={r.id}
                                            checked={reason === r.id}
                                            onChange={(e) => setReason(e.target.value)}
                                            className="w-4 h-4 cursor-pointer"
                                        />
                                        <span className="ml-3 text-gray-700 font-medium text-sm">{r.label}</span>
                                    </label>
                                ))}
                            </div>

                            <div className="bg-orange-50 border border-orange-200 rounded-lg p-3 mb-4">
                                <div className="flex justify-between items-center">
                                    <span className="text-sm font-semibold text-orange-800">Reembolso total:</span>
                                    <span className="text-lg font-black text-orange-600">{(totalRefund / 100).toFixed(2)}€</span>
                                </div>
                                <p className="text-xs text-orange-700 mt-1">El reembolso se procesará en 5-7 días hábiles</p>
                            </div>

                            <div className="flex gap-3">
                                <button onClick={() => setStep('items')} className="flex-1 px-4 py-2.5 border border-gray-300 text-gray-700 rounded-lg font-semibold hover:bg-gray-50 transition">
                                    Atrás
                                </button>
                                <button
                                    onClick={handleConfirm}
                                    disabled={!reason}
                                    className="flex-1 px-4 py-2.5 bg-orange-600 text-white rounded-lg font-semibold hover:bg-orange-700 transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                                >
                                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 15v-1a4 4 0 00-4-4H8m0 0l3 3m-3-3l3-3m9 14V5a2 2 0 00-2-2H6a2 2 0 00-2 2v16l4-2 4 2 4-2 4 2z" />
                                    </svg>
                                    Confirmar Devolución
                                </button>
                            </div>
                        </>
                    )}
                </div>
            </div>
        </div>
    );
}

export default function UserOrders() {
    const [orders, setOrders] = useState<Order[]>([]);
    const [refundedOrderIds, setRefundedOrderIds] = useState<Set<string>>(new Set());
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [expandedOrder, setExpandedOrder] = useState<string | null>(null);
    const [invoiceModal, setInvoiceModal] = useState<{ open: boolean; orderId: string | null }>({ open: false, orderId: null });
    const [cancellingOrderId, setCancellingOrderId] = useState<string | null>(null);
    const [cancellationModal, setCancellationModal] = useState<{ open: boolean; orderId: string | null }>({ open: false, orderId: null });
    const [successModal, setSuccessModal] = useState<{ open: boolean; message: string }>({ open: false, message: '' });
    const [refundModal, setRefundModal] = useState<{ open: boolean; order: Order | null }>({ open: false, order: null });
    const [processingRefund, setProcessingRefund] = useState(false);

    useEffect(() => {
        fetchOrders();
    }, []);

    const fetchOrders = async () => {
        try {
            setLoading(true);
            console.log('🔄 Iniciando carga de pedidos (API Endpoint)...');

            // 1. Intentar obtener email y ID de la sesión activa
            const { data: { session }, error: sessionError } = await supabaseClient.auth.getSession();

            let userEmail = session?.user?.email;
            let userId = session?.user?.id;

            // 2. Si no hay sesión, intentar recuperar del localStorage (Fallback)
            if (!userEmail) {
                // Intentar obtener de la key de sesión de supabase
                const localSessionStr = localStorage.getItem(`sb-${import.meta.env.PUBLIC_SUPABASE_URL.split('//')[1].split('.')[0]}-auth-token`)
                    || localStorage.getItem('supabase.auth.token');

                if (localSessionStr) {
                    try {
                        const parsed = JSON.parse(localSessionStr);
                        userEmail = parsed.user?.email;
                        userId = parsed.user?.id;
                    } catch (e) {
                        console.error('Error parseando sesión local', e);
                    }
                }

                // Último recurso
                if (!userEmail) {
                    userEmail = localStorage.getItem('userEmail') || undefined;
                }
            }

            if (!userEmail && !userId) {
                console.warn('⚠️ No se encontró usuario identificado');
                setError('No se pudo identificar tu usuario.');
                setLoading(false);
                return;
            }

            console.log('🔍 Buscando pedidos para:', userEmail, 'ID:', userId);

            // 3. Llamar al endpoint
            // Agregamos timestamp para evitar caché del navegador
            const timestamp = new Date().getTime();
            let url = `/api/orders?email=${encodeURIComponent(userEmail || '')}&t=${timestamp}`;
            if (userId) url += `&userId=${encodeURIComponent(userId)}`;

            const headers: any = {
                'Content-Type': 'application/json'
            };
            if (userEmail) headers['x-customer-email'] = userEmail;
            if (userId) headers['x-user-id'] = userId;

            const response = await fetch(url, {
                method: 'GET',
                headers: headers
            });

            const data = await response.json();
            console.log('📦 Data recibida del API:', data);

            if (!response.ok) {
                console.error('❌ Error API:', data);
                setError('Error al cargar pedidos.');
            } else {
                const ordersList = data.orders || [];
                console.log('✅ Seteando pedidos:', ordersList.length);
                setOrders(ordersList);
            }

            // Cargar IDs de pedidos que ya tienen devolución
            if (userEmail) {
                try {
                    const { data: refundsData, error: refundsError } = await supabaseClient
                        .from('refunds')
                        .select('order_id')
                        .eq('customer_email', userEmail);

                    if (!refundsError && refundsData) {
                        setRefundedOrderIds(new Set(refundsData.map((r: any) => r.order_id)));
                    }
                } catch (e) {
                    console.warn('Tabla refunds no disponible aún');
                }
            }

        } catch (err: any) {
            console.error('❌ Error inesperado:', err);
            setError('Ocurrió un error inesperado al cargar tus pedidos.');
        } finally {
            setLoading(false);
        }
    };

    const getStatusBadge = (status: string) => {
        const statusMap: { [key: string]: { color: string; label: string } } = {
            pending: { color: 'bg-yellow-100 text-yellow-800', label: 'Pendiente' },
            processing: { color: 'bg-blue-100 text-blue-800', label: 'Procesando' },
            confirmed: { color: 'bg-blue-100 text-blue-800', label: 'Confirmado' },
            shipped: { color: 'bg-purple-100 text-purple-800', label: 'Enviado' },
            delivered: { color: 'bg-green-100 text-green-800', label: 'Entregado' },
            completed: { color: 'bg-green-100 text-green-800', label: 'Completado' },
            cancelled: { color: 'bg-red-100 text-red-800', label: 'Cancelado' },
        };

        const config = statusMap[status.toLowerCase()] || { color: 'bg-gray-100 text-gray-800', label: status };
        return <span className={`px-3 py-1 rounded-full text-sm font-bold ${config.color}`}>{config.label}</span>;
    };

    const toggleDetails = (orderId: string) => {
        if (expandedOrder === orderId) {
            setExpandedOrder(null);
        } else {
            setExpandedOrder(orderId);
        }
    };

    const cancelOrder = async (orderId: string) => {
        setCancellationModal({ open: true, orderId });
    };

    const handleCancellationConfirm = async (reason: string) => {
        const orderId = cancellationModal.orderId;
        if (!orderId) return;

        setCancellationModal({ open: false, orderId: null });
        setCancellingOrderId(orderId);
        
        try {
            const { data: { session } } = await supabaseClient.auth.getSession();
            const userEmail = session?.user?.email || localStorage.getItem('userEmail') || '';
            const userId = session?.user?.id || '';

            const response = await fetch('/api/orders/cancel', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'x-customer-email': userEmail,
                    'x-user-id': userId,
                },
                body: JSON.stringify({ orderId, cancellationReason: reason }),
            });

            const data = await response.json();

            if (!response.ok) {
                alert(data.error || 'Error al cancelar el pedido');
                return;
            }

            // Eliminar el pedido de la lista local
            setOrders(prev => prev.filter(o => o.id !== orderId));
            setExpandedOrder(null);
            setSuccessModal({ open: true, message: 'Tu pedido ha sido cancelado exitosamente. Tu dinero será devuelto en 5-7 días hábiles.' });
        } catch (err) {
            console.error('Error cancelando pedido:', err);
            alert('Ocurrió un error al cancelar el pedido');
        } finally {
            setCancellingOrderId(null);
        }
    };

    const handleRefundConfirm = async (selectedItems: any[], reason: string) => {
        const order = refundModal.order;
        if (!order) return;

        setRefundModal({ open: false, order: null });
        setProcessingRefund(true);

        try {
            const { data: { session } } = await supabaseClient.auth.getSession();
            const userEmail = session?.user?.email || localStorage.getItem('userEmail') || '';
            const userName = session?.user?.user_metadata?.full_name || 'Cliente';

            const response = await fetch('/api/orders/refund', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    orderId: order.id,
                    items: selectedItems,
                    reason: reason,
                    customerEmail: userEmail,
                    customerName: userName,
                }),
            });

            const data = await response.json();

            if (!response.ok) {
                alert(data.error || 'Error al procesar la devolución');
                return;
            }

            setSuccessModal({
                open: true,
                message: `Tu devolución ha sido procesada correctamente. Se reembolsarán ${data.refundAmount}€ en 5-7 días hábiles. Recibirás un email de confirmación.`,
            });

            // Recargar pedidos
            fetchOrders();
        } catch (err) {
            console.error('Error en devolución:', err);
            alert('Ocurrió un error al procesar la devolución');
        } finally {
            setProcessingRefund(false);
        }
    };

    if (loading) {
        return (
            <div className="flex justify-center items-center py-12">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-red-600"></div>
                <span className="ml-3 text-gray-600">Cargando pedidos...</span>
            </div>
        );
    }

    if (error) {
        return (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
                <p className="font-bold mb-2">Error</p>
                <p>{error}</p>
                <button
                    onClick={fetchOrders}
                    className="mt-4 px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 transition"
                >
                    Reintentar
                </button>
            </div>
        );
    }

    if (orders.length === 0) {
        return (
            <div className="bg-gray-50 border-2 border-dashed border-gray-300 rounded-lg p-12 text-center">
                <p className="text-gray-500 mb-4 text-lg">No tienes pedidos aún</p>
                <p className="text-sm text-gray-400 mb-6">Aquí aparecerán tus pedidos cuando realices tu primera compra</p>
                <a href="/productos" className="inline-block px-8 py-3 bg-red-600 text-white font-bold rounded-lg hover:bg-red-700 transition transform hover:scale-105">
                    Ir a Comprar
                </a>

            </div>
        );
    }

    return (
        <div className="space-y-6">
            {orders.map((order, index) => {
                // Safe access guards
                const items = Array.isArray(order.items) ? order.items : [];
                const dateStr = order.created_at ? new Date(order.created_at).toLocaleDateString() : 'Fecha desconocida';
                const total = typeof order.total_cents === 'number' ? (order.total_cents / 100).toFixed(2) : '0.00';

                // Pedido X (basado en el índice, el más nuevo es el número más alto)
                const displayOrderNum = orders.length - index;

                return (
                    <div key={order.id} className="bg-white border border-gray-200 rounded-xl shadow-sm hover:shadow-md transition-shadow overflow-hidden">
                        {/* Header del pedido */}
                        <div className="p-6 bg-white">
                            <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-4 gap-4">
                                <div>
                                    <div className="flex items-center gap-3">
                                        <span className="bg-gray-100 text-gray-700 px-3 py-1 rounded-full text-xs font-bold">
                                            Pedido {displayOrderNum}
                                        </span>
                                        <p className="text-sm text-gray-500">
                                            {dateStr}
                                        </p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-4">
                                    {getStatusBadge(order.status || 'pending')}
                                    <p className="text-xl font-bold text-gray-900">€{total}</p>
                                </div>
                            </div>

                            {/* Items resumen */}
                            <div className="border-t border-gray-100 pt-4 mb-4">
                                <div className="space-y-2">
                                    {items.length > 0 ? items.map((item: any, idx: number) => (
                                        <div key={idx} className="flex justify-between text-sm items-center">
                                            <div className="flex items-center gap-2">
                                                <span className="font-medium text-gray-900">{item.quantity || 1}x</span>
                                                <span className="text-gray-600">{item.product_name || item.name || 'Producto'}</span>
                                            </div>
                                            <span className="font-medium text-gray-900">€{((item.total_cents || (item.price || 0) * (item.quantity || 1)) / 100).toFixed(2)}</span>
                                        </div>
                                    )) : <p className="text-sm text-gray-400">Sin items</p>}
                                </div>
                            </div>

                            {/* Botones de acción inferior */}
                            <div className="flex flex-col sm:flex-row gap-3 mt-6 pt-4 border-t border-gray-100">
                                <button
                                    onClick={() => toggleDetails(order.id)}
                                    className={`
                  flex-1 py-2 px-4 rounded-lg font-semibold transition-colors flex items-center justify-center gap-2
                  ${expandedOrder === order.id
                                            ? 'bg-gray-100 text-gray-800'
                                            : 'bg-cyan-50 text-cyan-700 hover:bg-cyan-100'
                                        }
                `}
                                >
                                    {expandedOrder === order.id ? 'Ocultar Detalles' : 'Ver Detalles de Envío'}
                                    <svg
                                        className={`w-4 h-4 transition-transform ${expandedOrder === order.id ? 'rotate-180' : ''}`}
                                        fill="none"
                                        viewBox="0 0 24 24"
                                        stroke="currentColor"
                                    >
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                                    </svg>
                                </button>

                                <button
                                    onClick={() => {
                                        setInvoiceModal({ open: true, orderId: order.id });
                                    }}
                                    className="flex-1 border border-gray-300 text-gray-700 py-2 px-4 rounded-lg font-semibold hover:bg-gray-50 transition flex items-center justify-center gap-2"
                                >
                                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                    </svg>
                                    Descargar Factura
                                </button>

                                {/* Botón Cancelar Pedido - solo visible si está pendiente */}
                                {['pending', 'pendiente'].includes(order.status?.toLowerCase().trim() || '') && (
                                    <button
                                        onClick={() => cancelOrder(order.id)}
                                        disabled={cancellingOrderId === order.id}
                                        className="flex-1 border border-red-300 text-red-600 py-2 px-4 rounded-lg font-semibold hover:bg-red-50 transition flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                                    >
                                        {cancellingOrderId === order.id ? (
                                            <>
                                                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-red-600"></div>
                                                Cancelando...
                                            </>
                                        ) : (
                                            <>
                                                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                                </svg>
                                                Cancelar Pedido
                                            </>
                                        )}
                                    </button>
                                )}

                                {/* Botón Solicitar Devolución - solo para pedidos completados SIN devolución previa */}
                                {['completed', 'completado'].includes(order.status?.toLowerCase().trim() || '') && !refundedOrderIds.has(order.id) && (
                                    <button
                                        onClick={() => setRefundModal({ open: true, order })}
                                        disabled={processingRefund}
                                        className="flex-1 border border-orange-300 text-orange-600 py-2 px-4 rounded-lg font-semibold hover:bg-orange-50 transition flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                                    >
                                        {processingRefund ? (
                                            <>
                                                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-orange-600"></div>
                                                Procesando...
                                            </>
                                        ) : (
                                            <>
                                                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 15v-1a4 4 0 00-4-4H8m0 0l3 3m-3-3l3-3m9 14V5a2 2 0 00-2-2H6a2 2 0 00-2 2v16l4-2 4 2 4-2 4 2z" />
                                                </svg>
                                                Solicitar Devolución
                                            </>
                                        )}
                                    </button>
                                )}
                            </div>

                            {/* Detalles expandibles */}
                            {expandedOrder === order.id && (
                                <div className="mt-6 pt-6 border-t border-gray-200 animate-fadeIn">
                                    <h4 className="font-bold text-gray-900 mb-4">Estado del Envío</h4>
                                    <OrderDetails status={order.status || 'pending'} />

                                    {/* Mensaje de estado del envío */}
                                    {order.notes && !order.notes.includes('Session ID') && !order.notes.includes('Email:') && (
                                        <div className="mt-6 bg-blue-50 border-l-4 border-blue-500 p-4 rounded-r-lg">
                                            <div className="flex items-start gap-3">
                                                <div className="flex-shrink-0">
                                                    <svg className="w-5 h-5 text-blue-600 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                                    </svg>
                                                </div>
                                                <div>
                                                    <h5 className="font-semibold text-blue-900 mb-1">Actualización de tu envío</h5>
                                                    <p className="text-sm text-blue-800">{order.notes}</p>
                                                </div>
                                            </div>
                                        </div>
                                    )}

                                    <div className="mt-6 bg-gray-50 p-4 rounded-lg">
                                        <h5 className="font-semibold text-gray-900 mb-2 text-sm">Dirección de Envío</h5>
                                        <p className="text-sm text-gray-500">
                                            La dirección de envío y facturación están disponibles en la factura descargable.
                                        </p>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                )
            })}

            <InvoiceModal
                isOpen={invoiceModal.open}
                onClose={() => setInvoiceModal({ open: false, orderId: null })}
                onSubmit={(name, email) => {
                    if (invoiceModal.orderId) {
                        const invoiceUrl = `/pdf/invoice?order_id=${invoiceModal.orderId}&customer_name=${encodeURIComponent(name)}&customer_email=${encodeURIComponent(email)}`;
                        window.open(invoiceUrl, '_blank');
                    }
                }}
            />

            <CancellationModal
                isOpen={cancellationModal.open}
                onClose={() => setCancellationModal({ open: false, orderId: null })}
                onConfirm={handleCancellationConfirm}
            />

            <SuccessModal
                isOpen={successModal.open}
                onClose={() => setSuccessModal({ open: false, message: '' })}
                message={successModal.message}
            />

            <RefundModal
                isOpen={refundModal.open}
                onClose={() => setRefundModal({ open: false, order: null })}
                onConfirm={handleRefundConfirm}
                order={refundModal.order}
            />
        </div>
    );
}
