import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Plus, Edit, Eye } from 'lucide-react';
import { PortalLayout } from '../../components/PortalLayout';
import { useAuth } from '../../context/AuthContext';
import { useCurrency } from '../../context/CurrencyContext';

import { getInstantData, filterPartnerItems } from '../../utils/instantCache';

export const MyHotels = () => {
  const [hotels, setHotels] = useState(() => getInstantData('manager_hotels', []));
  const { user } = useAuth();
  const { formatPrice } = useCurrency();

  useEffect(() => {
    fetch('/api/hotels')
      .then(res => res.json())
      .then(data => {
        if (Array.isArray(data)) {
          const myData = filterPartnerItems(data, user);
          setHotels(myData);
          try { localStorage.setItem('luxestay_cache_manager_hotels', JSON.stringify(myData)); } catch (e) {}
        }
      })
      .catch(() => {});
  }, [user]);

  return (
    <PortalLayout role="manager" title="My Hotel Listings">
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-xl font-bold text-[var(--text-primary)]">My Hotel Listings</h1>
            <p className="text-xs text-[var(--text-secondary)]">Manage your registered hotel properties and status</p>
          </div>
          <Link to="/manager/hotels/new" className="btn btn-primary text-xs py-2.5 px-4 flex items-center gap-2 self-start sm:self-auto">
          <Plus className="w-4 h-4" /> Add Hotel
        </Link>
      </div>

      <div className="rounded-3xl bg-[var(--bg-card)] border border-[var(--border-light)] overflow-hidden shadow-lg">
        <div className="table-responsive">
          <table className="custom-table">
            <thead>
              <tr>
                <th>Hotel Name</th>
                <th>Destination</th>
                <th>Category</th>
                <th>Base Rate</th>
                <th>Rating</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {hotels.map(h => (
                <tr key={h.id}>
                  <td className="font-bold text-[var(--text-primary)]">{h.name}</td>
                  <td className="text-xs">{h.destination}</td>
                  <td><span className="badge badge-navy">{h.category}</span></td>
                  <td className="font-extrabold text-amber-500">{formatPrice(h.pricePerNight)}</td>
                  <td className="font-bold text-amber-500">★ {h.rating || 5.0}</td>
                  <td>
                    {h.status === 'Approved' ? (
                      <span className="badge badge-emerald flex items-center gap-1 w-max">Approved & Active</span>
                    ) : h.status === 'Rejected' ? (
                      <span className="badge bg-red-500/15 text-red-400 border border-red-500/30 flex items-center gap-1 w-max">Rejected</span>
                    ) : (
                      <span className="badge bg-amber-500/15 text-amber-500 border border-amber-500/30 flex items-center gap-1 w-max">Pending Approval</span>
                    )}
                  </td>
                  <td>
                    <div className="flex items-center gap-2">
                      <Link to={`/hotels/${h.id}`} className="p-1.5 rounded-lg border border-[var(--border-light)] hover:bg-[var(--bg-tertiary)]" title="Preview">
                        <Eye className="w-4 h-4 text-slate-400" />
                      </Link>
                      <Link to={`/manager/hotels/${h.id}/edit`} className="p-1.5 rounded-lg border border-[var(--border-light)] hover:bg-[var(--bg-tertiary)]" title="Edit">
                        <Edit className="w-4 h-4 text-amber-500" />
                      </Link>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  </PortalLayout>
  );
};
