'use client';

import { useState, useEffect } from 'react';
import MonthlyAnalysis from '@/components/MonthlyAnalysis';
import { Transaccion } from '@/lib/financeUtils';
import { toast } from 'sonner';

export default function AnalysisPage() {
    const [transactions, setTransactions] = useState<Transaccion[]>([]);
    const [loading, setLoading] = useState(true);

    const fetchTransactions = async () => {
        try {
            setLoading(true);
            const res = await fetch('/api/transactions');
            if (!res.ok) throw new Error('Error al cargar transacciones');
            const data = await res.json();
            setTransactions(data);
        } catch (error) {
            console.error('Error:', error);
            toast.error('Error al cargar datos para análisis');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchTransactions();
    }, []);

    if (loading) {
        return (
            <div className="flex items-center justify-center h-[50vh]">
                <div className="flex flex-col items-center gap-4">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-600"></div>
                    <p className="text-muted-foreground">Cargando análisis...</p>
                </div>
            </div>
        );
    }

    return <MonthlyAnalysis transactions={transactions} />;
}
