'use client';

import { Transaccion } from '@/lib/financeUtils';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

interface MonthlyAnalysisProps {
    transactions: Transaccion[];
}

export default function MonthlyAnalysis({ transactions }: MonthlyAnalysisProps) {
    return (
        <Card>
            <CardHeader>
                <CardTitle>Análisis Mensual</CardTitle>
            </CardHeader>
            <CardContent>
                <p>Análisis cargado con {transactions.length} transacciones.</p>
            </CardContent>
        </Card>
    );
}
