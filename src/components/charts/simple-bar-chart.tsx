"use client";

import { Bar } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Tooltip,
  type Plugin,
  type ChartOptions,
} from "chart.js";
import type { ReportChartData } from "@/types/chart";

ChartJS.register(CategoryScale, LinearScale, BarElement, Tooltip);

const valueLabels: Plugin<"bar"> = {
  id: "cscValueLabels",
  afterDatasetsDraw(chart) {
    const { ctx } = chart;
    ctx.save();
    ctx.fillStyle = "#0f172a";
    ctx.font = "600 13px sans-serif";
    ctx.textAlign = "center";
    chart.getDatasetMeta(0).data.forEach((bar, index) => {
      const value = chart.data.datasets[0]?.data[index];
      if (typeof value === "number")
        ctx.fillText(
          String(value),
          bar.x,
          Math.max(chart.chartArea.top + 12, bar.y - 8),
        );
    });
    ctx.restore();
  },
};

function wrapLabel(label: string): string[] {
  // Also break uninterrupted names so they cannot overlap adjacent categories.
  const words = label.match(/\S{1,19}/g) ?? [label];
  const lines: string[] = [];
  for (const word of words) {
    const last = lines.length - 1;
    if (last >= 0 && lines[last].length + word.length < 20)
      lines[last] += ` ${word}`;
    else lines.push(word);
  }
  return lines;
}

export function SimpleBarChart({ data }: { data: ReportChartData }) {
  const labels = data.items.map((item) => wrapLabel(item.label));
  const options: ChartOptions<"bar"> = {
    responsive: true,
    maintainAspectRatio: false,
    animation: false,
    layout: { padding: { top: 20 } },
    plugins: { legend: { display: false } },
    scales: {
      x: {
        grid: { display: false },
        ticks: { autoSkip: false, maxRotation: 0, color: "#475569" },
      },
      y: {
        min: 0,
        beginAtZero: true,
        suggestedMax: 1,
        grace: "15%",
        ticks: { precision: 0 },
        grid: { color: "#e2e8f0" },
        title: { display: true, text: "Cantidad de tickets" },
      },
    },
  };
  return (
    <section
      aria-label={`Vista previa: ${data.title}`}
      className="min-w-0 rounded-xl border bg-white p-4"
    >
      <h3 className="text-sm font-semibold tracking-wide">{data.title}</h3>
      <div className="mt-4 overflow-x-auto">
        <div
          className="relative w-full"
          style={{
            minWidth: Math.max(320, data.items.length * 145),
            height:
              310 + Math.max(...labels.map((label) => label.length), 1) * 15,
          }}
        >
          <Bar
            role="img"
            aria-label={data.title}
            options={options}
            plugins={[valueLabels]}
            data={{
              labels,
              datasets: [
                {
                  label: "Tickets",
                  data: data.items.map((item) => item.value),
                  backgroundColor: "#0f766e",
                  borderRadius: 4,
                  maxBarThickness: 58,
                },
              ],
            }}
          />
        </div>
      </div>
      <details className="mt-3 text-sm">
        <summary className="cursor-pointer text-muted-foreground">
          Ver datos de la gráfica
        </summary>
        <table
          aria-label={`Datos: ${data.title}`}
          className="mt-3 w-full text-left"
        >
          <thead>
            <tr>
              <th className="py-2">Categoría</th>
              <th className="py-2 text-right">Tickets</th>
            </tr>
          </thead>
          <tbody>
            {data.items.map((item, index) => (
              <tr key={index} className="border-t">
                <td className="break-all py-2">{item.label}</td>
                <td className="text-right">{item.value}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </details>
    </section>
  );
}
