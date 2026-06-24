"use client";

import {
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { formatCurrency } from "@/lib/utils/format";

interface ProjectBreakdownProps {
  data: Array<{ name: string; total: number }>;
  currency?: string;
}

export function ProjectBreakdown({
  data,
  currency = "INR",
}: ProjectBreakdownProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Income by project</CardTitle>
      </CardHeader>
      <CardContent className="h-80">
        {data.length === 0 ? (
          <p className="text-sm text-zinc-500">No paid payments yet.</p>
        ) : (
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={data} layout="vertical">
              <CartesianGrid strokeDasharray="3 3" horizontal={false} />
              <XAxis type="number" tick={{ fontSize: 12 }} />
              <YAxis
                type="category"
                dataKey="name"
                width={120}
                tick={{ fontSize: 12 }}
              />
              <Tooltip
                formatter={(value) =>
                  formatCurrency(Number(value ?? 0), currency)
                }
              />
              <Bar dataKey="total" fill="#059669" radius={[0, 4, 4, 0]} />
            </BarChart>
          </ResponsiveContainer>
        )}
      </CardContent>
    </Card>
  );
}
