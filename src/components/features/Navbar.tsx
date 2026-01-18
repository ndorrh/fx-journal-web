"use client"

import { useState } from "react"
import { useAuth } from "@/context/AuthContext"
import { Button } from "@/components/ui/Button"
import { Menu, X, PlusCircle, LayoutDashboard, LineChart } from "lucide-react"
import Link from "next/link"

interface NavbarProps {
    onNewTradeClick: () => void
}

export function Navbar({ onNewTradeClick }: NavbarProps) {
    const { user, signInWithGoogle, logout } = useAuth()
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)

    return (
        <nav className="sticky top-0 z-40 w-full border-b border-slate-800 bg-slate-950/80 backdrop-blur supports-[backdrop-filter]:bg-slate-950/60">
            <div className="max-w-7xl mx-auto px-4 md:px-8">
                <div className="flex h-16 items-center justify-between">

                    {/* Brand */}
                    <div className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-cyan-500 to-purple-600 flex items-center justify-center shadow-lg shadow-cyan-500/20">
                            <span className="font-bold text-white">FX</span>
                        </div>
                        <span className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-white to-slate-400 hidden sm:block">
                            Mastery Journal
                        </span>
                    </div>

                    {/* Desktop Actions */}
                    <div className="hidden md:flex items-center gap-6">
                        {user ? (
                            <div className="flex items-center gap-4">
                                <Link href="/analytics" className="text-slate-400 hover:text-white transition-colors flex items-center gap-2 text-sm font-medium mr-2">
                                    <LineChart size={18} />
                                    Analytics
                                </Link>
                                <Button
                                    onClick={onNewTradeClick}
                                    className="gap-2 bg-cyan-600 hover:bg-cyan-500 text-white border-0 shadow-lg shadow-cyan-900/20"
                                >
                                    <PlusCircle size={18} />
                                    Log Trade
                                </Button>
                                <div className="h-6 w-px bg-slate-800" />

                                <div className="flex items-center gap-3">
                                    <div className="text-right hidden lg:block">
                                        <div className="text-sm font-medium text-white">{user.displayName}</div>
                                        <div className="text-xs text-slate-400">Pro Trader</div>
                                    </div>
                                    <div className="h-10 w-10 rounded-full bg-slate-800 border-2 border-slate-700/50 flex items-center justify-center overflow-hidden shadow-inner hidden lg:flex">
                                        {user.photoURL ? (
                                            <img src={user.photoURL} alt="Profile" className="h-full w-full object-cover" />
                                        ) : (
                                            <span className="text-sm font-bold text-slate-300">
                                                {user.displayName ? user.displayName.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase() : 'FX'}
                                            </span>
                                        )}
                                    </div>
                                </div>
                                <Button variant="ghost" onClick={logout} className="text-red-400 hover:text-red-300 hover:bg-red-950/30">
                                    Sign Out
                                </Button>
                            </div>
                        ) : (
                            <Button onClick={signInWithGoogle} variant="neon">
                                Connect Journal
                            </Button>
                        )}
                    </div>

                    {/* Mobile Menu Button */}
                    <div className="flex md:hidden">
                        <button
                            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                            className="p-2 text-slate-400 hover:text-white"
                        >
                            {isMobileMenuOpen ? <X /> : <Menu />}
                        </button>
                    </div>
                </div>
            </div>

            {/* Mobile Menu */}
            {isMobileMenuOpen && (
                <div className="md:hidden border-t border-slate-800 bg-slate-950">
                    <div className="space-y-1 px-4 pb-3 pt-2">
                        {user ? (
                            <>
                                <div className="flex items-center gap-3 px-3 py-3 border-b border-slate-800 mb-2">
                                    <div className="w-10 h-10 rounded-full bg-slate-800 border-2 border-slate-700/50 flex items-center justify-center overflow-hidden shadow-inner">
                                        {user.photoURL ? (
                                            <img src={user.photoURL} alt="Profile" className="h-full w-full object-cover" />
                                        ) : (
                                            <span className="text-sm font-bold text-slate-300">
                                                {user.displayName ? user.displayName.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase() : 'FX'}
                                            </span>
                                        )}
                                    </div>
                                    <div>
                                        <div className="text-sm font-medium text-white">{user.displayName}</div>
                                        <div className="text-xs text-slate-500">Pro Trader</div>
                                    </div>
                                </div>

                                <Link href="/analytics" className="block w-full mb-2" onClick={() => setIsMobileMenuOpen(false)}>
                                    <div className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-slate-400 hover:text-white hover:bg-slate-800 rounded-md transition-colors">
                                        <LineChart size={18} />
                                        Analytics
                                    </div>
                                </Link>

                                <Button
                                    onClick={() => { onNewTradeClick(); setIsMobileMenuOpen(false) }}
                                    className="w-full justify-start gap-2 mb-2"
                                    variant="neon"
                                >
                                    <PlusCircle size={18} />
                                    New Trade Entry
                                </Button>
                                <Button
                                    variant="ghost"
                                    onClick={logout}
                                    className="w-full justify-start text-red-400 hover:bg-red-950/30"
                                >
                                    Sign Out
                                </Button>
                            </>
                        ) : (
                            <Button onClick={signInWithGoogle} className="w-full">
                                Connect Journal
                            </Button>
                        )}
                    </div>
                </div>
            )}
        </nav>
    )
}
