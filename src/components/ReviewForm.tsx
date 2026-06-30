"use client";

import { useEffect, useState } from "react";
import { createUser, createReview } from "@/lib/api";
import StarRatingInput from "./StarRatingInput";

interface ReviewFormProps {
  productId: number;
  onSubmitted: () => Promise<void> | void;
}

export default function ReviewForm({ productId, onSubmitted }: ReviewFormProps) {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");

  useEffect(() => {
    fetch("/api/auth/me")
      .then((r) => r.json())
      .then((data) => {
        if (data?.id) {
          setName(data.name || "");
          setEmail(data.email || "");
        }
      })
      .catch(() => {});
  }, []);
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState("");

  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setSuccess(false);

    // Client-side validation for fast feedback.
    if (!name.trim() || !email.trim()) {
      setError("Please enter your name and email.");
      return;
    }
    if (rating < 1 || rating > 5) {
      setError("Please select a star rating.");
      return;
    }
    if (!comment.trim()) {
      setError("Please write a comment.");
      return;
    }

    setSubmitting(true);
    try {
      // Step 1: create or reuse the user (idempotent by email).
      const user = await createUser({ name: name.trim(), email: email.trim() });

      // Step 2: create the review tied to that user + product.
      await createReview({
        product_id: productId,
        user_id: user.id,
        rating,
        comment: comment.trim(),
      });

      // Step 3: refresh parent data and reset the form.
      await onSubmitted();
      setSuccess(true);
      setComment("");
      setRating(0);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong.");
    } finally {
      setSubmitting(false);
    }
  }

  if (success) {
    return (
      <div className="relative overflow-hidden rounded-[2rem] border border-emerald-100 bg-white p-10 text-center shadow-2xl shadow-emerald-100/70">
        <div className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-emerald-400 via-indigo-400 to-sky-400" />
        <div className="mx-auto flex h-18 w-18 items-center justify-center rounded-[1.7rem] bg-emerald-500 text-4xl text-white shadow-xl shadow-emerald-300/60">
          ✓
        </div>
        <h3 className="mt-6 text-2xl font-black tracking-tight text-slate-950">Thank you for your review!</h3>
        <p className="mx-auto mt-2 max-w-xs text-sm leading-6 text-slate-500">
          Your feedback is now helping other shoppers make better decisions.
        </p>
        <button
          onClick={() => setSuccess(false)}
          className="mt-8 rounded-2xl border border-emerald-200 bg-emerald-50 px-5 py-3 text-sm font-black text-emerald-700 transition-all hover:bg-emerald-100"
        >
          Write another review
        </button>
      </div>
    );
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="relative overflow-hidden rounded-[2rem] border border-white bg-white p-8 shadow-2xl shadow-slate-200/70 ring-1 ring-slate-900/[0.03]"
    >
      <div className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-indigo-500 via-sky-400 to-emerald-400" />
      <div className="mb-8">
        <span className="section-label">Share experience</span>
        <h3 className="mt-4 text-3xl font-black tracking-[-0.04em] text-slate-950">Write a Review</h3>
        <p className="mt-2 text-sm leading-6 text-slate-500">
          Help real shoppers by sharing what worked, what didn’t, and whether you’d buy it again.
        </p>
      </div>

      {error && (
        <div className="mb-6 flex items-center gap-3 rounded-xl bg-rose-50 px-4 py-4 text-sm font-medium text-rose-700 border border-rose-100">
          <span>⚠️</span> {error}
        </div>
      )}

      <div className="grid gap-6 sm:grid-cols-2">
        <div>
          <label
            htmlFor="name"
            className="mb-2 block text-sm font-semibold text-gray-700"
          >
            Full Name
          </label>
          <input
            id="name"
            type="text"
            required
            value={name}
            onChange={(e) => setName(e.target.value)}
            disabled={submitting}
            placeholder="Jane Doe"
            className="input-field"
          />
        </div>
        <div>
          <label
            htmlFor="email"
            className="mb-2 block text-sm font-semibold text-gray-700"
          >
            Email Address
          </label>
          <input
            id="email"
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            disabled={submitting}
            placeholder="jane@example.com"
            className="input-field"
          />
        </div>
      </div>

      <div className="mt-8 rounded-[1.5rem] border border-slate-200 bg-slate-50/80 p-6">
        <span className="mb-4 block text-sm font-black uppercase tracking-[0.14em] text-slate-500">
          Rate your experience
        </span>
        <StarRatingInput
          value={rating}
          onChange={setRating}
          disabled={submitting}
        />
      </div>

      <div className="mt-8">
        <label
          htmlFor="comment"
          className="mb-2 block text-sm font-semibold text-gray-700"
        >
          Your Comment
        </label>
        <textarea
          id="comment"
          required
          value={comment}
          onChange={(e) => setComment(e.target.value)}
          disabled={submitting}
          rows={5}
          placeholder="Describe what you liked or disliked about this product..."
          className="input-field resize-none"
        />
      </div>

      <button
        type="submit"
        disabled={submitting}
        className="btn-primary w-full mt-10 h-14"
      >
        {submitting ? (
          <div className="flex items-center gap-2">
            <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            Submitting...
          </div>
        ) : (
          "Submit Review"
        )}
      </button>
    </form>
  );
}
