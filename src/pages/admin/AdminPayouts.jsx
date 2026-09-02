import React, { useState, useEffect } from 'react';
import { DollarSign, CheckCircle, Clock, XCircle, Building2, CreditCard, ShieldCheck, ArrowUpRight, Wallet } from 'lucide-react';
import { PortalLayout } from '../../components/PortalLayout';
import { useCurrency } from '../../context/CurrencyContext';

export const AdminPayouts = () => {
  const { formatPrice } = useCurrency();
  const [payouts, setPayouts] = useState([]);
  const [bookings, setBookings] = useState([]);

  const fetchData = () => {
    fetch('/api/payouts')
      .then(res => res.json())
      .then(data => setPayouts(Array.isArray(data) ? data : []))
      .catch(() => setPayouts([]));

    fetch('/api/bookings')
      .then(res => res.json())
      .then(data => setBookings(Array.isArray(data) ? data : []))
      .catch(() => setBookings([]));
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleStatusChange = async (id, status) => {
    try {
      const res = await fetch(`/api/payouts/${id}/status`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status })
      });

      if (res.ok) {
        const updated = await res.json();
        setPayouts(prev => prev.map(p => p.id === id ? updated : p));
      }
    } catch (e) {}
  };

  const totalGross = bookings.filter(b => b.status !== 'Cancelled').reduce((sum, b) => sum + (b.total || 0), 0);
  const adminCommission = Math.round(totalGross * 0.15); // 15% Admin Profit
  const partnerNetShare = Math.round(totalGross * 0.85); // 85% Partner Share

  const totalPaidOut = payouts.filter(p => p.status === 'Completed').reduce((sum, p) => sum + p.amount, 0);
  const totalPendingPayouts = payouts.filter(p => p.status === 'Pending').reduce((sum, p) => sum + p.amount, 0);

  const safePayouts = Array.isArray(payouts) ? payouts : [];
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;

  const totalPages = Math.ceil(safePayouts.length / itemsPerPage);
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentPayouts = safePayouts.slice(indexOfFirstItem, indexOfLastItem);

  const renderStatusBadge = (status) => {
    switch (status) {
      case 'Completed':
      case 'Approved':
        return <span className="badge badge-emerald flex items-center gap-1"><CheckCircle className="w-3 h-3" /> Transferred</span>;
      case 'Pending':
        return <span className="badge badge-gold flex items-center gap-1"><Clock className="w-3 h-3" /> Action Required</span>;
      case 'Rejected':
        return <span className="badge bg-rose-500/15 text-rose-400 border border-rose-500/30">Rejected</span>;
      default:
        return <span className="badge badge-navy">{status}</span>;
    }
  };

  return (
    <PortalLayout role="admin" title="Hotel Owner Payouts & Commission Center">
      {/* Header */}
      <div>
        <h1 className="text-xl sm:text-2xl font-extrabold text-[var(--text-primary)]">Hotel Owner Payouts & Settlement Center</h1>
        <p className="text-xs text-[var(--text-secondary)]">Review, process, and approve hotel owner wallet withdrawal requests</p>
      </div>

      {/* 4 Summary Cards - Clean Unified Luxury White Layout */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
        
        {/* Total Platform Volume */}
        <div className="p-5 sm:p-6 rounded-2xl bg-[var(--bg-card)] border border-[var(--border-light)] shadow-xs hover:border-amber-500/40 transition-all flex flex-col justify-between space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-extrabold uppercase tracking-wider text-[var(--text-muted)]">Total Platform Volume</span>
            <div className="w-10 h-10 rounded-xl bg-amber-500/15 text-amber-500 border border-amber-500/20 flex items-center justify-center">
              <DollarSign className="w-5 h-5" />
            </div>
          </div>
          <div>
            <span className="text-2xl sm:text-3xl font-extrabold text-[var(--text-primary)]">{formatPrice(totalGross)}</span>
            <span className="block text-xs text-amber-500 font-bold mt-1">Marketplace Gross Volume</span>
          </div>
        </div>

        {/* Admin 15% Commission Retained */}
        <div className="p-5 sm:p-6 rounded-2xl bg-[var(--bg-card)] border border-[var(--border-light)] shadow-xs hover:border-amber-500/40 transition-all flex flex-col justify-between space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-extrabold uppercase tracking-wider text-[var(--text-muted)]">Admin 15% Net Profit</span>
            <div className="w-10 h-10 rounded-xl bg-amber-500/15 text-amber-500 border border-amber-500/20 flex items-center justify-center">
              <ShieldCheck className="w-5 h-5" />
            </div>
          </div>
          <div>
            <span className="text-2xl sm:text-3xl font-extrabold text-emerald-500">{formatPrice(adminCommission)}</span>
            <span className="block text-xs text-[var(--text-secondary)] font-semibold mt-1">Platform Marketplace Retained</span>
          </div>
        </div>

        {/* Pending Payout Requests */}
        <div className="p-5 sm:p-6 rounded-2xl bg-[var(--bg-card)] border border-[var(--border-light)] shadow-xs hover:border-amber-500/40 transition-all flex flex-col justify-between space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-extrabold uppercase tracking-wider text-[var(--text-muted)]">Pending Approvals</span>
            <div className="w-10 h-10 rounded-xl bg-amber-500/15 text-amber-500 border border-amber-500/20 flex items-center justify-center">
              <Clock className="w-5 h-5" />
            </div>
          </div>
          <div>
            <span className="text-2xl sm:text-3xl font-extrabold text-[var(--text-primary)]">{formatPrice(totalPendingPayouts)}</span>
            <span className="block text-xs text-[var(--text-secondary)] font-semibold mt-1">Awaiting Admin Processing</span>
          </div>
        </div>

        {/* Total Settled to Partners */}
        <div className="p-5 sm:p-6 rounded-2xl bg-[var(--bg-card)] border border-[var(--border-light)] shadow-xs hover:border-amber-500/40 transition-all flex flex-col justify-between space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-extrabold uppercase tracking-wider text-[var(--text-muted)]">Total Settled</span>
            <div className="w-10 h-10 rounded-xl bg-amber-500/15 text-amber-500 border border-amber-500/20 flex items-center justify-center">
              <CheckCircle className="w-5 h-5" />
            </div>
          </div>
          <div>
            <span className="text-2xl sm:text-3xl font-extrabold text-[var(--text-primary)]">{formatPrice(totalPaidOut)}</span>
            <span className="block text-xs text-[var(--text-secondary)] font-semibold mt-1">Paid to Partners</span>
          </div>
        </div>

      </div>

      {/* Payout Requests Data Table */}
      <div className="rounded-3xl bg-[var(--bg-card)] border border-[var(--border-light)] overflow-hidden shadow-lg space-y-4 p-6">
        <div className="flex items-center justify-between pb-4 border-b border-[var(--border-light)]">
          <div>
            <h3 className="text-base font-extrabold text-[var(--text-primary)]">Partner Cashout Requests Ledger</h3>
            <p className="text-xs text-[var(--text-secondary)]">Review banking details and confirm payout transfers</p>
          </div>
          <span className="badge badge-navy">{safePayouts.length} Requests</span>
        </div>

        <div className="table-responsive">
          <table className="custom-table">
            <thead>
              <tr>
                <th>Payout Ref</th>
                <th>Partner Name</th>
                <th>Requested Amount</th>
                <th>Payment Channel</th>
                <th>Bank & Beneficiary Account Details</th>
                <th>Status</th>
                <th>Admin Quick Actions</th>
              </tr>
            </thead>
            <tbody>
              {currentPayouts.map(po => (
                <tr key={po.id}>
                  <td className="font-mono font-bold text-amber-500">{po.id}</td>
                  <td className="font-bold text-[var(--text-primary)]">{po.partnerName}</td>
                  <td className="font-extrabold text-emerald-500 text-sm">{formatPrice(po.amount)}</td>
                  <td>
                    <span className="badge badge-navy text-[11px]">{po.method}</span>
                  </td>
                  <td className="text-xs">
                    <div className="font-bold text-[var(--text-primary)]">{po.accountName}</div>
                    <div className="text-[11px] text-[var(--text-muted)] font-mono">{po.accountDetails}</div>
                    <div className="text-[10px] text-amber-500 font-semibold">{po.bankName}</div>
                  </td>
                  <td>{renderStatusBadge(po.status)}</td>
                  <td>
                    {po.status === 'Pending' ? (
                      <div className="flex items-center gap-2">
                        <button 
                          onClick={() => handleStatusChange(po.id, 'Completed')}
                          className="btn btn-primary text-[10px] py-1.5 px-3 bg-emerald-500 hover:bg-emerald-600 shadow-md flex items-center gap-1 cursor-pointer"
                        >
                          <CheckCircle className="w-3.5 h-3.5" /> Approve & Transfer
                        </button>
                        <button 
                          onClick={() => handleStatusChange(po.id, 'Rejected')}
                          className="btn btn-outline text-[10px] py-1.5 px-2.5 text-rose-500 border-rose-500/30 hover:bg-rose-500 hover:text-white cursor-pointer"
                        >
                          Reject
                        </button>
                      </div>
                    ) : (
                      <span className="text-xs text-[var(--text-muted)] font-semibold">Processed</span>
                    )}
                  </td>
                </tr>
              ))}

              {safePayouts.length === 0 && (
                <tr>
                  <td colSpan="7" className="py-12 text-center text-xs text-[var(--text-muted)]">
                    No partner cashout requests found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination Controls */}
        {totalPages > 1 && (
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-4 border-t border-[var(--border-light)] text-xs font-bold text-[var(--text-secondary)]">
            <span>
              Showing <strong className="text-[var(--text-primary)]">{indexOfFirstItem + 1}</strong>–<strong className="text-[var(--text-primary)]">{Math.min(indexOfLastItem, safePayouts.length)}</strong> of <strong className="text-[var(--text-primary)]">{safePayouts.length}</strong> Payout Requests
            </span>

            <div className="flex items-center gap-1.5">
              <button
                onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                disabled={currentPage === 1}
                className="px-3 py-1.5 rounded-xl border border-[var(--border-light)] bg-[var(--bg-card)] text-[var(--text-primary)] hover:bg-[var(--bg-tertiary)] disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer transition-all font-bold"
              >
                Prev
              </button>

              {Array.from({ length: totalPages }, (_, i) => i + 1).map(pageNum => (
                <button
                  key={pageNum}
                  onClick={() => setCurrentPage(pageNum)}
                  className={`w-8 h-8 rounded-xl font-black text-xs transition-all cursor-pointer flex items-center justify-center ${
                    currentPage === pageNum
                      ? 'bg-amber-500 text-white shadow-xs scale-105'
                      : 'bg-[var(--bg-card)] border border-[var(--border-light)] text-[var(--text-primary)] hover:bg-[var(--bg-tertiary)]'
                  }`}
                >
                  {pageNum}
                </button>
              ))}

              <button
                onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                disabled={currentPage === totalPages}
                className="px-3 py-1.5 rounded-xl border border-[var(--border-light)] bg-[var(--bg-card)] text-[var(--text-primary)] hover:bg-[var(--bg-tertiary)] disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer transition-all font-bold"
              >
                Next
              </button>
            </div>
          </div>
        )}
      </div>
    </PortalLayout>
  );
};
