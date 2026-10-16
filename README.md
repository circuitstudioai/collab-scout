# Market Desk Taste Agent

> **Cultural intelligence for market research, powered by [Qloo](https://www.qloo.com/)**

An AI agent that transforms research briefs into actionable "taste briefs" by leveraging Qloo's cultural intelligence APIs to discover audience affinities, trending themes, and generate data-driven survey questions.

**Built for the [Qloo Agentic Hackathon](https://qloo.devpost.com/)** | **License: MIT** | **Status: Demo Ready**

---

## 🎯 What Makes This Qloo-Powered?

This agent uses **four Qloo APIs** to deliver cultural and taste intelligence that traditional market research tools can't provide:

### 1. **Qloo Entity Search** → Brand & Place Resolution
- Identifies brands, places, media, and cultural entities mentioned in research briefs
- Resolves them to Qloo's entity IDs for deeper analysis
- Example: "Lululemon" → `brand_lululemon_001` with full metadata

### 2. **Qloo Insights API** → Audience Affinities
- Discovers what brands, places, and media a target demographic loves
- Returns affinity scores (0-100) showing cultural preferences
- Reveals the taste profile: "25-40 year old urban consumers" → Top brands: Patagonia (87), Lululemon (85), Whole Foods (82)

### 3. **Qloo Tags API** → Trending Themes & Values
- Extracts trending cultural themes and lifestyle values
- Identifies positioning opportunities: sustainability (91), wellness (88), conscious consumer (82)
- Powers messaging strategy and brand positioning recommendations

### 4. **Qloo Comparison API** → Audience Differentiation
- Compares target audience against general population baseline
- Identifies overindexed preferences (what makes them unique)
- Example: Target audience is +35 points higher on Patagonia vs. average consumer

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
- npm or yarn
- OpenAI API key (for agent synthesis)
- Qloo API key (from the [hackathon developer guide](https://docs.qloo.com/reference/qloo-llm-hackathon-developer-guide))

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
# Qloo API (required for live mode)
QLOO_API_KEY=your_hackathon_api_key
QLOO_BASE_URL=https://hackathon.api.qloo.com

# OpenAI API (required for agent)
OPENAI_API_KEY=sk-your-openai-key

# Development Mode
USE_QLOO_MOCK=false  # Set to 'true' to use mocked data
```

### Run the Demo

```bash
# Development server (default port: 3000)
npm run dev

# Production build
npm run build
npm start
```

Visit `http://localhost:3000` to see the demo interface with sample research briefs.

---

## 📖 How It Works

### 1. Input: Research Brief
Provide a research brief with:
- Product concept description
- Target geography
- Target audience (age, gender)
- Competitor brands (optional)
- Additional context

### 2. Agent Workflow (Powered by Vercel AI SDK)

The agent uses an **autonomous tool-calling loop** to:

```
Step 1: search_entities("Lululemon", types=["brand"])
  → Resolves to Qloo entity IDs

Step 2: get_insights(audience={age_range: "25-40", geography: "US"})
  → Discovers top affinities across brands, places, media

Step 3: get_tags(trending_only=true)
  → Identifies trending themes and cultural values

Step 4: compare_audiences(target={age_range: "25-40"}, baseline="general population")
  → Finds what makes this audience unique

Step 5: Synthesize
  → Generates structured taste brief with survey recommendations
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

### Mock Mode (No API Key Required)

Set `USE_QLOO_MOCK=true` in `.env.local` to use pre-seeded mock data. Perfect for:
- Development without API keys
- Testing the agent flow
- Demo presentations

Mock responses include realistic Qloo data for common queries (Lululemon, Patagonia, Whole Foods, etc.).

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
│   ├── qloo/                  # Qloo API client
│   │   ├── client.ts          # Main client (supports mock/live)
│   │   ├── mock.ts            # Mock implementation
│   │   └── types.ts           # TypeScript types
│   └── agent/                 # Agent orchestration
│       ├── orchestrator.ts    # Main agent logic
│       ├── tools.ts           # Qloo tool definitions
│       └── schema.ts          # Input/output schemas
├── seed/
│   └── sample-briefs.json     # Demo research briefs
├── tests/
│   └── qloo-client.test.ts    # Unit tests
├── .env.example               # Environment template
├── LICENSE                    # MIT License
└── README.md                  # This file
```

---

## 🎨 Tech Stack

- **Framework:** [Next.js 14+](https://nextjs.org/) with App Router
- **Agent Framework:** [Vercel AI SDK](https://sdk.vercel.ai/) with OpenAI tools
- **Styling:** [Tailwind CSS](https://tailwindcss.com/)
- **Type Safety:** TypeScript + Zod schemas
- **Testing:** Jest + ts-jest
- **API:** Qloo Insights API (hackathon base URL)
- **LLM:** OpenAI GPT-4o-mini (cost-optimized)

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

1. Push to GitHub
2. Import in Vercel
3. Add environment variables:
   - `QLOO_API_KEY`
   - `QLOO_BASE_URL`
   - `OPENAI_API_KEY`
   - `USE_QLOO_MOCK=false`
4. Deploy

### Other Platforms

Works on any Node.js hosting platform that supports Next.js:
- Railway
- Render
- Fly.io
- AWS (via SST, Serverless, or Amplify)

---

## 📊 Cost Optimization

**Agent Runtime:**
- Uses GPT-4o-mini ($0.15 per 1M input tokens, $0.60 per 1M output)
- Average taste brief: ~8,000 tokens → **~$0.005 per generation**
- Target: ≤$10 total during development

**Qloo API:**
- Free tier during hackathon
- 4 API calls per brief (search, insights, tags, compare)

---

## 🛣️ Roadmap

### ✅ Completed (M1)
- [x] Mocked Qloo client
- [x] Agent framework with Vercel AI SDK
- [x] API endpoint for Market Desk integration
- [x] Demo UI with sample briefs
- [x] Tests passing
- [x] MIT license and README

### 🔜 Next Steps (Post-Hackathon)
- [ ] Qloo API key integration (waiting for hackathon key)
- [ ] Hosted demo deployment (Vercel)
- [ ] Deep link integration with Market Desk
- [ ] Export to CSV/PDF
- [ ] Caching layer for Qloo responses
- [ ] Advanced filters (custom categories, date ranges)

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
