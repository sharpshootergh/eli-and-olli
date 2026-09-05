'use client';

import { useState, useEffect } from 'react';
import { createClient } from '@/lib/supabase/client';
import { MOCK_CATEGORIES, MOCK_GOALS } from '@/lib/mockData';
import { Category, Goal, GoalType } from '@/lib/types';
import { Plus, Trash2, Edit2, Upload, X } from 'lucide-react';

export default function AdminGoalsPage() {
  const [categories, setCategories] = useState<Category[]>(MOCK_CATEGORIES);
  const [goals, setGoals] = useState<Goal[]>([]);

  // Form states
  const [showModal, setShowModal] = useState(false);
  const [editingGoal, setEditingGoal] = useState<Goal | null>(null);

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [categoryId, setCategoryId] = useState('');
  const [type, setType] = useState<GoalType>('capped');
  const [targetAmount, setTargetAmount] = useState('');
  const [uploadingImage, setUploadingImage] = useState(false);

  async function loadData() {
    try {
      const res = await fetch('/api/goals');
      const data = await res.json();
      if (data.success && Array.isArray(data.goals) && data.goals.length > 0) {
        setGoals(data.goals);
      } else {
        const supabase = createClient();
        const { data: dbGoals } = await supabase.from('goals').select('*').order('sort_order', { ascending: true });
        if (dbGoals && dbGoals.length > 0) setGoals(dbGoals);
        else setGoals(MOCK_GOALS);
      }
    } catch {
      setGoals(MOCK_GOALS);
    }
  }

  useEffect(() => {
    void loadData();
  }, []);

  const openCreateModal = () => {
    setEditingGoal(null);
    setTitle('');
    setDescription('');
    setImageUrl('');
    setCategoryId(categories[0]?.id || 'cat-1');
    setType('capped');
    setTargetAmount('5000');
    setShowModal(true);
  };

  const openEditModal = (goal: Goal) => {
    setEditingGoal(goal);
    setTitle(goal.title);
    setDescription(goal.description || '');
    setImageUrl(goal.image_url || '');
    setCategoryId(goal.category_id);
    setType(goal.type);
    setTargetAmount(goal.target_amount ? String(goal.target_amount) : '');
    setShowModal(true);
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadingImage(true);
    try {
      const supabase = createClient();
      const filename = `goal-${Date.now()}-${file.name.replace(/[^a-zA-Z0-9.]/g, '')}`;

      const { data, error } = await supabase.storage.from('goal-images').upload(filename, file);

      if (!error && data) {
        const { data: publicUrlData } = supabase.storage.from('goal-images').getPublicUrl(filename);
        setImageUrl(publicUrlData.publicUrl);
      } else {
        const blobUrl = URL.createObjectURL(file);
        setImageUrl(blobUrl);
      }
    } catch {
      const blobUrl = URL.createObjectURL(file);
      setImageUrl(blobUrl);
    } finally {
      setUploadingImage(false);
    }
  };

  const handleSaveGoal = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    const parsedTarget = type === 'capped' ? parseFloat(targetAmount) || 0 : null;

    const goalRecord: Goal = {
      id: editingGoal ? editingGoal.id : `goal-${Date.now()}`,
      category_id: categoryId || 'cat-1',
      title: title.trim(),
      description: description.trim() || null,
      image_url: imageUrl.trim() || null,
      type,
      target_amount: parsedTarget,
      sort_order: editingGoal ? editingGoal.sort_order : goals.length + 1,
      amount_raised: editingGoal ? editingGoal.amount_raised : 0,
      contributor_count: editingGoal ? editingGoal.contributor_count : 0,
    };

    // 1. Update UI state instantly
    if (editingGoal) {
      setGoals(goals.map((g) => (g.id === editingGoal.id ? goalRecord : g)));
    } else {
      setGoals([goalRecord, ...goals]);
    }

    // 2. Persist to API route & DB
    try {
      await fetch('/api/goals', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ goal: goalRecord }),
      });
    } catch {
      // Handled via local state
    }

    setShowModal(false);
  };

  const handleDeleteGoal = async (id: string) => {
    if (!confirm('Are you sure you want to delete this goal?')) return;
    setGoals(goals.filter((g) => g.id !== id));

    try {
      await fetch(`/api/goals?id=${id}`, { method: 'DELETE' });
    } catch {
      // Handled locally
    }
  };

  return (
    <div className="space-y-8">
      {/* Top Action Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="font-serif text-2xl text-[#1a2a32]">Registry Goals ({goals.length})</h2>
          <p className="text-xs text-[#5a6a72]">Create and manage registry items, target amounts, photos, and links.</p>
        </div>

        <button
          onClick={openCreateModal}
          className="px-6 py-3 bg-[#06B3F8] hover:bg-[#0596D3] text-white font-medium text-xs uppercase tracking-wider rounded-xl transition-all flex items-center gap-2 shadow-md"
        >
          <Plus className="w-4 h-4" />
          <span>Create Goal</span>
        </button>
      </div>

      {/* Goals Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {goals.map((goal) => {
          const categoryName = categories.find((c) => c.id === goal.category_id)?.name || 'Registry';
          const isCapped = goal.type === 'capped';

          return (
            <div key={goal.id} className="glass-card rounded-3xl p-6 border border-[#E3D3BC]/30 space-y-4 flex flex-col justify-between bg-white shadow-sm">
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-semibold uppercase tracking-wider px-2.5 py-1 bg-[#E3D3BC]/50 text-[#06B3F8] rounded-full">
                    {categoryName}
                  </span>
                  <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-md ${isCapped ? 'bg-[#06B3F8] text-white' : 'bg-[#E3D3BC] text-[#1a2a32]'}`}>
                    {goal.type}
                  </span>
                </div>

                {goal.image_url && (
                  <div className="relative aspect-[16/9] w-full overflow-hidden rounded-xl bg-gray-100">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={goal.image_url} alt={goal.title} className="w-full h-full object-cover" />
                  </div>
                )}

                <h3 className="font-serif text-xl text-[#1a2a32] font-medium">{goal.title}</h3>
                <p className="text-xs text-[#5a6a72] line-clamp-2">{goal.description}</p>

                <div className="text-xs space-y-1 pt-2 border-t border-[#E3D3BC]/20">
                  {isCapped && (
                    <div className="flex justify-between font-medium">
                      <span>Target Amount:</span>
                      <span className="font-bold">GHS {goal.target_amount?.toLocaleString('en-GH')}</span>
                    </div>
                  )}
                  <div className="flex justify-between font-bold text-[#06B3F8]">
                    <span>Raised:</span>
                    <span>GHS {goal.amount_raised?.toLocaleString('en-GH')}</span>
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 pt-4 border-t border-[#E3D3BC]/20">
                <button
                  onClick={() => openEditModal(goal)}
                  className="px-3 py-1.5 text-xs text-[#06B3F8] hover:bg-[#E3D3BC]/40 rounded-lg transition-colors font-medium flex items-center gap-1"
                >
                  <Edit2 className="w-3.5 h-3.5" />
                  Edit
                </button>
                <button
                  onClick={() => handleDeleteGoal(goal.id)}
                  className="px-3 py-1.5 text-xs text-red-600 hover:bg-red-50 rounded-lg transition-colors font-medium flex items-center gap-1"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  Delete
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Goal Create / Edit Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-md flex items-center justify-center p-4 overflow-y-auto animate-in fade-in">
          <div className="relative max-w-lg w-full bg-[#EDEFEE] rounded-3xl p-6 sm:p-8 shadow-2xl border border-[#E3D3BC]/30 my-8 space-y-6">
            <button
              onClick={() => setShowModal(false)}
              className="absolute top-6 right-6 text-[#5a6a72] hover:text-[#1a2a32]"
            >
              <X className="w-5 h-5" />
            </button>

            <h2 className="font-serif text-2xl text-[#1a2a32]">
              {editingGoal ? 'Edit Registry Goal' : 'Create New Goal'}
            </h2>

            <form onSubmit={handleSaveGoal} className="space-y-4 text-xs">
              {/* Title */}
              <div className="space-y-1">
                <label className="font-semibold uppercase tracking-wider text-[#06B3F8]">Title *</label>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="e.g. Honeymoon Safari in Mole"
                  className="w-full px-4 py-2.5 rounded-xl border border-[#E3D3BC] bg-white text-sm"
                  required
                />
              </div>

              {/* Description */}
              <div className="space-y-1">
                <label className="font-semibold uppercase tracking-wider text-[#06B3F8]">Description</label>
                <textarea
                  rows={3}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Describe why this gift is special to you..."
                  className="w-full px-4 py-2.5 rounded-xl border border-[#E3D3BC] bg-white text-sm resize-none"
                />
              </div>

              {/* Goal Type Toggle (capped vs open) */}
              <div className="space-y-1">
                <label className="font-semibold uppercase tracking-wider text-[#06B3F8]">Goal Type *</label>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={() => setType('capped')}
                    className={`py-2.5 rounded-xl border font-semibold text-center transition-all ${
                      type === 'capped'
                        ? 'bg-[#06B3F8] text-white border-[#06B3F8]'
                        : 'bg-white text-[#5a6a72] border-[#E3D3BC]'
                    }`}
                  >
                    Capped Goal (Target Amount)
                  </button>

                  <button
                    type="button"
                    onClick={() => setType('open')}
                    className={`py-2.5 rounded-xl border font-semibold text-center transition-all ${
                      type === 'open'
                        ? 'bg-[#06B3F8] text-white border-[#06B3F8]'
                        : 'bg-white text-[#5a6a72] border-[#E3D3BC]'
                    }`}
                  >
                    Open Fund (No Target Shown)
                  </button>
                </div>
              </div>

              {/* Target Amount Field (Only shown/required if type === capped) */}
              {type === 'capped' && (
                <div className="space-y-1">
                  <label className="font-semibold uppercase tracking-wider text-[#06B3F8]">Target Amount (GHS) *</label>
                  <input
                    type="number"
                    min="1"
                    value={targetAmount}
                    onChange={(e) => setTargetAmount(e.target.value)}
                    placeholder="e.g. 5000"
                    className="w-full px-4 py-2.5 rounded-xl border border-[#E3D3BC] bg-white text-sm font-medium"
                    required={type === 'capped'}
                  />
                </div>
              )}

              {/* Image URL / File Upload */}
              <div className="space-y-1">
                <label className="font-semibold uppercase tracking-wider text-[#06B3F8]">Goal Photo URL</label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={imageUrl}
                    onChange={(e) => setImageUrl(e.target.value)}
                    placeholder="https://images.unsplash.com/... or paste image URL"
                    className="flex-1 px-4 py-2.5 rounded-xl border border-[#E3D3BC] bg-white text-sm"
                  />
                  <label className="cursor-pointer px-4 py-2.5 bg-[#E3D3BC] hover:bg-[#E3D3BC] text-[#06B3F8] font-semibold rounded-xl flex items-center gap-1">
                    <Upload className="w-4 h-4" />
                    <span>Upload</span>
                    <input type="file" accept="image/*" onChange={handleImageUpload} className="hidden" />
                  </label>
                </div>
                {uploadingImage && <p className="text-[11px] text-[#06B3F8]">Uploading image...</p>}
              </div>

              <button
                type="submit"
                className="w-full py-3.5 bg-[#06B3F8] hover:bg-[#0596D3] text-white font-medium text-xs uppercase tracking-wider rounded-xl transition-all shadow-md mt-4"
              >
                Save Goal
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
