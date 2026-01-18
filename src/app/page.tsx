"use client";
import { JournalEntryForm } from "@/components/features/JournalEntryForm"
import { AnalyticsChart } from "@/components/features/AnalyticsChart"
import { useAuth } from "@/context/AuthContext"
import { Button } from "@/components/ui/Button"

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
            {/* Stats Summary Placeholders */}
            <div className="hidden md:block bg-slate-800/50 backdrop-blur rounded-lg p-3 border border-slate-700">
              <div className="text-xs text-slate-400 uppercase tracking-wider">Win Rate</div>
              <div className="text-xl font-bold text-green-400">68%</div>
            </div>

            <AuthButton />
          </div>
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

          {/* Left Column: Entry Form */}
          <div className="lg:col-span-1">
            <JournalEntryForm />
          </div>

          {/* Right Column: Dashboard/Analytic Views (Placeholder for now) */}
          <div className="lg:col-span-2 space-y-6">
            {/* Navigation Tabs Placeholder */}
            <div className="flex space-x-1 bg-slate-900 p-1 rounded-lg border border-slate-800 w-fit">
              <button className="px-4 py-2 bg-slate-800 rounded-md text-sm font-medium shadow text-white">Daily</button>
              <button className="px-4 py-2 hover:bg-slate-800/50 rounded-md text-sm font-medium text-slate-400">Weekly</button>
              <button className="px-4 py-2 hover:bg-slate-800/50 rounded-md text-sm font-medium text-slate-400">Monthly</button>
            </div>

            <div className="h-96">
              <AnalyticsChart />
            </div>
          </div>
        </div>
      </div>
    </main>
  )
}
