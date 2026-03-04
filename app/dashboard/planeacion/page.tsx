'use client';

import { useState, useEffect } from 'react';
import BudgetPlanner from '@/components/BudgetPlanner';
import { Transaccion, filtrarPorMes } from '@/lib/financeUtils';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { useAutoLoadBudget } from '@/hooks/useAutoLoadBudget';

export default function PlaneacionPage() {
    const [transactions, setTransactions] = useState<Transaccion[]>([]);
    const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth());
    const [selectedYear] = useState(new Date().getFullYear());
    const [loading, setLoading] = useState(true);

    const { handleAutoLoad, isLoading: isAutoLoading } = useAutoLoadBudget();

    const fetchTransactions = async () => {
        try {
            setLoading(true);
            const res = await fetch('/api/transactions');
            if (!res.ok) throw new Error('Error al cargar transacciones');
            const data: Transaccion[] = await res.json();
            
            // Pasaremos filtradas para "isPaid" logic sea estricta con el mes seleccionado
            const filtered = filtrarPorMes(data, selectedMonth, selectedYear);
            setTransactions(filtered);
        } catch (error) {
            console.error('Error:', error);
            toast.error('Error al cargar las transacciones');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchTransactions();
    }, [selectedMonth, selectedYear]);

    return (
        <div className="space-y-8">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h2 className="text-3xl font-bold tracking-tight">Planeación</h2>
                    <p className="text-muted-foreground">
                        Gestiona tus presupuestos mensuales y gastos recurrentes
                    </p>
                </div>
                <Button 
                    onClick={async () => {
                        await handleAutoLoad(selectedMonth, selectedYear);
                        await fetchTransactions();
                    }}
                    disabled={isAutoLoading || loading}
                >
                    {isAutoLoading ? 'Cargando...' : 'Cargar Gastos Mes Anterior'}
                </Button>
            </div>

            <BudgetPlanner 
                transactions={transactions} 
                onMonthChange={(m) => setSelectedMonth(m)}
                selectedMonth={selectedMonth}
            />
        </div>
    );
}
