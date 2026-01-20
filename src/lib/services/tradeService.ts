import { db, storage } from "@/lib/firebase";
import { collection, addDoc, getDocs, query, where, orderBy, Timestamp, doc, getDoc, updateDoc } from "firebase/firestore";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { Trade } from "@/types";

const USERS_COLLECTION = "users";
const TRADES_COLLECTION = "trades";

export const addTrade = async (trade: Omit<Trade, "id" | "createdAt">) => {
    try {
        // Store in users/{userId}/trades/{tradeId}
        const userTradesRef = collection(db, USERS_COLLECTION, trade.userId, TRADES_COLLECTION);
        const docRef = await addDoc(userTradesRef, {
            ...trade,
            createdAt: Timestamp.now().toMillis(),
        });
        console.log("Document written with ID: ", docRef.id);
        return docRef.id;
    } catch (e) {
        console.error("Error adding document: ", e);
        throw e;
    }
};

export const getTrades = async (userId: string) => {
    try {
        const userTradesRef = collection(db, USERS_COLLECTION, userId, TRADES_COLLECTION);
        // No need for 'where userId' because we are inside the user's specific collection
        const q = query(
            userTradesRef,
            orderBy("date", "desc")
        );

        const querySnapshot = await getDocs(q);
        return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Trade));
    } catch (e) {
        console.error("Error getting trades: ", e);
        return [];
    }
};

export const getTrade = async (userId: string, tradeId: string): Promise<Trade | null> => {
    try {
        const docRef = doc(db, USERS_COLLECTION, userId, TRADES_COLLECTION, tradeId);
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
            return { id: docSnap.id, ...docSnap.data() } as Trade;
        }
        return null;
    } catch (e) {
        console.error("Error getting trade:", e);
        throw e;
    }
};

export const updateTrade = async (userId: string, tradeId: string, updates: Partial<Trade>) => {
    try {
        const docRef = doc(db, USERS_COLLECTION, userId, TRADES_COLLECTION, tradeId);
        await updateDoc(docRef, updates);
    } catch (e) {
        console.error("Error updating trade:", e);
        throw e;
    }
};

import { collectionGroup, limit } from "firebase/firestore";

export interface LeaderboardEntry {
    userId: string;
    displayName: string;
    photoURL?: string;
    totalTrades: number;
    winRate: number;
    totalPnL: number;
    totalR: number;
}

export const getLeaderboardData = async (): Promise<LeaderboardEntry[]> => {
    try {
        // Fetch last 500 closed trades globally
        const tradesQuery = query(
            collectionGroup(db, 'trades'),
            where("status", "==", "Closed"),
            orderBy("date", "desc"),
            limit(500)
        );

        const snapshot = await getDocs(tradesQuery);
        const trades = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Trade));

        // Group by User
        const userStats: Record<string, {
            trades: number,
            wins: number,
            pnl: number,
            r: number,
            userId: string
        }> = {};

        trades.forEach(trade => {
            if (!userStats[trade.userId]) {
                userStats[trade.userId] = { trades: 0, wins: 0, pnl: 0, r: 0, userId: trade.userId };
            }
            const stats = userStats[trade.userId];
            stats.trades += 1;
            stats.pnl += trade.pnl || 0;
            stats.r += trade.actualRR || 0;
            if (trade.outcome === "Win") stats.wins += 1;
        });

        // Fetch User Profiles for Display Names
        const leaderboard: LeaderboardEntry[] = [];
        for (const userId of Object.keys(userStats)) {
            const stats = userStats[userId];
            // Minimum trades to appear on leaderboard
            if (stats.trades < 3) continue;

            const userDoc = await getDoc(doc(db, "users", userId));
            const userData = userDoc.exists() ? userDoc.data() : { displayName: "Unknown Trader" };

            leaderboard.push({
                userId,
                displayName: userData.displayName || "Unknown Trader",
                photoURL: userData.photoURL,
                totalTrades: stats.trades,
                winRate: parseFloat(((stats.wins / stats.trades) * 100).toFixed(1)),
                totalPnL: stats.pnl,
                totalR: parseFloat(stats.r.toFixed(2))
            });
        }

        // Sort by Total R (Fairer than PnL)
        return leaderboard.sort((a, b) => b.totalR - a.totalR);

    } catch (e) {
        console.error("Error fetching leaderboard:", e);
        return [];
    }
};

/*
export const uploadTradeImage = async (file: File, userId: string): Promise<string> => {
    const storageRef = ref(storage, `users/${userId}/trades/${Date.now()}_${file.name}`);
    const snapshot = await uploadBytes(storageRef, file);
    return await getDownloadURL(snapshot.ref);
}
*/

export const exportTrades = async (userId: string): Promise<Trade[]> => {
    return await getTrades(userId);
};

import { setDoc } from "firebase/firestore";

export const importTrades = async (userId: string, trades: Trade[]) => {
    let created = 0;
    let updated = 0;
    let errors = 0;

    for (const trade of trades) {
        try {
            // Remove 'id' from data if it exists, as it's the doc name
            const { id, ...tradeData } = trade;

            // Validate essential fields
            if (!tradeData.date || !tradeData.instrument) {
                console.warn("Skipping invalid trade:", trade);
                continue;
            }

            // If ID exists in export, use it as doc ID (Upsert)
            // If no ID (legacy?), let Firestore generate one (addDoc)
            if (id) {
                const docRef = doc(db, USERS_COLLECTION, userId, TRADES_COLLECTION, id);
                await setDoc(docRef, tradeData, { merge: true });
                updated++;
            } else {
                const userTradesRef = collection(db, USERS_COLLECTION, userId, TRADES_COLLECTION);
                await addDoc(userTradesRef, tradeData);
                created++;
            }
        } catch (e) {
            console.error("Failed to import trade:", trade, e);
            errors++;
        }
    }
    return { created, updated, errors };
};
