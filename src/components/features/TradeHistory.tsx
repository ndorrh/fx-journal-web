"use client"

import { useState, useMemo } from "react"
import { Trade } from "@/types"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card"
import { Input } from "@/components/ui/Input"
import { Select } from "@/components/ui/Select"
import { Button } from "@/components/ui/Button"
import { cn } from "@/lib/utils"

interface TradeHistoryProps {
    trades: Trade[]
}

export function TradeHistory({ trades }: TradeHistoryProps) {
    // --- Filters State ---
    const [pairFilter, setPairFilter] = useState("All")
    const [strategyFilter, setStrategyFilter] = useState("All")
    const [resultFilter, setResultFilter] = useState("All")
    const [psychologyFilter, setPsychologyFilter] = useState("All")
    const [sessionFilter, setSessionFilter] = useState("All")
    const [startDate, setStartDate] = useState("")
    const [endDate, setEndDate] = useState("")

    // --- State for Expanded Trade (Analysis View) ---
    const [expandedTradeId, setExpandedTradeId] = useState<string | null>(null)

    // --- Filtering Logic ---
    const filteredTrades = useMemo(() => {
        return trades.filter(trade => {
            // Pair
            if (pairFilter !== "All" && trade.pair !== pairFilter) return false
            // Strategy
            if (strategyFilter !== "All" && trade.strategy !== strategyFilter) return false
            // Result
            if (resultFilter !== "All" && trade.result !== resultFilter) return false
            // Psychology
            if (psychologyFilter !== "All" && trade.psychology !== psychologyFilter) return false
            // Session
            if (sessionFilter !== "All" && trade.session !== sessionFilter) return false

            // Date Range
            if (startDate) {
                const start = new Date(startDate).getTime()
                if (trade.date < start) return false
            }
            if (endDate) {
                const end = new Date(endDate).getTime()
                // Set end date to end of that day
                const endDt = new Date(endDate)
                endDt.setHours(23, 59, 59, 999)
                if (trade.date > endDt.getTime()) return false
            }

            return true
        })
    }, [trades, pairFilter, strategyFilter, resultFilter, psychologyFilter, sessionFilter, startDate, endDate])

    // --- Helper to format date ---
    const formatDate = (timestamp: number) => {
        return new Date(timestamp).toLocaleDateString(undefined, {
            month: "short", day: "numeric", hour: "2-digit", minute: "2-digit"
        })
    }

    return (
        <Card className="glass-card bg-slate-900/60 border-slate-700 w-full">
            <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle className="text-2xl font-bold text-white">
                    Trade History & Analysis
                    <span className="ml-2 text-sm font-normal text-slate-400">({filteredTrades.length} trades)</span>
                </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">

                {/* --- Filters Area --- */}
                <div className="bg-slate-900/50 p-4 rounded-lg border border-slate-800 space-y-4">
                    <div className="flex items-center justify-between text-sm text-slate-400 mb-2">
                        <span>Advanced Filters</span>
                        <button
                            onClick={() => {
                                setPairFilter("All"); setStrategyFilter("All"); setResultFilter("All");
                                setPsychologyFilter("All"); setSessionFilter("All"); setStartDate(""); setEndDate("");
                            }}
                            className="text-cyan-400 hover:text-cyan-300 transition-colors"
                        >
                            Reset All
                        </button>
                    </div>

                    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                        {/* Pair */}
                        <div className="space-y-1">
                            <label className="text-xs text-slate-500">Pair</label>
                            <Select value={pairFilter} onChange={(e) => setPairFilter(e.target.value)}>
                                <option value="All">All Pairs</option>
                                {Array.from(new Set(trades.map(t => t.pair))).map(p => <option key={p} value={p}>{p}</option>)}
                            </Select>
                        </div>

                        {/* Strategy */}
                        <div className="space-y-1">
                            <label className="text-xs text-slate-500">Strategy</label>
                            <Select value={strategyFilter} onChange={(e) => setStrategyFilter(e.target.value)}>
                                <option value="All">All Stategies</option>
                                <option value="SupplyDemand">Supply & Demand</option>
                                <option value="ICT">ICT</option>
                            </Select>
                        </div>

                        {/* Result */}
                        <div className="space-y-1">
                            <label className="text-xs text-slate-500">Result</label>
                            <Select value={resultFilter} onChange={(e) => setResultFilter(e.target.value)}>
                                <option value="All">All Results</option>
                                <option value="Win">Win</option>
                                <option value="Loss">Loss</option>
                                <option value="BE">Break Even</option>
                            </Select>
                        </div>

                        {/* Psychology */}
                        <div className="space-y-1">
                            <label className="text-xs text-slate-500">Psychology</label>
                            <Select value={psychologyFilter} onChange={(e) => setPsychologyFilter(e.target.value)}>
                                <option value="All">All Mindsets</option>
                                {Array.from(new Set(trades.filter(t => t.psychology).map(t => t.psychology))).map(p => <option key={p} value={p}>{p}</option>)}
                            </Select>
                        </div>

                        {/* Date Start */}
                        <div className="space-y-1">
                            <label className="text-xs text-slate-500">From Date</label>
                            <Input
                                type="date"
                                value={startDate}
                                onChange={(e) => setStartDate(e.target.value)}
                                className="h-9 text-xs"
                            />
                        </div>

                        {/* Date End */}
                        <div className="space-y-1">
                            <label className="text-xs text-slate-500">To Date</label>
                            <Input
                                type="date"
                                value={endDate}
                                onChange={(e) => setEndDate(e.target.value)}
                                className="h-9 text-xs"
                            />
                        </div>
                    </div>
                </div>

                {/* --- Trade List --- */}
                <div className="space-y-3">
                    {filteredTrades.length === 0 ? (
                        <div className="text-center py-10 text-slate-500">No trades match your filters.</div>
                    ) : (
                        filteredTrades.map((trade) => (
                            <div
                                key={trade.id}
                                className="bg-slate-800/20 hover:bg-slate-800/40 border border-slate-700/50 rounded-lg overflow-hidden transition-all duration-200"
                            >
                                {/* Header Row (Always Visible) */}
                                <div
                                    className="p-4 flex items-center justify-between cursor-pointer"
                                    onClick={() => setExpandedTradeId(expandedTradeId === trade.id ? null : trade.id!)}
                                >
                                    <div className="flex items-center space-x-4">

                                        {/* Result Tag */}
                                        <div className={cn(
                                            "w-2 h-12 rounded-full",
                                            trade.result === "Win" ? "bg-green-500" : trade.result === "Loss" ? "bg-red-500" : "bg-slate-500"
                                        )}></div>

                                        <div>
                                            <div className="flex items-center space-x-2">
                                                <h4 className="font-bold text-white">{trade.pair}</h4>
                                                <span className={cn(
                                                    "text-[10px] px-2 py-0.5 rounded uppercase font-bold tracking-wider",
                                                    trade.direction === "Long" ? "bg-cyan-900/30 text-cyan-400" : "bg-red-900/30 text-red-400"
                                                )}>
                                                    {trade.direction}
                                                </span>
                                            </div>
                                            <p className="text-xs text-slate-400 mt-1">{formatDate(trade.date)}</p>
                                        </div>
                                    </div>

                                    {/* Metrics */}
                                    <div className="flex items-center space-x-6 text-right">
                                        <div>
                                            <div className="text-xs text-slate-500 uppercase">RR</div>
                                            <div className="text-sm font-semibold text-slate-200">{trade.rr}R</div>
                                        </div>
                                        <div>
                                            <div className="text-xs text-slate-500 uppercase">PnL</div>
                                            <div className={cn("text-sm font-semibold", trade.pnl && trade.pnl > 0 ? "text-green-400" : "text-red-400")}>
                                                {trade.pnl ? `$${trade.pnl}` : "-"}
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* Expanded Analysis (Details) */}
                                {expandedTradeId === trade.id && (
                                    <div className="bg-slate-900/50 p-4 border-t border-slate-800 text-sm animate-in slide-in-from-top-2">
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

                                            {/* Trade Context */}
                                            <div className="space-y-3">
                                                <h5 className="font-semibold text-cyan-400 border-b border-cyan-900/30 pb-1">Trade Mechanics</h5>
                                                <div className="grid grid-cols-2 gap-2 text-slate-300">
                                                    <span className="text-slate-500">Strategy:</span> <span>{trade.strategy === "SupplyDemand" ? "Supply & Demand" : trade.strategy}</span>

                                                    {trade.strategy === "SupplyDemand" && <>
                                                        <span className="text-slate-500">Zone Type:</span> <span>{trade.zoneType || "-"}</span>
                                                        <span className="text-slate-500">Confirmation:</span> <span>{trade.confirmation || "-"}</span>
                                                    </>}

                                                    {trade.strategy === "ICT" && <>
                                                        <span className="text-slate-500">PD Array:</span> <span>{trade.pdArray || "-"}</span>
                                                        <span className="text-slate-500">Target:</span> <span>{trade.liquidityTarget || "-"}</span>
                                                    </>}

                                                    <span className="text-slate-500">Session:</span> <span>{trade.session}</span>
                                                </div>
                                            </div>

                                            {/* Mental & Notes */}
                                            <div className="space-y-3">
                                                <h5 className="font-semibold text-purple-400 border-b border-purple-900/30 pb-1">Analysis & Psychology</h5>
                                                <div className="space-y-2">
                                                    <div className="flex items-center space-x-2">
                                                        <span className="text-xs text-slate-500 uppercase tracking-wide">State of Mind:</span>
                                                        <span className="px-2 py-0.5 rounded bg-slate-800 text-slate-200 text-xs">{trade.psychology || "Not Recorded"}</span>
                                                    </div>

                                                    <div>
                                                        <span className="text-xs text-slate-500 uppercase tracking-wide block mb-1">Notes:</span>
                                                        <p className="text-slate-300 whitespace-pre-wrap bg-black/20 p-2 rounded border border-white/5">
                                                            {trade.notes || "No notes added for this trade."}
                                                        </p>
                                                    </div>

                                                    {trade.tags && trade.tags.length > 0 && (
                                                        <div className="flex flex-wrap gap-1 mt-2">
                                                            {trade.tags.map((tag, idx) => (
                                                                <span key={idx} className="text-[10px] bg-cyan-900/20 text-cyan-500 px-2 py-0.5 rounded-full border border-cyan-900/30">
                                                                    #{tag}
                                                                </span>
                                                            ))}
                                                        </div>
                                                    )}
                                                </div>
                                            </div>

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
