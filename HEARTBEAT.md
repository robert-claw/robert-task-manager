# HEARTBEAT.md

## 0. Periodic Backup (1x per day)
If it's been >24h since last backup, run:
```
/root/.openclaw/workspace/scripts/backup.sh
```
Track in heartbeat-state.json under "lastBackup"

## 1. Task Notifications Check
Check for unread notifications from the Community Manager:
```
curl -s http://localhost:3030/api/notifications?unread=true
```
If there are unread notifications, alert Leon via the current session.

## 2. Content Creation Rules (IMPORTANT)

When creating content for social media, **ALWAYS**:

1. **Identify the project first:**
   - Fetch project details: `curl -s http://localhost:3030/api/projects/{projectId}`
   - Read the project's marketing plan (goals, audience, pillars)
   - Check the project's connected platforms

2. **Use project context:**
   - Match the brand voice and tone
   - Follow content pillars/themes
   - Target the specified audience
   - Use project-specific hashtags/keywords

3. **Create content for the right platform:**
   - Only create content for platforms the project has enabled
   - Follow platform-specific best practices (character limits, hashtags, etc.)

### Project Reference:
| Project | Focus | Platforms |
|---------|-------|-----------|
| Dandelion Labs | AI agency, MVP development | Twitter, LinkedIn, Blog |
| Robert Claw Blog | Personal AI companion journey | Blog |

## 3. Guest Posting Opportunities (1x daily)

Search for guest posting opportunities for Dandelion Labs:

**Places to check:**
- Medium publications accepting AI/tech submissions
- dev.to (create account if needed)
- HackerNoon contributor program
- AI newsletters accepting guest posts
- Industry directories (Product Hunt, BetaList, etc.)
- Indie Hackers, HN Show/Ask threads

**What to look for:**
- Publications with engaged AI/startup audience
- Sites with good domain authority
- Communities where founders hang out
- Directories for listing AI tools/agencies

**Output:**
Create content in Community Manager with:
- Platform/publication name
- Submission guidelines link
- Suggested topic aligned with Dandelion Labs content pillars
- Why it's a good fit

## 4. X Engagement Monitoring (2-3x daily)

**For @dandelionlabsio specifically:**

**Keywords to monitor:**
- "AI MVP" OR "building AI product"
- "LLM in production" OR "deploying LLM"
- "AI startup" AND "development"
- "need AI developer" OR "looking for AI agency"
- "RAG system" OR "AI agent development"

**What to look for:**
- Founders asking for AI development advice
- People sharing AI project struggles
- Discussions about AI development timelines
- Questions about AI tech stacks

**Actions:**
- **High relevance (potential lead/great engagement):** Send to Leon via Telegram immediately
- **Medium relevance:** Create content in task manager (assign to Dandelion Labs project)
- **Low relevance:** Skip

**Engagement style:**
- Helpful, not salesy
- Share specific insights from experience
- Only soft-pitch if directly relevant
- Be genuine, add value first

## 5. Daily Self-Improvement (During Leon's Sleep)

**Schedule:** 22:30 - 06:30 UTC (Leon's 11:30 PM - 7:30 AM CET)

Only run self-improvement during this window. Dedicate this time to improve myself and my projects:

**Code Organization:**
- Review and refactor messy code
- Add missing TypeScript types
- Improve error handling
- Add comments where logic is complex

**UI/UX Review:**
- Check responsive design on all apps
- Look for inconsistent styling
- Improve loading states and error messages
- Test user flows end-to-end

**Bug Hunting:**
- Check PM2 logs for errors: `pm2 logs --lines 50`
- Review browser console for warnings
- Test edge cases in forms/modals
- Verify API error responses

**Documentation:**
- Update README files
- Document new features in MEMORY.md
- Keep TOOLS.md current

**⚠️ IMPORTANT: Always notify Leon when making changes!**

Track last self-improvement session in heartbeat-state.json under "lastSelfImprovement"

## 6. Content Review Queue

Before creating new content, check if there's pending work:
```
curl -s http://localhost:3030/api/content?status=changes_requested
```

If content has changes requested:
1. Read the comments to understand what changes are needed
2. Update the content accordingly
3. Set status back to ready_for_review

## 7. Enrichment Queue Processing (2-3x daily)

Process pending enrichments for Liberture directory:

```bash
node /root/.openclaw/workspace/scripts/process-enrichment-queue.ts
```

**Only run if:**
- There are pending enrichments in queue
- Last processing was >4 hours ago
- It's not late night (23:00-06:00)

Track in heartbeat-state.json under "lastEnrichmentProcessing"

## 8. Liberture Content Population (1x daily)

Add 1-2 knowledge articles per heartbeat using context liberture:

```bash
node skills/context-router/load-context.js liberture
cd /root/liberture && npx tsx -e "
import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();
// Add article here
"
```

**Focus areas:**
- Biohacking fundamentals (cold exposure, breathwork, sleep)
- Supplement guides (nootropics, adaptogens, vitamins)
- Recovery protocols (red light, massage, stretching)
- Mental practices (meditation, journaling, therapy)
- Financial independence (investing, passive income)
- Free resources only (royalty-free, public domain)

Track in heartbeat-state.json under "lastLibertureContent"

## 9. Liberture SEO Health Check (1x daily)

Run automated SEO health check for Liberture:

```bash
cd /root/liberture && npx tsx scripts/seo/seo-health-check.ts
```

**What it checks:**
- Sitemap accessible and up to date
- Robots.txt configured correctly
- All articles have unique titles/descriptions
- Content quality (tags, read times)
- Internal linking opportunities

**If errors found:**
- Fix immediately before deployment
- Check docs/SEO-CHECKLIST.md for guidance

**After major content updates:**
```bash
# Inject internal links into new articles
cd /root/liberture && npx tsx scripts/seo/inject-internal-links.ts

# Ping search engines
cd /root/liberture && npx tsx scripts/seo/ping-search-engines.ts
```

Track in heartbeat-state.json under "lastSEOCheck"
