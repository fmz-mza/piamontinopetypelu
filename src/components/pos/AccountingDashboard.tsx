"use client";

import React, { useState, useEffect } from 'react';
import { supabase, isSupabaseConfigured } from '../../lib/supabase';
import { DollarSign, TrendingUp, TrendingDown, Users, Plus, X, AlertCircle, CreditCard, Eye, Package, Trash2, FileText } from 'lucide-react';
import toast from 'react-hot-toast';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

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

const AccountingDashboard: React.FC = () => {
  const [sales, setSales] = useState<Sale[]>([]);
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [loading, setLoading] = useState(false);
  const [isConfigured, setIsConfigured] = useState(true);
  const [activeTab, setActiveTab] = useState<'resumen' | 'gastos' | 'clientes'>('resumen');
  const [showExpenseModal, setShowExpenseModal] = useState(false);
  const [showCustomerModal, setShowCustomerModal] = useState(false);
  const [showPaymentModal, setShowPaymentModal] = useState<Customer | null>(null);
  const [selectedSale, setSelectedSale] = useState<Sale | null>(null);
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
      const [salesRes, expensesRes, customersRes] = await Promise.all([
        supabase.from('sales').select('*').order('created_at', { ascending: false }).limit(100),
        supabase.from('expenses').select('*').order('date', { ascending: false }).limit(100),
        supabase.from('customers').select('*').order('name')
      ]);

      if (salesRes.data) setSales(salesRes.data);
      if (expensesRes.data) setExpenses(expensesRes.data);
      if (customersRes.data) setCustomers(customersRes.data);
    } catch (err) {
      console.error('Error fetching data:', err);
    } finally {
      setLoading(false);
    }
  };

  const formatPrice = (price: number) => {
    return price.toLocaleString('es-AR', { minimumFractionDigits: 0, maximumFractionDigits: 0 });
  };

  const generatePDF = () => {
    try {
      const doc = new jsPDF();
      const today = new Date().toLocaleDateString();
      
      doc.setFontSize(20);
      doc.text('Reporte de Ventas - Piamontino', 14, 22);
      doc.setFontSize(10);
      doc.text(`Fecha de generación: ${today}`, 14, 30);

      const tableData = sales.map(sale => [
        new Date(sale.created_at).toLocaleDateString(),
        sale.payment_method.toUpperCase(),
        `$${formatPrice(sale.total)}`
      ]);

      autoTable(doc, {
        startY: 40,
        head: [['Fecha', 'Método', 'Total']],
        body: tableData,
        theme: 'striped',
        headStyles: { fillColor: [236, 72, 153] }
      });

      const total = sales.reduce((sum, s) => sum + s.total, 0);
      const finalY = (doc as any).lastAutoTable?.finalY || 40;
      doc.setFontSize(12);
      doc.text(`Total Acumulado: $${formatPrice(total)}`, 14, finalY + 10);

      doc.save(`reporte-ventas-${today}.pdf`);
      toast.success('PDF generado correctamente');
    } catch (err) {
      console.error('Error generating PDF:', err);
      toast.error('Error al generar el PDF');
    }
  };

  const handleAddExpense = async () => {
    if (!newExpense.amount || !newExpense.description) {
      toast.error('Completá todos los campos');
      return;
    }

    try {
      const { error } = await supabase
        .from('expenses')
        .insert([{
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
    } catch (err) {
      console.error('Error adding expense:', err);
      toast.error('Error al registrar gasto');
    }
  };

  const handleDeleteExpense = async (id: string) => {
    if (!confirm('¿Estás seguro de eliminar este gasto?')) return;

    try {
      const { error } = await supabase
        .from('expenses')
        .delete()
        .eq('id', id);

      if (error) throw error;
      toast.success('Gasto eliminado');
      fetchData();
    } catch (err) {
      console.error('Error deleting expense:', err);
      toast.error('Error al eliminar gasto');
    }
  };

  const handleAddCustomer = async () => {
    if (!newCustomer.name) {
      toast.error('El nombre es obligatorio');
      return;
    }

    try {
      const { error } = await supabase
        .from('customers')
        .insert([{
          name: newCustomer.name,
          phone: newCustomer.phone,
          balance: 0
        }]);

      if (error) throw error;
      toast.success('Cliente agregado');
      setShowCustomerModal(false);
      setNewCustomer({ name: '', phone: '' });
      fetchData();
    } catch (err) {
      console.error('Error adding customer:', err);
      toast.error('Error al agregar cliente');
    }
  };

  const handleCustomerPayment = async () => {
    if (!showPaymentModal || !paymentAmount) return;
    const amount = parseFloat(paymentAmount);
    if (isNaN(amount) || amount <= 0) {
      toast.error('Monto inválido');
      return;
    }

    try {
      const newBalance = showPaymentModal.balance - amount;
      const { error } = await supabase
        .from('customers')
        .update({ balance: newBalance })
        .eq('id', showPaymentModal.id);

      if (error) throw error;
      
      toast.success('Pago registrado');
      setShowPaymentModal(null);
      setPaymentAmount('');
      fetchData();
    } catch (err) {
      console.error('Error recording payment:', err);
      toast.error('Error al registrar pago');
    }
  };

  const today = new Date().toISOString().split('T')[0];
  const thisMonth = new Date().toISOString().slice(0, 7);

  const todaySales = sales
    .filter(s => s.created_at.startsWith(today))
    .reduce((sum, s) => sum + s.total, 0);

  const monthSales = sales
    .filter(s => s.created_at.startsWith(thisMonth))
    .reduce((sum, s) => sum + s.total, 0);

  const monthExpenses = expenses
    .filter(e => e.date.startsWith(thisMonth))
    .reduce((sum, e) => sum + e.amount, 0);

  const totalCustomersBalance = customers.reduce((sum, c) => sum + c.balance, 0);
  const profit = monthSales - monthExpenses;

  if (!isConfigured) {
    return (
      <div className="bg-amber-50 border border-amber-200 rounded-2xl p-6">
        <div className="flex items-start gap-4">
          <AlertCircle className="text-amber-500 shrink-0 mt-0.5" size={24} />
          <div>
            <h3 className="font-bold text-amber-800 mb-2">Supabase no configurado</h3>
            <p className="text-amber-700 text-sm">
              Configurá las variables de entorno para usar la gestión contable.
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 pb-4">
        <div className="flex gap-2">
          {[
            { id: 'resumen', label: 'Resumen' },
            { id: 'gastos', label: 'Gastos' },
            { id: 'clientes', label: 'Cuentas Corrientes' }
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`px-4 py-2 rounded-lg font-medium text-sm transition-colors ${
                activeTab === tab.id
                  ? 'bg-pink-500 text-white'
                  : 'text-slate-600 hover:bg-slate-100'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
        <button
          onClick={generatePDF}
          className="px-4 py-2 bg-slate-800 text-white rounded-lg font-medium text-sm hover:bg-slate-900 transition-colors flex items-center justify-center gap-2"
        >
          <FileText size={18} />
          Exportar PDF
        </button>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-12">
          <div className="animate-spin w-8 h-8 border-4 border-pink-500 border-t-transparent rounded-full" />
        </div>
      ) : (
        <>
          {activeTab === 'resumen' && (
            <div className="space-y-6">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="bg-white p-5 rounded-2xl border border-slate-200">
                  <div className="flex items-center gap-3 mb-2">
                    <div className="p-2 bg-green-100 rounded-lg">
                      <TrendingUp size={20} className="text-green-600" />
                    </div>
                    <span className="text-slate-500 text-sm">Ventas Hoy</span>
                  </div>
                  <p className="text-2xl font-black text-slate-800">${formatPrice(todaySales)}</p>
                </div>

                <div className="bg-white p-5 rounded-2xl border border-slate-200">
                  <div className="flex items-center gap-3 mb-2">
                    <div className="p-2 bg-pink-100 rounded-lg">
                      <DollarSign size={20} className="text-pink-600" />
                    </div>
                    <span className="text-slate-500 text-sm">Ventas Mes</span>
                  </div>
                  <p className="text-2xl font-black text-slate-800">${formatPrice(monthSales)}</p>
                </div>

                <div className="bg-white p-5 rounded-2xl border border-slate-200">
                  <div className="flex items-center gap-3 mb-2">
                    <div className="p-2 bg-red-100 rounded-lg">
                      <TrendingDown size={20} className="text-red-600" />
                    </div>
                    <span className="text-slate-500 text-sm">Gastos Mes</span>
                  </div>
                  <p className="text-2xl font-black text-slate-800">${formatPrice(monthExpenses)}</p>
                </div>

                <div className="bg-white p-5 rounded-2xl border border-slate-200">
                  <div className="flex items-center gap-3 mb-2">
                    <div className={`p-2 rounded-lg ${profit >= 0 ? 'bg-green-100' : 'bg-red-100'}`}>
                      <DollarSign size={20} className={profit >= 0 ? 'text-green-600' : 'text-red-600'} />
                    </div>
                    <span className="text-slate-500 text-sm">Ganancia Mes</span>
                  </div>
                  <p className={`text-2xl font-black ${profit >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                    ${formatPrice(profit)}
                  </p>
                </div>
              </div>

              <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden">
                <div className="p-4 border-b">
                  <h3 className="font-bold text-slate-800">Últimas Ventas</h3>
                </div>
                <div className="divide-y divide-slate-100">
                  {sales.slice(0, 10).map(sale => (
                    <div key={sale.id} className="p-4 flex items-center justify-between hover:bg-slate-50 transition-colors">
                      <div>
                        <p className="font-medium text-slate-800">
                          {new Date(sale.created_at).toLocaleDateString('es-AR', {
                            day: '2-digit',
                            month: '2-digit',
                            hour: '2-digit',
                            minute: '2-digit'
                          })}
                        </p>
                        <p className="text-sm text-slate-500">
                          {sale.payment_method === 'efectivo' ? 'Efectivo' : sale.payment_method === 'tarjeta' ? 'Tarjeta' : 'Cta. Cte.'} • {sale.items.length} items
                        </p>
                      </div>
                      <div className="flex items-center gap-4">
                        <p className="font-bold text-pink-500">${formatPrice(sale.total)}</p>
                        <button 
                          onClick={() => setSelectedSale(sale)}
                          className="p-2 text-slate-400 hover:text-pink-500 hover:bg-pink-50 rounded-lg transition-all"
                        >
                          <Eye size={18} />
                        </button>
                      </div>
                    </div>
                  ))}
                  {sales.length === 0 && (
                    <div className="p-8 text-center text-slate-500">
                      No hay ventas registradas
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {activeTab === 'gastos' && (
            <div className="space-y-4">
              <div className="flex justify-end">
                <button
                  onClick={() => setShowExpenseModal(true)}
                  className="px-4 py-2 bg-pink-500 text-white rounded-xl font-medium hover:bg-pink-600 transition-colors flex items-center gap-2"
                >
                  <Plus size={18} />
                  Agregar Gasto
                </button>
              </div>

              <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden">
                <div className="divide-y divide-slate-100">
                  {expenses.map(expense => (
                    <div key={expense.id} className="p-4 flex items-center justify-between hover:bg-slate-50 transition-colors">
                      <div>
                        <p className="font-medium text-slate-800">{expense.description}</p>
                        <p className="text-sm text-slate-500">
                          {new Date(expense.date).toLocaleDateString('es-AR')} • {expense.type === 'fija' ? 'Fija' : 'Variable'}
                        </p>
                      </div>
                      <div className="flex items-center gap-4">
                        <p className="font-bold text-red-500">-${formatPrice(expense.amount)}</p>
                        <button
                          onClick={() => handleDeleteExpense(expense.id)}
                          className="p-2 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-all"
                        >
                          <Trash2 size={18} />
                        </button>
                      </div>
                    </div>
                  ))}
                  {expenses.length === 0 && (
                    <div className="p-8 text-center text-slate-500">
                      No hay gastos registrados
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {activeTab === 'clientes' && (
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <div className="text-slate-600">
                  Total en cuentas corrientes: <span className="font-bold text-slate-800">${formatPrice(totalCustomersBalance)}</span>
                </div>
                <button
                  onClick={() => setShowCustomerModal(true)}
                  className="px-4 py-2 bg-pink-500 text-white rounded-xl font-medium hover:bg-pink-600 transition-colors flex items-center gap-2"
                >
                  <Plus size={18} />
                  Agregar Cliente
                </button>
              </div>

              <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden">
                <div className="divide-y divide-slate-100">
                  {customers.map(customer => (
                    <div key={customer.id} className="p-4 flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-pink-100 rounded-full flex items-center justify-center">
                          <Users size={18} className="text-pink-600" />
                        </div>
                        <div>
                          <p className="font-medium text-slate-800">{customer.name}</p>
                          <p className="text-sm text-slate-500">{customer.phone || 'Sin teléfono'}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-4">
                        <p className={`font-bold ${customer.balance > 0 ? 'text-amber-500' : 'text-slate-400'}`}>
                          ${formatPrice(customer.balance)}
                        </p>
                        <button
                          onClick={() => setShowPaymentModal(customer)}
                          className="p-2 text-pink-500 hover:bg-pink-50 rounded-lg transition-colors"
                          title="Registrar Pago"
                        >
                          <CreditCard size={18} />
                        </button>
                      </div>
                    </div>
                  ))}
                  {customers.length === 0 && (
                    <div className="p-8 text-center text-slate-500">
                      No hay clientes registrados
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}
        </>
      )}

      {/* Sale Details Modal */}
      {selectedSale && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl w-full max-w-md">
            <div className="flex items-center justify-between p-4 border-b">
              <h3 className="font-bold text-slate-800">Detalle de Venta</h3>
              <button onClick={() => setSelectedSale(null)} className="p-2 hover:bg-slate-100 rounded-lg">
                <X size={20} className="text-slate-600" />
              </button>
            </div>
            <div className="p-4 space-y-4">
              <div className="flex justify-between text-sm text-slate-500">
                <span>ID: {selectedSale.id.slice(0, 8)}</span>
                <span>{new Date(selectedSale.created_at).toLocaleString('es-AR')}</span>
              </div>
              <div className="space-y-2">
                {selectedSale.items.map((item: any, i: number) => (
                  <div key={i} className="flex justify-between items-center py-2 border-b border-slate-50 last:border-0">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 bg-slate-100 rounded flex items-center justify-center text-slate-400">
                        <Package size={14} />
                      </div>
                      <div>
                        <p className="text-sm font-medium text-slate-800">{item.name}</p>
                        <p className="text-xs text-slate-500">{item.quantity} x ${formatPrice(item.price)}</p>
                      </div>
                    </div>
                    <p className="text-sm font-bold text-slate-800">${formatPrice(item.quantity * item.price)}</p>
                  </div>
                ))}
              </div>
              <div className="pt-4 border-t space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-slate-500">Método de Pago</span>
                  <span className="font-medium capitalize">{selectedSale.payment_method.replace('_', ' ')}</span>
                </div>
                <div className="flex justify-between text-lg font-black">
                  <span>Total</span>
                  <span className="text-pink-500">${formatPrice(selectedSale.total)}</span>
                </div>
              </div>
            </div>
            <div className="p-4 border-t">
              <button
                onClick={() => setSelectedSale(null)}
                className="w-full py-3 bg-slate-100 text-slate-600 rounded-xl font-bold hover:bg-slate-200 transition-colors"
              >
                Cerrar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Expense Modal */}
      {showExpenseModal && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl w-full max-w-sm">
            <div className="flex items-center justify-between p-4 border-b">
              <h3 className="font-bold text-slate-800">Agregar Gasto</h3>
              <button onClick={() => setShowExpenseModal(false)} className="p-2 hover:bg-slate-100 rounded-lg">
                <X size={20} className="text-slate-600" />
              </button>
            </div>
            <div className="p-4 space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-600 mb-1">Monto</label>
                <input
                  type="number"
                  step="0.01"
                  value={newExpense.amount}
                  onChange={(e) => setNewExpense({ ...newExpense, amount: e.target.value })}
                  className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-pink-500 focus:ring-2 focus:ring-pink-100 outline-none"
                  placeholder="0.00"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-600 mb-1">Descripción</label>
                <input
                  type="text"
                  value={newExpense.description}
                  onChange={(e) => setNewExpense({ ...newExpense, description: e.target.value })}
                  className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-pink-500 focus:ring-2 focus:ring-pink-100 outline-none"
                  placeholder="Descripción del gasto"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-600 mb-1">Tipo</label>
                <select
                  value={newExpense.type}
                  onChange={(e) => setNewExpense({ ...newExpense, type: e.target.value as 'fija' | 'variable' })}
                  className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-pink-500 focus:ring-2 focus:ring-pink-100 outline-none"
                >
                  <option value="variable">Variable</option>
                  <option value="fija">Fija</option>
                </select>
              </div>
            </div>
            <div className="p-4 border-t">
              <button
                onClick={handleAddExpense}
                className="w-full py-3 bg-pink-500 text-white rounded-xl font-bold hover:bg-pink-600 transition-colors"
              >
                Registrar Gasto
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Customer Modal */}
      {showCustomerModal && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl w-full max-w-sm">
            <div className="flex items-center justify-between p-4 border-b">
              <h3 className="font-bold text-slate-800">Agregar Cliente</h3>
              <button onClick={() => setShowCustomerModal(false)} className="p-2 hover:bg-slate-100 rounded-lg">
                <X size={20} className="text-slate-600" />
              </button>
            </div>
            <div className="p-4 space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-600 mb-1">Nombre *</label>
                <input
                  type="text"
                  value={newCustomer.name}
                  onChange={(e) => setNewCustomer({ ...newCustomer, name: e.target.value })}
                  className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-pink-500 focus:ring-2 focus:ring-pink-100 outline-none"
                  placeholder="Nombre del cliente"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-600 mb-1">Teléfono</label>
                <input
                  type="tel"
                  value={newCustomer.phone}
                  onChange={(e) => setNewCustomer({ ...newCustomer, phone: e.target.value })}
                  className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-pink-500 focus:ring-2 focus:ring-pink-100 outline-none"
                  placeholder="Número de teléfono"
                />
              </div>
            </div>
            <div className="p-4 border-t">
              <button
                onClick={handleAddCustomer}
                className="w-full py-3 bg-pink-500 text-white rounded-xl font-bold hover:bg-pink-600 transition-colors"
              >
                Agregar Cliente
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Payment Modal */}
      {showPaymentModal && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl w-full max-w-sm">
            <div className="flex items-center justify-between p-4 border-b">
              <h3 className="font-bold text-slate-800">Registrar Pago</h3>
              <button onClick={() => setShowPaymentModal(null)} className="p-2 hover:bg-slate-100 rounded-lg">
                <X size={20} className="text-slate-600" />
              </button>
            </div>
            <div className="p-4 space-y-4">
              <div>
                <p className="text-slate-600 text-sm mb-1">Cliente: <span className="font-bold text-slate-800">{showPaymentModal.name}</span></p>
                <p className="text-slate-600 text-sm">Saldo actual: <span className="font-bold text-amber-500">${formatPrice(showPaymentModal.balance)}</span></p>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-600 mb-1">Monto del Pago</label>
                <input
                  type="number"
                  step="0.01"
                  value={paymentAmount}
                  onChange={(e) => setPaymentAmount(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-pink-500 focus:ring-2 focus:ring-pink-100 outline-none text-2xl font-bold text-center"
                  placeholder="0.00"
                  autoFocus
                />
              </div>
            </div>
            <div className="p-4 border-t">
              <button
                onClick={handleCustomerPayment}
                className="w-full py-3 bg-pink-500 text-white rounded-xl font-bold hover:bg-pink-600 transition-colors"
              >
                Confirmar Pago
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AccountingDashboard;