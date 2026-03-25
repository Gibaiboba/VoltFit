import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

export async function middleware(request: NextRequest) {
  const path = request.nextUrl.pathname;

  if (
    path.startsWith("/_next") ||
    path.startsWith("/api") ||
    path.includes(".")
  ) {
    return NextResponse.next();
  }

  let response = NextResponse.next({
    request: { headers: request.headers },
  });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_DEFAULT_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) =>
            request.cookies.set(name, value),
          );
          response = NextResponse.next({
            request: { headers: request.headers },
          });
          cookiesToSet.forEach(({ name, value, options }) =>
            response.cookies.set(name, value, options),
          );
        },
      },
    },
  );

  // Используем getSession() вместо getUser()
  // Это берет данные из куки БЕЗ обязательного запроса к серверу Supabase
  const {
    data: { session },
    error,
  } = await supabase.auth.getSession();

  const user = session?.user;
  const userRole = user?.app_metadata?.role || user?.user_metadata?.role;
  const onboardingDone = user?.user_metadata?.onboarding_completed === true;

  const isPublicPage =
    path === "/" ||
    path === "/login" ||
    path === "/register" ||
    path.startsWith("/products");

  // проверка авторизации
  // редиректим на логин ТОЛЬКО если сессии точно нет (!session)
  // и при этом нет ошибки запроса (!error).
  // Если error есть (например, ошибка сети), мы пропускаем запрос дальше.
  if (!session && !isPublicPage && !error) {
    return NextResponse.redirect(new URL("/login", request.url));
  }

  // Если залогинен и лезет на логин/регистрацию
  if (user && (path === "/login" || path === "/register")) {
    const target = userRole === "coach" ? "/coach" : "/student";
    return NextResponse.redirect(new URL(target, request.url));
  }

  // Защита ролей + Тостер (чтобы ученик не смог зайти на страницу к тренеру)
  if (userRole === "student" && path.startsWith("/coach")) {
    return NextResponse.redirect(
      new URL("/student?error=no_access", request.url),
    );
  }

  if (userRole === "coach" && path.startsWith("/student")) {
    return NextResponse.redirect(
      new URL("/coach?error=no_access", request.url),
    );
  }
  // Если опрос пройден и юзер лезет на страницу опроса — редиректим в личный кабинет
  if (user && onboardingDone && path.startsWith("/onboarding")) {
    const target = userRole === "coach" ? "/coach" : "/student";
    return NextResponse.redirect(new URL(target, request.url));
  }

  // Если залогинен, опрос НЕ пройден
  if (
    user &&
    !onboardingDone &&
    !isPublicPage &&
    !path.startsWith("/onboarding")
  ) {
    return NextResponse.redirect(new URL("/onboarding", request.url));
  }

  return response;
}
