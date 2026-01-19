"use client"

import { useEffect, useState } from "react"
import { doc, getDoc } from "firebase/firestore"
import { db } from "@/lib/firebase"
import { AlertTriangle } from "lucide-react"

export function AdminActingAsBanner({ targetUserId, currentUserId }: { targetUserId: string, currentUserId?: string }) {
    const [targetUserName, setTargetUserName] = useState<string>("")

    useEffect(() => {
        if (targetUserId && targetUserId !== currentUserId) {
            getDoc(doc(db, "users", targetUserId)).then(snap => {
                if (snap.exists()) {
                    setTargetUserName(snap.data().displayName || "Unknown User")
                }
            })
        }
    }, [targetUserId, currentUserId])

    if (!targetUserId || targetUserId === currentUserId) return null

    return (
        <div className="bg-amber-500/10 border border-amber-500/50 rounded-lg p-3 mb-6 flex items-center gap-3 animate-in fade-in slide-in-from-top-2">
            <AlertTriangle className="w-5 h-5 text-amber-500" />
            <div>
                <p className="text-sm font-bold text-amber-400">Admin Mode Active</p>
                <p className="text-xs text-amber-200/80">
                    You are creating this entry on behalf of <span className="text-white font-medium">{targetUserName}</span>.
                </p>
            </div>
        </div>
    )
}
