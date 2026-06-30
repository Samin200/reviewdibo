import { db } from "@/db";
import { products, reviews } from "@/db/schema";
import { eq, sql, desc } from "drizzle-orm";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const rows = await db
      .select({
        id: products.id,
        title: products.title,
        description: products.description,
        imageUrl: products.imageUrl,
        createdAt: products.createdAt,
        averageRating: sql<number>`COALESCE(AVG(${reviews.rating}), 0)`,
        reviewCount: sql<number>`COUNT(${reviews.id})`,
      })
      .from(products)
      .leftJoin(reviews, eq(reviews.productId, products.id))
      .groupBy(products.id)
      .orderBy(desc(products.createdAt));

    const data = rows.map((r) => ({
      ...r,
      averageRating: Number(r.averageRating),
      reviewCount: Number(r.reviewCount),
    }));

    return Response.json(data);
  } catch (err) {
    console.error("GET /api/products failed:", err);
    return Response.json(
      { detail: "Failed to load products" },
      { status: 500 }
    );
  }
}

/**
 * POST /api/products
 * Create a new product. Requires title + description; image_url optional.
 */
export async function POST(request: Request) {
  try {
    const body = await request.json().catch(() => null);
    if (!body) {
      return Response.json({ detail: "Invalid JSON body" }, { status: 400 });
    }

    const title = typeof body.title === "string" ? body.title.trim() : "";
    const description =
      typeof body.description === "string" ? body.description.trim() : "";
    const imageUrl =
      typeof body.image_url === "string" && body.image_url.trim().length > 0
        ? body.image_url.trim()
        : null;

    if (!title || !description) {
      return Response.json(
        { detail: "title and description are required" },
        { status: 400 }
      );
    }

    const [created] = await db
      .insert(products)
      .values({ title, description, imageUrl })
      .returning();

    return Response.json(created, { status: 201 });
  } catch (err) {
    console.error("POST /api/products failed:", err);
    return Response.json(
      { detail: "Failed to create product" },
      { status: 500 }
    );
  }
}
