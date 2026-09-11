# Gráficas

`chart-data.service.ts` transforma tickets importados en datos independientes de React:

- `getTicketStatusChartData`: cuenta Closed, With User y Open, incluyendo ceros. Devuelve otros estados por separado para advertir sobre su exclusión de las barras.
- `getPeriodTicketsChartData`: agrupa tipo y severidad, ordena las categorías conocidas y conserva las desconocidas.
- `periodToBarData`: adapta las combinaciones a etiquetas legibles para el componente de barras.

Las funciones reciben `readonly Ticket[]` y crean resultados nuevos. No leen XLSX, no modifican tickets, no calculan SLA y no acceden a Prisma ni al navegador. Los formularios y Chart.js están en `components/charts`; la configuración aplicada vive temporalmente en `ReportImport`.

Los datos podrán reutilizarse para una futura exportación PNG, todavía no implementada. Consulta [la guía de gráficas](../../../docs/GRAFICAS.md).
