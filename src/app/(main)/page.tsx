import { cookies } from "next/headers";
import { createServerClient } from "@supabase/ssr";
import Header from "@/components/Header/Header";
import Link from "next/link";

// Серверный рендеринг. Проверяет сессию на сервере, чтобы страница сразу открылась с нужными данными
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
    // Изменили фон на темный (slate-900), чтобы выгодно подсветить желтые и белые элементы бренда VoltFit
    <div className="min-h-screen bg-white flex flex-col items-center text-white pb-16">
      {/* Шапка приложения */}
      <div className="w-full px-4 pt-6 max-w-6xl">
        <Header initialUser={user} initialProfile={profile} />
      </div>

      {/* --- HERO SECTION --- */}
      <main className="w-full max-w-6xl px-4 mt-12 md:mt-20 flex flex-col md:flex-row items-center justify-between gap-12">
        {/* Левая колонка: Тексты и СТА */}
        <div className="flex-1 text-center md:text-left space-y-6">
          <h2 className="text-3xl md:text-4xl font-extrabold text-black leading-snug">
            Твой прогресс под контролем тренера{" "}
            <span className="text-yellow-400">24/7</span>
          </h2>

          <p className="text-slate-300 text-lg md:text-xl max-w-lg leading-relaxed">
            Считай калории, трекай шаги, воду и сон в одном приложении. А твой
            тренер сразу увидит результаты и скорректирует план.
          </p>

          <div className="pt-4 flex flex-col sm:flex-row gap-4 justify-center md:justify-start">
            {/* Яркая фирменная желтая кнопка СТА */}
            <Link
              href={user ? "/student" : "/login"}
              className="px-8 py-4 bg-yellow-400 text-slate-950 font-black text-lg rounded-2xl shadow-lg shadow-yellow-400/20 hover:bg-yellow-300 hover:scale-[1.02] transition-all text-center"
            >
              Начать сегодня
            </Link>
          </div>
        </div>

        {/* Правая колонка: Интерактивный интеллигентный мокап с графиком */}
        <div className="flex-1 w-full max-w-md bg-slate-800 border border-slate-700 rounded-3xl p-6 shadow-2xl relative overflow-hidden group">
          {/* Декоративное свечение на фоне */}
          <div className="absolute -top-10 -right-10 w-40 h-40 bg-yellow-400/10 rounded-full blur-3xl group-hover:bg-yellow-400/20 transition-all duration-500" />

          {/* Шапка мокапа */}
          <div className="flex justify-between items-center mb-6">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-yellow-400 rounded-full flex items-center justify-center font-bold text-slate-900">
                ⚡
              </div>
              <div>
                <div className="font-bold text-sm text-white">
                  Дневник VitGo
                </div>
                <div className="text-xs text-slate-400">
                  Синхронизировано с тренером
                </div>
              </div>
            </div>
            <span className="text-xs bg-emerald-500/20 text-emerald-400 px-2.5 py-1 rounded-full font-medium animate-pulse">
              Live
            </span>
          </div>

          {/* Стилизованный график прогресса веса/калорий */}
          <div className="bg-slate-900/50 rounded-2xl p-4 border border-slate-700/50 mb-4">
            <div className="flex justify-between text-xs text-slate-400 mb-2">
              <span>Прогресс калорий за неделю</span>
              <span className="text-yellow-400 font-bold">~2,100 ккал</span>
            </div>
            {/* Имитация столбчатого графика */}
            <div className="h-24 flex items-end gap-2 pt-4 justify-between px-2">
              <div className="w-full bg-slate-700 h-16 rounded-t-md" />
              <div className="w-full bg-slate-700 h-20 rounded-t-md" />
              <div className="w-full bg-yellow-400 h-24 rounded-t-md relative">
                <span className="absolute -top-5 left-1/2 -translate-x-1/2 text-[10px] bg-slate-800 text-white px-1 rounded border border-slate-600">
                  Обед!
                </span>
              </div>
              <div className="w-full bg-slate-700 h-14 rounded-t-md" />
              <div className="w-full bg-slate-700 h-22 rounded-t-md" />
              <div className="w-full bg-yellow-400 h-18 rounded-t-md" />
              <div className="w-full bg-slate-700 h-20 rounded-t-md" />
            </div>
          </div>

          {/* Имитация чек-листа активностей за день */}
          <div className="grid grid-cols-2 gap-3 text-xs text-white">
            <div className="p-3 bg-slate-900/50 rounded-xl border border-slate-700/50 flex items-center gap-2">
              <span className="text-base">💧</span>{" "}
              <span>Вода: 1.8 / 2.5 л</span>
            </div>
            <div className="p-3 bg-slate-900/50 rounded-xl border border-slate-700/50 flex items-center gap-2">
              <span className="text-base">👟</span> <span>Шаги: 8,420</span>
            </div>
          </div>
        </div>
      </main>

      {/* --- БЛОК НАВИГАЦИИ (Быстрые ссылки приложения) --- */}
      {/* Мы аккуратно перенесли твои ссылки вниз в виде аккуратного "Быстрого меню" приложения */}
      <section className="w-full max-w-6xl px-4 mt-20">
        <div className="border-t border-slate-800 pt-10">
          <h3 className="text-slate-400 font-semibold uppercase tracking-wider text-sm mb-6 text-center md:text-left">
            Быстрый доступ к разделам VoltFit:
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-5 gap-4 w-full">
            <Link
              href="/student"
              className="flex items-center justify-center p-4 bg-slate-800 text-white font-bold rounded-2xl shadow-sm border border-slate-700 hover:border-yellow-400 hover:bg-slate-750 transition-all text-center"
            >
              👨‍🎓 Кабинет Ученика
            </Link>

            <Link
              href="/coach"
              className="flex items-center justify-center p-4 bg-slate-800 text-white font-bold rounded-2xl shadow-sm border border-slate-700 hover:border-yellow-400 hover:bg-slate-750 transition-all text-center"
            >
              👟 Кабинет Тренера
            </Link>

            <Link
              href="/student/diary"
              className="flex items-center justify-center p-4 bg-slate-800 text-slate-300 font-medium rounded-2xl shadow-sm border border-slate-700/50 hover:text-white hover:border-slate-600 transition-all text-center"
            >
              Дневник питания
            </Link>

            <Link
              href="/student/history"
              className="flex items-center justify-center p-4 bg-slate-800 text-slate-300 font-medium rounded-2xl shadow-sm border border-slate-700/50 hover:text-white hover:border-slate-600 transition-all text-center"
            >
              История
            </Link>

            <Link
              href="/student/settings"
              className="flex items-center justify-center p-4 bg-slate-800 text-slate-300 font-medium rounded-2xl shadow-sm border border-slate-700/50 hover:text-white hover:border-slate-600 transition-all text-center"
            >
              Настройка профиля
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
