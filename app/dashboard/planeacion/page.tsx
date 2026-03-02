'use client';

import { useState, useEffect } from 'react';
import BudgetPlanner from '@/components/BudgetPlanner';
import { Transaccion, filtrarPorMes } from '@/lib/financeUtils';
import { toast } from 'sonner';

export default function PlanningPage() {
    const [transactions, setTransactions] = useState<Transaccion[]>([]);
    const [loading, setLoading] = useState(true);

    // Obtener mes actual
    const currentMonth = new Date().toISOString().substring(0, 7); // YYYY-MM
    const [selectedMonth, setSelectedMonth] = useState(currentMonth);

    const fetchTransactions = async () => {
        try {
            // setLoading(true); // Opcional: no bloquear todo si solo recargamos
            const res = await fetch('/api/transactions');
            if (!res.ok) throw new Error('Error al cargar transacciones');
            const data = await res.json();

            // Filtrar solo las de este mes para pasar al planner
            // Aunque BudgetPlanner podría filtrar, mejor pasamos todas o filtradas?
            // Pasaremos filtradas para "isPaid" logic sea estricta con el mes seleccionado
            const filtered = filtrarPorMes(data, selectedMonth);
            setTransactions(filtered);
        } catch (error) {
            console.error('Error:', error);
            toast.error('Error al cargar datos');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchTransactions();
    }, [selectedMonth]);

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-3xl font-bold tracking-tight">Planeación Mensual</h2>
                    <p className="text-muted-foreground">
                        Gestiona tus pagos recurrentes del mes
                    </p>
                </div>
                {/* Selector de mes (Opcional por ahora, default este mes) */}
                <div className="text-sm font-medium text-muted-foreground border px-3 py-1 rounded-md bg-white">
                    {new Date(selectedMonth + '-01').toLocaleDateString('es-CO', { month: 'long', year: 'numeric' })}
                </div>
            </div>

            <BudgetPlanner
                transactions={transactions}
                onTransactionAdded={fetchTransactions}
            />
        </div>
    );
}
