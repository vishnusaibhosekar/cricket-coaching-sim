'use client';

import { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

interface FieldMapProps {
    matchPhase: 'powerplay' | 'middle' | 'death';
    onSubmit: (zones: Array<{ zone: string; fielders: number }>) => void;
    disabled?: boolean;
}

const ZONES = [
    'Slip/Gully',
    'Point',
    'Cover',
    'Mid-off',
    'Mid-on',
    'Midwicket',
    'Square Leg',
    'Fine Leg',
    'Third Man',
];

const MAX_FIELDERS_OUTSIDE = {
    powerplay: 2,
    middle: 5,
    death: 5,
};

export function FieldMap({ matchPhase, onSubmit, disabled = false }: FieldMapProps) {
    const [fielders, setFielders] = useState<Record<string, number>>(
        Object.fromEntries(ZONES.map(zone => [zone, 0]))
    );

    const totalFielders = Object.values(fielders).reduce((sum, count) => sum + count, 0);
    const maxAllowed = MAX_FIELDERS_OUTSIDE[matchPhase];

    const handleZoneClick = (zone: string, increment: boolean) => {
        if (disabled) return;

        setFielders(prev => {
            const current = prev[zone];
            const newCount = increment ? current + 1 : current - 1;

            // Validate: 0-2 per zone, total <= 9
            if (newCount < 0 || newCount > 2) return prev;
            if (!increment && totalFielders <= 9) return { ...prev, [zone]: newCount };

            const newTotal = Object.values(prev).reduce((sum, count, idx) =>
                sum + (idx === ZONES.indexOf(zone) ? newCount : count), 0
            );

            if (newTotal > 9) return prev;

            return { ...prev, [zone]: newCount };
        });
    };

    const handleSubmit = () => {
        if (totalFielders !== 9) return;

        const zones = ZONES.map(zone => ({
            zone,
            fielders: fielders[zone],
        }));

        onSubmit(zones);
    };

    return (
        <Card className="p-6 bg-zinc-900 border-zinc-800">
            <h3 className="text-xl font-bold text-white mb-4">Field Placement</h3>

            <div className="mb-4 flex items-center justify-between">
                <Badge variant={totalFielders === 9 ? 'default' : 'secondary'}>
                    Fielders: {totalFielders}/9
                </Badge>
                <Badge variant={matchPhase === 'powerplay' ? 'destructive' : 'default'}>
                    Max outside ring: {maxAllowed}
                </Badge>
            </div>

            <div className="grid grid-cols-3 gap-3 mb-6">
                {ZONES.map(zone => (
                    <div key={zone} className="flex flex-col items-center p-3 bg-zinc-800 rounded-lg">
                        <span className="text-sm text-zinc-300 mb-2">{zone}</span>
                        <div className="flex items-center gap-2">
                            <Button
                                size="sm"
                                variant="outline"
                                disabled={disabled || fielders[zone] === 0}
                                onClick={() => handleZoneClick(zone, false)}
                            >
                                -
                            </Button>
                            <span className="text-lg font-bold text-white w-8 text-center">
                                {fielders[zone]}
                            </span>
                            <Button
                                size="sm"
                                variant="outline"
                                disabled={disabled || fielders[zone] >= 2 || totalFielders >= 9}
                                onClick={() => handleZoneClick(zone, true)}
                            >
                                +
                            </Button>
                        </div>
                    </div>
                ))}
            </div>

            <Button
                onClick={handleSubmit}
                disabled={disabled || totalFielders !== 9}
                className="w-full"
            >
                {totalFielders === 9 ? 'Submit Field Placement' : `Place ${9 - totalFielders} more fielders`}
            </Button>
        </Card>
    );
}
