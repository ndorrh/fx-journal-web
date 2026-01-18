"use client"

import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, Tooltip, CartesianGrid } from 'recharts';

const data = [
    { name: 'Mon', pnl: 0 },
    { name: 'Tue', pnl: 2.5 },
    { name: 'Wed', pnl: 1.8 },
    { name: 'Thu', pnl: 5.2 },
    { name: 'Fri', pnl: 4.1 },
    { name: 'Sat', pnl: 7.8 },
    { name: 'Sun', pnl: 12.5 },
];

export function AnalyticsChart() {
    return (
        <div className="w-full h-full min-h-[300px] p-4 bg-slate-900/40 backdrop-blur rounded-xl border border-slate-700/50">
            <h3 className="text-lg font-semibold text-slate-200 mb-4">Cumulative Performance (Example)</h3>
            <ResponsiveContainer width="100%" height={250}>
                <AreaChart data={data}>
                    <defs>
                        <linearGradient id="colorPnL" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#22d3ee" stopOpacity={0.8} />
                            <stop offset="95%" stopColor="#22d3ee" stopOpacity={0} />
                        </linearGradient>
                    </defs>
                    <XAxis dataKey="name" stroke="#94a3b8" fontSize={12} tickLine={false} axisLine={false} />
                    <YAxis stroke="#94a3b8" fontSize={12} tickLine={false} axisLine={false} tickFormatter={(value) => `${value}R`} />
                    <CartesianGrid strokeDasharray="3 3" stroke="#334155" vertical={false} />
                    <Tooltip
                        contentStyle={{ backgroundColor: '#0f172a', borderColor: '#1e293b', color: '#f8fafc' }}
                        itemStyle={{ color: '#22d3ee' }}
                    />
                    <Area type="monotone" dataKey="pnl" stroke="#22d3ee" fillOpacity={1} fill="url(#colorPnL)" strokeWidth={2} />
                </AreaChart>
            </ResponsiveContainer>
        </div>
    )
}
