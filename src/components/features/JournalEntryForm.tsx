"use client"

import { useState } from "react"
import { Button } from "@/components/ui/Button"
import { Input } from "@/components/ui/Input"
import { Select } from "@/components/ui/Select"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card"
import { useAuth } from "@/context/AuthContext"
import { addTrade } from "@/lib/services/tradeService"
import { Trade } from "@/types"

type StrategyType = "SupplyDemand" | "ICT" | "Other"

export function JournalEntryForm() {
    const { user } = useAuth()
    const [loading, setLoading] = useState(false)

    // Form State
    const [strategy, setStrategy] = useState<StrategyType>("SupplyDemand")
    const [pair, setPair] = useState("EURUSD")
    const [date, setDate] = useState("")
    const [direction, setDirection] = useState<"Long" | "Short">("Long")
    const [result, setResult] = useState<"Win" | "Loss" | "BE">("Win")
    const [rr, setRr] = useState("")
    const [pnl, setPnl] = useState("")
    const [session, setSession] = useState("NY")

    // Mental & Context
    const [psychology, setPsychology] = useState("")
    const [notes, setNotes] = useState("")
    const [tags, setTags] = useState("")

    // Strategy Specifics
    const [zoneType, setZoneType] = useState("Drop-Base-Rally")
    const [confirmation, setConfirmation] = useState("Limit Order")
    const [pdArray, setPdArray] = useState("Order Block")
    const [liquidityTarget, setLiquidityTarget] = useState("Previous Daily High/Low")

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        if (!user) {
            alert("Please sign in to log trades")
            return
        }

        setLoading(true)
        try {
            const tradeData: Omit<Trade, "id" | "createdAt"> = {
                userId: user.uid,
                pair,
                date: date ? new Date(date).getTime() : Date.now(),
                direction,
                result,
                rr: parseFloat(rr) || 0,
                pnl: parseFloat(pnl) || 0,
                session,
                strategy,

                // New Fields
                psychology,
                notes,
                tags: tags.split(",").map(t => t.trim()).filter(t => t !== ""),

                // Conditional fields
                ...(strategy === "SupplyDemand" ? { zoneType, confirmation } : {}),
                ...(strategy === "ICT" ? { pdArray, liquidityTarget } : {}),
            }

            await addTrade(tradeData)
            alert("Trade Logged Successfully!")

            // Optional: Reset form here if desired
            setNotes("")
            setTags("")
            setPnl("")
            setRr("")

        } catch (error) {
            console.error("Error logging trade:", error)
            alert("Failed to log trade")
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="w-full max-w-4xl mx-auto p-4 animate-in fade-in zoom-in duration-500">
            <Card className="glass-card bg-slate-900/60 border-slate-700">
                <CardHeader>
                    <CardTitle className="text-3xl font-bold bg-gradient-to-r from-cyan-400 to-blue-600 bg-clip-text text-transparent">
                        New Trade Entry
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <form onSubmit={handleSubmit} className="space-y-6">

                        {/* General Information Section */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <label className="text-sm font-medium text-slate-300">Pair</label>
                                <Select value={pair} onChange={(e) => setPair(e.target.value)}>
                                    <option value="EURUSD">EURUSD</option>
                                    <option value="GBPUSD">GBPUSD</option>
                                    <option value="XAUUSD">XAUUSD</option>
                                    <option value="BTCUSD">BTCUSD</option>
                                    <option value="US30">US30</option>
                                    <option value="NAS100">NAS100</option>
                                </Select>
                            </div>

                            <div className="space-y-2">
                                <label className="text-sm font-medium text-slate-300">Date & Time</label>
                                <Input
                                    type="datetime-local"
                                    className="text-slate-100 placeholder-slate-500 cursor-pointer"
                                    value={date}
                                    max={new Date().toISOString().slice(0, 16)}
                                    onChange={(e) => setDate(e.target.value)}
                                    onClick={(e) => {
                                        try {
                                            // @ts-ignore
                                            if (typeof e.currentTarget.showPicker === "function") {
                                                // @ts-ignore
                                                e.currentTarget.showPicker();
                                            }
                                        } catch (error) {
                                            // Ignore
                                        }
                                    }}
                                />
                            </div>

                            <div className="space-y-2">
                                <label className="text-sm font-medium text-slate-300">Direction</label>
                                <div className="flex space-x-2">
                                    <Button
                                        type="button"
                                        variant={direction === "Long" ? "neon" : "outline"}
                                        className="w-full"
                                        onClick={() => setDirection("Long")}
                                    >Long</Button>
                                    <Button
                                        type="button"
                                        variant={direction === "Short" ? "destructive" : "outline"}
                                        className="w-full"
                                        onClick={() => setDirection("Short")}
                                    >Short</Button>
                                </div>
                            </div>

                            <div className="space-y-2">
                                <label className="text-sm font-medium text-slate-300">Result</label>
                                <Select value={result} onChange={(e) => setResult(e.target.value as any)}>
                                    <option value="Win">Win</option>
                                    <option value="Loss">Loss</option>
                                    <option value="BE">Break Even</option>
                                </Select>
                            </div>

                            <div className="space-y-2">
                                <label className="text-sm font-medium text-slate-300">RR Achieved</label>
                                <Input type="number" step="0.1" placeholder="e.g. 2.5" value={rr} onChange={(e) => setRr(e.target.value)} />
                            </div>

                            <div className="space-y-2">
                                <label className="text-sm font-medium text-slate-300">PnL ($)</label>
                                <Input type="number" step="1" placeholder="e.g. 500" value={pnl} onChange={(e) => setPnl(e.target.value)} />
                            </div>

                            <div className="space-y-2">
                                <label className="text-sm font-medium text-slate-300">Session</label>
                                <Select value={session} onChange={(e) => setSession(e.target.value)}>
                                    <option value="Asia">Asian Session</option>
                                    <option value="London">London Open</option>
                                    <option value="NY">New York Open</option>
                                    <option value="Close">London Close</option>
                                </Select>
                            </div>
                        </div>

                        {/* Mental & Context Section */}
                        <div className="space-y-4 pt-4 border-t border-slate-700/50">
                            <h3 className="text-lg font-semibold text-slate-200">Mental & Context</h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <label className="text-sm font-medium text-slate-300">Psychology / State of Mind</label>
                                    <Select value={psychology} onChange={(e) => setPsychology(e.target.value)}>
                                        <option value="">Select...</option>
                                        <option value="Confident">Confident</option>
                                        <option value="Anxious">Anxious</option>
                                        <option value="FOMO">FOMO (Fear Of Missing Out)</option>
                                        <option value="Revenge">Revenge Trading</option>
                                        <option value="Patient">Patient / Calm</option>
                                        <option value="Tired">Tired / Distracted</option>
                                    </Select>
                                </div>
                                <div className="space-y-2">
                                    <label className="text-sm font-medium text-slate-300">Tags (comma separated)</label>
                                    <Input
                                        placeholder="e.g. A+ Setup, News Event, Mistake"
                                        value={tags}
                                        onChange={(e) => setTags(e.target.value)}
                                    />
                                </div>
                                <div className="space-y-2 md:col-span-2">
                                    <label className="text-sm font-medium text-slate-300">Notes / Strategy</label>
                                    <textarea
                                        className="flex min-h-[100px] w-full rounded-md border border-slate-700 bg-slate-900/50 px-3 py-2 text-sm text-slate-100 placeholder:text-slate-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-500 disabled:cursor-not-allowed disabled:opacity-50"
                                        placeholder="Describe your thought process, entry triggers, and management..."
                                        value={notes}
                                        onChange={(e) => setNotes(e.target.value)}
                                    />
                                </div>
                            </div>
                        </div>

                        {/* Strategy Selection */}
                        <div className="space-y-2 pt-4 border-t border-slate-700/50">
                            <label className="text-sm font-medium text-slate-300">Strategy Type (Specifics)</label>
                            <div className="flex space-x-2">
                                <Button
                                    type="button"
                                    variant={strategy === "SupplyDemand" ? "default" : "outline"}
                                    onClick={() => setStrategy("SupplyDemand")}
                                    className="flex-1"
                                >Supply & Demand</Button>
                                <Button
                                    type="button"
                                    variant={strategy === "ICT" ? "default" : "outline"}
                                    onClick={() => setStrategy("ICT")}
                                    className="flex-1"
                                >ICT Concepts</Button>
                            </div>
                        </div>

                        {/* Dynamic Strategy Fields */}
                        <div className="bg-slate-900/30 p-4 rounded-lg border border-slate-800">
                            {strategy === "SupplyDemand" && (
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 animate-in slide-in-from-top-2">
                                    <div className="space-y-2">
                                        <label className="text-sm text-slate-400">Zone Type</label>
                                        <Select value={zoneType} onChange={(e) => setZoneType(e.target.value)}>
                                            <option>Drop-Base-Rally (Demand)</option>
                                            <option>Rally-Base-Drop (Supply)</option>
                                            <option>Rally-Base-Rally</option>
                                            <option>Drop-Base-Drop</option>
                                        </Select>
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-sm text-slate-400">Confirmation</label>
                                        <Select value={confirmation} onChange={(e) => setConfirmation(e.target.value)}>
                                            <option>Limit Order (Touch)</option>
                                            <option>Engulfing Candle</option>
                                            <option>Pinbar Rejection</option>
                                            <option>Lower TF Change of Character</option>
                                        </Select>
                                    </div>
                                </div>
                            )}

                            {strategy === "ICT" && (
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 animate-in slide-in-from-top-2">
                                    <div className="space-y-2">
                                        <label className="text-sm text-slate-400">PD Array</label>
                                        <Select value={pdArray} onChange={(e) => setPdArray(e.target.value)}>
                                            <option>Order Block</option>
                                            <option>Fair Value Gap (FVG)</option>
                                            <option>Breaker Block</option>
                                            <option>Mitigation Block</option>
                                            <option>Liquidity Void</option>
                                        </Select>
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-sm text-slate-400">Liquidity Target</label>
                                        <Select value={liquidityTarget} onChange={(e) => setLiquidityTarget(e.target.value)}>
                                            <option>Previous Daily High/Low</option>
                                            <option>Equal Highs/Lows</option>
                                            <option>Session High/Low</option>
                                        </Select>
                                    </div>
                                </div>
                            )}
                        </div>

                        <Button size="lg" className="w-full mt-4 bg-cyan-600 hover:bg-cyan-500 text-white shadow-lg shadow-cyan-900/20" disabled={loading}>
                            {loading ? "Logging Trade..." : "Log Trade to Journal"}
                        </Button>

                    </form>
                </CardContent>
            </Card>
        </div>
    )
}
