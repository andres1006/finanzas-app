export interface Transaccion {
  id: string;
  fecha: string;
  tipo: 'Gasto' | 'Ingreso' | 'Abono Deuda';
  categoria: string;
  descripcion: string;
  monto: number;
  usuario: 'Andrés' | 'Mariana';
}

export interface MetaAhorro {
  id: string;
  nombre: string;
  montoObjetivo: number;
  montoActual: number;
  fechaLimite: string;
  prioridad: 'Alta' | 'Media' | 'Baja';
  usuario: 'Andrés' | 'Mariana';
}

export interface Credito {
  id: string;
  nombre: string;
  saldoTotal: number;
  tasaInteres: number;
  pagoMinimo: number;
  fechaCorte: string;
  usuario: 'Andrés' | 'Mariana';
}

export interface PagoAmortizacion {
  mes: number;
  cuota: number;
  interes: number;
  capital: number;
  saldo: number;
}

export const calcularProgresoMeta = (meta: MetaAhorro): number => {
  if (meta.montoObjetivo <= 0) return 0;
  const progreso = (meta.montoActual / meta.montoObjetivo) * 100;
  return Math.min(progreso, 100);
};

export const calcularAhorroMensualNecesario = (meta: MetaAhorro): number => {
  const hoy = new Date();
  const limite = new Date(meta.fechaLimite);
  const mesesRestantes = (limite.getFullYear() - hoy.getFullYear()) * 12 + (limite.getMonth() - hoy.getMonth());
  
  const faltante = meta.montoObjetivo - meta.montoActual;
  if (faltante <= 0) return 0;
  if (mesesRestantes <= 0) return faltante;
  
  return faltante / mesesRestantes;
};

export const filtrarPorMes = (transacciones: Transaccion[], mes: number, anio: number) => {
  return transacciones.filter(t => {
    const fecha = new Date(t.fecha);
    return fecha.getMonth() === mes && fecha.getFullYear() === anio;
  });
};

export const agruparPorMes = (transacciones: Transaccion[]) => {
  const meses: Record<string, { ingresos: number, gastos: number, abonos: number }> = {};
  transacciones.forEach(t => {
    const fecha = new Date(t.fecha);
    const key = `${fecha.getFullYear()}-${String(fecha.getMonth() + 1).padStart(2, '0')}`;
    if (!meses[key]) meses[key] = { ingresos: 0, gastos: 0, abonos: 0 };
    if (t.tipo === 'Ingreso') meses[key].ingresos += t.monto;
    if (t.tipo === 'Gasto') meses[key].gastos += t.monto;
    if (t.tipo === 'Abono Deuda') meses[key].abonos += t.monto;
  });
  return meses;
};

export const agruparPorCategoria = (transacciones: Transaccion[]) => {
  const cats: Record<string, number> = {};
  transacciones.forEach(t => {
    cats[t.categoria] = (cats[t.categoria] || 0) + t.monto;
  });
  return Object.entries(cats).map(([name, value]) => ({ name, value }));
};

export const calcularCambioMensual = (actual: number, anterior: number) => {
  if (anterior === 0) return 0;
  return ((actual - anterior) / anterior) * 100;
};

export const calcularProyecciones = (transacciones: Transaccion[]) => {
  const hoy = new Date();
  const gastosMes = filtrarPorMes(transacciones, hoy.getMonth(), hoy.getFullYear())
    .filter(t => t.tipo === 'Gasto')
    .reduce((sum, t) => sum + t.monto, 0);
  
  const diasPasados = hoy.getDate();
  const diasMes = new Date(hoy.getFullYear(), hoy.getMonth() + 1, 0).getDate();
  const gastoDiario = diasPasados > 0 ? gastosMes / diasPasados : 0;
  
  return {
    proyectado: gastoDiario * diasMes,
    promedioDiario: gastoDiario
  };
};

export const calcularAmortizacion = (saldo: number, tasa: number, cuota: number): PagoAmortizacion[] => {
  const pagos: PagoAmortizacion[] = [];
  let saldoRestante = saldo;
  let mes = 1;
  const tasaMensual = (tasa / 100) / 12;

  while (saldoRestante > 0 && mes <= 360) {
    const interes = saldoRestante * tasaMensual;
    const capital = Math.min(cuota - interes, saldoRestante);
    saldoRestante -= capital;
    pagos.push({ mes, cuota, interes, capital, saldo: Math.max(0, saldoRestante) });
    mes++;
  }
  return pagos;
};

export const calcularAhorroConPagoExtra = (saldo: number, tasa: number, cuota: number, extra: number) => {
  const normal = calcularAmortizacion(saldo, tasa, cuota);
  const conExtra = calcularAmortizacion(saldo, tasa, cuota + extra);
  return {
    mesesAhorrados: normal.length - conExtra.length,
    interesAhorrado: normal.reduce((s, p) => s + p.interes, 0) - conExtra.reduce((s, p) => s + p.interes, 0)
  };
};
