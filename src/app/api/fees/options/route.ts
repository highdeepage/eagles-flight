import { NextResponse } from "next/server";
import { listTermOptions, listClassOptions } from "@/lib/fees/queries";
import { requireAdmin } from "@/lib/auth/session";

export async function GET() {
  try {
    await requireAdmin();
    const [terms, classes] = await Promise.all([
      listTermOptions(),
      listClassOptions(),
    ]);
    return NextResponse.json({ terms, classes });
  } catch {
    return NextResponse.json({ terms: [], classes: [] }, { status: 200 });
  }
}