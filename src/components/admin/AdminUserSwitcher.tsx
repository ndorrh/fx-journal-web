"use client"

import { useEffect, useState, useRef } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { collection, getDocs, orderBy, query } from "firebase/firestore"
import { db } from "@/lib/firebase"
import { Eye, EyeOff, Search, User, ChevronDown, Check } from "lucide-react"

interface UserProfile {
    uid: string
    displayName: string
    email: string
    role?: string
}

export function AdminUserSwitcher() {
    const router = useRouter()
    const searchParams = useSearchParams()
    const currentViewUserId = searchParams.get('userId')

    const [users, setUsers] = useState<UserProfile[]>([])
    const [loading, setLoading] = useState(true)
    const [isOpen, setIsOpen] = useState(false)
    const [searchTerm, setSearchTerm] = useState("")
    const wrapperRef = useRef<HTMLDivElement>(null)

    useEffect(() => {
        const fetchUsers = async () => {
            try {
                const usersRef = collection(db, "users")
                const q = query(usersRef, orderBy("displayName", "asc"))
                const snapshot = await getDocs(q)
                setUsers(snapshot.docs.map(doc => ({
                    uid: doc.id,
                    displayName: doc.data().displayName || "Anonymous",
                    email: doc.data().email,
                    role: doc.data().role
                } as UserProfile)))
            } catch (error) {
                console.error("Error fetching users for switcher:", error)
            } finally {
                setLoading(false)
            }
        }
        fetchUsers()
    }, [])

    // Close on click outside
    useEffect(() => {
        function handleClickOutside(event: MouseEvent) {
            if (wrapperRef.current && !wrapperRef.current.contains(event.target as Node)) {
                setIsOpen(false)
            }
        }
        document.addEventListener("mousedown", handleClickOutside)
        return () => document.removeEventListener("mousedown", handleClickOutside)
    }, [])

    const handleSwitch = (userId?: string) => {
        const params = new URLSearchParams(searchParams.toString())
        if (userId) {
            params.set('userId', userId)
        } else {
            params.delete('userId')
        }
        router.push(`?${params.toString()}`)
        setIsOpen(false)
        setSearchTerm("")
    }

    const filteredUsers = users.filter(u =>
        u.displayName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        u.email.toLowerCase().includes(searchTerm.toLowerCase())
    )

    const currentUser = users.find(u => u.uid === currentViewUserId)

    if (loading) return null

    return (
        <div className="relative" ref={wrapperRef}>
            {/* Trigger Button */}
            <button
                onClick={() => setIsOpen(!isOpen)}
                className={`flex items-center gap-2 px-3 py-1.5 rounded-full border transition-all duration-200 ${currentViewUserId
                        ? "bg-purple-950/40 border-purple-500/50 text-purple-200 hover:bg-purple-900/50 shadow-lg shadow-purple-900/20"
                        : "bg-slate-900/50 border-slate-700 text-slate-400 hover:text-white hover:border-slate-500"
                    }`}
            >
                {currentViewUserId ? (
                    <>
                        <Eye className="w-4 h-4 animate-pulse" />
                        <span className="text-xs font-medium max-w-[100px] truncate">
                            {currentUser?.displayName || "User"}
                        </span>
                    </>
                ) : (
                    <>
                        <EyeOff className="w-4 h-4" />
                        <span className="text-xs font-medium hidden md:inline">View As</span>
                    </>
                )}
                <ChevronDown className={`w-3 h-3 transition-transform ${isOpen ? "rotate-180" : ""}`} />
            </button>

            {/* Dropdown Menu */}
            {isOpen && (
                <div className="absolute right-0 mt-2 w-72 rounded-xl border border-slate-700 bg-slate-950 shadow-2xl z-50 overflow-hidden animate-in fade-in zoom-in-95 duration-200">

                    {/* Header / Search */}
                    <div className="p-3 border-b border-slate-800 bg-slate-900/50">
                        <div className="relative">
                            <Search className="absolute left-2.5 top-2.5 h-3.5 w-3.5 text-slate-500" />
                            <input
                                type="text"
                                placeholder="Search users..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="w-full bg-slate-900 border border-slate-700 rounded-lg pl-8 pr-3 py-1.5 text-xs text-white focus:outline-none focus:border-cyan-500/50 transition-colors placeholder:text-slate-600"
                                autoFocus
                            />
                        </div>
                    </div>

                    {/* Default Option (My View) */}
                    <div className="p-1">
                        <button
                            onClick={() => handleSwitch(undefined)}
                            className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-xs font-medium transition-colors ${!currentViewUserId
                                    ? "bg-cyan-950/30 text-cyan-400"
                                    : "text-slate-400 hover:bg-slate-900 hover:text-white"
                                }`}
                        >
                            <div className="w-6 h-6 rounded-full bg-slate-800 flex items-center justify-center">
                                <ShieldIcon className="w-3 h-3" />
                            </div>
                            <span>My Admin View</span>
                            {!currentViewUserId && <Check className="w-3 h-3 ml-auto" />}
                        </button>
                    </div>

                    <div className="h-px bg-slate-800 mx-2 my-1" />

                    {/* User List */}
                    <div className="max-h-60 overflow-y-auto p-1 custom-scrollbar">
                        {filteredUsers.length > 0 ? (
                            filteredUsers.map(user => (
                                <button
                                    key={user.uid}
                                    onClick={() => handleSwitch(user.uid)}
                                    className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-left transition-colors ${currentViewUserId === user.uid
                                            ? "bg-purple-950/30 text-purple-300"
                                            : "text-slate-300 hover:bg-slate-800/50 hover:text-white"
                                        }`}
                                >
                                    <div className="w-6 h-6 rounded-full bg-slate-800 flex items-center justify-center border border-slate-700 overflow-hidden">
                                        <User className="w-3 h-3 text-slate-500" />
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <div className="text-xs font-medium truncate">{user.displayName}</div>
                                        <div className="text-[10px] text-slate-500 truncate">{user.email}</div>
                                    </div>
                                    {currentViewUserId === user.uid && <Check className="w-3 h-3 flex-shrink-0" />}
                                </button>
                            ))
                        ) : (
                            <div className="text-center py-4 text-xs text-slate-600">
                                No users found
                            </div>
                        )}
                    </div>
                </div>
            )}
        </div>
    )
}

function ShieldIcon({ className }: { className?: string }) {
    return (
        <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            className={className}
        >
            <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
        </svg>
    )
}
