import { db } from "@/db";
import { products, reviews, users } from "@/db/schema";
import { eq, desc } from "drizzle-orm";

export const dynamic = "force-dynamic";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const productId = Number(id);
    if (!Number.isInteger(productId)) {
      return Response.json({ detail: "Invalid product id" }, { status: 400 });
    }

    const [product] = await db
      .select()
      .from(products)
      .where(eq(products.id, productId));

    if (!product) {
      return Response.json({ detail: "Product not found" }, { status: 404 });
    }

    // Join reviews with users so each review carries the reviewer's name.
    const reviewRows = await db
      .select({
        id: reviews.id,
        productId: reviews.productId,
        userId: reviews.userId,
        rating: reviews.rating,
        comment: reviews.comment,
        createdAt: reviews.createdAt,
        userName: users.name,
      })
      .from(reviews)
      .innerJoin(users, eq(reviews.userId, users.id))
      .where(eq(reviews.productId, productId))
      .orderBy(desc(reviews.createdAt));

    const reviewCount = reviewRows.length;
    const averageRating =
      reviewCount === 0
        ? 0
        : reviewRows.reduce((sum, r) => sum + r.rating, 0) / reviewCount;

    return Response.json({
      ...product,
      averageRating,
      reviewCount,
      reviews: reviewRows,
    });
  } catch (err) {
    console.error("GET /api/products/[id] failed:", err);
    return Response.json(
      { detail: "Failed to load product" },
      { status: 500 }
    );
  }
}

/**
 * PUT /api/products/{id}
 * Admin-only. Updates product title, description, and/or image_url.
 */
export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const productId = Number(id);
    if (!Number.isInteger(productId)) {
      return Response.json({ detail: "Invalid product id" }, { status: 400 });
    }

    const body = await request.json().catch(() => null);
    if (!body) {
      return Response.json({ detail: "Invalid JSON body" }, { status: 400 });
    }

    const [existing] = await db
      .select()
      .from(products)
      .where(eq(products.id, productId));

    if (!existing) {
      return Response.json({ detail: "Product not found" }, { status: 404 });
    }

    const updates: { title?: string; description?: string; imageUrl?: string | null } = {};

    if (body.title !== undefined) {
      const title = typeof body.title === "string" ? body.title.trim() : "";
      if (!title) {
        return Response.json({ detail: "title cannot be empty" }, { status: 400 });
      }
      updates.title = title;
    }

    if (body.description !== undefined) {
      const description = typeof body.description === "string" ? body.description.trim() : "";
      if (!description) {
        return Response.json({ detail: "description cannot be empty" }, { status: 400 });
      }
      updates.description = description;
    }

    if (body.image_url !== undefined) {
      updates.imageUrl = typeof body.image_url === "string" && body.image_url.trim()
        ? body.image_url.trim()
        : null;
    }

    if (Object.keys(updates).length === 0) {
      return Response.json({ detail: "Nothing to update" }, { status: 400 });
    }

    const [updated] = await db
      .update(products)
      .set(updates)
      .where(eq(products.id, productId))
      .returning();

    return Response.json(updated);
  } catch (err) {
    console.error("PUT /api/products/[id] failed:", err);
    return Response.json({ detail: "Failed to update product" }, { status: 500 });
  }
}

/**
 * DELETE /api/products/{id}
 * Admin-only. Deletes the product (reviews cascade). Middleware already
 * enforces auth/role, so this handler only needs to execute the delete.
 */
export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const productId = Number(id);
    if (!Number.isInteger(productId)) {
      return Response.json({ detail: "Invalid product id" }, { status: 400 });
    }

    const [deleted] = await db
      .delete(products)
      .where(eq(products.id, productId))
      .returning({ id: products.id });

    if (!deleted) {
      return Response.json({ detail: "Product not found" }, { status: 404 });
    }

    return Response.json({ ok: true, id: productId });
  } catch (err) {
    console.error("DELETE /api/products/[id] failed:", err);
    return Response.json({ detail: "Failed to delete product" }, { status: 500 });
  }
}
