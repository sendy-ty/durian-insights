import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { Card } from "@/components/ui/card";

interface DetectionChartProps {
  data?: Array<{ date?: string; trees?: number }>;
  isLoading?: boolean;
}

export function DetectionChart({ data, isLoading }: DetectionChartProps) {
  if (isLoading) {
    return (
      <div className="w-full h-full bg-muted/20 animate-pulse rounded-lg" />
    );
  }

  const chartData = data && data.length > 0
    ? data.map((d) => ({
      date: d.date || "",
      trees: d.trees || 0,
    }))
    : [
      { date: "Senin", trees: 0 },
      { date: "Selasa", trees: 0 }
    ];

  return (
    <div className="w-full h-full mt-2">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart
          data={chartData}
          margin={{ top: 0, right: 0, left: -25, bottom: 0 }}
        >
          <CartesianGrid
            strokeDasharray="3 3"
            stroke="currentColor"
            className="text-gray-200 dark:text-gray-700"
            vertical={false}
          />
          <XAxis
            dataKey="date"
            axisLine={false}
            tickLine={false}
            tick={{ fill: "currentColor", fontSize: 11 }}
            className="text-gray-400 dark:text-gray-500"
            tickFormatter={(d) => {
              const dateObj = new Date(d);
              return isNaN(dateObj.getTime()) ? d : dateObj.toLocaleDateString("id-ID", {
                day: "2-digit",
                month: "short"
              });
            }}
            dy={10}
          />
          <YAxis
            axisLine={false}
            tickLine={false}
            tick={{ fill: "currentColor", fontSize: 11 }}
            className="text-gray-400 dark:text-gray-500"
          />
          <Tooltip
            cursor={{ fill: "currentColor", opacity: 0.1 }}
            content={({ active, payload, label }) => {
              if (active && payload && payload.length) {
                const item = payload[0].payload;
                return (
                  <div className="bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700 p-2 rounded-lg shadow-xl">
                    <p className="text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">{label}</p>
                    <p className="text-sm font-bold text-green-600 dark:text-green-400">{item.trees} Pohon</p>
                  </div>
                );
              }
              return null;
            }}
          />
          <Bar
            dataKey="trees"
            radius={[4, 4, 0, 0]}
            fill="#22c55e"
          />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
