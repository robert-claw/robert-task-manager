# Liberture Scraping + AI Enrichment System
**Date:** 2026-02-12  
**Duration:** 30 minutes  
**Status:** ✅ Complete, Ready for Testing

## What Was Built

### 1. Database Schema
Added `ScrapedContent` table to track the scraping → AI enrichment → publishing pipeline:

**Fields:**
- `source` - Platform name (biohackingnews.org, examine.com, etc.)
- `sourceUrl` - Original article URL
- `rawContent` - Scraped excerpt (100-300 words)
- `contentType` - article, person_bio, protocol, book_summary
- `targetEntity` - Which DB entity to create (knowledge_article, person, etc.)
- `extractedData` - JSON with structured data (title, pillar, dates)
- `needsParaphrasing` - Boolean flag for AI rewriting
- `paraphrasedContent` - AI-enriched version (500-800 words)
- `enrichmentStatus` - pending → processing → completed/failed
- `enrichedBy` - AI model used (perplexity-sonar)
- `publishedToDb` - Published to knowledge base?
- `publishedEntityId` - ID of created article

**Indexes:** source, enrichmentStatus, needsParaphrasing, contentType

### 2. Scraper Scripts

**BiohackingNews Scraper** (`scripts/scrapers/biohacking-news-scraper.ts`)
- Scrapes biohackingnews.org homepage
- Extracts: title, URL, excerpt
- Auto-detects pillar from keywords (Cognition, Recovery, Fueling, Mental, Physicality, Finance)
- Saves to `ScrapedContent` with `needsParaphrasing: true`
- Avoids duplicates (checks sourceUrl)
- Limits to 10 articles per run

**AI Enrichment Pipeline** (`scripts/scrapers/ai-enrichment-pipeline.ts`)
- Fetches pending items (status: pending, needs paraphrasing)
- Calls Perplexity API (model: sonar, temp: 0.3)
- Prompt: Rewrite in original words, expand with context, make engaging
- Processes 5 at a time
- 2-second delay between requests (rate limit protection)
- Marks completed or failed
- Cost: ~$0.0005 per article

**Publisher** (`scripts/scrapers/publish-enriched-content.ts`)
- Fetches completed, unpublished items
- Creates `KnowledgeArticle` entries
- Generates slug from title
- Calculates read time (words / 200 wpm)
- Links to original source
- Marks as published
- Publishes 10 at a time

**Master Orchestrator** (`scripts/scrapers/run-scraping-pipeline.ts`)
- Runs all 3 steps: scrape → enrich → publish
- Individual mode: `scrape`, `enrich`, `publish`
- Full mode: `full`

### 3. Manual Content Added

Added 8 new knowledge articles manually while building the system:

**From Feb 12 (morning heartbeat):**
1. Adaptogens: Nature's Stress-Fighting Herbs (Cognition)
2. Journaling for Mental Clarity (Mental)
3. Vitamin D: The Sunshine Vitamin (Fueling)

**From Leon's request:**
4. Red Light Therapy: Science-Backed Benefits (Recovery)
5. Zone 2 Training: Building Metabolic Flexibility (Physicality)
6. Magnesium: The Most Underrated Mineral (Fueling)
7. Building Financial Independence: The FIRE Movement (Finance)
8. Intermittent Fasting: Protocols and Science (Fueling)

**Total Knowledge Articles:** 90 (was 82)

### 4. Documentation

Created `docs/SCRAPING-SYSTEM.md` with:
- Architecture overview
- Usage instructions
- Target platforms (Tier 1, 2, 3)
- Anti-plagiarism strategy
- Quality control checklist
- File structure

## How It Works

### The Pipeline

```
1. SCRAPE
   ├─ Fetch articles from biohackingnews.org
   ├─ Extract: title, URL, excerpt, pillar
   └─ Save to ScrapedContent (needsParaphrasing: true)

2. ENRICH
   ├─ Fetch pending items
   ├─ Call Perplexity API: rewrite + expand
   └─ Save paraphrased content (status: completed)

3. PUBLISH
   ├─ Fetch completed items
   ├─ Create KnowledgeArticle entries
   └─ Mark as published
```

### Anti-Plagiarism Strategy

1. **Scrape only excerpts** (100-300 words, not full articles)
2. **AI completely rewrites** (500-800 words, expanded)
3. **Link to original** (attribution + SEO)
4. **Add insights** (AI adds context, tips, actionable info)
5. **Manual review** (optional flag for questionable content)

## Usage

### Manual Run

```bash
# Step 1: Scrape
cd /root/liberture && npx tsx scripts/scrapers/biohacking-news-scraper.ts

# Step 2: Enrich
cd /root/liberture && npx tsx scripts/scrapers/ai-enrichment-pipeline.ts

# Step 3: Publish
cd /root/liberture && npx tsx scripts/scrapers/publish-enriched-content.ts
```

### Full Pipeline

```bash
cd /root/liberture && npx tsx scripts/scrapers/run-scraping-pipeline.ts full
```

### Add to Heartbeat

Recommended: 2-3x per week during heartbeat checks

## Target Platforms

### Tier 1 (Implemented / High Priority)
- ✅ **BiohackingNews.org** - Daily articles
- 🔲 **Examine.com** - Supplement database
- 🔲 **FoundMyFitness** - Research summaries
- 🔲 **Huberman Lab** - Podcast transcripts

### Tier 2 (Medium Priority)
- 🔲 **Reddit r/Biohacking** - Community insights
- 🔲 **Lifespan.io** - Longevity research
- 🔲 **PubMed** - Scientific papers (abstracts)

### Tier 3 (Nice to Have)
- 🔲 **Dave Asprey** - Blog posts
- 🔲 **Tim Ferriss** - Experiments
- 🔲 **Peter Attia** - Newsletter

## Dependencies Added

- `cheerio` - HTML parsing for web scraping (installed via pnpm)

## Next Steps

1. ⏳ Test BiohackingNews scraper (run on real site)
2. ⏳ Run AI enrichment on test batch (3-5 articles)
3. ⏳ Publish enriched articles
4. 🔲 Add Examine.com scraper
5. 🔲 Add FoundMyFitness scraper
6. 🔲 Add to weekly heartbeat (2-3x/week)
7. 🔲 Build admin review page (approve before publishing)

## Files Created

```
liberture/
├── prisma/
│   ├── schema.prisma (+ScrapedContent model)
│   └── migrations/add_scraped_content.sql
├── scripts/
│   ├── add-more-knowledge.ts (manual articles)
│   └── scrapers/
│       ├── biohacking-news-scraper.ts
│       ├── ai-enrichment-pipeline.ts
│       ├── publish-enriched-content.ts
│       └── run-scraping-pipeline.ts
└── docs/
    └── SCRAPING-SYSTEM.md
```

## Commits

All changes committed to `leonacostaok/liberture`:
- Added ScrapedContent model
- Created scraping pipeline scripts
- Added 8 manual knowledge articles
- Documentation

---

**Status:** ✅ System ready for testing  
**Cost Estimate:** ~$0.0005 per article = ~$0.05 for 100 articles  
**Time to Populate:** 100 articles = ~20 minutes (scrape + enrich + publish)
