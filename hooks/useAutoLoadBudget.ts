'use client';

import { useEffect, useRef } from 'react';

export function useAutoLoadBudget() {
    const initialized = useRef(false);

    useEffect(() => {
        if (initialized.current) return;
        initialized.current = true;

        const autoLoad = async () => {
            try {
                const now = new Date();
                const day = now.getDate();
                const month = now.getMonth();
                const year = now.getFullYear();

                let targetMonth: string;

                if (day >= 29) {
                    // Cargar mes siguiente
                    const nextMonth = new Date(year, month + 1, 1);
                    targetMonth = nextMonth.toISOString().substring(0, 7);
                } else {
                    // Asegurar mes actual
                    targetMonth = now.toISOString().substring(0, 7);
                }

                // Verificar si ya se cargó en esta sesión local para evitar redundancia
                const lastChecked = localStorage.getItem('budget_last_autoload_check');
                if (lastChecked === targetMonth) return;

                console.log(`[AutoLoad] Verificando/Cargando plan para ${targetMonth}...`);

                const res = await fetch('/api/budget/plan', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        action: 'create_from_template',
                        month: targetMonth
                    }),
                });

                if (res.ok) {
                    const data = await res.json();
                    if (data.success) {
                        console.log(`[AutoLoad] ${data.message}`);
                        localStorage.setItem('budget_last_autoload_check', targetMonth);
                    }
                }
            } catch (error) {
                console.error('[AutoLoad] Error:', error);
            }
        };

        autoLoad();
    }, []);
}
