import { AppError, type AppErrorPayload } from "./AppError";

export type ActionResult<T> =
  | { ok: true; data: T }
  | { ok: false; error: AppErrorPayload };

export async function safeAction<T>(fn: () => Promise<T>): Promise<ActionResult<T>> {
  try {
    const data = await fn();
    return { ok: true, data };
  } catch (err) {
    if (err instanceof AppError) {
      return { ok: false, error: err.toPayload() };
    }
    // Log real errors server-side; never leak to client
    console.error("[UnhandledActionError]", err);
    return {
      ok: false,
      error: { code: "INTERNAL", message: "We could not complete this action. Please try again." },
    };
  }
}