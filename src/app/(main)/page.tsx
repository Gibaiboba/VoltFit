import { cookies } from "next/headers";
import { createServerClient } from "@supabase/ssr";
import Header from "@/components/Header/Header";
import Link from "next/link";

//Серверный рендеринг. Проверяет сессию на сервере, чтобы страница сразу открылась с нужными данными

export default async function Home() {
  const cookieStore = await cookies();
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
    <div className="min-h-screen bg-gray-50 flex flex-col items-center pt-10 px-4">
      <Header initialUser={user} initialProfile={profile} />

      <h1 className="text-3xl font-black text-slate-800 mt-12 mb-8 tracking-tight">
        Volt<span className="text-blue-600">Fit</span>
      </h1>

      <div className="flex flex-col gap-4 w-full max-w-xs">
        <Link
          href="/student"
          className="flex items-center justify-center p-4 bg-white text-slate-700 font-bold rounded-2xl shadow-sm border border-slate-200 hover:shadow-md hover:bg-blue-50 hover:text-blue-600 transition-all"
        >
          👨‍🎓 Кабинет Ученика
        </Link>

        <Link
          href="/coach"
          className="flex items-center justify-center p-4 bg-white text-slate-700 font-bold rounded-2xl shadow-sm border border-slate-200 hover:shadow-md hover:bg-indigo-50 hover:text-indigo-600 transition-all"
        >
          👟 Кабинет Тренера
        </Link>

        <Link
          href="/settings"
          className="flex items-center justify-center p-4 bg-white text-slate-700 font-bold rounded-2xl shadow-sm border border-slate-200 hover:shadow-md hover:bg-indigo-50 hover:text-indigo-600 transition-all"
        >
          Настройка профиля
        </Link>

        <Link
          href="/products"
          className="flex items-center justify-center p-4 bg-white text-slate-700 font-bold rounded-2xl shadow-sm border border-slate-200 hover:shadow-md hover:bg-indigo-50 hover:text-indigo-600 transition-all"
        >
          Конструктор блюд
        </Link>
      </div>
    </div>
  );
}
