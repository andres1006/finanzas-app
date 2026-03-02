## Why

Actualmente, el usuario debe inicializar manualmente el plan de gastos mensual desde la plantilla. El usuario desea un "catálogo" de gastos recurrentes (Arriendo, Servicios, Créditos, etc.) que se "cargue" automáticamente en la lista de obligaciones pendientes el día 29 de cada mes, preparándolo para el pago en el mes siguiente.

## What Changes

- **Gestión de Catálogo**: Mejorar la interfaz de "Plantilla" existente para que actúe como un "Catálogo de Gastos Recurrentes" formal.
- **Inicialización Mensual Automática**: Implementar la lógica para crear automáticamente el plan en `Planeacion_Gastos` para el mes objetivo basándose en el catálogo de `Plantilla_Gastos`.
- **Lógica de Activación**:
  - El día 29 de cada mes $N$, generar automáticamente el plan para el mes $N+1$.
  - Asegurar que si el usuario abre la aplicación en un nuevo mes $M$ y no existe un plan, se genere inmediatamente.
- **Datos Iniciales**: Poblar el catálogo con la lista base proporcionada por el usuario (Arriendo, Agua, Internet, Créditos, etc.).

## Capabilities

### New Capabilities
- `recurring-catalog`: Gestionar la lista maestra de gastos recurrentes.
- `auto-loading-service`: Lógica interna para asegurar que el plan mensual esté sincronizado con el catálogo en el momento adecuado.

### Modified Capabilities
- `budget-planner`: Actualizar para mostrar el estado de los ítems auto-cargados y permitir editar los montos específicos para el mes actual (por ejemplo, servicios variables como agua/electricidad).

## Impact

- **Base de Datos (Google Sheets)**: Utiliza `Plantilla_Gastos` (Catálogo) y `Planeacion_Gastos` (instancias mensuales).
- **UI**: Vistas mejoradas en `/dashboard/planeacion` y widgets del tablero.
- **Backend**: Nueva lógica en `app/api/budget/plan/route.ts` o un servicio compartido para manejar la sincronización.
