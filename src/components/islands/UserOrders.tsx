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

export default function UserOrders() {
    const [orders, setOrders] = useState<Order[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [expandedOrder, setExpandedOrder] = useState<string | null>(null);
    const [invoiceModal, setInvoiceModal] = useState<{ open: boolean; orderId: string | null }>({ open: false, orderId: null });

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
                            </div>

                            {/* Detalles expandibles */}
                            {expandedOrder === order.id && (
                                <div className="mt-6 pt-6 border-t border-gray-200 animate-fadeIn">
                                    <h4 className="font-bold text-gray-900 mb-4">Estado del Envío</h4>
                                    <OrderDetails status={order.status || 'pending'} />

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
        </div>
    );
}
