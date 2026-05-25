import "server-only";
import { NextResponse } from "next/server";
import { ZodError, type ZodSchema } from "zod";
import { HttpError } from "@/lib/dal";

export function ok<T>(data: T, init?: ResponseInit): NextResponse {
  return NextResponse.json(data, init);
}

export function err(status: number, message: string, extra?: Record<string, unknown>) {
  return NextResponse.json({ error: message, ...extra }, { status });
}

export function handleError(error: unknown): NextResponse {
  if (error instanceof HttpError) {
    return err(error.status, error.message);
  }
  if (error instanceof ZodError) {
    return err(400, "Invalid request body", { issues: error.issues });
  }
  console.error("[api] unhandled error:", error);
  return err(500, "Internal server error");
}

export async function parseJSON<T>(req: Request, schema: ZodSchema<T>): Promise<T> {
  let body: unknown;
  try {
    body = await req.json();
  } catch {
    throw new HttpError(400, "Invalid JSON body");
  }
  return schema.parse(body);
}
