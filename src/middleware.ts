import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

export async function middleware(request: NextRequest) {
  const path = request.nextUrl.pathname;

  // ОПРЕДЕЛЕНИЕ ЧАСОВОГО ПОЯСА
  const tz =
    request.cookies.get("user-tz")?.value ||
    request.headers.get("x-vercel-ip-timezone") ||
    "UTC";

  // 1. Исключаем статику и API сразу, чтобы не нагружать Auth
  if (
    path.startsWith("/_next") ||
    path.startsWith("/api") ||
    path.includes(".")
  ) {
    return NextResponse.next();
  }

  // Создаем базовый объект ответа
  const response = NextResponse.next({
    request: { headers: request.headers },
  });

  // Гарантируем, что кука будет в ответе
  if (!request.cookies.has("user-tz")) {
    response.cookies.set("user-tz", tz, { path: "/", maxAge: 31536000 });
  }

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_DEFAULT_KEY!,
    {
      cookies: {
        getAll: () => request.cookies.getAll(),
        setAll: (cookiesToSet) => {
          cookiesToSet.forEach(({ name, value, options }) => {
            // Синхронизируем куки и в запросе, и в ответе
            request.cookies.set(name, value);
            response.cookies.set(name, value, options);
          });
        },
      },
    },
  );

  // Безопасная проверка пользователя (getUser делает запрос к серверу)
  const {
    data: { user },
    error,
  } = await supabase.auth.getUser();

  const userRole = user?.app_metadata?.role || user?.user_metadata?.role;
  const onboardingDone = user?.user_metadata?.onboarding_completed === true;

  const isPublicPage =
    path === "/" ||
    path === "/login" ||
    path === "/register" ||
    path.startsWith("/products");

  /**
   * Хелпер для редиректа, который не теряет обновленные куки (токены)
   */
  const createRedirect = (targetPath: string) => {
    const redirectResponse = NextResponse.redirect(
      new URL(targetPath, request.url),
    );
    // Важно: переносим все установленные куки из основного response в редирект
    response.cookies.getAll().forEach((cookie) => {
      redirectResponse.cookies.set(cookie.name, cookie.value, cookie);
    });
    return redirectResponse;
  };

  // --- ЛОГИКА ПРОВЕРОК ---

  // 1. Если не авторизован и страница приватная
  if (!user && !isPublicPage) {
    return createRedirect("/login");
  }

  // 2. Если залогинен и лезет на логин/регистрацию
  if (user && (path === "/login" || path === "/register")) {
    const target = userRole === "coach" ? "/coach" : "/student";
    return createRedirect(target);
  }

  // 3. Защита ролей (чтобы не заходили на чужие страницы)
  if (userRole === "student" && path.startsWith("/coach")) {
    return createRedirect("/student?error=no_access");
  }
  if (userRole === "coach" && path.startsWith("/student")) {
    return createRedirect("/coach?error=no_access");
  }

  // 4. Проверка онбординга (если не пройден — только на онбординг)
  if (
    user &&
    !onboardingDone &&
    !path.startsWith("/onboarding") &&
    !isPublicPage
  ) {
    return createRedirect("/onboarding");
  }

  // 5. Если опрос пройден, но юзер пытается зайти на страницу опроса
  if (user && onboardingDone && path.startsWith("/onboarding")) {
    const target = userRole === "coach" ? "/coach" : "/student";
    return createRedirect(target);
  }

  // 1. Если не удалось получить юзера (ошибка или его просто нет)
  // и страница приватная — на выход.
  if ((!user || error) && !isPublicPage) {
    return createRedirect("/login?error=session_expired");
  }

  return response;
}

// Оптимизация: запускаем Middleware только на нужных маршрутах
export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
