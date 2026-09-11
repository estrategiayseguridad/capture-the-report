# Excel

Módulo Node.js invocado desde `POST /api/reportes/importar`.

- `excel.service.ts`: lee el workbook con SheetJS y reúne tickets, errores, advertencias y conteos.
- `sheet-detection.ts`: identifica la primera hoja con las siete columnas requeridas y conserva el mapa de encabezados.
- `normalization.ts`: números decimales, fechas de Excel sin desplazamiento horario, estados, prioridades y tipos.
- `ticket-mapper.ts`: transforma cada fila identificable en `Ticket` y documenta valores inválidos.

Time to Respond conserva sus horas originales y crea minutos mediante multiplicación por 60. Time to Resolve permanece en horas. No se redondea la precisión interna. Las duraciones vacías, negativas o inválidas son `null`, nunca un cero inventado.

No almacena archivos, no usa Prisma, no consulta recursos externos ni evalúa fórmulas o macros. Los XLSX con partes de macros o vínculos a otros libros se rechazan. Ver límites y decisiones en [la guía de importación](../../../docs/IMPORTACION-XLSX.md).
