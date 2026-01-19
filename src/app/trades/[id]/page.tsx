"use client"

import { useEffect, useState, Suspense } from "react"
import { useParams, useRouter, useSearchParams } from "next/navigation"
import { useAuth } from "@/context/AuthContext"
import { getTrade, updateTrade } from "@/lib/services/tradeService"
import { convertGoogleDriveLink, cleanUndefined } from "@/lib/utils"

// ... (existing imports)

import { Trade } from "@/types"
import { Button } from "@/components/ui/Button"
import { Input } from "@/components/ui/Input"
import { Select } from "@/components/ui/Select"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card"
import { ArrowLeft } from "lucide-react"
import { AdminActingAsBanner } from "@/components/admin/AdminActingAsBanner"
import { ImageUploader } from "@/components/ui/ImageUploader"


function TradeDetailsContent() {
    const { id } = useParams()
    const { user } = useAuth()
    const router = useRouter()
    const [trade, setTrade] = useState<Trade | null>(null)
    const [loading, setLoading] = useState(true)

    const [saving, setSaving] = useState(false)

    const searchParams = useSearchParams()
    const viewAsUserId = searchParams?.get('userId')
    const effectiveUserId = viewAsUserId || user?.uid

    // Editing State (Phase 1)
    const [isEditingPlan, setIsEditingPlan] = useState(false)
    const [editPlan, setEditPlan] = useState<Partial<Trade>>({})

    // Execution State
    const [exitPrice, setExitPrice] = useState("")
    const [outcome, setOutcome] = useState<"Win" | "Loss" | "BE">("Win")
    const [pnl, setPnl] = useState("")
    const [actualRR, setActualRR] = useState("")
    const [exitReason, setExitReason] = useState("")
    const [postTradeEmotion, setPostTradeEmotion] = useState("")
    const [lessonsLearned, setLessonsLearned] = useState("")
    const [afterImageUrl, setAfterImageUrl] = useState("")

    // Phase 2 Extended Metrics
    const [maxAdverseExcursion, setMaxAdverseExcursion] = useState("")
    const [maxFavorableExcursion, setMaxFavorableExcursion] = useState("")
    const [closedReason, setClosedReason] = useState("")

    useEffect(() => {
        if (effectiveUserId && id) {
            getTrade(effectiveUserId, id as string)
                .then(t => {
                    setTrade(t)
                    if (t) {
                        // Pre-fill execution data if exists
                        setExitPrice(t.exitPrice?.toString() || "")
                        setOutcome(t.outcome === "Open" ? "Win" : t.outcome || "Win")
                        setPnl(t.pnl?.toString() || "")
                        setActualRR(t.actualRR?.toString() || "")
                        setExitReason(t.exitReason || "")
                        setPostTradeEmotion(t.postTradeEmotion || "")
                        setLessonsLearned(t.lessonsLearned || "")
                        setAfterImageUrl(t.afterImageUrl || "")

                        // Extended Metrics
                        setMaxAdverseExcursion(t.maxAdverseExcursion?.toString() || "")
                        setMaxFavorableExcursion(t.maxFavorableExcursion?.toString() || "")
                        setClosedReason(t.closedReason || "")

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
                            confirmationImageUrl: t.confirmationImageUrl,
                            // Strategy specifics
                            zoneType: t.zoneType,
                            confirmation: t.confirmation,
                            pdArray: t.pdArray,
                            liquidityTarget: t.liquidityTarget,
                            // Extended Metrics (Phase 1)
                            sleepScore: t.sleepScore,
                            zoneCreationTime: t.zoneCreationTime,
                            entryTime: t.entryTime
                        })
                    }
                })
                .finally(() => setLoading(false))
        }
    }, [effectiveUserId, id])

    const deleteImage = async (url: string) => {
        if (!url || url.includes('drive.google.com') || url.includes('tradingview.com')) return;
        try {
            const urlObj = new URL(url);
            const key = urlObj.pathname.startsWith('/') ? urlObj.pathname.slice(1) : urlObj.pathname;
            await fetch(`/api/upload?key=${encodeURIComponent(key)}`, { method: 'DELETE' });
        } catch (e) {
            console.error("Failed to delete image:", e);
        }
    };

    const promoteImage = async (url: string) => {
        if (!url || !url.includes('/temp/')) return url;
        try {
            const res = await fetch('/api/upload', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ url })
            });
            const data = await res.json();
            if (data.success && data.publicUrl) {
                return data.publicUrl;
            }
        } catch (e) {
            console.error("Failed to promote image:", e);
        }
        return url;
    };

    const handleSaveExecution = async () => {
        if (!user || !trade || !trade.id) return
        setSaving(true)
        try {
            const updateData = cleanUndefined({
                status: "Closed",
                exitPrice: parseFloat(exitPrice),
                pnl: parseFloat(pnl),
                actualRR: parseFloat(actualRR),
                outcome,
                exitReason,
                postTradeEmotion,
                lessonsLearned,
                // Extended Metrics
                maxAdverseExcursion: parseFloat(maxAdverseExcursion),
                maxFavorableExcursion: parseFloat(maxFavorableExcursion),
                closedReason,
                // Promote only if temp
                afterImageUrl: afterImageUrl.includes('/temp/') ? await promoteImage(convertGoogleDriveLink(afterImageUrl)) : convertGoogleDriveLink(afterImageUrl)
            })

            // Use trade.userId (owner) instead of user.uid (current user) to ensure Admin updates target the right path
            const targetUserId = trade.userId || user.uid;

            try {
                await updateTrade(targetUserId, trade.id, updateData)
            } catch (dbError) {
                // ROLLBACK
                console.error("DB Update failed, rolling back image...", dbError);
                if (updateData.afterImageUrl && updateData.afterImageUrl !== afterImageUrl && updateData.afterImageUrl.includes('/setups/')) {
                    await deleteImage(updateData.afterImageUrl);
                }
                throw dbError;
            }

            // CLEANUP: If we successfully saved a NEW image, delete the OLD saved image if it differs
            if (trade.afterImageUrl && trade.afterImageUrl !== afterImageUrl) {
                await deleteImage(trade.afterImageUrl);
            }

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
            const finalBeforeImageUrl = (editPlan.beforeImageUrl && editPlan.beforeImageUrl.includes('/temp/'))
                ? await promoteImage(convertGoogleDriveLink(editPlan.beforeImageUrl))
                : (editPlan.beforeImageUrl ? convertGoogleDriveLink(editPlan.beforeImageUrl) : null);

            const finalConfirmationImageUrl = (editPlan.confirmationImageUrl && editPlan.confirmationImageUrl.includes('/temp/'))
                ? await promoteImage(convertGoogleDriveLink(editPlan.confirmationImageUrl))
                : (editPlan.confirmationImageUrl ? convertGoogleDriveLink(editPlan.confirmationImageUrl) : null);

            const updateData = cleanUndefined({
                ...editPlan,
                // Recalculate Time To Entry if changed
                timeToEntry: (editPlan.zoneCreationTime && editPlan.entryTime)
                    ? parseFloat(((new Date(editPlan.entryTime).getTime() - new Date(editPlan.zoneCreationTime).getTime()) / 60000).toFixed(1))
                    : undefined,
                beforeImageUrl: finalBeforeImageUrl,
                confirmationImageUrl: finalConfirmationImageUrl
            })

            // Use trade.userId (owner) instead of user.uid (current user)
            const targetUserId = trade.userId || user.uid;

            try {
                await updateTrade(targetUserId, trade.id, updateData)
            } catch (dbError) {
                // ROLLBACK
                console.error("DB Update failed (Plan), rolling back images...", dbError);
                if (finalBeforeImageUrl && finalBeforeImageUrl !== editPlan.beforeImageUrl && finalBeforeImageUrl.includes('/setups/')) {
                    await deleteImage(finalBeforeImageUrl);
                }
                if (finalConfirmationImageUrl && finalConfirmationImageUrl !== editPlan.confirmationImageUrl && finalConfirmationImageUrl.includes('/setups/')) {
                    await deleteImage(finalConfirmationImageUrl);
                }
                throw dbError;
            }

            // CLEANUP: If we successfully saved a NEW image, delete the OLD saved image if it differs
            if (trade.beforeImageUrl && trade.beforeImageUrl !== editPlan.beforeImageUrl) {
                await deleteImage(trade.beforeImageUrl);
            }
            if (trade.confirmationImageUrl && trade.confirmationImageUrl !== editPlan.confirmationImageUrl) {
                await deleteImage(trade.confirmationImageUrl);
            }

            // Update local state
            setTrade(prev => prev ? ({ ...prev, ...updateData }) : null)
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

                <AdminActingAsBanner targetUserId={effectiveUserId || ""} currentUserId={user?.uid} />

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

                                    {/* Extended Metrics Display (Read Only) */}
                                    {(trade.sleepScore || trade.timeToEntry) && (
                                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 p-4 rounded-lg border border-slate-800 bg-slate-900/40">
                                            {trade.sleepScore && (
                                                <div>
                                                    <div className="text-xs text-slate-500 uppercase">Sleep Score</div>
                                                    <div className="font-mono text-lg text-blue-300">{trade.sleepScore}/10</div>
                                                </div>
                                            )}
                                            {trade.timeToEntry && (
                                                <div>
                                                    <div className="text-xs text-slate-500 uppercase">Time To Entry</div>
                                                    <div className="font-mono text-lg text-cyan-300">{trade.timeToEntry}m</div>
                                                </div>
                                            )}
                                            {trade.zoneCreationTime && (
                                                <div className="col-span-2">
                                                    <div className="text-xs text-slate-500 uppercase">Zone Found At</div>
                                                    <div className="text-sm text-slate-400">{new Date(trade.zoneCreationTime).toLocaleString()}</div>
                                                </div>
                                            )}
                                        </div>
                                    )}

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
                                                    <img src={trade.beforeImageUrl} alt="Plan" className="w-full h-auto object-cover hover:scale-105 transition-transform duration-500 cursor-pointer" onClick={() => window.open(trade.beforeImageUrl, '_blank')} referrerPolicy="no-referrer" />
                                                </div>
                                            </div>
                                        )}

                                        {trade.confirmationImageUrl && (
                                            <div>
                                                <label className="text-xs text-slate-500 uppercase block mb-1">Trigger / Confirmation Chart</label>
                                                <div className="rounded-lg overflow-hidden border border-slate-700">
                                                    <img src={trade.confirmationImageUrl} alt="Confirmation" className="w-full h-auto object-cover hover:scale-105 transition-transform duration-500 cursor-pointer" onClick={() => window.open(trade.confirmationImageUrl, '_blank')} referrerPolicy="no-referrer" />
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
                                                <Select
                                                    value={editPlan.instrument || ""}
                                                    onChange={e => setEditPlan({ ...editPlan, instrument: e.target.value })}
                                                    className="bg-slate-950 block w-full"
                                                >
                                                    <optgroup label="Forex Majors">
                                                        <option value="EURUSD">EURUSD</option>
                                                        <option value="GBPUSD">GBPUSD</option>
                                                        <option value="USDJPY">USDJPY</option>
                                                        <option value="USDCAD">USDCAD</option>
                                                        <option value="AUDUSD">AUDUSD</option>
                                                        <option value="USDCHF">USDCHF</option>
                                                        <option value="NZDUSD">NZDUSD</option>
                                                    </optgroup>
                                                    <optgroup label="Forex Minors & Crosses">
                                                        <option value="EURGBP">EURGBP</option>
                                                        <option value="EURAUD">EURAUD</option>
                                                        <option value="EURCAD">EURCAD</option>
                                                        <option value="EURJPY">EURJPY</option>
                                                        <option value="EURNZD">EURNZD</option>
                                                        <option value="EURCHF">EURCHF</option>

                                                        <option value="GBPJPY">GBPJPY</option>
                                                        <option value="GBPAUD">GBPAUD</option>
                                                        <option value="GBPCAD">GBPCAD</option>
                                                        <option value="GBPNZD">GBPNZD</option>
                                                        <option value="GBPCHF">GBPCHF</option>

                                                        <option value="AUDJPY">AUDJPY</option>
                                                        <option value="AUDCAD">AUDCAD</option>
                                                        <option value="AUDNZD">AUDNZD</option>
                                                        <option value="AUDCHF">AUDCHF</option>

                                                        <option value="NZDJPY">NZDJPY</option>
                                                        <option value="NZDCAD">NZDCAD</option>
                                                        <option value="NZDCHF">NZDCHF</option>

                                                        <option value="CADJPY">CADJPY</option>
                                                        <option value="CADCHF">CADCHF</option>
                                                        <option value="CHFJPY">CHFJPY</option>
                                                    </optgroup>
                                                    <optgroup label="Metals & Crypto">
                                                        <option value="XAUUSD">GOLD (XAUUSD)</option>
                                                        <option value="BTCUSD">BITCOIN</option>
                                                        <option value="ETHUSD">ETHEREUM</option>
                                                    </optgroup>
                                                    <optgroup label="Indices">
                                                        <option value="US30">US30</option>
                                                        <option value="NAS100">NAS100</option>
                                                        <option value="SPX500">S&P 500</option>
                                                        <option value="GER40">DAX (GER40)</option>
                                                    </optgroup>
                                                    <optgroup label="Stocks">
                                                        <option value="AAPL">Apple</option>
                                                        <option value="TSLA">Tesla</option>
                                                        <option value="NVDA">NVIDIA</option>
                                                        <option value="AMZN">Amazon</option>
                                                    </optgroup>
                                                </Select>
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


                                    {/* --- Extended Metrics (Sleep & Time) --- */}
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 border-t border-slate-800/50 pt-4">
                                        <div className="space-y-2 sm:col-span-2">
                                            <label className="text-xs text-slate-500 uppercase">Sleep Score</label>
                                            <Select
                                                value={editPlan.sleepScore || ""}
                                                onChange={e => setEditPlan({ ...editPlan, sleepScore: parseInt(e.target.value) })}
                                                className="bg-slate-950"
                                            >
                                                <option value="">Rate...</option>
                                                {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map(num => (
                                                    <option key={num} value={num}>{num}</option>
                                                ))}
                                            </Select>
                                        </div>
                                        <div className="space-y-2">
                                            <label className="text-xs text-slate-500 uppercase">Zone Created</label>
                                            <input
                                                type="datetime-local"
                                                value={editPlan.zoneCreationTime ? new Date(editPlan.zoneCreationTime).toISOString().slice(0, 16) : ""}
                                                onChange={(e) => setEditPlan({ ...editPlan, zoneCreationTime: new Date(e.target.value).getTime() })}
                                                className="flex h-10 w-full rounded-md border border-slate-800 bg-slate-950 px-3 py-2 text-sm text-slate-100 focus:outline-none focus:ring-2 focus:ring-cyan-500/50"
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <label className="text-xs text-slate-500 uppercase">Est. Entry</label>
                                            <input
                                                type="datetime-local"
                                                value={editPlan.entryTime ? new Date(editPlan.entryTime).toISOString().slice(0, 16) : ""}
                                                onChange={(e) => setEditPlan({ ...editPlan, entryTime: new Date(e.target.value).getTime() })}
                                                className="flex h-10 w-full rounded-md border border-slate-800 bg-slate-950 px-3 py-2 text-sm text-slate-100 focus:outline-none focus:ring-2 focus:ring-cyan-500/50"
                                            />
                                        </div>
                                    </div>

                                    <div className="space-y-4">
                                        <div className="space-y-2">
                                            <label className="text-xs text-slate-500 uppercase">Setup Chart (Required)</label>
                                            <ImageUploader
                                                value={editPlan.beforeImageUrl || ""}
                                                onChange={(url) => {
                                                    const converted = convertGoogleDriveLink(url);
                                                    setEditPlan({ ...editPlan, beforeImageUrl: converted });
                                                }}
                                                placeholder="https://..."
                                                initialValue={trade.beforeImageUrl}
                                            />
                                            {editPlan.beforeImageUrl && (
                                                <div className="relative w-full h-32 rounded-lg overflow-hidden border border-slate-700 mt-2">
                                                    <img
                                                        src={editPlan.beforeImageUrl}
                                                        alt="Plan Preview"
                                                        className="w-full h-full object-cover cursor-pointer hover:scale-105 transition-transform"
                                                        referrerPolicy="no-referrer"
                                                        onClick={() => window.open(editPlan.beforeImageUrl, '_blank')}
                                                    />
                                                </div>
                                            )}
                                        </div>

                                        <div className="space-y-2">
                                            <label className="text-xs text-slate-500 uppercase">Confirmation Chart (Optional)</label>
                                            <ImageUploader
                                                value={editPlan.confirmationImageUrl || ""}
                                                onChange={(url) => {
                                                    const converted = convertGoogleDriveLink(url);
                                                    setEditPlan({ ...editPlan, confirmationImageUrl: converted });
                                                }}
                                                placeholder="https://..."
                                                initialValue={trade.confirmationImageUrl}
                                            />
                                            {editPlan.confirmationImageUrl && (
                                                <div className="relative w-full h-32 rounded-lg overflow-hidden border border-slate-700 mt-2">
                                                    <img
                                                        src={editPlan.confirmationImageUrl}
                                                        alt="Confirmation Preview"
                                                        className="w-full h-full object-cover cursor-pointer hover:scale-105 transition-transform"
                                                        referrerPolicy="no-referrer"
                                                        onClick={() => window.open(editPlan.confirmationImageUrl, '_blank')}
                                                    />
                                                </div>
                                            )}
                                        </div>
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

                            {/* MAE / MFE */}
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <label className="text-sm font-medium text-slate-300">MAE (Drawdown R)</label>
                                    <Input
                                        type="number" step="0.1"
                                        className="bg-slate-950/50 border-red-900/30 focus:border-red-500 placeholder-red-900/50"
                                        placeholder="e.g. -0.5"
                                        value={maxAdverseExcursion}
                                        onChange={(e) => setMaxAdverseExcursion(e.target.value)}
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-sm font-medium text-slate-300">MFE (Peak R)</label>
                                    <Input
                                        type="number" step="0.1"
                                        className="bg-slate-950/50 border-green-900/30 focus:border-green-500 placeholder-green-900/50"
                                        placeholder="e.g. +3.2"
                                        value={maxFavorableExcursion}
                                        onChange={(e) => setMaxFavorableExcursion(e.target.value)}
                                    />
                                </div>
                            </div>

                            <div className="space-y-2">
                                <label className="text-sm font-medium text-slate-300">Detailed Closing Reason</label>
                                <Input
                                    className="bg-slate-950/50 border-slate-800 focus:border-purple-500"
                                    placeholder="Specific reason for closing..."
                                    value={closedReason}
                                    onChange={(e) => setClosedReason(e.target.value)}
                                />
                            </div>

                            <div className="space-y-2">
                                <label className="text-sm font-medium text-slate-300">Post-Trade Emotion</label>
                                <Select
                                    className="bg-slate-950/50 border-slate-800 focus:border-purple-500"
                                    value={postTradeEmotion}
                                    onChange={(e) => setPostTradeEmotion(e.target.value)}
                                >
                                    <option value="">Select Emotion...</option>
                                    <option value="Neutral">Neutral</option>
                                    <option value="Happy">Happy</option>
                                    <option value="Frustrated">Frustrated</option>
                                    <option value="Anxious">Anxious</option>
                                    <option value="Revenge">Revenge</option>
                                    <option value="Confident">Confident</option>
                                    <option value="Greedy">Greedy</option>
                                    <option value="Fearful">Fearful</option>
                                </Select>
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
                                <label className="text-sm font-medium text-slate-300">Result Image URL (TradingView or Google Drive)</label>
                                <ImageUploader
                                    value={afterImageUrl}
                                    onChange={(url) => {
                                        const converted = convertGoogleDriveLink(url);
                                        setAfterImageUrl(converted);
                                    }}
                                    placeholder="https://... or Upload"
                                    initialValue={trade.afterImageUrl}
                                />
                                {afterImageUrl && (
                                    <div className="relative w-full h-32 rounded-lg overflow-hidden border border-slate-700 mt-2">
                                        <img
                                            src={afterImageUrl}
                                            alt="Result Preview"
                                            className="w-full h-full object-cover cursor-pointer hover:scale-105 transition-transform"
                                            referrerPolicy="no-referrer"
                                            onClick={() => window.open(afterImageUrl, '_blank')}
                                        />
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

export default function TradeDetailsPage() {
    return (
        <Suspense fallback={<div className="p-8 text-white">Loading...</div>}>
            <TradeDetailsContent />
        </Suspense>
    )
}
