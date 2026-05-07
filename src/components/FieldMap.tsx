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

// Field zones mapped to cricket positions (26 zones total) - x-axis inverted, y-axis corrected
// Off side (batsman's right) is on RIGHT in SVG, Leg side (batsman's left) is on LEFT in SVG
// Behind batsman (towards non-striker's end) = TOP of SVG (y < 100)
const FIELD_ZONES: { id: FieldPosition; label: string; x: number; y: number; region: 'inner' | 'deep' }[] = [

    // Inner circle positions - x-axis inverted, y-axis corrected
    { id: 'third_man', label: 'Third Man', x: 156, y: 40, region: 'inner' },
    { id: 'fine_leg', label: 'Fine Leg', x: 156, y: 156, region: 'inner' },
    { id: 'short_fine_leg', label: 'Short Fine Leg', x: 136, y: 76, region: 'inner' },
    { id: 'square_leg', label: 'Square Leg', x: 144, y: 100, region: 'inner' },
    { id: 'midwicket', label: 'Midwicket', x: 76, y: 44, region: 'inner' },
    { id: 'mid_on', label: 'Mid-On', x: 110, y: 156, region: 'inner' },
    { id: 'mid_off', label: 'Mid-Off', x: 90, y: 156, region: 'inner' },
    { id: 'extra_cover', label: 'Extra Cover', x: 74, y: 144, region: 'inner' },
    { id: 'cover', label: 'Cover', x: 60, y: 124, region: 'inner' },
    { id: 'backward_point', label: 'Backward Point', x: 150, y: 80, region: 'inner' },
    { id: 'point', label: 'Point', x: 144, y: 100, region: 'inner' },

    // Deep positions - x-axis inverted, y-axis corrected
    { id: 'deep_third_man', label: 'Deep 3rd Man', x: 24, y: 10, region: 'deep' },
    { id: 'long_leg', label: 'Long Leg', x: 30, y: 60, region: 'deep' },
    { id: 'deep_square_leg', label: 'Deep Sq Leg', x: 24, y: 100, region: 'deep' },
    { id: 'deep_midwicket', label: 'Deep Midwicket', x: 60, y: 170, region: 'deep' },
    { id: 'long_on', label: 'Long On', x: 90, y: 190, region: 'deep' },
    { id: 'long_off', label: 'Long Off', x: 110, y: 190, region: 'deep' },
    { id: 'deep_extra_cover', label: 'Deep Extra Cover', x: 140, y: 170, region: 'deep' },
    { id: 'deep_cover', label: 'Deep Cover', x: 164, y: 140, region: 'deep' },
    { id: 'deep_backward_point', label: 'Deep Bwd Point', x: 170, y: 70, region: 'deep' },
    { id: 'deep_point', label: 'Deep Point', x: 176, y: 100, region: 'deep' },
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

                    {/* Field zones */}
                    {FIELD_ZONES.map((zone) => {
                        const hasFielder = (fielders[zone.id] || 0) > 0;
                        const isActualZone = zone.id === showActualZone;

                        return (
                            <g key={zone.id}>
                                {/* Zone circle */}
                                <circle
                                    cx={zone.x}
                                    cy={zone.y}
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
                                        x={zone.x}
                                        y={zone.y + 1}
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
                                    x={zone.x}
                                    y={zone.y + (zone.region === 'deep' ? 7 : 6)}
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
                    {showActualZone && (
                        <g>
                            <circle
                                cx={FIELD_ZONES.find(z => z.id === showActualZone)?.x || 50}
                                cy={FIELD_ZONES.find(z => z.id === showActualZone)?.y || 50}
                                r="6"
                                fill="none"
                                stroke="#ef4444"
                                strokeWidth="1"
                                strokeDasharray="2,1"
                                className="animate-pulse"
                            />
                        </g>
                    )}
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
                className="w-full"
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
