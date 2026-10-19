# Market Desk Taste Agent

> **Cultural intelligence for market research, powered by [Qloo](https://www.qloo.com/)**

An AI agent that transforms research briefs into actionable "taste briefs" by leveraging Qloo's cultural intelligence APIs to discover audience affinities, trending themes, and generate data-driven survey questions.

**Built for the [Qloo Agentic Hackathon](https://qloo.devpost.com/)** | **License: MIT** | **Status: Demo Ready**

---

## 🎯 What Makes This Qloo-Powered?

This agent uses **documented Qloo hackathon endpoints** (GET + `X-Api-Key`, host `https://hackathon.api.qloo.com`). It does **not** call legacy `/recommendations` or `/recs`.

### 1. **GET /search** → Brand & Place Resolution
- Resolves names in the brief to Qloo entity IDs (`query`, `types=urn:entity:brand`, `take`)
- Example: `Nike` → entity UUID used as `signal.interests.entities`

### 2. **GET /v2/insights** → Audience Affinities
- `filter.type=urn:entity:brand` or `urn:entity:place`
- Signals: `signal.interests.entities`, `signal.location.query`, `signal.demographics.age`
- Returns scored affinities the brief cites by entity id

### 3. **GET /v2/tags** (+ taste analysis) → Themes
- Tag lookup: `GET /v2/tags?filter.query=sustainability`
- Taste tags: `GET /v2/insights?filter.type=urn:tag&signal.interests.entities=...`

### 4. **GET /v2/analysis/compare** and demographics insights → Differentiation
- Compare two entity groups: `a.signal.interests.entities` vs `b.signal.interests.entities`
- Demographic skew: `GET /v2/insights?filter.type=urn:demographics`

Auth header (exactly): `X-Api-Key: <QLOO_API_KEY>` — not a Bearer token.

### The Intelligence Layer

The agent **synthesizes** Qloo data into:
- ✅ Executive summaries with audience profiles
- ✅ Top brand and place affinities (scored and sourced)
- ✅ Trending themes relevant to positioning
- ✅ Competitive insights when competitor brands are provided
- ✅ **8-10 data-driven survey questions** optimized for primary research
- ✅ 3-5 positioning angles backed by Qloo data

**Every claim cites its source**: Qloo entity IDs, scores, and API endpoints are preserved throughout.

---

## 🚀 Quick Start

### Prerequisites
- Node.js 18+
- npm
- Qloo hackathon API key (live mode) — [developer guide](https://docs.qloo.com/reference/qloo-llm-hackathon-developer-guide)
- Optional: `GEMINI_API_KEY` for Gemini 2.5 Flash synthesis (canned fallback if unset)

### Installation

```bash
# Clone the repository
git clone https://github.com/your-org/market-desk-taste-agent.git
cd market-desk-taste-agent

# Install dependencies
npm install

# Configure environment variables
cp .env.example .env.local
```

### Environment Configuration

Edit `.env.local`:

```env
QLOO_API_KEY=your_hackathon_api_key
QLOO_API_URL=https://hackathon.api.qloo.com
QLOO_USE_MOCK=false
GEMINI_API_KEY=
```

If `QLOO_API_KEY` is missing (or `QLOO_USE_MOCK=true`), the client uses a **labelled mock fallback**. See [docs/SETUP.md](docs/SETUP.md) for Vercel deploy.

### Run the Demo

```bash
npm run dev -- --port 43123
npm test
npm run build

# Live Qloo only (needs QLOO_API_KEY; never prints the key)
npm run qloo:smoke
```

Visit `http://localhost:43123`. Seeded briefs need no login.

---

## 📖 How It Works

### 1. Input: Research Brief
Provide a research brief with:
- Product concept description
- Target geography
- Target audience (age, gender)
- Competitor brands (optional)
- Additional context

### 2. Agent workflow

```
1. GET /search                  resolve competitor / brand names
2. GET /v2/insights             brand + place affinities (filter.type + signals)
3. GET /v2/tags and/or
   GET /v2/insights?filter.type=urn:tag
4. GET /v2/insights?filter.type=urn:demographics
   GET /v2/analysis/compare
5. Gemini 2.5 Flash (or canned fallback) writes the taste brief
```

### 3. Output: Taste Brief + Survey Questions

The agent returns:
- 📊 Audience profile and key characteristics
- 🏢 Top brand affinities (with Qloo scores)
- 📍 Top place affinities
- 🏷️ Trending themes for positioning
- 🎯 Audience differentiators (vs baseline)
- ❓ 8-10 recommended survey questions
- 💡 3-5 positioning angles
- 📈 Metadata (confidence, sources, entities analyzed)

---

## 🔌 API Integration

### Endpoint: Generate Taste Brief

```http
POST /api/taste-brief
Content-Type: application/json

{
  "title": "Sustainable Activewear Launch",
  "product_concept": "Premium eco-friendly athletic apparel...",
  "target_geography": "United States",
  "target_audience": {
    "age_range": "25-40",
    "gender": "all"
  },
  "competitor_brands": ["Lululemon", "Patagonia"]
}
```

**Response:**

```json
{
  "success": true,
  "data": {
    "brief_id": "brief_001",
    "title": "Taste Brief: Sustainable Activewear Launch",
    "summary": "...",
    "brand_affinities": [
      {
        "name": "Patagonia",
        "score": 87,
        "category": "Outdoor Apparel",
        "source": "brand_patagonia_001"
      }
    ],
    "suggested_questions": [...],
    ...
  }
}
```

### Health Check

```http
GET /api/taste-brief

→ {
  "service": "Market Desk Taste Agent",
  "status": "operational",
  "qloo_mode": "mock" | "live"
}
```

---

## 🧪 Development & Testing

### Mock fallback (labelled)

The mock client is **not** the default once a key is present. It is used only when:

- `QLOO_API_KEY` is unset, or
- `QLOO_USE_MOCK=true` (legacy alias: `USE_QLOO_MOCK=true`)

Logs say `FALLBACK: using mocked Qloo client`. Hosted demo/judging should run live.

### Run Tests

```bash
# Run all tests
npm test

# Watch mode
npm test:watch
```

Tests validate:
- ✅ Qloo client search functionality
- ✅ Insights API responses
- ✅ Tags API responses
- ✅ Comparison API responses
- ✅ Mock mode behavior

---

## 📁 Project Structure

```
market-desk-taste-agent/
├── app/                        # Next.js App Router
│   ├── page.tsx               # Home page with sample briefs
│   ├── brief/[id]/            # Brief detail pages
│   │   ├── page.tsx           # Server component
│   │   └── TasteBriefGenerator.tsx  # Client component
│   ├── api/taste-brief/       # API route
│   │   └── route.ts           # POST endpoint
│   └── layout.tsx             # Root layout
├── lib/
│   ├── qloo/                  # Live GET client + labelled mock fallback
│   └── agent/                 # Gather → Gemini / canned synthesis
├── scripts/qloo-smoke.ts      # npm run qloo:smoke
├── docs/SETUP.md              # Vercel + env for the next agent
├── seed/sample-briefs.json
├── tests/
├── .env.example               # Environment template
├── LICENSE                    # MIT License
└── README.md                  # This file
```

---

## 🎨 Tech Stack

- **Framework:** Next.js (App Router) + Tailwind
- **Qloo:** live GET client (`X-Api-Key`) with in-memory cache, 429 retries, timeouts
- **LLM:** Gemini 2.5 Flash via `@google/genai` (`GEMINI_API_KEY`), canned fallback
- **Tests:** Jest (`npm test`) + `npm run qloo:smoke`

---

## 💡 Use Cases

### 1. Market Research Enhancement
- Add cultural intelligence to traditional surveys
- Discover what audiences love before asking
- Generate better survey questions based on taste data

### 2. Brand Positioning
- Identify cultural themes that resonate
- Find positioning angles backed by affinity data
- Understand audience uniqueness vs. competitors

### 3. Product Launch Strategy
- Discover adjacent brands to target
- Map trending values to product features
- Optimize messaging for target demographics

---

## 🔐 Security & Best Practices

- ✅ API keys stored in environment variables (never in code)
- ✅ Qloo hackathon base URL enforced (`https://hackathon.api.qloo.com`)
- ✅ Rate limit aware (mock mode for development)
- ✅ Input validation with Zod schemas
- ✅ Error handling and graceful degradation

---

## 🚢 Deployment

### Vercel (Recommended)

See [docs/SETUP.md](docs/SETUP.md). Required for a live hosted demo: `QLOO_API_KEY`, `QLOO_API_URL=https://hackathon.api.qloo.com`. Optional: `GEMINI_API_KEY`. Do not set `QLOO_USE_MOCK=true` in production.

### Other Platforms

Works on any Node.js hosting platform that supports Next.js:
- Railway
- Render
- Fly.io
- AWS (via SST, Serverless, or Amplify)

---

## 📊 Cost Optimization

**Agent runtime:**
- Gemini 2.5 Flash when `GEMINI_API_KEY` is set; otherwise canned synthesis (no LLM spend)
- Target: keep model spend ≤ $10 for the hackathon

**Qloo API:**
- Free tier during hackathon
- 4 API calls per brief (search, insights, tags, compare)

---

## 🛣️ Roadmap

### Done
- Live Qloo GET client (`X-Api-Key`) with mock fallback, cache, retries
- Gemini 2.5 Flash synthesis + canned fallback
- Demo UI, `POST /api/taste-brief`, tests, `npm run qloo:smoke`

### Still human / later
- Host the demo on Vercel with the real key
- Devpost submission by Fri Oct 30, 2026, 11:45 PM ET (video not required)

---

## 🤝 Contributing

This is an open-source project built for the Qloo Agentic Hackathon. Contributions are welcome!

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

---

## 📄 License

MIT License - see [LICENSE](LICENSE) for details.

---

## 🙏 Acknowledgments

- **[Qloo](https://www.qloo.com/)** for providing the cultural intelligence APIs and hosting the hackathon
- **[Vercel](https://vercel.com/)** for the AI SDK and hosting platform
- **Market Desk** team for the use case and integration vision

---

## 📞 Support

For questions, issues, or demo requests:
- Open an [issue](https://github.com/your-org/market-desk-taste-agent/issues)
- Check the [Qloo Developer Guide](https://docs.qloo.com/reference/qloo-llm-hackathon-developer-guide)
- Review sample briefs in `/seed/sample-briefs.json`

---

**Built with ❤️ for the Qloo Agentic Hackathon 2026**
