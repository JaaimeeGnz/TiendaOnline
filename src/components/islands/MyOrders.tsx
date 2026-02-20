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

export default function MyOrders() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [expandedOrder, setExpandedOrder] = useState<string | null>(null);
  const [cancellingOrderId, setCancellingOrderId] = useState<string | null>(null);

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

  const cancelOrder = async (orderId: string) => {
    if (!confirm('¿Estás seguro de que quieres cancelar este pedido? Esta acción no se puede deshacer.')) {
      return;
    }

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
        body: JSON.stringify({ orderId }),
      });

      const data = await response.json();

      if (!response.ok) {
        alert(data.error || 'Error al cancelar el pedido');
        return;
      }

      // Eliminar el pedido de la lista local
      setOrders(prev => prev.filter(o => o.id !== orderId));
      setExpandedOrder(null);
    } catch (err) {
      console.error('Error cancelando pedido:', err);
      alert('Ocurrió un error al cancelar el pedido');
    } finally {
      setCancellingOrderId(null);
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

        {/* DEBUG TEMPORAL */}
        <div className="mt-8 p-4 bg-gray-200 rounded text-xs text-left font-mono text-gray-700 overflow-auto max-h-40">
          <p><strong>DEBUG INFO:</strong></p>
          <p>Orders Count: {orders.length}</p>
          <p>Loading: {String(loading)}</p>
          <p>Error: {error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {orders.map((order) => (
        <div key={order.id} className="bg-white border border-gray-200 rounded-xl shadow-sm hover:shadow-md transition-shadow overflow-hidden">
          {/* Header del pedido */}
          <div className="p-6 bg-white">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-4 gap-4">
              <div>
                <div className="flex items-center gap-3">
                  <span className="bg-gray-100 text-gray-600 px-2 py-1 rounded text-xs font-mono">
                    #{String(order.order_number || order.session_id?.substring(0, 6) || '---').padStart(6, '0')}
                  </span>
                  <p className="text-sm text-gray-500">
                    {new Date(order.created_at).toLocaleDateString('es-ES', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric'
                      // hour: '2-digit',
                      // minute: '2-digit'
                    })}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-4">
                {getStatusBadge(order.status)}
                <p className="text-xl font-bold text-gray-900">€{(order.total_cents / 100).toFixed(2)}</p>
              </div>
            </div>

            {/* Items resumen */}
            <div className="border-t border-gray-100 pt-4 mb-4">
              <div className="space-y-2">
                {order.items.map((item: any, idx: number) => (
                  <div key={idx} className="flex justify-between text-sm items-center">
                    <div className="flex items-center gap-2">
                      <span className="font-medium text-gray-900">{item.quantity}x</span>
                      <span className="text-gray-600">{item.name}</span>
                    </div>
                    <span className="font-medium text-gray-900">€{((item.price || 0) * item.quantity).toFixed(2)}</span>
                  </div>
                ))}
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
                onClick={async () => {
                  const sessionId = order.stripe_session_id || order.session_id || localStorage.getItem('stripe_session_id');

                  if (sessionId) {
                    try {
                      localStorage.setItem('invoice_session_id', sessionId);
                      window.open(`/pdf/invoice?id=${encodeURIComponent(sessionId)}`, '_blank');
                    } catch (error) {
                      alert('Error al abrir factura');
                    }
                  } else {
                    alert('No disponible ticket para este pedido');
                  }
                }}
                className="flex-1 border border-gray-300 text-gray-700 py-2 px-4 rounded-lg font-semibold hover:bg-gray-50 transition flex items-center justify-center gap-2"
              >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                Descargar Factura
              </button>

              {/* Botón Cancelar Pedido - solo visible si está pendiente */}
              {['pending', 'pendiente'].includes(order.status.toLowerCase().trim()) && (
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
            </div>

            {/* Detalles expandibles */}
            {expandedOrder === order.id && (
              <div className="mt-6 pt-6 border-t border-gray-200 animate-fadeIn">
                <h4 className="font-bold text-gray-900 mb-4">Estado del Envío</h4>
                <OrderDetails status={order.status} />

                <div className="mt-6 bg-gray-50 p-4 rounded-lg">
                  <h5 className="font-semibold text-gray-900 mb-2 text-sm">Dirección de Envío</h5>
                  {/* Aquí podríamos mostrar la dirección si la tuviéramos en la DB orders, 
                       pero por ahora asumiremos que no está fácilmente disponible en este objeto simple */}
                  <p className="text-sm text-gray-500">
                    La dirección de envío y facturación están disponibles en la factura descargable.
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>
      ))}
    </div>
  );
}
