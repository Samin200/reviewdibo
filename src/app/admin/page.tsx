"use client";

import { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Swal from "sweetalert2";
import StarRating from "@/components/StarRating";

type Tab = "products" | "reviews";

interface AdminUser {
  id: number;
  name: string;
  email: string;
  role: string;
}

interface AdminProduct {
  id: number;
  title: string;
  description: string;
  imageUrl: string | null;
  averageRating: number;
  reviewCount: number;
}

interface AdminReview {
  id: number;
  productId: number;
  userId: number;
  rating: number;
  comment: string;
  createdAt: string;
  productTitle: string;
  userName: string;
  userEmail: string;
}

function formatDate(iso: string): string {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "";
  return d.toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

export default function AdminPage() {
  const router = useRouter();
  const [tab, setTab] = useState<Tab>("products");
  const [user, setUser] = useState<AdminUser | null>(null);
  const [loadingAuth, setLoadingAuth] = useState(true);

  // Products
  const [products, setProducts] = useState<AdminProduct[]>([]);
  const [loadingProducts, setLoadingProducts] = useState(false);

  // Add product form
  const [showAddForm, setShowAddForm] = useState(false);
  const [newTitle, setNewTitle] = useState("");
  const [newDesc, setNewDesc] = useState("");
  const [newImageUrl, setNewImageUrl] = useState("");
  const [adding, setAdding] = useState(false);

  // Edit product
  const [editingProductId, setEditingProductId] = useState<number | null>(null);
  const [editTitle, setEditTitle] = useState("");
  const [editDesc, setEditDesc] = useState("");
  const [editImageUrl, setEditImageUrl] = useState("");
  const [saving, setSaving] = useState(false);

  // Reviews
  const [reviews, setReviews] = useState<AdminReview[]>([]);
  const [loadingReviews, setLoadingReviews] = useState(false);
  const [filterProductId, setFilterProductId] = useState<string>("all");

  // Check auth on mount
  useEffect(() => {
    fetch("/api/auth/me")
      .then((r) => r.json())
      .then((data) => {
        if (data?.role === "admin") {
          setUser(data);
        } else {
          router.push("/login?redirect=/admin");
        }
      })
      .catch(() => router.push("/login"))
      .finally(() => setLoadingAuth(false));
  }, [router]);

  // Load products
  const loadProducts = useCallback(async () => {
    setLoadingProducts(true);
    try {
      const res = await fetch("/api/products");
      setProducts(await res.json());
    } catch {
      /* ignore */
    } finally {
      setLoadingProducts(false);
    }
  }, []);

  // Load reviews
  const loadReviews = useCallback(async () => {
    setLoadingReviews(true);
    try {
      const res = await fetch("/api/reviews");
      setReviews(await res.json());
    } catch {
      /* ignore */
    } finally {
      setLoadingReviews(false);
    }
  }, []);

  useEffect(() => {
    if (!user) return;
    if (tab === "products") loadProducts();
    if (tab === "reviews") loadReviews();
  }, [user, tab, loadProducts, loadReviews]);

  // Handle logout
  async function handleLogout() {
    await fetch("/api/auth/logout", { method: "POST" });
    router.push("/login");
  }

  // Add product
  async function handleAddProduct(e: React.FormEvent) {
    e.preventDefault();
    if (!newTitle.trim() || !newDesc.trim()) return;
    setAdding(true);
    try {
      await fetch("/api/products", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: newTitle.trim(),
          description: newDesc.trim(),
          image_url: newImageUrl.trim() || null,
        }),
      });
      setNewTitle("");
      setNewDesc("");
      setNewImageUrl("");
      setShowAddForm(false);
      await loadProducts();
    } catch {
      /* ignore */
    } finally {
      setAdding(false);
    }
  }

  // Edit product
  function startEditing(p: AdminProduct) {
    setEditingProductId(p.id);
    setEditTitle(p.title);
    setEditDesc(p.description);
    setEditImageUrl(p.imageUrl || "");
  }

  async function handleEditProduct(e: React.FormEvent) {
    e.preventDefault();
    if (!editTitle.trim() || !editDesc.trim()) return;
    setSaving(true);
    try {
      await fetch(`/api/products/${editingProductId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: editTitle.trim(),
          description: editDesc.trim(),
          image_url: editImageUrl.trim() || null,
        }),
      });
      setEditingProductId(null);
      await loadProducts();
    } catch {
      /* ignore */
    } finally {
      setSaving(false);
    }
  }

  // Delete product
  async function handleDeleteProduct(id: number) {
    const result = await Swal.fire({
      title: "Delete product?",
      text: "All reviews for this product will also be deleted. This cannot be undone.",
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Delete",
      confirmButtonColor: "#e11d48",
      cancelButtonText: "Cancel",
    });
    if (!result.isConfirmed) return;
    try {
      await fetch(`/api/products/${id}`, { method: "DELETE" });
      await loadProducts();
    } catch {
      /* ignore */
    }
  }

  // Delete review
  async function handleDeleteReview(id: number) {
    const result = await Swal.fire({
      title: "Delete review?",
      text: "This cannot be undone.",
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Delete",
      confirmButtonColor: "#e11d48",
      cancelButtonText: "Cancel",
    });
    if (!result.isConfirmed) return;
    try {
      await fetch(`/api/reviews/${id}`, { method: "DELETE" });
      if (tab === "reviews") await loadReviews();
    } catch {
      /* ignore */
    }
  }

  if (loadingAuth) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="h-10 w-10 animate-spin rounded-full border-4 border-indigo-600 border-t-transparent" />
      </div>
    );
  }

  if (!user) return null;

  const filteredReviews =
    filterProductId === "all"
      ? reviews
      : reviews.filter((r) => r.productId === Number(filterProductId));

  // Unique products for the review filter dropdown
  const reviewProductIds = [...new Set(reviews.map((r) => r.productId))];
  const reviewProductNames = reviewProductIds.map((pid) => {
    const found = reviews.find((r) => r.productId === pid);
    return { id: pid, title: found?.productTitle || `Product #${pid}` };
  });

  return (
    <main className="min-h-screen bg-gray-50">
      {/* Admin Header */}
      <header className="sticky top-0 z-40 h-16 w-full border-b border-gray-200 bg-white shadow-sm">
        <div className="mx-auto flex h-full max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-3">
            <Link href="/" className="flex items-center gap-2">
              <span className="text-2xl font-bold tracking-tight text-indigo-600">ReviewDibo</span>
            </Link>
            <span className="flex items-center gap-1 rounded-full bg-amber-50 px-3 py-1 text-xs font-bold text-amber-700 border border-amber-200">
              <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m9-.75a9 9 0 11-18 0 9 9 0 0118 0zm-9 3.75h.008v.008H12v-.008z" />
              </svg>
              Admin
            </span>
          </div>
          <div className="flex items-center gap-4">
            <span className="text-sm text-gray-500 hidden sm:block">{user.name}</span>
            <button
              onClick={handleLogout}
              className="rounded-lg border border-gray-200 px-4 py-2 text-sm font-bold text-gray-600 transition-all hover:border-rose-200 hover:text-rose-600 bg-white"
            >
              Logout
            </button>
          </div>
        </div>
      </header>

      <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
        {/* Tab Navigation */}
        <div className="flex gap-2 border-b border-gray-200 pb-4 mb-8">
          <button
            onClick={() => setTab("products")}
            className={`px-5 py-2.5 rounded-lg text-sm font-bold transition-all ${
              tab === "products"
                ? "bg-indigo-600 text-white shadow-sm"
                : "text-gray-500 hover:text-gray-700 hover:bg-gray-100"
            }`}
          >
            Products
          </button>
          <button
            onClick={() => setTab("reviews")}
            className={`px-5 py-2.5 rounded-lg text-sm font-bold transition-all ${
              tab === "reviews"
                ? "bg-indigo-600 text-white shadow-sm"
                : "text-gray-500 hover:text-gray-700 hover:bg-gray-100"
            }`}
          >
            Reviews
          </button>
        </div>

        {/* ======= Products Tab ======= */}
        {tab === "products" && (
          <div>
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-gray-900">
                Products <span className="text-gray-400 font-medium">({products.length})</span>
              </h2>
              <button
                onClick={() => setShowAddForm(!showAddForm)}
                className="btn-primary bg-emerald-600 hover:bg-emerald-700 shadow-lg shadow-emerald-200"
              >
                {showAddForm ? "Cancel" : "+ Add Product"}
              </button>
            </div>

            {/* Add Product Form */}
            {showAddForm && (
              <form
                onSubmit={handleAddProduct}
                className="mb-8 rounded-2xl border border-gray-100 bg-white p-6 shadow-sm"
              >
                <h3 className="text-lg font-bold text-gray-900 mb-4">New Product</h3>
                <div className="grid gap-4 sm:grid-cols-2">
                  <div>
                    <label className="mb-1 block text-sm font-semibold text-gray-700">Title</label>
                    <input
                      type="text"
                      required
                      value={newTitle}
                      onChange={(e) => setNewTitle(e.target.value)}
                      className="input-field"
                      placeholder="Product name"
                    />
                  </div>
                  <div>
                    <label className="mb-1 block text-sm font-semibold text-gray-700">Image URL</label>
                    <input
                      type="url"
                      value={newImageUrl}
                      onChange={(e) => setNewImageUrl(e.target.value)}
                      className="input-field"
                      placeholder="https://..."
                    />
                    {newImageUrl && (
                      <img
                        src={newImageUrl}
                        alt="Preview"
                        className="mt-2 h-20 w-20 rounded-lg object-cover border"
                      />
                    )}
                  </div>
                </div>
                <div className="mt-4">
                  <label className="mb-1 block text-sm font-semibold text-gray-700">Description</label>
                  <textarea
                    required
                    value={newDesc}
                    onChange={(e) => setNewDesc(e.target.value)}
                    className="input-field resize-none"
                    rows={3}
                    placeholder="Describe the product..."
                  />
                </div>
                <button
                  type="submit"
                  disabled={adding}
                  className="btn-primary mt-5 bg-indigo-600"
                >
                  {adding ? "Adding..." : "Create Product"}
                </button>
              </form>
            )}

            {/* Products Table */}
            {loadingProducts ? (
              <div className="flex items-center justify-center py-16">
                <div className="h-8 w-8 animate-spin rounded-full border-4 border-indigo-600 border-t-transparent" />
              </div>
            ) : products.length === 0 ? (
              <div className="text-center py-16 text-gray-500">No products yet.</div>
            ) : (
              <div className="overflow-x-auto rounded-2xl border border-gray-100 bg-white shadow-sm">
                <table className="w-full min-w-[700px] text-left">
                  <thead>
                    <tr className="border-b border-gray-100 bg-gray-50">
                      <th className="px-6 py-4 text-xs font-bold uppercase tracking-widest text-gray-500">Image</th>
                      <th className="px-6 py-4 text-xs font-bold uppercase tracking-widest text-gray-500">Title</th>
                      <th className="px-6 py-4 text-xs font-bold uppercase tracking-widest text-gray-500 hidden md:table-cell">Rating</th>
                      <th className="px-6 py-4 text-xs font-bold uppercase tracking-widest text-gray-500">Reviews</th>
                      <th className="px-6 py-4 text-xs font-bold uppercase tracking-widest text-gray-500">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {products.map((p) => (
                      <tr key={p.id} className="border-b border-gray-50 hover:bg-gray-50/50 transition-colors">
                        <td className="px-6 py-4">
                          {p.imageUrl ? (
                            <img src={p.imageUrl} alt="" className="h-12 w-16 rounded-lg object-cover" />
                          ) : (
                            <div className="h-12 w-16 rounded-lg bg-gray-100 flex items-center justify-center text-xs text-gray-400">—</div>
                          )}
                        </td>
                        <td className="px-6 py-4">
                          {editingProductId === p.id ? (
                            <form onSubmit={handleEditProduct} className="space-y-2">
                              <input
                                type="text"
                                required
                                value={editTitle}
                                onChange={(e) => setEditTitle(e.target.value)}
                                className="w-full rounded-lg border border-gray-200 px-3 py-1.5 text-sm font-medium outline-none focus:ring-2 focus:ring-indigo-500"
                              />
                              <textarea
                                required
                                value={editDesc}
                                onChange={(e) => setEditDesc(e.target.value)}
                                className="w-full rounded-lg border border-gray-200 px-3 py-1.5 text-xs outline-none focus:ring-2 focus:ring-indigo-500 resize-none"
                                rows={2}
                              />
                              <input
                                type="url"
                                value={editImageUrl}
                                onChange={(e) => setEditImageUrl(e.target.value)}
                                className="w-full rounded-lg border border-gray-200 px-3 py-1.5 text-xs outline-none focus:ring-2 focus:ring-indigo-500"
                                placeholder="Image URL"
                              />
                              <div className="flex gap-1.5">
                                <button
                                  type="submit"
                                  disabled={saving}
                                  className="rounded-lg bg-indigo-600 px-3 py-1.5 text-xs font-bold text-white hover:bg-indigo-700"
                                >
                                  {saving ? "Saving..." : "Save"}
                                </button>
                                <button
                                  type="button"
                                  onClick={() => setEditingProductId(null)}
                                  className="rounded-lg border border-gray-200 px-3 py-1.5 text-xs font-bold text-gray-600 hover:bg-gray-50"
                                >
                                  Cancel
                                </button>
                              </div>
                            </form>
                          ) : (
                            <>
                              <p className="font-bold text-gray-900">{p.title}</p>
                              <p className="text-xs text-gray-500 mt-0.5 line-clamp-1">{p.description}</p>
                            </>
                          )}
                        </td>
                        <td className="px-6 py-4 hidden md:table-cell">
                          <div className="flex items-center gap-2">
                            <StarRating value={p.averageRating} size="sm" />
                            <span className="text-sm font-bold text-gray-900">{p.averageRating.toFixed(1)}</span>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <span className="font-medium text-gray-900">{p.reviewCount}</span>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-1.5">
                            <button
                              onClick={() => startEditing(p)}
                              className="rounded-lg border border-gray-200 px-3 py-1.5 text-xs font-bold text-gray-600 transition-all hover:bg-gray-50 hover:border-indigo-200 hover:text-indigo-600"
                            >
                              Edit
                            </button>
                            <button
                              onClick={() => handleDeleteProduct(p.id)}
                              className="rounded-lg border border-rose-200 px-3 py-1.5 text-xs font-bold text-rose-600 transition-all hover:bg-rose-50"
                            >
                              Delete
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {/* ======= Reviews Tab ======= */}
        {tab === "reviews" && (
          <div>
            <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
              <h2 className="text-2xl font-bold text-gray-900">
                Reviews <span className="text-gray-400 font-medium">({reviews.length} total)</span>
              </h2>
              <div className="flex items-center gap-3">
                <label className="text-sm font-semibold text-gray-600">Filter by product:</label>
                <select
                  value={filterProductId}
                  onChange={(e) => setFilterProductId(e.target.value)}
                  className="rounded-lg border border-gray-200 bg-white px-4 py-2 text-sm font-medium text-gray-700 outline-none focus:ring-2 focus:ring-indigo-500"
                >
                  <option value="all">All Products</option>
                  {reviewProductNames.map((rp) => (
                    <option key={rp.id} value={rp.id}>
                      {rp.title}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {loadingReviews ? (
              <div className="flex items-center justify-center py-16">
                <div className="h-8 w-8 animate-spin rounded-full border-4 border-indigo-600 border-t-transparent" />
              </div>
            ) : filteredReviews.length === 0 ? (
              <div className="text-center py-16 text-gray-500">No reviews found.</div>
            ) : (
              <div className="space-y-4">
                {filteredReviews.map((r) => (
                  <div
                    key={r.id}
                    className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm transition-all hover:shadow-md"
                  >
                    <div className="flex items-center justify-between gap-4">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-3 flex-wrap">
                          <span className="font-bold text-gray-900">{r.userName}</span>
                          <span className="text-xs text-gray-400">on</span>
                          <span className="font-bold text-indigo-600">{r.productTitle}</span>
                          <StarRating value={r.rating} size="sm" />
                        </div>
                        <p className="mt-2 text-sm text-gray-600">
                          {r.comment.length > 80
                            ? r.comment.substring(0, 80) + "..."
                            : r.comment}
                        </p>
                        <p className="mt-2 text-xs text-gray-400">{formatDate(r.createdAt)}</p>
                      </div>
                      <button
                        onClick={() => handleDeleteReview(r.id)}
                        className="shrink-0 rounded-lg border border-rose-200 px-3 py-1.5 text-xs font-bold text-rose-600 transition-all hover:bg-rose-50"
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </main>
  );
}
