"use client";

import { useEffect } from "react";
import { useUserStore, UserProfile } from "@/store/useUserStore";
import { supabase } from "@/lib/supabase";
import Image from "next/image";
import { LogOut, User as UserIcon, Zap } from "lucide-react";
import Link from "next/link";
import { User } from "@supabase/supabase-js";

interface HeaderProps {
  initialUser: User | null;
  initialProfile: UserProfile | null;
}

export default function Header({ initialUser, initialProfile }: HeaderProps) {
  const { user, profile, setUser, setProfile, clearUser } = useUserStore();

  useEffect(() => {
    if (initialUser) setUser(initialUser);
    if (initialProfile) setProfile(initialProfile);

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === "SIGNED_OUT") clearUser();
      if (event === "SIGNED_IN" && session) setUser(session.user);
    });

    return () => subscription.unsubscribe();
  }, [initialUser, initialProfile, setUser, setProfile, clearUser]);

  const handleLogout = async () => {
    await supabase.auth.signOut();
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

        {user && (
          <div className="flex items-center gap-6">
            <Link href="/settings" className="flex items-center gap-3 group">
              <div className="w-9 h-9 rounded-full overflow-hidden border border-slate-200 bg-slate-100 relative">
                {profile?.avatar_url ? (
                  <Image
                    src={profile.avatar_url}
                    alt="Avatar"
                    height={128}
                    width={128}
                    className="object-cover"
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
                  {profile?.full_name || "Атлет"}
                </span>
                <span className="text-[10px] font-bold text-blue-600 uppercase">
                  {user.user_metadata?.role}
                </span>
              </div>
            </Link>

            <button
              onClick={handleLogout}
              className="text-slate-400 hover:text-red-600 transition-colors"
            >
              <LogOut size={20} />
            </button>
          </div>
        )}
      </div>
    </header>
  );
}
