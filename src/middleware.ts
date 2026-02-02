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

  // Получаем пользователя и обновляем сессию
  const {
    data: { user },
  } = await supabase.auth.getUser();
  const userRole = user?.user_metadata?.role;
  const isPublicPage =
    path === "/" || path === "/login" || path === "/register";

  // Если юзера нет и страница не публичная перенаправляем на логин
  if (!user && !isPublicPage) {
    return NextResponse.redirect(new URL("/login", request.url));
  }

  // Если юзер залогинен и лезет на защищенные страницы отправляем в свой кабинет
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

  return response;
}
