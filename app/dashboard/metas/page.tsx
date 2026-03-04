'use client';

import { useState, useEffect } from 'react';
import SavingsGoals from '@/components/SavingsGoals';
import { MetaAhorro } from '@/lib/financeUtils';
import { toast } from 'sonner';

export default function MetasPage() {
    const [goals, setGoals] = useState<MetaAhorro[]>([]);
    const [loading, setLoading] = useState(true);

    const fetchGoals = async () => {
        try {
            setLoading(true);
            const res = await fetch('/api/goals');
            if (!res.ok) throw new Error('Error al cargar metas');
            const data: MetaAhorro[] = await res.json();
            setGoals(data);
        } catch (error) {
            console.error('Error:', error);
            toast.error('Error al cargar las metas de ahorro');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchGoals();
    }, []);

    return (
        <div className="space-y-8">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h2 className="text-3xl font-bold tracking-tight">Metas de Ahorro</h2>
                    <p className="text-muted-foreground">
                        Sigue el progreso de tus objetivos y celebra tus logros
                    </p>
                </div>
            </div>

            <SavingsGoals goals={goals} onGoalUpdate={fetchGoals} />
        </div>
    );
}
