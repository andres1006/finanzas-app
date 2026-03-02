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
 * Ordena las deudas por saldo menor primero y asigna el dinero extra
 */
export const calcularBolaDeNieve = (deudas: Deuda[], dineroExtra: number) => {
    // Ordenar por saldo menor primero (Bola de Nieve)
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
    tasaInteres: number; // % anual o mensual según tipoTasa
    plazoMeses: number;
    pagoMensual: number;
    fechaInicio: string;
    tipoTasa?: 'Mensual' | 'EA';
};

export type Inversion = {
    id: string;
    nombre: string;
    tipo: 'CDT' | 'Acciones' | 'Fondos' | 'Crypto' | 'Otro';
    montoInicial: number;
    valorActual: number;
    rendimientoEsperado: number; // % anual
    fechaInicio: string;
};

export type MetaAhorro = {
    id: string;
    nombre: string;
    montoObjetivo: number;
    montoActual: number;
    fechaLimite: string;
    prioridad: 'Alta' | 'Media' | 'Baja';
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

/**
 * Agrupa transacciones por mes
 */
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

    // Calcular balance
    mesesMap.forEach(datos => {
        datos.balance = datos.ingresos - datos.gastos - datos.abonosDeuda;
    });

    // Ordenar por mes (más reciente primero)
    return Array.from(mesesMap.values()).sort((a, b) => b.mes.localeCompare(a.mes));
};

/**
 * Filtra transacciones por mes específico
 */
export const filtrarPorMes = (transacciones: Transaccion[], mes: string): Transaccion[] => {
    return transacciones.filter(t => t.fecha.startsWith(mes));
};

/**
 * Calcula el cambio porcentual entre dos meses
 */
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

// ============================================
// FUNCIONES DE CRÉDITOS
// ============================================

/**
 * Calcula la tabla de amortización de un crédito
 */
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
        // Asumimos Efectiva Anual (EA)
        // Fórmula: (1 + EA)^(1/12) - 1
        tasaMensual = Math.pow(1 + (tasaAnual / 100), 1 / 12) - 1;
    }

    // Fórmula de pago mensual: M = P * [i(1 + i)^n] / [(1 + i)^n - 1]
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
            saldoRestante: Math.max(0, saldoRestante), // Evitar negativos por redondeo
        });
    }

    return tabla;
};

/**
 * Calcula el total de intereses de un crédito
 */
export const calcularTotalIntereses = (tabla: PagoAmortizacion[]): number => {
    return tabla.reduce((total, pago) => total + pago.interes, 0);
};

/**
 * Calcula el ahorro en intereses al hacer un pago extra
 */
export const calcularAhorroConPagoExtra = (
    credito: { monto: number; tasaAnual: number; plazoMeses: number },
    pagoExtra: number
): { ahorroIntereses: number; mesesAhorrados: number } => {
    const tablaOriginal = calcularAmortizacion(credito);
    const interesesOriginales = calcularTotalIntereses(tablaOriginal);

    // Calcular con pago extra (reducir el monto inicial)
    const tablaNueva = calcularAmortizacion({
        ...credito,
        monto: credito.monto - pagoExtra,
    });
    const interesesNuevos = calcularTotalIntereses(tablaNueva);

    return {
        ahorroIntereses: interesesOriginales - interesesNuevos,
        mesesAhorrados: tablaOriginal.length - tablaNueva.length,
    };
};

// ============================================
// FUNCIONES DE INVERSIONES
// ============================================

/**
 * Calcula el rendimiento de una inversión
 */
export const calcularRendimientoInversion = (inversion: Inversion): number => {
    return ((inversion.valorActual - inversion.montoInicial) / inversion.montoInicial) * 100;
};

/**
 * Proyecta el valor futuro de una inversión
 */
export const proyectarInversion = (
    montoInicial: number,
    rendimientoAnual: number,
    años: number
): { año: number; valor: number }[] => {
    const proyeccion: { año: number; valor: number }[] = [];
    let valorActual = montoInicial;

    for (let año = 0; año <= años; año++) {
        proyeccion.push({ año, valor: valorActual });
        valorActual *= (1 + rendimientoAnual / 100);
    }

    return proyeccion;
};

/**
 * Calcula el ROI (Return on Investment)
 */
export const calcularROI = (montoInicial: number, valorActual: number): number => {
    return ((valorActual - montoInicial) / montoInicial) * 100;
};

// ============================================
// FUNCIONES DE METAS DE AHORRO
// ============================================

/**
 * Calcula el ahorro mensual necesario para alcanzar una meta
 */
export const calcularAhorroMensualNecesario = (meta: MetaAhorro): number => {
    const montoFaltante = meta.montoObjetivo - meta.montoActual;
    const fechaActual = new Date();
    const fechaLimite = new Date(meta.fechaLimite);

    const mesesRestantes = Math.max(1,
        (fechaLimite.getFullYear() - fechaActual.getFullYear()) * 12 +
        (fechaLimite.getMonth() - fechaActual.getMonth())
    );

    return montoFaltante / mesesRestantes;
};

/**
 * Calcula el progreso de una meta (0-100%)
 */
export const calcularProgresoMeta = (meta: MetaAhorro): number => {
    return Math.min(100, (meta.montoActual / meta.montoObjetivo) * 100);
};

/**
 * Estima la fecha de cumplimiento de una meta dado un ahorro mensual
 */
export const estimarFechaCumplimiento = (
    meta: MetaAhorro,
    ahorroMensual: number
): Date | null => {
    const montoFaltante = meta.montoObjetivo - meta.montoActual;

    if (ahorroMensual <= 0 || montoFaltante <= 0) {
        return null;
    }

    const mesesNecesarios = Math.ceil(montoFaltante / ahorroMensual);
    const fechaEstimada = new Date();
    fechaEstimada.setMonth(fechaEstimada.getMonth() + mesesNecesarios);

    return fechaEstimada;
};
