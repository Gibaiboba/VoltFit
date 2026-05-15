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
    <div className="max-w-2xl mx-auto pt-10 px-4">
      <h1 className="text-3xl font-black text-slate-800 mb-10">
        Настройки профиля
      </h1>

      <SettingsForm initialProfile={profile} userId={user.id} />
    </div>
  );
}
