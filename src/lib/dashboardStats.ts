import { supabaseClient } from './supabase';

interface DashboardStats {
  totalSalesMonth: number;
  pendingOrders: number;
  topProduct: { name: string; sold: number } | null;
  salesLast7Days: Array<{ date: string; sales: number }>;
}

/**
 * Obtiene las estadísticas de ventas del mes actual
 */
export async function getTotalSalesMonth(): Promise<number> {
  try {
    const now = new Date();
    const firstDay = new Date(now.getFullYear(), now.getMonth(), 1);
    
    // Obtener todas las órdenes sin filtro primero
    const { data, error } = await supabaseClient
      .from('orders')
      .select('total_cents, created_at');

    if (error) {
      console.error('Error fetching total sales:', error);
      return 0;
    }

    console.log('Orders data:', data);
    
    // Filtrar por mes en cliente si es necesario
    const monthOrders = data?.filter(order => {
      if (!order.created_at) return false;
      const orderDate = new Date(order.created_at);
      return orderDate.getMonth() === now.getMonth() && orderDate.getFullYear() === now.getFullYear();
    }) || [];
    
    const totalCents = monthOrders.reduce((sum, order) => sum + (order.total_cents || 0), 0);
    console.log('Total sales month:', { totalCents, euroValue: totalCents / 100, monthOrders });
    return totalCents / 100;
  } catch (error) {
    console.error('Error in getTotalSalesMonth:', error);
    return 0;
  }
}

/**
 * Obtiene el número de pedidos pendientes
 */
export async function getPendingOrders(): Promise<number> {
  try {
    const { data, error } = await supabaseClient
      .from('orders')
      .select('id', { count: 'exact' });

    if (error) {
      console.error('Error fetching pending orders:', error);
      return 0;
    }

    const count = data?.length || 0;
    console.log('Pending orders count:', count, 'data:', data);
    return count;
  } catch (error) {
    console.error('Error in getPendingOrders:', error);
    return 0;
  }
}

/**
 * Obtiene el producto más vendido del mes
 */
export async function getTopProduct(): Promise<{ name: string; sold: number } | null> {
  try {
    // Por ahora, deshabilitar esta función ya que requiere acceso a items que está restringido
    // TODO: Implementar después de configurar las políticas RLS correctamente
    console.log('getTopProduct: Deshabilitado por ahora');
    return null;
  } catch (error) {
    console.error('Error in getTopProduct:', error);
    return null;
  }
}

/**
 * Obtiene las ventas de los últimos 7 días
 */
export async function getSalesLast7Days(): Promise<Array<{ date: string; sales: number }>> {
  try {
    const now = new Date();
    const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    
    // Obtener todas las órdenes sin filtro
    const { data, error } = await supabaseClient
      .from('orders')
      .select('created_at, total_cents');

    if (error) {
      console.error('Error fetching sales last 7 days:', error);
      return [];
    }

    console.log('All orders for chart:', data);

    // Agrupar ventas por día
    const salesByDay: Record<string, number> = {};
    
    // Inicializar últimos 7 días
    for (let i = 0; i < 7; i++) {
      const date = new Date(now.getTime() - (6 - i) * 24 * 60 * 60 * 1000);
      const dateStr = date.toLocaleDateString('es-ES', { month: 'short', day: 'numeric' });
      salesByDay[dateStr] = 0;
    }

    // Sumar ventas por día (solo últimos 7 días)
    data?.forEach((order) => {
      if (!order.created_at) return;
      
      const orderDate = new Date(order.created_at);
      
      // Solo incluir órdenes de los últimos 7 días
      if (orderDate.getTime() >= sevenDaysAgo.getTime()) {
        const dateStr = orderDate.toLocaleDateString('es-ES', { month: 'short', day: 'numeric' });
        if (dateStr in salesByDay) {
          salesByDay[dateStr] += (order.total_cents || 0) / 100; // Convertir a euros
        }
      }
    });

    const result = Object.entries(salesByDay).map(([date, sales]) => ({
      date,
      sales: Math.round(sales * 100) / 100, // Redondear a 2 decimales
    }));

    console.log('Sales by day:', result);
    return result;
  } catch (error) {
    console.error('Error in getSalesLast7Days:', error);
    return [];
  }
}

/**
 * Obtiene todas las estadísticas del dashboard
 */
export async function getDashboardStats(): Promise<DashboardStats> {
  try {
    const [totalSalesMonth, pendingOrders, topProduct, salesLast7Days] = await Promise.all([
      getTotalSalesMonth(),
      getPendingOrders(),
      getTopProduct(),
      getSalesLast7Days(),
    ]);

    // Retornar los datos reales que se obtuvieron
    return {
      totalSalesMonth: totalSalesMonth || 0,
      pendingOrders: pendingOrders || 0,
      topProduct: topProduct,
      salesLast7Days: salesLast7Days && salesLast7Days.length > 0 ? salesLast7Days : [],
    };
  } catch (error) {
    console.error('Error in getDashboardStats:', error);
    // Retornar valores vacíos en caso de error
    return {
      totalSalesMonth: 0,
      pendingOrders: 0,
      topProduct: null,
      salesLast7Days: [],
    };
  }
}
