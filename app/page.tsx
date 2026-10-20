import Link from "next/link";
import { APP_NAME } from "@/lib/app-config";
import { shouldUseQlooMock } from "@/lib/qloo/config";
import sampleBrands from "@/seed/sample-brands.json";

const notes = [
  "Coffee for the early train.",
  "A slower Sunday at home.",
  "Made for a table of two.",
];
export default function HomePage() {
  const sampleMode = shouldUseQlooMock();
  return (
    <main id="main-content" className="scout-home">
      <div className="scout-container">
        <header className="scout-masthead">
          <Link href="/" className="scout-wordmark">
            {APP_NAME}
            <span aria-hidden="true">↗</span>
          </Link>
          <span className="scout-kicker">A partner-finding notebook</span>
        </header>
        <section className="scout-hero" aria-labelledby="intro-heading">
          <div>
            <p className="scout-kicker">For independent consumer brands</p>
            <h1 id="intro-heading">
              Find your next
              <br />
              <em>brand partner.</em>
            </h1>
            <p className="scout-intro">
              Find brands, venues, and artists with an audience like yours. Get
              a collaboration idea and a pitch you can edit.
            </p>
            <Link href="/scout/custom" className="scout-primary">
              Find partners for your brand <span aria-hidden="true">↗</span>
            </Link>
            <p className="scout-small">
              No account needed. Nothing is sent to partners.
            </p>
          </div>
          <aside className="scout-note" aria-label="What you get">
            <span className="scout-kicker">From brief to first draft</span>
            <ol>
              <li>
                <span>01</span> Describe your brand and audience.
              </li>
              <li>
                <span>02</span> Compare partner suggestions and audience
                signals.
              </li>
              <li>
                <span>03</span> Edit a pitch, then copy it when you’re ready.
              </li>
            </ol>
            <p>Qloo supplies audience signals. You choose who to approach.</p>
          </aside>
        </section>
        <section className="scout-examples" aria-labelledby="example-heading">
          <div className="scout-section-heading">
            <div>
              <p className="scout-kicker">Start with an example</p>
              <h2 id="example-heading">
                Three brands. Different possibilities.
              </h2>
            </div>
            <span className="scout-mode">
              {sampleMode ? "Sample data mode" : "Live Qloo data"}
            </span>
          </div>
          <p className="scout-small">
            These brands are fictional.
            {sampleMode
              ? " Results use sample audience data so you can try the workflow."
              : " Results use Qloo audience data."}
          </p>
          <div className="scout-brand-grid">
            {sampleBrands.map((brand, index) => (
              <Link
                key={brand.id}
                href={`/scout/${brand.id}`}
                className={`scout-brand scout-brand-${index}`}
              >
                <div className="scout-brand-art" aria-hidden="true">
                  <span>{String(index + 1).padStart(2, "0")}</span>
                  <i>{brand.brand_name.split(" ")[0]}</i>
                </div>
                <div className="scout-brand-copy">
                  <p className="scout-kicker">{brand.category}</p>
                  <h3>{brand.brand_name}</h3>
                  <p>{notes[index]}</p>
                  <span className="scout-card-action">
                    Find partners <span aria-hidden="true">↗</span>
                  </span>
                </div>
              </Link>
            ))}
          </div>
        </section>
        <section className="scout-method" aria-labelledby="method-heading">
          <div>
            <p className="scout-kicker">Behind each suggestion</p>
            <h2 id="method-heading">See why a partner made the list.</h2>
          </div>
          <p>
            Collab Scout compares audience signals from brands you know, filters
            same-category competitors and your exclusions, then ranks the
            remaining suggestions. Each result includes its Qloo source details.
            A match is a starting point for research, not a promise of interest.
          </p>
        </section>
        <footer className="scout-footer">
          <span>{APP_NAME} · Circuit Studio</span>
          <a href="https://qloo.devpost.com/" target="_blank" rel="noreferrer">
            Built for the Qloo Agentic Hackathon{" "}
            <span aria-hidden="true">↗</span>
            <span className="sr-only"> (opens in a new tab)</span>
          </a>
        </footer>
      </div>
    </main>
  );
}
