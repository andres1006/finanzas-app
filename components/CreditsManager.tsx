'use client';

import { useState } from 'react';
import { Credito, calcularAmortizacion } from '@/lib/financeUtils';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { CreditCard, Plus, History, Calendar, Trash2, DollarSign } from 'lucide-react';
import { Progress } from '@/components/ui/progress';
import { toast } from 'sonner';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogFooter,
} from "@/components/ui/dialog";
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { useAuth } from '@/components/providers/AuthProvider';

interface CreditsManagerProps {
    credits: Credito[];
    onCreditsChange: () => Promise<void>;
}

export default function CreditsManager({ credits, onCreditsChange }: CreditsManagerProps) {
    const { user } = useAuth();
    const [loading, setLoading] = useState(false);
    
    // Modals state
    const [newCreditOpen, setNewCreditOpen] = useState(false);
    const [abonoId, setAbonoId] = useState<string | null>(null);
    const [historyId, setHistoryId] = useState<string | null>(null);
    
    // Form states
    const [abonoValue, setAbonoValue] = useState('');
    const [newCredit, setNewCredit] = useState({
        nombre: '',
        montoTotal: '',
        saldoActual: '',
        tasaInteres: '',
        plazoMeses: '12',
        fechaCorte: '1'
    });

    const handleAddCredit = async () => {
        if (!newCredit.nombre || !newCredit.montoTotal || !newCredit.saldoActual) {
            toast.warning('Completa los campos obligatorios');
            return;
        }

        try {
            setLoading(true);
            const res = await fetch('/api/credits', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    ...newCredit,
                    montoTotal: Number(newCredit.montoTotal),
                    saldoActual: Number(newCredit.saldoActual),
                    tasaInteres: Number(newCredit.tasaInteres),
                    plazoMeses: Number(newCredit.plazoMeses),
                    usuario: user || 'Andrés'
                }),
            });

            if (res.ok) {
                toast.success('Crédito registrado con éxito');
                setNewCreditOpen(false);
                setNewCredit({ nombre: '', montoTotal: '', saldoActual: '', tasaInteres: '', plazoMeses: '12', fechaCorte: '1' });
                await onCreditsChange();
            }
        } catch (error) {
            toast.error('Error al guardar crédito');
        } finally {
            setLoading(false);
        }
    };

    const handleAddAbono = async () => {
        if (!abonoId || !abonoValue) return;
        const amount = Number(abonoValue);
        
        try {
            setLoading(true);
            const res = await fetch('/api/credits/payment', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    creditId: abonoId,
                    amount: amount,
                    user: user || 'Andrés'
                }),
            });

            if (res.ok) {
                toast.success(`Abono de $${amount.toLocaleString()} registrado`);
                setAbonoId(null);
                setAbonoValue('');
                await onCreditsChange();
            }
        } catch (error) {
            toast.error('Error al registrar abono');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <h3 className="text-xl font-semibold flex items-center gap-2">
                    <CreditCard className="h-5 w-5" /> Mis Obligaciones
                </h3>
                <Button onClick={() => setNewCreditOpen(true)} className="gap-2 bg-indigo-600 hover:bg-indigo-700">
                    <Plus className="h-4 w-4" /> Nuevo Crédito
                </Button>
            </div>

            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {credits.map((credit) => {
                    const saldoTotal = credit.montoTotal || 0;
                    const saldoActual = credit.saldoActual || 0;
                    const progress = saldoTotal > 0 ? ((saldoTotal - saldoActual) / saldoTotal) * 100 : 0;
                    
                    return (
                        <Card key={credit.id} className="relative overflow-hidden border-none shadow-md">
                            <CardHeader className="pb-2 bg-slate-50/50">
                                <div className="flex justify-between items-start">
                                    <Badge variant="secondary" className="mb-2 uppercase text-[10px] font-bold">
                                        {credit.usuario || 'Andrés'}
                                    </Badge>
                                    <div className="text-[10px] font-bold text-slate-400">CORTE: DÍA {credit.fechaCorte}</div>
                                </div>
                                <CardTitle className="text-lg text-slate-800">{credit.nombre}</CardTitle>
                                <CardDescription className="text-xs">Tasa: {credit.tasaInteres}% | Plazo: {credit.plazoMeses} meses</CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-4 pt-4">
                                <div className="space-y-1">
                                    <div className="flex justify-between text-xs font-bold">
                                        <span className="text-slate-500">Saldo Pendiente</span>
                                        <span className="text-indigo-600">${saldoActual.toLocaleString('es-CO')}</span>
                                    </div>
                                    <Progress value={progress} className="h-2 bg-slate-100" />
                                    <div className="flex justify-between text-[10px] text-slate-400 font-medium">
                                        <span>{progress.toFixed(1)}% Amortizado</span>
                                        <span>Total: ${saldoTotal.toLocaleString('es-CO')}</span>
                                    </div>
                                </div>

                                <div className="grid grid-cols-2 gap-2">
                                    <Button 
                                        size="sm" 
                                        variant="outline" 
                                        className="text-xs h-9 gap-2 border-slate-200"
                                        onClick={() => setHistoryId(credit.id)}
                                    >
                                        <History className="h-4 w-4" /> Historial
                                    </Button>
                                    <Button 
                                        size="sm" 
                                        className="text-xs h-9 gap-2 bg-emerald-600 hover:bg-emerald-700"
                                        onClick={() => { setAbonoId(credit.id); setAbonoValue(''); }}
                                    >
                                        <Plus className="h-4 w-4" /> Abono
                                    </Button>
                                </div>
                            </CardContent>
                        </Card>
                    );
                })}
            </div>

            {/* Modal: Nuevo Crédito */}
            <Dialog open={newCreditOpen} onOpenChange={setNewCreditOpen}>
                <DialogContent>
                    <DialogHeader><DialogTitle>Registrar Nueva Obligación</DialogTitle></DialogHeader>
                    <div className="grid gap-4 py-4">
                        <div className="grid gap-2">
                            <Label>Nombre del Crédito</Label>
                            <Input placeholder="Ej: Tarjeta Visa, Crédito Vehículo" value={newCredit.nombre} onChange={e => setNewCredit({...newCredit, nombre: e.target.value})} />
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div className="grid gap-2">
                                <Label>Monto Total (Deuda Inicial)</Label>
                                <Input type="number" value={newCredit.montoTotal} onChange={e => setNewCredit({...newCredit, montoTotal: e.target.value})} />
                            </div>
                            <div className="grid gap-2">
                                <Label>Saldo Actual</Label>
                                <Input type="number" value={newCredit.saldoActual} onChange={e => setNewCredit({...newCredit, saldoActual: e.target.value})} />
                            </div>
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div className="grid gap-2">
                                <Label>Tasa Interés (%)</Label>
                                <Input type="number" value={newCredit.tasaInteres} onChange={e => setNewCredit({...newCredit, tasaInteres: e.target.value})} />
                            </div>
                            <div className="grid gap-2">
                                <Label>Día de Corte</Label>
                                <Input type="number" value={newCredit.fechaCorte} onChange={e => setNewCredit({...newCredit, fechaCorte: e.target.value})} />
                            </div>
                        </div>
                    </div>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setNewCreditOpen(false)}>Cancelar</Button>
                        <Button onClick={handleAddCredit} disabled={loading} className="bg-indigo-600">Guardar Crédito</Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* Modal: Abono */}
            <Dialog open={!!abonoId} onOpenChange={() => setAbonoId(null)}>
                <DialogContent>
                    <DialogHeader><DialogTitle>Registrar Abono</DialogTitle></DialogHeader>
                    <div className="py-4 space-y-4">
                        <Label>Monto del Pago ($)</Label>
                        <Input type="number" value={abonoValue} onChange={e => setAbonoValue(e.target.value)} autoFocus />
                    </div>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setAbonoId(null)}>Cancelar</Button>
                        <Button onClick={handleAddAbono} disabled={loading} className="bg-emerald-600">Confirmar Abono</Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* Modal: Historial (Placeholder) */}
            <Dialog open={!!historyId} onOpenChange={() => setHistoryId(null)}>
                <DialogContent className="max-w-md">
                    <DialogHeader><DialogTitle>Historial de Pagos</DialogTitle></DialogHeader>
                    <div className="py-8 text-center text-slate-400">
                        <History className="h-12 w-12 mx-auto mb-4 opacity-20" />
                        <p>Cargando historial de pagos del Google Sheet...</p>
                        <p className="text-xs italic mt-2">Próximamente disponible 🦾</p>
                    </div>
                </DialogContent>
            </Dialog>
        </div>
    );
}
