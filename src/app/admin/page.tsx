"use client"

import { useEffect, useState } from "react"
import { useAuth } from "@/context/AuthContext"
import { db } from "@/lib/firebase"
import { collection, getDocs, orderBy, query } from "firebase/firestore"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card"
import { Button } from "@/components/ui/Button"
import { ArrowLeft, User as UserIcon, Shield, Eye } from "lucide-react"

interface UserProfile {
    uid: string
    email: string
    displayName: string
    photoURL: string
    role: string
    lastLogin: any
}

export default function AdminPage() {
    const { user, role } = useAuth()
    const router = useRouter()
    const [users, setUsers] = useState<UserProfile[]>([])
    const [loading, setLoading] = useState(true)

    // Verify Admin Role (Client-side check, security rules should backup)
    // Verify Admin Role (Client-side check, security rules should backup)
    useEffect(() => {
        if (user) {
            // 1. Wait for role to load
            if (role === null) return;

            // 2. Check if user is admin, if not redirect
            if (role !== 'admin') {
                router.push("/")
                return
            }

            // 3. Only fetch if admin
            const fetchUsers = async () => {
                try {
                    const usersRef = collection(db, "users")
                    const q = query(usersRef, orderBy("lastLogin", "desc"))
                    const snapshot = await getDocs(q)
                    setUsers(snapshot.docs.map(doc => doc.data() as UserProfile))
                } catch (error) {
                    console.error("Error fetching users:", error)
                } finally {
                    setLoading(false)
                }
            }

            fetchUsers()
        }
    }, [user, role, router])

    const handleViewAs = (targetUserId: string) => {
        // Redirect to dashboard with userId param
        router.push(`/?userId=${targetUserId}`)
    }

    if (loading) return <div className="p-8 text-white">Loading admin panel...</div>

    return (
        <div className="min-h-screen bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-slate-900 via-[#0a0f1e] to-black text-white p-4 md:p-8">
            <div className="max-w-7xl mx-auto space-y-6 animate-in fade-in">

                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-red-500 to-orange-500 flex items-center gap-3">
                            <Shield className="h-8 w-8 text-red-500" />
                            Admin Console
                        </h1>
                        <p className="text-slate-400 mt-1">Manage users and oversee journal activities.</p>
                    </div>
                    <Button variant="ghost" onClick={() => router.push('/')} className="text-slate-400 hover:text-white">
                        <ArrowLeft className="w-4 h-4 mr-2" />
                        Back to Dashboard
                    </Button>
                </div>

                <Card className="glass-card bg-slate-950/50 border-slate-800">
                    <CardHeader>
                        <CardTitle className="text-slate-200">Registered Users ({users.length})</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="overflow-x-auto rounded-lg border border-slate-800">
                            <table className="w-full text-sm text-left">
                                <thead className="text-xs text-slate-400 uppercase bg-slate-900/80">
                                    <tr>
                                        <th className="px-6 py-3">User</th>
                                        <th className="px-6 py-3">Email</th>
                                        <th className="px-6 py-3">Role</th>
                                        <th className="px-6 py-3">Last Login</th>
                                        <th className="px-6 py-3 text-right">Actions</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-800 bg-slate-950/30">
                                    {users.map((u) => (
                                        <tr key={u.uid} className="hover:bg-slate-800/30 transition-colors">
                                            <td className="px-6 py-4 font-medium text-slate-200 flex items-center gap-3">
                                                <div className="h-8 w-8 rounded-full bg-slate-800 border border-slate-700 flex items-center justify-center overflow-hidden">
                                                    {u.photoURL ? (
                                                        <img src={u.photoURL} alt={u.displayName} className="h-full w-full object-cover" />
                                                    ) : (
                                                        <UserIcon className="h-4 w-4 text-slate-400" />
                                                    )}
                                                </div>
                                                {u.displayName || "Anonymous"}
                                            </td>
                                            <td className="px-6 py-4 text-slate-400">{u.email}</td>
                                            <td className="px-6 py-4">
                                                <span className={`px-2 py-0.5 rounded text-xs border ${u.role === 'admin' ? 'bg-red-950/30 text-red-400 border-red-900' : 'bg-slate-800 text-slate-400 border-slate-700'}`}>
                                                    {u.role || 'user'}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 text-slate-500">
                                                {u.lastLogin?.seconds ? new Date(u.lastLogin.seconds * 1000).toLocaleString() : 'N/A'}
                                            </td>
                                            <td className="px-6 py-4 text-right">
                                                <Button
                                                    size="sm"
                                                    variant="outline"
                                                    className="border-slate-700 hover:bg-cyan-950/30 hover:text-cyan-400 hover:border-cyan-800 transition-colors"
                                                    onClick={() => handleViewAs(u.uid)}
                                                >
                                                    <Eye className="w-3 h-3 mr-2" />
                                                    View as User
                                                </Button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    )
}
