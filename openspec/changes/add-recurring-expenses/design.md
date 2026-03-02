## Context

El sistema actual cuenta con `Plantilla_Gastos` (catálogo base) y `Planeacion_Gastos` (instancia mensual de gastos). Actualmente, la transición de plantilla a plan es manual. El usuario requiere que esto sea automático cerca del fin de mes (día 29) para facilitar el pago de obligaciones recurrentes.

## Goals / Non-Goals

**Goals:**
- Automatizar la creación de registros en `Planeacion_Gastos` desde `Plantilla_Gastos`.
- Centralizar la gestión de gastos recurrentes en una interfaz de "Catálogo".
- Asegurar que el dashboard siempre muestre las obligaciones pendientes del mes en curso o próximo (si ya es fin de mes).

**Non-Goals:**
- No se implementará el pago automático real (dinero moviéndose); solo el registro del pago en el sistema.
- No se manejarán frecuencias complejas (semanales, quincenales) en esta fase (solo mensuales).

## Decisions

### 1. Mecanismo de Activación: Lazy Loading en el Cliente
- **Decisión**: La lógica de "carga automática" se ejecutará cuando el usuario acceda al Dashboard o a la vista de Planeación.
- **Razón**: Evita la necesidad de configurar servicios de cron externos y garantiza que el plan se cree justo cuando el usuario lo necesita.
- **Alternativa**: Cron Job en el servidor. Descartado por simplicidad y portabilidad del proyecto actual.

### 2. Lógica de Selección de Mes (Día 29)
- **Decisión**: 
  - Si la fecha actual es $\geq 29$, el sistema verifica/crea el plan del **mes siguiente**.
  - Si es $< 29$, el sistema asegura que el plan del **mes actual** existe.
- **Razón**: Permite al usuario empezar a ver y presupuestar las deudas del próximo mes unos días antes de que termine el actual (como el arriendo que se paga el 1ero).

### 3. Persistencia en Google Sheets
- **Decisión**: Seguir utilizando las hojas `Plantilla_Gastos` y `Planeacion_Gastos`.
- **Razón**: Mantener consistencia con el backend basado en `lib/googleSheets.ts`.

## Risks / Trade-offs

- **[Riesgo] Duplicidad**: Si varios usuarios abren el app al mismo tiempo, podrían intentarse creaciones duplicadas.
- **Mitigación**: El API de `budget/plan` verificará la existencia de registros para el par (Mes, Concepto) antes de insertar, o se usará un bloqueo simple si la librería lo permite.
- **[Riesgo] Gastos Variables**: Algunos recurrentes como "Agua" cambian de monto cada mes.
- **Mitigación**: El catálogo guardará un "Monto Estimado", pero el usuario podrá ajustar el valor en la Planeación antes de marcarlo como "Pagado".

## Migration Plan

1. **Seed Data**: Ejecutar una tarea única para cargar los 20 ítems base proporcionados por el usuario en `Plantilla_Gastos`.
2. **Actualización de API**: Modificar `POST /api/budget/plan` para manejar la lógica de verificación de duplicados.
3. **Implementación de Hook**: Crear un hook `useAutoLoadBudget` que se use en el Layout principal o Dashboard.
