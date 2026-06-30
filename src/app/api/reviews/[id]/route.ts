import { db } from "@/db";
import { reviews, users } from "@/db/schema";
import { eq } from "drizzle-orm";
import { verifyToken } from "@/lib/auth";

export const dynamic = "force-dynamic";

async function getUserId(request: Request): Promise<number | null> {
  const cookieHeader = request.headers.get("cookie") || "";
  const match = cookieHeader.match(/auth_token=([^;]+)/);
  const token = match ? match[1] : null;
  if (!token) return null;
  const payload = await verifyToken(token);
  return payload?.userId ?? null;
}

async function assertOwnership(reviewId: number, userId: number) {
  const [review] = await db
    .select({ userId: reviews.userId })
    .from(reviews)
    .where(eq(reviews.id, reviewId));
  if (!review) return { error: "Review not found", status: 404 } as const;
  if (review.userId !== userId) {
    const [user] = await db
      .select({ role: users.role })
      .from(users)
      .where(eq(users.id, userId));
    if (!user || user.role !== "admin") {
      return { error: "You can only edit your own reviews", status: 403 } as const;
    }
  }
  return null;
}

/**
 * PUT /api/reviews/{id}
 * Update an existing review's rating and/or comment.
 * Must be the review author or an admin.
 */
export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const reviewId = Number(id);
    if (!Number.isInteger(reviewId)) {
      return Response.json({ detail: "Invalid review id" }, { status: 400 });
    }

    const userId = await getUserId(request);
    if (!userId) {
      return Response.json({ detail: "You must be logged in" }, { status: 401 });
    }

    const ownership = await assertOwnership(reviewId, userId);
    if (ownership) {
      return Response.json({ detail: ownership.error }, { status: ownership.status });
    }

    const body = await request.json().catch(() => null);
    if (!body) {
      return Response.json({ detail: "Invalid JSON body" }, { status: 400 });
    }

    const updates: { rating?: number; comment?: string } = {};

    if (body.rating !== undefined) {
      const rating = Number(body.rating);
      if (!Number.isInteger(rating) || rating < 1 || rating > 5) {
        return Response.json(
          { detail: "rating must be an integer between 1 and 5" },
          { status: 400 }
        );
      }
      updates.rating = rating;
    }

    if (body.comment !== undefined) {
      const comment =
        typeof body.comment === "string" ? body.comment.trim() : "";
      if (!comment) {
        return Response.json(
          { detail: "comment cannot be empty" },
          { status: 400 }
        );
      }
      updates.comment = comment;
    }

    if (Object.keys(updates).length === 0) {
      return Response.json(
        { detail: "Nothing to update" },
        { status: 400 }
      );
    }

    const [updated] = await db
      .update(reviews)
      .set(updates)
      .where(eq(reviews.id, reviewId))
      .returning();

    return Response.json(updated);
  } catch (err) {
    console.error("PUT /api/reviews/[id] failed:", err);
    return Response.json({ detail: "Failed to update review" }, { status: 500 });
  }
}

/**
 * DELETE /api/reviews/{id}
 * Remove a review. Must be the review author or an admin.
 */
export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const reviewId = Number(id);
    if (!Number.isInteger(reviewId)) {
      return Response.json({ detail: "Invalid review id" }, { status: 400 });
    }

    const userId = await getUserId(request);
    if (!userId) {
      return Response.json({ detail: "You must be logged in" }, { status: 401 });
    }

    const ownership = await assertOwnership(reviewId, userId);
    if (ownership) {
      return Response.json({ detail: ownership.error }, { status: ownership.status });
    }

    const [deleted] = await db
      .delete(reviews)
      .where(eq(reviews.id, reviewId))
      .returning();

    return Response.json({ ok: true, id: reviewId });
  } catch (err) {
    console.error("DELETE /api/reviews/[id] failed:", err);
    return Response.json({ detail: "Failed to delete review" }, { status: 500 });
  }
}
