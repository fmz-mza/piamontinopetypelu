"use client";

import React, { useState, useEffect } from 'react';
import { supabase, isSupabaseConfigured } from '../../lib/supabase';
import { 
  DollarSign, TrendingUp, TrendingDown, Users, Plus, X, 
  AlertCircle, CreditCard, Eye, Package, Trash2, FileText, 
  Calendar, PieChart, History, ArrowRightLeft 
} from 'lucide-react';
import toast from 'react-hot-toast';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import AccountingCharts from './AccountingCharts';
import CashClosingModal from './CashClosingModal';
import CustomerHistory from './CustomerHistory';

export const formatPrice = (price: number) => 
  price.toLocaleString('es-AR', { minimumFractionDigits: 0, maximumFractionDigits: 0 });

interface DashboardStats {
  totalSales: number;
  totalExpenses: number;
  customerBalance: number;
  activeCustomers: number;
}

const AccountingDashboard: React.FC = () => {
  const [stats, setStats] = useState<DashboardStats>({
    totalSales: 0,
    totalExpenses: 0,
    customerBalance: 0,
    activeCustomers: 0
  });
  const [loading, setLoading] = useState(true);
  const [chartData, setChartData] = useState<any[]>([]);
  const [isConfigured, setIsConfigured] = useState(true);

  useEffect(() => {
    const configured = isSupabaseConfigured();
    setIsConfigured(configured);
    if (configured) {
      fetchDashboardData();
    }
  }, []);

  const fetchDashboardData = async () => {
    setLoading(true);
    try {
      const [salesRes, expensesRes, customersRes] = await Promise.all([
        supabase.from('sales').select('total, created_at'),
        supabase.from('expenses').select('amount, date'),
        supabase.from('customers').select('balance')
      ]);

      const totalSales = (salesRes.data || []).reduce((acc, s) => acc + Number(s.total), 0);
      const totalExpenses = (expensesRes.data || []).reduce((acc, e) => acc + Number(e.amount), 0);
      const customerBalance = (customersRes.data || []).reduce((acc, c) => acc + Number(c.balance), 0);
      const activeCustomers = (customersRes.data || []).length;

      setStats({
        totalSales,
        totalExpenses,
        customerBalance,
        activeCustomers
      });

      // Procesar datos para el gráfico (últimos 7 días)
      const last7Days = Array.from({ length: 7 }, (_, i) => {
        const d = new Date();
        d.setDate(d.getDate() - i);
        return d.toISOString().split('T')[0];
      }).reverse();

      const dailyData = last7Days.map(date => {
        const daySales = (salesRes.data || [])
          .filter(s => s.created_at.startsWith(date))
          .reduce((acc, s) => acc + Number(s.total), 0);
        const dayExpenses = (expensesRes.data || [])
          .filter(e => e.date === date)
          .reduce((acc, e) => acc + Number(e.amount), 0);
        
        return {
          date: date.split('-').slice(1).reverse().join('/'),
          ventas: daySales,
          gastos: dayExpenses
        };
      });

      setChartData(dailyData);
    } catch (err) {
      console.error('Error fetching dashboard data:', err);
      toast.error('Error al cargar datos contables');
    } finally {
      setLoading(false);
    }
  };

  const exportToPDF = () => {
    const doc = new jsPDF();
    doc.setFontSize(20);
    doc.text('Reporte Contable - Piamontino', 14, 22);
    doc.setFontSize(12);
    doc.text(`Fecha: ${new Date().toLocaleDateString()}`, 14, 30);

    autoTable(doc, {
      startY: 40,
      head: [['Concepto', 'Monto']],
      body: [
        ['Total Ventas', `$${formatPrice(stats.totalSales)}`],
        ['Total Gastos', `$${formatPrice(stats.totalExpenses)}`],
        ['Saldo Clientes (Cta Cte)', `$${formatPrice(stats.customerBalance)}`],
        ['Balance Neto', `$${formatPrice(stats.totalSales - stats.totalExpenses)}`]
      ],
    });

    doc.save('reporte-contable.pdf');
    toast.success('Reporte PDF generado');
  };

  if (!isConfigured) {
    return (
      <div className="p-8 text-center">
        <AlertCircle className="mx-auto text-amber-500 mb-4" size={48} />
        <h2 className="text-xl font-bold">Supabase no configurado</h2>
        <p className="text-slate-500">Por favor, configura las variables de entorno para ver la gestión.</p>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-black text-slate-900 tracking-tight">Gestión Contable</h1>
          <p className="text-slate-500 font-medium">Resumen financiero y control de caja</p>
        </div>
        <button 
          onClick={exportToPDF}
          className="flex items-center gap-2 px-6 py-3 bg-slate-900 text-white rounded-2xl font-bold hover:bg-pink-600 transition-all shadow-xl active:scale-95"
        >
          <FileText size={20} /> Exportar Reporte
        </button>
      </div>

      {/* Stats Grid */}
      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white p-6 rounded-[2rem] border border-slate-200 shadow-sm">
          <div className="w-12 h-12 bg-pink-100 text-pink-600 rounded-2xl flex items-center justify-center mb-4">
            <TrendingUp size={24} />
          </div>
          <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Ventas Totales</p>
          <p className="text-3xl font-black text-slate-900">${formatPrice(stats.totalSales)}</p>
        </div>

        <div className="bg-white p-6 rounded-[2rem] border border-slate-200 shadow-sm">
          <div className="w-12 h-12 bg-slate-100 text-slate-600 rounded-2xl flex items-center justify-center mb-4">
            <TrendingDown size={24} />
          </div>
          <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Gastos Totales</p>
          <p className="text-3xl font-black text-slate-900">${formatPrice(stats.totalExpenses)}</p>
        </div>

        <div className="bg-white p-6 rounded-[2rem] border border-slate-200 shadow-sm">
          <div className="w-12 h-12 bg-amber-100 text-amber-600 rounded-2xl flex items-center justify-center mb-4">
            <Users size={24} />
          </div>
          <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Deuda Clientes</p>
          <p className="text-3xl font-black text-slate-900">${formatPrice(stats.customerBalance)}</p>
        </div>

        <div className="bg-white p-6 rounded-[2rem] border border-slate-200 shadow-sm">
          <div className="w-12 h-12 bg-green-100 text-green-600 rounded-2xl flex items-center justify-center mb-4">
            <DollarSign size={24} />
          </div>
          <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Balance Neto</p>
          <p className="text-3xl font-black text-slate-900">${formatPrice(stats.totalSales - stats.totalExpenses)}</p>
        </div>
      </div>

      {/* Charts */}
      <AccountingCharts data={chartData} />

      <div className="grid lg:grid-cols-2 gap-8">
        {/* Aquí irían las listas de gastos recientes o clientes con deuda */}
        <div className="bg-white p-8 rounded-[2.5rem] border border-slate-200 shadow-sm">
          <h3 className="text-xl font-black text-slate-900 mb-6 flex items-center gap-2">
            <History size={24} className="text-pink-500" /> Movimientos Recientes
          </h3>
          <p className="text-slate-400 text-center py-8 font-medium">Cargando historial detallado...</p>
        </div>
      </div>
    </div>
  );
};

export default AccountingDashboard;