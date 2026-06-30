import { db } from "@/db";
import { users } from "@/db/schema";
import { eq } from "drizzle-orm";

export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  try {
    const body = await request.json().catch(() => null);
    if (!body) {
      return Response.json({ detail: "Invalid JSON body" }, { status: 400 });
    }

    const name = typeof body.name === "string" ? body.name.trim() : "";
    const email =
      typeof body.email === "string" ? body.email.trim().toLowerCase() : "";

    if (!name || !email) {
      return Response.json(
        { detail: "name and email are required" },
        { status: 400 }
      );
    }

    // Basic email sanity check.
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return Response.json(
        { detail: "A valid email is required" },
        { status: 400 }
      );
    }

    const [existing] = await db
      .select()
      .from(users)
      .where(eq(users.email, email));

    if (existing) {
      return Response.json(existing, { status: 200 });
    }

    const [created] = await db
      .insert(users)
      .values({ name, email })
      .returning();

    return Response.json(created, { status: 201 });
  } catch (err) {
    console.error("POST /api/users failed:", err);
    return Response.json({ detail: "Failed to create user" }, { status: 500 });
  }
}
