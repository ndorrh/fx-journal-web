"use client";

import { useEffect, useState } from "react";
import { getLeaderboardData, LeaderboardEntry } from "@/lib/services/tradeService";
import { Trophy, TrendingUp, Medal } from "lucide-react";

export function Leaderboard() {
    const [leaders, setLeaders] = useState<LeaderboardEntry[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchLeaders = async () => {
            try {
                const data = await getLeaderboardData();
                setLeaders(data);
            } catch (e) {
                console.error("Failed to load leaderboard", e);
            } finally {
                setLoading(false);
            }
        };

        fetchLeaders();
    }, []);

    if (loading) return (
        <div className="w-full h-48 bg-slate-900/50 rounded-xl border border-slate-800 animate-pulse flex items-center justify-center">
            <span className="text-slate-500">Loading Top Traders...</span>
        </div>
    );

    if (leaders.length === 0) return null;

    return (
        <div className="w-full bg-slate-950/50 backdrop-blur-md border border-slate-800 rounded-xl overflow-hidden">
            {/* Header */}
            <div className="bg-gradient-to-r from-slate-900 to-slate-950 px-6 py-4 border-b border-slate-800 flex items-center justify-between">
                <div className="flex items-center gap-3">
                    <div className="bg-yellow-500/10 p-2 rounded-lg">
                        <Trophy className="w-5 h-5 text-yellow-500" />
                    </div>
                    <div>
                        <h2 className="text-lg font-bold text-white">Top Traders</h2>
                        <p className="text-xs text-slate-400">Ranked by Total R-Multiple (Performance)</p>
                    </div>
                </div>
            </div>

            {/* List */}
            <div className="divide-y divide-slate-800/50">
                {leaders.map((leader, index) => (
                    <div key={leader.userId} className="flex items-center justify-between px-6 py-4 hover:bg-slate-900/40 transition-colors group">
                        {/* Rank & User */}
                        <div className="flex items-center gap-4">
                            <div className="w-8 flex justify-center font-mono font-bold text-slate-500 group-hover:text-white transition-colors">
                                {index === 0 && <Medal className="w-6 h-6 text-yellow-400 drop-shadow-[0_0_8px_rgba(250,204,21,0.5)]" />}
                                {index === 1 && <Medal className="w-6 h-6 text-slate-300" />}
                                {index === 2 && <Medal className="w-6 h-6 text-amber-700" />}
                                {index > 2 && `#${index + 1}`}
                            </div>

                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-full bg-slate-800 border border-slate-700 flex items-center justify-center overflow-hidden">
                                    {leader.photoURL ? (
                                        <img src={leader.photoURL} alt={leader.displayName} className="w-full h-full object-cover" />
                                    ) : (
                                        <span className="text-xs font-bold text-slate-400">
                                            {leader.displayName.substring(0, 2).toUpperCase()}
                                        </span>
                                    )}
                                </div>
                                <div>
                                    <div className="font-medium text-slate-200 group-hover:text-white transition-colors">
                                        {leader.displayName}
                                    </div>
                                    <div className="text-xs text-slate-500 flex items-center gap-1">
                                        {leader.totalTrades} Trades
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Stats */}
                        <div className="flex items-center gap-8 text-right">
                            <div className="hidden sm:block">
                                <div className="text-xs text-slate-500 uppercase tracking-wider mb-0.5">Win Rate</div>
                                <div className={`font-mono font-medium ${leader.winRate >= 50 ? 'text-green-400' : 'text-slate-300'
                                    }`}>
                                    {leader.winRate}%
                                </div>
                            </div>

                            <div className="min-w-[80px]">
                                <div className="text-xs text-slate-500 uppercase tracking-wider mb-0.5">Total Return</div>
                                <div className={`font-mono font-bold text-lg flex items-center justify-end gap-1 ${leader.totalR > 0 ? 'text-cyan-400' : 'text-slate-400'
                                    }`}>
                                    {leader.totalR > 0 && "+"}
                                    {leader.totalR}R
                                </div>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}
