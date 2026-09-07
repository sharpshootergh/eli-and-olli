'use client';

import { useState, useEffect } from 'react';
import { createClient } from '@/lib/supabase/client';
import { MOCK_CATEGORIES } from '@/lib/mockData';
import { Category } from '@/lib/types';
import { FolderPlus, Trash2, Edit2, ArrowUp, ArrowDown, Save, X } from 'lucide-react';

export default function AdminCategoriesPage() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [newCatName, setNewCatName] = useState('');
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editingName, setEditingName] = useState('');

  async function loadCategories() {
    try {
      const res = await fetch('/api/categories');
      const data = await res.json();
      if (data.success && Array.isArray(data.categories)) {
        setCategories(data.categories);
      } else {
        setCategories(MOCK_CATEGORIES);
      }
    } catch {
      setCategories(MOCK_CATEGORIES);
    }
  }

  useEffect(() => {
    const timer = window.setTimeout(() => {
      void loadCategories();
    }, 0);

    return () => window.clearTimeout(timer);
  }, []);

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCatName.trim()) return;

    const newSortOrder = categories.length > 0 ? Math.max(...categories.map((c) => c.sort_order)) + 1 : 1;
    const newCategory: Category = {
      id: `cat-${Date.now()}`,
      name: newCatName.trim(),
      sort_order: newSortOrder,
    };

    setCategories([...categories, newCategory]);

    try {
      const res = await fetch('/api/categories', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ category: newCategory }),
      });
      const data = await res.json();
      if (data.success && Array.isArray(data.categories)) {
        setCategories(data.categories);
      }
    } catch {
      // Local state updated
    }

    setNewCatName('');
  };

  const handleStartRename = (cat: Category) => {
    setEditingId(cat.id);
    setEditingName(cat.name);
  };

  const handleSaveRename = async (id: string) => {
    if (!editingName.trim()) return;

    const updated = categories.map((c) => (c.id === id ? { ...c, name: editingName.trim() } : c));
    setCategories(updated);
    setEditingId(null);

    const target = updated.find((c) => c.id === id);
    if (target) {
      try {
        await fetch('/api/categories', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ category: target }),
        });
      } catch {
        // Local state updated
      }
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this category? Associated goals will also be deleted.')) return;

    setCategories(categories.filter((c) => c.id !== id));

    try {
      const res = await fetch(`/api/categories?id=${id}`, { method: 'DELETE' });
      const data = await res.json();
      if (data.success && Array.isArray(data.categories)) {
        setCategories(data.categories);
      }
    } catch {
      // Local state updated
    }
  };

  const handleMove = async (index: number, direction: 'up' | 'down') => {
    if (
      (direction === 'up' && index === 0) ||
      (direction === 'down' && index === categories.length - 1)
    )
      return;

    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    const nextCategories = [...categories];
    const temp = nextCategories[index];
    nextCategories[index] = nextCategories[targetIndex];
    nextCategories[targetIndex] = temp;

    // Update sort_order properties
    const reordered = nextCategories.map((cat, idx) => ({ ...cat, sort_order: idx + 1 }));
    setCategories(reordered);

    try {
      await fetch('/api/categories', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ categories: reordered }),
      });
    } catch {
      // Local state updated
    }
  };

  return (
    <div className="space-y-8 max-w-4xl">
      {/* Create New Category Form */}
      <div className="glass-card rounded-3xl p-6 border border-[#E3D3BC]/30 space-y-4">
        <h2 className="font-serif text-xl text-[#1a2a32]">Create Dynamic Category</h2>
        <form onSubmit={handleAdd} className="flex gap-3">
          <input
            type="text"
            value={newCatName}
            onChange={(e) => setNewCatName(e.target.value)}
            placeholder="Category name (e.g. Honeymoon, Living Room, Art)..."
            className="flex-1 px-4 py-3 rounded-xl border border-[#E3D3BC] bg-white text-sm focus:outline-none focus:ring-2 focus:ring-[#06B3F8]"
            required
          />
          <button
            type="submit"
            className="px-6 py-3 bg-[#06B3F8] hover:bg-[#5C211B] text-white font-medium text-xs uppercase tracking-wider rounded-xl transition-all flex items-center gap-2 shadow-sm"
          >
            <FolderPlus className="w-4 h-4" />
            <span>Add Category</span>
          </button>
        </form>
      </div>

      {/* Categories List & Reordering */}
      <div className="glass-card rounded-3xl p-6 sm:p-8 border border-[#E3D3BC]/30 space-y-4">
        <h2 className="font-serif text-2xl text-[#1a2a32]">Categories ({categories.length})</h2>

        <div className="space-y-3">
          {categories.map((cat, index) => {
            const isEditing = editingId === cat.id;

            return (
              <div
                key={cat.id}
                className="flex items-center justify-between p-4 rounded-2xl bg-white border border-[#E3D3BC]/20 shadow-xs hover:border-[#06B3F8]/40 transition-colors"
              >
                {isEditing ? (
                  <div className="flex items-center gap-2 flex-1 mr-4">
                    <input
                      type="text"
                      value={editingName}
                      onChange={(e) => setEditingName(e.target.value)}
                      className="flex-1 px-3 py-1.5 rounded-lg border border-[#06B3F8] text-sm focus:outline-none"
                    />
                    <button
                      onClick={() => handleSaveRename(cat.id)}
                      className="p-2 text-emerald-600 hover:bg-emerald-50 rounded-lg"
                      title="Save"
                    >
                      <Save className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => setEditingId(null)}
                      className="p-2 text-neutral-500 hover:bg-neutral-100 rounded-lg"
                      title="Cancel"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                ) : (
                  <div className="flex items-center gap-3">
                    <span className="w-7 h-7 rounded-full bg-[#E3D3BC] text-[#06B3F8] text-xs font-bold flex items-center justify-center">
                      {index + 1}
                    </span>
                    <span className="font-medium text-[#1a2a32] text-base">{cat.name}</span>
                  </div>
                )}

                {!isEditing && (
                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => handleMove(index, 'up')}
                      disabled={index === 0}
                      className="p-2 text-[#5a6a72] hover:text-[#06B3F8] disabled:opacity-30 rounded-lg hover:bg-[#E3D3BC]"
                      title="Move Up"
                    >
                      <ArrowUp className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleMove(index, 'down')}
                      disabled={index === categories.length - 1}
                      className="p-2 text-[#5a6a72] hover:text-[#06B3F8] disabled:opacity-30 rounded-lg hover:bg-[#E3D3BC]"
                      title="Move Down"
                    >
                      <ArrowDown className="w-4 h-4" />
                    </button>

                    <button
                      onClick={() => handleStartRename(cat)}
                      className="p-2 text-[#5a6a72] hover:text-[#06B3F8] rounded-lg hover:bg-[#E3D3BC]"
                      title="Rename"
                    >
                      <Edit2 className="w-4 h-4" />
                    </button>

                    <button
                      onClick={() => handleDelete(cat.id)}
                      className="p-2 text-red-500 hover:text-red-700 rounded-lg hover:bg-red-50"
                      title="Delete"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
