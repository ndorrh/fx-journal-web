"use client"

import { useMemo } from 'react';
import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, Tooltip, CartesianGrid } from 'recharts';
import { Trade } from '@/types';
import { format, startOfWeek, startOfMonth, startOfYear, eachDayOfInterval, subDays, isSameDay } from 'date-fns';

interface AnalyticsChartProps {
    trades?: Trade[];
    timeframe?: string; // "Daily", "Weekly", "Monthly", "Yearly"
}

export function AnalyticsChart({ trades = [], timeframe = "Daily" }: AnalyticsChartProps) {

    const chartData = useMemo(() => {
        if (!trades.length) return [];

        // Only include Closed trades for analytics
        const closedTrades = trades.filter(t => t.status === "Closed" || t.outcome);
        if (!closedTrades.length) return [];

        const now = new Date();
        let filteredTrades = [...closedTrades].sort((a, b) => a.date - b.date);
        let dataPoints: any[] = [];

        if (timeframe === "Daily") {
            // Last 7 days
            const start = subDays(now, 6);
            const days = eachDayOfInterval({ start, end: now });

            dataPoints = days.map(day => {
                const dayTrades = filteredTrades.filter(t => isSameDay(new Date(t.date), day));
                const dailyPnL = dayTrades.reduce((acc, t) => acc + (t.pnl || 0), 0);
                return {
                    name: format(day, 'EEE'), // Mon, Tue...
                    date: format(day, 'MMM d'),
                    pnl: dailyPnL
                };
            });

            // Calculate cumulative for the chart line? Or just daily bar?
            // Let's do cumulative for the "Growth" feel
            let runningTotal = 0;
            dataPoints = dataPoints.map(dp => {
                runningTotal += dp.pnl;
                return { ...dp, cumulative: runningTotal, pnl: dp.pnl };
            });

        } else if (timeframe === "Weekly") {
            // Last 8 weeks? Or just aggregation by week?
            // Let's do simple: All trades sorted, cumulative PnL over time
            let runningTotal = 0;
            dataPoints = filteredTrades.map(t => {
                runningTotal += (t.pnl || 0);
                return {
                    name: format(new Date(t.date), 'MM/dd'),
                    pnl: t.pnl || 0,
                    cumulative: runningTotal
                }
            });
            // If too many points, maybe slice last 50?
            if (dataPoints.length > 50) dataPoints = dataPoints.slice(dataPoints.length - 50);

        } else if (timeframe === "Monthly") {
            // Aggregated by Month
            const monthlyData: Record<string, number> = {};

            filteredTrades.forEach(t => {
                const monthKey = format(new Date(t.date), 'MMM yyyy');
                monthlyData[monthKey] = (monthlyData[monthKey] || 0) + (t.pnl || 0);
            });

            let runningTotal = 0;
            dataPoints = Object.entries(monthlyData).map(([name, val]) => {
                runningTotal += val;
                return { name, pnl: val, cumulative: runningTotal };
            });
        }

        return dataPoints;

    }, [trades, timeframe]);

    return (
        <div className="w-full h-full min-h-[300px] p-4 bg-slate-900/40 backdrop-blur rounded-xl border border-slate-700/50">
            <h3 className="text-lg font-semibold text-slate-200 mb-4">{timeframe} Performance (Cumulative PnL)</h3>
            <ResponsiveContainer width="100%" height={250}>
                <AreaChart data={chartData}>
                    <defs>
                        <linearGradient id="colorPnL" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#22d3ee" stopOpacity={0.8} />
                            <stop offset="95%" stopColor="#22d3ee" stopOpacity={0} />
                        </linearGradient>
                    </defs>
                    <XAxis dataKey="name" stroke="#94a3b8" fontSize={12} tickLine={false} axisLine={false} />
                    <YAxis stroke="#94a3b8" fontSize={12} tickLine={false} axisLine={false} tickFormatter={(value) => `$${value}`} />
                    <CartesianGrid strokeDasharray="3 3" stroke="#334155" vertical={false} />
                    <Tooltip
                        contentStyle={{ backgroundColor: '#0f172a', borderColor: '#1e293b', color: '#f8fafc' }}
                        itemStyle={{ color: '#22d3ee' }}
                        formatter={(value: number) => [`$${value.toFixed(2)}`, "Cumulative PnL"]}
                        labelFormatter={(label) => `Date: ${label}`}
                    />
                    <Area type="monotone" dataKey="cumulative" stroke="#22d3ee" fillOpacity={1} fill="url(#colorPnL)" strokeWidth={2} />
                </AreaChart>
            </ResponsiveContainer>
        </div>
    )
}
