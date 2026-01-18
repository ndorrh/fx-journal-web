"use client"

import { useState, useMemo } from "react"
import { Trade } from "@/types"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card"
import { Input } from "@/components/ui/Input"
import { Select } from "@/components/ui/Select"
import { cn } from "@/lib/utils"

interface TradeHistoryProps {
    trades: Trade[]
}

export function TradeHistory({ trades }: TradeHistoryProps) {
    const [pairFilter, setPairFilter] = useState("All")
    const [statusFilter, setStatusFilter] = useState("All")
    const [expandedTradeId, setExpandedTradeId] = useState<string | null>(null)

    const filteredTrades = useMemo(() => {
        return trades.filter(trade => {
            if (pairFilter !== "All" && trade.instrument !== pairFilter) return false
            if (statusFilter !== "All" && trade.status !== statusFilter) return false
            return true
        })
    }, [trades, pairFilter, statusFilter])

    const formatDate = (timestamp: number) => {
        return new Date(timestamp).toLocaleDateString(undefined, {
            month: "short", day: "numeric", hour: "2-digit", minute: "2-digit"
        })
    }

    return (
        <Card className="glass-card bg-slate-900/60 border-slate-700 w-full">
            <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle className="text-2xl font-bold text-white">
                    Trade Journal
                    <span className="ml-2 text-sm font-normal text-slate-400">({filteredTrades.length})</span>
                </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">

                {/* Simple Filters */}
                <div className="flex gap-4">
                    <Select value={pairFilter} onChange={(e) => setPairFilter(e.target.value)} className="w-[150px]">
                        <option key="all" value="All">All Pairs</option>
                        {Array.from(new Set(trades.map(t => t.instrument))).map(p => <option key={p} value={p}>{p}</option>)}
                    </Select>
                    <Select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} className="w-[150px]">
                        <option key="all" value="All">All Statuses</option>
                        <option key="planned" value="Planned">Planned</option>
                        <option key="open" value="Open">Open</option>
                        <option key="closed" value="Closed">Closed</option>
                    </Select>
                </div>

                <div className="space-y-3">
                    {filteredTrades.length === 0 ? (
                        <div className="text-center py-10 text-slate-500">No trades found.</div>
                    ) : (
                        filteredTrades.map((trade, idx) => (
                            <div
                                key={trade.id || idx}
                                className="bg-slate-800/20 hover:bg-slate-800/40 border border-slate-700/50 rounded-lg overflow-hidden transition-all duration-200"
                            >
                                <div
                                    className="p-4 flex items-center justify-between cursor-pointer"
                                    onClick={() => setExpandedTradeId(expandedTradeId === trade.id ? null : trade.id!)}
                                >
                                    <div className="flex items-center space-x-4">
                                        {/* Status Indicator */}
                                        <div className={cn(
                                            "w-2 h-12 rounded-full",
                                            trade.status === "Planned" ? "bg-blue-500" :
                                                trade.outcome === "Win" ? "bg-green-500" :
                                                    trade.outcome === "Loss" ? "bg-red-500" : "bg-slate-500"
                                        )}></div>

                                        <div>
                                            <div className="flex items-center space-x-2">
                                                <h4 className="font-bold text-white">{trade.instrument}</h4>
                                                <span className={cn(
                                                    "text-[10px] px-2 py-0.5 rounded uppercase font-bold tracking-wider",
                                                    trade.direction === "Long" ? "bg-cyan-900/30 text-cyan-400" : "bg-red-900/30 text-red-400"
                                                )}>
                                                    {trade.direction}
                                                </span>
                                                <span className="text-[10px] px-2 py-0.5 rounded bg-slate-700 text-slate-300">
                                                    {trade.status}
                                                </span>
                                            </div>
                                            <p className="text-xs text-slate-400 mt-1">{formatDate(trade.date)}</p>
                                        </div>
                                    </div>

                                    {/* Metrics */}
                                    <div className="flex items-center space-x-6 text-right">
                                        {trade.status === "Planned" ? (
                                            <div>
                                                <div className="text-xs text-slate-500 uppercase">Plan RR</div>
                                                <div className="text-sm font-semibold text-blue-300">{trade.plannedRR}R</div>
                                            </div>
                                        ) : (
                                            <>
                                                <div>
                                                    <div className="text-xs text-slate-500 uppercase">Actual RR</div>
                                                    <div className="text-sm font-semibold text-slate-200">{trade.actualRR || "-"}R</div>
                                                </div>
                                                <div>
                                                    <div className="text-xs text-slate-500 uppercase">PnL</div>
                                                    <div className={cn("text-sm font-semibold", (trade.pnl || 0) > 0 ? "text-green-400" : "text-red-400")}>
                                                        {trade.pnl ? `$${trade.pnl}` : "-"}
                                                    </div>
                                                </div>
                                            </>
                                        )}
                                    </div>
                                </div>

                                {/* Expanded Details */}
                                {expandedTradeId === trade.id && (
                                    <div className="bg-slate-900/50 p-4 border-t border-slate-800 grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <div>
                                            <h5 className="font-semibold text-cyan-400 mb-2">Plan Details</h5>
                                            <div className="text-sm text-slate-400 space-y-1">
                                                <p>Entry: <span className="text-slate-200">{trade.plannedEntry}</span></p>
                                                <p>Stop: <span className="text-slate-200">{trade.plannedSL}</span></p>
                                                <p>Target: <span className="text-slate-200">{trade.plannedTP}</span></p>
                                                <p>Reason: <span className="text-slate-200">{trade.entryReason}</span></p>
                                            </div>
                                        </div>
                                        <div>
                                            <h5 className="font-semibold text-purple-400 mb-2">Analysis</h5>
                                            <p className="text-sm text-slate-300 italic">"{trade.notes}"</p>
                                            {trade.beforeImageUrl && (
                                                <a href={trade.beforeImageUrl} target="_blank" className="text-xs text-blue-400 hover:underline mt-2 block">View Setup Chart</a>
                                            )}
                                        </div>
                                        <div className="md:col-span-2 pt-2 border-t border-slate-800 flex justify-end">
                                            <a
                                                href={`/trades/${trade.id}`}
                                                className="bg-cyan-600/20 hover:bg-cyan-600/40 text-cyan-400 text-xs px-4 py-2 rounded transition-colors border border-cyan-500/30 font-medium uppercase tracking-wider"
                                            >
                                                {trade.status === "Planned" ? "Execute / Close Trade" : "View Full Details"}
                                            </a>
                                        </div>
                                    </div>
                                )}
                            </div>
                        ))
                    )}
                </div>
            </CardContent>
        </Card>
    )
}
