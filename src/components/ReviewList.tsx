"use client";

import { useState, useEffect } from "react";
import Swal from "sweetalert2";
import StarRating from "./StarRating";
import StarRatingInput from "./StarRatingInput";

interface AuthUser {
  id: number;
  name: string;
  email: string;
  role: string;
}

function formatDate(iso: string): string {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "";
  return d.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
}

function avatarColor(name: string): string {
  const colors = ["bg-indigo-600", "bg-emerald-600", "bg-violet-600", "bg-amber-600", "bg-rose-600", "bg-sky-600"];
  let sum = 0;
  for (let i = 0; i < name.length; i++) sum += name.charCodeAt(i);
  return colors[sum % colors.length];
}

export default function ReviewList({
  reviews: initialReviews,
  onRefresh,
}: {
  reviews: { id: number; productId: number; userId: number; rating: number; comment: string; createdAt: string; user: string }[];
  onRefresh?: () => Promise<void> | void;
}) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [reviews, setReviews] = useState(initialReviews);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [editRating, setEditRating] = useState(0);
  const [editComment, setEditComment] = useState("");

  useEffect(() => {
    setReviews(initialReviews);
  }, [initialReviews]);

  useEffect(() => {
    fetch("/api/auth/me")
      .then((r) => r.json())
      .then((data) => { if (data?.id) setUser(data); })
      .catch(() => {});
  }, []);

  function startEdit(review: typeof reviews[0]) {
    setEditingId(review.id);
    setEditRating(review.rating);
    setEditComment(review.comment);
  }

  async function handleSave(reviewId: number) {
    if (!editComment.trim() || editRating < 1) return;
    try {
      const res = await fetch(`/api/reviews/${reviewId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ rating: editRating, comment: editComment.trim() }),
      });
      if (!res.ok) {
        const data = await res.json();
        Swal.fire("Error", data.detail || "Failed to update", "error");
        return;
      }
      setEditingId(null);
      setReviews((prev) =>
        prev.map((r) =>
          r.id === reviewId ? { ...r, rating: editRating, comment: editComment.trim() } : r
        )
      );
    } catch {
      Swal.fire("Error", "Network error", "error");
    }
  }

  async function handleDelete(reviewId: number) {
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
      const res = await fetch(`/api/reviews/${reviewId}`, { method: "DELETE" });
      if (!res.ok) {
        const data = await res.json();
        Swal.fire("Error", data.detail || "Failed to delete", "error");
        return;
      }
      setReviews((prev) => prev.filter((r) => r.id !== reviewId));
      onRefresh?.();
    } catch {
      Swal.fire("Error", "Network error", "error");
    }
  }

  if (reviews.length === 0) {
    return (
      <div className="rounded-3xl border-2 border-dashed border-slate-200 bg-white py-14 px-6 text-center">
        <div className="mx-auto mb-3 text-5xl opacity-40">✍️</div>
        <p className="font-semibold text-lg text-slate-700">No reviews yet</p>
        <p className="text-slate-500 mt-1 text-sm">Be the first to share your experience with this product.</p>
      </div>
    );
  }

  const isOwn = (reviewUserId: number) => user?.id === reviewUserId;

  return (
    <div className="space-y-6">
      {reviews.map((review) => (
        <div key={review.id} className="rounded-3xl border border-slate-100 bg-white p-6 shadow-sm hover:shadow-md transition-shadow">
          <div className="flex items-start gap-4">
            <div className={`shrink-0 w-11 h-11 rounded-2xl flex items-center justify-center text-white text-base font-bold shadow-inner ${avatarColor(review.user)}`}>
              {review.user.charAt(0).toUpperCase()}
            </div>

            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between gap-2 flex-wrap">
                <div>
                  <p className="font-semibold text-slate-900">{review.user}</p>
                  <div className="mt-1">
                    <StarRating value={review.rating} size="sm" />
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <time className="text-xs text-slate-400 font-medium tracking-wide">
                    {formatDate(review.createdAt)}
                  </time>
                  {isOwn(review.userId) && (
                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => startEdit(review)}
                        className="text-xs font-bold text-indigo-600 hover:text-indigo-800 transition-colors"
                      >
                        Edit
                      </button>
                      <span className="text-slate-300">|</span>
                      <button
                        onClick={() => handleDelete(review.id)}
                        className="text-xs font-bold text-rose-500 hover:text-rose-700 transition-colors"
                      >
                        Delete
                      </button>
                    </div>
                  )}
                </div>
              </div>

              {editingId === review.id ? (
                <div className="mt-3 space-y-3">
                  <StarRatingInput value={editRating} onChange={setEditRating} />
                  <textarea
                    value={editComment}
                    onChange={(e) => setEditComment(e.target.value)}
                    className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-indigo-500 resize-none"
                    rows={3}
                  />
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleSave(review.id)}
                      className="rounded-xl bg-indigo-600 px-4 py-2 text-xs font-bold text-white hover:bg-indigo-700"
                    >
                      Save
                    </button>
                    <button
                      onClick={() => setEditingId(null)}
                      className="rounded-xl border border-slate-200 px-4 py-2 text-xs font-bold text-slate-600 hover:bg-slate-50"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              ) : (
                <p className="mt-4 text-[15px] leading-relaxed text-slate-600">
                  &ldquo;{review.comment}&rdquo;
                </p>
              )}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}