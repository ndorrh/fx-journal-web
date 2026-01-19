"use client"

import { useState } from "react"
import { useSearchParams } from "next/navigation"
import { Navbar } from "@/components/features/Navbar"
import { Modal } from "@/components/ui/Modal"
import { JournalEntryForm } from "@/components/features/JournalEntryForm"
import { useAuth } from "@/context/AuthContext"

export function AppLayout({ children }: { children: React.ReactNode }) {
    const { user } = useAuth()
    const [isModalOpen, setIsModalOpen] = useState(false)

    // Global "Act As" logic for the New Trade Modal
    const searchParams = useSearchParams()
    const viewAsUserId = searchParams.get('userId')
    const effectiveUserId = viewAsUserId || user?.uid

    // If user is not logged in, we might still show Navbar (login button) but Modal logic depends on user
    // The specific pages (Home, History) handle their own redirects if needed, or LandingPage.

    return (
        <div className="min-h-screen bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-slate-900 via-[#0a0f1e] to-black text-white selection:bg-cyan-500/30">
            <Navbar onNewTradeClick={() => setIsModalOpen(true)} />

            {/* Global Trade Modal */}
            <Modal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                title="Log New Trade Plan"
            >
                <div className="max-h-[85vh] overflow-y-auto pr-2">
                    <JournalEntryForm
                        targetUserId={effectiveUserId || undefined}
                        onSuccess={() => {
                            setIsModalOpen(false)
                            // Optional: Trigger a refresh? 
                            // Since pages fetch on load/focus or we can rely on manual refresh. 
                            //Ideally we use a query client or context, but for now simple close is fine.
                            // The user might need to refresh the list manually or we can emit an event.
                            window.location.reload() // Simple brute force refresh to show new trade
                        }}
                    />
                </div>
            </Modal>

            <main>
                {children}
            </main>
        </div>
    )
}
