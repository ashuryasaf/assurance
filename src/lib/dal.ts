import "server-only";
import { cache } from "react";
import { prisma } from "@/lib/db";
import { readSession } from "@/lib/session";
import type { UserRole } from "@/lib/types";
import { hasPermission } from "@/lib/types";
import { safeJSON } from "@/lib/json";

export type CurrentUser = {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  phone: string;
  idNumber: string;
  role: UserRole;
  permissions: string[];
  agencyId?: string;
  parentAgentId?: string;
  licenseNumber?: string;
  specializations?: string[];
  isActive: boolean;
  createdAt: string;
  lastLogin?: string;
};

export const verifySession = cache(async () => {
  const session = await readSession();
  if (!session) return null;
  return session;
});

export const getCurrentUser = cache(async (): Promise<CurrentUser | null> => {
  const session = await verifySession();
  if (!session) return null;

  const user = await prisma.user.findUnique({ where: { id: session.userId } });
  if (!user || !user.isActive) return null;

  return toCurrentUser(user);
});

export function toCurrentUser(user: {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  phone: string;
  idNumber: string;
  role: string;
  permissions: string;
  agencyId: string | null;
  parentAgentId: string | null;
  licenseNumber: string | null;
  specializations: string | null;
  isActive: boolean;
  createdAt: Date;
  lastLogin: Date | null;
}): CurrentUser {
  return {
    id: user.id,
    email: user.email,
    firstName: user.firstName,
    lastName: user.lastName,
    phone: user.phone,
    idNumber: user.idNumber,
    role: user.role as UserRole,
    permissions: safeJSON<string[]>(user.permissions, []),
    agencyId: user.agencyId ?? undefined,
    parentAgentId: user.parentAgentId ?? undefined,
    licenseNumber: user.licenseNumber ?? undefined,
    specializations: user.specializations
      ? safeJSON<string[]>(user.specializations, [])
      : undefined,
    isActive: user.isActive,
    createdAt: user.createdAt.toISOString(),
    lastLogin: user.lastLogin?.toISOString(),
  };
}

export async function requireUser(): Promise<CurrentUser> {
  const user = await getCurrentUser();
  if (!user) {
    throw new HttpError(401, "Authentication required");
  }
  return user;
}

export async function requireRole(minRole: UserRole): Promise<CurrentUser> {
  const user = await requireUser();
  if (!hasPermission(user.role, minRole)) {
    throw new HttpError(403, "Forbidden");
  }
  return user;
}

export class HttpError extends Error {
  constructor(public status: number, message: string) {
    super(message);
  }
}
