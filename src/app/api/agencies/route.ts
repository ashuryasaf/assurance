import { prisma } from "@/lib/db";
import { requireUser } from "@/lib/dal";
import { handleError, ok } from "@/lib/api";
import { safeJSON } from "@/lib/json";

export async function GET() {
  try {
    const me = await requireUser();
    // Restrict by agencyId if user is scoped to one
    const where = me.agencyId ? { OR: [{ id: me.agencyId }, { parentAgencyId: me.agencyId }] } : {};
    const agencies = await prisma.agency.findMany({
      where,
      include: {
        subAgencies: true,
        agents: true,
      },
    });
    return ok({
      agencies: agencies.map((a) => ({
        id: a.id,
        name: a.name,
        licenseNumber: a.licenseNumber,
        ownerId: a.ownerId,
        address: a.address,
        phone: a.phone,
        email: a.email,
        isActive: a.isActive,
        regulatoryStatus: a.regulatoryStatus,
        createdAt: a.createdAt.toISOString().split("T")[0],
        parentAgencyId: a.parentAgencyId ?? undefined,
        subAgencies: a.subAgencies.map((sub) => ({
          id: sub.id,
          name: sub.name,
          licenseNumber: sub.licenseNumber,
          parentAgencyId: sub.parentAgencyId ?? undefined,
          ownerId: sub.ownerId,
          address: sub.address,
          phone: sub.phone,
          email: sub.email,
          isActive: sub.isActive,
          regulatoryStatus: sub.regulatoryStatus,
          createdAt: sub.createdAt.toISOString().split("T")[0],
        })),
        agents: a.agents.map((u) => ({
          id: u.id,
          email: u.email,
          firstName: u.firstName,
          lastName: u.lastName,
          phone: u.phone,
          idNumber: u.idNumber,
          role: u.role,
          permissions: safeJSON<string[]>(u.permissions, []),
          licenseNumber: u.licenseNumber ?? undefined,
          specializations: u.specializations
            ? safeJSON<string[]>(u.specializations, [])
            : undefined,
          isActive: u.isActive,
          createdAt: u.createdAt.toISOString().split("T")[0],
          lastLogin: u.lastLogin?.toISOString().split("T")[0],
          agencyId: u.agencyId ?? undefined,
        })),
      })),
    });
  } catch (error) {
    return handleError(error);
  }
}
