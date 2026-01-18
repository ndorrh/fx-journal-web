"use client";
import { useState, useEffect } from "react"
import { JournalEntryForm } from "@/components/features/JournalEntryForm"
import { AnalyticsChart } from "@/components/features/AnalyticsChart"
import { TradeHistory } from "@/components/features/TradeHistory"
import { useAuth } from "@/context/AuthContext"
import { Button } from "@/components/ui/Button"
import { getTrades } from "@/lib/services/tradeService"
import { cn } from "@/lib/utils"

function AuthButton() {
  const { user, signInWithGoogle, logout } = useAuth()

  if (user) {
    return (
      <div className="flex items-center gap-4">
        <div className="text-right hidden sm:block">
          <div className="text-sm font-medium text-white">{user.displayName}</div>
          <div className="text-xs text-slate-400">Pro Trader</div>
        </div>
        <Button variant="outline" onClick={logout} className="border-red-500/50 text-red-400 hover:bg-red-950/30">
          Sign Out
        </Button>
      </div>
    )
  }

  return (
    <Button onClick={signInWithGoogle} variant="neon">
      Connect Journal
    </Button>
  )
}


export default function Home() {
  const { user } = useAuth()
  const [activeTab, setActiveTab] = useState("Daily")
  const [trades, setTrades] = useState<any[]>([])
  const [winRate, setWinRate] = useState("0%")
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    async function loadTrades() {
      if (!user) {
        setTrades([])
        setWinRate("0%")
        return
      }

      try {
        setLoading(true)
        const data = await getTrades(user.uid)
        setTrades(data)

        const wins = data.filter((t: any) => t.result === "Win").length
        const totalForCalc = data.length

        if (totalForCalc > 0) {
          const rate = (wins / totalForCalc) * 100
          setWinRate(rate.toFixed(0) + "%")
        } else {
          setWinRate("0%")
        }

      } catch (error) {
        console.error("Failed to load trades", error)
      } finally {
        setLoading(false)
      }
    }

    loadTrades()
  }, [user])

  return (
    <main className="min-h-screen bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-slate-900 via-[#0a0f1e] to-black text-white p-4 md:p-8">
      <div className="max-w-7xl mx-auto space-y-10">

        {/* Header Section */}
        <div className="flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
          <div>
            <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-purple-600">
              FX Mastery Journal
            </h1>
            <p className="text-slate-400 mt-2">Track. Analyze. Dominate the Markets.</p>
          </div>

          <div className="flex items-center space-x-4">
            {/* Stats Summary */}
            <div className="hidden md:block bg-slate-800/50 backdrop-blur rounded-lg p-3 border border-slate-700 min-w-[120px] text-center">
              <div className="text-xs text-slate-400 uppercase tracking-wider">Win Rate</div>
              <div className={`text-xl font-bold ${parseFloat(winRate) >= 50 ? 'text-green-400' : 'text-red-400'}`}>
                {loading ? "..." : winRate}
              </div>
            </div>

            <AuthButton />
          </div>
        </div>

        {/* Trade Planner Section (Full Width) */}
        <div className="w-full">
          <JournalEntryForm onSuccess={() => {
            // Trigger reload
            const loadTrades = async () => {
              if (!user) return
              try {
                const data = await getTrades(user.uid)
                setTrades(data)
                // Update winrate
                const wins = data.filter((t: any) => t.result === "Win").length
                if (data.length > 0) {
                  setWinRate(((wins / data.length) * 100).toFixed(0) + "%")
                }
              } catch (e) { console.error(e) }
            }
            loadTrades()
          }} />
        </div>

        {/* Analytics & History Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

          {/* Left Column: Analytics Chart */}
          <div className="lg:col-span-2 space-y-6">
            {/* Navigation Tabs */}
            <div className="flex space-x-1 bg-slate-900 p-1 rounded-lg border border-slate-800 w-fit">
              {["Daily", "Weekly", "Monthly"].map((tab) => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={cn(
                    "px-4 py-2 rounded-md text-sm font-medium transition-all duration-200",
                    activeTab === tab
                      ? "bg-slate-800 text-white shadow shadow-cyan-900/10"
                      : "text-slate-400 hover:bg-slate-800/50 hover:text-slate-200"
                  )}
                >
                  {tab}
                </button>
              ))}
            </div>

            <div className="min-h-[400px]">
              <AnalyticsChart trades={trades} timeframe={activeTab} />
            </div>
          </div>

          {/* Right Column: Trade Feed */}
          <div className="lg:col-span-1">
            <div className="sticky top-8">
              <TradeHistory trades={trades} />
            </div>
          </div>
        </div>
      </div>
    </main>
  )
}
