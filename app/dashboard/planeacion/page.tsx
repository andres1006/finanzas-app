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

    // Format current month for BudgetPlanner (YYYY-MM)
    const formattedMonth = `${selectedYear}-${String(selectedMonth + 1).padStart(2, '0')}`;

    return (
        <div className="space-y-8">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h2 className="text-3xl font-bold tracking-tight">Planeación</h2>
                    <p className="text-muted-foreground">
                        Gestiona tus presupuestos mensuales y gastos recurrentes
                    </p>
                </div>
                <div className="flex gap-2">
                    <select 
                        className="bg-background border rounded px-2 py-1 text-sm"
                        value={selectedMonth}
                        onChange={(e) => setSelectedMonth(parseInt(e.target.value))}
                    >
                        {['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio', 'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'].map((m, i) => (
                            <option key={i} value={i}>{m}</option>
                        ))}
                    </select>
                    <Button 
                        variant="outline"
                        onClick={async () => {
                            await handleAutoLoad(selectedMonth, selectedYear);
                            await fetchTransactions();
                        }}
                        disabled={isAutoLoading || loading}
                    >
                        {isAutoLoading ? 'Cargando...' : 'Cargar Gastos Mes Anterior'}
                    </Button>
                </div>
            </div>

            <BudgetPlanner 
                transactions={transactions} 
                onTransactionAdded={fetchTransactions}
                month={formattedMonth}
            />
        </div>
    );
}
