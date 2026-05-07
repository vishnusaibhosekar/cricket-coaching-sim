'use client';

import { useState, useCallback } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ShotZone, UserFieldPlacement } from '@/lib/types';

interface FieldMapProps {
    onSubmit: (placement: UserFieldPlacement) => void;
    disabled?: boolean;
    maxFielders?: number;
    showActualZone?: ShotZone;
}

// Field zones mapped to cricket positions (26 zones total)
const FIELD_ZONES: { id: ShotZone; label: string; x: number; y: number; region: 'close' | 'inner' | 'deep' }[] = [
    // Close catching positions (near the pitch)
    { id: 'short_leg', label: 'Short Leg', x: 60, y: 45, region: 'close' },
    { id: 'silly_point', label: 'Silly Point', x: 40, y: 45, region: 'close' },
    { id: 'leg_slip', label: 'Leg Slip', x: 62, y: 30, region: 'close' },
    { id: 'slip_gully', label: 'Slip/Gully', x: 55, y: 22, region: 'close' },

    // Inner circle positions
    { id: 'point', label: 'Point', x: 30, y: 40, region: 'inner' },
    { id: 'backward_point', label: 'Backward Point', x: 28, y: 50, region: 'inner' },
    { id: 'cover', label: 'Cover', x: 38, y: 30, region: 'inner' },
    { id: 'extra_cover', label: 'Extra Cover', x: 44, y: 25, region: 'inner' },
    { id: 'mid_off', label: 'Mid-Off', x: 48, y: 20, region: 'inner' },
    { id: 'mid_on', label: 'Mid-On', x: 52, y: 20, region: 'inner' },
    { id: 'midwicket', label: 'Midwicket', x: 62, y: 35, region: 'inner' },
    { id: 'square_leg', label: 'Square Leg', x: 72, y: 42, region: 'inner' },
    { id: 'short_fine_leg', label: 'Short Fine Leg', x: 78, y: 55, region: 'inner' },
    { id: 'fine_leg', label: 'Fine Leg', x: 82, y: 52, region: 'inner' },
    { id: 'third_man', label: 'Third Man', x: 50, y: 78, region: 'inner' },

    // Deep positions (outer ring)
    { id: 'deep_cover', label: 'Deep Cover', x: 25, y: 15, region: 'deep' },
    { id: 'deep_extra_cover', label: 'Deep Extra Cover', x: 35, y: 8, region: 'deep' },
    { id: 'deep_point', label: 'Deep Point', x: 15, y: 30, region: 'deep' },
    { id: 'deep_backward_point', label: 'Deep Bwd Point', x: 18, y: 55, region: 'deep' },
    { id: 'deep_midwicket', label: 'Deep Midwicket', x: 75, y: 12, region: 'deep' },
    { id: 'deep_square_leg', label: 'Deep Sq Leg', x: 88, y: 30, region: 'deep' },
    { id: 'long_on', label: 'Long On', x: 52, y: 5, region: 'deep' },
    { id: 'long_off', label: 'Long Off', x: 48, y: 5, region: 'deep' },
    { id: 'deep_third_man', label: 'Deep 3rd Man', x: 50, y: 95, region: 'deep' },
];

export function FieldMap({ onSubmit, disabled = false, maxFielders = 9, showActualZone }: FieldMapProps) {
    const [fielders, setFielders] = useState<Record<ShotZone, number>>(
        FIELD_ZONES.reduce((acc, zone) => ({ ...acc, [zone.id]: 0 }), {} as Record<ShotZone, number>)
    );

    const totalFielders = Object.values(fielders).reduce((sum, count) => sum + count, 0);

    const handleZoneClick = useCallback((zoneId: ShotZone) => {
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
            <div className="relative w-full aspect-square max-w-md mx-auto mb-4">
                <svg viewBox="0 0 100 100" className="w-full h-full">
                    {/* Field boundary */}
                    <ellipse
                        cx="50"
                        cy="50"
                        rx="48"
                        ry="48"
                        fill="none"
                        stroke="#4ade80"
                        strokeWidth="0.5"
                        strokeDasharray="2,2"
                    />

                    {/* 30-yard circle */}
                    <ellipse
                        cx="50"
                        cy="50"
                        rx="25"
                        ry="25"
                        fill="none"
                        stroke="#fbbf24"
                        strokeWidth="0.3"
                        strokeDasharray="1,1"
                    />

                    {/* Pitch */}
                    <rect
                        x="48"
                        y="20"
                        width="4"
                        height="60"
                        fill="#d4d4d8"
                        stroke="#a1a1aa"
                        strokeWidth="0.3"
                    />

                    {/* Wickets */}
                    <circle cx="50" cy="20" r="1" fill="#ef4444" />
                    <circle cx="50" cy="80" r="1" fill="#ef4444" />

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
