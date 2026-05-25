import { prisma } from "@/lib/db";
import { handleError, ok } from "@/lib/api";
import { safeJSON } from "@/lib/json";

export async function GET() {
  try {
    const products = await prisma.marketplaceProduct.findMany({
      where: { isActive: true },
      orderBy: { createdAt: "desc" },
    });
    return ok({
      products: products.map((p) => ({
        id: p.id,
        name: p.name,
        provider: p.provider,
        category: p.category,
        price: p.price,
        rating: p.rating,
        features: safeJSON<string[]>(p.features, []),
      })),
    });
  } catch (error) {
    return handleError(error);
  }
}
