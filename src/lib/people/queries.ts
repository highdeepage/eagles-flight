import "server-only";
import { createServerSupabase } from "@/lib/db/server";

export interface ListParams {
  search?: string;
  page?: number;
  pageSize?: number;
  status?: string;
}

// ─── Students ────────────────────────────────────────────────
export async function listStudents(params: ListParams = {}) {
  const s = await createServerSupabase();
  const page = params.page ?? 1;
  const pageSize = params.pageSize ?? 25;
  const from = (page - 1) * pageSize;
  const to = from + pageSize - 1;

  let q = s
    .from("students")
    .select("*", { count: "exact" })
    .order("surname")
    .order("first_name")
    .range(from, to);

  if (params.search) {
    q = q.or(
      `surname.ilike.%${params.search}%,first_name.ilike.%${params.search}%,admission_no.ilike.%${params.search}%`,
    );
  }
  if (params.status) q = q.eq("status", params.status);

  const { data, count } = await q;
  return { rows: data ?? [], total: count ?? 0, page, pageSize };
}

export async function getStudent(id: string) {
  const s = await createServerSupabase();
  const { data } = await s.from("students").select("*").eq("id", id).single();
  return data;
}

// ─── Staff ───────────────────────────────────────────────────
export async function listStaff(params: ListParams = {}) {
  const s = await createServerSupabase();
  const page = params.page ?? 1;
  const pageSize = params.pageSize ?? 25;
  const from = (page - 1) * pageSize;
  const to = from + pageSize - 1;

  let q = s
    .from("staff")
    .select("*, departments(name)", { count: "exact" })
    .order("surname")
    .order("first_name")
    .range(from, to);

  if (params.search) {
    q = q.or(
      `surname.ilike.%${params.search}%,first_name.ilike.%${params.search}%,staff_no.ilike.%${params.search}%`,
    );
  }

  const { data, count } = await q;
  return { rows: data ?? [], total: count ?? 0, page, pageSize };
}

export async function getStaff(id: string) {
  const s = await createServerSupabase();
  const { data } = await s
    .from("staff")
    .select("*, departments(name)")
    .eq("id", id)
    .single();
  return data;
}

// ─── Parents ─────────────────────────────────────────────────
export async function listParents(params: ListParams = {}) {
  const s = await createServerSupabase();
  const page = params.page ?? 1;
  const pageSize = params.pageSize ?? 25;
  const from = (page - 1) * pageSize;
  const to = from + pageSize - 1;

  let q = s
    .from("parents")
    .select("*", { count: "exact" })
    .order("surname")
    .order("first_name")
    .range(from, to);

  if (params.search) {
    q = q.or(
      `surname.ilike.%${params.search}%,first_name.ilike.%${params.search}%,email.ilike.%${params.search}%`,
    );
  }

  const { data, count } = await q;
  return { rows: data ?? [], total: count ?? 0, page, pageSize };
}

export async function getParent(id: string) {
  const s = await createServerSupabase();
  const { data } = await s.from("parents").select("*").eq("id", id).single();
  const { data: links } = await s
    .from("parent_student")
    .select(
      "relationship,is_primary,students(id,admission_no,surname,first_name,other_names)",
    )
    .eq("parent_id", id);
  return { parent: data, links: links ?? [] };
}

// ─── Settings + lookups ──────────────────────────────────────
export async function listPassportSettings() {
  const s = await createServerSupabase();
  const { data } = await s
    .from("school_settings")
    .select("passport_photo")
    .eq("id", 1)
    .single();
  return (
    (data?.passport_photo as { width: number; height: number; max_kb: number }) ?? {
      width: 400,
      height: 500,
      max_kb: 200,
    }
  );
}

export async function listSystemList(key: string) {
  const s = await createServerSupabase();
  const { data } = await s
    .from("system_lists")
    .select("item_key,item_label")
    .eq("list_key", key)
    .eq("is_active", true)
    .order("sort_order");
  return data ?? [];
}

export async function listStudentOptions() {
  const s = await createServerSupabase();
  const { data } = await s
    .from("students")
    .select("id,admission_no,surname,first_name")
    .eq("status", "active")
    .order("surname");
  return data ?? [];
}

// ─── Photo URL (signed, expires in 1 hour) ──────────────────
export async function getPhotoUrl(path: string | null): Promise<string | null> {
  if (!path) return null;
  const s = await createServerSupabase();
  const { data } = await s.storage
    .from("passports")
    .createSignedUrl(path, 60 * 60);
  return data?.signedUrl ?? null;
}