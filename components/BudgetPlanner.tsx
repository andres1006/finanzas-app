'use client';

import { useState } from 'react';
import { Transaccion } from '@/lib/financeUtils';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

interface BudgetPlannerProps {
    transactions: Transaccion[];
    onMonthChange?: (month: number) => void;
    selectedMonth?: number;
}

export default function BudgetPlanner({ transactions, onMonthChange, selectedMonth }: BudgetPlannerProps) {
    return (
        <Card>
            <CardHeader>
                <CardTitle>Planeador de Presupuesto</CardTitle>
            </CardHeader>
            <CardContent>
                <p>Módulo de planeación cargado con {transactions.length} registros.</p>
                {/* Aquí va la lógica original pero tipada correctamente */}
            </CardContent>
        </Card>
    );
}
