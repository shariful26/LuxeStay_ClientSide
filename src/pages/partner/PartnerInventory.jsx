import React, { useState, useEffect } from 'react';
import { Plus, X, Search, Edit2, RotateCcw, AlertTriangle, CheckCircle, HelpCircle, Save } from 'lucide-react';
import { PortalLayout } from '../../components/PortalLayout';
import { useAuth } from '../../context/AuthContext';

export const PartnerInventory = () => {
  const { user } = useAuth();
  const [inventory, setInventory] = useState([]);
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
    fetch('/api/inventory')
      .then(res => res.json())
      .then(data => {
        if (Array.isArray(data)) {
          setInventory(data);
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
      name: item.name || '',
      category: item.category || 'Linen',
      stock: item.stock || 0,
      reorderLimit: item.reorderLimit || 0
    });
    setIsModalOpen(true);
  };

  const handleSaveItem = (e) => {
    e.preventDefault();
    setLoading(true);

    const calculatedAvailability = 
      formData.stock <= 0 
        ? 'Out of Stock' 
        : formData.stock <= formData.reorderLimit 
        ? 'Low' 
        : 'Available';

    const payload = {
      ...formData,
      availability: calculatedAvailability
    };

    const url = editingItem ? `/api/inventory/${editingItem.id}` : '/api/inventory';
    const method = editingItem ? 'PUT' : 'POST';

    fetch(url, {
      method,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    })
      .then(res => res.json())
      .then(() => {
        setLoading(false);
        setIsModalOpen(false);
        fetchInventory();
      })
      .catch(() => setLoading(false));
  };

  const handleReorder = (itemId) => {
    const item = inventory.find(i => i.id === itemId);
    if (!item) return;

    const newStock = (item.stock || 0) + 150;
    fetch(`/api/inventory/${itemId}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        stock: newStock,
        availability: 'Available'
      })
    })
      .then(res => res.json())
      .then(() => {
        fetchInventory();
      });
  };

  const filteredInventory = inventory.filter(item => {
    const matchesSearch = item.name.toLowerCase().includes(searchQuery.toLowerCase()) || item.category.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = categoryFilter === 'All' || item.category === categoryFilter;
    return matchesSearch && matchesCategory;
  });

  return (
    <PortalLayout role="partner" title="Supply Inventory Manager">
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
                {filteredInventory.map((item) => {
                  const avail = item.availability || 'Available';
                  return (
                    <tr key={item.id} className="hover:bg-slate-50/30">
                      
                      {/* Item Name */}
                      <td className="py-4 px-5 text-slate-900 font-extrabold">{item.name}</td>
                      
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

                      {/* Stock Quantity */}
                      <td className="py-4 px-4 text-slate-900 font-black">{item.stock} Units</td>

                      {/* Reorder limit */}
                      <td className="py-4 px-4 text-slate-400 font-medium">{item.reorderLimit} Units</td>

                      {/* Action buttons */}
                      <td className="py-4 px-5 text-center">
                        <div className="flex items-center justify-center gap-2">
                          <button 
                            onClick={() => handleOpenEditModal(item)}
                            className="px-2.5 py-1 rounded-lg border border-slate-200 hover:bg-slate-50 text-slate-600 transition-colors cursor-pointer"
                          >
                            Edit
                          </button>
                          
                          <button 
                            onClick={() => handleReorder(item.id)}
                            className="px-2.5 py-1 rounded-lg bg-[#e2f896] hover:bg-[#d4ed83] text-slate-950 font-black cursor-pointer transition-colors"
                          >
                            Reorder
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
