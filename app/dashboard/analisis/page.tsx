'use client';

import MonthlyAnalysis from '@/components/MonthlyAnalysis';
import { useFinanceData } from '@/hooks/useFinanceData';

export default function AnalisisPage() {
    const { transactions } = useFinanceData();

    return (
        <div className="space-y-8">
            <div>
                <h2 className="text-3xl font-bold tracking-tight">Análisis Mensual</h2>
                <p className="text-muted-foreground">
                    Visualiza tus patrones de gasto y salud financiera
                </p>
            </div>

            <MonthlyAnalysis transactions={transactions} />
        </div>
    );
}
