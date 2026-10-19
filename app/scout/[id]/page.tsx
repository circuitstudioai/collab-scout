import Link from 'next/link';
import { notFound } from 'next/navigation';
import { APP_NAME } from '@/lib/app-config';
import type { PartnerBrief } from '@/lib/agent/schema';
import sampleBrands from '@/seed/sample-brands.json';
import ScoutRunner from './ScoutRunner';
import CustomScoutForm from './CustomScoutForm';

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function ScoutPage({ params }: PageProps) {
  const { id } = await params;

  if (id === 'custom') {
    return (
      <main className="min-h-screen bg-[#f6f1e8] text-stone-900">
        <div className="mx-auto max-w-3xl px-4 py-10">
          <Link href="/" className="text-sm text-stone-600 hover:underline">
            ← {APP_NAME}
          </Link>
          <h1 className="mt-4 text-3xl font-semibold">Your brand</h1>
          <p className="mt-2 text-stone-600">
            Fictional or real — we only use the name as a search seed. No account required.
          </p>
          <div className="mt-8">
            <CustomScoutForm />
          </div>
        </div>
      </main>
    );
  }

  const row = sampleBrands.find((b) => b.id === id);
  if (!row) notFound();
  const brief = row as PartnerBrief;

  return (
    <main className="min-h-screen bg-[#f6f1e8] text-stone-900">
      <div className="mx-auto max-w-3xl px-4 py-10">
        <Link href="/" className="text-sm text-stone-600 hover:underline">
          ← {APP_NAME}
        </Link>
        <p className="mt-4 text-xs uppercase tracking-wide text-stone-500">Seeded demo brand</p>
        <h1 className="mt-1 text-3xl font-semibold">{brief.brand_name}</h1>
        <div className="mt-8">
          <ScoutRunner brief={brief} />
        </div>
      </div>
    </main>
  );
}

export function generateStaticParams() {
  return [...sampleBrands.map((b) => ({ id: b.id })), { id: 'custom' }];
}
