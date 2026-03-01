import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import StudentClient from "./StudentClient";

export default async function StudentPage() {
  const cookieStore = await cookies();

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_DEFAULT_KEY!,
    {
      cookies: {
        getAll: () => cookieStore.getAll(),
      },
    },
  );

  // 1. Получаем сессию пользователя
  const {
    data: { user },
  } = await supabase.auth.getUser();

  let initialHistory = [];
  if (user) {
    // 2. Сразу тянем логи логов
    const { data } = await supabase
      .from("daily_logs")
      .select("*")
      .eq("user_id", user.id)
      .order("log_date", { ascending: false });

    initialHistory = data || [];
  }

  // 3. Отдаем чистые данные в клиентский компонент
  return <StudentClient initialHistory={initialHistory} />;
}
