"use client";

import { useEffect } from "react";
import { useUserStore } from "@/store/useUserStore";
import { supabase } from "@/lib/supabase";
import Image from "next/image";
import { LogOut, User as UserIcon, LogIn } from "lucide-react";
import Link from "next/link";
import { User } from "@supabase/supabase-js";
import { useQueryClient } from "@tanstack/react-query";
import { UserProfile } from "@/types/user";

interface HeaderProps {
  initialUser: User | null;
  initialProfile: UserProfile | null;
}

export default function Header({ initialUser, initialProfile }: HeaderProps) {
  const { user, setUser, clearUser } = useUserStore();
  const queryClient = useQueryClient();

  // Приоритет отдаем стору (клиенту), если там пусто — берем данные с сервера
  const displayUser = user || initialUser;
  const displayProfile = initialProfile;

  useEffect(() => {
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === "SIGNED_OUT") {
        clearUser();
        queryClient.setQueryData(["user-profile"], null); // очищаем кеш профиля
      }
      if (event === "SIGNED_IN" && session) {
        setUser(session.user);
        // Инвалидируем профиль, чтобы useUserProfile перезагрузил данные и обновил Zustand
        queryClient.invalidateQueries({ queryKey: ["user-profile"] });
      }
      if (event === "USER_UPDATED" || event === "TOKEN_REFRESHED") {
        // Обновляем пользователя в сторе, если изменились метаданные
        supabase.auth.getUser().then(({ data }) => {
          if (data.user) setUser(data.user);
        });
      }
    });

    return () => subscription.unsubscribe();
  }, [clearUser, queryClient, setUser]);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    clearUser();
    queryClient.clear();
    window.location.href = "/";
  };

  return (
    <header className="fixed top-0 left-0 w-full bg-[var(--background)] backdrop-blur-md z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
        <Link
          href="/"
          className="flex items-center justify-center px-3 py-1.5 bg-[#1e5039] text-white font-black text-xl italic tracking-wider rounded-xl hover:bg-yellow-300 transition-colors"
        >
          VitGo
        </Link>

        {displayUser ? (
          <div className="flex items-center gap-4 sm:gap-6">
            <Link
              href="/student/settings"
              className="flex items-center gap-2 sm:gap-3 group"
            >
              <div className="w-9 h-9 rounded-full overflow-hidden border border-slate-700 bg-slate-800 relative group-hover:border-yellow-400 transition-colors shrink-0">
                {displayProfile?.avatar_url ? (
                  <Image
                    src={displayProfile.avatar_url}
                    alt="Avatar"
                    height={40}
                    width={40}
                    className="object-cover w-full h-full"
                  />
                ) : (
                  <UserIcon
                    size={18}
                    className="text-slate-400 absolute inset-0 m-auto group-hover:text-yellow-400 transition-colors"
                  />
                )}
              </div>

              {/* Блок с именем и ролью теперь отображается ВСЕГДА (убран класс hidden) */}
              <div className="flex flex-col text-left">
                <span className="text-xs sm:text-sm font-bold text-black group-hover:text-yellow-400 transition-colors line-clamp-1 max-w-[80px] sm:max-w-[150px]">
                  {displayProfile?.full_name || "Атлет"}
                </span>
                <span className="text-[9px] sm:text-[10px] font-bold text-yellow-400 uppercase tracking-wide">
                  {displayUser.user_metadata?.role || "User"}
                </span>
              </div>
            </Link>

            {/* Кнопка выйти: иконка видна всегда, текст скрывается на мобилках с помощью hidden sm:inline */}
            <button
              onClick={handleLogout}
              className="flex items-center gap-1 p-2 sm:p-0 text-slate-400 hover:text-red-400 transition-colors font-medium text-sm"
              title="Выйти"
            >
              <LogOut size={18} className="shrink-0" />
              <span className="hidden sm:inline">Выйти</span>
            </button>
          </div>
        ) : (
          <Link
            href="/login"
            className="flex items-center gap-2 px-4 py-2 sm:px-5 sm:py-2.5 bg-yellow-400 text-slate-950 text-sm font-black rounded-xl hover:bg-yellow-300 transition-all shadow-lg shadow-yellow-400/10 active:scale-95"
          >
            <LogIn size={18} />
            <span>Войти</span>
          </Link>
        )}
      </div>
    </header>
  );
}
