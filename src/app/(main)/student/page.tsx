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

  const {
    data: { user },
  } = await supabase.auth.getUser();

  let initialHistory = [];
  let initialProfile = null;

  if (user) {
    // 1. Тянем логи (историю)
    const { data: logs } = await supabase
      .from("daily_logs")
      .select("*")
      .eq("user_id", user.id)
      .order("log_date", { ascending: false });

    initialHistory = logs || [];

    // 2. ТЯНЕМ ПРОФИЛЬ (БЖУ, Калории, Метаданные)
    const { data: profile } = await supabase
      .from("profiles")
      .select("*")
      .eq("id", user.id)
      .single();

    initialProfile = profile;
  }

  // 3. Отдаем и логи, и профиль в клиент
  return (
    <StudentClient
      initialHistory={initialHistory}
      initialProfile={initialProfile}
    />
  );
}
