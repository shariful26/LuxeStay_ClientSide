import React, { useState, useEffect } from 'react';
import { PortalLayout } from '../../components/PortalLayout';
import { useCurrency } from '../../context/CurrencyContext';

export const RoomsManagement = () => {
  const [rooms, setRooms] = useState([]);
  const { formatPrice } = useCurrency();

  useEffect(() => {
    fetch('/api/rooms')
      .then(res => res.json())
      .then(data => setRooms(data))
      .catch(() => {});
  }, []);

  return (
    <PortalLayout role="admin" title="Room Master Catalog">
      <div>
        <h1 className="text-xl sm:text-2xl font-extrabold text-[var(--text-primary)]">Platform Room Master Catalog</h1>
        <p className="text-xs text-[var(--text-secondary)]">Master list of suites, specs, and base pricing across all properties</p>
      </div>

      <div className="rounded-3xl bg-[var(--bg-card)] border border-[var(--border-light)] overflow-hidden shadow-lg">
        <div className="table-responsive">
          <table className="custom-table">
            <thead>
              <tr>
                <th>Suite Name</th>
                <th>Category Type</th>
                <th>Capacity</th>
                <th>Dimensions</th>
                <th>Nightly Rate</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {rooms.map(r => (
                <tr key={r.id}>
                  <td className="font-bold text-[var(--text-primary)]">{r.name}</td>
                  <td><span className="badge badge-gold">{r.type}</span></td>
                  <td className="text-xs">{r.capacity} Guests ({r.bedType})</td>
                  <td className="text-xs">{r.size}</td>
                  <td className="font-extrabold text-amber-500">{formatPrice(r.price)}</td>
                  <td><span className="badge badge-emerald">Available</span></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </PortalLayout>
  );
};
