'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog";
import { PlusCircle } from 'lucide-react';
import { toast } from 'sonner';
import { useAuth } from '@/components/providers/AuthProvider';

export default function AddSavingsModal({ goalId, goalName, onRefresh }: { goalId: string, goalName: string, onRefresh: () => void }) {
    const [amount, setAmount] = useState('');
    const [open, setOpen] = useState(false);
    const [loading, setLoading] = useState(false);
    const { user } = useAuth();

    const handleAdd = async () => {
        if (!amount || Number(amount) <= 0) {
            toast.error('Ingresa un monto válido');
            return;
        }

        try {
            setLoading(true);
            const res = await fetch('/api/goals/contribution', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ goalId, amount: Number(amount), user }),
            });

            if (!res.ok) throw new Error();

            toast.success(`Ahorro de ${amount} agregado a ${goalName}`);
            setOpen(false);
            setAmount('');
            onRefresh();
        } catch (error) {
            toast.error('Error al guardar el ahorro');
        } finally {
            setLoading(false);
        }
    };

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <Button size="sm" variant="outline" className="gap-2">
                    <PlusCircle className="h-4 w-4" /> Ahorrar
                </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                    <DialogTitle>Abonar a Meta</DialogTitle>
                    <DialogDescription>
                        ¿Cuánto quieres agregar hoy a {goalName}?
                    </DialogDescription>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                    <div className="grid gap-2">
                        <Label htmlFor="amount">Monto a ahorrar (COP)</Label>
                        <Input
                            id="amount"
                            type="number"
                            placeholder="$$$"
                            value={amount}
                            onChange={(e) => setAmount(e.target.value)}
                        />
                    </div>
                </div>
                <DialogFooter>
                    <Button onClick={handleAdd} disabled={loading}>
                        {loading ? 'Guardando...' : 'Confirmar Ahorro'}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
