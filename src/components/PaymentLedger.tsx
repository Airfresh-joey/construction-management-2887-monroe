import { useState } from 'react';
import { useTable } from '../hooks/useSupabase';
import { formatCurrency, formatDate, statusColor } from '../lib/format';
import type { Payment } from '../types';
import { AlertTriangle, Plus, Check } from 'lucide-react';

export default function PaymentLedger() {
  const { data: payments, loading, update, insert } = useTable<Payment>('payments');
  const [showAdd, setShowAdd] = useState(false);
  const [newPayment, setNewPayment] = useState<Partial<Payment>>({
    payee: '', amount: 0, date: new Date().toISOString().split('T')[0], phase: '', method: '', lien_waiver: false, status: 'pending', notes: '',
  });

  const totalPaid = payments.filter(p => p.status === 'paid').reduce((s, p) => s + Number(p.amount), 0);
  const totalPending = payments.filter(p => p.status === 'pending').reduce((s, p) => s + Number(p.amount), 0);
  const missingWaivers = payments.filter(p => p.status === 'paid' && !p.lien_waiver);

  const toggleWaiver = async (payment: Payment) => {
    await update(payment.id, { lien_waiver: !payment.lien_waiver });
  };

  const toggleStatus = async (payment: Payment) => {
    if (payment.status === 'pending' && !payment.lien_waiver) {
      alert('Cannot mark as paid without a signed lien waiver. Check the lien waiver box first.');
      return;
    }
    const next = payment.status === 'pending' ? 'paid' : 'pending';
    await update(payment.id, { status: next });
  };

  const addPayment = async () => {
    if (!newPayment.payee || !newPayment.amount) return;
    await insert(newPayment);
    setNewPayment({ payee: '', amount: 0, date: new Date().toISOString().split('T')[0], phase: '', method: '', lien_waiver: false, status: 'pending', notes: '' });
    setShowAdd(false);
  };

  if (loading) {
    return <div className="flex items-center justify-center h-64 text-gray-500 dark:text-slate-400">Loading payments...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-start">
        <div>
          <h2 className="text-2xl font-bold text-navy dark:text-white">Payment Ledger</h2>
          <p className="text-gray-500 dark:text-slate-400 mt-1">Track all project payments and lien waivers</p>
        </div>
        <button
          onClick={() => setShowAdd(!showAdd)}
          className="flex items-center gap-1 px-3 py-2 bg-navy text-white text-sm rounded-lg hover:bg-navy-light"
        >
          <Plus className="w-4 h-4" /> Add Payment
        </button>
      </div>

      {/* Lien waiver warning */}
      {missingWaivers.length > 0 && (
        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl p-4 flex items-start gap-3">
          <AlertTriangle className="w-5 h-5 text-red-600 dark:text-red-400 flex-shrink-0 mt-0.5" />
          <div>
            <p className="font-semibold text-red-800 dark:text-red-300">Lien Waiver Warning</p>
            <p className="text-sm text-red-700 dark:text-red-400 mt-1">
              {missingWaivers.length} payment{missingWaivers.length > 1 ? 's' : ''} marked as paid without a signed lien waiver:
              {' '}{missingWaivers.map(p => p.payee).join(', ')}
            </p>
          </div>
        </div>
      )}

      {/* Summary cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white dark:bg-slate-800 rounded-xl border border-gray-200 dark:border-slate-700 p-4">
          <p className="text-sm text-gray-500 dark:text-slate-400">Total Paid</p>
          <p className="text-2xl font-bold text-emerald-600 dark:text-emerald-400">{formatCurrency(totalPaid)}</p>
        </div>
        <div className="bg-white dark:bg-slate-800 rounded-xl border border-gray-200 dark:border-slate-700 p-4">
          <p className="text-sm text-gray-500 dark:text-slate-400">Pending</p>
          <p className="text-2xl font-bold text-amber-600 dark:text-amber-400">{formatCurrency(totalPending)}</p>
        </div>
        <div className="bg-white dark:bg-slate-800 rounded-xl border border-gray-200 dark:border-slate-700 p-4">
          <p className="text-sm text-gray-500 dark:text-slate-400">Total Payments</p>
          <p className="text-2xl font-bold text-gray-900 dark:text-white">{payments.length}</p>
        </div>
      </div>

      {/* Add payment form */}
      {showAdd && (
        <div className="bg-white dark:bg-slate-800 rounded-xl border border-gray-200 dark:border-slate-700 p-4">
          <h3 className="font-semibold text-gray-900 dark:text-white mb-3">New Payment</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            <input placeholder="Payee *" value={newPayment.payee} onChange={e => setNewPayment({...newPayment, payee: e.target.value})} className="px-3 py-2 border border-gray-300 dark:border-slate-600 dark:bg-slate-700 dark:text-white rounded-lg text-sm" />
            <input placeholder="Amount *" type="number" value={newPayment.amount || ''} onChange={e => setNewPayment({...newPayment, amount: parseFloat(e.target.value) || 0})} className="px-3 py-2 border border-gray-300 dark:border-slate-600 dark:bg-slate-700 dark:text-white rounded-lg text-sm" />
            <input type="date" value={newPayment.date} onChange={e => setNewPayment({...newPayment, date: e.target.value})} className="px-3 py-2 border border-gray-300 dark:border-slate-600 dark:bg-slate-700 dark:text-white rounded-lg text-sm" />
            <input placeholder="Phase" value={newPayment.phase} onChange={e => setNewPayment({...newPayment, phase: e.target.value})} className="px-3 py-2 border border-gray-300 dark:border-slate-600 dark:bg-slate-700 dark:text-white rounded-lg text-sm" />
            <input placeholder="Method (Check, ACH, etc.)" value={newPayment.method} onChange={e => setNewPayment({...newPayment, method: e.target.value})} className="px-3 py-2 border border-gray-300 dark:border-slate-600 dark:bg-slate-700 dark:text-white rounded-lg text-sm" />
            <input placeholder="Notes" value={newPayment.notes} onChange={e => setNewPayment({...newPayment, notes: e.target.value})} className="px-3 py-2 border border-gray-300 dark:border-slate-600 dark:bg-slate-700 dark:text-white rounded-lg text-sm" />
            <label className="flex items-center gap-2 px-3 py-2 text-sm text-gray-700 dark:text-slate-300">
              <input type="checkbox" checked={newPayment.lien_waiver || false} onChange={e => setNewPayment({...newPayment, lien_waiver: e.target.checked})} className="w-4 h-4" />
              Lien Waiver Signed
            </label>
            <div className="flex gap-2">
              <button onClick={addPayment} className="flex-1 px-3 py-2 bg-emerald-600 text-white text-sm rounded-lg hover:bg-emerald-700">Save</button>
              <button onClick={() => setShowAdd(false)} className="px-3 py-2 bg-gray-200 dark:bg-slate-600 text-gray-700 dark:text-slate-200 text-sm rounded-lg hover:bg-gray-300 dark:hover:bg-slate-500">Cancel</button>
            </div>
          </div>
        </div>
      )}

      {/* Payments table */}
      <div className="bg-white dark:bg-slate-800 rounded-xl border border-gray-200 dark:border-slate-700 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-gray-50 dark:bg-slate-900 border-b border-gray-200 dark:border-slate-700">
                <th className="text-left py-3 px-4 font-semibold text-gray-700 dark:text-slate-300">Payee</th>
                <th className="text-right py-3 px-4 font-semibold text-gray-700 dark:text-slate-300">Amount</th>
                <th className="text-left py-3 px-4 font-semibold text-gray-700 dark:text-slate-300">Date</th>
                <th className="text-left py-3 px-4 font-semibold text-gray-700 dark:text-slate-300">Phase</th>
                <th className="text-left py-3 px-4 font-semibold text-gray-700 dark:text-slate-300">Method</th>
                <th className="text-center py-3 px-4 font-semibold text-gray-700 dark:text-slate-300">Lien Waiver</th>
                <th className="text-center py-3 px-4 font-semibold text-gray-700 dark:text-slate-300">Status</th>
                <th className="text-left py-3 px-4 font-semibold text-gray-700 dark:text-slate-300">Notes</th>
              </tr>
            </thead>
            <tbody>
              {payments.map((payment) => (
                <tr key={payment.id} className={`border-b border-gray-100 dark:border-slate-700 hover:bg-gray-50 dark:hover:bg-slate-700/50 ${payment.status === 'paid' && !payment.lien_waiver ? 'bg-red-50 dark:bg-red-900/10' : ''}`}>
                  <td className="py-3 px-4 font-medium text-gray-900 dark:text-white">{payment.payee}</td>
                  <td className="py-3 px-4 text-right text-gray-700 dark:text-slate-300">{formatCurrency(Number(payment.amount))}</td>
                  <td className="py-3 px-4 text-gray-500 dark:text-slate-400">{formatDate(payment.date)}</td>
                  <td className="py-3 px-4 text-gray-500 dark:text-slate-400">{payment.phase}</td>
                  <td className="py-3 px-4 text-gray-500 dark:text-slate-400">{payment.method}</td>
                  <td className="py-3 px-4 text-center">
                    <button onClick={() => toggleWaiver(payment)} className={`w-6 h-6 rounded border-2 inline-flex items-center justify-center ${payment.lien_waiver ? 'bg-emerald-500 border-emerald-500 text-white' : 'border-gray-300 dark:border-slate-600 hover:border-gray-400 dark:hover:border-slate-500'}`}>
                      {payment.lien_waiver && <Check className="w-4 h-4" />}
                    </button>
                  </td>
                  <td className="py-3 px-4 text-center">
                    <button
                      onClick={() => toggleStatus(payment)}
                      className={`px-3 py-0.5 rounded-full text-xs font-medium ${statusColor(payment.status)} hover:opacity-80`}
                    >
                      {payment.status}
                    </button>
                  </td>
                  <td className="py-3 px-4 text-gray-500 dark:text-slate-400 text-xs max-w-[200px] truncate">{payment.notes}</td>
                </tr>
              ))}
            </tbody>
            <tfoot>
              <tr className="bg-gray-50 dark:bg-slate-900 border-t-2 border-gray-300 dark:border-slate-600 font-bold">
                <td className="py-3 px-4 text-gray-900 dark:text-white">TOTAL</td>
                <td className="py-3 px-4 text-right text-gray-900 dark:text-white">{formatCurrency(totalPaid + totalPending)}</td>
                <td colSpan={6}></td>
              </tr>
            </tfoot>
          </table>
        </div>
      </div>
    </div>
  );
}
