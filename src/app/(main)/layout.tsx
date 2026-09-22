import { cookies } from "next/headers";
import { createServerClient } from "@supabase/ssr";
import Header from "@/components/Header/Header";
import RouteGuardListener from "@/providers/RouteGuardListener";
import { DateProvider } from "@/providers/DateProvider";
import StoreInitializer from "@/providers/StoreInitializer";
import QueryProvider from "@/providers/QueryProvider";
import AuthProvider from "@/providers/AuthProvider";

interface MainLayoutProps {
  children: React.ReactNode;
}

export default async function MainLayout({ children }: MainLayoutProps) {
  const cookieStore = await cookies();
  const userTimeZone = cookieStore.get("user-tz")?.value || "UTC";

  const serverToday = new Intl.DateTimeFormat("en-CA", {
    timeZone: userTimeZone,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(new Date());

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_DEFAULT_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
      },
    },
  );

  const {
    data: { user },
  } = await supabase.auth.getUser();

  let profile = null;
  if (user) {
    const { data } = await supabase
      .from("profiles")
      .select("*")
      .eq("id", user.id)
      .single();
    profile = data;
  }

  return (
    // 1. Сначала создаем контекст React Query
    <QueryProvider>
      {/* 2. Подключаем слушатель авторизации */}
      <AuthProvider>
        {/* 3. Мгновенно синхронизируем серверные данные с Zustand */}
        <StoreInitializer user={user} serverToday={serverToday} />

        <RouteGuardListener />

        <Header initialUser={user} initialProfile={profile} />

        <DateProvider serverToday={serverToday}>{children}</DateProvider>
      </AuthProvider>
    </QueryProvider>
  );
}
