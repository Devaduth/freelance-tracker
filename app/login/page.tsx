"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { LoginForm } from "@/components/auth/login-form";
import { useAuthContext } from "@/components/auth/auth-provider";
import { Skeleton } from "@/components/ui/skeleton";

export default function LoginPage() {
  const { user, loading } = useAuthContext();
  const router = useRouter();

  useEffect(() => {
    if (!loading && user) {
      router.replace("/dashboard");
    }
  }, [loading, user, router]);

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-zinc-50 p-6">
        <Skeleton className="h-64 w-full max-w-md" />
      </div>
    );
  }

  if (user) return null;

  return (
    <div className="flex min-h-screen items-center justify-center bg-zinc-50 p-6">
      <LoginForm />
    </div>
  );
}
