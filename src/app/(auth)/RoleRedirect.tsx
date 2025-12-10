"use client";

import { useSession } from "next-auth/react";
import { useRouter, usePathname } from "next/navigation";
import { useEffect } from "react";

export default function RoleRedirect() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    if (status === "authenticated") {
      const userRoleId = session.user?.role_id;

      if (userRoleId === 1 && !pathname.startsWith("/admin")) {
        router.push("/admin");
      } else if (userRoleId === 2 && !pathname.startsWith("/dashboard")) {
        router.push("/dashboard");
      } else if (userRoleId === 3 && !pathname.startsWith("/driver")) {
        router.push("/driver");
      }
    }
  }, [status, session, router, pathname]);

  return null;
}
