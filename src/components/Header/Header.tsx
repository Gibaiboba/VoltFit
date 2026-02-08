"use client";

import { useEffect } from "react";
import { useUserStore, UserProfile } from "@/store/useUserStore";
import { supabase } from "@/lib/supabase";
import Image from "next/image";
import { LogOut, User as UserIcon, Zap, LogIn } from "lucide-react";
import Link from "next/link";
import { User } from "@supabase/supabase-js";

interface HeaderProps {
  initialUser: User | null;
  initialProfile: UserProfile | null;
}

export default function Header({ initialUser, initialProfile }: HeaderProps) {
  const { user, profile, setUser, setProfile, clearUser } = useUserStore();

  // Приоритет отдаем стору (клиенту), если там пусто — берем данные с сервера
  const displayUser = user || initialUser;
  const displayProfile = profile || initialProfile;

  useEffect(() => {
    // Инициализируем стор только если в нем еще нет данных
    if (initialUser && !user) setUser(initialUser);
    if (initialProfile && !profile) setProfile(initialProfile);

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === "SIGNED_OUT") {
        clearUser();
      }
      if (event === "SIGNED_IN" && session) {
        setUser(session.user);
      }
    });

    return () => subscription.unsubscribe();
  }, [
    initialUser,
    initialProfile,
    user,
    profile,
    setUser,
    setProfile,
    clearUser,
  ]);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    clearUser();
    window.location.href = "/";
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

        {displayUser ? (
          <div className="flex items-center gap-6">
            <Link href="/settings" className="flex items-center gap-3 group">
              <div className="w-9 h-9 rounded-full overflow-hidden border border-slate-200 bg-slate-100 relative">
                {displayProfile?.avatar_url ? (
                  <Image
                    src={displayProfile.avatar_url}
                    alt="Avatar"
                    height={40}
                    width={40}
                    // Добавляем unoptimized или случайный ключ, если кэширование мешает
                    className="object-cover w-full h-full"
                  />
                ) : (
                  <UserIcon
                    size={18}
                    className="text-slate-400 absolute inset-0 m-auto"
                  />
                )}
              </div>
              <div className="flex flex-col text-left">
                <span className="text-sm font-bold text-slate-800">
                  {displayProfile?.full_name || "Атлет"}
                </span>
                <span className="text-[10px] font-bold text-blue-600 uppercase">
                  {displayUser.user_metadata?.role || "User"}
                </span>
              </div>
            </Link>

            <button
              onClick={handleLogout}
              className="flex items-center gap-1 text-slate-400 hover:text-red-600 transition-colors font-medium text-sm"
            >
              <LogOut size={18} />
              Выйти
            </button>
          </div>
        ) : (
          <Link
            href="/login"
            className="flex items-center gap-2 px-5 py-2.5 bg-blue-600 text-white text-sm font-bold rounded-xl hover:bg-blue-700 transition-all shadow-lg shadow-blue-100 active:scale-95"
          >
            <LogIn size={18} />
            Войти
          </Link>
        )}
      </div>
    </header>
  );
}
