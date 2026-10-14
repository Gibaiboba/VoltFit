import StudentClient from "./StudentClient";

// 1. Форсируем динамический рендеринг при каждом запросе
export const dynamic = "force-dynamic";
// 2. Отключаем кэширование этой страницы на уровне сервера
export const revalidate = 0;

export default async function StudentPage() {
  return <StudentClient />;
}
