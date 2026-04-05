"use client";
import { useEffect } from "react";
import { useSearchParams, useRouter, usePathname } from "next/navigation";
import { toast } from "sonner";
import { ShieldAlert, WifiOff, Wifi } from "lucide-react";

export default function RouteGuardListener() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    // --- 1. ОБРАБОТКА ОШИБОК ИЗ URL (Middleware) ---
    const error = searchParams.get("error");

    if (error) {
      if (error === "no_access") {
        toast.error("Доступ запрещен", {
          description: "У вас нет прав для просмотра этого раздела.",
          icon: <ShieldAlert className="text-red-500" size={20} />,
          duration: 5000,
        });
      } else if (error === "session_expired") {
        toast.error("Сессия истекла", {
          description: "Пожалуйста, войдите в аккаунт снова.",
          icon: <ShieldAlert className="text-red-500" size={20} />,
          duration: 5000,
        });
      }

      // Чистим URL от параметра error, чтобы не спамить тостами
      const params = new URLSearchParams(searchParams.toString());
      params.delete("error");
      const newUrl = params.toString()
        ? `${pathname}?${params.toString()}`
        : pathname;
      router.replace(newUrl);
    }

    // ---  ПРОВЕРКА ИНТЕРНЕТА ---
    const handleOffline = () => {
      toast.error("Сеть потеряна", {
        description:
          "Данные могут не сохраняться, пока связь не восстановится.",
        icon: <WifiOff className="text-red-500" size={20} />,
        duration: Infinity,
        id: "network-status",
      });
    };

    const handleOnline = () => {
      toast.success("Связь восстановлена", {
        description: "Вы снова онлайн.",
        icon: <Wifi className="text-green-500" size={20} />,
        duration: 3000,
        id: "network-status",
      });
    };

    window.addEventListener("offline", handleOffline);
    window.addEventListener("online", handleOnline);

    if (!navigator.onLine) handleOffline();

    return () => {
      window.removeEventListener("offline", handleOffline);
      window.removeEventListener("online", handleOnline);
    };
  }, [searchParams, pathname, router]);

  return null;
}
