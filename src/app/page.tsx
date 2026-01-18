"use client";
import { useState, useEffect } from "react"
import { JournalEntryForm } from "@/components/features/JournalEntryForm"
import { AnalyticsChart } from "@/components/features/AnalyticsChart"
import { TradeHistory } from "@/components/features/TradeHistory"
import { Navbar } from "@/components/features/Navbar"
import { Modal } from "@/components/ui/Modal"
import { useAuth } from "@/context/AuthContext"
import { getTrades } from "@/lib/services/tradeService"
import { cn } from "@/lib/utils"

import { LandingPage } from "@/components/features/LandingPage"

export default function Home() {
  const { user } = useAuth()
  const [activeTab, setActiveTab] = useState("Daily")
  const [trades, setTrades] = useState<any[]>([])
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [loading, setLoading] = useState(false)

  // Load Data
  const loadTrades = async () => {
    if (!user) {
      setTrades([])
      return
    }
    try {
      setLoading(true)
      const data = await getTrades(user.uid)
      setTrades(data)
    } catch (error) {
      console.error("Failed to load trades", error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadTrades()
  }, [user])

  if (!user) {
    return <LandingPage />
  }

  return (
    <main className="min-h-screen bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-slate-900 via-[#0a0f1e] to-black text-white">

      {/* Navbar with Action Trigger */}
      <Navbar onNewTradeClick={() => setIsModalOpen(true)} />

      <div className="max-w-7xl mx-auto p-4 md:p-8 space-y-8">

        {/* Modal for Trade Entry */}
        <Modal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          title="Log New Trade Plan"
        >
          <JournalEntryForm onSuccess={() => {
            setIsModalOpen(false) // Auto close
            loadTrades() // Refresh data
          }} />
        </Modal>

        {/* Dashboard Content */}
        {!user ? (
          <div className="text-center py-20 animate-in fade-in slide-in-from-bottom-5">
            <h1 className="text-5xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-purple-600 mb-4">
              Master Your Trading Psychology
            </h1>
            <p className="text-slate-400 text-lg max-w-2xl mx-auto">
              Connect your account to start tracking, analyzing, and improving your edge.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Left Column: Analytics Chart */}
            <div className="lg:col-span-2 space-y-6">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-bold text-white">Performance Overview</h2>

                {/* Timeframe Select */}
                <div className="flex space-x-1 bg-slate-900/50 p-1 rounded-lg border border-slate-800">
                  {["Daily", "Weekly", "Monthly"].map((tab) => (
                    <button
                      key={tab}
                      onClick={() => setActiveTab(tab)}
                      className={cn(
                        "px-3 py-1.5 rounded-md text-xs font-medium transition-all duration-200",
                        activeTab === tab
                          ? "bg-slate-800 text-white shadow shadow-cyan-900/10"
                          : "text-slate-400 hover:text-slate-200"
                      )}
                    >
                      {tab}
                    </button>
                  ))}
                </div>
              </div>

              <div className="min-h-[400px]">
                <AnalyticsChart trades={trades} timeframe={activeTab} />
              </div>
            </div>

            {/* Right Column: Trade Feed */}
            <div className="lg:col-span-1">
              <div className="sticky top-24">
                <TradeHistory trades={trades} />
              </div>
            </div>
          </div>
        )}
      </div>
    </main>
  )
}
