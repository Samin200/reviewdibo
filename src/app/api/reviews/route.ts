import { db } from "@/db";
import { reviews, products, users } from "@/db/schema";
import { eq, desc } from "drizzle-orm";

export const dynamic = "force-dynamic";

/**
 * GET /api/reviews
 * Return all reviews joined with product title and user name.
 * Used by the admin panel reviews tab.
 */
export async function GET() {
  try {
    const rows = await db
      .select({
        id: reviews.id,
        productId: reviews.productId,
        userId: reviews.userId,
        rating: reviews.rating,
        comment: reviews.comment,
        createdAt: reviews.createdAt,
        productTitle: products.title,
        userName: users.name,
        userEmail: users.email,
      })
      .from(reviews)
      .innerJoin(products, eq(reviews.productId, products.id))
      .innerJoin(users, eq(reviews.userId, users.id))
      .orderBy(desc(reviews.createdAt));

    return Response.json(rows);
  } catch (err) {
    console.error("GET /api/reviews failed:", err);
    return Response.json({ detail: "Failed to load reviews" }, { status: 500 });
  }
}

/**
 * POST /api/reviews
 * Create a review for a product by a user. Rating must be an integer 1-5.
 */
export async function POST(request: Request) {
  try {
    const body = await request.json().catch(() => null);
    if (!body) {
      return Response.json({ detail: "Invalid JSON body" }, { status: 400 });
    }

    const productId = Number(body.product_id);
    const userId = Number(body.user_id);
    const rating = Number(body.rating);
    const comment = typeof body.comment === "string" ? body.comment.trim() : "";

    if (!Number.isInteger(productId) || !Number.isInteger(userId)) {
      return Response.json(
        { detail: "Valid product_id and user_id are required" },
        { status: 400 }
      );
    }

    if (!Number.isInteger(rating) || rating < 1 || rating > 5) {
      return Response.json(
        { detail: "rating must be an integer between 1 and 5" },
        { status: 400 }
      );
    }

    if (!comment) {
      return Response.json({ detail: "comment is required" }, { status: 400 });
    }

    // Validate foreign keys exist for friendlier errors than a DB constraint.
    const [product] = await db
      .select({ id: products.id })
      .from(products)
      .where(eq(products.id, productId));
    if (!product) {
      return Response.json({ detail: "Product not found" }, { status: 404 });
    }

    const [user] = await db
      .select({ id: users.id })
      .from(users)
      .where(eq(users.id, userId));
    if (!user) {
      return Response.json({ detail: "User not found" }, { status: 404 });
    }

    const [created] = await db
      .insert(reviews)
      .values({ productId, userId, rating, comment })
      .returning();

    return Response.json(created, { status: 201 });
  } catch (err) {
    console.error("POST /api/reviews failed:", err);
    return Response.json({ detail: "Failed to create review" }, { status: 500 });
  }
}
