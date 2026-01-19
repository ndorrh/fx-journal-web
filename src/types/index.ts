export type StrategyType = "SupplyDemand" | "ICT" | "Other";
export type UserRole = "admin" | "user";

export interface UserProfile {
    uid: string;
    email: string;
    displayName: string;
    photoURL: string;
    role: UserRole;
    createdAt: any;
    lastLogin: any;
}

export interface Trade {
    id?: string;
    userId: string;
    createdAt?: number;

    // --- Core Info ---
    date: number; // Planned date for entry
    instrument: string; // Pair (e.g., EURUSD)
    direction: "Long" | "Short";
    status: "Planned" | "Open" | "Closed"; // Lifecycle State

    // --- Context & Classification ---
    tradeType?: string; // "Scalping", "Day Trade", "Swing"
    marketCondition?: string; // "Trending", "Ranging", "Volatile"

    // --- Phase 1: Pre-Trade Planning ---
    plannedEntry: number;
    plannedSL: number;
    plannedTP: number;
    plannedRR: number;
    riskAmount?: number; // Risk in currency (e.g., $50)
    positionSize: number;
    entryReason: string; // "Technical", "Fundamental"
    preTradeEmotion?: string; // "Calm", "Anxious" (optional at planning)
    strategy: StrategyType; // The strategy used (e.g. SupplyDemand, ICT)
    setupType?: StrategyType; // Backward compatibility

    // --- Phase 2: Execution & Results ---
    actualEntry?: number;
    exitPrice?: number;
    actualRR?: number;
    pnl?: number;
    outcome?: "Win" | "Loss" | "BE" | "Open"; // Result
    exitReason?: string;
    postTradeEmotion?: string;
    lessonsLearned?: string;

    // --- Metadata & Analysis ---
    session: string;
    tags: string[];
    notes?: string;

    // --- Strategy Specifics ---
    // Supply & Demand
    zoneType?: string;
    confirmation?: string;

    // ICT
    pdArray?: string;
    liquidityTarget?: string;

    // Media
    beforeImageUrl?: string;
    afterImageUrl?: string;
}
