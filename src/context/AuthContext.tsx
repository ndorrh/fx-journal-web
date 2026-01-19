"use client";

import { createContext, useContext, useEffect, useState } from "react";
import { User, onAuthStateChanged, signInWithPopup, GoogleAuthProvider, signOut } from "firebase/auth";
import { auth } from "@/lib/firebase";
import { UserRole } from "@/types";

interface AuthContextType {
    user: User | null;
    role: UserRole | null; // Add role
    loading: boolean;
    signInWithGoogle: () => Promise<void>;
    logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({
    user: null,
    role: null,
    loading: true,
    signInWithGoogle: async () => { },
    logout: async () => { },
});

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
    const [user, setUser] = useState<User | null>(null);
    const [role, setRole] = useState<UserRole | null>(null); // State for role
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, async (user) => {
            setUser(user);

            if (user) {
                // Persist & Fetch Role
                try {
                    const { doc, setDoc, getDoc, serverTimestamp } = await import("firebase/firestore");
                    const { db } = await import("@/lib/firebase");

                    const userRef = doc(db, "users", user.uid);
                    const userSnap = await getDoc(userRef);

                    if (!userSnap.exists()) {
                        await setDoc(userRef, {
                            uid: user.uid,
                            email: user.email,
                            displayName: user.displayName,
                            photoURL: user.photoURL,
                            role: "user", // Default role
                            createdAt: serverTimestamp(),
                            lastLogin: serverTimestamp()
                        });
                        setRole("user");
                    } else {
                        // Update last login
                        await setDoc(userRef, {
                            lastLogin: serverTimestamp(),
                            email: user.email,
                            displayName: user.displayName,
                            photoURL: user.photoURL
                        }, { merge: true });

                        // Set Role from DB
                        setRole(userSnap.data().role as UserRole || "user");
                    }
                } catch (error) {
                    console.error("Error persisting/fetching user data:", error);
                    setRole("user"); // Fallback
                }
            } else {
                setRole(null);
            }
            setLoading(false);
        });
        return () => unsubscribe();
    }, []);

    const signInWithGoogle = async () => {
        try {
            const provider = new GoogleAuthProvider();
            await signInWithPopup(auth, provider);
        } catch (error) {
            console.error("Error signing in with Google", error);
        }
    };

    const logout = async () => {
        try {
            await signOut(auth);
        } catch (error) {
            console.error("Error signing out", error);
        }
    };

    return (
        <AuthContext.Provider value={{ user, role, loading, signInWithGoogle, logout }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => useContext(AuthContext);
