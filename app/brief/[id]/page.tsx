/**
 * Brief detail page - Shows research brief and generates taste brief
 */

import { notFound } from 'next/navigation';
import sampleBriefs from '@/seed/sample-briefs.json';
import TasteBriefGenerator from './TasteBriefGenerator';

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function BriefPage({ params }: PageProps) {
  const { id } = await params;
  const brief = sampleBriefs.find(b => b.id === id);

  if (!brief) {
    notFound();
  }

  return (
    <main className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
      <div className="container mx-auto px-4 py-8 max-w-7xl">
        {/* Header */}
        <div className="mb-8">
          <a
            href="/"
            className="text-sm text-blue-600 hover:underline mb-4 inline-block"
          >
            ← Back to samples
          </a>
          <h1 className="text-4xl font-bold text-slate-900 mb-2">
            {brief.title}
          </h1>
          <p className="text-lg text-slate-600">{brief.description}</p>
        </div>

        {/* Brief Details */}
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-8 mb-8">
          <h2 className="text-2xl font-semibold text-slate-900 mb-6">
            Research Brief Details
          </h2>
          
          <div className="grid md:grid-cols-2 gap-6">
            <div>
              <h3 className="text-sm font-semibold text-slate-700 mb-2">Product Concept</h3>
              <p className="text-slate-600">{brief.product_concept}</p>
            </div>

            <div>
              <h3 className="text-sm font-semibold text-slate-700 mb-2">Target Geography</h3>
              <p className="text-slate-600">{brief.target_geography}</p>
            </div>

            {brief.target_audience && (
              <div>
                <h3 className="text-sm font-semibold text-slate-700 mb-2">Target Audience</h3>
                <div className="flex gap-2">
                  {brief.target_audience.age_range && (
                    <span className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm">
                      {brief.target_audience.age_range}
                    </span>
                  )}
                  {brief.target_audience.gender && (
                    <span className="px-3 py-1 bg-purple-100 text-purple-800 rounded-full text-sm">
                      {brief.target_audience.gender}
                    </span>
                  )}
                </div>
              </div>
            )}

            {brief.competitor_brands && brief.competitor_brands.length > 0 && (
              <div>
                <h3 className="text-sm font-semibold text-slate-700 mb-2">Competitors</h3>
                <div className="flex flex-wrap gap-2">
                  {brief.competitor_brands.map((brand) => (
                    <span
                      key={brand}
                      className="px-3 py-1 bg-slate-100 text-slate-700 rounded-full text-sm"
                    >
                      {brand}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>

          {brief.additional_context && (
            <div className="mt-6 pt-6 border-t border-slate-200">
              <h3 className="text-sm font-semibold text-slate-700 mb-2">Additional Context</h3>
              <p className="text-slate-600">{brief.additional_context}</p>
            </div>
          )}
        </div>

        {/* Taste Brief Generator */}
        <TasteBriefGenerator brief={brief} />
      </div>
    </main>
  );
}

export async function generateStaticParams() {
  return sampleBriefs.map((brief) => ({
    id: brief.id,
  }));
}
