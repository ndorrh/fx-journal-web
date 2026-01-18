"use client"

import { useState } from "react"
import { Button } from "@/components/ui/Button"
import { Input } from "@/components/ui/Input"
import { Select } from "@/components/ui/Select"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card"
import { cn } from "@/lib/utils"
// import { Upload } from "lucide-react" // Expecting lucide-react to be available
import { useAuth } from "@/context/AuthContext"
import { addTrade, uploadTradeImage } from "@/lib/services/tradeService"
import { Trade } from "@/types"

type StrategyType = "SupplyDemand" | "ICT" | "Other"

export function JournalEntryForm() {
    const { user } = useAuth()
    const [strategy, setStrategy] = useState<StrategyType>("SupplyDemand")
    const [loading, setLoading] = useState(false)

    // Form State
    const [pair, setPair] = useState("EURUSD")
    const [date, setDate] = useState("")
    const [direction, setDirection] = useState<"Long" | "Short">("Long")
    const [result, setResult] = useState<"Win" | "Loss" | "BE">("Win")
    const [rr, setRr] = useState("")
    const [pnl, setPnl] = useState("")
    const [session, setSession] = useState("NY")

    // Strategy Specifics
    const [zoneType, setZoneType] = useState("Drop-Base-Rally")
    const [confirmation, setConfirmation] = useState("Limit Order")
    const [pdArray, setPdArray] = useState("Order Block")
    const [liquidityTarget, setLiquidityTarget] = useState("Previous Daily High/Low")

    // Images
    const [beforeImage, setBeforeImage] = useState<File | null>(null)
    const [afterImage, setAfterImage] = useState<File | null>(null)

    const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>, type: "before" | "after") => {
        if (e.target.files && e.target.files[0]) {
            if (type === "before") setBeforeImage(e.target.files[0])
            else setAfterImage(e.target.files[0])
        }
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        if (!user) {
            alert("Please sign in to log trades")
            return
        }

        setLoading(true)
        try {
            let beforeImageUrl = ""
            let afterImageUrl = ""

            if (beforeImage) {
                beforeImageUrl = await uploadTradeImage(beforeImage, user.uid)
            }
            if (afterImage) {
                afterImageUrl = await uploadTradeImage(afterImage, user.uid)
            }

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
                // Conditional fields
                ...(strategy === "SupplyDemand" ? { zoneType, confirmation } : {}),
                ...(strategy === "ICT" ? { pdArray, liquidityTarget } : {}),
                beforeImageUrl,
                afterImageUrl
            }

            await addTrade(tradeData)
            alert("Trade Logged Successfully!")
            // Reset form or redirect could go here
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
                                <Input type="datetime-local" className="text-slate-100" value={date} onChange={(e) => setDate(e.target.value)} />
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

                        {/* Strategy Selection */}
                        <div className="space-y-2 pt-4 border-t border-slate-700/50">
                            <label className="text-sm font-medium text-slate-300">Strategy Used</label>
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

                        {/* Image Upload Section */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4">
                            {/* Before Image */}
                            <div className="border-2 border-dashed border-slate-700 rounded-lg p-6 flex flex-col items-center justify-center text-slate-400 hover:border-slate-500 transition-colors cursor-pointer bg-slate-900/20 relative">
                                <Input
                                    type="file"
                                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                                    accept="image/*"
                                    onChange={(e) => handleImageChange(e, "before")}
                                />
                                <span className="text-sm font-medium">{beforeImage ? beforeImage.name : 'Upload "Before" Chart'}</span>
                                <span className="text-xs text-slate-500 mt-1">Click to select or drag file</span>
                            </div>

                            {/* After Image */}
                            <div className="border-2 border-dashed border-slate-700 rounded-lg p-6 flex flex-col items-center justify-center text-slate-400 hover:border-slate-500 transition-colors cursor-pointer bg-slate-900/20 relative">
                                <Input
                                    type="file"
                                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                                    accept="image/*"
                                    onChange={(e) => handleImageChange(e, "after")}
                                />
                                <span className="text-sm font-medium">{afterImage ? afterImage.name : 'Upload "After" Chart'}</span>
                                <span className="text-xs text-slate-500 mt-1">Click to select or drag file</span>
                            </div>
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
