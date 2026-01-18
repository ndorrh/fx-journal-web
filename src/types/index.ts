export type StrategyType = "SupplyDemand" | "ICT" | "Other";

export interface Trade {
    id?: string;
    userId: string;
    pair: string;
    date: number; // Timestamp
    direction: "Long" | "Short";
    result: "Win" | "Loss" | "BE";
    rr: number; // Risk to Reward
    pnl?: number; // Profit and Loss amount
    session: string;

    strategy: StrategyType;

    // Supply & Demand Specifics
    zoneType?: string;
    confirmation?: string;

    // ICT Specifics
    pdArray?: string;
    liquidityTarget?: string;

    // Media
    beforeImageUrl?: string;
    afterImageUrl?: string;

    createdAt: number;
}
