import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import SettingsForm from "@/components/SettingsForm/SettingsForm";
import { redirect } from "next/navigation";

export default async function SettingsPage() {
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

  if (!user) {
    redirect("/login");
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", user.id)
    .single();

  return (
    <div className="p-6 bg-[#F4F4F5] min-h-screen pt-24 text-slate-900">
      <div className="max-w-4xl mx-auto space-y-8 animate-in fade-in duration-300">
        <div className="px-1">
          <h1 className="text-xl font-black text-slate-900 uppercase italic tracking-tight">
            Настройки профиля
          </h1>
        </div>

        {/* Форма настроек */}
        <SettingsForm initialProfile={profile} userId={user.id} />
      </div>
    </div>
  );
}
