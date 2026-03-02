'use client';

import { useState, useEffect } from 'react';
import TransactionForm, { FormData } from '@/components/TransactionForm';
import TransactionTable from '@/components/TransactionTable';
import SummaryCards from '@/components/SummaryCards';
import FinanceCharts from '@/components/FinanceCharts';
import { Transaccion } from '@/lib/financeUtils';
import PendingObligations from '@/components/dashboard/PendingObligations';
import { toast } from 'sonner';

export default function DashboardPage() {
    const [transactions, setTransactions] = useState<Transaccion[]>([]);
    const [loading, setLoading] = useState(true);

    // Fetch de datos desde Google Sheets
    const fetchTransactions = async () => {
        try {
            setLoading(true);
            const res = await fetch('/api/transactions');
            if (!res.ok) throw new Error('Error al cargar transacciones');
            const data = await res.json();
            setTransactions(data);
        } catch (error) {
            console.error('Error:', error);
            toast.error('Error al cargar las transacciones');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchTransactions();
    }, []);

    // Manejo del formulario
    const handleSubmit = async (formData: FormData) => {
        try {
            setLoading(true);
            const res = await fetch('/api/transactions', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(formData),
            });

            if (!res.ok) throw new Error('Error al guardar transacción');

            // Recargar datos
            await fetchTransactions();
        } catch (error) {
            console.error('Error:', error);
        } finally {
            setLoading(false);
        }
    };

    // Manejo de eliminación
    const handleDelete = async (id: string) => {
        try {
            const promise = fetch(`/api/transactions?id=${id}`, {
                method: 'DELETE',
            });

            toast.promise(promise, {
                loading: 'Eliminando transacción...',
                success: () => {
                    fetchTransactions(); // Recargar datos
                    return 'Transacción eliminada correctamente';
                },
                error: 'Error al eliminar la transacción',
            });
        } catch (error) {
            console.error('Error deleting:', error);
            toast.error('Error al intentar eliminar');
        }
    };

    return (
        <>
            {/* Page Title */}
            <div>
                <h2 className="text-3xl font-bold tracking-tight">Dashboard</h2>
                <p className="text-muted-foreground">
                    Resumen general de tus finanzas personales
                </p>
            </div>

            {/* Summary Cards */}
            <SummaryCards transactions={transactions} />

            {/* Transaction Form */}
            <TransactionForm onSubmit={handleSubmit} loading={loading} />

            {/* Charts */}
            <FinanceCharts transactions={transactions} />

            {/* Transactions Table */}
            <TransactionTable transactions={transactions} onDelete={handleDelete} />
        </>
    );
}
