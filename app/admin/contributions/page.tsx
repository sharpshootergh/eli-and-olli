'use client';

import { useState, useEffect } from 'react';
import { createClient } from '@/lib/supabase/client';
import { MOCK_CONTRIBUTIONS, MOCK_GOALS } from '@/lib/mockData';
import { Contribution, Goal } from '@/lib/types';
import { Search, Filter, MessageSquare, ArrowUpDown } from 'lucide-react';

export default function AdminContributionsPage() {
  const [contributions, setContributions] = useState<Contribution[]>([]);
  const [goals, setGoals] = useState<Goal[]>([]);
  const [filterGoalId, setFilterGoalId] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [sortBy, setSortBy] = useState<'date' | 'amount'>('date');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');

  useEffect(() => {
    async function loadData() {
      try {
        const supabase = createClient();
        const { data: goalsData } = await supabase.from('goals').select('*');
        const { data: contribsData } = await supabase
          .from('contributions')
          .select('*')
          .order('created_at', { ascending: false });

        if (goalsData && goalsData.length > 0) setGoals(goalsData);
        else setGoals(MOCK_GOALS);

        if (contribsData && contribsData.length > 0) setContributions(contribsData);
        else setContributions(MOCK_CONTRIBUTIONS);
      } catch {
        setGoals(MOCK_GOALS);
        setContributions(MOCK_CONTRIBUTIONS);
      }
    }

    loadData();
  }, []);

  // Filter & Sort Logic
  const filtered = contributions
    .filter((c) => {
      const matchGoal = filterGoalId === 'all' || c.goal_id === filterGoalId;
      const q = searchQuery.toLowerCase();
      const matchQuery =
        !q ||
        c.contributor_name.toLowerCase().includes(q) ||
        c.contributor_email.toLowerCase().includes(q) ||
        (c.message && c.message.toLowerCase().includes(q)) ||
        c.paystack_reference.toLowerCase().includes(q);

      return matchGoal && matchQuery;
    })
    .sort((a, b) => {
      if (sortBy === 'amount') {
        return sortOrder === 'desc' ? b.amount - a.amount : a.amount - b.amount;
      }
      // sort by date
      const dA = new Date(a.created_at).getTime();
      const dB = new Date(b.created_at).getTime();
      return sortOrder === 'desc' ? dB - dA : dA - dB;
    });

  const toggleSort = (type: 'date' | 'amount') => {
    if (sortBy === type) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(type);
      setSortOrder('desc');
    }
  };

  return (
    <div className="space-y-8">
      {/* Header & Controls */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="font-serif text-2xl text-[#1a2a32]">Contributions Log ({filtered.length})</h2>
          <p className="text-xs text-[#5a6a72]">Read-only ledger of verified Paystack contributions.</p>
        </div>

        {/* Filters */}
        <div className="flex flex-wrap items-center gap-3 text-xs">
          {/* Search */}
          <div className="relative">
            <Search className="w-4 h-4 text-[#5a6a72] absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by name, email..."
              className="pl-9 pr-4 py-2.5 rounded-xl border border-[#E3D3BC] bg-white focus:outline-none"
            />
          </div>

          {/* Goal Filter Dropdown */}
          <div className="flex items-center gap-1.5 bg-white border border-[#E3D3BC] px-3 py-2 rounded-xl">
            <Filter className="w-3.5 h-3.5 text-[#06B3F8]" />
            <select
              value={filterGoalId}
              onChange={(e) => setFilterGoalId(e.target.value)}
              className="bg-transparent focus:outline-none text-[#1a2a32] font-medium"
            >
              <option value="all">All Goals</option>
              {goals.map((g) => (
                <option key={g.id} value={g.id}>
                  {g.title}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Contributions Table */}
      <div className="glass-card rounded-3xl p-6 sm:p-8 border border-[#E3D3BC]/30 overflow-x-auto">
        <table className="w-full text-left text-sm border-collapse">
          <thead>
            <tr className="border-b border-[#E3D3BC]/30 text-xs font-semibold uppercase tracking-wider text-[#06B3F8]">
              <th className="py-3 px-4">Contributor</th>
              <th className="py-3 px-4">Goal</th>
              <th className="py-3 px-4 cursor-pointer hover:text-[#06B3F8]" onClick={() => toggleSort('amount')}>
                <div className="flex items-center gap-1">
                  <span>Amount (GHS)</span>
                  <ArrowUpDown className="w-3 h-3" />
                </div>
              </th>
              <th className="py-3 px-4">Message</th>
              <th className="py-3 px-4 cursor-pointer hover:text-[#06B3F8]" onClick={() => toggleSort('date')}>
                <div className="flex items-center gap-1">
                  <span>Date & Reference</span>
                  <ArrowUpDown className="w-3 h-3" />
                </div>
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#E3D3BC]/15 text-[#1a2a32]">
            {filtered.length === 0 ? (
              <tr>
                <td colSpan={5} className="py-8 text-center text-xs text-[#5a6a72]">
                  No contributions found matching your filters.
                </td>
              </tr>
            ) : (
              filtered.map((c) => {
                const goalTitle = goals.find((g) => g.id === c.goal_id)?.title || 'Goal';

                return (
                  <tr key={c.id} className="hover:bg-[#E3D3BC]/50 transition-colors">
                    <td className="py-4 px-4">
                      <div className="font-semibold text-[#1a2a32]">{c.contributor_name}</div>
                      <div className="text-xs text-[#5a6a72]">{c.contributor_email}</div>
                      {c.contributor_phone && <div className="text-[11px] text-[#5a6a72]">{c.contributor_phone}</div>}
                    </td>

                    <td className="py-4 px-4 font-medium text-[#06B3F8]">
                      {goalTitle}
                    </td>

                    <td className="py-4 px-4 font-bold text-base text-[#06B3F8]">
                      GHS {c.amount.toLocaleString('en-GH', { minimumFractionDigits: 2 })}
                    </td>

                    <td className="py-4 px-4 max-w-xs text-xs text-[#5a6a72] italic">
                      {c.message ? (
                        <div className="flex items-start gap-1">
                          <MessageSquare className="w-3.5 h-3.5 text-[#06B3F8] flex-shrink-0 mt-0.5" />
                          <span>“{c.message}”</span>
                        </div>
                      ) : (
                        <span className="text-[#5a6a72] font-normal">No message</span>
                      )}
                    </td>

                    <td className="py-4 px-4 text-xs text-[#5a6a72]">
                      <div>{new Date(c.created_at).toLocaleDateString('en-GH', { dateStyle: 'medium' })}</div>
                      <div className="font-mono text-[10px] text-[#5a6a72] pt-0.5">{c.paystack_reference}</div>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
