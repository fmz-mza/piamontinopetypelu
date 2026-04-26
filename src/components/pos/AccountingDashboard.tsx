"use client";

import React, { useState, useEffect } from 'react';
import { supabase, isSupabaseConfigured } from '../../lib/supabase';
import { 
  DollarSign, TrendingUp, TrendingDown, Users, Plus, X, 
  AlertCircle, CreditCard, Eye, Package, Trash2, FileText, 
  Calendar, PieChart, History, ArrowRightLeft, LayoutDashboard,
  Receipt, Wallet, ClipboardList, Truck
} from 'lucide-center';
import { PieChart as RePieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from 'recharts';
import toast from 'react-hot-toast';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import AccountingCharts from './AccountingCharts';
import ExpenseManager from './ExpenseManager';
import CashClosingHistory from './CashClosingHistory';
import SupplierManager from './SupplierManager';

export const formatPrice = (price: number) => 
  price.toLocaleString('es-AR', { minimumFractionDigits: 0, maximumFractionDigits: 0 });

interface DashboardStats {
  totalSales: number;
  totalExpenses: number;
  customerBalance: number;
  activeCustomers: number;
}

interface Movement {
  id: string;
  date: string;
  type: 'venta' | 'gasto';
  amount: number;
  description: string;
  method?: string;
}

const COLORS = ['#ec4899', '#3b82f6', '#10b981', '#f59e0b', '#8b5cf6', '#64748b'];

const AccountingDashboard: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'resumen' | 'gastos' | 'cierres' | 'proveedores'>('resumen');
  const [dateRange, setDateRange] = useState({
    start: new Date(new Date().setDate(new Date().getDate() - 30)).toISOString().split('T')[0],
    end: new Date().toISOString().split('T')[0]
  });
  const [stats, setStats] = useState<DashboardStats>({
    totalSales: 0,
    totalExpenses: 0,
    customerBalance: 0,
    activeCustomers: 0
  });
  const [recentMovements, setRecentMovements] = useState<Movement[]>([]);
  const [loading, setLoading] = useState(true);
  const [chartData, setChartData] = useState<any[]>([]);
  const [categoryData, setCategoryData] = useState<any[]>([]);
  const [isConfigured, setIsConfigured] = useState(true);

  useEffect(() => {
    const configured = isSupabaseConfigured();
    setIsConfigured(configured);
    if (configured) {
      fetchDashboardData();
    }
  }, [dateRange]);

  const fetchDashboardData = async () => {
    setLoading(true);
    try {
      const { data: allSales } = await supabase
        .from('sales')
        .select('total, created_at, payment_method')
        .gte('created_at', `${dateRange.start}T00:00:00`)
        .lte('created_at', `${dateRange.end}T23:59:59`);

      const { data: allExpenses } = await supabase
        .from('expenses')
        .select('amount, date, category, description, type')
        .gte('date', dateRange.start)
        .lte('date', dateRange.end);

      const { data: customersRes } = await supabase.from('customers').select('balance');
      
      const totalSales = (allSales || []).reduce((acc, s) => acc + Number(s.total), 0);
      const totalExpenses = (allExpenses || []).reduce((acc, e) => acc + Number(e.amount), 0);
      const customerBalance = (customersRes || []).reduce((acc, c) => acc + Number(c.balance), 0);
      const activeCustomers = (customersRes || []).length;

      setStats({
        totalSales,
        totalExpenses,
        customerBalance,
        activeCustomers
      });

      const catMap: Record<string, number> = {};
      (allExpenses || []).forEach(e => {
        const cat = e.category || 'Sin Categoría';
        catMap[cat] = (catMap[cat] || 0) + Number(e.amount);
      });
      
      const formattedCatData = Object.entries(catMap).map(([name, value]) => ({ name, value }));
      setCategoryData(formattedCatData);

      const movements: Movement[] = [
        ...(allSales || []).map((s: any) => ({
          id: Math.random().toString(),
          date: s.created_at,
          type: 'venta' as const,
          amount: s.total,
          description: 'Venta POS',
          method: s.payment_method
        })),
        ...(allExpenses || []).map((e: any) => ({
          id: Math.random().toString(),
          date: e.date,
          type: 'gasto' as const,
          amount: e.amount,
          description: e.description,
          method: e.category
        }))
      ].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()).slice(0, 15);

      setRecentMovements(movements);

      const dailyData = [];
      let curr = new Date(dateRange.start);
      const end = new Date(dateRange.end);
      
      while (curr <= end) {
        const dStr = curr.toISOString().split('T')[0];
        const daySales = (allSales || [])
          .filter((s: any) => s.created_at?.startsWith(dStr))
          .reduce((acc, s) => acc + Number(s.total), 0);
        const dayExpenses = (allExpenses || [])
          .filter((e: any) => e.date === dStr)
          .reduce((acc, e) => acc + Number(e.amount), 0);
        
        dailyData.push({
          date: dStr.split('-').slice(1).reverse().join('/'),
          ventas: daySales,
          gastos: dayExpenses
        });
        curr.setDate(curr.getDate() + 1);
        if (dailyData.length > 31) break;
      }
      setChartData(dailyData);

    } catch (err) {
      console.error('Error fetching dashboard data:', err);
    } finally {
      setLoading(false);
    }
  };

  const exportToPDF = () => {
    const doc = new jsPDF();
    doc.setFontSize(20);
    doc.text('Reporte Financiero - Piamontino', 14, 22);
    doc.setFontSize(10);
    doc.text(`Rango: ${dateRange.start} al ${dateRange.end}`, 14, 30);

    autoTable(doc, {
      startY: 40,
      head: [['Concepto', 'Monto']],
      body: [
        ['Ingresos por Ventas', `$${formatPrice(stats.totalSales)}`],
        ['Egresos por Gastos', `$${formatPrice(stats.totalExpenses)}`],
        ['Saldo en Cta Cte Clientes', `$${formatPrice(stats.customerBalance)}`],
        ['Resultado Neto', `$${formatPrice(stats.totalSales - stats.totalExpenses)}`]
      ],
      theme: 'striped',
      headStyles: { fillStyle: 'pink' }
    });

    doc.save(`reporte-piamontino-${dateRange.end}.pdf`);
    toast.success('Reporte generado');
  };

  if (!isConfigured) return <div className="p-8 text-center">Configurá Supabase</div>;

  return (
    <div className="space-y-8">
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6">
        <div>
          <h1 className="text-3xl font-black text-slate-900 tracking-tight">Gestión Financiera</h1>
          <p className="text-slate-500 font-medium">Control total de ingresos, egresos y arqueos</p>
        </div>
        
        <div className="flex flex-wrap items-center gap-3 bg-white p-2 rounded-[2rem] border border-slate-200 shadow-sm">
          <div className="flex items-center gap-2 px-4 py-2 border-r border-slate-100">
            <Calendar size={16} className="text-slate-400" />
            <input 
              type="date" 
              value={dateRange.start} 
              onChange={e => setDateRange({...dateRange, start: e.target.value})}
              className="text-xs font-bold text-slate-600 outline-none bg-transparent"
            />
            <span className="text-slate-300">→</span>
            <input 
              type="date" 
              value={dateRange.end} 
              onChange={e => setDateRange({...dateRange, end: e.target.value})}
              className="text-xs font-bold text-slate-600 outline-none bg-transparent"
            />
          </div>
          <button 
            onClick={exportToPDF}
            className="px-5 py-2 bg-slate-900 text-white rounded-2xl font-bold text-xs hover:bg-pink-500 transition-all flex items-center gap-2"
          >
            <FileText size={14} /> PDF
          </button>
        </div>
      </div>

      <div className="flex flex-wrap gap-2 p-1.5 bg-slate-100 rounded-[2rem] w-fit">
        {[
          { id: 'resumen', label: 'Resumen', icon: LayoutDashboard },
          { id: 'gastos', label: 'Gastos', icon: Wallet },
          { id: 'cierres', label: 'Arqueos', icon: ClipboardList },
          { id: 'proveedores', label: 'Proveedores', icon: Truck }
        ].map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as any)}
            className={`flex items-center gap-2 px-6 py-3 rounded-[1.5rem] font-black text-xs uppercase tracking-widest transition-all ${
              activeTab === tab.id 
                ? 'bg-white text-pink-500 shadow-sm' 
                : 'text-slate-400 hover:text-slate-600'
            }`}
          >
            <tab.icon size={16} />
            {tab.label}
          </button>
        ))}
      </div>

      {activeTab === 'resumen' && (
        <div className="space-y-8 animate-in fade-in duration-500">
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="bg-white p-6 rounded-[2rem] border border-slate-200 shadow-sm">
              <div className="w-12 h-12 bg-pink-100 text-pink-600 rounded-2xl flex items-center justify-center mb-4"><TrendingUp size={24} /></div>
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Ventas del Período</p>
              <p className="text-3xl font-black text-slate-900">${formatPrice(stats.totalSales)}</p>
            </div>
            <div className="bg-white p-6 rounded-[2rem] border border-slate-200 shadow-sm">
              <div className="w-12 h-12 bg-slate-100 text-slate-600 rounded-2xl flex items-center justify-center mb-4"><TrendingDown size={24} /></div>
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Gastos del Período</p>
              <p className="text-3xl font-black text-slate-900">${formatPrice(stats.totalExpenses)}</p>
            </div>
            <div className="bg-white p-6 rounded-[2rem] border border-slate-200 shadow-sm">
              <div className="w-12 h-12 bg-amber-100 text-amber-600 rounded-2xl flex items-center justify-center mb-4"><Users size={24} /></div>
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Deuda en Cta Cte</p>
              <p className="text-3xl font-black text-slate-900">${formatPrice(stats.customerBalance)}</p>
            </div>
            <div className="bg-white p-6 rounded-[2rem] border border-slate-200 shadow-sm">
              <div className="w-12 h-12 bg-green-100 text-green-600 rounded-2xl flex items-center justify-center mb-4"><DollarSign size={24} /></div>
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Resultado Neto</p>
              <p className="text-3xl font-black text-slate-900">${formatPrice(stats.totalSales - stats.totalExpenses)}</p>
            </div>
          </div>

          <AccountingCharts data={chartData} />

          <div className="grid lg:grid-cols-2 gap-8">
            <div className="bg-white p-8 rounded-[2.5rem] border border-slate-200 shadow-sm">
              <h3 className="text-xl font-black text-slate-900 mb-6 flex items-center gap-2"><History size={24} className="text-pink-500" /> Últimos Movimientos</h3>
              <div className="space-y-4">
                {recentMovements.map((m, i) => (
                  <div key={i} className="flex items-center justify-between p-4 bg-slate-50 rounded-2xl border border-slate-100">
                    <div className="flex items-center gap-4">
                      <div className={`p-3 rounded-xl ${m.type === 'venta' ? 'bg-green-100 text-green-600' : 'bg-red-100 text-red-600'}`}>
                        {m.type === 'venta' ? <TrendingUp size={20} /> : <TrendingDown size={20} />}
                      </div>
                      <div>
                        <p className="font-bold text-slate-800 text-sm">{m.description}</p>
                        <p className="text-[10px] text-slate-400 font-black uppercase tracking-widest">{new Date(m.date).toLocaleDateString('es-AR')} • {m.method}</p>
                      </div>
                    </div>
                    <p className={`font-black text-lg ${m.type === 'venta' ? 'text-green-600' : 'text-red-600'}`}>
                      {m.type === 'venta' ? '+' : '-'}${formatPrice(m.amount)}
                    </p>
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-white p-8 rounded-[2.5rem] border border-slate-200 shadow-sm flex flex-col">
              <h3 className="text-xl font-black text-slate-900 mb-6 flex items-center gap-2"><PieChart size={24} className="text-blue-500" /> Gastos por Categoría</h3>
              <div className="flex-1 min-h-[300px] w-full">
                {categoryData.length > 0 ? (
                  <ResponsiveContainer width="100%" height="100%" minWidth={0}>
                    <RePieChart>
                      <Pie 
                        data={categoryData} 
                        cx="50%" 
                        cy="50%" 
                        innerRadius={60} 
                        outerRadius={80} 
                        paddingAngle={5} 
                        dataKey="value"
                        animationDuration={1000}
                      >
                        {categoryData.map((_, index) => <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />)}
                      </Pie>
                      <Tooltip formatter={(value: any) => `$${formatPrice(Number(value))}`} />
                      <Legend verticalAlign="bottom" iconType="circle" />
                    </RePieChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="h-full flex flex-col items-center justify-center text-slate-400">
                    <PieChart size={48} className="mb-2 opacity-20" />
                    <p className="text-sm font-medium">Sin gastos en este período</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'gastos' && <div className="animate-in slide-in-from-bottom-4 duration-500"><ExpenseManager /></div>}
      {activeTab === 'cierres' && <div className="animate-in slide-in-from-bottom-4 duration-500"><CashClosingHistory /></div>}
      {activeTab === 'proveedores' && <div className="animate-in slide-in-from-bottom-4 duration-500"><SupplierManager /></div>}
    </div>
  );
};

export default AccountingDashboard;