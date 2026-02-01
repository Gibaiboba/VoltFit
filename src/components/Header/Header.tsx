"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Zap, LogOut, User as UserIcon } from "lucide-react";
import { User } from "@supabase/supabase-js";

interface HeaderProps {
  initialUser: User | null;
}

export default function Header({ initialUser }: HeaderProps) {
  const [user, setUser] = useState<User | null>(initialUser);
  const router = useRouter();

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
              <div className="flex items-center gap-2">
                <div className="bg-slate-100 p-1.5 rounded-full">
                  <UserIcon size={16} className="text-slate-600" />
                </div>
                <div className="flex flex-col">
                  <span className="text-[14px] font-bold text-slate-800 leading-none">
                    {user.user_metadata?.full_name || "Атлет"}
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
