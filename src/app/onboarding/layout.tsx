"use client";

import { useOnboardingStore } from "@/store/useOnboardingStore";
import { ChevronLeft, LogOut } from "lucide-react";
import { supabase } from "@/lib/supabase";
import { useRouter } from "next/navigation";

export default function OnboardingLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { step, prevStep } = useOnboardingStore();
  const router = useRouter();

  const handleLogout = async () => {
    useOnboardingStore.getState().reset(); // Очищаем Zustand
    await supabase.auth.signOut();
    router.push("/login");
  };

  return (
    <div className="min-h-screen bg-white flex flex-col font-sans">
      <header className="p-6 flex justify-between items-center max-w-md mx-auto w-full h-20">
        {/* Кнопка НАЗАД: видна только если step > 1 и это не финальный экран (Processing) */}
        <div className="w-10">
          {step > 1 && step < 5 && (
            <button
              onClick={prevStep}
              className="p-2 -ml-2 text-gray-400 hover:text-black transition-colors"
            >
              <ChevronLeft size={28} />
            </button>
          )}
        </div>

        <div className="font-black text-xl tracking-tighter text-blue-600 uppercase">
          VoltFit
        </div>

        {/* Кнопка ВЫХОД: чтобы юзер не "застрял" в опросе навсегда */}
        <div className="w-10 flex justify-end">
          <button
            onClick={handleLogout}
            className="p-2 text-gray-300 hover:text-red-500 transition-colors"
          >
            <LogOut size={20} />
          </button>
        </div>
      </header>

      <main className="flex-1 flex flex-col">{children}</main>
    </div>
  );
}
