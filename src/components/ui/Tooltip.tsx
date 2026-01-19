"use client"

import React, { useState } from 'react';
import { HelpCircle } from "lucide-react";

interface TooltipProps {
    content: string;
    children?: React.ReactNode;
}

export function Tooltip({ content, children }: TooltipProps) {
    const [isVisible, setIsVisible] = useState(false);

    return (
        <div
            className="relative inline-flex items-center gap-1 group"
            onMouseEnter={() => setIsVisible(true)}
            onMouseLeave={() => setIsVisible(false)}
        >
            {children ? (
                children
            ) : (
                <HelpCircle className="w-3 h-3 text-slate-500 hover:text-cyan-400 cursor-help transition-colors" />
            )}

            {isVisible && (
                <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-max max-w-[200px] px-3 py-2 bg-slate-900 border border-slate-700 rounded-md shadow-xl text-xs text-slate-200 z-50 animate-in fade-in zoom-in-95 duration-200">
                    {content}
                    <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-2 h-2 bg-slate-900 border-r border-b border-slate-700 rotate-45 transform"></div>
                </div>
            )}
        </div>
    );
}
