import React, { useState, useEffect } from 'react';
import { getDashboardStats } from '../../lib/dashboardStats';

interface DashboardStats {
  totalSalesMonth: number;
  pendingOrders: number;
  topProduct: { name: string; sold: number } | null;
  salesLast7Days: Array<{ date: string; sales: number }>;
}

export default function DashboardAnalytics() {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadStats();
  }, []);

  const loadStats = async () => {
    try {
      setLoading(true);
      const data = await getDashboardStats();
      setStats(data);
      setError(null);
    } catch (err) {
      console.error('Error loading dashboard stats:', err);
      setError('Error al cargar las estadísticas');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-jd-turquoise"></div>
      </div>
    );
  }

  if (error || !stats) {
    return (
      <div className="bg-red-50 border-2 border-red-300 rounded-lg p-6 text-red-700">
        <p className="font-bold">{error || 'Error al cargar las estadísticas'}</p>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Ventas Totales del Mes */}
        <div className="bg-white border-2 border-jd-turquoise rounded-lg p-6 hover:shadow-lg transition">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-sm font-bold text-gray-600 uppercase">Ventas del Mes</p>
              <p className="text-4xl font-black text-jd-turquoise mt-3">
                {stats.totalSalesMonth.toFixed(2)}€
              </p>
              <p className="text-xs text-gray-500 mt-2">Enero 2026</p>
            </div>
            <div className="w-12 h-12 bg-jd-turquoise bg-opacity-10 rounded-lg flex items-center justify-center">
              <svg className="w-6 h-6 text-jd-turquoise" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
          </div>
        </div>

        {/* Pedidos */}
        <a href="/admin/pedidos" className="bg-white border-2 border-jd-red rounded-lg p-6 hover:shadow-lg hover:border-jd-red/80 transition cursor-pointer group">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-sm font-bold text-gray-600 uppercase">Pedidos</p>
              <p className="text-4xl font-black text-jd-red mt-3 group-hover:scale-105 transition">{stats.pendingOrders}</p>
              <p className="text-xs text-gray-500 mt-2">Requieren atención</p>
            </div>
            <div className="w-12 h-12 bg-jd-red bg-opacity-10 rounded-lg flex items-center justify-center group-hover:bg-jd-red group-hover:bg-opacity-20 transition">
              <svg className="w-6 h-6 text-jd-red group-hover:translate-x-1 transition" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            </div>
          </div>
        </a>

        {/* Reportes */}
        <a href="/admin/reportes" className="bg-white border-2 border-purple-500 rounded-lg p-6 hover:shadow-lg hover:border-purple-600 transition cursor-pointer group">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-sm font-bold text-gray-600 uppercase">Reportes</p>
              <p className="text-4xl font-black text-purple-600 mt-3 group-hover:scale-105 transition">📋</p>
              <p className="text-xs text-gray-500 mt-2">Mensajes de clientes</p>
            </div>
            <div className="w-12 h-12 bg-purple-500 bg-opacity-10 rounded-lg flex items-center justify-center group-hover:bg-purple-500 group-hover:bg-opacity-20 transition">
              <svg className="w-6 h-6 text-purple-600 group-hover:translate-x-1 transition" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 8h10M7 12h4m1 8l-4-4H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-3l-4 4z" />
              </svg>
            </div>
          </div>
        </a>
      </div>

      {/* Simple Bar Chart for Last 7 Days */}
      <div className="bg-white border-2 border-gray-200 rounded-lg p-6">
        <h3 className="text-lg font-bold text-jd-black mb-6">Ventas - Últimos 7 Días</h3>
        
        {stats.salesLast7Days.length > 0 ? (
          <div className="space-y-4">
            {stats.salesLast7Days.map((day) => (
              <div key={day.date} className="flex items-center gap-4">
                <div className="w-24 text-sm font-semibold text-gray-600">{day.date}</div>
                <div className="flex-1 h-8 bg-gray-100 rounded-lg overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-jd-turquoise to-jd-turquoise transition-all duration-300"
                    style={{
                      width: `${(day.sales / (Math.max(...stats.salesLast7Days.map(d => d.sales)) || 1)) * 100}%`,
                    }}
                  ></div>
                </div>
                <div className="w-16 text-right font-bold text-jd-turquoise">{day.sales.toFixed(2)}€</div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-8 text-gray-500">
            <p>No hay datos de ventas en los últimos 7 días</p>
          </div>
        )}
      </div>
    </div>
  );
}
