import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { formatCurrency } from "@/lib/utils/format";
import { getStatusBadgeVariant } from "@/lib/utils/constants";
import type { Project } from "@/lib/types";

interface ProjectCardProps {
  project: Project;
  totalPaid?: number;
  pendingAmount?: number;
}

export function ProjectCard({
  project,
  totalPaid = 0,
  pendingAmount = 0,
}: ProjectCardProps) {
  return (
    <Link href={`/projects/${project.id}`}>
      <Card className="transition-shadow hover:shadow-md">
        <CardHeader>
          <div className="flex items-start justify-between gap-3">
            <div>
              <CardTitle>{project.name}</CardTitle>
              <CardDescription>{project.client}</CardDescription>
            </div>
            <Badge variant={getStatusBadgeVariant(project.status)}>
              {project.status}
            </Badge>
          </div>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="grid grid-cols-3 gap-3 text-sm">
            <div>
              <p className="text-zinc-500">Amount</p>
              <p className="font-medium">
                {project.amount != null
                  ? formatCurrency(project.amount, project.currency)
                  : "—"}
              </p>
            </div>
            <div>
              <p className="text-zinc-500">Earned</p>
              <p className="font-medium text-emerald-700">
                {formatCurrency(totalPaid, project.currency)}
              </p>
            </div>
            <div>
              <p className="text-zinc-500">Pending</p>
              <p className="font-medium text-amber-700">
                {formatCurrency(pendingAmount, project.currency)}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-1 text-sm text-zinc-600">
            View details
            <ArrowRight className="h-4 w-4" />
          </div>
        </CardContent>
      </Card>
    </Link>
  );
}
