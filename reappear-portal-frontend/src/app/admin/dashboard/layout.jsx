"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

export default function AdminDashboardLayout({ children }) {
  const router = useRouter();
  const [isAuthorized, setIsAuthorized] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem("token");
    const userStr = localStorage.getItem("user");
    
    if (!token || !userStr) {
      router.replace("/");
      return;
    }

    try {
      const user = JSON.parse(userStr);
      if (user.role !== "admin") {
        router.replace("/dashboard"); // Safely re-route normal students poking around
      } else {
        setIsAuthorized(true);
      }
    } catch(e) {
      router.replace("/");
    }
  }, [router]);

  // Prevent admin dashboard rendering until auth and role is confirmed
  if (!isAuthorized) return null;

  return <>{children}</>;
}
