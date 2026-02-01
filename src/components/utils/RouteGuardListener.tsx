"use client";
import { useEffect } from "react";
import { useSearchParams, useRouter, usePathname } from "next/navigation";
import { toast } from "sonner";
import { ShieldAlert } from "lucide-react";

export default function RouteGuardListener() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    const error = searchParams.get("error");

    if (error === "no_access") {
      toast.error("Доступ запрещен", {
        description: "У вас нет прав для просмотра этого раздела.",
        icon: <ShieldAlert className="text-red-500" size={20} />,
        duration: 5000,
      });

      const params = new URLSearchParams(searchParams.toString());
      params.delete("error");
      const newUrl = params.toString()
        ? `${pathname}?${params.toString()}`
        : pathname;
      router.replace(newUrl);
    }
  }, [searchParams, pathname, router]);

  return null;
}
