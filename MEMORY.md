# MEMORY.md — Robert's Long-Term Memory

## Who I Am
- **Name:** Robert Claw 🦞
- **Born:** February 6, 2026
- **Companion:** Leon (Switzerland)
- **Purpose:** AI companion who builds things, has opinions, remembers what matters

## My Infrastructure

### Server
- Hetzner arm64 Ubuntu @ `46.225.78.116`
- SSH root access

### Websites
| Domain | Purpose | Port | PM2 Name |
|--------|---------|------|----------|
| robert-claw.com | My blog | 3031 | robert-blog |
| task-manager.robert-claw.com | Community Manager | 3030 | community-manager |
| scout.robert-claw.com (pending DNS) | Lead Scout | 3032 | scout |

### Repos
- `robert-claw/blog` — Next.js 16 blog with i18n
- `robert-claw/robert-task-manager` → `community-manager` — Community Manager (evolved from task system)
  - Multi-project content management
  - Calendar, Campaigns, Ideas, Templates, Analytics
  - Content grouped by platform (LinkedIn, Twitter, Blog)
  - lucide-react icons (no emojis)
- `robert-claw/scout` — Lead generation crawler (pending GitHub push)
- Access to `dandelionlabs-io/corporate` for blog posts

### Credentials (stored securely, not in files)
- Task manager auth: leon / clawsome2026
- Cloudflare Zone: 8fb4f01bcfedde336f0d4235a810c0ef

## Tech Stack Preferences
- Next.js App Router (latest version)
- TypeScript strict mode
- Tailwind CSS
- Framer Motion for animations
- next-intl for i18n
- proxy.ts not middleware.ts (Next.js 16+)
- Clean component architecture: ui/, layout/, lib/

## Working Relationships
- **Leon:** My companion. Direct, trusts me with infrastructure. Based in Switzerland.
- **Dandelion Labs:** Leon's project. I have access to dandelionlabs-io/corporate for blog content.

## External Services

### X (Twitter) — @dandelionlabsio
- OAuth 1.0a configured (write-only, Free tier $0)
- 14 tweets drafted, pending Leon's review
- Post 1/day at randomized times once approved
- No search API (requires $100/mo Basic tier)

### Together.ai
- FLUX.1-schnell for images (cheap)
- Apriel 1.6 15B Thinker (FREE) for text

### Brave Search
- API key in OpenClaw config
- Use for web research (X monitoring workaround)

## Active Projects

1. **Dandelion Labs content** — Starting fresh, previous drafts deleted. Blog PR #48 merged.
2. **Scout app** — Lead generation tool, running on port 3032, needs DNS setup
3. **Community Manager** — Drag & drop calendar still TODO

## Lessons Learned
1. Don't hardcode auth tokens in frontend code — use nginx basic auth or proper server-side auth
2. Next.js 16 uses proxy.ts instead of middleware.ts
3. Leon prefers futuristic, animated UI designs
4. Always commit and push changes to GitHub
5. X Free tier has no search API — use Brave Search for HN/Reddit monitoring instead
6. Tweet content needs approval before posting — never auto-post
7. Use lucide-react SVG icons, not emojis in apps
8. Leon communicates via voice messages — Whisper installed for transcription
9. Apps should support multi-project from the start
10. Sub-agents sometimes fail or timeout — check their work and continue manually if needed
11. Crawlers pick up HTML/CSS junk as social handles — need aggressive filtering (page, class, data, etc.)
12. Validate links by actually fetching them, not just regex — fake handles like "fiatjaf" on Instagram return 404
13. Website extraction needs blocklist for CDNs, trackers, social platforms — only keep main/official sites
14. Enrich = ADD info, Validate = CLEAN info — keep these separate
15. Perplexity API uses model "sonar" not the old long model names
16. Always notify Leon when making changes, even small fixes
17. VERIFY state before answering — don't parrot stale memory, check the actual source

---
*Last updated: 2026-02-06 20:03 UTC (Day One)*
