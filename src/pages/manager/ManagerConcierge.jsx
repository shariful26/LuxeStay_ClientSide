import React, { useState, useEffect } from 'react';
import { UserCheck, ShieldAlert, CheckCircle, Clock, Plus, X, Search, Filter, Phone, Mail, FileText, Settings, PlusCircle, HelpCircle, Save } from 'lucide-react';
import { PortalLayout } from '../../components/PortalLayout';
import { useAuth } from '../../context/AuthContext';

import { getInstantData } from '../../utils/instantCache';

export const ManagerConcierge = () => {
  const { user } = useAuth();
  
  // Navigation tabs: 'staff' (Directory/Roster) or 'requests' (Guest Requests logs)
  const [activeTab, setActiveTab] = useState('staff');
  
  // Staff Directory states
  const [staff, setStaff] = useState(() => getInstantData('concierge_staff', []));
  const [positionFilter, setPositionFilter] = useState('All');
  const [statusFilter, setStatusFilter] = useState('All');
  const [scheduleFilter, setScheduleFilter] = useState('All');
  const [staffSearch, setStaffSearch] = useState('');
  const [isStaffModalOpen, setIsStaffModalOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  const [staffForm, setStaffForm] = useState({
    name: '',
    position: 'Head Concierge',
    schedule: 'Monday - Friday | 8 AM - 4 PM',
    contact: '+1 (555) 123-4567',
    email: '',
    status: 'Active'
  });

  // Guest Requests states
  const [requests, setRequests] = useState(() => getInstantData('concierge_requests', []));
  const [requestSearch, setRequestSearch] = useState('');

  const fetchData = async () => {
    try {
      const [staffRes, reqRes] = await Promise.all([
        fetch('/api/concierge'),
        fetch('/api/concierge-requests')
      ]);
      const staffData = await staffRes.json();
      const reqData = await reqRes.json();

      if (Array.isArray(staffData)) {
        setStaff(staffData);
        try { localStorage.setItem('luxestay_cache_concierge_staff', JSON.stringify(staffData)); } catch (e) {}
      }
      if (Array.isArray(reqData)) {
        setRequests(reqData);
        try { localStorage.setItem('luxestay_cache_concierge_requests', JSON.stringify(reqData)); } catch (e) {}
      }
    } catch (e) {}
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleSaveStaff = (e) => {
    e.preventDefault();
    setLoading(true);

    fetch('/api/concierge', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(staffForm)
    })
      .then(res => res.json())
      .then(() => {
        setLoading(false);
        setIsStaffModalOpen(false);
        fetchStaff();
      })
      .catch(() => setLoading(false));
  };

  const handleStatusChange = (staffId, newStatus) => {
    fetch(`/api/concierge/${staffId}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status: newStatus })
    })
      .then(res => res.json())
      .then(() => fetchStaff());
  };

  const handleRequestStatusChange = (requestId, newStatus) => {
    fetch(`/api/concierge-requests/${requestId}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status: newStatus })
    })
      .then(res => res.json())
      .then(() => fetchRequests());
  };

  // Staff Filters
  const filteredStaff = staff.filter(s => {
    const matchesSearch = s.name.toLowerCase().includes(staffSearch.toLowerCase()) || s.id.toLowerCase().includes(staffSearch.toLowerCase());
    const matchesPos = positionFilter === 'All' || s.position === positionFilter;
    const matchesStatus = statusFilter === 'All' || s.status === statusFilter;
    
    // Simple matches schedule
    let matchesSched = true;
    if (scheduleFilter !== 'All') {
      if (scheduleFilter === 'Weekday') matchesSched = s.schedule.includes('Monday');
      if (scheduleFilter === 'Weekend') matchesSched = s.schedule.includes('Saturday');
    }

    return matchesSearch && matchesPos && matchesStatus && matchesSched;
  });

  // Requests Filters
  const filteredRequests = requests.filter(r => {
    return r.guestName.toLowerCase().includes(requestSearch.toLowerCase()) || 
      r.requestType.toLowerCase().includes(requestSearch.toLowerCase()) || 
      r.roomNumber.toLowerCase().includes(requestSearch.toLowerCase());
  });

  return (
    <PortalLayout role="manager" title="Concierge Desk Operations">
      <div className="w-full space-y-6 font-sans text-slate-800 animate-fade-in pb-12">
        
        {/* TITLE HEADER & TAB SWITCHER */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-4">
          <div>
            <h1 className="text-2xl font-black text-slate-900 tracking-tight">Concierge</h1>
            <p className="text-xs text-slate-400 font-semibold mt-0.5">Manage luxury guest desk staff rosters and service requests</p>
          </div>

          <div className="flex items-center gap-1.5 p-1 bg-slate-100 rounded-xl">
            <button 
              onClick={() => setActiveTab('staff')}
              className={`px-4 py-2 rounded-lg text-xs font-black cursor-pointer transition-all ${
                activeTab === 'staff' ? 'bg-white text-slate-950 shadow-2xs' : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              Staff Directory
            </button>
            <button 
              onClick={() => setActiveTab('requests')}
              className={`px-4 py-2 rounded-lg text-xs font-black cursor-pointer transition-all ${
                activeTab === 'requests' ? 'bg-white text-slate-950 shadow-2xs' : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              Guest Request Logs
            </button>
          </div>
        </div>

        {/* TAB 1: STAFF DIRECTORY */}
        {activeTab === 'staff' && (
          <div className="space-y-4">
            
            {/* Directory Controls */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              
              <div className="flex items-center gap-2 flex-wrap">
                {/* Position */}
                <select 
                  value={positionFilter}
                  onChange={(e) => setPositionFilter(e.target.value)}
                  className="px-3.5 py-2 rounded-full border border-slate-200 bg-white text-xs outline-none cursor-pointer font-bold"
                >
                  <option value="All">All Position</option>
                  <option value="Head Concierge">Head Concierge</option>
                  <option value="Concierge Assistant">Concierge Assistant</option>
                  <option value="Tour Coordinator">Tour Coordinator</option>
                  <option value="Night Porter">Night Porter</option>
                </select>

                {/* Status */}
                <select 
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="px-3.5 py-2 rounded-full border border-slate-200 bg-white text-xs outline-none cursor-pointer font-bold"
                >
                  <option value="All">All Status</option>
                  <option value="Active">Active</option>
                  <option value="On Leave">On Leave</option>
                  <option value="Inactive">Inactive</option>
                </select>

                {/* Schedule */}
                <select 
                  value={scheduleFilter}
                  onChange={(e) => setScheduleFilter(e.target.value)}
                  className="px-3.5 py-2 rounded-full border border-slate-200 bg-white text-xs outline-none cursor-pointer font-bold"
                >
                  <option value="All">All Schedule</option>
                  <option value="Weekday">Weekday (Mon-Fri)</option>
                  <option value="Weekend">Weekend (Sat-Sun)</option>
                </select>
              </div>

              <div className="flex items-center gap-2">
                {/* Search */}
                <div className="relative">
                  <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input 
                    type="text" 
                    placeholder="Search placeholder..."
                    value={staffSearch}
                    onChange={(e) => setStaffSearch(e.target.value)}
                    className="pl-8 pr-4 py-2 rounded-full border border-slate-200 bg-white text-xs outline-none focus:border-slate-400 w-44 font-semibold text-slate-800"
                  />
                </div>

                <button 
                  onClick={() => setIsStaffModalOpen(true)}
                  className="px-4.5 py-2.5 rounded-full bg-[#e2f896] hover:bg-[#d4ed83] text-slate-950 text-xs font-black shadow-xs flex items-center gap-1.5 cursor-pointer"
                >
                  <Plus className="w-4 h-4" /> Add Concierge
                </button>
              </div>

            </div>

            {/* Staff directory table */}
            <div className="bg-white rounded-xl border border-slate-200/70 shadow-2xs overflow-hidden w-full">
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse text-xs font-bold text-slate-700">
                  <thead>
                    <tr className="border-b border-slate-100 bg-slate-50/50 text-[10px] uppercase font-black text-slate-400 tracking-wider">
                      <th className="py-4 px-5">Name</th>
                      <th className="py-4 px-4">Position</th>
                      <th className="py-4 px-4">Schedule</th>
                      <th className="py-4 px-4">Contact</th>
                      <th className="py-4 px-4">Email</th>
                      <th className="py-4 px-5 text-right">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {filteredStaff.map((s) => {
                      const initials = s.name ? s.name.split(' ').map(n => n[0]).join('') : 'C';
                      return (
                        <tr key={s.id} className="hover:bg-slate-50/30">
                          
                          {/* Name / ID / Avatar */}
                          <td className="py-4 px-5">
                            <div className="flex items-center gap-3">
                              <div className="w-9 h-9 rounded-full bg-[#e2f896]/30 text-slate-950 border border-[#e2f896] flex items-center justify-center font-black text-xs">
                                {initials}
                              </div>
                              <div>
                                <span className="font-extrabold text-slate-900 block">{s.name}</span>
                                <span className="text-[9px] text-slate-400 font-semibold uppercase block mt-0.5">{s.id}</span>
                              </div>
                            </div>
                          </td>

                          {/* Position */}
                          <td className="py-4 px-4 text-slate-500 font-medium">{s.position}</td>

                          {/* Schedule */}
                          <td className="py-4 px-4 text-slate-400 font-medium">{s.schedule}</td>

                          {/* Contact phone */}
                          <td className="py-4 px-4 text-slate-900 font-black">{s.contact}</td>

                          {/* Email */}
                          <td className="py-4 px-4 text-slate-500 font-semibold font-mono text-[10px]">{s.email}</td>

                          {/* Status select badge */}
                          <td className="py-4 px-5 text-right">
                            <select 
                              value={s.status}
                              onChange={(e) => handleStatusChange(s.id, e.target.value)}
                              className={`px-3 py-1 rounded-full text-[9px] font-black uppercase border cursor-pointer outline-none ${
                                s.status === 'Active' 
                                  ? 'bg-emerald-50 text-emerald-700 border-emerald-200' 
                                  : s.status === 'On Leave' 
                                  ? 'bg-yellow-50 text-amber-700 border-yellow-200'
                                  : 'bg-slate-50 text-slate-600 border-slate-200'
                              }`}
                            >
                              <option value="Active">Active</option>
                              <option value="On Leave">On Leave</option>
                              <option value="Inactive">Inactive</option>
                            </select>
                          </td>

                        </tr>
                      );
                    })}

                    {filteredStaff.length === 0 && (
                      <tr>
                        <td colSpan="6" className="py-12 text-center text-xs text-slate-400">
                          No concierge staff members found in directory.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>

          </div>
        )}

        {/* TAB 2: GUEST REQUEST LOGS */}
        {activeTab === 'requests' && (
          <div className="space-y-4">
            
            {/* Request filters */}
            <div className="flex items-center justify-between gap-4">
              <h3 className="text-base font-bold text-slate-900">Active Service Requests</h3>

              {/* Search input */}
              <div className="relative">
                <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input 
                  type="text" 
                  placeholder="Search requests, rooms..."
                  value={requestSearch}
                  onChange={(e) => setRequestSearch(e.target.value)}
                  className="pl-8 pr-4 py-2 rounded-full border border-slate-200 bg-white text-xs outline-none focus:border-slate-400 w-44 font-semibold text-slate-800"
                />
              </div>
            </div>

            {/* Requests table list */}
            <div className="bg-white rounded-xl border border-slate-200/70 shadow-2xs overflow-hidden w-full">
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse text-xs font-bold text-slate-700">
                  <thead>
                    <tr className="border-b border-slate-100 bg-slate-50/50 text-[10px] uppercase font-black text-slate-400 tracking-wider">
                      <th className="py-4 px-5">Request ID</th>
                      <th className="py-4 px-4">Guest Name</th>
                      <th className="py-4 px-4">Room No</th>
                      <th className="py-4 px-4">Request Service</th>
                      <th className="py-4 px-4">Scheduled Time</th>
                      <th className="py-4 px-4">Assigned Attendant</th>
                      <th className="py-4 px-5 text-right">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {filteredRequests.map((r) => (
                      <tr key={r.id} className="hover:bg-slate-50/30">
                        <td className="py-4 px-5 text-slate-900 font-extrabold">{r.id}</td>
                        <td className="py-4 px-4 text-slate-900 font-extrabold">{r.guestName}</td>
                        <td className="py-4 px-4 text-slate-500 font-semibold">{r.roomNumber}</td>
                        <td className="py-4 px-4 text-slate-950 font-black">{r.requestType}</td>
                        <td className="py-4 px-4 text-slate-400 font-semibold">{r.scheduledTime}</td>
                        <td className="py-4 px-4 text-slate-500">{r.assignedStaff}</td>
                        
                        {/* Status dropdown */}
                        <td className="py-4 px-5 text-right">
                          <select 
                            value={r.status}
                            onChange={(e) => handleRequestStatusChange(r.id, e.target.value)}
                            className={`px-3 py-1 rounded-full text-[9px] font-black uppercase border cursor-pointer outline-none ${
                              r.status === 'Completed' 
                                ? 'bg-emerald-50 text-emerald-700 border-emerald-200' 
                                : r.status === 'In Progress' 
                                ? 'bg-blue-50 text-blue-700 border-blue-200'
                                : 'bg-yellow-50 text-amber-700 border-yellow-200'
                            }`}
                          >
                            <option value="Pending">Pending</option>
                            <option value="In Progress">In Progress</option>
                            <option value="Completed">Completed</option>
                          </select>
                        </td>
                      </tr>
                    ))}

                    {filteredRequests.length === 0 && (
                      <tr>
                        <td colSpan="7" className="py-12 text-center text-xs text-slate-400">
                          No active concierge service requests.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>

          </div>
        )}

      </div>

      {/* ADD NEW STAFF MODAL */}
      {isStaffModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4">
          <div className="bg-white rounded-xl border border-slate-200 shadow-2xl w-full max-w-sm overflow-hidden text-slate-800 animate-scale-up">
            <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-950 text-white">
              <h3 className="text-sm font-black flex items-center gap-2 !text-white">
                <PlusCircle className="w-5 h-5 text-amber-500" />
                Add New Staff Member
              </h3>
              <button 
                onClick={() => setIsStaffModalOpen(false)}
                className="p-1 rounded-full hover:bg-white/10 text-white cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveStaff} className="p-6 space-y-4 text-xs font-bold text-slate-700">
              
              {/* Full Name */}
              <div>
                <label className="block mb-1">Full Name *</label>
                <input 
                  type="text" 
                  required
                  placeholder="e.g. John Doe"
                  value={staffForm.name}
                  onChange={(e) => setStaffForm({ ...staffForm, name: e.target.value })}
                  className="w-full p-3 rounded-xl bg-slate-50 border border-slate-200 outline-none text-slate-900"
                />
              </div>

              {/* Position */}
              <div>
                <label className="block mb-1">Roster Position *</label>
                <select 
                  value={staffForm.position}
                  onChange={(e) => setStaffForm({ ...staffForm, position: e.target.value })}
                  className="w-full p-3 rounded-xl bg-slate-50 border border-slate-200 outline-none cursor-pointer text-slate-800"
                >
                  <option value="Head Concierge">Head Concierge</option>
                  <option value="Concierge Assistant">Concierge Assistant</option>
                  <option value="Tour Coordinator">Tour Coordinator</option>
                  <option value="Night Porter">Night Porter</option>
                </select>
              </div>

              {/* Work Schedule */}
              <div>
                <label className="block mb-1">Duty Schedule Hours *</label>
                <input 
                  type="text" 
                  required
                  placeholder="e.g. Monday - Friday | 8 AM - 4 PM"
                  value={staffForm.schedule}
                  onChange={(e) => setStaffForm({ ...staffForm, schedule: e.target.value })}
                  className="w-full p-3 rounded-xl bg-slate-50 border border-slate-200 outline-none text-slate-900"
                />
              </div>

              {/* Contact Details */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block mb-1">Phone Contact *</label>
                  <input 
                    type="text" 
                    required
                    placeholder="e.g. +1 (555) 000-0000"
                    value={staffForm.contact}
                    onChange={(e) => setStaffForm({ ...staffForm, contact: e.target.value })}
                    className="w-full p-3 rounded-xl bg-slate-50 border border-slate-200 outline-none text-slate-900"
                  />
                </div>
                <div>
                  <label className="block mb-1">Email Address *</label>
                  <input 
                    type="email" 
                    required
                    placeholder="e.g. staff@example.com"
                    value={staffForm.email}
                    onChange={(e) => setStaffForm({ ...staffForm, email: e.target.value })}
                    className="w-full p-3 rounded-xl bg-slate-50 border border-slate-200 outline-none text-slate-900"
                  />
                </div>
              </div>

              {/* Action Buttons */}
              <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-3">
                <button 
                  type="button"
                  onClick={() => setIsStaffModalOpen(false)}
                  className="px-4 py-2.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 font-bold cursor-pointer"
                >
                  Cancel
                </button>
                <button 
                  type="submit"
                  disabled={loading}
                  className="px-5 py-2.5 rounded-xl bg-[#e2f896] text-slate-950 hover:bg-[#d4ed83] flex items-center gap-1.5 shadow-md font-black cursor-pointer text-xs"
                >
                  <Save className="w-4 h-4" />
                  {loading ? 'Adding...' : 'Add to Staff Roster'}
                </button>
              </div>

            </form>
          </div>
        </div>
      )}

    </PortalLayout>
  );
};

export const PartnerConcierge = ManagerConcierge;
export default ManagerConcierge;
