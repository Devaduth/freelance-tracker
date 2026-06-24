"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuthContext } from "@/components/auth/auth-provider";
import { Skeleton } from "@/components/ui/skeleton";

export default function HomePage() {
  const { user, loading } = useAuthContext();
  const router = useRouter();

  useEffect(() => {
    if (!loading) {
      router.replace(user ? "/dashboard" : "/login");
    }
  }, [loading, user, router]);

  return (
    <div className="flex min-h-screen items-center justify-center bg-zinc-50">
      <Skeleton className="h-10 w-48" />
    </div>
  );
}
