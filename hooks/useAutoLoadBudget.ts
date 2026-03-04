import { useState } from 'react';
import { toast } from 'sonner';

export function useAutoLoadBudget() {
    const [isLoading, setIsLoading] = useState(false);

    const handleAutoLoad = async (month: number, year: number) => {
        try {
            setIsLoading(true);
            const res = await fetch('/api/budget/template', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ month, year }),
            });

            if (!res.ok) throw new Error();

            toast.success('Gastos recurrentes cargados');
        } catch (error) {
            console.error(error);
            toast.error('Error al cargar gastos del mes anterior');
        } finally {
            setIsLoading(false);
        }
    };

    return { handleAutoLoad, isLoading };
}
