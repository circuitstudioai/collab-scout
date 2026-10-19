'use client';

import { useState } from 'react';
import type { PartnerBrief } from '@/lib/agent/schema';
import ScoutRunner from './ScoutRunner';

export default function CustomScoutForm() {
  const [submitted, setSubmitted] = useState<PartnerBrief | null>(null);
  const [brandName, setBrandName] = useState('');
  const [category, setCategory] = useState('');
  const [seeds, setSeeds] = useState('');
  const [geo, setGeo] = useState('United States');
  const [age, setAge] = useState('25-34');
  const [exclude, setExclude] = useState('');

  if (submitted) {
    return <ScoutRunner brief={submitted} />;
  }

  return (
    <form
      className="space-y-4 rounded-2xl border border-stone-200 bg-white p-6"
      onSubmit={(e) => {
        e.preventDefault();
        setSubmitted({
          brand_name: brandName.trim(),
          category: category.trim(),
          seed_brands: splitList(seeds).slice(0, 3),
          target_geography: geo.trim() || 'United States',
          audience_age: age.trim() || undefined,
          exclude_brands: splitList(exclude),
          description: 'Custom founder brief (not stored on a server beyond this request).',
        });
      }}
    >
      <Field label="Brand name" value={brandName} onChange={setBrandName} required />
      <Field label="Category" value={category} onChange={setCategory} required placeholder="e.g. specialty coffee" />
      <Field
        label="1–3 seed brands it resembles"
        value={seeds}
        onChange={setSeeds}
        placeholder="Blue Bottle, Stumptown"
      />
      <Field label="Target geography" value={geo} onChange={setGeo} />
      <Field label="Audience age (optional)" value={age} onChange={setAge} />
      <Field
        label="Competitors to exclude"
        value={exclude}
        onChange={setExclude}
        placeholder="Starbucks"
      />
      <button
        type="submit"
        className="rounded-lg bg-stone-900 px-5 py-2.5 text-sm font-semibold text-white"
      >
        Continue
      </button>
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
    .split(',')
    .map((s) => s.trim())
    .filter(Boolean);
}
