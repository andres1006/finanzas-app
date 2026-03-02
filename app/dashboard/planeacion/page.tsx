'use client';

import { useState, useEffect } from 'react';
import BudgetPlanner from '@/components/BudgetPlanner';
import { Transaccion, filtrarPorMes } from '@/lib/financeUtils';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { useAutoLoadBudget } from '@/hooks/useAutoLoadBudget';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

export default function PlanningPage() {
    useAutoLoadBudget();
    const [transactions, setTransactions] = useState<Transaccion[]>([]);
    const [loading, setLoading] = useState(true);

    const today = new Date();
    const currentMonthStr = today.toISOString().substring(0, 7);
    const [selectedMonth, setSelectedMonth] = useState(currentMonthStr);

    const [year, month] = selectedMonth.split('-');

    const handleYearChange = (newYear: string) => {
        setSelectedMonth(`${newYear}-${month}`);
    };

    const handleMonthChange = (newMonth: string) => {
        setSelectedMonth(`${year}-${newMonth}`);
    };

    const years = Array.from({ length: 5 }, (_, i) => (today.getFullYear() - 2 + i).toString());
    const months = [
        { value: '01', label: 'Enero' },
        { value: '02', label: 'Febrero' },
        { value: '03', label: 'Marzo' },
        { value: '04', label: 'Abril' },
        { value: '05', label: 'Mayo' },
        { value: '06', label: 'Junio' },
        { value: '07', label: 'Julio' },
        { value: '08', label: 'Agosto' },
        { value: '09', label: 'Septiembre' },
        { value: '10', label: 'Octubre' },
        { value: '11', label: 'Noviembre' },
        { value: '12', label: 'Diciembre' },
    ];

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
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div>
                    <h2 className="text-3xl font-bold tracking-tight">Planeación Mensual</h2>
                    <p className="text-muted-foreground text-sm">
                        Gestiona tus pagos recurrentes del mes
                    </p>
                </div>

                <div className="flex items-center gap-2">
                    <Select value={month} onValueChange={handleMonthChange}>
                        <SelectTrigger className="w-[130px] bg-white">
                            <SelectValue placeholder="Mes" />
                        </SelectTrigger>
                        <SelectContent>
                            {months.map(m => (
                                <SelectItem key={m.value} value={m.value}>{m.label}</SelectItem>
                            ))}
                        </SelectContent>
                    </Select>

                    <Select value={year} onValueChange={handleYearChange}>
                        <SelectTrigger className="w-[100px] bg-white">
                            <SelectValue placeholder="Año" />
                        </SelectTrigger>
                        <SelectContent>
                            {years.map(y => (
                                <SelectItem key={y} value={y}>{y}</SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                </div>
            </div>

            <BudgetPlanner
                transactions={transactions}
                onTransactionAdded={fetchTransactions}
                month={selectedMonth}
            />
        </div>
    );
}
