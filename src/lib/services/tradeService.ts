import { db, storage } from "@/lib/firebase";
import { collection, addDoc, getDocs, query, where, orderBy, Timestamp } from "firebase/firestore";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { Trade } from "@/types";

const TRADES_COLLECTION = "trades";

export const addTrade = async (trade: Omit<Trade, "id" | "createdAt">) => {
    try {
        const docRef = await addDoc(collection(db, TRADES_COLLECTION), {
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
    const q = query(
        collection(db, TRADES_COLLECTION),
        where("userId", "==", userId),
        orderBy("date", "desc")
    );

    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Trade));
};

export const uploadTradeImage = async (file: File, userId: string): Promise<string> => {
    const storageRef = ref(storage, `users/${userId}/trades/${Date.now()}_${file.name}`);
    const snapshot = await uploadBytes(storageRef, file);
    return await getDownloadURL(snapshot.ref);
}
