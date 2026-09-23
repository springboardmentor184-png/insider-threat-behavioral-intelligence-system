import { useEffect } from "react";
import { useRouter } from "next/router";
import { getRole } from "../../utils/api";

const roleRouteMap = {
  security_analyst: "/dashboard/analyst",
  soc_engineer: "/dashboard/soc",
  security_manager: "/dashboard/manager",
  administrator: "/dashboard/admin",
};

export default function DashboardIndex() {
  const router = useRouter();

  useEffect(() => {
    const role = getRole();
    if (!role) {
      router.replace("/login");
      return;
    }
    router.replace(roleRouteMap[role] || "/login");
  }, [router]);

  return <div className="min-h-screen flex items-center justify-center">Redirecting...</div>;
}