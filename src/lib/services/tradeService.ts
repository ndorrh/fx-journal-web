import { db, storage } from "@/lib/firebase";
import { collection, addDoc, getDocs, query, where, orderBy, Timestamp } from "firebase/firestore";
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

/*
export const uploadTradeImage = async (file: File, userId: string): Promise<string> => {
    const storageRef = ref(storage, `users/${userId}/trades/${Date.now()}_${file.name}`);
    const snapshot = await uploadBytes(storageRef, file);
    return await getDownloadURL(snapshot.ref);
}
*/
