"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function Home() {
  const router = useRouter();

  useEffect(() => {
    const token = localStorage.getItem("accessToken");

    if (token) {
      router.replace("/dashboard");
    } else {
      router.replace("/signup");
    }
  }, [router]);

  return (
    <div className="flex items-center justify-center h-screen">Loading...</div>
  );
}
