"use client"

import { useEffect, useState } from "react"
import { useParams, useRouter } from "next/navigation"
import { useAuth } from "@/context/AuthContext"
import { getTrade, updateTrade } from "@/lib/services/tradeService"
import { Trade } from "@/types"
import { Button } from "@/components/ui/Button"
import { Input } from "@/components/ui/Input"
import { Select } from "@/components/ui/Select"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card"
import { ArrowLeft } from "lucide-react"

export default function TradeDetailsPage() {
    const { id } = useParams()
    const { user } = useAuth()
    const router = useRouter()
    const [trade, setTrade] = useState<Trade | null>(null)
    const [loading, setLoading] = useState(true)

    const [saving, setSaving] = useState(false)

    // Editing State (Phase 1)
    const [isEditingPlan, setIsEditingPlan] = useState(false)
    const [editPlan, setEditPlan] = useState<Partial<Trade>>({})

    // Execution State
    const [exitPrice, setExitPrice] = useState("")
    const [outcome, setOutcome] = useState<"Win" | "Loss" | "BE">("Win")
    const [pnl, setPnl] = useState("")
    const [actualRR, setActualRR] = useState("") // Calculated or manual? Let's allow manual for now or auto-calc
    const [exitReason, setExitReason] = useState("")
    const [postTradeEmotion, setPostTradeEmotion] = useState("")
    const [lessonsLearned, setLessonsLearned] = useState("")
    const [afterImageUrl, setAfterImageUrl] = useState("")

    useEffect(() => {
        if (user && id) {
            getTrade(user.uid, id as string)
                .then(t => {
                    setTrade(t)
                    if (t) {
                        // Pre-fill execution data if exists
                        setExitPrice(t.exitPrice?.toString() || "")
                        setOutcome(t.outcome === "Open" ? "Win" : t.outcome || "Win") // Default to Win if currently Open/Planned
                        setPnl(t.pnl?.toString() || "")
                        setActualRR(t.actualRR?.toString() || "")
                        setExitReason(t.exitReason || "")
                        setPostTradeEmotion(t.postTradeEmotion || "")
                        setLessonsLearned(t.lessonsLearned || "")
                        setAfterImageUrl(t.afterImageUrl || "")

                        // Initialize Edit Form
                        // Initialize Edit Form
                        setEditPlan({
                            instrument: t.instrument,
                            direction: t.direction,
                            date: t.date,
                            strategy: t.strategy,
                            tradeType: t.tradeType,
                            marketCondition: t.marketCondition,
                            plannedEntry: t.plannedEntry,
                            plannedSL: t.plannedSL,
                            plannedTP: t.plannedTP,
                            riskAmount: t.riskAmount,
                            positionSize: t.positionSize,
                            entryReason: t.entryReason,
                            preTradeEmotion: t.preTradeEmotion,
                            notes: t.notes,
                            beforeImageUrl: t.beforeImageUrl,
                            // Strategy specifics
                            zoneType: t.zoneType,
                            confirmation: t.confirmation,
                            pdArray: t.pdArray,
                            liquidityTarget: t.liquidityTarget
                        })
                    }
                })
                .finally(() => setLoading(false))
        }
    }, [user, id])

    const handleSaveExecution = async () => {
        if (!user || !trade || !trade.id) return
        setSaving(true)
        try {
            await updateTrade(user.uid, trade.id, {
                status: "Closed",
                exitPrice: parseFloat(exitPrice),
                pnl: parseFloat(pnl),
                actualRR: parseFloat(actualRR),
                outcome,
                exitReason,
                postTradeEmotion,
                lessonsLearned,
                afterImageUrl
            })
            alert("Trade Updated & Closed!")
            router.push("/")
        } catch (e) {
            console.error(e)
            alert("Failed to update trade")
        } finally {
            setSaving(false)
        }
    }

    const handleSavePlan = async () => {
        if (!user || !trade || !trade.id) return
        setSaving(true)
        try {
            await updateTrade(user.uid, trade.id, {
                ...editPlan
            })
            // Update local state
            setTrade(prev => prev ? ({ ...prev, ...editPlan }) : null)
            setIsEditingPlan(false)
            alert("Plan Updated!")
        } catch (e) {
            console.error(e)
            alert("Failed to update plan")
        } finally {
            setSaving(false)
        }
    }

    if (loading) return <div className="p-8 text-white">Loading trade details...</div>
    if (!trade) return <div className="p-8 text-white">Trade not found.</div>

    return (
        <div className="min-h-screen bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-slate-900 via-[#0a0f1e] to-black text-white p-4 md:p-8">
            <div className="max-w-5xl mx-auto space-y-6 animate-in fade-in">

                {/* Header */}
                <div className="flex items-center space-x-4">
                    <Button variant="ghost" className="text-slate-400 hover:text-white pl-0 gap-2" onClick={() => router.back()}>
                        Back to Dashboard
                    </Button>
                </div>

                <div className="flex justify-between items-start">
                    <div>
                        <h1 className="text-3xl font-bold text-white flex items-center gap-3">
                            {trade.instrument} <span className={`text-sm px-3 py-1 rounded-full border ${trade.direction === 'Long' ? 'text-cyan-400 border-cyan-800 bg-cyan-950/30' : 'text-red-400 border-red-800 bg-red-950/30'}`}>{trade.direction}</span>
                        </h1>
                        <p className="text-slate-400 mt-1">{new Date(trade.date).toLocaleString()}</p>
                    </div>
                    <div className="text-right">
                        <div className="text-xs text-slate-500 uppercase tracking-widest px-2">Current Status</div>
                        <div className="text-xl font-bold text-slate-200">{trade.status}</div>
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">

                    {/* LEFT: The Plan (Editable) */}
                    <Card className="glass-card bg-slate-900/40 border-slate-800 h-full">
                        <CardHeader className="flex flex-row items-center justify-between pb-2">
                            <CardTitle className="text-cyan-400">Phase 1: Trade Plan</CardTitle>
                            {!isEditingPlan ? (
                                <Button size="sm" variant="ghost" className="h-8 text-slate-400 hover:text-cyan-400" onClick={() => setIsEditingPlan(true)}>
                                    Edit Plan
                                </Button>
                            ) : (
                                <div className="flex gap-2">
                                    <Button size="sm" variant="ghost" className="h-8 text-red-400" onClick={() => setIsEditingPlan(false)}>Cancel</Button>
                                    <Button size="sm" className="h-8 bg-cyan-600 hover:bg-cyan-500 text-white" onClick={handleSavePlan} disabled={saving}>Save</Button>
                                </div>
                            )}
                        </CardHeader>
                        <CardContent className="space-y-6 text-slate-300">
                            {!isEditingPlan ? (
                                <>
                                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 bg-slate-950/50 p-4 rounded-lg border border-slate-800">
                                        <div>
                                            <div className="text-xs text-slate-500 uppercase">Entry</div>
                                            <div className="font-mono text-lg">{trade.plannedEntry}</div>
                                        </div>
                                        <div>
                                            <div className="text-xs text-slate-500 uppercase">Stop Loss</div>
                                            <div className="font-mono text-lg text-red-400">{trade.plannedSL}</div>
                                        </div>
                                        <div>
                                            <div className="text-xs text-slate-500 uppercase">Target</div>
                                            <div className="font-mono text-lg text-green-400">{trade.plannedTP}</div>
                                        </div>
                                        <div>
                                            <div className="text-xs text-slate-500 uppercase">Risk ($)</div>
                                            <div className="font-mono text-lg text-amber-400">{trade.riskAmount ? `$${trade.riskAmount}` : '--'}</div>
                                        </div>
                                    </div>

                                    <div className="space-y-4">
                                        <div>
                                            <label className="text-xs text-slate-500 uppercase block mb-1">Strategy & Setup</label>
                                            <div className="p-3 bg-slate-900 rounded border border-slate-700">
                                                <p><span className="text-slate-500">Strategy:</span> {trade.strategy}</p>
                                                <p><span className="text-slate-500">Reason:</span> {trade.entryReason}</p>
                                                <p className="mt-2 italic text-slate-400 border-t border-slate-800 pt-2">"{trade.notes}"</p>
                                            </div>
                                        </div>

                                        {trade.beforeImageUrl && (
                                            <div>
                                                <label className="text-xs text-slate-500 uppercase block mb-1">Setup Chart</label>
                                                <div className="rounded-lg overflow-hidden border border-slate-700">
                                                    <img src={trade.beforeImageUrl} alt="Plan" className="w-full h-auto object-cover hover:scale-105 transition-transform duration-500 cursor-pointer" onClick={() => window.open(trade.beforeImageUrl, '_blank')} />
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                </>
                            ) : (
                                <div className="space-y-6 animate-in fade-in">

                                    {/* --- Section 1: Core Info --- */}
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <div className="space-y-2">
                                            <label className="text-xs text-slate-500 uppercase">Instrument & Direction</label>
                                            <div className="flex gap-2">
                                                <Input
                                                    value={editPlan.instrument || ""}
                                                    onChange={e => setEditPlan({ ...editPlan, instrument: e.target.value })}
                                                    className="bg-slate-950 block"
                                                    placeholder="e.g. EURUSD"
                                                />
                                                <Select value={editPlan.direction} onChange={(e) => setEditPlan({ ...editPlan, direction: e.target.value as any })} className="w-[100px] bg-slate-950">
                                                    <option value="Long">Long</option>
                                                    <option value="Short">Short</option>
                                                </Select>
                                            </div>
                                        </div>
                                        <div className="space-y-2">
                                            <label className="text-xs text-slate-500 uppercase">Date (Planned)</label>
                                            <input
                                                type="datetime-local"
                                                value={editPlan.date ? new Date(editPlan.date).toISOString().slice(0, 16) : ""}
                                                onChange={(e) => setEditPlan({ ...editPlan, date: new Date(e.target.value).getTime() })}
                                                className="flex h-10 w-full rounded-md border border-slate-800 bg-slate-950 px-3 py-2 text-sm text-slate-100 focus:outline-none focus:ring-2 focus:ring-cyan-500/50"
                                            />
                                        </div>
                                    </div>

                                    {/* --- Section 2: Numbers --- */}
                                    <div className="grid grid-cols-2 gap-4 border-t border-slate-800/50 pt-4">
                                        <div className="space-y-2">
                                            <label className="text-xs text-slate-500 uppercase">Entry</label>
                                            <Input
                                                type="number" step="0.00001"
                                                value={editPlan.plannedEntry || ""}
                                                onChange={e => setEditPlan({ ...editPlan, plannedEntry: parseFloat(e.target.value) })}
                                                className="bg-slate-950 block"
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <label className="text-xs text-red-400/80 uppercase">Stop Loss</label>
                                            <Input
                                                type="number" step="0.00001"
                                                value={editPlan.plannedSL || ""}
                                                onChange={e => setEditPlan({ ...editPlan, plannedSL: parseFloat(e.target.value) })}
                                                className="bg-slate-950 border-red-900/40 focus:border-red-500"
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <label className="text-xs text-green-400/80 uppercase">Target</label>
                                            <Input
                                                type="number" step="0.00001"
                                                value={editPlan.plannedTP || ""}
                                                onChange={e => setEditPlan({ ...editPlan, plannedTP: parseFloat(e.target.value) })}
                                                className="bg-slate-950 border-green-900/40 focus:border-green-500"
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <label className="text-xs text-amber-400/80 uppercase">Risk ($)</label>
                                            <Input
                                                type="number" step="1"
                                                value={editPlan.riskAmount || ""}
                                                onChange={e => setEditPlan({ ...editPlan, riskAmount: parseFloat(e.target.value) })}
                                                className="bg-slate-950 border-amber-900/40 focus:border-amber-500"
                                            />
                                        </div>
                                    </div>

                                    {/* --- Section 3: Context --- */}
                                    <div className="grid grid-cols-2 gap-4 border-t border-slate-800/50 pt-4">
                                        <div className="space-y-2">
                                            <label className="text-xs text-slate-500 uppercase">Strategy</label>
                                            <Select value={editPlan.strategy} onChange={(e) => setEditPlan({ ...editPlan, strategy: e.target.value as any })} className="bg-slate-950">
                                                <option value="SupplyDemand">Supply & Demand</option>
                                                <option value="ICT">ICT</option>
                                                <option value="Other">Other</option>
                                            </Select>
                                        </div>
                                        <div className="space-y-2">
                                            <label className="text-xs text-slate-500 uppercase">Reason</label>
                                            <Select value={editPlan.entryReason} onChange={(e) => setEditPlan({ ...editPlan, entryReason: e.target.value })} className="bg-slate-950">
                                                <option value="Technical">Technical</option>
                                                <option value="Fundamental">Fundamental</option>
                                                <option value="Flow">Order Flow</option>
                                            </Select>
                                        </div>
                                    </div>

                                    <div className="space-y-2">
                                        <label className="text-xs text-slate-500 uppercase">Chart URL</label>
                                        <Input
                                            value={editPlan.beforeImageUrl || ""}
                                            onChange={e => setEditPlan({ ...editPlan, beforeImageUrl: e.target.value })}
                                            className="bg-slate-950"
                                            placeholder="https://..."
                                        />
                                    </div>

                                    <div className="space-y-2">
                                        <label className="text-xs text-slate-500 uppercase">Notes</label>
                                        <textarea
                                            value={editPlan.notes || ""}
                                            onChange={e => setEditPlan({ ...editPlan, notes: e.target.value })}
                                            className="w-full h-32 bg-slate-950 border border-slate-700 rounded-md p-3 text-sm focus:border-cyan-500 focus:outline-none"
                                        />
                                    </div>
                                </div>
                            )}
                        </CardContent>
                    </Card>

                    {/* RIGHT: Execution (Editable) */}
                    <Card className="glass-card bg-slate-900/60 border-slate-700 h-full border-l-4 border-l-purple-500">
                        <CardHeader>
                            <CardTitle className="text-purple-400">Phase 2: Execution & Review</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-6">

                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <label className="text-sm font-medium text-slate-300">Exit Price</label>
                                    <Input
                                        type="number" step="0.00001"
                                        className="bg-slate-950/50 border-slate-800 focus:border-purple-500"
                                        placeholder="Actual exit..."
                                        value={exitPrice}
                                        onChange={(e) => setExitPrice(e.target.value)}
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-sm font-medium text-slate-300">Outcome</label>
                                    <Select
                                        className="bg-slate-950/50 border-slate-800 focus:border-purple-500"
                                        value={outcome}
                                        onChange={(e) => setOutcome(e.target.value as any)}
                                    >
                                        <option value="Win">Win</option>
                                        <option value="Loss">Loss</option>
                                        <option value="BE">Break Even</option>
                                    </Select>
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <label className="text-sm font-medium text-slate-300">PnL ($)</label>
                                    <Input
                                        type="number"
                                        className="bg-slate-950/50 border-slate-800 focus:border-purple-500"
                                        placeholder="Profit/Loss..."
                                        value={pnl}
                                        onChange={(e) => setPnl(e.target.value)}
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-sm font-medium text-slate-300">Realized RR</label>
                                    <Input
                                        type="number" step="0.1"
                                        className="bg-slate-950/50 border-slate-800 focus:border-purple-500"
                                        placeholder="R-Multiple..."
                                        value={actualRR}
                                        onChange={(e) => setActualRR(e.target.value)}
                                    />
                                </div>
                            </div>

                            <div className="space-y-2">
                                <label className="text-sm font-medium text-slate-300">Why did you exit?</label>
                                <Input
                                    className="bg-slate-950/50 border-slate-800 focus:border-purple-500"
                                    placeholder="Target hit, Manual close, Stop hunt..."
                                    value={exitReason}
                                    onChange={(e) => setExitReason(e.target.value)}
                                />
                            </div>

                            <div className="space-y-2">
                                <label className="text-sm font-medium text-slate-300">Lessons Learned / Post-Trade Notes</label>
                                <textarea
                                    className="flex min-h-[80px] w-full rounded-md border border-slate-800 bg-slate-950/50 px-3 py-2 text-sm text-slate-100 placeholder:text-slate-600 focus-visible:outline-none focus:border-purple-500"
                                    placeholder="What did you learn?..."
                                    value={lessonsLearned}
                                    onChange={(e) => setLessonsLearned(e.target.value)}
                                />
                            </div>

                            <div className="space-y-2">
                                <label className="text-sm font-medium text-slate-300">Result Image URL (TradingView)</label>
                                <Input
                                    className="bg-slate-950/50 border-slate-800 focus:border-purple-500"
                                    placeholder="https://..."
                                    value={afterImageUrl}
                                    onChange={(e) => setAfterImageUrl(e.target.value)}
                                />
                                {afterImageUrl && (
                                    <div className="relative w-full h-32 rounded-lg overflow-hidden border border-slate-700 mt-2">
                                        <img src={afterImageUrl} alt="Result Preview" className="w-full h-full object-cover" />
                                    </div>
                                )}
                            </div>

                            <Button
                                onClick={handleSaveExecution}
                                disabled={saving}
                                className="w-full bg-purple-600 hover:bg-purple-500 text-white shadow-lg shadow-purple-900/20"
                            >
                                {saving ? "Closing Trade..." : "Close Trade & Save Journal"}
                            </Button>

                        </CardContent>
                    </Card>

                </div>
            </div>
        </div >
    )
}
