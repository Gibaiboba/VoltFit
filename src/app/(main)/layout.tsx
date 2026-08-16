import { cookies } from "next/headers";
import { createServerClient } from "@supabase/ssr";
import Header from "@/components/Header/Header";
import RouteGuardListener from "@/providers/RouteGuardListener";
import { DateProvider } from "@/providers/DateProvider";

interface MainLayoutProps {
  children: React.ReactNode;
}

export default async function MainLayout({ children }: MainLayoutProps) {
  const cookieStore = await cookies();

  // 1. Получаем таймзону из куки, которую мы записали в RootLayout (дефолт — UTC)
  const userTimeZone = cookieStore.get("user-tz")?.value || "UTC";

  // 2. Форматируем текущую дату сервера строго в YYYY-MM-DD с учетом таймзоны юзера
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
    <>
      <RouteGuardListener />
      <Header initialUser={user} initialProfile={profile} />

      {/* Теперь переменная serverToday существует и успешно передается вниз */}
      <DateProvider serverToday={serverToday}>{children}</DateProvider>
    </>
  );
}
