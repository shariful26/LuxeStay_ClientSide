import React, { useState, useEffect } from 'react';
import { Plus, Minus, X, Search, Edit2, RotateCcw, AlertTriangle, CheckCircle, HelpCircle, Save, Trash2 } from 'lucide-react';
import { PortalLayout } from '../../components/PortalLayout';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';

import { getInstantData } from '../../utils/instantCache';

export const ManagerInventory = () => {
  const { user } = useAuth();
  const toast = useToast();
  const [inventory, setInventory] = useState(() => getInstantData('inventory', []));
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('All');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [loading, setLoading] = useState(false);

  const [formData, setFormData] = useState({
    name: '',
    category: 'Linen',
    stock: 100,
    reorderLimit: 50
  });

  const fetchInventory = () => {
    fetch(`/api/inventory?_t=${Date.now()}`)
      .then(res => res.json())
      .then(data => {
        if (Array.isArray(data)) {
          const sanitized = data.map(item => {
            const stockVal = Number(item.stock !== undefined ? item.stock : (item.quantity !== undefined ? item.quantity : 100)) || 0;
            const reorderVal = Number(item.reorderLimit !== undefined ? item.reorderLimit : (item.minThreshold !== undefined ? item.minThreshold : 50)) || 50;
            const itemName = item.name || item.itemName || (item.category ? `${item.category} Supplies` : 'Inventory Asset');
            const avail = stockVal <= 0 ? 'Out of Stock' : stockVal <= reorderVal ? 'Low' : 'Available';

            return {
              ...item,
              name: itemName,
              itemName: itemName,
              stock: stockVal,
              quantity: stockVal,
              reorderLimit: reorderVal,
              minThreshold: reorderVal,
              availability: item.availability || (item.status === 'In Stock' ? 'Available' : item.status || avail)
            };
          });
          setInventory(sanitized);
          try { localStorage.setItem('luxestay_cache_inventory', JSON.stringify(sanitized)); } catch (e) {}
        }
      })
      .catch(() => {});
  };

  useEffect(() => {
    fetchInventory();
  }, []);

  const handleOpenAddModal = () => {
    setEditingItem(null);
    setFormData({
      name: '',
      category: 'Linen',
      stock: 100,
      reorderLimit: 50
    });
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (item) => {
    setEditingItem(item);
    setFormData({
      name: item.name || item.itemName || '',
      category: item.category || 'Linen',
      stock: Number(item.stock !== undefined ? item.stock : item.quantity) || 0,
      reorderLimit: Number(item.reorderLimit !== undefined ? item.reorderLimit : item.minThreshold) || 50
    });
    setIsModalOpen(true);
  };

  const handleSaveItem = async (e) => {
    e.preventDefault();
    if (!formData.name.trim()) return;

    const sVal = Number(formData.stock) || 0;
    const rVal = Number(formData.reorderLimit) || 50;
    const calculatedAvailability = 
      sVal <= 0 
        ? 'Out of Stock' 
        : sVal <= rVal 
        ? 'Low' 
        : 'Available';

    const payload = {
      ...formData,
      stock: sVal,
      quantity: sVal,
      reorderLimit: rVal,
      minThreshold: rVal,
      availability: calculatedAvailability,
      status: calculatedAvailability === 'Available' ? 'In Stock' : calculatedAvailability
    };

    const isEdit = !!editingItem;
    const url = isEdit ? `/api/inventory/${editingItem.id}` : '/api/inventory';
    const method = isEdit ? 'PUT' : 'POST';

    if (isEdit) {
      setInventory(prev => {
        const next = prev.map(i => i.id === editingItem.id ? { ...i, ...payload } : i);
        try { localStorage.setItem('luxestay_cache_inventory', JSON.stringify(next)); } catch (e) {}
        return next;
      });
      setIsModalOpen(false);
      setEditingItem(null);
      toast.success(`Inventory item "${formData.name}" updated!`, 'Stock Updated');
    } else {
      const newItem = { id: `inv_${Date.now()}`, ...payload };
      setInventory(prev => {
        const next = [newItem, ...prev];
        try { localStorage.setItem('luxestay_cache_inventory', JSON.stringify(next)); } catch (e) {}
        return next;
      });
      setIsModalOpen(false);
      setEditingItem(null);
      toast.success(`New item "${formData.name}" added to inventory!`, 'Item Created');
    }

    fetch(url, {
      method,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    })
      .then(res => res.json())
      .then(updated => {
        if (updated && updated.id) {
          setInventory(prev => {
            const next = prev.map(i => i.id === updated.id ? { ...i, ...updated } : i);
            try { localStorage.setItem('luxestay_cache_inventory', JSON.stringify(next)); } catch (e) {}
            return next;
          });
        }
      })
      .catch(() => {});
  };

  const handleReorder = (itemId) => {
    const item = inventory.find(i => i.id === itemId);
    if (!item) return;

    const currentStock = Number(item.stock !== undefined ? item.stock : (item.quantity !== undefined ? item.quantity : 0)) || 0;
    const newStock = currentStock + 150;

    setInventory(prev => {
      const next = prev.map(i => i.id === itemId ? { 
        ...i, 
        stock: newStock, 
        quantity: newStock, 
        availability: 'Available',
        status: 'In Stock'
      } : i);
      try { localStorage.setItem('luxestay_cache_inventory', JSON.stringify(next)); } catch (e) {}
      return next;
    });

    toast.success(`Restocked +150 units for "${item.name || item.itemName}"!`, 'Restock Order Placed');

    fetch(`/api/inventory/${itemId}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        stock: newStock,
        quantity: newStock,
        availability: 'Available',
        status: 'In Stock'
      })
    })
      .then(res => res.json())
      .then(updated => {
        if (updated && updated.id) {
          setInventory(prev => {
            const next = prev.map(i => i.id === itemId ? { ...i, ...updated } : i);
            try { localStorage.setItem('luxestay_cache_inventory', JSON.stringify(next)); } catch (e) {}
            return next;
          });
        }
      })
      .catch(() => {});
  };

  const handleAdjustStock = (itemId, delta) => {
    const item = inventory.find(i => i.id === itemId);
    if (!item) return;

    const currentStock = Number(item.stock !== undefined ? item.stock : (item.quantity !== undefined ? item.quantity : 100)) || 0;
    const limit = Number(item.reorderLimit !== undefined ? item.reorderLimit : (item.minThreshold !== undefined ? item.minThreshold : 50)) || 50;
    const newStock = Math.max(0, currentStock + delta);
    const newAvail = newStock <= 0 ? 'Out of Stock' : newStock <= limit ? 'Low' : 'Available';

    setInventory(prev => {
      const next = prev.map(i => i.id === itemId ? { 
        ...i, 
        stock: newStock, 
        quantity: newStock, 
        availability: newAvail,
        status: newAvail === 'Available' ? 'In Stock' : newAvail
      } : i);
      try { localStorage.setItem('luxestay_cache_inventory', JSON.stringify(next)); } catch (e) {}
      return next;
    });

    fetch(`/api/inventory/${itemId}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ 
        stock: newStock, 
        quantity: newStock, 
        reorderLimit: limit,
        minThreshold: limit,
        availability: newAvail,
        status: newAvail === 'Available' ? 'In Stock' : newAvail
      })
    })
      .then(res => res.json())
      .then(updated => {
        if (updated && updated.id) {
          setInventory(prev => {
            const next = prev.map(i => i.id === itemId ? { ...i, ...updated } : i);
            try { localStorage.setItem('luxestay_cache_inventory', JSON.stringify(next)); } catch (e) {}
            return next;
          });
        }
      })
      .catch(() => {});
  };

  const handleDeleteItem = async (itemId, name) => {
    if (!window.confirm(`Are you sure you want to remove "${name}" from inventory?`)) return;
    setInventory(prev => prev.filter(i => i.id !== itemId));
    toast.success(`"${name}" deleted from inventory`, 'Item Removed');
    try {
      await fetch(`/api/inventory/${itemId}`, { method: 'DELETE' });
    } catch (e) {}
  };

  const safeInventory = Array.isArray(inventory) ? inventory : [];
  const filteredInventory = safeInventory.filter(item => {
    const matchesSearch = item.name?.toLowerCase().includes(searchQuery.toLowerCase()) || item.category?.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = categoryFilter === 'All' || item.category === categoryFilter;
    return matchesSearch && matchesCategory;
  });

  // Inventory Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 6;

  const totalPages = Math.ceil(filteredInventory.length / itemsPerPage);
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentInventory = filteredInventory.slice(indexOfFirstItem, indexOfLastItem);

  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, categoryFilter]);

  return (
    <PortalLayout role="manager" title="Supply Inventory Manager">
      <div className="w-full space-y-6 font-sans text-slate-800 animate-fade-in pb-12">
        
        {/* HEADER CONTROLS */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <h1 className="text-2xl font-black text-slate-900 tracking-tight">Inventory</h1>
          
          <div className="flex items-center gap-2 flex-wrap">
            {/* Search */}
            <div className="relative">
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input 
                type="text" 
                placeholder="Search items, categories..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-8 pr-4 py-2 rounded-full border border-slate-200 bg-white text-xs outline-none focus:border-slate-400 w-44 font-medium"
              />
            </div>

            {/* Category Filter */}
            <select 
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              className="px-3.5 py-2 rounded-full border border-slate-200 bg-white text-xs outline-none cursor-pointer font-bold"
            >
              <option value="All">All Category</option>
              <option value="Linen">Linen</option>
              <option value="Toiletries">Toiletries</option>
              <option value="Refreshments">Refreshments</option>
              <option value="Electronics">Electronics</option>
              <option value="Housekeeping">Housekeeping</option>
            </select>

            {/* Add Item Button */}
            <button 
              onClick={handleOpenAddModal}
              className="px-6 py-3 rounded-full bg-[#e2f896] hover:bg-[#d4ed83] text-slate-950 text-xs font-black shadow-xs flex items-center gap-2 cursor-pointer transition-transform hover:scale-102"
            >
              <Plus className="w-4 h-4" /> Add Item
            </button>
          </div>
        </div>

        {/* INVENTORY DATA TABLE */}
        <div className="bg-white rounded-xl border border-slate-200/70 shadow-2xs overflow-hidden w-full">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs font-bold text-slate-700">
              <thead>
                <tr className="border-b border-slate-100 bg-slate-50/50 text-[10px] uppercase font-black text-slate-400 tracking-wider">
                  <th className="py-4 px-5">Item Name</th>
                  <th className="py-4 px-4">Category</th>
                  <th className="py-4 px-4">Availability</th>
                  <th className="py-4 px-4">Quantity in Stock</th>
                  <th className="py-4 px-4">Quantity in Reorder Limit</th>
                  <th className="py-4 px-5 text-center">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {currentInventory.map((item) => {
                  const avail = item.availability || 'Available';
                  return (
                    <tr key={item.id} className="hover:bg-slate-50/30">
                      
                      {/* Item Name */}
                      <td className="py-4 px-5 text-slate-900 font-extrabold">{item.name || item.itemName || item.category || 'Supply Item'}</td>
                      
                      {/* Category */}
                      <td className="py-4 px-4 text-slate-500 font-medium">{item.category}</td>
                      
                      {/* Availability badge */}
                      <td className="py-4 px-4">
                        <span className={`px-2.5 py-0.5 rounded-full text-[9px] font-black uppercase ${
                          avail === 'Available' 
                            ? 'bg-emerald-50 text-emerald-700' 
                            : avail === 'Low' 
                            ? 'bg-amber-50 text-amber-700' 
                            : 'bg-rose-50 text-rose-700'
                        }`}>
                          {avail}
                        </span>
                      </td>

                      {/* Dynamic Stock Quantity Stepper */}
                      <td className="py-4 px-4">
                        <div className="flex items-center gap-1.5">
                          <button
                            onClick={() => handleAdjustStock(item.id, -10)}
                            className="w-6 h-6 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 font-black flex items-center justify-center text-xs transition-colors cursor-pointer shadow-2xs"
                            title="Decrement stock by 10"
                          >
                            <Minus className="w-3 h-3" />
                          </button>
                          <span className="text-slate-900 font-black text-xs min-w-[55px] text-center">
                            {Number(item.stock !== undefined ? item.stock : (item.quantity !== undefined ? item.quantity : 0))} Units
                          </span>
                          <button
                            onClick={() => handleAdjustStock(item.id, 10)}
                            className="w-6 h-6 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 font-black flex items-center justify-center text-xs transition-colors cursor-pointer shadow-2xs"
                            title="Increment stock by 10"
                          >
                            <Plus className="w-3 h-3" />
                          </button>
                        </div>
                      </td>

                      {/* Reorder limit */}
                      <td className="py-4 px-4 text-slate-400 font-medium">
                        {Number(item.reorderLimit !== undefined ? item.reorderLimit : (item.minThreshold !== undefined ? item.minThreshold : 50))} Units
                      </td>

                      {/* Action buttons */}
                      <td className="py-4 px-5 text-center">
                        <div className="flex items-center justify-center gap-1.5">
                          <button 
                            onClick={() => handleOpenEditModal(item)}
                            className="p-1.5 rounded-lg border border-slate-200 hover:bg-slate-50 text-slate-600 transition-colors cursor-pointer"
                            title="Edit Item"
                          >
                            <Edit2 className="w-3.5 h-3.5" />
                          </button>
                          
                          <button 
                            onClick={() => handleReorder(item.id)}
                            className="px-2.5 py-1 rounded-lg bg-[#e2f896] hover:bg-[#d4ed83] text-slate-950 text-xs font-black cursor-pointer transition-colors shadow-2xs"
                            title="Quick Reorder +150 Units"
                          >
                            Reorder
                          </button>

                          <button 
                            onClick={() => handleDeleteItem(item.id, item.name)}
                            className="p-1.5 rounded-lg border border-slate-200 hover:bg-rose-50 text-slate-400 hover:text-rose-600 transition-colors cursor-pointer"
                            title="Delete Item"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>

                    </tr>
                  );
                })}

                {filteredInventory.length === 0 && (
                  <tr>
                    <td colSpan="6" className="py-12 text-center text-xs text-slate-400">
                      No inventory items found matching your filters.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Pagination Controls */}
        {totalPages > 1 && (
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-3 border-t border-slate-100 text-xs font-bold text-slate-600">
            <span className="text-[11px] text-slate-400 font-semibold">
              Showing <strong className="text-slate-700">{indexOfFirstItem + 1}</strong>–<strong className="text-slate-700">{Math.min(indexOfLastItem, filteredInventory.length)}</strong> of <strong className="text-slate-700">{filteredInventory.length}</strong> Items
            </span>

            <div className="flex items-center gap-1.5">
              <button
                onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                disabled={currentPage === 1}
                className="px-3 py-1.5 rounded-xl border border-slate-200 bg-white text-slate-700 hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer transition-all"
              >
                Prev
              </button>

              {Array.from({ length: totalPages }, (_, i) => i + 1).map(pageNum => (
                <button
                  key={pageNum}
                  onClick={() => setCurrentPage(pageNum)}
                  className={`w-8 h-8 rounded-xl font-black text-xs transition-all cursor-pointer flex items-center justify-center ${
                    currentPage === pageNum
                      ? 'bg-[#e2f896] text-slate-950 border border-[#d4ed83] shadow-xs scale-105'
                      : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'
                  }`}
                >
                  {pageNum}
                </button>
              ))}

              <button
                onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                disabled={currentPage === totalPages}
                className="px-3 py-1.5 rounded-xl border border-slate-200 bg-white text-slate-700 hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer transition-all"
              >
                Next
              </button>
            </div>
          </div>
        )}

      </div>

      {/* CREATE / EDIT INVENTORY ITEM MODAL */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4">
          <div className="bg-white rounded-xl border border-slate-200 shadow-2xl w-full max-w-sm overflow-hidden text-slate-800 animate-scale-up">
            <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-950 text-white">
              <h3 className="text-sm font-black flex items-center gap-2 !text-white">
                <RotateCcw className="w-5 h-5 text-amber-500" />
                {editingItem ? 'Edit Inventory Item' : 'Add New Supply Item'}
              </h3>
              <button 
                onClick={() => setIsModalOpen(false)}
                className="p-1 rounded-full hover:bg-white/10 text-white cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveItem} className="p-6 space-y-4 text-xs font-bold text-slate-700">
              
              {/* Item Name */}
              <div>
                <label className="block mb-1">Item / Product Name *</label>
                <input 
                  type="text" 
                  required
                  placeholder="e.g. Toilet Paper rolls"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full p-3 rounded-xl bg-slate-50 border border-slate-200 outline-none text-slate-900"
                />
              </div>

              {/* Category */}
              <div>
                <label className="block mb-1">Item Category *</label>
                <select 
                  value={formData.category}
                  onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                  className="w-full p-3 rounded-xl bg-slate-50 border border-slate-200 outline-none cursor-pointer text-slate-800"
                >
                  <option value="Linen">Linen</option>
                  <option value="Toiletries">Toiletries</option>
                  <option value="Refreshments">Refreshments</option>
                  <option value="Electronics">Electronics</option>
                  <option value="Housekeeping">Housekeeping</option>
                </select>
              </div>

              {/* Stock count */}
              <div>
                <label className="block mb-1">Quantity in Stock *</label>
                <input 
                  type="number" 
                  required
                  min="0"
                  value={formData.stock}
                  onChange={(e) => setFormData({ ...formData, stock: Number(e.target.value) })}
                  className="w-full p-3 rounded-xl bg-slate-50 border border-slate-200 outline-none text-slate-900"
                />
              </div>

              {/* Reorder limit */}
              <div>
                <label className="block mb-1">Reorder Alert Limit *</label>
                <input 
                  type="number" 
                  required
                  min="0"
                  value={formData.reorderLimit}
                  onChange={(e) => setFormData({ ...formData, reorderLimit: Number(e.target.value) })}
                  className="w-full p-3 rounded-xl bg-slate-50 border border-slate-200 outline-none text-slate-900"
                />
              </div>

              {/* Action Buttons */}
              <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-3">
                <button 
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 font-bold cursor-pointer"
                >
                  Cancel
                </button>
                <button 
                  type="submit"
                  disabled={loading}
                  className="px-5 py-2.5 rounded-xl bg-[#e2f896] text-slate-950 hover:bg-[#d4ed83] flex items-center gap-1.5 shadow-md font-black cursor-pointer"
                >
                  <Save className="w-4 h-4" />
                  {loading ? 'Saving...' : 'Save Supply Configuration'}
                </button>
              </div>

            </form>
          </div>
        </div>
      )}

    </PortalLayout>
  );
};

export const PartnerInventory = ManagerInventory;
export default ManagerInventory;
