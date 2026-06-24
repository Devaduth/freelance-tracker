import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { formatCurrency } from "@/lib/utils/format";

interface StatCardsProps {
  totalEarned: number;
  thisMonth: number;
  thisYear: number;
  pendingAmount: number;
  currency?: string;
}

export function StatCards({
  totalEarned,
  thisMonth,
  thisYear,
  pendingAmount,
  currency = "INR",
}: StatCardsProps) {
  const stats = [
    { label: "Total earned", value: totalEarned },
    { label: "This month", value: thisMonth },
    { label: "This year", value: thisYear },
    { label: "Pending", value: pendingAmount },
  ];

  return (
    <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
      {stats.map((stat) => (
        <Card key={stat.label}>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-zinc-500">
              {stat.label}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-semibold">
              {formatCurrency(stat.value, currency)}
            </p>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
