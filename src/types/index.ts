export type StrategyType = "SupplyDemand" | "ICT" | "Other";

export interface Trade {
    id?: string;
    userId: string;
    createdAt?: number;

    // --- Core Info ---
    date: number; // Planned date for entry
    instrument: string; // Pair (e.g., EURUSD)
    direction: "Long" | "Short";
    status: "Planned" | "Open" | "Closed"; // Lifecycle State

    // --- Phase 1: Pre-Trade Planning ---
    plannedEntry: number;
    plannedSL: number;
    plannedTP: number;
    plannedRR: number;
    positionSize: number;
    entryReason: string; // "Technical", "Fundamental"
    preTradeEmotion?: string; // "Calm", "Anxious" (optional at planning)
    setupType?: StrategyType; // The strategy used for the plan

    // --- Phase 2: Execution & Results ---
    // These fields are optional because they don't exist until the trade is taken/closed
    actualEntry?: number;
    exitPrice?: number;
    actualRR?: number;
    pnl?: number;
    outcome?: "Win" | "Loss" | "BE" | "Open";
    exitReason?: string;
    postTradeEmotion?: string;
    lessonsLearned?: string;

    // --- Metadata & Analysis ---
    session: string;
    tags: string[];
    notes?: string; // General notes (appendable)

    // --- Strategy Specifics (Optional based on setupType) ---
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
