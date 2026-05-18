"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { isAdmin, isAuthenticated } from "@/lib/auth";

interface AuthGuardProps {
  children: React.ReactNode;
  requireAdmin?: boolean;
}

/** Client-side route protection (JWT in localStorage). */
export default function AuthGuard({ children, requireAdmin }: AuthGuardProps) {
  const router = useRouter();
  const [ready, setReady] = useState(false);

  useEffect(() => {
    if (!isAuthenticated()) {
      router.replace("/login");
      return;
    }
    if (requireAdmin && !isAdmin()) {
      router.replace("/dashboard");
      return;
    }
    setReady(true);
  }, [router, requireAdmin]);

  if (!ready) {
    return (
      <div className="flex min-h-[40vh] items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-brand-500 border-t-transparent" />
      </div>
    );
  }

  return <>{children}</>;
}
