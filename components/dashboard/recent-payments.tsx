import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { getPaymentBadgeVariant } from "@/lib/utils/constants";
import { formatCurrency, formatDate } from "@/lib/utils/format";
import type { PaymentWithProject } from "@/lib/types";

interface RecentPaymentsProps {
  payments: PaymentWithProject[];
  limit?: number;
}

export function RecentPayments({ payments, limit = 10 }: RecentPaymentsProps) {
  const recent = payments.slice(0, limit);

  return (
    <Card>
      <CardHeader>
        <CardTitle>Recent payments</CardTitle>
      </CardHeader>
      <CardContent>
        {recent.length === 0 ? (
          <p className="text-sm text-zinc-500">No payments yet.</p>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Project</TableHead>
                <TableHead>Date</TableHead>
                <TableHead>Amount</TableHead>
                <TableHead>Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {recent.map((payment) => (
                <TableRow key={`${payment.projectId}-${payment.id}`}>
                  <TableCell>
                    <Link
                      href={`/projects/${payment.projectId}`}
                      className="font-medium hover:underline"
                    >
                      {payment.projectName}
                    </Link>
                  </TableCell>
                  <TableCell>{formatDate(payment.date)}</TableCell>
                  <TableCell>
                    {formatCurrency(payment.amount, payment.currency)}
                  </TableCell>
                  <TableCell>
                    <Badge variant={getPaymentBadgeVariant(payment.status)}>
                      {payment.status}
                    </Badge>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </CardContent>
    </Card>
  );
}
