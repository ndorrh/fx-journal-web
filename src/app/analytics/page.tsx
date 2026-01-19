"use client"

import { useEffect, useState, useMemo } from "react"
import { useAuth } from "@/context/AuthContext"
import { getTrades } from "@/lib/services/tradeService"
import { AnalyticsChart } from "@/components/features/AnalyticsChart"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card"
import { Button } from "@/components/ui/Button"
import { ArrowLeft } from "lucide-react"
import { useRouter, useSearchParams } from "next/navigation"

import { Suspense } from "react"

function AnalyticsPage() {
    const { user } = useAuth()
    const router = useRouter()
    const searchParams = useSearchParams()
    const viewAsUserId = searchParams.get('userId')
    const effectiveUserId = viewAsUserId || user?.uid

    const [trades, setTrades] = useState<any[]>([])
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        if (effectiveUserId) {
            getTrades(effectiveUserId).then(t => {
                setTrades(t.filter(x => x.status === "Closed" || x.outcome)) // Only closed trades
                setLoading(false)
            })
        }
    }, [effectiveUserId])

    // --- Metrics Calculations ---
    const metrics = useMemo(() => {
        if (!trades.length) return null;

        const totalTrades = trades.length;
        const wins = trades.filter(t => t.outcome === "Win").length;
        const losses = trades.filter(t => t.outcome === "Loss").length;
        const winRate = ((wins / totalTrades) * 100).toFixed(1);

        const grossProfit = trades.reduce((acc, t) => acc + (t.pnl > 0 ? t.pnl : 0), 0);
        const grossLoss = Math.abs(trades.reduce((acc, t) => acc + (t.pnl < 0 ? t.pnl : 0), 0));
        const profitFactor = grossLoss === 0 ? grossProfit : (grossProfit / grossLoss).toFixed(2);

        const netPnL = (grossProfit - grossLoss).toFixed(2);

        // Drawdown Calc
        let peak = 0;
        let maxDrawdown = 0;
        let currentEquity = 0; // Relative equity
        const equityCurve = trades.sort((a, b) => a.date - b.date).map(t => {
            currentEquity += (t.pnl || 0);
            if (currentEquity > peak) peak = currentEquity;
            const dd = peak - currentEquity;
            if (dd > maxDrawdown) maxDrawdown = dd;
            return currentEquity;
        });

        const avgWin = (grossProfit / (wins || 1)).toFixed(2);
        const avgLoss = (grossLoss / (losses || 1)).toFixed(2);

        return {
            totalTrades,
            winRate,
            netPnL,
            profitFactor,
            maxDrawdown: maxDrawdown.toFixed(2),
            avgWin,
            avgLoss
        }
    }, [trades]);

    if (loading) return <div className="p-8 text-white">Loading analytics...</div>

    return (
        <div className="min-h-screen bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-slate-900 via-[#0a0f1e] to-black text-white p-4 md:p-8">
            <div className="max-w-7xl mx-auto space-y-8 animate-in fade-in">

                <div className="flex items-center space-x-4">
                    <Button variant="ghost" className="text-slate-400 hover:text-white pl-0 gap-2" onClick={() => router.back()}>
                        Back to Dashboard
                    </Button>
                </div>

                <h1 className="text-3xl font-bold bg-gradient-to-r from-purple-400 to-pink-600 bg-clip-text text-transparent">
                    Performance Analytics
                </h1>

                {/* Scorecards */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <Card className="bg-slate-900/40 border-slate-800">
                        <CardContent className="p-6">
                            <div className="text-xs text-slate-500 uppercase tracking-wider mb-1">Net PnL</div>
                            <div className={`text-2xl font-bold ${Number(metrics?.netPnL) >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                                ${metrics?.netPnL || "0.00"}
                            </div>
                        </CardContent>
                    </Card>
                    <Card className="bg-slate-900/40 border-slate-800">
                        <CardContent className="p-6">
                            <div className="text-xs text-slate-500 uppercase tracking-wider mb-1">Win Rate</div>
                            <div className="text-2xl font-bold text-slate-100">
                                {metrics?.winRate || "0"}%
                            </div>
                        </CardContent>
                    </Card>
                    <Card className="bg-slate-900/40 border-slate-800">
                        <CardContent className="p-6">
                            <div className="text-xs text-slate-500 uppercase tracking-wider mb-1">Profit Factor</div>
                            <div className="text-2xl font-bold text-yellow-400">
                                {metrics?.profitFactor || "0.00"}
                            </div>
                        </CardContent>
                    </Card>
                    <Card className="bg-slate-900/40 border-slate-800">
                        <CardContent className="p-6">
                            <div className="text-xs text-slate-500 uppercase tracking-wider mb-1">Max Drawdown</div>
                            <div className="text-2xl font-bold text-red-500">
                                -${metrics?.maxDrawdown || "0.00"}
                            </div>
                        </CardContent>
                    </Card>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <Card className="bg-slate-900/40 border-slate-800">
                        <CardContent className="p-6">
                            <div className="text-xs text-slate-500 uppercase tracking-wider mb-1">Avg Win</div>
                            <div className="text-xl font-mono text-green-400">${metrics?.avgWin}</div>
                        </CardContent>
                    </Card>
                    <Card className="bg-slate-900/40 border-slate-800">
                        <CardContent className="p-6">
                            <div className="text-xs text-slate-500 uppercase tracking-wider mb-1">Avg Loss</div>
                            <div className="text-xl font-mono text-red-400">-${metrics?.avgLoss}</div>
                        </CardContent>
                    </Card>
                    <Card className="bg-slate-900/40 border-slate-800">
                        <CardContent className="p-6">
                            <div className="text-xs text-slate-500 uppercase tracking-wider mb-1">Total Trades</div>
                            <div className="text-xl font-mono text-slate-200">{metrics?.totalTrades}</div>
                        </CardContent>
                    </Card>
                </div>

                {/* Charts */}
                <div className="h-96">
                    <AnalyticsChart trades={trades} timeframe="Monthly" />
                </div>
            </div>
        </div>
    )
}

export default function AnalyticsPageWrapper() {
    return (
        <Suspense fallback={<div className="p-8 text-white">Loading analytics...</div>}>
            <AnalyticsPage />
        </Suspense>
    )
}
