import { useState } from 'react';
import { useTable } from '../hooks/useSupabase';
import { formatCurrency, statusColor } from '../lib/format';
import type { Vendor } from '../types';
import { Pencil, Check, X, Plus } from 'lucide-react';

export default function VendorRoster() {
  const { data: vendors, loading, update, insert } = useTable<Vendor>('vendors');
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editData, setEditData] = useState<Partial<Vendor>>({});
  const [showAdd, setShowAdd] = useState(false);
  const [newVendor, setNewVendor] = useState<Partial<Vendor>>({
    trade: '', company: '', contact: '', phone: '', email: '', quote: 0, status: 'needed', notes: '',
  });

  const startEdit = (v: Vendor) => {
    setEditingId(v.id);
    setEditData({ company: v.company, contact: v.contact, phone: v.phone, email: v.email, quote: v.quote, status: v.status, notes: v.notes });
  };

  const saveEdit = async (id: string) => {
    await update(id, editData);
    setEditingId(null);
  };

  const addVendor = async () => {
    if (!newVendor.trade) return;
    await insert(newVendor);
    setNewVendor({ trade: '', company: '', contact: '', phone: '', email: '', quote: 0, status: 'needed', notes: '' });
    setShowAdd(false);
  };

  const statusOptions: Vendor['status'][] = ['needed', 'prospect', 'contracted', 'active', 'complete'];

  if (loading) {
    return <div className="flex items-center justify-center h-64 text-gray-500">Loading vendors...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-start">
        <div>
          <h2 className="text-2xl font-bold text-navy">Vendor Roster</h2>
          <p className="text-gray-500 mt-1">Manage subcontractors and trade partners</p>
        </div>
        <button
          onClick={() => setShowAdd(!showAdd)}
          className="flex items-center gap-1 px-3 py-2 bg-navy text-white text-sm rounded-lg hover:bg-navy-light"
        >
          <Plus className="w-4 h-4" /> Add Vendor
        </button>
      </div>

      {showAdd && (
        <div className="bg-white rounded-xl border border-gray-200 p-4">
          <h3 className="font-semibold text-gray-900 mb-3">New Vendor</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            <input placeholder="Trade *" value={newVendor.trade} onChange={e => setNewVendor({...newVendor, trade: e.target.value})} className="px-3 py-2 border border-gray-300 rounded-lg text-sm" />
            <input placeholder="Company" value={newVendor.company} onChange={e => setNewVendor({...newVendor, company: e.target.value})} className="px-3 py-2 border border-gray-300 rounded-lg text-sm" />
            <input placeholder="Contact" value={newVendor.contact} onChange={e => setNewVendor({...newVendor, contact: e.target.value})} className="px-3 py-2 border border-gray-300 rounded-lg text-sm" />
            <input placeholder="Phone" value={newVendor.phone} onChange={e => setNewVendor({...newVendor, phone: e.target.value})} className="px-3 py-2 border border-gray-300 rounded-lg text-sm" />
            <input placeholder="Email" value={newVendor.email} onChange={e => setNewVendor({...newVendor, email: e.target.value})} className="px-3 py-2 border border-gray-300 rounded-lg text-sm" />
            <input placeholder="Quote" type="number" value={newVendor.quote || ''} onChange={e => setNewVendor({...newVendor, quote: parseFloat(e.target.value) || 0})} className="px-3 py-2 border border-gray-300 rounded-lg text-sm" />
            <select value={newVendor.status} onChange={e => setNewVendor({...newVendor, status: e.target.value as Vendor['status']})} className="px-3 py-2 border border-gray-300 rounded-lg text-sm">
              {statusOptions.map(s => <option key={s} value={s}>{s}</option>)}
            </select>
            <div className="flex gap-2">
              <button onClick={addVendor} className="flex-1 px-3 py-2 bg-emerald-600 text-white text-sm rounded-lg hover:bg-emerald-700">Save</button>
              <button onClick={() => setShowAdd(false)} className="px-3 py-2 bg-gray-200 text-gray-700 text-sm rounded-lg hover:bg-gray-300">Cancel</button>
            </div>
          </div>
        </div>
      )}

      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-200">
                <th className="text-left py-3 px-4 font-semibold text-gray-700">Trade</th>
                <th className="text-left py-3 px-4 font-semibold text-gray-700">Company</th>
                <th className="text-left py-3 px-4 font-semibold text-gray-700">Contact</th>
                <th className="text-left py-3 px-4 font-semibold text-gray-700">Phone</th>
                <th className="text-left py-3 px-4 font-semibold text-gray-700">Email</th>
                <th className="text-right py-3 px-4 font-semibold text-gray-700">Quote</th>
                <th className="text-center py-3 px-4 font-semibold text-gray-700">Status</th>
                <th className="py-3 px-4"></th>
              </tr>
            </thead>
            <tbody>
              {vendors.map((vendor) => (
                <tr key={vendor.id} className="border-b border-gray-100 hover:bg-gray-50">
                  <td className="py-3 px-4 font-medium text-gray-900">{vendor.trade}</td>
                  <td className="py-3 px-4">
                    {editingId === vendor.id ? (
                      <input value={editData.company || ''} onChange={e => setEditData({...editData, company: e.target.value})} className="w-full px-2 py-1 border border-gray-300 rounded text-sm" />
                    ) : (
                      <span className="text-gray-700">{vendor.company || '—'}</span>
                    )}
                  </td>
                  <td className="py-3 px-4">
                    {editingId === vendor.id ? (
                      <input value={editData.contact || ''} onChange={e => setEditData({...editData, contact: e.target.value})} className="w-full px-2 py-1 border border-gray-300 rounded text-sm" />
                    ) : (
                      <span className="text-gray-700">{vendor.contact || '—'}</span>
                    )}
                  </td>
                  <td className="py-3 px-4">
                    {editingId === vendor.id ? (
                      <input value={editData.phone || ''} onChange={e => setEditData({...editData, phone: e.target.value})} className="w-full px-2 py-1 border border-gray-300 rounded text-sm" />
                    ) : (
                      <span className="text-gray-500">{vendor.phone || '—'}</span>
                    )}
                  </td>
                  <td className="py-3 px-4">
                    {editingId === vendor.id ? (
                      <input value={editData.email || ''} onChange={e => setEditData({...editData, email: e.target.value})} className="w-full px-2 py-1 border border-gray-300 rounded text-sm" />
                    ) : (
                      <span className="text-gray-500">{vendor.email || '—'}</span>
                    )}
                  </td>
                  <td className="py-3 px-4 text-right">
                    {editingId === vendor.id ? (
                      <input type="number" value={editData.quote || ''} onChange={e => setEditData({...editData, quote: parseFloat(e.target.value) || 0})} className="w-24 px-2 py-1 border border-gray-300 rounded text-sm text-right" />
                    ) : (
                      <span className="text-gray-700">{Number(vendor.quote) > 0 ? formatCurrency(Number(vendor.quote)) : '—'}</span>
                    )}
                  </td>
                  <td className="py-3 px-4 text-center">
                    {editingId === vendor.id ? (
                      <select value={editData.status} onChange={e => setEditData({...editData, status: e.target.value as Vendor['status']})} className="px-2 py-1 border border-gray-300 rounded text-xs">
                        {statusOptions.map(s => <option key={s} value={s}>{s}</option>)}
                      </select>
                    ) : (
                      <span className={`inline-block px-2 py-0.5 rounded-full text-xs font-medium ${statusColor(vendor.status)}`}>
                        {vendor.status}
                      </span>
                    )}
                  </td>
                  <td className="py-3 px-4">
                    {editingId === vendor.id ? (
                      <div className="flex gap-1">
                        <button onClick={() => saveEdit(vendor.id)} className="p-1 text-emerald-600 hover:bg-emerald-50 rounded"><Check className="w-4 h-4" /></button>
                        <button onClick={() => setEditingId(null)} className="p-1 text-red-600 hover:bg-red-50 rounded"><X className="w-4 h-4" /></button>
                      </div>
                    ) : (
                      <button onClick={() => startEdit(vendor)} className="p-1 text-gray-400 hover:text-gray-700 hover:bg-gray-100 rounded"><Pencil className="w-4 h-4" /></button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
