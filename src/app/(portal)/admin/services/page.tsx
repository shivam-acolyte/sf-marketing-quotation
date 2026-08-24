'use client';

import React, { useState, useEffect } from 'react';
import { Layers, Plus, Pencil, Save, X, Info } from 'lucide-react';

interface Service {
  id: number;
  name: string;
  minPrice: number;
  maximumPrice: number;
  description: string;
  salesDescription: string;
  active: boolean;
}

export default function AdminServices() {
  const [services, setServices] = useState<Service[]>([]);
  const [loading, setLoading] = useState(true);
  const [editId, setEditId] = useState<number | null>(null);
  
  // Edit Form State
  const [editForm, setEditForm] = useState({
    name: '',
    minPrice: 0,
    maximumPrice: 0,
    description: '',
    salesDescription: '',
    active: true,
  });

  // Create Form State
  const [createForm, setCreateForm] = useState({
    name: '',
    minPrice: '',
    maximumPrice: '',
    description: '',
    salesDescription: '',
  });

  const [showAddForm, setShowAddForm] = useState(false);

  const loadServices = async () => {
    try {
      const res = await fetch('/api/services');
      if (!res.ok) throw new Error('Fetch failed');
      const data = await res.json();
      setServices(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadServices();
  }, []);

  const handleStartEdit = (service: Service) => {
    setEditId(service.id);
    setEditForm({
      name: service.name,
      minPrice: Number(service.minPrice),
      maximumPrice: Number(service.maximumPrice),
      description: service.description || '',
      salesDescription: service.salesDescription || '',
      active: service.active,
    });
  };

  const handleSaveEdit = async () => {
    try {
      const res = await fetch(`/api/services/${editId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(editForm),
      });
      if (!res.ok) throw new Error('Save failed');
      setEditId(null);
      loadServices();
    } catch (err) {
      alert('Failed to save service edits.');
    }
  };

  const handleCreateService = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!createForm.name || !createForm.minPrice || !createForm.maximumPrice) return;
    try {
      const res = await fetch('/api/services', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: createForm.name,
          minPrice: Number(createForm.minPrice),
          maximumPrice: Number(createForm.maximumPrice),
          description: createForm.description,
          salesDescription: createForm.salesDescription,
        }),
      });
      if (!res.ok) throw new Error('Create failed');
      
      setCreateForm({
        name: '',
        minPrice: '',
        maximumPrice: '',
        description: '',
        salesDescription: '',
      });
      setShowAddForm(false);
      loadServices();
    } catch (err) {
      alert('Failed to create new service.');
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[40vh] gap-3">
        <div className="w-10 h-10 rounded-full border-t-2 border-r-2 border-indigo-400 animate-spin" />
        <p className="text-slate-400 text-xs font-medium">Loading services list...</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6">
      {/* Header */}
      <section className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-white/5 pb-4">
        <div>
          <h1 className="text-sm font-bold text-slate-100">Service Packages</h1>
          <p className="text-xs text-slate-500">Configure prices, min/max margins, and sales copy descriptions.</p>
        </div>
        <button
          onClick={() => setShowAddForm(!showAddForm)}
          className="inline-flex items-center gap-1.5 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold px-4 py-2 rounded-xl transition-all shadow-md"
        >
          <Plus className="w-4 h-4" />
          <span>New Service</span>
        </button>
      </section>

      {/* Create service form */}
      {showAddForm && (
        <form onSubmit={handleCreateService} className="glass-panel p-5 rounded-2xl flex flex-col gap-4 bg-slate-900/10">
          <h3 className="text-sm font-bold text-slate-200">Create New Service</h3>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
            <div className="flex flex-col gap-1.5">
              <label className="text-slate-400 font-semibold">Service Name</label>
              <input
                type="text"
                required
                value={createForm.name}
                onChange={(e) => setCreateForm({ ...createForm, name: e.target.value })}
                placeholder="e.g. Meta Advertising"
                className="bg-slate-950 border border-slate-800 rounded-lg p-2.5 outline-none text-slate-200"
              />
            </div>
            <div className="flex flex-col gap-1.5">
              <label className="text-slate-400 font-semibold">Min Price (₹)</label>
              <input
                type="number"
                required
                value={createForm.minPrice}
                onChange={(e) => setCreateForm({ ...createForm, minPrice: e.target.value })}
                placeholder="e.g. 10000"
                className="bg-slate-950 border border-slate-800 rounded-lg p-2.5 outline-none text-slate-200 font-mono"
              />
            </div>
            <div className="flex flex-col gap-1.5">
              <label className="text-slate-400 font-semibold">Max Price (₹)</label>
              <input
                type="number"
                required
                value={createForm.maximumPrice}
                onChange={(e) => setCreateForm({ ...createForm, maximumPrice: e.target.value })}
                placeholder="e.g. 30000"
                className="bg-slate-950 border border-slate-800 rounded-lg p-2.5 outline-none text-slate-200 font-mono"
              />
            </div>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
            <div className="flex flex-col gap-1.5">
              <label className="text-slate-400 font-semibold">Technical Description (Scope of Work)</label>
              <textarea
                value={createForm.description}
                onChange={(e) => setCreateForm({ ...createForm, description: e.target.value })}
                placeholder="Details of services, hours, delivery checklist..."
                className="bg-slate-950 border border-slate-800 rounded-lg p-2.5 outline-none text-slate-200 min-h-20"
              />
            </div>
            <div className="flex flex-col gap-1.5">
              <label className="text-slate-400 font-semibold">Sales Copy Description (Customer Facing)</label>
              <textarea
                value={createForm.salesDescription}
                onChange={(e) => setCreateForm({ ...createForm, salesDescription: e.target.value })}
                placeholder="Value proposition, what results clients will get..."
                className="bg-slate-950 border border-slate-800 rounded-lg p-2.5 outline-none text-slate-200 min-h-20"
              />
            </div>
          </div>
          <div className="flex items-center gap-2.5 justify-end">
            <button
              type="button"
              onClick={() => setShowAddForm(false)}
              className="px-4 py-2 border border-slate-800 rounded-xl text-xs text-slate-400 hover:bg-slate-900"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 rounded-xl text-xs text-white font-semibold shadow-md"
            >
              Create Service
            </button>
          </div>
        </form>
      )}

      {/* Services Grid List */}
      <div className="flex flex-col gap-4">
        {services.map((service) => {
          const isEditing = editId === service.id;
          
          return (
            <div 
              key={service.id}
              className={`glass-panel p-5 rounded-2xl border transition-all ${
                isEditing ? 'border-indigo-500 bg-indigo-950/5' : 'border-slate-800'
              }`}
            >
              {isEditing ? (
                // Edit Interface
                <div className="flex flex-col gap-4 text-xs">
                  <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
                    <div className="flex flex-col gap-1">
                      <label className="text-slate-500 font-bold">Name</label>
                      <input
                        type="text"
                        value={editForm.name}
                        onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                        className="bg-slate-950 border border-slate-800 p-2 rounded-lg text-slate-200 outline-none"
                      />
                    </div>
                    <div className="flex flex-col gap-1">
                      <label className="text-slate-500 font-bold">Min Price (₹)</label>
                      <input
                        type="number"
                        value={editForm.minPrice}
                        onChange={(e) => setEditForm({ ...editForm, minPrice: Number(e.target.value) })}
                        className="bg-slate-950 border border-slate-800 p-2 rounded-lg text-slate-200 outline-none font-mono"
                      />
                    </div>
                    <div className="flex flex-col gap-1">
                      <label className="text-slate-500 font-bold">Max Price (₹)</label>
                      <input
                        type="number"
                        value={editForm.maximumPrice}
                        onChange={(e) => setEditForm({ ...editForm, maximumPrice: Number(e.target.value) })}
                        className="bg-slate-950 border border-slate-800 p-2 rounded-lg text-slate-200 outline-none font-mono"
                      />
                    </div>
                    <div className="flex flex-col gap-1">
                      <label className="text-slate-500 font-bold">Active Status</label>
                      <select
                        value={String(editForm.active)}
                        onChange={(e) => setEditForm({ ...editForm, active: e.target.value === 'true' })}
                        className="bg-slate-950 border border-slate-800 p-2 rounded-lg text-slate-200 outline-none"
                      >
                        <option value="true">Active</option>
                        <option value="false">Inactive</option>
                      </select>
                    </div>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="flex flex-col gap-1">
                      <label className="text-slate-500 font-bold">Technical Description</label>
                      <textarea
                        value={editForm.description}
                        onChange={(e) => setEditForm({ ...editForm, description: e.target.value })}
                        className="bg-slate-950 border border-slate-800 p-2 rounded-lg text-slate-200 outline-none min-h-20"
                      />
                    </div>
                    <div className="flex flex-col gap-1">
                      <label className="text-slate-500 font-bold">Sales Description</label>
                      <textarea
                        value={editForm.salesDescription}
                        onChange={(e) => setEditForm({ ...editForm, salesDescription: e.target.value })}
                        className="bg-slate-950 border border-slate-800 p-2 rounded-lg text-slate-200 outline-none min-h-20"
                      />
                    </div>
                  </div>
                  <div className="flex justify-end gap-2 mt-1">
                    <button
                      type="button"
                      onClick={() => setEditId(null)}
                      className="inline-flex items-center gap-1 px-3 py-1.5 border border-slate-800 rounded-lg text-slate-400 hover:bg-slate-900"
                    >
                      <X className="w-3.5 h-3.5" />
                      <span>Cancel</span>
                    </button>
                    <button
                      type="button"
                      onClick={handleSaveEdit}
                      className="inline-flex items-center gap-1 px-3 py-1.5 bg-indigo-600 hover:bg-indigo-500 rounded-lg text-white font-semibold"
                    >
                      <Save className="w-3.5 h-3.5" />
                      <span>Save Changes</span>
                    </button>
                  </div>
                </div>
              ) : (
                // Display Interface
                <div className="flex items-start justify-between gap-6">
                  <div className="flex flex-col gap-2.5">
                    <div className="flex items-center gap-3">
                      <h3 className="font-bold text-slate-100 text-sm">{service.name}</h3>
                      <span className={`text-[9px] font-bold px-2 py-0.5 rounded-full ${
                        service.active 
                          ? 'bg-emerald-500/10 border border-emerald-500/20 text-emerald-400' 
                          : 'bg-slate-800 border border-slate-700 text-slate-500'
                      }`}>
                        {service.active ? 'Active' : 'Inactive'}
                      </span>
                    </div>

                    <div className="text-xs text-slate-400 flex flex-col gap-1">
                      {service.salesDescription && <p><strong>Sales Value:</strong> {service.salesDescription}</p>}
                      {service.description && <p className="text-[11px] text-slate-500 mt-0.5"><strong>Scope details:</strong> {service.description}</p>}
                    </div>

                    <div className="flex items-center gap-4 text-xs font-mono text-slate-500 mt-1 border-t border-slate-900 pt-2.5">
                      <span>Min: <span className="text-slate-300">₹{Number(service.minPrice).toLocaleString('en-IN')}</span></span>
                      <span>Max: <span className="text-slate-300">₹{Number(service.maximumPrice).toLocaleString('en-IN')}</span></span>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={() => handleStartEdit(service)}
                    className="inline-flex items-center justify-center p-2 rounded-lg border border-slate-800 text-slate-400 hover:text-indigo-400 hover:border-indigo-500/50 transition-colors"
                  >
                    <Pencil className="w-3.5 h-3.5" />
                  </button>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
