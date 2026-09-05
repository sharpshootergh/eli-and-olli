'use client';

import { useState, useEffect } from 'react';
import { createClient } from '@/lib/supabase/client';
import { MOCK_GOALS, MOCK_CONTRIBUTIONS } from '@/lib/mockData';
import { Goal, Contribution } from '@/lib/types';
import { PiggyBank, Users, Target, Gift } from 'lucide-react';

export default function AdminDashboardPage() {
  const [goals, setGoals] = useState<Goal[]>([]);
  const [contributions, setContributions] = useState<Contribution[]>([]);

  useEffect(() => {
    async function loadDashboard() {
      try {
        const supabase = createClient();

        const { data: goalsData } = await supabase
          .from('goals')
          .select('*')
          .order('sort_order', { ascending: true });

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

    loadDashboard();
  }, []);

  // Compute Grand Total Raised (Includes both capped and open goals!)
  const grandTotal = goals.reduce((sum, g) => sum + (g.amount_raised || 0), 0);
  const totalContributors = contributions.length;

  return (
    <div className="space-y-8">
      {/* Top Metric Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Total Raised Card */}
        <div className="glass-card rounded-3xl p-6 border border-[#E3D3BC]/30 space-y-2">
          <div className="flex items-center justify-between text-[#06B3F8]">
            <span className="text-xs font-semibold uppercase tracking-wider">Overall Raised</span>
            <PiggyBank className="w-6 h-6 text-[#06B3F8]" />
          </div>
          <div className="font-serif text-3xl font-bold text-[#1a2a32]">
            GHS {grandTotal.toLocaleString('en-GH', { minimumFractionDigits: 2 })}
          </div>
          <p className="text-xs text-[#5a6a72]">True aggregate across all capped & open goals</p>
        </div>

        {/* Total Contributors Card */}
        <div className="glass-card rounded-3xl p-6 border border-[#E3D3BC]/30 space-y-2">
          <div className="flex items-center justify-between text-[#06B3F8]">
            <span className="text-xs font-semibold uppercase tracking-wider">Total Contributions</span>
            <Users className="w-6 h-6 text-[#06B3F8]" />
          </div>
          <div className="font-serif text-3xl font-bold text-[#1a2a32]">
            {totalContributors}
          </div>
          <p className="text-xs text-[#5a6a72]">Unique payment transactions logged</p>
        </div>

        {/* Total Registry Goals */}
        <div className="glass-card rounded-3xl p-6 border border-[#E3D3BC]/30 space-y-2">
          <div className="flex items-center justify-between text-[#06B3F8]">
            <span className="text-xs font-semibold uppercase tracking-wider">Active Goals</span>
            <Target className="w-6 h-6 text-[#06B3F8]" />
          </div>
          <div className="font-serif text-3xl font-bold text-[#1a2a32]">
            {goals.length}
          </div>
          <p className="text-xs text-[#5a6a72]">
            {goals.filter((g) => g.type === 'capped').length} Capped • {goals.filter((g) => g.type === 'open').length} Open
          </p>
        </div>
      </div>

      {/* Goal True Totals Breakdown Table */}
      <div className="glass-card rounded-3xl p-6 sm:p-8 border border-[#E3D3BC]/30 space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="font-serif text-2xl text-[#1a2a32]">Goal Financial Breakdown</h2>
            <p className="text-xs text-[#5a6a72]">
              View exact raised amounts for every goal (including open goals which hide totals publicly).
            </p>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm border-collapse">
            <thead>
              <tr className="border-b border-[#E3D3BC]/30 text-xs font-semibold uppercase tracking-wider text-[#06B3F8] pb-3">
                <th className="py-3 px-4">Goal Title</th>
                <th className="py-3 px-4">Type</th>
                <th className="py-3 px-4">Target Amount</th>
                <th className="py-3 px-4">True Amount Raised</th>
                <th className="py-3 px-4">Progress / Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#E3D3BC]/15 text-[#1a2a32]">
              {goals.map((goal) => {
                const isCapped = goal.type === 'capped';
                const target = goal.target_amount || 0;
                const raised = goal.amount_raised || 0;
                const percent = isCapped && target > 0 ? Math.min(100, Math.round((raised / target) * 100)) : null;

                return (
                  <tr key={goal.id} className="hover:bg-[#E3D3BC]/50 transition-colors">
                    <td className="py-4 px-4 font-medium flex items-center gap-2">
                      <Gift className="w-4 h-4 text-[#06B3F8] flex-shrink-0" />
                      <span>{goal.title}</span>
                    </td>
                    <td className="py-4 px-4">
                      <span
                        className={`px-2.5 py-1 rounded-full text-[11px] font-semibold uppercase tracking-wider ${
                          isCapped ? 'bg-[#06B3F8] text-white' : 'bg-[#E3D3BC] text-[#1a2a32]'
                        }`}
                      >
                        {goal.type}
                      </span>
                    </td>
                    <td className="py-4 px-4 text-[#5a6a72]">
                      {isCapped ? `GHS ${target.toLocaleString('en-GH')}` : '— (Open)'}
                    </td>
                    <td className="py-4 px-4 font-bold text-[#06B3F8]">
                      GHS {raised.toLocaleString('en-GH', { minimumFractionDigits: 2 })}
                    </td>
                    <td className="py-4 px-4">
                      {isCapped ? (
                        <div className="w-36 space-y-1">
                          <div className="flex justify-between text-[11px] text-[#5a6a72]">
                            <span>{percent}%</span>
                          </div>
                          <div className="w-full h-2 bg-[#E3D3BC] rounded-full overflow-hidden">
                            <div
                              className="h-full bg-[#06B3F8] rounded-full"
                              style={{ width: `${percent}%` }}
                            />
                          </div>
                        </div>
                      ) : (
                        <span className="text-xs text-[#5a6a72] font-medium">Ongoing Open Fund</span>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
