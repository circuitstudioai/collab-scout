/**
 * Complementary-partner filter and affinity ranking.
 * Pure functions — no network. Direct competitors are dropped so
 * the shortlist is collab-ready, not a competitor set.
 */

import type { QlooEntityType } from '../qloo/types';

export interface PartnerCandidate {
  id: string;
  name: string;
  type: QlooEntityType;
  category: string;
  score: number;
}

export interface FilterOptions {
  founderCategory: string;
  seedNames: string[];
  seedIds: string[];
  excludeNames: string[];
}

export interface FilterDecision {
  candidate: PartnerCandidate;
  keep: boolean;
  reason: string;
}

const CATEGORY_GROUPS: string[][] = [
  ['coffee', 'cafe', 'espresso', 'roaster', 'specialty coffee', 'coffee shop'],
  ['athletic', 'activewear', 'apparel', 'footwear', 'fitness', 'outdoor apparel', 'athletic apparel'],
  ['fragrance', 'scent', 'perfume', 'candle', 'home fragrance', 'beauty', 'personal care'],
  ['tableware', 'ceramic', 'ceramics', 'home goods', 'kitchen', 'dinnerware'],
  ['grocery', 'supermarket', 'grocers'],
];

export function normalizeName(value: string): string {
  return value.toLowerCase().replace(/[^a-z0-9]+/g, ' ').trim();
}

export function categoriesOverlap(a: string, b: string): boolean {
  const left = normalizeName(a);
  const right = normalizeName(b);
  if (!left || !right) return false;
  if (left === right || left.includes(right) || right.includes(left)) return true;
  return CATEGORY_GROUPS.some(
    (group) => group.some((g) => left.includes(g)) && group.some((g) => right.includes(g))
  );
}

export function namesMatch(a: string, b: string): boolean {
  const left = normalizeName(a);
  const right = normalizeName(b);
  if (!left || !right) return false;
  return left === right || left.includes(right) || right.includes(left);
}

export function classifyCandidate(
  candidate: PartnerCandidate,
  options: FilterOptions
): FilterDecision {
  if (options.seedIds.includes(candidate.id)) {
    return { candidate, keep: false, reason: 'Seed brand used as a Qloo signal, not a partner' };
  }
  if (options.seedNames.some((name) => namesMatch(name, candidate.name))) {
    return { candidate, keep: false, reason: 'Matches a seed brand' };
  }
  if (options.excludeNames.some((name) => namesMatch(name, candidate.name))) {
    return { candidate, keep: false, reason: 'On the founder exclusion list' };
  }

  const venueOrTalent = candidate.type === 'place' || candidate.type === 'artist' || candidate.type === 'person';
  if (!venueOrTalent && categoriesOverlap(candidate.category, options.founderCategory)) {
    return {
      candidate,
      keep: false,
      reason: `Same category as the founder (${options.founderCategory})`,
    };
  }

  return { candidate, keep: true, reason: 'Complementary audience overlap' };
}

export function filterCompetitors(
  candidates: PartnerCandidate[],
  options: FilterOptions
): { kept: PartnerCandidate[]; dropped: FilterDecision[] } {
  const decisions = candidates.map((c) => classifyCandidate(c, options));
  return {
    kept: decisions.filter((d) => d.keep).map((d) => d.candidate),
    dropped: decisions.filter((d) => !d.keep),
  };
}

export function rankByAffinity(candidates: PartnerCandidate[]): PartnerCandidate[] {
  return [...candidates].sort((a, b) => {
    if (b.score !== a.score) return b.score - a.score;
    return a.name.localeCompare(b.name);
  });
}

export function filterAndRank(
  candidates: PartnerCandidate[],
  options: FilterOptions
): { ranked: PartnerCandidate[]; dropped: FilterDecision[] } {
  const { kept, dropped } = filterCompetitors(candidates, options);
  return { ranked: rankByAffinity(kept), dropped };
}
