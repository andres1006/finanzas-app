'use client';

import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';
import { useAuth } from '@/components/providers/AuthProvider';
import { MetaAhorro } from '@/lib/financeUtils';

interface AddSavingsModalProps {
  goal: MetaAhorro;
  onClose: () => void;
  onSuccess: () => void;
}

export default function AddSavingsModal({ goal, onClose, onSuccess }: AddSavingsModalProps) {
  const [amount, setAmount] = useState('');
  const [loading, setLoading] = useState(false);
  const { user } = useAuth();

  const handleSave = async () => {
    const val = parseFloat(amount);
    if (isNaN(val) || val <= 0) {
      toast.error('Ingresa un monto válido');
      return;
    }

    try {
      setLoading(true);
      const res = await fetch('/api/goals/contribution', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          goalId: goal.id,
          amount: val,
          user: user || 'Andrés'
        }),
      });

      if (!res.ok) throw new Error('Error al guardar el ahorro');
      
      toast.success(`¡Ahorro de $${val.toLocaleString()} agregado a ${goal.nombre}!`);
      onSuccess();
    } catch (error) {
      console.error(error);
      toast.error('No se pudo guardar el ahorro');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={true} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Agregar Ahorro a: {goal.nombre}</DialogTitle>
        </DialogHeader>
        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="amount">Monto a ahorrar ($)</Label>
            <Input
              id="amount"
              type="number"
              placeholder="Ej: 50000"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              disabled={loading}
            />
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={onClose} disabled={loading}>
            Cancelar
          </Button>
          <Button onClick={handleSave} disabled={loading}>
            {loading ? 'Guardando...' : 'Confirmar Ahorro'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
