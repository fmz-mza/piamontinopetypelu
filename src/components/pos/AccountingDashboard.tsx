"use client";

import React, { useState, useEffect, useMemo } from 'react';
import { supabase, isSupabaseConfigured } from '../../lib/supabase';
import { DollarSign, TrendingUp, TrendingDown, Users, Plus, X, AlertCircle, CreditCard, Eye, Package, Trash2, FileText, Calendar, PieChart, History, ArrowRight, ArrowRightLeft } from 'lucide-react';
import toast from 'react-hot-toast';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import AccountingCharts from './AccountingCharts';
import CashClosingModal from './CashClosingModal';
import CustomerHistory from './CustomerHistory';

interface Sale {
  id: string;
  created_at: string;
  total: number;
  items: any[];
  payment_method: string;
  customer_id?: string;
}

interface Expense {
  id: string;
  date: string;
  amount: number;
  description: string;
  type: 'fija' | 'variable';
  category: string;
}

interface Customer {
  id: string;
  name: string;
  phone: string;
  balance: number;
}

interface CashClosing {
  id: string;
  date: string;
  expected_cash: number;
  actual_cash: number;
  difference: number;
  notes: string;
}

type DateRange = 'hoy' | 'ayer' | '7dias' | 'mes' | 'personalizado';

const AccountingDashboard: React.FC = () => {
  const [sales, setSales] = useState<Sale[]>([]);
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [closings, setClosings] = useState<CashClosing[]>([]);
  const [loading, setLoading] = useState(false);
  const [isConfigured, setIsConfigured] = useState(true);
  const [activeTab, setActiveTab] = useState<'resumen' | 'gastos' | 'clientes' | 'arqueo'>('resumen');
  const [dateRange, setDateRange] = useState<DateRange>('mes');
  const [customDates, setCustomDates] = useState({ 
    start: new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString().split('T')[0], 
    end: new Date().toISOString().split('T')[0] 
  });
  
  // Modales
  const [showExpenseModal, setShowExpenseModal] = useState(false);
  const [showCustomerModal, setShowCustomerModal] = useState(false);
  const [showPaymentModal, setShowPaymentModal] = useState<Customer | null>(null);
  const [showClosingModal, setShowClosingModal] = useState(false);
  const [selectedSale, setSelectedSale] = useState<Sale | null>(null);
  const [selectedCustomerHistory, setSelectedCustomerHistory] = useState<Customer | null>(null);

  // Form states
  const [newExpense, setNewExpense] = useState({ amount: '', description: '', type: 'variable' as 'fija' | 'variable', category: '' });
  const [newCustomer, setNewCustomer] = useState({ name: '', phone: '' });
  const [paymentAmount, setPaymentAmount] = useState('');

  useEffect(() => {
    setIsConfigured(isSupabaseConfigured());
    if (isSupabaseConfigured()) {
      fetchData();
    }
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [salesRes, expensesRes, customersRes, closingsRes] = await Promise.all([
        supabase.from('sales').select('*').order('created_at', { ascending: false }),
        supabase.from('expenses').select('*').order('date', { ascending: false }),
        supabase.from('customers').select('*').order('name'),
        supabase.from('cash_closings').select('*').order('date', { ascending: false }).limit(30)
      ]);

      if (salesRes.data) setSales(salesRes.data);
      if (expensesRes.data) setExpenses(expensesRes.data);
      if (customersRes.data) setCustomers(customersRes.data);
      if (closingsRes.data) setClosings(closingsRes.data);
    } catch (err) {
      console.error('Error fetching data:', err);
    } finally {
      setLoading(false);
    }
  };

  const filteredData = useMemo(() => {
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime();
    const yesterday = today - 86400000;
    const sevenDaysAgo = today - (7 * 86400000);
    const firstOfMonth = new Date(now.getFullYear(), now.getMonth(), 1).getTime();

    const filterByRange = (dateStr: string) => {
      const d = new Date(dateStr).getTime();
      if (dateRange === 'hoy') return d >= today;
      if (dateRange === 'ayer') return d >= yesterday && d < today;
      if (dateRange === '7dias') return d >= sevenDaysAgo;
      if (dateRange === 'mes') return d >= firstOfMonth;
      if (dateRange === 'personalizado') {
        const start = new Date(customDates.start).getTime();
        const end = new Date(customDates.end).getTime() + 86400000; // Incluir el día final completo
        return d >= start && d < end;
      }
      return true;
    };

    return {
      sales: sales.filter(s => filterByRange(s.created_at)),
      expenses: expenses.filter(e => filterByRange(e.date))
    };
  }, [sales, expenses, dateRange, customDates]);

  const stats = useMemo(() => {
    const totalSales = filteredData.sales.reduce((sum, s) => sum + s.total, 0);
    const totalExpenses = filteredData.expenses.reduce((sum, e) => sum + e.amount, 0);
    const estimatedCost = totalSales * 0.65;
    const grossProfit = totalSales - estimatedCost;
    const netProfit = totalSales - totalExpenses;

    return { totalSales, totalExpenses, grossProfit, netProfit };
  }, [filteredData]);

  const chartData = useMemo(() => {
    const last7Days = [...Array(7)].map((_, i) => {
      const d = new Date();
      d.setDate(d.getDate() - (6 - i));
      const dateStr = d.toISOString().split('T')[0];
      
      const daySales = sales
        .filter(s => s.created_at.startsWith(dateStr))
        .reduce((sum, s) => sum + s.total, 0);
      
      const dayExpenses = expenses
        .filter(e => e.date === dateStr)
        .reduce((sum, e) => sum + e.amount, 0);

      return {
        date: d.toLocaleDateString('es-AR', { day: '2-digit', month: 'short' }),
        ventas: daySales,
        gastos: dayExpenses
      };
    });
    return last7Days;
  }, [sales, expenses]);

  const formatPrice = (price: number) => {
    return price.toLocaleString('es-AR', { minimumFractionDigits: 0, maximumFractionDigits: 0 });
  };

  const generatePDF = () => {
    try {
      const doc = new jsPDF();
      const todayStr = new Date().toLocaleDateString();
      const fileNameDate = new Date().toISOString().split('T')[0];
      
      let title = `Reporte de Ventas (${dateRange.toUpperCase()})`;
      let fileName = `reporte-ventas-${fileNameDate}.pdf`;
      let head = [['Fecha', 'Método', 'Total']];
      let body = filteredData.sales.map(sale => [
        new Date(sale.created_at).toLocaleDateString(),
        sale.payment_method.toUpperCase(),
        `$${formatPrice(sale.total)}`
      ]);
      let footerText = `Total: $${formatPrice(stats.totalSales)}`;

      if (activeTab === 'gastos') {
        title = `Reporte de Gastos (${dateRange.toUpperCase()})`;
        fileName = `reporte-gastos-${fileNameDate}.pdf`;
        head = [['Fecha', 'Descripción', 'Tipo', 'Monto']];
        body = filteredData.expenses.map(e => [
          new Date(e.date).toLocaleDateString(),
          e.description,
          e.type.toUpperCase(),
          `$${formatPrice(e.amount)}`
        ]);
        footerText = `Total Gastos: $${formatPrice(stats.totalExpenses)}`;
      }

      doc.setFontSize(20);
      doc.text(title, 14, 22);
      doc.setFontSize(10);
      doc.text(`Generado: ${todayStr}`, 14, 30);

      autoTable(doc, {
        startY: 40,
        head: head,
        body: body,
        theme: 'striped',
        headStyles: { fillColor: [236, 72, 153] }
      });

      const finalY = (doc as any).lastAutoTable?.finalY || 40;
      doc.setFontSize(12);
      doc.text(footerText, 14, finalY + 10);
      doc.save(fileName);
      toast.success('PDF generado');
    } catch (err) {
      toast.error('Error al generar PDF');
    }
  };

  const handleAddExpense = async () => {
    if (!newExpense.amount || !newExpense.description) return;
    try {
      const { error } = await supabase.from('expenses').insert([{
        date: new Date().toISOString().split('T')[0],
        amount: parseFloat(newExpense.amount),
        description: newExpense.description,
        type: newExpense.type,
        category: newExpense.category
      }]);
      if (error) throw error;
      toast.success('Gasto registrado');
      setShowExpenseModal(false);
      setNewExpense({ amount: '', description: '', type: 'variable', category: '' });
      fetchData();
    } catch (err) { toast.error('Error'); }
  };

  const handleAddCustomer = async () => {
    if (!newCustomer.name) return;
    try {
      const { error } = await supabase.from('customers').insert([{
        name: newCustomer.name,
        phone: newCustomer.phone,
        balance: 0
      }]);
      if (error) throw error;
      toast.success('Cliente creado');
      setShowCustomerModal(false);
      setNewCustomer({ name: '', phone: '' });
      fetchData();
    } catch (err) { toast.error('Error al crear cliente'); }
  };

  const handleCustomerPayment = async () => {
    if (!showPaymentModal || !paymentAmount) return;
    const amount = parseFloat(paymentAmount);
    try {
      const { error: payError } = await supabase.from('customer_payments').insert([{
        customer_id: showPaymentModal.id,
        amount: amount,
        date: new Date().toISOString().split('T')[0]
      }]);
      if (payError) throw payError;

      const { error: custError } = await supabase.from('customers').update({ 
        balance: showPaymentModal.balance - amount 
      }).eq('id', showPaymentModal.id);
      if (custError) throw custError;
      
      toast.success('Pago registrado');
      setShowPaymentModal(null);
      setPaymentAmount('');
      fetchData();
    } catch (err) { toast.error('Error'); }
  };

  const getPaymentIcon = (method: string) => {
    switch (method) {
      case 'efectivo': return <DollarSign size={18} />;
      case 'tarjeta': return <CreditCard size={18} />;
      case 'transferencia': return <ArrowRightLeft size={18} />;
      case 'cuenta_corriente': return <Users size={18} />;
      default: return <DollarSign size={18} />;
    }
  };

  const getPaymentColor = (method: string) => {
    switch (method) {
      case 'efectivo': return 'bg-green-50 text-green-600';
      case 'tarjeta': return 'bg-blue-50 text-blue-600';
      case 'transferencia': return 'bg-purple-50 text-purple-600';
      case 'cuenta_corriente': return 'bg-amber-50 text-amber-600';
      default: return 'bg-slate-50 text-slate-600';
    }
  };

  const expectedCashToday = sales
    .filter(s => s.created_at.startsWith(new Date().toISOString().split('T')[0]) && s.payment_method === 'efectivo')
    .reduce((sum, s) => sum + s.total, 0);

  if (!isConfigured) return <div className="p-6 bg-amber-50 rounded-2xl">Configurá Supabase</div>;

  return (
    <div className="space-y-6">
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 bg-white p-4 rounded-2xl border border-slate-200">
        <div className="flex gap-1 bg-slate-50 p-1 rounded-xl overflow-x-auto no-scrollbar">
          {[
            { id: 'resumen', label: 'Resumen', icon: PieChart },
            { id: 'gastos', label: 'Gastos', icon: TrendingDown },
            { id: 'clientes', label: 'Cuentas Ctes.', icon: Users },
            { id: 'arqueo', label: 'Arqueo Caja', icon: History }
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg font-bold text-xs transition-all whitespace-nowrap ${
                activeTab === tab.id ? 'bg-white text-pink-500 shadow-sm' : 'text-slate-400 hover:text-slate-600'
              }`}
            >
              <tab.icon size={14} /> {tab.label}
            </button>
          ))}
        </div>

        <div className="flex flex-wrap items-center gap-3">
          {dateRange === 'personalizado' && (
            <div className="flex items-center gap-2 bg-slate-50 p-1 rounded-xl animate-in fade-in slide-in-from-right-2">
              <input 
                type="date" 
                value={customDates.start} 
                onChange={e => setCustomDates({...customDates, start: e.target.value})}
                className="bg-transparent border-none text-[10px] font-black text-slate-600 outline-none px-2 py-1"
              />
              <ArrowRight size={12} className="text-slate-300" />
              <input 
                type="date" 
                value={customDates.end} 
                onChange={e => setCustomDates({...customDates, end: e.target.value})}
                className="bg-transparent border-none text-[10px] font-black text-slate-600 outline-none px-2 py-1"
              />
            </div>
          )}
          
          <div className="flex items-center gap-2 bg-slate-50 p-1 rounded-xl">
            <Calendar size={14} className="ml-2 text-slate-400" />
            <select 
              value={dateRange} 
              onChange={(e) => setDateRange(e.target.value as any)}
              className="bg-transparent border-none text-xs font-bold text-slate-600 outline-none pr-4 py-1.5"
            >
              <option value="hoy">Hoy</option>
              <option value="ayer">Ayer</option>
              <option value="7dias">Últimos 7 días</option>
              <option value="mes">Este Mes</option>
              <option value="personalizado">Personalizado</option>
            </select>
          </div>
          <button onClick={generatePDF} className="p-2.5 bg-slate-900 text-white rounded-xl hover:bg-pink-500 transition-all shadow-lg active:scale-95">
            <FileText size={18} />
          </button>
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center py-20"><div className="animate-spin w-10 h-10 border-4 border-pink-500 border-t-transparent rounded-full" /></div>
      ) : (
        <>
          {activeTab === 'resumen' && (
            <div className="space-y-6">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm">
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Ventas Brutas</p>
                  <p className="text-2xl font-black text-slate-900">${formatPrice(stats.totalSales)}</p>
                </div>
                <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm">
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Margen Est. (35%)</p>
                  <p className="text-2xl font-black text-green-500">${formatPrice(stats.grossProfit)}</p>
                </div>
                <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm">
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Gastos Totales</p>
                  <p className="text-2xl font-black text-red-500">${formatPrice(stats.totalExpenses)}</p>
                </div>
                <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm">
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Utilidad Neta</p>
                  <p className={`text-2xl font-black ${stats.netProfit >= 0 ? 'text-pink-500' : 'text-red-600'}`}>
                    ${formatPrice(stats.netProfit)}
                  </p>
                </div>
              </div>

              <AccountingCharts data={chartData} />

              <div className="bg-white rounded-3xl border border-slate-200 overflow-hidden shadow-sm">
                <div className="p-6 border-b flex justify-between items-center">
                  <h3 className="font-black text-slate-800 uppercase tracking-widest text-xs">Últimas Operaciones</h3>
                </div>
                <div className="divide-y divide-slate-50">
                  {filteredData.sales.slice(0, 8).map(sale => (
                    <div key={sale.id} className="p-4 flex items-center justify-between hover:bg-slate-50 transition-colors">
                      <div className="flex items-center gap-4">
                        <div className={`p-2.5 rounded-xl ${getPaymentColor(sale.payment_method)}`}>
                          {getPaymentIcon(sale.payment_method)}
                        </div>
                        <div>
                          <p className="font-bold text-slate-800 text-sm">{new Date(sale.created_at).toLocaleDateString('es-AR', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' })}</p>
                          <p className="text-[10px] text-slate-400 font-black uppercase tracking-widest">{sale.payment_method.replace('_', ' ')}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-4">
                        <p className="font-black text-slate-900">${formatPrice(sale.total)}</p>
                        <button onClick={() => setSelectedSale(sale)} className="p-2 text-slate-300 hover:text-pink-500 transition-colors"><Eye size={18} /></button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {activeTab === 'gastos' && (
            <div className="space-y-4">
              <div className="flex justify-end">
                <button onClick={() => setShowExpenseModal(true)} className="px-6 py-3 bg-pink-500 text-white rounded-2xl font-black uppercase tracking-widest text-xs shadow-lg hover:bg-pink-600 transition-all active:scale-95 flex items-center gap-2">
                  <Plus size={18} /> Nuevo Gasto
                </button>
              </div>
              <div className="bg-white rounded-3xl border border-slate-200 overflow-hidden shadow-sm">
                <div className="divide-y divide-slate-50">
                  {filteredData.expenses.map(e => (
                    <div key={e.id} className="p-5 flex items-center justify-between hover:bg-slate-50 transition-colors">
                      <div className="flex items-center gap-4">
                        <div className="p-3 bg-red-50 text-red-500 rounded-2xl"><TrendingDown size={20} /></div>
                        <div>
                          <p className="font-bold text-slate-800">{e.description}</p>
                          <p className="text-xs text-slate-400 font-medium">{new Date(e.date).toLocaleDateString('es-AR')} • {e.type.toUpperCase()}</p>
                        </div>
                      </div>
                      <p className="font-black text-red-500 text-lg">-${formatPrice(e.amount)}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {activeTab === 'clientes' && (
            <div className="space-y-4">
              <div className="flex justify-between items-center bg-white p-6 rounded-3xl border border-slate-200 shadow-sm">
                <div>
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Deuda Total Clientes</p>
                  <p className="text-3xl font-black text-slate-900">${formatPrice(customers.reduce((s, c) => s + c.balance, 0))}</p>
                </div>
                <button onClick={() => setShowCustomerModal(true)} className="px-6 py-3 bg-slate-900 text-white rounded-2xl font-black uppercase tracking-widest text-xs shadow-lg active:scale-95">
                  Nuevo Cliente
                </button>
              </div>
              <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {customers.map(c => (
                  <div key={c.id} className="bg-white p-6 rounded-[2rem] border border-slate-200 shadow-sm hover:shadow-md transition-all group">
                    <div className="flex items-center justify-between mb-4">
                      <div className="w-12 h-12 bg-pink-50 text-pink-500 rounded-2xl flex items-center justify-center"><Users size={24} /></div>
                      <div className="flex gap-1">
                        <button onClick={() => setSelectedCustomerHistory(c)} className="p-2 text-slate-300 hover:text-blue-500 transition-colors" title="Ver Historial"><History size={20} /></button>
                        <button onClick={() => setShowPaymentModal(c)} className="p-2 text-slate-300 hover:text-green-500 transition-colors" title="Registrar Pago"><CreditCard size={20} /></button>
                      </div>
                    </div>
                    <h4 className="font-black text-slate-800 mb-1">{c.name}</h4>
                    <p className="text-xs text-slate-400 font-medium mb-4">{c.phone || 'Sin teléfono'}</p>
                    <div className="pt-4 border-t border-slate-50 flex justify-between items-center">
                      <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Saldo</span>
                      <span className={`font-black text-xl ${c.balance > 0 ? 'text-amber-500' : 'text-slate-300'}`}>${formatPrice(c.balance)}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeTab === 'arqueo' && (
            <div className="space-y-6">
              <div className="flex justify-between items-center">
                <h3 className="font-black text-slate-800 uppercase tracking-widest text-xs">Historial de Arqueos</h3>
                <button onClick={() => setShowClosingModal(true)} className="px-6 py-3 bg-pink-500 text-white rounded-2xl font-black uppercase tracking-widest text-xs shadow-lg active:scale-95">
                  Realizar Arqueo Hoy
                </button>
              </div>
              <div className="bg-white rounded-3xl border border-slate-200 overflow-hidden shadow-sm">
                <div className="divide-y divide-slate-50">
                  {closings.map(cl => (
                    <div key={cl.id} className="p-5 flex items-center justify-between hover:bg-slate-50 transition-colors">
                      <div className="flex items-center gap-4">
                        <div className={`p-3 rounded-2xl ${cl.difference === 0 ? 'bg-green-50 text-green-600' : 'bg-amber-50 text-amber-600'}`}>
                          <History size={20} />
                        </div>
                        <div>
                          <p className="font-bold text-slate-800">{new Date(cl.date).toLocaleDateString('es-AR', { weekday: 'long', day: '2-digit', month: 'long' })}</p>
                          <p className="text-xs text-slate-400 font-medium">Esperado: ${formatPrice(cl.expected_cash)} • Real: ${formatPrice(cl.actual_cash)}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className={`font-black text-lg ${cl.difference === 0 ? 'text-green-600' : 'text-amber-500'}`}>
                          {cl.difference > 0 ? '+' : ''}${formatPrice(cl.difference)}
                        </p>
                        <p className="text-[9px] font-black uppercase text-slate-400">{cl.difference === 0 ? 'Cuadrado' : 'Diferencia'}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </>
      )}

      {showClosingModal && <CashClosingModal expectedCash={expectedCashToday} onClose={() => setShowClosingModal(false)} onSuccess={fetchData} />}
      {selectedCustomerHistory && <CustomerHistory customer={selectedCustomerHistory} onClose={() => setSelectedCustomerHistory(null)} />}
      
      {showPaymentModal && (
        <div className="fixed inset-0 z-[70] bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-[2.5rem] w-full max-w-sm overflow-hidden shadow-2xl">
            <div className="p-8 border-b flex justify-between items-center bg-slate-50/50">
              <h3 className="text-xl font-black text-slate-900 tracking-tight">Registrar Pago</h3>
              <button onClick={() => setShowPaymentModal(null)} className="p-2 text-slate-400"><X size={20} /></button>
            </div>
            <div className="p-8 space-y-6">
              <div className="text-center">
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Saldo de {showPaymentModal.name}</p>
                <p className="text-3xl font-black text-amber-500">${formatPrice(showPaymentModal.balance)}</p>
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Monto a Pagar</label>
                <input
                  type="number"
                  value={paymentAmount}
                  onChange={e => setPaymentAmount(e.target.value)}
                  className="w-full p-4 bg-slate-50 border-none rounded-2xl focus:ring-2 focus:ring-pink-500/20 outline-none text-2xl font-black text-center"
                  placeholder="0.00"
                  autoFocus
                />
              </div>
              <button onClick={handleCustomerPayment} className="w-full py-5 bg-slate-900 text-white rounded-[2rem] font-black uppercase tracking-widest text-sm shadow-xl hover:bg-pink-500 transition-all active:scale-95">
                Confirmar Pago
              </button>
            </div>
          </div>
        </div>
      )}

      {showExpenseModal && (
        <div className="fixed inset-0 z-[70] bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-[2.5rem] w-full max-w-sm overflow-hidden shadow-2xl">
            <div className="p-8 border-b flex justify-between items-center bg-slate-50/50">
              <h3 className="text-xl font-black text-slate-900 tracking-tight">Nuevo Gasto</h3>
              <button onClick={() => setShowExpenseModal(false)} className="p-2 text-slate-400"><X size={20} /></button>
            </div>
            <div className="p-8 space-y-4">
              <input type="number" value={newExpense.amount} onChange={e => setNewExpense({...newExpense, amount: e.target.value})} className="w-full p-4 bg-slate-50 border-none rounded-2xl focus:ring-2 focus:ring-pink-500/20 outline-none font-bold" placeholder="Monto $" />
              <input type="text" value={newExpense.description} onChange={e => setNewExpense({...newExpense, description: e.target.value})} className="w-full p-4 bg-slate-50 border-none rounded-2xl focus:ring-2 focus:ring-pink-500/20 outline-none font-bold" placeholder="Descripción" />
              <select value={newExpense.type} onChange={e => setNewExpense({...newExpense, type: e.target.value as any})} className="w-full p-4 bg-slate-50 border-none rounded-2xl focus:ring-2 focus:ring-pink-500/20 outline-none font-bold">
                <option value="variable">Variable</option>
                <option value="fija">Fija</option>
              </select>
              <button onClick={handleAddExpense} className="w-full py-5 bg-pink-500 text-white rounded-[2rem] font-black uppercase tracking-widest text-sm shadow-xl active:scale-95">Guardar Gasto</button>
            </div>
          </div>
        </div>
      )}

      {showCustomerModal && (
        <div className="fixed inset-0 z-[70] bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-[2.5rem] w-full max-w-sm overflow-hidden shadow-2xl">
            <div className="p-8 border-b flex justify-between items-center bg-slate-50/50">
              <h3 className="text-xl font-black text-slate-900 tracking-tight">Nuevo Cliente</h3>
              <button onClick={() => setShowCustomerModal(false)} className="p-2 text-slate-400"><X size={20} /></button>
            </div>
            <div className="p-8 space-y-4">
              <input type="text" value={newCustomer.name} onChange={e => setNewCustomer({...newCustomer, name: e.target.value})} className="w-full p-4 bg-slate-50 border-none rounded-2xl focus:ring-2 focus:ring-pink-500/20 outline-none font-bold" placeholder="Nombre Completo" />
              <input type="tel" value={newCustomer.phone} onChange={e => setNewCustomer({...newCustomer, phone: e.target.value})} className="w-full p-4 bg-slate-50 border-none rounded-2xl focus:ring-2 focus:ring-pink-500/20 outline-none font-bold" placeholder="WhatsApp" />
              <button onClick={handleAddCustomer} className="w-full py-5 bg-slate-900 text-white rounded-[2rem] font-black uppercase tracking-widest text-sm shadow-xl active:scale-95">Crear Cliente</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AccountingDashboard;