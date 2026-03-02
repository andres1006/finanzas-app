## 1. Datos Iniciales y Semilla

- [x] 1.1 Crear script de semilla o cargar manualmente la lista base en `Plantilla_Gastos`. <!-- id: 5 -->
- [x] 1.2 Verificar que los 23 ítems iniciales aparezcan correctamente en la interfaz de Catálogo. <!-- id: 6 -->

## 2. Lógica de Backend (API)

- [/] 2.1 Refactorizar la lógica de creación de plan desde plantilla en `app/api/budget/plan/route.ts`. <!-- id: 7 -->
- [/] 2.2 Implementar verificación de duplicados por (Mes, Concepto) en la creación del plan. <!-- id: 8 -->
- [ ] 2.3 Exponer un endpoint o parámetro para "asegurar" el plan de un mes específico (trigger de auto-load). <!-- id: 9 -->

## 3. Hooks y Automatización en Frontend

- [ ] 3.1 Crear el hook `useAutoLoadBudget` que detecte si el plan del mes actual o próximo (si día >= 29) debe cargarse.
- [ ] 3.2 Integrar el hook en el componente `Dashboard` o un layout global.

## 4. Mejoras en la Interfaz de Usuario (UI)

- [ ] 4.1 Actualizar `BudgetPlanner.tsx` para permitir la edición del monto en ítems ya cargados en la planeación.
- [ ] 4.2 Asegurar que el widget `PendingObligations.tsx` refresque los datos tras una carga automática.

## 5. Verificación y Pruebas

- [ ] 5.1 Realizar pruebas manuales simulando cambio de fecha al día 29.
- [ ] 5.2 Verificar que no se creen duplicados al recargar la página múltiples veces.
