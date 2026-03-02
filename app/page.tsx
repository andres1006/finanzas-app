'use client';

import { useState, useEffect } from 'react';
import LoginPage from '@/components/LoginPage';
import { Sidebar } from '@/components/dashboard/sidebar';
import { Header } from '@/components/dashboard/header';
import TransactionForm, { FormData } from '@/components/TransactionForm';
import TransactionTable from '@/components/TransactionTable';
import SummaryCards from '@/components/SummaryCards';
import FinanceCharts from '@/components/FinanceCharts';
import { Transaccion } from '@/lib/financeUtils';

import { toast } from 'sonner';

export default function Home() {
  const [currentUser, setCurrentUser] = useState<'Andrés' | 'Mariana' | null>(null);
  const [transactions, setTransactions] = useState<Transaccion[]>([]);
  const [loading, setLoading] = useState(true);

  // Verificar si hay sesión guardada
  useEffect(() => {
    const savedUser = localStorage.getItem('currentUser');
    if (savedUser === 'Andrés' || savedUser === 'Mariana') {
      setCurrentUser(savedUser);
    }
  }, []);

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
    if (currentUser) {
      fetchTransactions();
    }
  }, [currentUser]);

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
      // El toast de error ya se maneja en el formulario si lanza excepción, 
      // pero aquí capturamos errores de red fuera del form component si fuera el caso.
      // Sin embargo, TransactionForm ya tiene su propio manejo.
      // Dejaremos que TransactionForm maneje el éxito/error visual principal, 
      // pero aquí actualizamos el estado.
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

  // Manejo de login
  const handleLogin = (user: 'Andrés' | 'Mariana') => {
    setCurrentUser(user);
    localStorage.setItem('currentUser', user);
  };

  // Manejo de logout
  const handleLogout = () => {
    setCurrentUser(null);
    localStorage.removeItem('currentUser');
    setTransactions([]);
  };

  // Si no hay usuario logueado, mostrar página de login
  if (!currentUser) {
    return <LoginPage onLogin={handleLogin} />;
  }

  return (
    <div className="flex h-screen overflow-hidden bg-muted/40">
      {/* Sidebar */}
      <Sidebar />

      {/* Main Content */}
      <div className="flex flex-1 flex-col overflow-hidden">
        {/* Header */}
        <Header currentUser={currentUser} onLogout={handleLogout} />

        {/* Main Area */}
        <main className="flex-1 overflow-y-auto p-8">
          <div className="max-w-7xl mx-auto space-y-8">
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
          </div>
        </main>
      </div>
    </div>
  );
}
