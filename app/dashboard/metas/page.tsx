'use client';

import { useState, useEffect } from 'react';
import SavingsGoals from '@/components/SavingsGoals';
import { MetaAhorro } from '@/lib/financeUtils';
import { toast } from 'sonner';

export default function GoalsPage() {
    const [goals, setGoals] = useState<MetaAhorro[]>([]);
    const [loading, setLoading] = useState(true);

    const fetchGoals = async () => {
        try {
            setLoading(true);
            const res = await fetch('/api/goals');
            if (!res.ok) throw new Error('Error al cargar metas');
            const data = await res.json();
            setGoals(data);
        } catch (error) {
            console.error('Error:', error);
            toast.error('Error al cargar metas de ahorro');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchGoals();
    }, []);

    if (loading) {
        return (
            <div className="flex items-center justify-center h-[50vh]">
                <div className="flex flex-col items-center gap-4">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
                    <p className="text-muted-foreground">Cargando metas...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <div>
                <h2 className="text-3xl font-bold tracking-tight">Metas de Ahorro</h2>
                <p className="text-muted-foreground">
                    Define y monitorea tus objetivos financieros
                </p>
            </div>

            <SavingsGoals goals={goals} onGoalsChange={fetchGoals} />
        </div>
    );
}
