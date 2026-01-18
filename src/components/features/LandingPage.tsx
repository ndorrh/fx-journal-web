"use client"

import { useAuth } from "@/context/AuthContext"
import { Button } from "@/components/ui/Button"
import { ArrowRight, BarChart2, Brain, Target, Zap } from "lucide-react"

export function LandingPage() {
    const { signInWithGoogle } = useAuth()

    return (
        <div className="relative min-h-screen overflow-hidden flex flex-col justify-center items-center text-center px-4">

            {/* Animated Background Layers */}
            <div className="absolute inset-0 z-0">
                <div className="absolute top-0 left-1/4 w-[500px] h-[500px] bg-purple-600/20 rounded-full blur-[120px] animate-pulse" />
                <div className="absolute bottom-0 right-1/4 w-[500px] h-[500px] bg-cyan-600/20 rounded-full blur-[120px] animate-pulse delay-1000" />
                <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.03)_1px,transparent_1px)] bg-[size:100px_100px] [mask-image:radial-gradient(ellipse_at_center,black_20%,transparent_70%)]" />
            </div>

            {/* Hero Content */}
            <div className="relative z-10 max-w-5xl mx-auto space-y-8">

                {/* Badge */}
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-slate-900/50 border border-slate-700 text-xs font-medium text-cyan-400 animate-in fade-in slide-in-from-top-4 duration-700">
                    <span className="relative flex h-2 w-2">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-cyan-400 opacity-75"></span>
                        <span className="relative inline-flex rounded-full h-2 w-2 bg-cyan-500"></span>
                    </span>
                    <span>v2.0 Now Live</span>
                </div>

                {/* Headline */}
                <h1 className="text-6xl md:text-8xl font-black tracking-tighter text-transparent bg-clip-text bg-gradient-to-b from-white via-slate-200 to-slate-600 animate-in fade-in zoom-in duration-1000">
                    TRADE LIKE <br />
                    <span className="bg-clip-text text-transparent bg-gradient-to-r from-cyan-400 to-purple-600 decoration-cyan-500/30 underline decoration-4 underline-offset-8">
                        A MACHINE
                    </span>
                </h1>

                {/* Subtitle */}
                <p className="text-xl md:text-2xl text-slate-400 max-w-2xl mx-auto leading-relaxed animate-in fade-in slide-in-from-bottom-4 duration-1200 delay-200">
                    The advanced journaling platform for traders who demand <span className="text-white font-semibold">precision</span>, <span className="text-white font-semibold">accountability</span>, and <span className="text-white font-semibold">growth</span>.
                </p>

                {/* CTA Buttons */}
                <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-6 animate-in fade-in slide-in-from-bottom-8 duration-1000 delay-300">
                    <Button
                        onClick={signInWithGoogle}
                        size="lg"
                        className="h-14 px-8 text-lg bg-cyan-600 hover:bg-cyan-500 text-white shadow-[0_0_30px_-5px_rgba(8,145,178,0.6)] border-0 rounded-full group transition-all hover:scale-105"
                    >
                        Start Journey
                        <ArrowRight className="ml-2 group-hover:translate-x-1 transition-transform" />
                    </Button>
                    <button className="px-8 py-4 rounded-full text-slate-400 font-medium hover:text-white transition-colors">
                        View Demo
                    </button>
                </div>
            </div>

            {/* Feature Cards */}
            <div className="relative z-10 grid grid-cols-1 md:grid-cols-3 gap-6 mt-24 max-w-6xl w-full px-4 animate-in fade-in slide-in-from-bottom-12 duration-1000 delay-500">
                <FeatureCard
                    icon={<Brain className="text-purple-400" size={32} />}
                    title="Psychology First"
                    description="Track your emotional state before every trade to identify tilt triggers."
                />
                <FeatureCard
                    icon={<Target className="text-cyan-400" size={32} />}
                    title="Precision Planning"
                    description="Define entry, risk, and reward parameters before execution."
                />
                <FeatureCard
                    icon={<BarChart2 className="text-emerald-400" size={32} />}
                    title="Deep Analytics"
                    description="Visualize your win rate, drawdown, and equity curve in real-time."
                />
            </div>

            {/* Floating Elements (Decorations) */}
            <div className="absolute top-1/4 left-10 hidden lg:block opacity-20 animate-bounce duration-[3000ms]">
                <Zap size={48} className="text-yellow-400" />
            </div>
            <div className="absolute bottom-1/4 right-10 hidden lg:block opacity-20 animate-bounce duration-[4000ms]">
                <BarChart2 size={48} className="text-purple-400" />
            </div>
        </div>
    )
}

function FeatureCard({ icon, title, description }: { icon: React.ReactNode, title: string, description: string }) {
    return (
        <div className="group relative p-8 rounded-2xl bg-slate-900/40 border border-slate-800 backdrop-blur-sm hover:bg-slate-800/60 transition-all duration-300 hover:-translate-y-2 hover:shadow-2xl hover:shadow-cyan-900/20 text-left">
            <div className="mb-4 bg-slate-950/50 w-fit p-3 rounded-xl border border-slate-800 group-hover:border-slate-700 transition-colors">
                {icon}
            </div>
            <h3 className="text-xl font-bold text-white mb-2 group-hover:text-cyan-400 transition-colors">{title}</h3>
            <p className="text-slate-400 leading-relaxed">{description}</p>
        </div>
    )
}
