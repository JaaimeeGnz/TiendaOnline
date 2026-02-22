import React, { useState, useEffect } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { getDashboardStats } from '../../lib/dashboardStats';
import type { DashboardStats } from '../../types';

const COLORS = ['#00b4d8', '#e63946', '#f4a261', '#2a9d8f', '#264653', '#e76f51'];

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
              <p className="text-4xl font-black text-purple-600 mt-3 group-hover:scale-105 transition"></p>
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

      {/* Recharts Bar Chart for Last 7 Days */}
      <div className="bg-white border-2 border-gray-200 rounded-lg p-6">
        <h3 className="text-lg font-bold text-jd-black mb-6">Ventas - Últimos 7 Días</h3>
        
        {stats.salesLast7Days.length > 0 ? (
          <ResponsiveContainer width="100%" height={320}>
            <BarChart data={stats.salesLast7Days} margin={{ top: 5, right: 20, left: 10, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis 
                dataKey="date" 
                tick={{ fill: '#6b7280', fontSize: 12, fontWeight: 600 }}
                axisLine={{ stroke: '#e5e7eb' }}
              />
              <YAxis 
                tick={{ fill: '#6b7280', fontSize: 12 }}
                axisLine={{ stroke: '#e5e7eb' }}
                tickFormatter={(v) => `${v}€`}
              />
              <Tooltip
                formatter={(value: any) => [`${Number(value).toFixed(2)}€`, 'Ventas']}
                contentStyle={{
                  backgroundColor: '#1a1a1a',
                  border: 'none',
                  borderRadius: '8px',
                  color: '#fff',
                  fontSize: '13px',
                  fontWeight: 'bold',
                }}
                cursor={{ fill: 'rgba(0,180,216,0.1)' }}
              />
              <Bar 
                dataKey="sales" 
                fill="#00b4d8" 
                radius={[6, 6, 0, 0]}
                maxBarSize={60}
              />
            </BarChart>
          </ResponsiveContainer>
        ) : (
          <div className="text-center py-8 text-gray-500">
            <p>No hay datos de ventas en los últimos 7 días</p>
          </div>
        )}
      </div>

      {/* KPI Summary Pie Chart */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white border-2 border-gray-200 rounded-lg p-6">
          <h3 className="text-lg font-bold text-jd-black mb-4">Distribución de Ventas</h3>
          {stats.salesLast7Days.length > 0 ? (
            <ResponsiveContainer width="100%" height={250}>
              <PieChart>
                <Pie
                  data={stats.salesLast7Days.filter(d => d.sales > 0)}
                  dataKey="sales"
                  nameKey="date"
                  cx="50%"
                  cy="50%"
                  outerRadius={90}
                  innerRadius={50}
                  label={({ name, value }: any) => `${name}: ${Number(value).toFixed(0)}€`}
                  labelLine={false}
                >
                  {stats.salesLast7Days.filter(d => d.sales > 0).map((_, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip
                  formatter={(value: any) => [`${Number(value).toFixed(2)}€`, 'Ventas']}
                  contentStyle={{
                    backgroundColor: '#1a1a1a',
                    border: 'none',
                    borderRadius: '8px',
                    color: '#fff',
                  }}
                />
              </PieChart>
            </ResponsiveContainer>
          ) : (
            <div className="text-center py-8 text-gray-500">
              <p>Sin datos</p>
            </div>
          )}
        </div>

        {/* Top Product */}
        <div className="bg-white border-2 border-gray-200 rounded-lg p-6">
          <h3 className="text-lg font-bold text-jd-black mb-4">Producto Más Vendido</h3>
          {stats.topProduct ? (
            <div className="flex flex-col items-center justify-center h-[250px]">
              <div className="w-20 h-20 bg-jd-turquoise bg-opacity-10 rounded-full flex items-center justify-center mb-4">
                <svg className="w-10 h-10 text-jd-turquoise" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
                </svg>
              </div>
              <p className="text-xl font-black text-jd-black text-center">{stats.topProduct.name}</p>
              <p className="text-4xl font-black text-jd-turquoise mt-2">{stats.topProduct.sold}</p>
              <p className="text-sm text-gray-500">unidades vendidas</p>
            </div>
          ) : (
            <div className="flex items-center justify-center h-[250px] text-gray-500">
              <p>Sin datos de ventas</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
