export type Deuda = {
    nombre: string;
    saldo: number;
    interes: number;
    pagoMinimo: number;
};

export type Transaccion = {
    id: string;
    fecha: string;
    tipo: 'Gasto' | 'Ingreso' | 'Abono Deuda';
    categoria: string;
    descripcion: string;
    monto: number;
    usuario: 'Andrés' | 'Mariana';
};

/**
 * Calcula el plan de pago usando el método Bola de Nieve
 */
export const calcularBolaDeNieve = (deudas: Deuda[], dineroExtra: number) => {
    const ordenadas = [...deudas].sort((a, b) => a.saldo - b.saldo);
    const planDePago: string[] = [];
    let capitalDisponible = dineroExtra;

    for (const deuda of ordenadas) {
        if (capitalDisponible >= deuda.saldo) {
            planDePago.push(`Pagar totalmente ${deuda.nombre} ($${deuda.saldo.toLocaleString('es-CO')})`);
            capitalDisponible -= deuda.saldo;
        } else if (capitalDisponible > 0) {
            planDePago.push(`Abonar $${capitalDisponible.toLocaleString('es-CO')} a ${deuda.nombre}`);
            capitalDisponible = 0;
        }
    }

    if (capitalDisponible > 0) {
        planDePago.push(`Sobran $${capitalDisponible.toLocaleString('es-CO')} para ahorro`);
    }

    return planDePago;
};

/**
 * Calcula proyecciones financieras basadas en transacciones
 */
export const calcularProyecciones = (transacciones: Transaccion[]) => {
    const totalIngresos = transacciones
        .filter(t => t.tipo === 'Ingreso')
        .reduce((acc, curr) => acc + curr.monto, 0);

    const totalGastos = transacciones
        .filter(t => t.tipo === 'Gasto')
        .reduce((acc, curr) => acc + curr.monto, 0);

    const totalAbonosDeuda = transacciones
        .filter(t => t.tipo === 'Abono Deuda')
        .reduce((acc, curr) => acc + curr.monto, 0);

    const balance = totalIngresos - totalGastos - totalAbonosDeuda;

    return {
        totalIngresos,
        totalGastos,
        totalAbonosDeuda,
        balance,
    };
};

/**
 * Agrupa gastos por categoría
 */
export const agruparPorCategoria = (transacciones: Transaccion[]) => {
    const gastos = transacciones.filter(t => t.tipo === 'Gasto');

    const agrupado = gastos.reduce((acc, curr) => {
        if (!acc[curr.categoria]) {
            acc[curr.categoria] = 0;
        }
        acc[curr.categoria] += curr.monto;
        return acc;
    }, {} as Record<string, number>);

    return Object.entries(agrupado).map(([categoria, monto]) => ({
        categoria,
        monto,
    }));
};

// ============================================
// NUEVOS TIPOS PARA FUNCIONALIDADES AVANZADAS
// ============================================

export type Credito = {
    id: string;
    nombre: string;
    montoTotal: number;
    saldoActual: number;
    tasaInteres: number;
    plazoMeses: number;
    pagoMensual: number;
    fechaInicio: string;
    tipoTasa?: 'Mensual' | 'EA';
    usuario?: 'Andrés' | 'Mariana';
};

export type MetaAhorro = {
    id: string;
    nombre: string;
    montoObjetivo: number;
    montoActual: number;
    fechaLimite: string;
    prioridad: 'Alta' | 'Media' | 'Baja';
    usuario?: 'Andrés' | 'Mariana';
};

export type PagoAmortizacion = {
    mes: number;
    pagoTotal: number;
    capital: number;
    interes: number;
    saldoRestante: number;
};

export type DatosMensuales = {
    mes: string; // YYYY-MM
    ingresos: number;
    gastos: number;
    balance: number;
    abonosDeuda: number;
};

// ============================================
// FUNCIONES DE ANÁLISIS MENSUAL
// ============================================

export const agruparPorMes = (transacciones: Transaccion[]): DatosMensuales[] => {
    const mesesMap = new Map<string, DatosMensuales>();

    transacciones.forEach(t => {
        const mes = t.fecha.substring(0, 7); // YYYY-MM

        if (!mesesMap.has(mes)) {
            mesesMap.set(mes, {
                mes,
                ingresos: 0,
                gastos: 0,
                balance: 0,
                abonosDeuda: 0,
            });
        }

        const datos = mesesMap.get(mes)!;

        if (t.tipo === 'Ingreso') {
            datos.ingresos += t.monto;
        } else if (t.tipo === 'Gasto') {
            datos.gastos += t.monto;
        } else if (t.tipo === 'Abono Deuda') {
            datos.abonosDeuda += t.monto;
        }
    });

    mesesMap.forEach(datos => {
        datos.balance = datos.ingresos - datos.gastos - datos.abonosDeuda;
    });

    return Array.from(mesesMap.values()).sort((a, b) => b.mes.localeCompare(a.mes));
};

export const filtrarPorMes = (transacciones: Transaccion[], mes: string): Transaccion[] => {
    return transacciones.filter(t => t.fecha.startsWith(mes));
};

export const calcularCambioMensual = (mesActual: DatosMensuales, mesAnterior: DatosMensuales | null) => {
    if (!mesAnterior) {
        return { ingresos: 0, gastos: 0, balance: 0 };
    }

    const calcularPorcentaje = (actual: number, anterior: number) => {
        if (anterior === 0) return actual > 0 ? 100 : 0;
        return ((actual - anterior) / anterior) * 100;
    };

    return {
        ingresos: calcularPorcentaje(mesActual.ingresos, mesAnterior.ingresos),
        gastos: calcularPorcentaje(mesActual.gastos, mesAnterior.gastos),
        balance: calcularPorcentaje(mesActual.balance, mesAnterior.balance),
    };
};

export const calcularAmortizacion = (credito: {
    monto: number;
    tasaAnual: number;
    plazoMeses: number;
    tipoTasa?: 'Mensual' | 'EA';
}): PagoAmortizacion[] => {
    const { monto, tasaAnual, plazoMeses, tipoTasa } = credito;
    let tasaMensual = 0;

    if (tipoTasa === 'Mensual') {
        tasaMensual = tasaAnual / 100;
    } else {
        tasaMensual = Math.pow(1 + (tasaAnual / 100), 1 / 12) - 1;
    }

    const pagoMensual = monto * (tasaMensual * Math.pow(1 + tasaMensual, plazoMeses)) /
        (Math.pow(1 + tasaMensual, plazoMeses) - 1);

    const tabla: PagoAmortizacion[] = [];
    let saldoRestante = monto;

    for (let mes = 1; mes <= plazoMeses; mes++) {
        const interes = saldoRestante * tasaMensual;
        const capital = pagoMensual - interes;
        saldoRestante -= capital;

        tabla.push({
            mes,
            pagoTotal: pagoMensual,
            capital,
            interes,
            saldoRestante: Math.max(0, saldoRestante),
        });
    }

    return tabla;
};

export const calcularProgresoMeta = (meta: MetaAhorro): number => {
    return Math.min(100, (meta.montoActual / meta.montoObjetivo) * 100);
};

export const calcularDiasRestantes = (fechaLimite: string): number => {
    const hoy = new Date();
    const limite = new Date(fechaLimite);
    const hoyUTC = Date.UTC(hoy.getFullYear(), hoy.getMonth(), hoy.getDate());
    const limiteUTC = Date.UTC(limite.getFullYear(), limite.getMonth(), limite.getDate());
    const diferenciaMs = limiteUTC - hoyUTC;
    const dias = Math.ceil(diferenciaMs / (1000 * 60 * 60 * 24));
    return isNaN(dias) ? 0 : dias;
};
