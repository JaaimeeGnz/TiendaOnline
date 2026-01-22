import { useEffect, useState } from 'react';

interface Order {
  id: string;
  session_id?: string;
  stripe_session_id?: string;
  order_number?: number;
  items: any[];
  total_cents: number;
  status: string;
  created_at: string;
}

export default function MyOrders() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    try {
      setLoading(true);
      
      // Obtener el correo del usuario
      const userEmail = localStorage.getItem('userEmail') || sessionStorage.getItem('userEmail');
      
      if (!userEmail) {
        console.warn('⚠️ No hay correo de usuario');
        setOrders([]);
        setLoading(false);
        return;
      }

      console.log('🔍 Buscando pedidos para:', userEmail);
      
      const response = await fetch(`/api/orders?email=${encodeURIComponent(userEmail)}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'x-customer-email': userEmail,
        },
      });

      const data = await response.json();

      if (!response.ok) {
        console.error('❌ Error en response:', data);
        setOrders([]);
      } else {
        console.log('✅ Pedidos encontrados:', data.orders?.length || 0);
        console.log('📦 Primer pedido:', data.orders?.[0]);
        setOrders(data.orders || []);
      }
    } catch (err: any) {
      console.error('Error fetching orders:', err);
      setOrders([]);
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadge = (status: string) => {
    const statusMap: { [key: string]: { color: string; label: string } } = {
      pending: { color: 'bg-yellow-100 text-yellow-800', label: 'Pendiente' },
      processing: { color: 'bg-blue-100 text-blue-800', label: 'Procesando' },
      completed: { color: 'bg-green-100 text-green-800', label: 'Completado' },
      cancelled: { color: 'bg-red-100 text-red-800', label: 'Cancelado' },
    };

    const config = statusMap[status] || statusMap['pending'];
    return <span className={`px-3 py-1 rounded-full text-sm font-bold ${config.color}`}>{config.label}</span>;
  };

  if (loading) {
    return <div className="text-center py-12">Cargando pedidos...</div>;
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
        <p className="font-bold mb-2">Error: {error}</p>
        <p className="text-sm mb-4">Para resolver este problema, por favor:</p>
        <ol className="text-sm list-decimal ml-5 mb-4">
          <li>Haz logout en tu cuenta (icono de usuario arriba a la derecha)</li>
          <li>Vuelve a iniciar sesión</li>
          <li>Regresa a esta página</li>
        </ol>
        <a href="/logout" className="inline-block px-4 py-2 bg-red-600 text-white font-bold rounded hover:bg-red-700 transition">
          Hacer Logout
        </a>
      </div>
    );
  }

  if (orders.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500 mb-4">No tienes pedidos aún</p>
        <p className="text-sm text-gray-400 mb-4">Aquí aparecerán tus pedidos cuando realices tu primera compra</p>
        <a href="/productos" className="inline-block px-6 py-2 bg-red-600 text-white font-bold rounded-lg hover:bg-red-700 transition">
          Ir a Comprar
        </a>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-gray-900 uppercase">Mis Pedidos</h2>

      {orders.map((order) => (
        <div key={order.id} className="bg-gray-50 border border-gray-200 rounded-lg p-6">
          <div className="flex justify-between items-start mb-4">
            <div>
              <p className="text-sm text-gray-500 font-bold">Pedido #PED-{String(order.order_number || order.session_id.substring(0, 6)).padStart(6, '0')}</p>
              <p className="text-xs text-gray-400">
                {new Date(order.created_at).toLocaleDateString('es-ES', {
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric',
                  hour: '2-digit',
                  minute: '2-digit',
                })}
              </p>
            </div>
            <div className="text-right">
              {getStatusBadge(order.status)}
              <p className="text-lg font-bold text-red-600 mt-2">€{(order.total_cents / 100).toFixed(2)}</p>
            </div>
          </div>

          <div className="border-t border-gray-300 pt-4 space-y-2 mb-4">
            {order.items.map((item: any, idx: number) => (
              <div key={idx} className="flex justify-between text-sm">
                <span className="text-gray-600">
                  {item.quantity}x {item.name}
                </span>
                <span className="font-bold text-gray-900">€{((item.price || 0) * item.quantity).toFixed(2)}</span>
              </div>
            ))}
          </div>

          <div className="border-t border-gray-300 pt-4 flex gap-2">
            <button
              onClick={() => {
                const total = order.total_cents / 100;
                const orderNum = `PED-${String(order.order_number || order.session_id.substring(0, 6)).padStart(6, '0')}`;
                alert(`Detalles del pedido\n\nPedido: ${orderNum}\nTotal: €${total.toFixed(2)}\n\nEstado: ${order.status}`);
              }}
              className="flex-1 bg-cyan-500 text-white py-2 px-4 rounded font-bold hover:bg-cyan-600 transition text-sm"
            >
              Ver Detalles
            </button>
            <button
              onClick={async () => {
                let sessionId = order.stripe_session_id || order.session_id;
                
                // Si no hay sessionId, intentar obtenerlo del localStorage
                if (!sessionId) {
                  sessionId = localStorage.getItem('stripe_session_id');
                }
                
                console.log('📥 Descargando factura. SessionId:', sessionId);
                
                if (sessionId) {
                  try {
                    // Usar localStorage como param en la URL para evitar problemas con middleware
                    localStorage.setItem('invoice_session_id', sessionId);
                    const response = await fetch(`/pdf/invoice?id=${encodeURIComponent(sessionId)}`);
                    console.log('📥 Response status:', response.status);
                    if (!response.ok) {
                      const error = await response.json();
                      alert(`Error: ${error.error || 'Error al descargar factura'}`);
                      return;
                    }
                    const html = await response.text();
                    const blob = new Blob([html], { type: 'text/html' });
                    const blobUrl = URL.createObjectURL(blob);
                    window.open(blobUrl);
                  } catch (error) {
                    console.error('Error:', error);
                    alert('Error al descargar factura');
                  }
                } else {
                  alert('No se encontró el ID de sesión para esta orden');
                }
              }}
              className="flex-1 bg-gray-300 text-gray-900 py-2 px-4 rounded font-bold hover:bg-gray-400 transition text-sm"
            >
              Descargar Factura
            </button>
          </div>
        </div>
      ))}
    </div>
  );
}
