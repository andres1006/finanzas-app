'use client';

import { Transaccion } from '@/lib/financeUtils';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

interface SummaryCardsProps {
    transactions: Transaccion[];
}

export default function SummaryCards({ transactions }: SummaryCardsProps) {
    const ingresos = transactions.filter(t => t.tipo === 'Ingreso').reduce((s, t) => s + t.monto, 0);
    const gastos = transactions.filter(t => t.tipo === 'Gasto').reduce((s, t) => s + t.monto, 0);

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Card>
                <CardHeader><CardTitle>Ingresos</CardTitle></CardHeader>
                <CardContent><p className="text-2xl font-bold text-emerald-600">${ingresos}</p></CardContent>
            </Card>
            <Card>
                <CardHeader><CardTitle>Gastos</CardTitle></CardHeader>
                <CardContent><p className="text-2xl font-bold text-red-600">${gastos}</p></CardContent>
            </Card>
        </div>
    );
}
