"use client"

import { useState } from "react"
import { Button } from "@/components/ui/Button"
import { Input } from "@/components/ui/Input"
import { Select } from "@/components/ui/Select"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card"
import { useAuth } from "@/context/AuthContext"
import { addTrade } from "@/lib/services/tradeService"
import { Trade, StrategyType } from "@/types"

interface JournalEntryFormProps {
    onSuccess?: () => void
}

export function JournalEntryForm({ onSuccess }: JournalEntryFormProps) {
    const { user } = useAuth()
    const [loading, setLoading] = useState(false)
    const [successMsg, setSuccessMsg] = useState("")

    // --- Core Context ---
    const [pair, setPair] = useState("EURUSD")
    const [direction, setDirection] = useState<"Long" | "Short">("Long")
    const [date, setDate] = useState(new Date().toISOString().slice(0, 16))
    const [session, setSession] = useState("NY")
    const [tradeType, setTradeType] = useState("Day Trade")
    const [marketCondition, setMarketCondition] = useState("Trending")

    // --- Execution Plan ---
    const [plannedEntry, setPlannedEntry] = useState("")
    const [plannedSL, setPlannedSL] = useState("")
    const [plannedTP, setPlannedTP] = useState("")
    const [riskAmount, setRiskAmount] = useState("")
    const [positionSize, setPositionSize] = useState("")
    const [entryReason, setEntryReason] = useState("")

    // --- Strategy Context ---
    const [strategy, setStrategy] = useState<StrategyType>("SupplyDemand")
    const [zoneType, setZoneType] = useState("Drop-Base-Rally")
    const [confirmation, setConfirmation] = useState("Limit Order")
    const [pdArray, setPdArray] = useState("Order Block")
    const [liquidityTarget, setLiquidityTarget] = useState("Previous Daily High/Low")

    // --- Psychology & Notes ---
    const [preTradeEmotion, setPreTradeEmotion] = useState("")
    const [notes, setNotes] = useState("")
    const [tags, setTags] = useState("")
    const [beforeImageUrl, setBeforeImageUrl] = useState("")

    // Helper: Calculate Planned RR
    const calculateRR = () => {
        const entry = parseFloat(plannedEntry)
        const sl = parseFloat(plannedSL)
        const tp = parseFloat(plannedTP)
        if (!entry || !sl || !tp) return 0

        const risk = Math.abs(entry - sl)
        const reward = Math.abs(tp - entry)
        if (risk === 0) return 0
        return parseFloat((reward / risk).toFixed(2))
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        if (!user) {
            alert("Please sign in to plan trades")
            return
        }

        setLoading(true)
        setSuccessMsg("")

        try {
            const plannedRR = calculateRR()

            const tradeData: Omit<Trade, "id" | "createdAt"> = {
                userId: user.uid,
                status: "Planned",
                date: date ? new Date(date).getTime() : Date.now(),
                instrument: pair,
                direction,
                strategy,
                tradeType,
                marketCondition,

                // Planning Phase
                plannedEntry: parseFloat(plannedEntry) || 0,
                plannedSL: parseFloat(plannedSL) || 0,
                plannedTP: parseFloat(plannedTP) || 0,
                plannedRR,
                riskAmount: parseFloat(riskAmount) || 0,
                positionSize: parseFloat(positionSize) || 0,
                entryReason: entryReason || "Technical",
                preTradeEmotion,

                // Metadata
                session,
                notes,
                tags: tags.split(",").map(t => t.trim()).filter(t => t !== ""),
                beforeImageUrl,

                // Conditional fields
                ...(strategy === "SupplyDemand" ? { zoneType, confirmation } : {}),
                ...(strategy === "ICT" ? { pdArray, liquidityTarget, confirmation } : {}),
            }

            await addTrade(tradeData)

            setSuccessMsg("Trade Plan Saved! Good luck.")
            setTimeout(() => setSuccessMsg(""), 3000)
            if (onSuccess) onSuccess()

            // Reset crucial fields only
            setNotes("")
            setPlannedEntry("")
            setPlannedSL("")
            setPlannedTP("")
            setRiskAmount("")
            setBeforeImageUrl("")

        } catch (error) {
            console.error("Error logging trade:", error)
            alert("Failed to save plan")
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="w-full max-w-5xl mx-auto p-4 animate-in fade-in zoom-in duration-500">
            <Card className="glass-card bg-slate-900/60 border-slate-700 shadow-2xl shadow-black/50">
                <CardHeader className="pb-4 border-b border-slate-800/50">
                    <CardTitle className="text-3xl font-bold bg-gradient-to-r from-cyan-400 to-blue-600 bg-clip-text text-transparent flex justify-between items-center">
                        <span>Trade Planner</span>
                        <div className="flex items-center gap-3">
                            <span className="text-xs font-mono text-slate-500 hidden sm:block">PHASE 1</span>
                            <div className="text-xs font-bold bg-blue-500/20 text-blue-400 px-3 py-1 rounded-full border border-blue-500/30">
                                Pre-Trade
                            </div>
                        </div>
                    </CardTitle>
                </CardHeader>
                <CardContent className="pt-6">
                    <form onSubmit={handleSubmit} className="space-y-8">

                        {successMsg && (
                            <div className="bg-green-500/10 border border-green-500/50 text-green-400 px-4 py-3 rounded-md text-center font-medium animate-pulse">
                                {successMsg}
                            </div>
                        )}

                        {/* SECTION 1: MARKET CONTEXT */}
                        <div className="space-y-4">
                            <h3 className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-2 flex items-center gap-2">
                                <span className="w-2 h-2 rounded-full bg-cyan-500"></span>
                                Market Context
                            </h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                                <div className="space-y-2">
                                    <label className="text-sm font-medium text-slate-300">Instrument</label>
                                    <Select value={pair} onChange={(e) => setPair(e.target.value)} className="h-11">
                                        <optgroup label="Forex Majors">
                                            <option value="EURUSD">EURUSD</option>
                                            <option value="GBPUSD">GBPUSD</option>
                                            <option value="USDJPY">USDJPY</option>
                                            <option value="USDCAD">USDCAD</option>
                                            <option value="AUDUSD">AUDUSD</option>
                                            <option value="USDCHF">USDCHF</option>
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
                                </div>
                                <div className="space-y-2">
                                    <label className="text-sm font-medium text-slate-300">Style</label>
                                    <Select value={tradeType} onChange={(e) => setTradeType(e.target.value)} className="h-11">
                                        <option value="Scalping">Scalping (M1-M5)</option>
                                        <option value="Day Trade">Day Trade (M15-H1)</option>
                                        <option value="Swing">Swing Trade (H4-D1)</option>
                                        <option value="Position">Position Trade</option>
                                    </Select>
                                </div>
                                <div className="space-y-2">
                                    <label className="text-sm font-medium text-slate-300">Condition</label>
                                    <Select value={marketCondition} onChange={(e) => setMarketCondition(e.target.value)} className="h-11">
                                        <option value="Trending">Trending</option>
                                        <option value="Ranging">Ranging / Choppy</option>
                                        <option value="Volatile">High Volatility</option>
                                        <option value="Quiet">Low Volatility</option>
                                        <option value="Reversal">Reversal</option>
                                    </Select>
                                </div>
                                <div className="space-y-2">
                                    <label className="text-sm font-medium text-slate-300">Direction</label>
                                    <div className="flex space-x-2 h-11">
                                        <Button type="button" variant={direction === "Long" ? "neon" : "outline"} onClick={() => setDirection("Long")} className="flex-1 h-full">Long</Button>
                                        <Button type="button" variant={direction === "Short" ? "destructive" : "outline"} onClick={() => setDirection("Short")} className="flex-1 h-full">Short</Button>
                                    </div>
                                </div>
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-4">
                                <div className="space-y-2">
                                    <label className="text-sm font-medium text-slate-300">Date & Time</label>
                                    <input
                                        type="datetime-local"
                                        value={date}
                                        onChange={(e) => setDate(e.target.value)}
                                        className="flex h-11 w-full rounded-md border border-slate-700 bg-slate-900/50 px-3 py-2 text-sm text-slate-100 focus:outline-none focus:ring-2 focus:ring-cyan-500/50"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-sm font-medium text-slate-300">Session</label>
                                    <Select value={session} onChange={(e) => setSession(e.target.value)} className="h-11">
                                        <option value="Asia">Asia</option>
                                        <option value="London">London</option>
                                        <option value="NY">New York</option>
                                        <option value="Overlap">London/NY Overlap</option>
                                    </Select>
                                </div>
                            </div>
                        </div>

                        <div className="h-px bg-slate-800/50 w-full" />

                        {/* SECTION 2: EXECUTION PLAN */}
                        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

                            {/* Left Col: Strategy Inputs */}
                            <div className="lg:col-span-2 space-y-6">
                                <h3 className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-2 flex items-center gap-2">
                                    <span className="w-2 h-2 rounded-full bg-purple-500"></span>
                                    Execution Parameters
                                </h3>

                                <div className="bg-slate-900/30 p-6 rounded-xl border border-slate-800 space-y-6">
                                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
                                        <div className="space-y-2">
                                            <div className="flex justify-between">
                                                <label className="text-sm text-slate-400">Entry</label>
                                                <span className="text-[10px] text-slate-600">LIMIT</span>
                                            </div>
                                            <Input type="number" step="0.00001" placeholder="1.00000" className="h-12 text-lg font-mono bg-slate-950/50" value={plannedEntry} onChange={(e) => setPlannedEntry(e.target.value)} />
                                        </div>
                                        <div className="space-y-2">
                                            <div className="flex justify-between">
                                                <label className="text-sm text-red-400/80">Stop Loss</label>
                                                <span className="text-[10px] text-red-900/60">Level</span>
                                            </div>
                                            <Input type="number" step="0.00001" placeholder="0.99800" className="h-12 text-lg font-mono bg-red-950/10 border-red-900/30 text-red-200 focus:border-red-500/50" value={plannedSL} onChange={(e) => setPlannedSL(e.target.value)} />
                                        </div>
                                        <div className="space-y-2">
                                            <div className="flex justify-between">
                                                <label className="text-sm text-amber-400/80">Risk ($)</label>
                                                <span className="text-[10px] text-amber-900/60">$$$</span>
                                            </div>
                                            <Input type="number" step="1" placeholder="50" className="h-12 text-lg font-mono bg-amber-950/10 border-amber-900/30 text-amber-200 focus:border-amber-500/50" value={riskAmount} onChange={(e) => setRiskAmount(e.target.value)} />
                                        </div>
                                        <div className="space-y-2">
                                            <div className="flex justify-between">
                                                <label className="text-sm text-green-400/80">Take Profit</label>
                                                <span className="text-[10px] text-green-900/60">Target</span>
                                            </div>
                                            <Input type="number" step="0.00001" placeholder="1.00500" className="h-12 text-lg font-mono bg-green-950/10 border-green-900/30 text-green-200 focus:border-green-500/50" value={plannedTP} onChange={(e) => setPlannedTP(e.target.value)} />
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 items-end">
                                        <div className="space-y-2">
                                            <label className="text-sm text-slate-400">Size (Lots)</label>
                                            <Input type="number" step="0.01" placeholder="1.0" className="h-10" value={positionSize} onChange={(e) => setPositionSize(e.target.value)} />
                                        </div>
                                        <div className="space-y-2">
                                            <label className="text-sm text-slate-400">Context Class</label>
                                            <Select value={entryReason} onChange={(e) => setEntryReason(e.target.value)} className="h-10">
                                                <option value="">Select Category...</option>
                                                <option value="Technical">Technical Structure</option>
                                                <option value="Fundamental">Fundamental Bias</option>
                                                <option value="Flow">Order Flow</option>
                                                <option value="News">News Event</option>
                                            </Select>
                                        </div>
                                    </div>
                                </div>

                                <div className="space-y-4">
                                    <div className="flex items-center justify-between">
                                        <label className="text-sm font-bold text-slate-300">Strategy Model</label>
                                        <div className="flex bg-slate-900 p-1 rounded-lg border border-slate-700">
                                            <button type="button" onClick={() => setStrategy("SupplyDemand")} className={`px-4 py-1.5 text-xs font-medium rounded-md transition-all ${strategy === 'SupplyDemand' ? 'bg-slate-700 text-white shadow' : 'text-slate-400 hover:text-white'}`}>Supply & Demand</button>
                                            <button type="button" onClick={() => setStrategy("ICT")} className={`px-4 py-1.5 text-xs font-medium rounded-md transition-all ${strategy === 'ICT' ? 'bg-slate-700 text-white shadow' : 'text-slate-400 hover:text-white'}`}>ICT</button>
                                        </div>
                                    </div>

                                    {/* Dynamic Strategy Fields */}
                                    <div className="bg-slate-900/30 p-4 rounded-lg border border-slate-800">
                                        {strategy === "SupplyDemand" && (
                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 animate-in slide-in-from-top-1">
                                                <div className="space-y-2">
                                                    <label className="text-xs text-slate-500 uppercase">Zone Type</label>
                                                    <Select value={zoneType} onChange={(e) => setZoneType(e.target.value)} className="h-9 text-sm">
                                                        <option>Drop-Base-Rally (Demand)</option>
                                                        <option>Rally-Base-Drop (Supply)</option>
                                                        <option>Rally-Base-Rally</option>
                                                        <option>Drop-Base-Drop</option>
                                                        <option>Support/Resistance Flip</option>
                                                    </Select>
                                                </div>
                                                <div className="space-y-2">
                                                    <label className="text-xs text-slate-500 uppercase">Trigger / Confirmation</label>
                                                    <Select value={confirmation} onChange={(e) => setConfirmation(e.target.value)} className="h-9 text-sm">
                                                        <option value="Limit Order">Direct Limit Order (Risk Entry)</option>
                                                        <option value="Engulfing">Engulfing Candle</option>
                                                        <option value="Pinbar">Pinbar / Rejection Wick</option>
                                                        <option value="Inside Bar">Inside Bar Breakout</option>
                                                        <option value="BOS">Lower timeframe BOS</option>
                                                    </Select>
                                                </div>
                                            </div>
                                        )}
                                        {strategy === "ICT" && (
                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 animate-in slide-in-from-top-1">
                                                <div className="space-y-2">
                                                    <label className="text-xs text-slate-500 uppercase">PD Array</label>
                                                    <Select value={pdArray} onChange={(e) => setPdArray(e.target.value)} className="h-9 text-sm">
                                                        <option>Order Block</option>
                                                        <option>Fair Value Gap (FVG)</option>
                                                        <option>Breaker Block</option>
                                                        <option>Mitigation Block</option>
                                                        <option>Rejection Block</option>
                                                    </Select>
                                                </div>
                                                <div className="space-y-2">
                                                    <label className="text-xs text-slate-500 uppercase">Trigger / Entry</label>
                                                    <Select value={confirmation} onChange={(e) => setConfirmation(e.target.value)} className="h-9 text-sm">
                                                        <option value="MSS">MSS (Market Structure Shift)</option>
                                                        <option value="Displacement">Displacement</option>
                                                        <option value="OTE">OTE (Optimal Trade Entry)</option>
                                                        <option value="SMT">SMT Divergence</option>
                                                        <option value="Turtle Soup">Turtle Soup</option>
                                                    </Select>
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>

                            {/* Right Col: Mental & Media */}
                            <div className="space-y-6">
                                <h3 className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-2 flex items-center gap-2">
                                    <span className="w-2 h-2 rounded-full bg-yellow-500"></span>
                                    Psychology & Visuals
                                </h3>

                                <div className="space-y-4">
                                    <div className="space-y-2">
                                        <label className="text-sm font-medium text-slate-300">How do you feel?</label>
                                        <Select value={preTradeEmotion} onChange={(e) => setPreTradeEmotion(e.target.value)} className="h-10 border-slate-700">
                                            <option value="">Select Emotion...</option>
                                            <option value="Calm">🧘 Calm / Flow State</option>
                                            <option value="Confident">🦅 Confident</option>
                                            <option value="Anxious">😰 Anxious / Hesitant</option>
                                            <option value="Impulsive">⚡ Impulsive / FOMO</option>
                                            <option value="Revenge">😡 Revenge / Frustrated</option>
                                            <option value="Greedy">🤑 Greedy</option>
                                        </Select>
                                    </div>

                                    <div className="space-y-2">
                                        <label className="text-sm font-medium text-slate-300">Chart URL (Optional)</label>
                                        <Input placeholder="TradingView Link..." value={beforeImageUrl} onChange={(e) => setBeforeImageUrl(e.target.value)} className="h-10 bg-slate-900/50" />
                                    </div>

                                    {beforeImageUrl ? (
                                        <div className="relative w-full aspect-video rounded-lg overflow-hidden border border-slate-700 bg-black">
                                            <img src={beforeImageUrl} alt="Setup" className="w-full h-full object-cover" />
                                        </div>
                                    ) : (
                                        <div className="w-full aspect-video rounded-lg border border-dashed border-slate-800 flex items-center justify-center bg-slate-900/20">
                                            <span className="text-xs text-slate-600">No Image Preview</span>
                                        </div>
                                    )}

                                    <div className="pt-4">
                                        {calculateRR() > 0 ? (
                                            <div className="flex items-center justify-between p-4 bg-blue-900/20 rounded-lg border border-blue-500/30">
                                                <span className="text-sm text-blue-300 font-medium">Risk : Reward</span>
                                                <span className="text-2xl font-bold text-blue-400">1 : {calculateRR()}</span>
                                            </div>
                                        ) : (
                                            <div className="flex items-center justify-between p-4 bg-slate-900 rounded-lg border border-slate-800">
                                                <span className="text-sm text-slate-500">Risk : Reward</span>
                                                <span className="text-xl font-bold text-slate-600">--</span>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="pt-4">
                            <label className="text-sm font-medium text-slate-300 mb-2 block">Detailed Plan Notes</label>
                            <textarea
                                className="flex min-h-[100px] w-full rounded-md border border-slate-700 bg-slate-900/50 px-3 py-2 text-sm text-slate-100 placeholder:text-slate-600 focus:outline-none focus:ring-2 focus:ring-purple-500/50"
                                placeholder="Describe the setup, invalidation level, and management plan..."
                                value={notes}
                                onChange={(e) => setNotes(e.target.value)}
                            />
                        </div>

                        <div className="flex justify-end pt-4">
                            <Button size="lg" className="w-full md:w-auto min-w-[200px] bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white shadow-lg shadow-cyan-900/20 border-0" disabled={loading}>
                                {loading ? "Saving Plan..." : "Commit To Plan"}
                            </Button>
                        </div>

                    </form>
                </CardContent>
            </Card>
        </div>
    )
}
