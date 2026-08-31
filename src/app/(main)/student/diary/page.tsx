import { cookies } from "next/headers";
import DiaryView from "@/components/shared/DiaryView";

export default async function StudentDiaryPage() {
  const cookieStore = await cookies();

  // Определяем часовой пояс для "сегодня"
  const timeZone = cookieStore.get("user-tz")?.value || "UTC";
  const serverToday = new Intl.DateTimeFormat("en-CA", {
    timeZone,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(new Date());

  return <DiaryView serverToday={serverToday} />;
}
