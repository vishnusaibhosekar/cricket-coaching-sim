'use client';

import { useState, useCallback } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { FieldPosition, UserFieldPlacement } from '@/lib/types';

interface FieldMapProps {
    onSubmit: (placement: UserFieldPlacement) => void;
    disabled?: boolean;
    maxFielders?: number;
    showActualZone?: FieldPosition;
}

// Field zones - pitch center at (100, 100) in SVG
// Batsman at (100, 72) facing bowler at (100, 132)
// Positive X = Leg side (RIGHT in SVG)
// Negative X = Off side (LEFT in SVG)  
// "In front" of batsman = toward bowler = positive Y offset
// "Behind" batsman = toward keeper/slips = negative Y offset
const FIELD_ZONES: { id: FieldPosition; label: string; x: number; y: number; region: 'inner' | 'deep' }[] = [
    // Inner circle positions (30-yard circle)
    { id: 'point', label: 'Point', x: -40, y: -5, region: 'inner' },
    { id: 'backward_point', label: 'Backward Point', x: -35, y: -18, region: 'inner' },
    { id: 'cover', label: 'Cover', x: -35, y: 10, region: 'inner' },
    { id: 'extra_cover', label: 'Extra Cover', x: -25, y: 20, region: 'inner' },
    { id: 'mid_off', label: 'Mid-Off', x: -15, y: 30, region: 'inner' },
    { id: 'mid_on', label: 'Mid-On', x: 15, y: 30, region: 'inner' },
    { id: 'midwicket', label: 'Midwicket', x: 25, y: 20, region: 'inner' },
    { id: 'square_leg', label: 'Square Leg', x: 40, y: -5, region: 'inner' },
    { id: 'short_fine_leg', label: 'Short Fine Leg', x: 30, y: -20, region: 'inner' },
    { id: 'short_leg', label: 'Short Leg', x: 12, y: -8, region: 'inner' },
    { id: 'short_third_man', label: 'Short 3rd Man', x: -30, y: -35, region: 'inner' },


    // Deep positions (boundary)
    { id: 'deep_point', label: 'Deep Point', x: -75, y: -5, region: 'deep' },
    { id: 'deep_backward_point', label: 'Deep Bwd Point', x: -65, y: -30, region: 'deep' },
    { id: 'deep_cover', label: 'Deep Cover', x: -65, y: 25, region: 'deep' },
    { id: 'deep_extra_cover', label: 'Deep Extra Cover', x: -50, y: 50, region: 'deep' },
    { id: 'long_off', label: 'Long Off', x: -25, y: 70, region: 'deep' },
    { id: 'long_on', label: 'Long On', x: 25, y: 70, region: 'deep' },
    { id: 'deep_midwicket', label: 'Deep Midwicket', x: 50, y: 50, region: 'deep' },
    { id: 'deep_square_leg', label: 'Deep Sq Leg', x: 75, y: -5, region: 'deep' },
    { id: 'long_leg', label: 'Long Leg', x: 65, y: -30, region: 'deep' },
    { id: 'fine_leg', label: 'Fine Leg', x: 55, y: -55, region: 'deep' },
    { id: 'third_man', label: 'Third Man', x: -55, y: -60, region: 'deep' },
];

export function FieldMap({ onSubmit, disabled = false, maxFielders = 9, showActualZone }: FieldMapProps) {
    const [fielders, setFielders] = useState<Record<FieldPosition, number>>(
        FIELD_ZONES.reduce((acc, zone) => ({ ...acc, [zone.id]: 0 }), {} as Record<FieldPosition, number>)
    );

    const totalFielders = Object.values(fielders).reduce((sum, count) => sum + count, 0);

    const handleZoneClick = useCallback((zoneId: FieldPosition) => {
        if (disabled) return;

        setFielders(prev => {
            const current = prev[zoneId] || 0;

            // Toggle: if zone has fielders, remove one; if not and we have capacity, add one
            if (current > 0) {
                return { ...prev, [zoneId]: current - 1 };
            } else if (totalFielders < maxFielders) {
                return { ...prev, [zoneId]: 1 };
            }
            return prev;
        });
    }, [disabled, maxFielders, totalFielders]);

    const handleSubmit = () => {
        if (totalFielders !== maxFielders) return;

        onSubmit({
            zones: fielders,
            total_fielders: totalFielders,
        });
    };

    const isComplete = totalFielders === maxFielders;

    return (
        <Card className="p-6 bg-zinc-900 border-zinc-800">
            <div className="mb-4 flex items-center justify-between">
                <h3 className="text-lg font-semibold text-white">Set Field Placement</h3>
                <Badge variant={isComplete ? 'default' : 'destructive'}>
                    {totalFielders}/{maxFielders} fielders placed
                </Badge>
            </div>

            {/* Cricket Field SVG */}
            <div className="relative w-full aspect-square max-w-2xl mx-auto mb-4">
                <svg viewBox="0 0 200 200" className="w-full h-full">
                    {/* Field boundary */}
                    <ellipse
                        cx="100"
                        cy="100"
                        rx="95"
                        ry="95"
                        fill="none"
                        stroke="#4ade80"
                        strokeWidth="1"
                        strokeDasharray="4,4"
                    />

                    {/* 30-yard circle */}
                    <ellipse
                        cx="100"
                        cy="100"
                        rx="50"
                        ry="50"
                        fill="none"
                        stroke="#fbbf24"
                        strokeWidth="0.6"
                        strokeDasharray="2,2"
                    />

                    {/* Pitch */}
                    <rect
                        x="98"
                        y="72"
                        width="4"
                        height="60"
                        fill="#d4d4d8"
                        stroke="#a1a1aa"
                        strokeWidth="0.5"
                    />

                    {/* Batsman at striker's end */}
                    <g transform="translate(100, 72)">
                        <circle cx="0" cy="-3" r="2.5" fill="#fbbf24" />
                        <rect x="-1.5" y="-1.5" width="3" height="4" fill="#fbbf24" rx="0.8" />
                        <line x1="0" y1="0" x2="-4" y2="4" stroke="#fbbf24" strokeWidth="1" />
                    </g>

                    {/* Bowler at bowler's end */}
                    <g transform="translate(100, 132)">
                        <circle cx="0" cy="-1.5" r="2" fill="#9f0000ff" />
                        <rect x="-1" y="-1" width="2" height="3" fill="#a1a1aa" rx="0.5" />
                    </g>

                    {/* Field zones - rendered at center with relative coordinates */}
                    {FIELD_ZONES.map((zone) => {
                        const hasFielder = (fielders[zone.id] || 0) > 0;
                        const isActualZone = zone.id === showActualZone;
                        // Convert relative coords to SVG coords: center at (100,100), scale by 1.0
                        const svgX = 100 + zone.x;
                        const svgY = 100 + zone.y;

                        return (
                            <g key={zone.id}>
                                {/* Zone circle */}
                                <circle
                                    cx={svgX}
                                    cy={svgY}
                                    r={zone.region === 'deep' ? 4 : 3.5}
                                    fill={
                                        isActualZone
                                            ? '#ef4444' // Red for actual shot zone
                                            : hasFielder
                                                ? '#3b82f6' // Blue for user placement
                                                : '#52525b' // Gray for empty
                                    }
                                    stroke={hasFielder ? '#60a5fa' : '#71717a'}
                                    strokeWidth="0.5"
                                    className="cursor-pointer transition-all duration-200 hover:opacity-80"
                                    onClick={() => handleZoneClick(zone.id)}
                                />

                                {/* Fielder count */}
                                {hasFielder && (
                                    <text
                                        x={svgX}
                                        y={svgY + 1}
                                        textAnchor="middle"
                                        dominantBaseline="middle"
                                        fill="white"
                                        fontSize="3"
                                        fontWeight="bold"
                                    >
                                        {fielders[zone.id]}
                                    </text>
                                )}

                                {/* Zone label */}
                                <text
                                    x={svgX}
                                    y={svgY + (zone.region === 'deep' ? 7 : 6)}
                                    textAnchor="middle"
                                    fill="#a1a1aa"
                                    fontSize="2.5"
                                >
                                    {zone.label}
                                </text>
                            </g>
                        );
                    })}

                    {/* Actual shot zone highlight */}
                    {showActualZone && (() => {
                        const actualZone = FIELD_ZONES.find(z => z.id === showActualZone);
                        const ax = actualZone ? 100 + actualZone.x : 50;
                        const ay = actualZone ? 100 + actualZone.y : 50;
                        return (
                            <g>
                                <circle
                                    cx={ax}
                                    cy={ay}
                                    r="6"
                                    fill="none"
                                    stroke="#ef4444"
                                    strokeWidth="1"
                                    strokeDasharray="2,1"
                                    className="animate-pulse"
                                />
                            </g>
                        );
                    })()}
                </svg>
            </div>

            {/* Legend */}
            <div className="grid grid-cols-3 gap-2 text-xs text-zinc-400 mb-4">
                <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full bg-blue-500" />
                    <span>Your fielder</span>
                </div>
                <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full bg-red-500" />
                    <span>Shot zone</span>
                </div>
                <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full bg-zinc-600" />
                    <span>Empty zone</span>
                </div>
            </div>

            {/* Submit button */}
            <Button
                onClick={handleSubmit}
                disabled={!isComplete || disabled}
                className="w-full bg-green-600 hover:bg-green-700 disabled:bg-zinc-700"
                size="lg"
            >
                {!isComplete
                    ? `Place ${maxFielders - totalFielders} more fielder${maxFielders - totalFielders > 1 ? 's' : ''}`
                    : 'Submit Field Placement'
                }
            </Button>
        </Card>
    );
}
