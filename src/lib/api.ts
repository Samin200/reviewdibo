

const API_BASE = process.env.NEXT_PUBLIC_API_URL?.replace(/\/$/, "") ?? "";

// ---------- Types ----------

export interface ProductSummary {
  id: number;
  title: string;
  description: string;
  imageUrl: string | null;
  createdAt: string;
  averageRating: number;
  reviewCount: number;
}

export interface ReviewWithUser {
  id: number;
  productId: number;
  userId: number;
  rating: number;
  comment: string;
  createdAt: string;
  user: string;
}

export interface ProductDetail {
  id: number;
  title: string;
  description: string;
  imageUrl: string | null;
  createdAt: string;
  averageRating: number;
  reviewCount: number;
  reviews: ReviewWithUser[];
}

export interface User {
  id: number;
  name: string;
  email: string;
  createdAt: string;
}

export interface Review {
  id: number;
  productId: number;
  userId: number;
  rating: number;
  comment: string;
  createdAt: string;
}

// ---------- Helpers ----------


async function request<T>(path: string, init?: RequestInit): Promise<T> {
  let res: Response;
  try {
    res = await fetch(`${API_BASE}${path}`, {
      ...init,
      headers: {
        "Content-Type": "application/json",
        ...(init?.headers ?? {}),
      },
      cache: "no-store",
    });
  } catch {
    throw new Error("Network error — could not reach the server.");
  }

  if (!res.ok) {
    // FastAPI and our Next routes both return { detail: string } on error.
    let detail = `Request failed (${res.status})`;
    try {
      const body = await res.json();
      if (body?.detail) detail = body.detail;
    } catch {
      /* ignore non-JSON error bodies */
    }
    throw new Error(detail);
  }

  return res.json() as Promise<T>;
}

// ---------- Products ----------

export function getProducts(): Promise<ProductSummary[]> {
  return request<ProductSummary[]>("/api/products");
}

export function getProduct(id: number | string): Promise<ProductDetail> {
  return request<ProductDetail>(`/api/products/${id}`);
}

export function createProduct(input: {
  title: string;
  description: string;
  image_url?: string | null;
}): Promise<ProductSummary> {
  return request<ProductSummary>("/api/products", {
    method: "POST",
    body: JSON.stringify(input),
  });
}

// ---------- Users ----------

export function createUser(input: {
  name: string;
  email: string;
}): Promise<User> {
  return request<User>("/api/users", {
    method: "POST",
    body: JSON.stringify(input),
  });
}

// ---------- Reviews ----------

export function createReview(input: {
  product_id: number;
  user_id: number;
  rating: number;
  comment: string;
}): Promise<Review> {
  return request<Review>("/api/reviews", {
    method: "POST",
    body: JSON.stringify(input),
  });
}

export function updateReview(
  id: number,
  input: { rating?: number; comment?: string }
): Promise<Review> {
  return request<Review>(`/api/reviews/${id}`, {
    method: "PUT",
    body: JSON.stringify(input),
  });
}

export function deleteReview(id: number): Promise<{ ok: boolean; id: number }> {
  return request<{ ok: boolean; id: number }>(`/api/reviews/${id}`, {
    method: "DELETE",
  });
}
