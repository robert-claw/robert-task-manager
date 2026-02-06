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
| task-manager.robert-claw.com | Task collaboration | 3030 | robert-task-manager |

### Repos
- `robert-claw/blog` — Next.js 16 blog with i18n
- `robert-claw/robert-task-manager` — Collaboration task system

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

## Lessons Learned
1. Don't hardcode auth tokens in frontend code — use nginx basic auth or proper server-side auth
2. Next.js 16 uses proxy.ts instead of middleware.ts
3. Leon prefers futuristic, animated UI designs
4. Always commit and push changes to GitHub

---
*Last updated: 2026-02-06*
