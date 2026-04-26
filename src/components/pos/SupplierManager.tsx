"use client";

import React, { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';
import { Plus, Trash2, User, Phone, Building2, Search, X, Save, DollarSign, Edit, List, Truck } from 'lucide-react';
import toast from 'react-hot-toast';
import PurchaseModal from './PurchaseModal';
import PaymentModal from './PaymentModal';

interface Supplier {
  id: string;
  name: string;
  phone: string;
  company: string;
  created_at: string;
  balance: number;
}

const SupplierManager: React.FC = () => {
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState({ name: '', phone: '', company: '' });
  const [selectedSupplier, setSelectedSupplier] = useState<Supplier | null>(null);
  const [isPurchaseModalOpen, setIsPurchaseModalOpen] = useState(false);
  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);
  const [isStatementModalOpen, setIsStatementModalOpen] = useState(false);
  const [statementData, setStatementData] = useState<any[]>([]);
  const [statementLoading, setStatementLoading] = useState(false);

  useEffect(() => {
    fetchSuppliers();
  }, []);

  const fetchSuppliers = async () => {
    setLoading(true);
    const { data, error } = await supabase.from('suppliers').select('*, balance').order('name');
    if (error) toast.error('Error al cargar proveedores');
    else setSuppliers(data || []);
    setLoading(false);
  };

  const handleSave = async () => {
    if (!formData.name) {
      toast.error('El nombre es obligatorio');
      return;
    }
    try {
      const { error } = await supabase.from('suppliers').insert([formData]);
      if (error) throw error;
      toast.success('Proveedor guardado');
      setIsModalOpen(false);
      setFormData({ name: '', phone: '', company: '' });
      fetchSuppliers();
    } catch (err) {
      toast.error('Error al guardar');
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('¿Eliminar este proveedor?')) return;
    const { error } = await supabase.from('suppliers').delete().eq('id', id);
    if (error) toast.error('Error al eliminar');
    else fetchSuppliers();
  };

  const handleOpenPurchaseModal = (supplier: Supplier) => {
    setSelectedSupplier(supplier);
    setIsPurchaseModalOpen(true);
  };

  const handleOpenPaymentModal = (supplier: Supplier) => {
    setSelectedSupplier(supplier);
    setIsPaymentModalOpen(true);
  };

  const handleOpenStatementModal = (supplier: Supplier) => {
    setSelectedSupplier(supplier);
    setIsStatementModalOpen(true);
    fetchStatement(supplier.id);
  };

  const fetchStatement = async (supplierId: string) => {
    setStatementLoading(true);
    const { data, error } = await supabase
      .from('supplier_transactions')
      .select('*')
      .eq('supplier_id', supplierId)
      .order('date', { ascending: false });
    if (error) {
      toast.error('Error al cargar estado de cuenta');
      setStatementData([]);
    } else {
      setStatementData(data || []);
    }
    setStatementLoading(false);
  };

  const filtered = suppliers.filter(s => 
    s.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
    s.company?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div className="relative flex-1 w-full">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
          <input 
            type="text" 
            placeholder="Buscar proveedor..." 
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            className="w-full pl-12 pr-4 py-3 rounded-2xl border border-slate-200 outline-none focus:border-pink-500"
          />
        </div>
        <button 
          onClick={() => setIsModalOpen(true)}
          className="px-6 py-3 bg-slate-900 text-white rounded-2xl font-bold text-sm flex items-center gap-2 hover:bg-pink-500 transition-all"
        >
          <Plus size={18} /> Nuevo Proveedor
        </button>
      </div>

      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
        {loading ? (
          <div className="col-span-full py-10 text-center"><div className="animate-spin w-8 h-8 border-4 border-pink-500 border-t-transparent rounded-full mx-auto" /></div>
        ) : filtered.map(s => (
          <div key={s.id} className="bg-white p-6 rounded-[2rem] border border-slate-200 shadow-sm relative group">
            <button onClick={() => handleDelete(s.id)} className="absolute top-4 right-4 p-2 text-slate-300 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-all">
              <Trash2 size={16} />
            </button>
            <div className="flex items-center gap-4 mb-4">
              <div className="w-12 h-12 bg-slate-100 rounded-2xl flex items-center justify-center text-slate-400">
                <Building2 size={24} />
              </div>
              <div>
                <h4 className="font-black text-slate-800">{s.name}</h4>
                <p className="text-xs text-slate-400 font-bold uppercase tracking-widest">{s.company || 'Empresa no especificada'}</p>
              </div>
            </div>
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-sm text-slate-500">
                <Phone size={14} className="text-pink-500" />
                <span>{s.phone || 'Sin teléfono'}</span>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <DollarSign size={14} className="text-green-500" />
                <span className={`font-medium ${s.balance > 0 ? 'text-red-500' : s.balance < 0 ? 'text-green-500' : 'text-slate-500'}`}>
                  {s.balance > 0 ? `Deuda: $${s.balance.toFixed(2)}` : 
                   s.balance < 0 ? `Saldo a favor: $${Math.abs(s.balance).toFixed(2)}` : 
                   'Sin deuda'}
                </span>
              </div>
            </div>
            <div className="flex gap-2 mt-4">
              <button 
                onClick={() => handleOpenPurchaseModal(s)}
                className="flex-1 px-3 py-2 bg-blue-500 text-white text-xs rounded-[1.5rem] hover:bg-blue-600 transition-all flex items-center justify-center gap-1"
              >
                <Truck size={14} /> Compra
              </button>
              <button 
                onClick={() => handleOpenPaymentModal(s)}
                className="flex-1 px-3 py-2 bg-green-500 text-white text-xs rounded-[1.5rem] hover:bg-green-600 transition-all flex items-center justify-center gap-1"
              >
                <DollarSign size={14} /> Pago
              </button>
              <button 
                onClick={() => handleOpenStatementModal(s)}
                className="flex-1 px-3 py-2 bg-purple-500 text-white text-xs rounded-[1.5rem] hover:bg-purple-600 transition-all flex items-center justify-center gap-1"
              >
                <List size={14} /> Estado
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* New Supplier Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-[100] bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-[2.5rem] w-full max-w-md overflow-hidden shadow-2xl">
            <div className="p-8 border-b flex justify-between items-center bg-slate-50/50">
              <h3 className="text-2xl font-black text-slate-900 tracking-tight">Nuevo Proveedor</h3>
              <button onClick={() => setIsModalOpen(false)} className="p-2 text-slate-400"><X size={24} /></button>
            </div>
            <div className="p-8 space-y-5">
              <div className="space-y-1.5">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Nombre de Contacto</label>
                <input 
                  type="text" 
                  value={formData.name}
                  onChange={e => setFormData({...formData, name: e.target.value})}
                  className="w-full p-4 bg-slate-50 border-none rounded-2xl focus:ring-2 focus:ring-pink-500/20 outline-none font-medium"
                  placeholder="Ej: Carlos Gómez"
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Empresa / Marca</label>
                <input 
                  type="text" 
                  value={formData.company}
                  onChange={e => setFormData({...formData, company: e.target.value})}
                  className="w-full p-4 bg-slate-50 border-none rounded-2xl focus:ring-2 focus:ring-pink-500/20 outline-none font-medium"
                  placeholder="Ej: Distribuidora Pet"
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Teléfono / WhatsApp</label>
                <input 
                  type="text" 
                  value={formData.phone}
                  onChange={e => setFormData({...formData, phone: e.target.value})}
                  className="w-full p-4 bg-slate-50 border-none rounded-2xl focus:ring-2 focus:ring-pink-500/20 outline-none font-medium"
                  placeholder="261..."
                />
              </div>
              <button 
                onClick={handleSave}
                className="w-full py-5 bg-slate-900 text-white rounded-[2rem] font-black uppercase tracking-widest text-sm shadow-xl hover:bg-pink-500 transition-all active:scale-95"
              >
                Guardar Proveedor
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Purchase Modal */}
      {isPurchaseModalOpen && selectedSupplier && (
        <div className="fixed inset-0 z-[100] bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-[2.5rem] w-full max-w-[600px] max-h-[90vh] overflow-y-auto shadow-2xl">
            <div className="p-8 border-b flex justify-between items-center bg-slate-50/50 sticky top-0 z-10">
              <h3 className="text-2xl font-black text-slate-900 tracking-tight">Registrar Compra</h3>
              <button onClick={() => setIsPurchaseModalOpen(false)} className="p-2 text-slate-400"><X size={24} /></button>
            </div>
            <div className="p-8">
              <PurchaseModal 
                supplier={selectedSupplier}
                onClose={() => setIsPurchaseModalOpen(false)}
                onSuccess={() => {
                  setIsPurchaseModalOpen(false);
                  fetchSuppliers();
                }}
              />
            </div>
          </div>
        </div>
      )}

      {/* Payment Modal */}
      {isPaymentModalOpen && selectedSupplier && (
        <div className="fixed inset-0 z-[100] bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-[2.5rem] w-full max-w-md overflow-hidden shadow-2xl">
            <div className="p-8 border-b flex justify-between items-center bg-slate-50/50">
              <h3 className="text-2xl font-black text-slate-900 tracking-tight">Registrar Pago</h3>
              <button onClick={() => setIsPaymentModalOpen(false)} className="p-2 text-slate-400"><X size={24} /></button>
            </div>
            <div className="p-8">
              <PaymentModal 
                supplier={selectedSupplier}
                onClose={() => setIsPaymentModalOpen(false)}
                onSuccess={() => {
                  setIsPaymentModalOpen(false);
                  fetchSuppliers();
                }}
              />
            </div>
          </div>
        </div>
      )}

      {/* Statement Modal */}
      {isStatementModalOpen && selectedSupplier && (
        <div className="fixed inset-0 z-[100] bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-[2.5rem] w-full max-w-[600px] h-[80vh] overflow-hidden shadow-2xl flex flex-col">
            <div className="p-8 border-b flex justify-between items-center bg-slate-50/50">
              <h3 className="text-2xl font-black text-slate-900 tracking-tight">Estado de Cuenta</h3>
              <button onClick={() => setIsStatementModalOpen(false)} className="p-2 text-slate-400"><X size={24} /></button>
            </div>
            <div className="p-8 flex-1 overflow-y-auto">
              <div className="mb-6">
                <h4 className="font-bold text-slate-800">{selectedSupplier.name}</h4>
                <p className="text-slate-500">
                  Balance actual: 
                  <span className={selectedSupplier.balance > 0 ? 'text-red-500 font-bold' : selectedSupplier.balance < 0 ? 'text-green-500 font-bold' : 'text-slate-500'}>
                    {selectedSupplier.balance > 0 ? ` $${selectedSupplier.balance.toFixed(2)} (Deuda)` : 
                     selectedSupplier.balance < 0 ? ` $${Math.abs(selectedSupplier.balance).toFixed(2)} a favor` : 
                     ' $0 (Sin deuda)'}
                  </span>
                </p>
              </div>
              {statementLoading ? (
                <div className="text-center py-8"><div className="animate-spin w-8 h-8 border-4 border-pink-500 border-t-transparent rounded-full mx-auto" /></div>
              ) : (
                <div className="space-y-4">
                  {statementData.length === 0 ? (
                    <p className="text-center text-slate-500">No hay transacciones para este proveedor.</p>
                  ) : (
                    statementData.map((tx: any, index: number) => (
                      <div key={tx.id} className="border-l-2 border-pink-500 pl-4">
                        <div className="flex justify-between items-start mb-1">
                          <span className="text-sm text-slate-500">{new Date(tx.date).toLocaleDateString()}</span>
                          <span className="text-sm font-medium px-2 py-0.5 rounded-full bg-slate-100">
                            {tx.type === 'compra' ? 'Compra' : 'Pago'}
                          </span>
                        </div>
                        <p className="text-slate-600 text-sm">{tx.description}</p>
                        <div className="flex justify-between items-baseline mt-1">
                          <span className={`text-sm font-bold ${tx.type === 'compra' ? 'text-red-500' : 'text-green-500'}`}>
                            {tx.type === 'compra' ? `-$${tx.amount.toFixed(2)}` : `+$${tx.amount.toFixed(2)}`}
                          </span>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              )}
            </div>
            <div className="p-6 border-t bg-slate-50">
              <button 
                onClick={() => setIsStatementModalOpen(false)}
                className="w-full py-3 bg-slate-900 text-white rounded-[2rem] font-black uppercase tracking-widest text-sm shadow-xl hover:bg-pink-500 transition-all active:scale-95"
              >
                Cerrar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SupplierManager;