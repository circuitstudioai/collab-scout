import Link from 'next/link';
import { APP_NAME, APP_TAGLINE, APP_THEME } from '@/lib/app-config';
import sampleBrands from '@/seed/sample-brands.json';

export default function HomePage() {
  return (
    <main className="min-h-screen bg-[#f6f1e8] text-stone-900">
      <div className="mx-auto max-w-5xl px-4 py-12">
        <header className="max-w-3xl">
          <p className="text-xs uppercase tracking-[0.2em] text-stone-500">{APP_THEME}</p>
          <h1 className="mt-3 text-5xl font-semibold tracking-tight">{APP_NAME}</h1>
          <p className="mt-4 text-xl text-stone-700">{APP_TAGLINE}</p>
          <p className="mt-3 text-stone-600">
            For consumer brand founders who need a complementary partner — not another
            market-research dashboard. Qloo taste overlap finds brands, venues, and artists that
            share an audience without competing in your category. Outreach drafts stay on your
            machine. We never send email.
          </p>
          <div className="mt-5 flex flex-wrap gap-2 text-sm">
            <span className="rounded-full bg-stone-900 px-3 py-1 text-white">Qloo-powered</span>
            <span className="rounded-full bg-white px-3 py-1 ring-1 ring-stone-300">No login</span>
            <span className="rounded-full bg-white px-3 py-1 ring-1 ring-stone-300">MIT</span>
          </div>
        </header>

        <section className="mt-12">
          <h2 className="text-2xl font-semibold">Try a fictional founder</h2>
          <p className="mt-2 text-stone-600">
            These companies are invented for the demo. Not baby products. Works on mock Qloo data
            if no API key is set.
          </p>
          <div className="mt-6 grid gap-5 md:grid-cols-3">
            {sampleBrands.map((brand) => (
              <Link
                key={brand.id}
                href={`/scout/${brand.id}`}
                className="rounded-2xl border border-stone-200 bg-white p-5 shadow-sm hover:border-stone-400"
              >
                <p className="text-xs uppercase tracking-wide text-stone-500">{brand.category}</p>
                <h3 className="mt-1 text-lg font-semibold">{brand.brand_name}</h3>
                <p className="mt-2 text-sm text-stone-600">{brand.description}</p>
                <p className="mt-4 text-sm font-medium text-stone-900">Scout partners →</p>
              </Link>
            ))}
          </div>
          <Link
            href="/scout/custom"
            className="mt-5 inline-block text-sm font-medium text-stone-800 underline"
          >
            Or enter your own brand
          </Link>
        </section>

        <section className="mt-12 rounded-2xl border border-stone-200 bg-white p-6">
          <h2 className="text-xl font-semibold">How the agent uses Qloo</h2>
          <ol className="mt-4 list-decimal space-y-2 pl-5 text-sm text-stone-700">
            <li>GET /search — resolve seed brands to entity IDs</li>
            <li>GET /v2/insights (urn:entity:brand) — audience-overlap brands</li>
            <li>GET /v2/insights (place, artist) — pop-up and talent ideas</li>
            <li>GET /v2/tags or insights urn:tag — shared cultural tags</li>
            <li>GET /v2/analysis/compare — seed vs candidate overlap</li>
            <li>Filter same-category competitors and your exclusions, then rank by affinity</li>
          </ol>
          <p className="mt-4 text-sm text-stone-600">
            JSON API: <code className="font-mono">POST /api/partners</code>. Auth on Qloo is{' '}
            <code className="font-mono">X-Api-Key</code>. No Market Desk dependency.
          </p>
        </section>

        <footer className="mt-12 text-sm text-stone-500">
          Built for the{' '}
          <a className="underline" href="https://qloo.devpost.com/" target="_blank" rel="noreferrer">
            Qloo Agentic Hackathon
          </a>
          . Deadline Fri Oct 30, 2026, 11:45 PM ET. Open source MIT.
        </footer>
      </div>
    </main>
  );
}
