"use client";

import { useState } from "react";
import type { PartnerBrief } from "@/lib/agent/schema";
import ScoutRunner from "./ScoutRunner";

export default function CustomScoutForm() {
  const [submitted, setSubmitted] = useState<PartnerBrief | null>(null);
  const [brandName, setBrandName] = useState("");
  const [category, setCategory] = useState("");
  const [seeds, setSeeds] = useState("");
  const [geo, setGeo] = useState("United States");
  const [age, setAge] = useState("");
  const [exclude, setExclude] = useState("");
  const [error, setError] = useState("");

  if (submitted) {
    return (
      <>
        <button
          type="button"
          className="mb-5 text-sm underline"
          onClick={() => setSubmitted(null)}
        >
          Edit your brief
        </button>
        <ScoutRunner brief={submitted} />
      </>
    );
  }

  return (
    <form
      className="space-y-4 rounded-2xl border border-stone-200 bg-white p-6"
      onSubmit={(e) => {
        e.preventDefault();
        if (!brandName.trim() || !category.trim()) {
          setError(
            "Enter a brand name and category. Spaces alone do not count.",
          );
          e.currentTarget
            .querySelector<HTMLInputElement>(
              !brandName.trim() ? '[name="brand-name"]' : '[name="category"]',
            )
            ?.focus();
          return;
        }
        if (splitList(seeds).length > 3) {
          setError(
            "Use up to 3 reference brands. Remove the extra names to continue.",
          );
          e.currentTarget
            .querySelector<HTMLInputElement>(
              '[name="reference-brands-optional"]',
            )
            ?.focus();
          return;
        }
        setError("");
        setSubmitted({
          brand_name: brandName.trim(),
          category: category.trim(),
          seed_brands: splitList(seeds),
          target_geography: geo.trim() || "United States",
          audience_age: age.trim() || undefined,
          exclude_brands: splitList(exclude),
          description: "Your brand brief",
        });
      }}
    >
      <Field
        label="Brand name"
        value={brandName}
        onChange={setBrandName}
        required
      />
      <p className="text-sm text-stone-600">
        Brand name and category are required. Add up to 3 brands your audience
        already likes.
      </p>
      <Field
        label="Category"
        value={category}
        onChange={setCategory}
        required
        placeholder="Specialty coffee…"
      />
      <Field
        label="Reference brands (optional)"
        value={seeds}
        onChange={setSeeds}
        placeholder="Blue Bottle, Stumptown…"
      />
      <Field label="Target geography" value={geo} onChange={setGeo} />
      <Field label="Audience age (optional)" value={age} onChange={setAge} />
      <Field
        label="Competitors to exclude"
        value={exclude}
        onChange={setExclude}
        placeholder="Starbucks…"
      />
      <button
        type="submit"
        className="rounded-lg bg-stone-900 px-5 py-2.5 text-sm font-semibold text-white"
      >
        Review your brief
      </button>
      {error && (
        <p role="alert" className="text-sm text-red-800">
          {error}
        </p>
      )}
    </form>
  );
}

function Field({
  label,
  value,
  onChange,
  required,
  placeholder,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  required?: boolean;
  placeholder?: string;
}) {
  return (
    <label className="block text-sm">
      <span className="font-medium text-stone-800">{label}</span>
      <input
        name={label
          .toLowerCase()
          .replace(/[^a-z0-9]+/g, "-")
          .replace(/-$/, "")}
        autoComplete="off"
        className="mt-1 w-full rounded-lg border border-stone-300 px-3 py-2"
        value={value}
        required={required}
        placeholder={placeholder}
        onChange={(e) => onChange(e.target.value)}
      />
    </label>
  );
}

function splitList(value: string): string[] {
  return value
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean);
}
