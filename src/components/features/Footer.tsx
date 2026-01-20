"use client";

import Link from "next/link";
import { Github, Twitter, Linkedin, Heart, Mail, ExternalLink } from "lucide-react";

export function Footer() {
    return (
        <footer className="relative w-full bg-slate-950 border-t border-slate-900 pt-16 pb-8 overflow-hidden z-10">
            {/* Background Glow */}
            <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-[800px] h-[300px] bg-cyan-900/10 blur-[120px] rounded-full pointer-events-none" />

            <div className="max-w-7xl mx-auto px-4 md:px-8 relative z-10">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-12">
                    {/* Brand Section */}
                    <div className="md:col-span-1 space-y-4">
                        <div className="flex items-center gap-2">
                            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-cyan-500 to-purple-600 flex items-center justify-center shadow-lg shadow-cyan-500/20">
                                <span className="font-bold text-white">FX</span>
                            </div>
                            <span className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-white to-slate-400">
                                Mastery Journal
                            </span>
                        </div>
                        <p className="text-slate-400 text-sm leading-relaxed">
                            The ultimate platform for traders who demand precision, accountability, and psychological mastery.
                        </p>
                    </div>

                    {/* Quick Links */}
                    <div>
                        <h3 className="text-white font-semibold mb-4">Platform</h3>
                        <ul className="space-y-2 text-sm text-slate-400">
                            <li><Link href="/" className="hover:text-cyan-400 transition-colors">Home</Link></li>
                            <li><Link href="#" className="hover:text-cyan-400 transition-colors">Features</Link></li>
                            <li><Link href="#" className="hover:text-cyan-400 transition-colors">Pricing</Link></li>
                            <li><Link href="#" className="hover:text-cyan-400 transition-colors">Changelog</Link></li>
                        </ul>
                    </div>

                    {/* Resources */}
                    <div>
                        <h3 className="text-white font-semibold mb-4">Resources</h3>
                        <ul className="space-y-2 text-sm text-slate-400">
                            <li><Link href="#" className="hover:text-cyan-400 transition-colors">Trading Psychology</Link></li>
                            <li><Link href="#" className="hover:text-cyan-400 transition-colors">Risk Management</Link></li>
                            <li><Link href="#" className="hover:text-cyan-400 transition-colors">Documentation</Link></li>
                            <li><Link href="#" className="hover:text-cyan-400 transition-colors">Community</Link></li>
                        </ul>
                    </div>

                    {/* Newsletter */}
                    <div>
                        <h3 className="text-white font-semibold mb-4">Stay Sharp</h3>
                        <p className="text-slate-400 text-xs mb-4">The latest trading insights, delivered to your inbox.</p>
                        <div className="flex gap-2">
                            <input
                                type="email"
                                placeholder="Enter your email"
                                className="bg-slate-900 border border-slate-800 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-cyan-500 w-full"
                            />
                            <button className="bg-cyan-600 hover:bg-cyan-500 text-white p-2 rounded-lg transition-colors">
                                <Mail size={16} />
                            </button>
                        </div>
                    </div>
                </div>

                <div className="border-t border-slate-900 pt-8 flex flex-col md:flex-row items-center justify-between gap-4">
                    <p className="text-slate-500 text-xs flex items-center gap-1">
                        © {new Date().getFullYear()} FX Mastery Journal. Built with <Heart size={10} className="text-red-500 fill-red-500" /> by Pro Traders.
                    </p>

                    <div className="flex items-center gap-4">
                        <SocialLink href="#" icon={<Github size={18} />} />
                        <SocialLink href="#" icon={<Twitter size={18} />} />
                        <SocialLink href="#" icon={<Linkedin size={18} />} />
                    </div>
                </div>
            </div>
        </footer>
    );
}

function SocialLink({ href, icon }: { href: string, icon: React.ReactNode }) {
    return (
        <a
            href={href}
            className="w-8 h-8 rounded-full bg-slate-900 flex items-center justify-center text-slate-400 hover:text-white hover:bg-slate-800 transition-all hover:scale-110"
        >
            {icon}
        </a>
    )
}
