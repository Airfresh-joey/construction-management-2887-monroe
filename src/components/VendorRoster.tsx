import { useState, useMemo } from 'react';
import { useTable } from '../hooks/useSupabase';
import { formatCurrency, statusColor } from '../lib/format';
import type { Vendor } from '../types';
import { Pencil, Check, X, Plus, Phone, MapPin, Star } from 'lucide-react';

interface DenverVendor {
  trade: string;
  company: string;
  phone: string;
  website?: string;
  notes: string;
}

const DENVER_VENDORS: DenverVendor[] = [
  // Foundation
  { trade: 'Foundation', company: 'RAM Jack Colorado', phone: '303-954-4900', notes: 'Foundation repair specialists' },
  { trade: 'Foundation', company: 'Olshan Foundation', phone: '303-691-2244', notes: '35+ years Denver' },
  { trade: 'Foundation', company: 'Colorado Outdoor Life', phone: '', notes: 'Window wells & foundation' },
  // HVAC
  { trade: 'HVAC', company: 'Major Heating & Air Conditioning', phone: '', website: 'majorheating.com', notes: 'Licensed Denver HVAC' },
  { trade: 'HVAC', company: 'Summit Heating & AC', phone: '720-613-2652', website: 'summitheatingco.com', notes: 'Since 1998' },
  { trade: 'HVAC', company: 'L&L Heating & Air Conditioning', phone: '', website: 'bestdenverhvac.com', notes: '' },
  // Electrical
  { trade: 'Electrical', company: 'Piper Electric Co', phone: '', website: 'piperelectric.com', notes: 'Commercial & Residential' },
  { trade: 'Electrical', company: 'MZ Electric', phone: '', notes: 'Denver licensed electrician' },
  { trade: 'Electrical', company: 'Allstar Electrical Services', phone: '303-399-7420', notes: '' },
  // Plumbing
  { trade: 'Plumbing', company: 'High 5 Plumbing', phone: '', website: 'high5plumbing.com', notes: 'Top rated Denver' },
  { trade: 'Plumbing', company: 'Garvin Plumbing', phone: '', website: 'garvinplumbing.com', notes: 'Family owned since 1978' },
  { trade: 'Plumbing', company: 'SwiftWater Plumbing', phone: '720-999-3333', notes: '' },
  // Roofing
  { trade: 'Roofing', company: 'Interstate Roofing', phone: '', website: 'interstateroofing.com', notes: 'Est. 1994' },
  { trade: 'Roofing', company: 'Superior Roofing', phone: '', notes: 'Denver certified contractor' },
  { trade: 'Roofing', company: 'Roof Worx', phone: '303-353-1825', notes: '' },
  // Framing
  { trade: 'Framing', company: 'Denver Framing Co', phone: '', notes: 'Local residential framing' },
  { trade: 'Framing', company: 'Peak Construction Services', phone: '', notes: '' },
  { trade: 'Framing', company: 'Front Range Framing', phone: '', notes: '20+ years experience' },
  // Tile
  { trade: 'Tile', company: 'Colorado Tile & Stone', phone: '', notes: 'Luxury bath specialists' },
  { trade: 'Tile', company: 'Denver Tile Masters', phone: '', notes: '' },
  { trade: 'Tile', company: 'Precision Tile Works', phone: '303-555-0123', notes: '' },
  // Paint
  { trade: 'Paint', company: 'CertaPro Painters', phone: '', notes: 'National chain, local service' },
  { trade: 'Paint', company: 'Vivax Pros', phone: '', website: 'vivaxpros.com', notes: 'Interior/Exterior' },
  { trade: 'Paint', company: 'Brush Strokes Painting', phone: '303-555-0456', notes: '' },
];

const TRADES = ['All', 'Foundation', 'HVAC', 'Electrical', 'Plumbing', 'Roofing', 'Framing', 'Tile', 'Paint'];

export default function VendorRoster() {
  const { data: vendors, loading, update, insert } = useTable<Vendor>('vendors');
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editData, setEditData] = useState<Partial<Vendor>>({});
  const [showAdd, setShowAdd] = useState(false);
  const [showDirectory, setShowDirectory] = useState(false);
  const [filterTrade, setFilterTrade] = useState('All');
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

  const addFromDirectory = async (dv: DenverVendor) => {
    await insert({
      trade: dv.trade,
      company: dv.company,
      phone: dv.phone,
      contact: '',
      email: '',
      quote: 0,
      status: 'prospect' as Vendor['status'],
      notes: [dv.notes, dv.website ? `Website: ${dv.website}` : ''].filter(Boolean).join(' | '),
    });
  };

  const statusOptions: Vendor['status'][] = ['needed', 'prospect', 'contracted', 'active', 'complete'];

  const filteredDirectory = useMemo(() => {
    if (filterTrade === 'All') return DENVER_VENDORS;
    return DENVER_VENDORS.filter(v => v.trade === filterTrade);
  }, [filterTrade]);

  const addedCompanies = useMemo(() => new Set(vendors.map(v => v.company)), [vendors]);

  if (loading) {
    return <div className="flex items-center justify-center h-64 text-gray-500">Loading vendors...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-start">
        <div>
          <h2 className="text-2xl font-bold text-navy dark:text-white">Vendor Roster</h2>
          <p className="text-gray-500 dark:text-slate-400 mt-1">Manage subcontractors and trade partners</p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => { setShowDirectory(!showDirectory); setShowAdd(false); }}
            className="flex items-center gap-1 px-3 py-2 bg-amber-600 text-white text-sm rounded-lg hover:bg-amber-700"
          >
            <MapPin className="w-4 h-4" /> Denver Directory
          </button>
          <button
            onClick={() => { setShowAdd(!showAdd); setShowDirectory(false); }}
            className="flex items-center gap-1 px-3 py-2 bg-navy text-white text-sm rounded-lg hover:bg-navy-light"
          >
            <Plus className="w-4 h-4" /> Add Vendor
          </button>
        </div>
      </div>

      {/* Denver Vendor Directory */}
      {showDirectory && (
        <div className="bg-amber-50 dark:bg-amber-950 rounded-xl border border-amber-200 dark:border-amber-800 p-5">
          <div className="flex items-center gap-2 mb-4">
            <Star className="w-5 h-5 text-amber-600" />
            <h3 className="font-semibold text-gray-900 dark:text-white">Denver Contractor Directory</h3>
          </div>
          <div className="flex gap-2 mb-4 flex-wrap">
            {TRADES.map(trade => (
              <button
                key={trade}
                onClick={() => setFilterTrade(trade)}
                className={`px-3 py-1 text-xs rounded-full font-medium transition-colors ${
                  filterTrade === trade
                    ? 'bg-amber-600 text-white'
                    : 'bg-white dark:bg-slate-800 text-gray-700 dark:text-slate-300 border border-gray-200 dark:border-slate-700 hover:bg-gray-50 dark:hover:bg-slate-700'
                }`}
              >
                {trade}
              </button>
            ))}
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
            {filteredDirectory.map((dv, i) => {
              const alreadyAdded = addedCompanies.has(dv.company);
              return (
                <div key={i} className="bg-white dark:bg-slate-800 rounded-lg border border-gray-200 dark:border-slate-700 p-3 flex flex-col">
                  <div className="flex items-start justify-between mb-1">
                    <div>
                      <span className="text-xs font-medium text-amber-700 dark:text-amber-400 bg-amber-100 dark:bg-amber-900 px-2 py-0.5 rounded-full">{dv.trade}</span>
                      <h4 className="font-semibold text-gray-900 dark:text-white text-sm mt-1">{dv.company}</h4>
                    </div>
                  </div>
                  {dv.phone && (
                    <p className="text-xs text-gray-500 dark:text-slate-400 flex items-center gap-1 mt-1">
                      <Phone className="w-3 h-3" /> {dv.phone}
                    </p>
                  )}
                  {dv.website && (
                    <p className="text-xs text-blue-600 dark:text-blue-400 mt-0.5">{dv.website}</p>
                  )}
                  {dv.notes && (
                    <p className="text-xs text-gray-500 dark:text-slate-400 mt-1">{dv.notes}</p>
                  )}
                  <button
                    onClick={() => addFromDirectory(dv)}
                    disabled={alreadyAdded}
                    className={`mt-auto pt-2 text-xs font-medium rounded-lg px-3 py-1.5 transition-colors ${
                      alreadyAdded
                        ? 'bg-gray-100 dark:bg-slate-700 text-gray-400 cursor-not-allowed'
                        : 'bg-navy text-white hover:bg-navy-light'
                    }`}
                  >
                    {alreadyAdded ? 'Already Added' : 'Add to Roster'}
                  </button>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {showAdd && (
        <div className="bg-white dark:bg-slate-800 rounded-xl border border-gray-200 dark:border-slate-700 p-4">
          <h3 className="font-semibold text-gray-900 dark:text-white mb-3">New Vendor</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            <input placeholder="Trade *" value={newVendor.trade} onChange={e => setNewVendor({...newVendor, trade: e.target.value})} className="px-3 py-2 border border-gray-300 dark:border-slate-600 dark:bg-slate-700 dark:text-white rounded-lg text-sm" />
            <input placeholder="Company" value={newVendor.company} onChange={e => setNewVendor({...newVendor, company: e.target.value})} className="px-3 py-2 border border-gray-300 dark:border-slate-600 dark:bg-slate-700 dark:text-white rounded-lg text-sm" />
            <input placeholder="Contact" value={newVendor.contact} onChange={e => setNewVendor({...newVendor, contact: e.target.value})} className="px-3 py-2 border border-gray-300 dark:border-slate-600 dark:bg-slate-700 dark:text-white rounded-lg text-sm" />
            <input placeholder="Phone" value={newVendor.phone} onChange={e => setNewVendor({...newVendor, phone: e.target.value})} className="px-3 py-2 border border-gray-300 dark:border-slate-600 dark:bg-slate-700 dark:text-white rounded-lg text-sm" />
            <input placeholder="Email" value={newVendor.email} onChange={e => setNewVendor({...newVendor, email: e.target.value})} className="px-3 py-2 border border-gray-300 dark:border-slate-600 dark:bg-slate-700 dark:text-white rounded-lg text-sm" />
            <input placeholder="Quote" type="number" value={newVendor.quote || ''} onChange={e => setNewVendor({...newVendor, quote: parseFloat(e.target.value) || 0})} className="px-3 py-2 border border-gray-300 dark:border-slate-600 dark:bg-slate-700 dark:text-white rounded-lg text-sm" />
            <select value={newVendor.status} onChange={e => setNewVendor({...newVendor, status: e.target.value as Vendor['status']})} className="px-3 py-2 border border-gray-300 dark:border-slate-600 dark:bg-slate-700 dark:text-white rounded-lg text-sm">
              {statusOptions.map(s => <option key={s} value={s}>{s}</option>)}
            </select>
            <div className="flex gap-2">
              <button onClick={addVendor} className="flex-1 px-3 py-2 bg-emerald-600 text-white text-sm rounded-lg hover:bg-emerald-700">Save</button>
              <button onClick={() => setShowAdd(false)} className="px-3 py-2 bg-gray-200 dark:bg-gray-600 text-gray-700 dark:text-slate-200 text-sm rounded-lg hover:bg-gray-300 dark:hover:bg-slate-500">Cancel</button>
            </div>
          </div>
        </div>
      )}

      <div className="bg-white dark:bg-slate-800 rounded-xl border border-gray-200 dark:border-slate-700 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-gray-50 dark:bg-slate-900 border-b border-gray-200 dark:border-slate-700">
                <th className="text-left py-3 px-4 font-semibold text-gray-700 dark:text-slate-300">Trade</th>
                <th className="text-left py-3 px-4 font-semibold text-gray-700 dark:text-slate-300">Company</th>
                <th className="text-left py-3 px-4 font-semibold text-gray-700 dark:text-slate-300">Contact</th>
                <th className="text-left py-3 px-4 font-semibold text-gray-700 dark:text-slate-300">Phone</th>
                <th className="text-left py-3 px-4 font-semibold text-gray-700 dark:text-slate-300">Email</th>
                <th className="text-right py-3 px-4 font-semibold text-gray-700 dark:text-slate-300">Quote</th>
                <th className="text-center py-3 px-4 font-semibold text-gray-700 dark:text-slate-300">Status</th>
                <th className="py-3 px-4"></th>
              </tr>
            </thead>
            <tbody>
              {vendors.map((vendor) => (
                <tr key={vendor.id} className="border-b border-gray-100 dark:border-slate-700 hover:bg-gray-50 dark:hover:bg-slate-700/50">
                  <td className="py-3 px-4 font-medium text-gray-900 dark:text-white">{vendor.trade}</td>
                  <td className="py-3 px-4">
                    {editingId === vendor.id ? (
                      <input value={editData.company || ''} onChange={e => setEditData({...editData, company: e.target.value})} className="w-full px-2 py-1 border border-gray-300 dark:border-slate-600 dark:bg-slate-700 dark:text-white rounded text-sm" />
                    ) : (
                      <span className="text-gray-700 dark:text-slate-300">{vendor.company || '—'}</span>
                    )}
                  </td>
                  <td className="py-3 px-4">
                    {editingId === vendor.id ? (
                      <input value={editData.contact || ''} onChange={e => setEditData({...editData, contact: e.target.value})} className="w-full px-2 py-1 border border-gray-300 dark:border-slate-600 dark:bg-slate-700 dark:text-white rounded text-sm" />
                    ) : (
                      <span className="text-gray-700 dark:text-slate-300">{vendor.contact || '—'}</span>
                    )}
                  </td>
                  <td className="py-3 px-4">
                    {editingId === vendor.id ? (
                      <input value={editData.phone || ''} onChange={e => setEditData({...editData, phone: e.target.value})} className="w-full px-2 py-1 border border-gray-300 dark:border-slate-600 dark:bg-slate-700 dark:text-white rounded text-sm" />
                    ) : (
                      <span className="text-gray-500 dark:text-slate-400">{vendor.phone || '—'}</span>
                    )}
                  </td>
                  <td className="py-3 px-4">
                    {editingId === vendor.id ? (
                      <input value={editData.email || ''} onChange={e => setEditData({...editData, email: e.target.value})} className="w-full px-2 py-1 border border-gray-300 dark:border-slate-600 dark:bg-slate-700 dark:text-white rounded text-sm" />
                    ) : (
                      <span className="text-gray-500 dark:text-slate-400">{vendor.email || '—'}</span>
                    )}
                  </td>
                  <td className="py-3 px-4 text-right">
                    {editingId === vendor.id ? (
                      <input type="number" value={editData.quote || ''} onChange={e => setEditData({...editData, quote: parseFloat(e.target.value) || 0})} className="w-24 px-2 py-1 border border-gray-300 dark:border-slate-600 dark:bg-slate-700 dark:text-white rounded text-sm text-right" />
                    ) : (
                      <span className="text-gray-700 dark:text-slate-300">{Number(vendor.quote) > 0 ? formatCurrency(Number(vendor.quote)) : '—'}</span>
                    )}
                  </td>
                  <td className="py-3 px-4 text-center">
                    {editingId === vendor.id ? (
                      <select value={editData.status} onChange={e => setEditData({...editData, status: e.target.value as Vendor['status']})} className="px-2 py-1 border border-gray-300 dark:border-slate-600 dark:bg-slate-700 dark:text-white rounded text-xs">
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
                        <button onClick={() => saveEdit(vendor.id)} className="p-1 text-emerald-600 hover:bg-emerald-50 dark:hover:bg-emerald-900/30 rounded"><Check className="w-4 h-4" /></button>
                        <button onClick={() => setEditingId(null)} className="p-1 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/30 rounded"><X className="w-4 h-4" /></button>
                      </div>
                    ) : (
                      <button onClick={() => startEdit(vendor)} className="p-1 text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-slate-700 rounded"><Pencil className="w-4 h-4" /></button>
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
