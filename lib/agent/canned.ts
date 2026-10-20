/**
 * Canned partner shortlist when Gemini is unavailable.
 * Concepts and pitches are DRAFTS — never sent.
 */

import { APP_NAME } from '../app-config';
import type { PartnerBrief, PartnerCard, PartnerShortlist } from './schema';
import type { ScoutSignals } from './gather';
import { filterAndRank, type PartnerCandidate } from './rank';

const COLLAB_TYPES = [
  'co-branded drop',
  'bundle',
  'pop-up',
  'giveaway',
  'content swap',
] as const;

export function candidatesFromSignals(signals: ScoutSignals): PartnerCandidate[] {
  const rows = [
    ...signals.brandAffinities,
    ...signals.placeAffinities,
    ...signals.artistAffinities,
  ];
  return rows.map((a) => ({
    id: a.entity.id,
    name: a.entity.name,
    type: a.entity.type,
    category: a.entity.category || a.category,
    score: a.score,
  }));
}

export function buildPartnerCards(
  brief: PartnerBrief,
  signals: ScoutSignals,
  ranked: PartnerCandidate[]
): PartnerCard[] {
  const tagNames = signals.tags.slice(0, 4).map((t) => t.tag);
  return ranked.slice(0, 8).map((partner, index) => {
    const collabType = COLLAB_TYPES[index % COLLAB_TYPES.length];
    const shared = tagNames.length ? tagNames.slice(0, 2).join(' + ') : brief.category;
    const compare = signals.compareNotes[0];
    return {
      id: partner.id || `partner_${index}`,
      name: partner.name,
      type: partner.type,
      category: partner.category,
      affinity_score: partner.score,
      why_it_fits: [
        `Qloo affinity ${partner.score} vs ${brief.brand_name}'s seeds`,
        tagNames[0] ? `shared tag “${tagNames[0]}”` : 'audience overlap on location/demographics',
        compare ? `compare: ${compare}` : null,
      ]
        .filter(Boolean)
        .join(' · '),
      qloo_signal: {
        entity_id: partner.id,
        score: partner.score,
        shared_tags: tagNames,
        compare_note: compare,
      },
      collab_concept: conceptFor(brief, partner, collabType, shared),
      outreach_draft: pitchFor(brief, partner, collabType, shared),
    };
  });
}

function conceptFor(
  brief: PartnerBrief,
  partner: PartnerCandidate,
  type: (typeof COLLAB_TYPES)[number],
  shared: string
): PartnerCard['collab_concept'] {
  const titles: Record<(typeof COLLAB_TYPES)[number], string> = {
    'co-branded drop': `${brief.brand_name} × ${partner.name} limited drop`,
    bundle: `The ${shared} kit: ${brief.brand_name} + ${partner.name}`,
    'pop-up': `Weekend pop-up with ${partner.name}`,
    giveaway: `Shared-audience giveaway (draft only)`,
    'content swap': `Creator swap: ${brief.brand_name} × ${partner.name}`,
  };
  const descriptions: Record<(typeof COLLAB_TYPES)[number], string> = {
    'co-branded drop': `A short-run SKU that pairs ${brief.category} with ${partner.category}, aimed at ${brief.target_geography}.`,
    bundle: `Retail or DTC bundle that lets each brand keep its margin while sharing checkout traffic.`,
    'pop-up': `A two-day activation in ${brief.target_geography} using ${partner.name} as the venue or guest brand.`,
    giveaway: `One joint prize pack. ${APP_NAME} does not contact anyone — you send the draft yourself if you choose.`,
    'content swap': `Each brand posts one story featuring the other, citing the shared ${shared} audience.`,
  };
  return { type, title: titles[type], description: descriptions[type] };
}

function pitchFor(
  brief: PartnerBrief,
  partner: PartnerCandidate,
  type: (typeof COLLAB_TYPES)[number],
  shared: string
): string {
  return [
    `DRAFT — do not send from ${APP_NAME}. Copy, edit, and send yourself.`,
    ``,
    `Hi ${partner.name} team,`,
    ``,
    `I'm reaching out from ${brief.brand_name} (${brief.category}, ${brief.target_geography}).`,
    `Qloo taste data shows our audiences overlap (affinity ${partner.score}; themes: ${shared}). We're not a competitor — we'd like a complementary ${type}.`,
    ``,
    `Concrete idea: ${brief.brand_name} × ${partner.name} ${type} this quarter. Happy to share a one-pager if useful.`,
    ``,
    `Thanks,`,
    `${brief.brand_name}`,
  ].join('\n');
}

export function cannedPartnerShortlist(
  runId: string,
  brief: PartnerBrief,
  signals: ScoutSignals
): PartnerShortlist {
  const candidates = candidatesFromSignals(signals);
  const { ranked, dropped } = filterAndRank(candidates, {
    founderCategory: brief.category,
    seedNames: [brief.brand_name, ...(brief.seed_brands || [])],
    seedIds: signals.seedEntities.map((e) => e.id),
    excludeNames: brief.exclude_brands || [],
  });
  const partners = buildPartnerCards(brief, signals, ranked);
  const top = partners[0];

  return {
    run_id: runId,
    title: `Partner shortlist for ${brief.brand_name}`,
    generated_at: new Date().toISOString(),
    summary: top
      ? `${brief.brand_name} has complementary taste overlap with ${top.name} (Qloo ${top.affinity_score}) and ${Math.max(partners.length - 1, 0)} other non-competing partners. ${dropped.length} same-category or excluded brands were removed.`
      : `No complementary partners cleared the competitor filter. Try different seeds or a broader geography.`,
    founder: brief,
    partners,
    filtered_out: dropped.map((d) => ({ name: d.candidate.name, reason: d.reason })),
    qloo_trace: signals.traces,
    metadata: {
      qloo_mode: signals.mocked ? 'fallback_mock' : 'live',
      qloo_entities_resolved: signals.seedEntities.length,
      synthesis: 'canned_fallback',
      disclaimer: `${APP_NAME} never sends email or contacts partners. Outreach text is a draft for you to copy.`,
    },
  };
}
