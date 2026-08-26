import React, { useState, useEffect } from 'react';
import { UserPlus, Search, Trash2, ShieldCheck, User, Briefcase, Shield, X, Sparkles, Phone, Mail, Globe, ChevronLeft, ChevronRight } from 'lucide-react';
import { PortalLayout } from '../../components/PortalLayout';

export const UsersManagement = () => {
  const [users, setUsers] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [roleFilter, setRoleFilter] = useState('all');
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;

  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, roleFilter]);

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    role: 'customer',
    country: 'United States',
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&q=80'
  });

  useEffect(() => {
    fetch('/api/users')
      .then(res => res.json())
      .then(data => setUsers(data))
      .catch(() => {});
  }, []);

  const handleRoleChange = async (id, newRole) => {
    try {
      const res = await fetch(`/api/users/${id}/role`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ role: newRole })
      });
      if (res.ok) {
        const updated = await res.json();
        setUsers(prev => prev.map(u => u.id === id ? updated : u));
      } else {
        setUsers(prev => prev.map(u => u.id === id ? { ...u, role: newRole } : u));
      }
    } catch (e) {
      setUsers(prev => prev.map(u => u.id === id ? { ...u, role: newRole } : u));
    }
  };

  const handleDeleteUser = async (id) => {
    if (!window.confirm('Are you sure you want to delete this user account?')) return;
    try {
      await fetch(`/api/users/${id}`, { method: 'DELETE' });
    } catch (e) {}
    setUsers(prev => prev.filter(u => u.id !== id));
  };

  const handleAddUser = async (e) => {
    e.preventDefault();
    if (!formData.name.trim() || !formData.email.trim()) return;
    setLoading(true);

    try {
      const res = await fetch('/api/users', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });

      if (res.ok) {
        const createdUser = await res.json();
        setUsers([createdUser, ...users]);
      } else {
        const fallbackUser = {
          id: `u_${Date.now()}`,
          ...formData,
          memberSince: '2026'
        };
        setUsers([fallbackUser, ...users]);
      }
    } catch (err) {
      const fallbackUser = {
        id: `u_${Date.now()}`,
        ...formData,
        memberSince: '2026'
      };
      setUsers([fallbackUser, ...users]);
    } finally {
      setLoading(false);
      setIsAddModalOpen(false);
      setFormData({
        name: '',
        email: '',
        phone: '',
        role: 'customer',
        country: 'United States',
        avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&q=80'
      });
    }
  };

  const filteredUsers = users.filter(u => {
    const matchesSearch = 
      u.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      u.email?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      u.phone?.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesRole = roleFilter === 'all' || u.role === roleFilter;

    return matchesSearch && matchesRole;
  });

  const totalPages = Math.ceil(filteredUsers.length / itemsPerPage);
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentUsers = filteredUsers.slice(indexOfFirstItem, indexOfLastItem);

  const totalUsers = users.length;
  const customersCount = users.filter(u => u.role === 'customer').length;
  const partnersCount = users.filter(u => u.role === 'partner').length;
  const adminsCount = users.filter(u => u.role === 'admin').length;

  return (
    <PortalLayout role="admin" title="User & Role Management">
      {/* Header & Add User Action */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-extrabold text-[var(--text-primary)]">User & Role Management</h1>
          <p className="text-xs text-[var(--text-secondary)]">Manage registered customers, hotel partners, and admin privileges dynamically</p>
        </div>
        <button 
          onClick={() => setIsAddModalOpen(true)}
          className="btn btn-primary text-xs py-2.5 px-5 flex items-center gap-2 self-start sm:self-auto shadow-lg shadow-amber-500/25 hover:scale-[1.02] transition-all cursor-pointer"
        >
          <UserPlus className="w-4 h-4 stroke-[3]" /> Add Registered Member
        </button>
      </div>

      {/* KPI Role Stats Badges */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4 text-xs font-bold">
        <div 
          onClick={() => setRoleFilter('all')} 
          className={`p-4 rounded-2xl border transition-all cursor-pointer ${
            roleFilter === 'all' 
              ? 'bg-amber-500/15 border-amber-500 text-amber-500 shadow-sm' 
              : 'bg-[var(--bg-card)] border-[var(--border-light)] text-[var(--text-secondary)] hover:border-amber-500/40'
          }`}
        >
          <div className="flex items-center justify-between">
            <span>Total Accounts</span>
            <User className="w-4 h-4 text-amber-500" />
          </div>
          <span className="text-xl font-extrabold text-[var(--text-primary)] block mt-1">{totalUsers}</span>
        </div>

        <div 
          onClick={() => setRoleFilter('customer')} 
          className={`p-4 rounded-2xl border transition-all cursor-pointer ${
            roleFilter === 'customer' 
              ? 'bg-amber-500/15 border-amber-500 text-amber-500 shadow-sm' 
              : 'bg-[var(--bg-card)] border-[var(--border-light)] text-[var(--text-secondary)] hover:border-amber-500/40'
          }`}
        >
          <div className="flex items-center justify-between">
            <span>Customers</span>
            <User className="w-4 h-4 text-amber-500" />
          </div>
          <span className="text-xl font-extrabold text-[var(--text-primary)] block mt-1">{customersCount}</span>
        </div>

        <div 
          onClick={() => setRoleFilter('partner')} 
          className={`p-4 rounded-2xl border transition-all cursor-pointer ${
            roleFilter === 'partner' 
              ? 'bg-emerald-500/15 border-emerald-500 text-emerald-500 shadow-sm' 
              : 'bg-[var(--bg-card)] border-[var(--border-light)] text-[var(--text-secondary)] hover:border-emerald-500/40'
          }`}
        >
          <div className="flex items-center justify-between">
            <span>Hotel Partners</span>
            <Briefcase className="w-4 h-4 text-emerald-500" />
          </div>
          <span className="text-xl font-extrabold text-[var(--text-primary)] block mt-1">{partnersCount}</span>
        </div>

        <div 
          onClick={() => setRoleFilter('admin')} 
          className={`p-4 rounded-2xl border transition-all cursor-pointer ${
            roleFilter === 'admin' 
              ? 'bg-indigo-500/15 border-indigo-500 text-indigo-500 shadow-sm' 
              : 'bg-[var(--bg-card)] border-[var(--border-light)] text-[var(--text-secondary)] hover:border-indigo-500/40'
          }`}
        >
          <div className="flex items-center justify-between">
            <span>Super Admins</span>
            <Shield className="w-4 h-4 text-indigo-500" />
          </div>
          <span className="text-xl font-extrabold text-[var(--text-primary)] block mt-1">{adminsCount}</span>
        </div>
      </div>

      {/* Search & Filter Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="relative w-full sm:w-80">
          <input 
            type="text" 
            placeholder="Search member name, email or phone..." 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 rounded-2xl bg-[var(--bg-card)] border border-[var(--border-light)] text-xs font-semibold text-[var(--text-primary)] outline-none focus:border-amber-500 transition-colors shadow-xs"
          />
          <Search className="w-4 h-4 text-[var(--text-muted)] absolute left-3.5 top-3" />
        </div>

        <div className="text-xs font-bold text-[var(--text-muted)]">
          Showing {filteredUsers.length} of {users.length} members
        </div>
      </div>

      {/* Users Data Table */}
      <div className="space-y-6">
        <div className="rounded-3xl bg-[var(--bg-card)] border border-[var(--border-light)] overflow-hidden shadow-lg p-2 sm:p-4">
          <div className="table-responsive">
            <table className="custom-table">
              <thead>
                <tr>
                  <th className="pl-6">Member Profile</th>
                  <th>Contact Info</th>
                  <th>System Role & Authority</th>
                  <th className="pr-6 text-right">Change Role & Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[var(--border-light)]">
                {currentUsers.map(u => (
                  <tr key={u.id} className="transition-all hover:bg-[var(--bg-tertiary)]/30">
                    <td className="pl-6 font-bold text-[var(--text-primary)]">
                      <div className="flex items-center gap-2.5">
                        <img 
                          src={u.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&q=80'} 
                          alt="" 
                          className="w-8 h-8 rounded-full object-cover border-2 border-amber-500 flex-shrink-0" 
                        />
                        <div>
                          <span className="block text-sm font-extrabold text-[var(--text-primary)]">{u.name}</span>
                          {u.country && (
                            <span className="text-[10px] text-[var(--text-muted)] block font-bold">{u.country}</span>
                          )}
                        </div>
                      </div>
                    </td>
                    <td>
                      <div className="space-y-0.5">
                        <span className="text-xs font-semibold text-[var(--text-secondary)] block">{u.email}</span>
                        <span className="text-[10px] text-[var(--text-muted)] font-bold block">{u.phone || 'No phone'}</span>
                      </div>
                    </td>
                    <td>
                      <div className="flex items-center gap-2">
                        <span className={`badge ${
                          u.role === 'admin' ? 'badge-navy bg-indigo-500/15 text-indigo-400 border border-indigo-500/30' :
                          u.role === 'partner' ? 'badge-emerald' : 'badge-gold'
                        }`}>
                          {u.role === 'admin' ? 'Super Admin' : u.role === 'partner' ? 'Hotel Partner' : 'Customer'}
                        </span>
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 text-[9px] font-black uppercase tracking-wider">
                          <ShieldCheck className="w-3 h-3" /> Active
                        </span>
                      </div>
                    </td>
                    <td className="pr-6">
                      <div className="flex items-center justify-end gap-2">
                        <select 
                          value={u.role} 
                          onChange={(e) => handleRoleChange(u.id, e.target.value)}
                          className="p-2.5 py-1.5 rounded-xl bg-[var(--bg-tertiary)] border border-[var(--border-light)] text-xs font-bold text-[var(--text-primary)] outline-none cursor-pointer hover:border-amber-500 transition-colors shadow-xs"
                        >
                          <option value="customer" className="bg-[var(--bg-card)] text-[var(--text-primary)]">Customer</option>
                          <option value="partner" className="bg-[var(--bg-card)] text-[var(--text-primary)]">Hotel Partner</option>
                          <option value="admin" className="bg-[var(--bg-card)] text-[var(--text-primary)]">Super Admin</option>
                        </select>
                        <button 
                          onClick={() => handleDeleteUser(u.id)}
                          className="p-1.5 rounded-xl text-red-400 hover:bg-red-500/15 transition-colors cursor-pointer"
                          title="Delete User Account"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Pagination Controls */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between pt-4 border-t border-[var(--border-light)]">
            <button
              onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
              disabled={currentPage === 1}
              className="btn btn-outline text-xs px-4 py-2 flex items-center gap-1.5 disabled:opacity-50 cursor-pointer"
            >
              <ChevronLeft className="w-4 h-4" /> Prev
            </button>
            
            <div className="flex items-center gap-1">
              {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
                <button
                  key={page}
                  onClick={() => setCurrentPage(page)}
                  className={`w-9 h-9 rounded-xl text-xs font-black transition-all cursor-pointer ${
                    currentPage === page 
                      ? 'bg-amber-500 text-white shadow-md' 
                      : 'bg-transparent text-[var(--text-secondary)] border border-[var(--border-light)] hover:border-amber-500/40'
                  }`}
                >
                  {page}
                </button>
              ))}
            </div>

            <button
              onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
              disabled={currentPage === totalPages}
              className="btn btn-outline text-xs px-4 py-2 flex items-center gap-1.5 disabled:opacity-50 cursor-pointer"
            >
              Next <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        )}
      </div>

      {/* ADD MEMBER MODAL */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/75 backdrop-blur-md animate-fade-in">
          <div className="w-full max-w-lg bg-[var(--bg-card)] border border-[var(--border-light)] rounded-3xl shadow-2xl overflow-hidden">
            
            <div className="px-6 py-4 border-b border-[var(--border-light)] flex items-center justify-between bg-[var(--bg-tertiary)]">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-amber-500/15 text-amber-500 flex items-center justify-center">
                  <UserPlus className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-base font-extrabold text-[var(--text-primary)]">Add New Platform Member</h3>
                  <p className="text-[11px] text-[var(--text-muted)]">Register a new customer, hotel partner, or admin account</p>
                </div>
              </div>
              <button 
                onClick={() => setIsAddModalOpen(false)}
                className="p-1.5 rounded-full hover:bg-[var(--border-light)] text-[var(--text-muted)] transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleAddUser} className="p-6 space-y-4 text-xs font-semibold">
              <div>
                <label className="block text-amber-500 font-extrabold uppercase tracking-wider mb-1">
                  Full Name *
                </label>
                <input 
                  type="text" 
                  required
                  placeholder="e.g. Alex Morgan" 
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full p-3 rounded-xl bg-[var(--bg-tertiary)] border border-[var(--border-light)] text-[var(--text-primary)] outline-none font-bold"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-[var(--text-secondary)] font-bold mb-1">
                    Email Address *
                  </label>
                  <input 
                    type="email" 
                    required
                    placeholder="alex@example.com" 
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className="w-full p-3 rounded-xl bg-[var(--bg-tertiary)] border border-[var(--border-light)] text-[var(--text-primary)] outline-none font-bold"
                  />
                </div>

                <div>
                  <label className="block text-[var(--text-secondary)] font-bold mb-1">
                    Phone Number
                  </label>
                  <input 
                    type="text" 
                    placeholder="+1 (555) 234-5678" 
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    className="w-full p-3 rounded-xl bg-[var(--bg-tertiary)] border border-[var(--border-light)] text-[var(--text-primary)] outline-none font-bold"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-[var(--text-secondary)] font-bold mb-1">
                    Assign Role
                  </label>
                  <select 
                    value={formData.role}
                    onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                    className="w-full p-3 rounded-xl bg-[var(--bg-tertiary)] border border-[var(--border-light)] text-[var(--text-primary)] outline-none font-bold cursor-pointer"
                  >
                    <option value="customer" className="bg-[var(--bg-card)] text-[var(--text-primary)]">Customer</option>
                    <option value="partner" className="bg-[var(--bg-card)] text-[var(--text-primary)]">Hotel Partner</option>
                    <option value="admin" className="bg-[var(--bg-card)] text-[var(--text-primary)]">Super Admin</option>
                  </select>
                </div>

                <div>
                  <label className="block text-[var(--text-secondary)] font-bold mb-1">
                    Country
                  </label>
                  <input 
                    type="text" 
                    placeholder="United States" 
                    value={formData.country}
                    onChange={(e) => setFormData({ ...formData, country: e.target.value })}
                    className="w-full p-3 rounded-xl bg-[var(--bg-tertiary)] border border-[var(--border-light)] text-[var(--text-primary)] outline-none font-bold"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[var(--text-secondary)] font-bold mb-1">
                  Avatar Image URL
                </label>
                <input 
                  type="url" 
                  placeholder="https://images.unsplash.com/..." 
                  value={formData.avatar}
                  onChange={(e) => setFormData({ ...formData, avatar: e.target.value })}
                  className="w-full p-3 rounded-xl bg-[var(--bg-tertiary)] border border-[var(--border-light)] text-[var(--text-primary)] outline-none font-bold"
                />
              </div>

              <div className="pt-3 border-t border-[var(--border-light)] flex items-center justify-end gap-3">
                <button 
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="px-5 py-2.5 rounded-xl border border-[var(--border-light)] bg-[var(--bg-tertiary)] text-[var(--text-primary)] font-bold hover:bg-[var(--border-light)] transition-colors"
                >
                  Cancel
                </button>
                <button 
                  type="submit"
                  disabled={loading}
                  className="btn btn-primary px-6 py-2.5 text-xs font-extrabold flex items-center gap-2 shadow-lg shadow-amber-500/25"
                >
                  {loading ? 'Registering...' : '+ Register Member'}
                </button>
              </div>

            </form>
          </div>
        </div>
      )}
    </PortalLayout>
  );
};
