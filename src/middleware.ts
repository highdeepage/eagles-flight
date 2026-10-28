import { NextResponse, type NextRequest } from "next/server";
import { createServerClient } from "@supabase/ssr";

export async function middleware(request: NextRequest) {
  let response = NextResponse.next({ request });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll: () => request.cookies.getAll(),
        setAll: (toSet) => {
          toSet.forEach(({ name, value }) => request.cookies.set(name, value));
          response = NextResponse.next({ request });
          toSet.forEach(({ name, value, options }) =>
            response.cookies.set(name, value, options),
          );
        },
      },
    },
  );

  const { data: { user } } = await supabase.auth.getUser();
  const path = request.nextUrl.pathname;

  const isLogin = path === "/login";
  const isPortal =
    path.startsWith("/admin") ||
    path.startsWith("/teacher") ||
    path.startsWith("/student") ||
    path.startsWith("/parent");

  // Unauthenticated users hitting a portal → login
  if (!user && isPortal) {
    const url = request.nextUrl.clone();
    url.pathname = "/login";
    url.searchParams.set("redirect", path);
    return NextResponse.redirect(url);
  }

  // Authenticated users on /login → their role home
  if (user && isLogin) {
    const { data: profile } = await supabase
      .from("users")
      .select("role,is_active")
      .eq("id", user.id)
      .single();

    if (profile && !profile.is_active) {
      await supabase.auth.signOut();
      const url = request.nextUrl.clone();
      url.pathname = "/login";
      url.searchParams.set("error", "account_inactive");
      return NextResponse.redirect(url);
    }

    const url = request.nextUrl.clone();
    url.pathname = roleHome(profile?.role ?? "student");
    return NextResponse.redirect(url);
  }

  // Role guards — each portal only accessible by permitted roles
  if (user && isPortal) {
    const { data: profile } = await supabase
      .from("users")
      .select("role,is_active")
      .eq("id", user.id)
      .single();

    if (!profile || !profile.is_active) {
      await supabase.auth.signOut();
      const url = request.nextUrl.clone();
      url.pathname = "/login";
      return NextResponse.redirect(url);
    }

    const allowed =
      (path.startsWith("/admin") && (profile.role === "admin" || profile.role === "principal")) ||
      (path.startsWith("/teacher") && (profile.role === "teacher" || profile.role === "class_teacher")) ||
      (path.startsWith("/student") && profile.role === "student") ||
      (path.startsWith("/parent") && profile.role === "parent");

    if (!allowed) {
      const url = request.nextUrl.clone();
      url.pathname = roleHome(profile.role);
      url.searchParams.set("denied", "1");
      return NextResponse.redirect(url);
    }
  }

  return response;
}

export function roleHome(role: string): string {
  switch (role) {
    case "admin":
    case "principal":
    case "vice_principal":
    case "bursar":
    case "registrar":
      return "/admin";
    case "teacher":
    case "class_teacher":
      return "/teacher";
    case "student":
      return "/student";
    case "parent":
      return "/parent";
    default:
      return "/login";
  }
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};