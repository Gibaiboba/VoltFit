import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

export async function middleware(request: NextRequest) {
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

  // getUser() делает запрос к серверу Supabase для проверки токена
  const {
    data: { user },
  } = await supabase.auth.getUser();

  // Извлекаем роль из метаданных (мы их записывали при регистрации)
  const userRole = user?.user_metadata?.role;
  const path = request.nextUrl.pathname;

  // проверка куда идет пользователь (для тостера)
  if (userRole === "student" && path.startsWith("/coach")) {
    return NextResponse.redirect(
      new URL("/student?error=no_access", request.url),
    );
  }

  // Ученик лезет к Тренеру
  if (userRole === "student" && path.startsWith("/coach")) {
    return NextResponse.redirect(new URL("/student", request.url));
  }

  //Тренер лезет к Ученику
  if (userRole === "coach" && path.startsWith("/student")) {
    return NextResponse.redirect(new URL("/coach", request.url));
  }

  const isPublicPage =
    path === "/" || path === "/login" || path === "/register";
  const isStaticAsset =
    path.startsWith("/_next") || path.startsWith("/api") || path.includes(".");

  // Если юзера нет и страница не публичная идем на логин
  if (!user && !isPublicPage && !isStaticAsset) {
    return NextResponse.redirect(new URL("/login", request.url));
  }

  // Если юзер есть и он на странице логина то в кабинет
  if (user && (path === "/login" || path === "/register")) {
    const role = user.user_metadata?.role || "student";
    return NextResponse.redirect(
      new URL(role === "coach" ? "/coach" : "/student", request.url),
    );
  }

  return response;
}
