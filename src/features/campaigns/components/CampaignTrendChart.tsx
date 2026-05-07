"use client";

import {
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { formatCompact, formatCurrency } from "@/shared/format/numbers";

type ChartTab = "spend" | "clicks" | "impressions" | "conversions";

type ChartDatum = {
  date: string;
  spend: number;
  clicks: number;
  impressions: number;
  conversions: number;
};

function ChartTooltip({
  active,
  payload,
  label,
  tab,
}: {
  active?: boolean;
  payload?: { value: number }[];
  label?: string;
  tab: ChartTab;
}) {
  if (!active || !payload?.length) return null;
  const val = payload[0].value;

  return (
    <div className="rounded-lg border border-border bg-card px-3 py-2 shadow-sm">
      <p className="mb-1 text-xs text-muted-foreground">{label}</p>
      <p className="text-sm font-semibold">
        {tab === "spend" ? formatCurrency(val) : formatCompact(val)}
      </p>
    </div>
  );
}

export function CampaignTrendChart({
  data,
  activeChart,
}: {
  data: ChartDatum[];
  activeChart: ChartTab;
}) {
  return (
    <ResponsiveContainer width="100%" height={260}>
      <LineChart data={data} margin={{ top: 4, right: 8, left: -16, bottom: 0 }}>
        <CartesianGrid
          strokeDasharray="3 3"
          vertical={false}
          stroke="hsl(var(--border))"
        />
        <XAxis
          dataKey="date"
          tick={{ fontSize: 11, fill: "hsl(var(--muted-foreground))" }}
          axisLine={false}
          tickLine={false}
          interval="preserveStartEnd"
        />
        <YAxis
          tick={{ fontSize: 11, fill: "hsl(var(--muted-foreground))" }}
          axisLine={false}
          tickLine={false}
          tickFormatter={(value) =>
            activeChart === "spend" ? formatCurrency(value) : formatCompact(value)
          }
        />
        <Tooltip content={<ChartTooltip tab={activeChart} />} />
        <Line
          type="monotone"
          dataKey={activeChart}
          stroke="hsl(var(--primary))"
          strokeWidth={2}
          dot={false}
          activeDot={{ r: 4, strokeWidth: 0 }}
        />
      </LineChart>
    </ResponsiveContainer>
  );
}
