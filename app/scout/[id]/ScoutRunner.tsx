'use client';

import { useMemo, useState } from 'react';
import { APP_NAME, APP_SLUG } from '@/lib/app-config';
import type { OutreachStatus, PartnerBrief, PartnerCard, PartnerShortlist } from '@/lib/agent/schema';

const STATUS_OPTIONS: OutreachStatus[] = ['none', 'contacted', 'replied', 'declined'];

function storageKey(runId: string, partnerId: string): string {
  return `${APP_SLUG}:outreach:${runId}:${partnerId}`;
}

export default function ScoutRunner({ brief }: { brief: PartnerBrief }) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [shortlist, setShortlist] = useState<PartnerShortlist | null>(null);
  const [statuses, setStatuses] = useState<Record<string, OutreachStatus>>({});
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const runKey = shortlist?.run_id || brief.id || 'draft';

  const setStatus = (partnerId: string, status: OutreachStatus) => {
    setStatuses((prev) => ({ ...prev, [partnerId]: status }));
    window.localStorage.setItem(storageKey(runKey, partnerId), status);
  };

  const scout = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch('/api/partners', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(brief),
      });
      const payload = await response.json();
      if (!response.ok) {
        throw new Error(payload.message || payload.error || 'Scout failed');
      }
      const loaded: Record<string, OutreachStatus> = {};
      for (const partner of (payload.data as PartnerShortlist).partners) {
        try {
          const saved = window.localStorage.getItem(storageKey(payload.data.run_id, partner.id));
          loaded[partner.id] = STATUS_OPTIONS.includes(saved as OutreachStatus) ? saved as OutreachStatus : 'none';
        } catch { loaded[partner.id] = 'none'; }
      }
      setStatuses(loaded);
      setShortlist(payload.data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Scout failed');
    } finally {
      setLoading(false);
    }
  };

  const copyPitch = async (partner: PartnerCard) => {
    await navigator.clipboard.writeText(partner.outreach_draft);
    setCopiedId(partner.id);
    setTimeout(() => setCopiedId(null), 1600);
  };

  const filteredLabel = useMemo(() => {
    if (!shortlist) return '';
    return `${shortlist.filtered_out.length} competitors / exclusions removed`;
  }, [shortlist]);

  return (
    <div className="space-y-8">
      <section className="rounded-2xl border border-stone-200 bg-white p-6 shadow-sm">
        <p className="text-xs uppercase tracking-wide text-stone-500">Founder brief</p>
        <h2 className="mt-1 text-2xl font-semibold text-stone-900">{brief.brand_name}</h2>
        <p className="mt-2 text-stone-600">{brief.description}</p>
        <div className="mt-4 flex flex-wrap gap-2 text-sm">
          <Chip>{brief.category}</Chip>
          <Chip>{brief.target_geography}</Chip>
          {brief.audience_age ? <Chip>{brief.audience_age}</Chip> : null}
          {(brief.seed_brands || []).map((s) => (
            <Chip key={s}>seed: {s}</Chip>
          ))}
          {(brief.exclude_brands || []).map((s) => (
            <Chip key={s}>exclude: {s}</Chip>
          ))}
        </div>
        <p className="mt-4 text-sm text-stone-500">
          {APP_NAME} never emails anyone. Pitches are drafts you can copy. Status lives in this
          browser only.
        </p>
        <button
          type="button"
          onClick={scout}
          disabled={loading}
          className="mt-5 rounded-lg bg-stone-900 px-5 py-2.5 text-sm font-semibold text-white hover:bg-stone-800 disabled:cursor-not-allowed disabled:bg-stone-400"
        >
          {loading ? 'Scouting with Qloo…' : 'Find complementary partners'}
        </button>
        {error ? (
          <p className="mt-3 rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-800">
            {error}
          </p>
        ) : null}
      </section>

      {shortlist ? (
        <>
          <section className="rounded-2xl border border-amber-200 bg-amber-50 p-6">
            <h3 className="text-lg font-semibold text-stone-900">Shortlist</h3>
            <p className="mt-2 text-stone-700">{shortlist.summary}</p>
            <p className="mt-2 text-sm text-stone-500">
              {filteredLabel} · {shortlist.metadata.qloo_mode} · {shortlist.metadata.synthesis}
            </p>
          </section>

          <div className="grid gap-5">
            {shortlist.partners.map((partner) => (
              <article
                key={partner.id}
                className="rounded-2xl border border-stone-200 bg-white p-6 shadow-sm"
              >
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <h3 className="text-xl font-semibold text-stone-900">{partner.name}</h3>
                    <p className="text-sm text-stone-500">
                      {partner.type} · {partner.category} · Qloo {partner.affinity_score} ·{' '}
                      <span className="font-mono text-xs">{partner.qloo_signal.entity_id}</span>
                    </p>
                  </div>
                  <span className="rounded-full bg-stone-900 px-3 py-1 text-xs font-semibold text-white">
                    {partner.collab_concept.type}
                  </span>
                </div>
                <p className="mt-3 text-stone-700">{partner.why_it_fits}</p>
                {partner.qloo_signal.shared_tags.length ? (
                  <div className="mt-3 flex flex-wrap gap-2">
                    {partner.qloo_signal.shared_tags.map((tag) => (
                      <Chip key={tag}>{tag}</Chip>
                    ))}
                  </div>
                ) : null}
                <div className="mt-4 rounded-xl bg-stone-50 p-4">
                  <p className="text-sm font-semibold text-stone-900">{partner.collab_concept.title}</p>
                  <p className="mt-1 text-sm text-stone-600">{partner.collab_concept.description}</p>
                </div>
                <pre className="mt-4 whitespace-pre-wrap rounded-xl border border-dashed border-stone-300 bg-stone-50 p-4 text-sm text-stone-800">
                  {partner.outreach_draft}
                </pre>
                <div className="mt-4 flex flex-wrap items-center gap-3">
                  <button
                    type="button"
                    onClick={() => copyPitch(partner)}
                    className="rounded-lg border border-stone-300 px-3 py-1.5 text-sm font-medium text-stone-800 hover:bg-stone-50"
                  >
                    {copiedId === partner.id ? 'Copied' : 'Copy draft'}
                  </button>
                  <label className="text-sm text-stone-600">
                    Track locally{' '}
                    <select
                      className="ml-2 rounded-md border border-stone-300 bg-white px-2 py-1"
                      value={statuses[partner.id] || 'none'}
                      onChange={(e) => setStatus(partner.id, e.target.value as OutreachStatus)}
                    >
                      {STATUS_OPTIONS.map((s) => (
                        <option key={s} value={s}>
                          {s}
                        </option>
                      ))}
                    </select>
                  </label>
                </div>
              </article>
            ))}
          </div>

          {shortlist.filtered_out.length ? (
            <section className="rounded-2xl border border-stone-200 bg-white p-5 text-sm text-stone-600">
              <h4 className="font-semibold text-stone-900">Filtered as competitors or exclusions</h4>
              <ul className="mt-2 space-y-1">
                {shortlist.filtered_out.map((row) => (
                  <li key={row.name}>
                    <span className="font-medium text-stone-800">{row.name}</span> — {row.reason}
                  </li>
                ))}
              </ul>
            </section>
          ) : null}

          <section className="rounded-2xl border border-blue-200 bg-blue-50 p-6">
            <h3 className="text-lg font-semibold text-stone-900">Qloo-powered trace</h3>
            <p className="mt-1 text-sm text-stone-600">
              Every call the agent made. Hackathon host, GET only, header X-Api-Key.
              {shortlist.metadata.qloo_mode === 'fallback_mock'
                ? ' This run used the labelled mock fallback.'
                : ' This run used live Qloo.'}
            </p>
            <ol className="mt-4 space-y-3">
              {shortlist.qloo_trace.map((step, i) => (
                <li key={step.id} className="rounded-lg bg-white p-3 text-sm">
                  <div className="font-mono text-xs text-blue-800">
                    {i + 1}. GET {step.path}
                  </div>
                  <div className="mt-1 text-stone-700">{step.summary}</div>
                  <div className="mt-1 font-mono text-[11px] text-stone-500">
                    {Object.entries(step.params)
                      .map(([k, v]) => `${k}=${v}`)
                      .join(' · ')}
                  </div>
                </li>
              ))}
            </ol>
            <p className="mt-3 text-xs text-stone-500">{shortlist.metadata.disclaimer}</p>
          </section>
        </>
      ) : null}
    </div>
  );
}

function Chip({ children }: { children: React.ReactNode }) {
  return (
    <span className="rounded-full bg-stone-100 px-2.5 py-1 text-xs font-medium text-stone-700">
      {children}
    </span>
  );
}
