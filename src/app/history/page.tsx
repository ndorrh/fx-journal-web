"use client"

import { useEffect, useState, Suspense } from "react"
import { useAuth } from "@/context/AuthContext"
import { getTrades } from "@/lib/services/tradeService"
import { Trade } from "@/types"
import { useRouter, useSearchParams } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card"
import { ArrowLeft, ArrowUpRight, Search, Filter } from "lucide-react"
import { Input } from "@/components/ui/Input"
import { Button } from "@/components/ui/Button"

function HistoryContent() {
    const { user } = useAuth()
    const router = useRouter()
    const [trades, setTrades] = useState<Trade[]>([])
    const [loading, setLoading] = useState(true)
    const [searchTerm, setSearchTerm] = useState("")

    const searchParams = useSearchParams()
    const viewAsUserId = searchParams?.get('userId')
    const effectiveUserId = viewAsUserId || user?.uid

    useEffect(() => {
        if (effectiveUserId) {
            getTrades(effectiveUserId).then(data => {
                setTrades(data.sort((a, b) => b.date - a.date))
                setLoading(false)
            })
        }
    }, [effectiveUserId])

    const filteredTrades = trades.filter(t =>
        t.instrument.toLowerCase().includes(searchTerm.toLowerCase()) ||
        t.strategy.toLowerCase().includes(searchTerm.toLowerCase()) ||
        t.status.toLowerCase().includes(searchTerm.toLowerCase())
    )

    const handleExport = async () => {
        if (!effectiveUserId) return;
        try {
            const data = await getTrades(effectiveUserId);
            const jsonString = JSON.stringify(data, null, 2);
            const blob = new Blob([jsonString], { type: "application/json" });
            const url = URL.createObjectURL(blob);
            const link = document.createElement("a");
            link.href = url;
            link.download = `fx_journal_backup_${new Date().toISOString().slice(0, 10)}.json`;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
        } catch (e) {
            console.error("Export failed:", e);
            alert("Failed to export data");
        }
    };

    const handleImport = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file || !effectiveUserId) return;

        const reader = new FileReader();
        reader.onload = async (event) => {
            try {
                const json = event.target?.result as string;
                const trades = JSON.parse(json);
                if (!Array.isArray(trades)) throw new Error("Invalid format");

                if (window.confirm(`Found ${trades.length} trades in backup. Restore/Merge them now?`)) {
                    setLoading(true);
                    const { importTrades } = await import("@/lib/services/tradeService");
                    const result = await importTrades(effectiveUserId, trades);
                    alert(`Import Complete!\n🆕 Created: ${result.created}\n🔄 Updated: ${result.updated}\n⚠️ Errors: ${result.errors}`);
                    window.location.reload();
                }
            } catch (err) {
                alert("Failed to parse JSON file. Ensure it is a valid backup.");
            }
        };
        reader.readAsText(file);
    };

    if (loading) return <div className="p-8 text-white">Loading history...</div>

    return (
        <div className="">
            <div className="max-w-7xl mx-auto space-y-6 animate-in fade-in">

                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-cyan-400 to-purple-500">
                            Trade Journal
                        </h1>
                        <p className="text-slate-400 mt-1">Full history of all executions and plans.</p>
                    </div>
                    <div className="flex gap-3">
                        <div className="relative">
                            <input
                                type="file"
                                accept=".json"
                                onChange={handleImport}
                                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                                title="Import JSON"
                            />
                            <Button variant="outline" className="border-slate-700 hover:bg-slate-800 text-slate-300">
                                <span className="mr-2">📥</span> Import
                            </Button>
                        </div>
                        <Button variant="outline" onClick={handleExport} className="border-slate-700 hover:bg-slate-800 text-slate-300">
                            <span className="mr-2">📤</span> Export Data
                        </Button>
                        <Button variant="ghost" onClick={() => router.push('/')} className="text-slate-400 hover:text-white border border-transparent hover:border-slate-800">
                            <ArrowLeft className="w-4 h-4 mr-2" />
                            Back to Dashboard
                        </Button>
                    </div>
                </div>

                <Card className="glass-card bg-slate-950/50 border-slate-800">
                    <CardHeader className="flex flex-row items-center justify-between pb-4">
                        <CardTitle className="text-slate-200">All Entries</CardTitle>
                        <div className="relative w-64">
                            <Search className="absolute left-2 top-2.5 h-4 w-4 text-slate-500" />
                            <Input
                                placeholder="Search pair, strategy..."
                                className="pl-8 bg-slate-900/50 border-slate-800 focus:border-cyan-500/50 text-sm"
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                            />
                        </div>
                    </CardHeader>
                    <CardContent>
                        <div className="overflow-x-auto rounded-lg border border-slate-800">
                            <table className="w-full text-sm text-left">
                                <thead className="text-xs text-slate-400 uppercase bg-slate-900/80">
                                    <tr>
                                        <th className="px-6 py-3">Date</th>
                                        <th className="px-6 py-3">Instrument</th>
                                        <th className="px-6 py-3">Side</th>
                                        <th className="px-6 py-3">Strategy</th>
                                        <th className="px-6 py-3 text-right">Entry</th>
                                        <th className="px-6 py-3 text-right">Exit</th>
                                        <th className="px-6 py-3 text-right">PnL</th>
                                        <th className="px-6 py-3 text-right">R</th>
                                        <th className="px-6 py-3 text-center">Status</th>
                                        <th className="px-6 py-3 text-center">Action</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-800 bg-slate-950/30">
                                    {filteredTrades.map((trade) => (
                                        <tr
                                            key={trade.id}
                                            className="hover:bg-slate-800/50 transition-colors cursor-pointer group"
                                            onClick={() => router.push(`/trades/${trade.id}${viewAsUserId ? `?userId=${viewAsUserId}` : ''}`)}
                                        >
                                            <td className="px-6 py-4 font-medium text-slate-300">
                                                {new Date(trade.date).toLocaleDateString()}
                                                <div className="text-xs text-slate-500">{new Date(trade.date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</div>
                                            </td>
                                            <td className="px-6 py-4 font-bold text-slate-200">{trade.instrument}</td>
                                            <td className="px-6 py-4">
                                                <span className={`px-2 py-1 rounded text-xs font-medium ${trade.direction === 'Long' ? 'text-cyan-400 bg-cyan-950/30 border border-cyan-900/50' : 'text-red-400 bg-red-950/30 border border-red-900/50'}`}>
                                                    {trade.direction}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 text-slate-400">{trade.strategy}</td>
                                            <td className="px-6 py-4 text-right font-mono text-slate-300">{trade.plannedEntry}</td>
                                            <td className="px-6 py-4 text-right font-mono text-slate-300">{trade.exitPrice || '-'}</td>
                                            <td className={`px-6 py-4 text-right font-bold font-mono ${!trade.pnl ? 'text-slate-500' : trade.pnl > 0 ? 'text-green-400' : trade.pnl < 0 ? 'text-red-400' : 'text-slate-400'}`}>
                                                {trade.pnl ? `$${trade.pnl.toFixed(2)}` : '-'}
                                            </td>
                                            <td className={`px-6 py-4 text-right font-mono ${!trade.actualRR ? 'text-slate-500' : trade.actualRR > 0 ? 'text-green-400' : 'text-red-400'}`}>
                                                {trade.actualRR ? `${trade.actualRR}R` : '-'}
                                            </td>
                                            <td className="px-6 py-4 text-center">
                                                <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium border ${trade.status === 'Open' ? 'text-blue-400 bg-blue-950/30 border-blue-900' :
                                                    trade.status === 'Closed' ? 'text-purple-400 bg-purple-950/30 border-purple-900' :
                                                        'text-amber-400 bg-amber-950/30 border-amber-900'
                                                    }`}>
                                                    {trade.status}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 text-center">
                                                <Button size="icon" variant="ghost" className="h-8 w-8 text-slate-400 opacity-0 group-hover:opacity-100 transition-all hover:text-cyan-400 hover:bg-cyan-950/30">
                                                    <ArrowUpRight className="h-4 w-4" />
                                                </Button>
                                            </td>
                                        </tr>
                                    ))}
                                    {filteredTrades.length === 0 && (
                                        <tr>
                                            <td colSpan={10} className="px-6 py-12 text-center text-slate-500">
                                                No trades found. Start by logging a new plan!
                                            </td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    )
}

export default function HistoryPage() {
    return (
        <Suspense fallback={<div className="p-8 text-white">Loading trade history...</div>}>
            <HistoryContent />
        </Suspense>
    )
}
