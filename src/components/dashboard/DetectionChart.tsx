import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

const defaultData = [
  { month: "Jan", pohon: 890 },
  { month: "Feb", pohon: 1020 },
  { month: "Mar", pohon: 1150 },
  { month: "Apr", pohon: 1080 },
  { month: "Mei", pohon: 1247 },
  { month: "Jun", pohon: 1320 },
];

interface DetectionChartProps {
  /** Optional trend data from the backend. Falls back to sample data if not provided. */
  data?: Array<{ period: string; count: number }>;
}

export function DetectionChart({ data }: DetectionChartProps) {
  // Map backend shape { period, count } to chart shape { month, pohon }
  const chartData = data && data.length > 0
    ? data.map((d) => ({ month: d.period, pohon: d.count }))
    : defaultData;

  return (
    <div className="h-[300px] w-full">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart
          data={chartData}
          margin={{ top: 10, right: 30, left: 0, bottom: 0 }}
        >
          <defs>
            <linearGradient id="colorPohon" x1="0" y1="0" x2="0" y2="1">
              <stop
                offset="5%"
                stopColor="hsl(var(--primary))"
                stopOpacity={0.3}
              />
              <stop
                offset="95%"
                stopColor="hsl(var(--primary))"
                stopOpacity={0}
              />
            </linearGradient>
          </defs>
          <CartesianGrid
            strokeDasharray="3 3"
            stroke="hsl(var(--border))"
            vertical={false}
          />
          <XAxis
            dataKey="month"
            axisLine={false}
            tickLine={false}
            tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 12 }}
          />
          <YAxis
            axisLine={false}
            tickLine={false}
            tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 12 }}
          />
          <Tooltip
            contentStyle={{
              backgroundColor: "hsl(var(--card))",
              border: "1px solid hsl(var(--border))",
              borderRadius: "8px",
              boxShadow: "var(--shadow-md)",
            }}
            labelStyle={{ color: "hsl(var(--foreground))", fontWeight: 600 }}
            itemStyle={{ color: "hsl(var(--primary))" }}
          />
          <Area
            type="monotone"
            dataKey="pohon"
            stroke="hsl(var(--primary))"
            strokeWidth={2}
            fillOpacity={1}
            fill="url(#colorPohon)"
            name="Pohon Terdeteksi"
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}
