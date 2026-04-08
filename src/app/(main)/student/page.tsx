import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import StudentClient from "./StudentClient";

export default async function StudentPage() {
  const cookieStore = await cookies();

  // 1. Определяем часовой пояс и дату
  const timeZone = cookieStore.get("user-tz")?.value || "UTC";
  const serverToday = new Intl.DateTimeFormat("en-CA", {
    timeZone,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(new Date());

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_DEFAULT_KEY!,
    {
      cookies: {
        getAll: () => cookieStore.getAll(),
      },
    },
  );

  const {
    data: { user },
  } = await supabase.auth.getUser();

  let initialHistory = [];
  let initialProfile = null;

  // 2. Делаем запросы один раз (убрал дубликат блока if (user))
  if (user) {
    // Используем Promise.all для параллельной загрузки (так быстрее)
    const [logsRes, profileRes] = await Promise.all([
      supabase
        .from("daily_logs")
        .select("*")
        .eq("user_id", user.id)
        .order("log_date", { ascending: false }),
      supabase.from("profiles").select("*").eq("id", user.id).single(),
    ]);

    initialHistory = logsRes.data || [];
    initialProfile = profileRes.data;
  }

  // 3. Отдаем всё в клиент
  return (
    <StudentClient
      initialHistory={initialHistory}
      initialProfile={initialProfile}
      serverToday={serverToday}
    />
  );
}
