"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Zap, LogOut, User as UserIcon } from "lucide-react";
import { User } from "@supabase/supabase-js";
import Image from "next/image";

interface HeaderProps {
  initialUser: User | null;
  initialProfile?: {
    avatar_url: string | null;
    full_name: string | null;
  } | null;
}

// 1. Добавили initialProfile в аргументы
export default function Header({ initialUser, initialProfile }: HeaderProps) {
  const [user, setUser] = useState<User | null>(initialUser);
  const [profile, setProfile] = useState(initialProfile);
  const router = useRouter();

  // Синхронизация профиля с сервером
  useEffect(() => {
    setProfile(initialProfile);
  }, [initialProfile]);

  useEffect(() => {
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
      router.refresh();
    });

    return () => subscription.unsubscribe();
  }, [router]);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push("/");
    router.refresh();
  };

  return (
    <header className="fixed top-0 w-full bg-white/80 backdrop-blur-md border-b z-50">
      <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
        <Link
          href="/"
          className="flex items-center gap-2 font-black text-xl italic"
        >
          <Zap className="text-blue-600 fill-current" /> VOLTFIT
        </Link>

        <nav className="flex items-center gap-4">
          {user ? (
            <div className="flex items-center gap-6">
              <div className="flex items-center gap-3">
                {/* 2. ЛОГИКА АВАТАРА: Контейнер для фото или иконки */}
                <div className="w-9 h-9 rounded-full overflow-hidden border border-slate-200 bg-slate-100 flex items-center justify-center relative">
                  {profile?.avatar_url ? (
                    <Image
                      src={profile.avatar_url}
                      alt="Avatar"
                      fill
                      className="object-cover"
                      sizes="36px"
                    />
                  ) : (
                    <UserIcon size={18} className="text-slate-400" />
                  )}
                </div>

                <div className="flex flex-col">
                  <span className="text-[14px] font-bold text-slate-800 leading-none">
                    {/* 3. Приоритет имени из профиля */}
                    {profile?.full_name ||
                      user.user_metadata?.full_name ||
                      "Атлет"}
                  </span>
                  <span className="text-[10px] font-black text-blue-600 uppercase tracking-tighter">
                    {user.user_metadata?.role || "User"}
                  </span>
                </div>
              </div>

              <button
                onClick={handleLogout}
                className="flex items-center gap-2 text-slate-400 hover:text-red-600 transition-colors font-bold text-sm group"
              >
                <LogOut
                  size={18}
                  className="group-hover:-translate-x-0.5 transition-transform"
                />
                <span className="hidden sm:inline">Выйти</span>
              </button>
            </div>
          ) : (
            <Link
              href="/login"
              className="bg-blue-600 text-white px-6 py-2 rounded-xl font-bold hover:bg-blue-700 transition-all shadow-lg shadow-blue-100"
            >
              Войти
            </Link>
          )}
        </nav>
      </div>
    </header>
  );
}
