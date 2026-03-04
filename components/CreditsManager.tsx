'use client';

import { useState } from 'react';
import { Credito } from '@/lib/financeUtils';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { CreditCard, Plus, History, CheckCircle2, DollarSign } from 'lucide-react';
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

interface PaymentHistory {
    fecha: string;
    monto: number;
    usuario: string;
}

export default function CreditsManager({ credits, onCreditsChange }: CreditsManagerProps) {
    const { user } = useAuth();
    const [loading, setLoading] = useState(false);
    
    // Modals state
    const [newCreditOpen, setNewCreditOpen] = useState(false);
    const [abonoId, setAbonoId] = useState<string | null>(null);
    const [historyId, setHistoryId] = useState<string | null>(null);
    const [historyData, setHistoryData] = useState<PaymentHistory[]>([]);
    
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

    const fetchHistory = async (id: string) => {
        try {
            setLoading(true);
            const res = await fetch(`/api/credits/history?creditId=${id}`);
            if (res.ok) {
                const data = await res.json();
                setHistoryData(data);
                setHistoryId(id);
            }
        } catch (error) {
            toast.error('Error al cargar historial');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center bg-white p-4 rounded-xl shadow-sm border">
                <div>
                    <h3 className="text-xl font-bold flex items-center gap-2 text-slate-800">
                        <CreditCard className="h-6 w-6 text-indigo-600" /> Mis Obligaciones
                    </h3>
                    <p className="text-xs text-muted-foreground">Gestiona tus créditos y tarjetas de forma centralizada</p>
                </div>
                <Button onClick={() => setNewCreditOpen(true)} className="gap-2 bg-indigo-600 hover:bg-indigo-700 rounded-full h-10 px-6">
                    <Plus className="h-4 w-4" /> Nuevo Crédito
                </Button>
            </div>

            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {credits.map((credit) => {
                    const saldoTotal = credit.montoTotal || 0;
                    const saldoActual = credit.saldoActual || 0;
                    const progress = saldoTotal > 0 ? ((saldoTotal - saldoActual) / saldoTotal) * 100 : 0;
                    
                    return (
                        <Card key={credit.id} className="relative overflow-hidden border-none shadow-md hover:shadow-lg transition-shadow bg-white">
                            <CardHeader className="pb-2 bg-slate-50/50">
                                <div className="flex justify-between items-start">
                                    <Badge variant="secondary" className="mb-2 uppercase text-[10px] font-bold bg-indigo-100 text-indigo-700">
                                        {credit.usuario || 'Andrés'}
                                    </Badge>
                                    <div className="text-[10px] font-bold text-slate-400">CORTE: DÍA {credit.fechaCorte}</div>
                                </div>
                                <CardTitle className="text-lg text-slate-800 font-bold">{credit.nombre}</CardTitle>
                                <CardDescription className="text-xs">Tasa: {credit.tasaInteres}% | Plazo: {credit.plazoMeses} meses</CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-4 pt-4">
                                <div className="space-y-2">
                                    <div className="flex justify-between text-xs font-bold">
                                        <span className="text-slate-500 uppercase tracking-wider">Saldo Pendiente</span>
                                        <span className="text-indigo-600 text-sm font-black">${saldoActual.toLocaleString('es-CO')}</span>
                                    </div>
                                    <Progress value={progress} className="h-2.5 bg-slate-100" />
                                    <div className="flex justify-between text-[10px] text-slate-400 font-bold uppercase tracking-tight">
                                        <span>{progress.toFixed(1)}% Pagado</span>
                                        <span>Original: ${saldoTotal.toLocaleString('es-CO')}</span>
                                    </div>
                                </div>

                                <div className="grid grid-cols-2 gap-2 pt-2">
                                    <Button 
                                        size="sm" 
                                        variant="outline" 
                                        className="text-xs h-9 gap-2 border-slate-200 hover:bg-slate-50"
                                        onClick={() => fetchHistory(credit.id)}
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
                <DialogContent className="rounded-2xl">
                    <DialogHeader><DialogTitle className="text-xl font-bold">Registrar Nueva Obligación</DialogTitle></DialogHeader>
                    <div className="grid gap-4 py-4">
                        <div className="grid gap-2">
                            <Label className="font-bold">Nombre del Crédito</Label>
                            <Input placeholder="Ej: Tarjeta Visa, Crédito Vehículo" value={newCredit.nombre} onChange={e => setNewCredit({...newCredit, nombre: e.target.value})} />
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div className="grid gap-2">
                                <Label className="font-bold">Monto Original</Label>
                                <Input type="number" value={newCredit.montoTotal} onChange={e => setNewCredit({...newCredit, montoTotal: e.target.value})} />
                            </div>
                            <div className="grid gap-2">
                                <Label className="font-bold">Saldo Hoy</Label>
                                <Input type="number" value={newCredit.saldoActual} onChange={e => setNewCredit({...newCredit, saldoActual: e.target.value})} />
                            </div>
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div className="grid gap-2">
                                <Label className="font-bold">Interés (%)</Label>
                                <Input type="number" value={newCredit.tasaInteres} onChange={e => setNewCredit({...newCredit, tasaInteres: e.target.value})} />
                            </div>
                            <div className="grid gap-2">
                                <Label className="font-bold">Día de Corte</Label>
                                <Input type="number" min="1" max="31" value={newCredit.fechaCorte} onChange={e => setNewCredit({...newCredit, fechaCorte: e.target.value})} />
                            </div>
                        </div>
                    </div>
                    <DialogFooter>
                        <Button variant="outline" className="rounded-full" onClick={() => setNewCreditOpen(false)}>Cancelar</Button>
                        <Button onClick={handleAddCredit} disabled={loading} className="bg-indigo-600 hover:bg-indigo-700 rounded-full">Guardar Crédito</Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* Modal: Abono */}
            <Dialog open={!!abonoId} onOpenChange={() => setAbonoId(null)}>
                <DialogContent className="rounded-2xl">
                    <DialogHeader><DialogTitle className="text-xl font-bold">Registrar Abono</DialogTitle></DialogHeader>
                    <div className="py-4 space-y-4">
                        <div className="p-3 rounded-lg bg-indigo-50 border border-indigo-100 flex items-center gap-3">
                            <DollarSign className="h-5 w-5 text-indigo-600" />
                            <div>
                                <p className="text-xs font-bold text-indigo-700 uppercase">Gasto se registrará como:</p>
                                <p className="text-sm font-semibold text-indigo-900">Abono Deuda - Créditos</p>
                            </div>
                        </div>
                        <div className="space-y-2">
                            <Label className="font-bold">Monto del Pago ($)</Label>
                            <Input type="number" placeholder="Ej: 500000" value={abonoValue} onChange={e => setAbonoValue(e.target.value)} autoFocus />
                        </div>
                    </div>
                    <DialogFooter>
                        <Button variant="outline" className="rounded-full" onClick={() => setAbonoId(null)}>Cancelar</Button>
                        <Button onClick={handleAddAbono} disabled={loading} className="bg-emerald-600 hover:bg-emerald-700 rounded-full">Confirmar Abono</Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* Modal: Historial */}
            <Dialog open={!!historyId} onOpenChange={() => setHistoryId(null)}>
                <DialogContent className="max-w-md rounded-2xl">
                    <DialogHeader>
                        <DialogTitle className="text-xl font-bold flex items-center gap-2">
                            <History className="h-5 w-5 text-indigo-600" /> Historial de Pagos
                        </DialogTitle>
                    </DialogHeader>
                    <div className="py-4">
                        {historyData.length === 0 ? (
                            <div className="text-center py-12 text-slate-400">
                                <History className="h-12 w-12 mx-auto mb-4 opacity-20" />
                                <p className="font-bold">Sin pagos registrados</p>
                                <p className="text-xs mt-1">Cuando hagas un abono, aparecerá aquí.</p>
                            </div>
                        ) : (
                            <div className="space-y-3 max-h-[300px] overflow-y-auto pr-2">
                                {historyData.map((p, i) => (
                                    <div key={i} className="flex items-center justify-between p-3 rounded-xl bg-slate-50 border border-slate-100 group hover:border-indigo-200 transition-colors">
                                        <div className="flex items-center gap-3">
                                            <div className="bg-emerald-100 p-2 rounded-full">
                                                <CheckCircle2 className="h-4 w-4 text-emerald-600" />
                                            </div>
                                            <div>
                                                <p className="text-sm font-bold text-slate-800">${p.monto.toLocaleString('es-CO')}</p>
                                                <p className="text-[10px] text-slate-500 font-medium uppercase">{p.fecha}</p>
                                            </div>
                                        </div>
                                        <Badge variant="outline" className="text-[10px] text-slate-400 group-hover:text-indigo-600 group-hover:border-indigo-200">{p.usuario}</Badge>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                    <DialogFooter>
                        <Button className="w-full rounded-full" onClick={() => setHistoryId(null)}>Cerrar</Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
}
