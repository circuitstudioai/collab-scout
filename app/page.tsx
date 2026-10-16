/**
 * Home page - Demo interface for Market Desk Taste Agent
 */

import Link from 'next/link';
import sampleBriefs from '@/seed/sample-briefs.json';

export default function HomePage() {
  return (
    <main className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
      <div className="container mx-auto px-4 py-12 max-w-6xl">
        {/* Header */}
        <header className="text-center mb-12">
          <h1 className="text-5xl font-bold text-slate-900 mb-4">
            Market Desk Taste Agent
          </h1>
          <p className="text-xl text-slate-600 max-w-3xl mx-auto">
            Powered by <span className="font-semibold text-blue-600">Qloo</span> cultural intelligence.
            Transform research briefs into actionable taste insights and survey strategies.
          </p>
          <div className="mt-6 flex items-center justify-center gap-4">
            <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-green-100 text-green-800">
              ✓ Qloo Insights API
            </span>
            <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-purple-100 text-purple-800">
              ✓ AI Agent Framework
            </span>
            <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-orange-100 text-orange-800">
              ✓ Open Source (MIT)
            </span>
          </div>
        </header>

        {/* What This Does */}
        <section className="bg-white rounded-xl shadow-sm border border-slate-200 p-8 mb-8">
          <h2 className="text-2xl font-semibold text-slate-900 mb-4">
            What Makes This Qloo-Powered?
          </h2>
          <div className="grid md:grid-cols-2 gap-6">
            <div>
              <h3 className="font-semibold text-slate-900 mb-2">📊 Cultural Intelligence</h3>
              <p className="text-slate-600 text-sm">
                Uses Qloo&apos;s Insights API to discover what brands, places, and media your target audience loves - revealing the cultural and taste profile of your market.
              </p>
            </div>
            <div>
              <h3 className="font-semibold text-slate-900 mb-2">🏷️ Trending Themes</h3>
              <p className="text-slate-600 text-sm">
                Leverages Qloo Tags API to identify trending cultural themes and values that shape positioning and messaging strategies.
              </p>
            </div>
            <div>
              <h3 className="font-semibold text-slate-900 mb-2">🎯 Audience Differentiation</h3>
              <p className="text-slate-600 text-sm">
                Uses Qloo Compare API to reveal what makes your audience unique vs. the general population - finding overindexed preferences.
              </p>
            </div>
            <div>
              <h3 className="font-semibold text-slate-900 mb-2">❓ Smart Survey Questions</h3>
              <p className="text-slate-600 text-sm">
                Generates data-driven survey questions based on Qloo entities and affinities, optimizing primary research for maximum insight.
              </p>
            </div>
          </div>
        </section>

        {/* Sample Briefs */}
        <section className="mb-8">
          <h2 className="text-2xl font-semibold text-slate-900 mb-6">
            Try a Sample Research Brief
          </h2>
          <div className="grid md:grid-cols-2 gap-6">
            {sampleBriefs.map((brief) => (
              <Link
                key={brief.id}
                href={`/brief/${brief.id}`}
                className="block bg-white rounded-lg shadow-sm border border-slate-200 p-6 hover:border-blue-400 hover:shadow-md transition-all group"
              >
                <h3 className="text-lg font-semibold text-slate-900 mb-2 group-hover:text-blue-600">
                  {brief.title}
                </h3>
                <p className="text-sm text-slate-600 mb-4 line-clamp-2">
                  {brief.description}
                </p>
                <div className="flex items-center gap-2 text-xs text-slate-500">
                  <span className="px-2 py-1 bg-slate-100 rounded">
                    {brief.target_audience?.age_range || 'All ages'}
                  </span>
                  <span className="px-2 py-1 bg-slate-100 rounded">
                    {brief.competitor_brands?.length || 0} competitors
                  </span>
                </div>
                <div className="mt-4 text-sm text-blue-600 font-medium group-hover:underline">
                  Generate Taste Brief →
                </div>
              </Link>
            ))}
          </div>
        </section>

        {/* API Integration */}
        <section className="bg-blue-50 rounded-xl border border-blue-200 p-8">
          <h2 className="text-2xl font-semibold text-slate-900 mb-4">
            API Integration
          </h2>
          <p className="text-slate-700 mb-4">
            This agent exposes a public API endpoint that Market Desk (circuit-analyst.vercel.app) can call:
          </p>
          <div className="bg-white rounded-lg p-4 font-mono text-sm text-slate-800 border border-blue-200 mb-4 overflow-x-auto">
            <div className="mb-2">
              <span className="text-green-600 font-bold">POST</span> /api/taste-brief
            </div>
            <pre className="text-xs mt-2 text-slate-600">{`{
  "title": "Research Brief Title",
  "product_concept": "...",
  "target_geography": "United States",
  "target_audience": { "age_range": "25-40" },
  "competitor_brands": ["Brand A", "Brand B"]
}`}</pre>
          </div>
          <div className="flex gap-4">
            <a
              href="/api/taste-brief"
              target="_blank"
              className="text-sm text-blue-600 hover:underline font-medium"
            >
              Check API Status →
            </a>
            <a
              href="https://github.com"
              target="_blank"
              rel="noopener noreferrer"
              className="text-sm text-slate-600 hover:text-slate-900 font-medium"
            >
              View Documentation →
            </a>
          </div>
        </section>

        {/* Footer */}
        <footer className="mt-12 text-center text-sm text-slate-500">
          <p>
            Built for the{' '}
            <a
              href="https://qloo.devpost.com/"
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-600 hover:underline"
            >
              Qloo Agentic Hackathon
            </a>{' '}
            | Open source (MIT License) |{' '}
            <a
              href="https://github.com"
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-600 hover:underline"
            >
              GitHub
            </a>
          </p>
        </footer>
      </div>
    </main>
  );
}
