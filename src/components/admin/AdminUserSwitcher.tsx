"use client"

import { useEffect, useState } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { collection, getDocs, orderBy, query } from "firebase/firestore"
import { db } from "@/lib/firebase"
import { Select } from "@/components/ui/Select"
import { Eye, EyeOff } from "lucide-react"

interface UserProfile {
    uid: string
    displayName: string
    email: string
}

export function AdminUserSwitcher() {
    const router = useRouter()
    const searchParams = useSearchParams()
    const currentViewUserId = searchParams.get('userId') || ""

    const [users, setUsers] = useState<UserProfile[]>([])
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        const fetchUsers = async () => {
            try {
                const usersRef = collection(db, "users")
                const q = query(usersRef, orderBy("displayName", "asc"))
                const snapshot = await getDocs(q)
                setUsers(snapshot.docs.map(doc => ({
                    uid: doc.id,
                    displayName: doc.data().displayName || "Anonymous",
                    email: doc.data().email
                } as UserProfile)))
            } catch (error) {
                console.error("Error fetching users for switcher:", error)
            } finally {
                setLoading(false)
            }
        }
        fetchUsers()
    }, [])

    const handleSwitch = (userId: string) => {
        if (userId) {
            // Switch to user
            const params = new URLSearchParams(searchParams.toString())
            params.set('userId', userId)
            router.push(`?${params.toString()}`)
        } else {
            // Clear view (Back to Admin's own view)
            const params = new URLSearchParams(searchParams.toString())
            params.delete('userId')
            router.push(`?${params.toString()}`)
        }
    }

    if (loading) return <div className="text-xs text-slate-500">Loading users...</div>

    return (
        <div className="flex items-center gap-2 bg-slate-900/50 p-1 rounded-lg border border-slate-800">
            {currentViewUserId ? (
                <Eye className="w-4 h-4 text-cyan-400 ml-2 animate-pulse" />
            ) : (
                <EyeOff className="w-4 h-4 text-slate-500 ml-2" />
            )}

            <select
                value={currentViewUserId}
                onChange={(e) => handleSwitch(e.target.value)}
                className="bg-transparent text-sm text-slate-300 border-none focus:ring-0 cursor-pointer min-w-[200px] outline-none"
            >
                <option value="" className="bg-slate-900 text-slate-400">-- My View (Admin) --</option>
                {users.map(u => (
                    <option key={u.uid} value={u.uid} className="bg-slate-900 text-white">
                        {u.displayName} ({u.email})
                    </option>
                ))}
            </select>
        </div>
    )
}
