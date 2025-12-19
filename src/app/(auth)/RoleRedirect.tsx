"use client";

import { useSession } from "next-auth/react";
import { useRouter, usePathname } from "next/navigation";
import { useEffect } from "react";

export default function RoleRedirect() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    if (status !== "authenticated") return;

    const userRoleId = session.user?.role_id;

    // Admin redirect - only if not already on admin pages
    if (userRoleId === 1 && !pathname.startsWith("/admin")) {
      router.push("/admin");
      return;
    }

    // Driver redirect - only if not already on driver pages
    if (userRoleId === 3 && !pathname.startsWith("/driver")) {
      router.push("/driver");
      return;
    }

    // Customer (role_id === 2) - no forced redirect here
    // Customers can browse public pages (/home, /services, /pricing)
    // Subscription check is handled in dashboard layout when they try to access /dashboard
  }, [status, session, router, pathname]);

  return null;
}
