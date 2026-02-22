import type { APIRoute } from 'astro';
import { createClient } from '@supabase/supabase-js';

export const prerender = false;

// Crear cliente de servidor
const supabaseUrl = import.meta.env.PUBLIC_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.PUBLIC_SUPABASE_ANON_KEY;

const supabase = createClient(supabaseUrl, supabaseAnonKey);

export const GET: APIRoute = async ({ request }) => {
  console.log('📊 Dashboard API called');
  try {
    // Obtener todas las órdenes
    const { data: orders, error: ordersError } = await supabase
      .from('orders')
      .select('*');

    console.log('📊 Orders query - Error:', ordersError);
    console.log('📊 Orders query - Data count:', orders?.length);
    console.log('📊 Orders query - First order:', orders?.[0]);

    if (ordersError) {
      console.error('❌ Error fetching orders:', ordersError);
      // Devolver vacío en lugar de error
      return new Response(
        JSON.stringify({
          totalSalesMonth: 0,
          pendingOrders: 0,
          topProduct: null,
          salesLast7Days: [],
          debug: { ordersError: ordersError.message, ordersCount: 0 }
        }),
        { status: 200, headers: { 'Content-Type': 'application/json' } }
      );
    }

    // Si no hay órdenes
    if (!orders || orders.length === 0) {
      console.log('📊 No orders found');
      return new Response(
        JSON.stringify({
          totalSalesMonth: 0,
          pendingOrders: 0,
          topProduct: null,
          salesLast7Days: [],
          debug: { ordersCount: 0 }
        }),
        { status: 200, headers: { 'Content-Type': 'application/json' } }
      );
    }

    // Calcular ventas del mes
    const now = new Date();
    const monthOrders = orders.filter(order => {
      if (!order.created_at) return false;
      const orderDate = new Date(order.created_at);
      return orderDate.getMonth() === now.getMonth() && orderDate.getFullYear() === now.getFullYear();
    });

    const totalSalesMonth = monthOrders.reduce((sum, order) => sum + (order.total_cents || 0), 0) / 100;

    // Calcular pedidos pendientes
    const pendingOrders = orders.length;

    // Calcular ventas últimos 7 días
    const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    const salesByDay: Record<string, number> = {};

    // Inicializar últimos 7 días
    for (let i = 0; i < 7; i++) {
      const date = new Date(now.getTime() - (6 - i) * 24 * 60 * 60 * 1000);
      const dateStr = date.toLocaleDateString('es-ES', { month: 'short', day: 'numeric' });
      salesByDay[dateStr] = 0;
    }

    // Agrupar ventas por día
    orders.forEach(order => {
      if (!order.created_at) return;
      
      const orderDate = new Date(order.created_at);
      
      if (orderDate.getTime() >= sevenDaysAgo.getTime()) {
        const dateStr = orderDate.toLocaleDateString('es-ES', { month: 'short', day: 'numeric' });
        if (dateStr in salesByDay) {
          salesByDay[dateStr] += (order.total_cents || 0) / 100;
        }
      }
    });

    const salesLast7Days = Object.entries(salesByDay).map(([date, sales]) => ({
      date,
      sales: Math.round(sales * 100) / 100,
    }));

    console.log('✅ Dashboard stats calculated:', { totalSalesMonth, pendingOrders, last7DaysCount: salesLast7Days.length });

    return new Response(
      JSON.stringify({
        totalSalesMonth: Math.round(totalSalesMonth * 100) / 100,
        pendingOrders,
        topProduct: null,
        salesLast7Days,
      }),
      { status: 200, headers: { 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('❌ Error in dashboard-stats API:', error);
    return new Response(
      JSON.stringify({
        totalSalesMonth: 0,
        pendingOrders: 0,
        topProduct: null,
        salesLast7Days: [],
        error: 'Error al obtener estadísticas',
      }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
};
