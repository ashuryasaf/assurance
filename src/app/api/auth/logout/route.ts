import { destroySession } from "@/lib/session";
import { handleError, ok } from "@/lib/api";

export async function POST() {
  try {
    await destroySession();
    return ok({ ok: true });
  } catch (error) {
    return handleError(error);
  }
}
