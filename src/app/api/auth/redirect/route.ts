import { NextResponse, type NextRequest } from "next/server";

export async function GET(req: NextRequest) {
  const role = req.nextUrl.searchParams.get("role") ?? "student";
  const map: Record<string, string> = {
    admin: "/admin",
    principal: "/admin",
    vice_principal: "/admin",
    bursar: "/admin",
    registrar: "/admin",
    teacher: "/teacher",
    class_teacher: "/teacher",
    student: "/student",
    parent: "/parent",
  };
  const dest = map[role] ?? "/login";
  return NextResponse.redirect(new URL(dest, req.url));
}