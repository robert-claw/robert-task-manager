# Content Funnel System Overview

**Created:** February 7, 2026  
**Status:** Implemented in Community Manager v1.1

---

## What This System Does

I've built a complete funnel-based content strategy framework that:

1. **Maps every piece of content** to a specific stage in your conversion funnel
2. **Links content together** to create conversion paths (TOFU → MOFU → BOFU)
3. **Visualizes these funnels** so you can see how content flows from awareness to booking
4. **Defines strategy types** for each platform with metrics and best practices

---

## The Three Funnel Stages

### TOFU (Top of Funnel) - Awareness 🔵
**Goal:** Get founders to know you exist and remember you

**Content Types:**
- Hot takes on AI development
- Founder journey posts
- Industry commentary
- Quick insights
- SEO guides

**Success Metrics:**
- Impressions > 2K
- Engagement > 5%
- Followers +10-20 per post

**What happens next:** TOFU content links to MOFU content (educational guides, case studies)

---

### MOFU (Middle of Funnel) - Consideration 🟠
**Goal:** Prove expertise and get founders to engage deeper

**Content Types:**
- Educational frameworks
- Case study teasers
- Technical credibility posts
- How-to guides
- Lead magnets (templates, calculators)

**Success Metrics:**
- Link clicks > 20
- Lead magnet downloads > 5
- Email signups > 3

**What happens next:** MOFU content links to BOFU content (discovery calls) or email sequences

---

### BOFU (Bottom of Funnel) - Conversion 🟢
**Goal:** Drive discovery call bookings

**Content Types:**
- Social proof (testimonials, results)
- Objection handling
- Limited availability offers
- Comparison posts
- FAQ/process pages

**Success Metrics:**
- Discovery calls booked > 2
- Calendar clicks > 30
- DM inquiries > 3

**What happens next:** Booking a discovery call (end of funnel)

---

## Platform-Specific Strategies

I've defined **24 specific strategy types** across LinkedIn, Twitter, and Blog:

### LinkedIn (13 strategies)
- **TOFU:** Hot Take, Founder Journey, Industry Commentary
- **MOFU:** Educational Framework, Case Study Teaser, Technical Credibility
- **BOFU:** Social Proof, Objection Handling, Limited Availability

### Twitter (5 strategies)
- **TOFU:** Quick Insight, Engagement Question
- **MOFU:** Educational Thread, Story Thread
- **BOFU:** DM Conversion

### Blog (6 strategies)
- **TOFU:** SEO Guide
- **MOFU:** How-To Guide, Full Case Study, Lead Magnet
- **BOFU:** Comparison Post, FAQ

Each strategy has:
- Specific format guidelines
- Recommended frequency
- Success metrics
- Typical links to other strategies

**All this is defined in:** `/root/.openclaw/workspace/src/lib/funnel-strategies.ts`

---

## How Content Links Together

Content can link to other content in 3 ways:

1. **leads_to** - Direct funnel progression
   - Example: Hot Take (TOFU) → Case Study (MOFU) → Discovery Call (BOFU)

2. **supports** - Related content at same stage
   - Example: Educational Framework supports Case Study Teaser

3. **amplifies** - Cross-platform versions
   - Example: Twitter Thread amplifies Blog Post

---

## Example Funnels

### Funnel 1: Speed Positioning
```
TOFU (LinkedIn):
"Most AI agencies quote 4-6 months. We ship in 2-3 weeks. Here's how 👇"
↓ leads_to
MOFU (Blog):
"How to Build an AI MVP in 3 Weeks (Not 3 Months)"
+ Lead Magnet: "AI MVP Scoping Template"
↓ leads_to
BOFU (Email Sequence):
5 emails ending with "Ready to scope yours?"
↓ leads_to
Discovery Call Booked ✅
```

### Funnel 2: Cost Transparency
```
TOFU (Twitter):
"VCs ask 'how much?' Everyone says 'depends.' Here's our real answer: [thread]"
↓ leads_to
MOFU (Thread):
"Fixed-price AI MVP: $35K-$65K depending on [factors]..."
Links to blog: "AI Development Pricing Guide"
↓ leads_to
BOFU (Blog):
"Transparent Pricing Calculator"
Interactive tool → Email capture → Nurture sequence
↓ leads_to
Discovery Call Booked ✅
```

### Funnel 3: Technical Credibility
```
TOFU (LinkedIn):
"Your RAG system is slow because [technical insight]. Here's the fix."
↓ leads_to
MOFU (Blog):
"RAG Architecture for Production: A Complete Guide"
CTA: "Download our RAG checklist"
↓ leads_to
BOFU (Email):
"Using our RAG checklist? We can build it for you."
↓ leads_to
Discovery Call Booked ✅
```

---

## In the Community Manager

### New Features Added:

1. **Funnel Stage Selector**
   - When creating content, choose TOFU/MOFU/BOFU
   - Color-coded: Blue (TOFU), Amber (MOFU), Green (BOFU)

2. **Strategy Type Dropdown**
   - Populated based on platform + funnel stage
   - Shows format guidelines and metrics

3. **Conversion Goals**
   - Define specific metrics for each piece
   - e.g., "Impressions > 2K", "Calls booked > 2"

4. **Link Content**
   - Connect content to create funnel flows
   - Choose link type: leads_to, supports, amplifies

5. **Funnels Page** (`/funnels`)
   - Visual funnel flowcharts
   - See all content by stage
   - Detect conversion paths automatically

---

## How to Use This When Creating Content

### Step 1: Decide the Stage
Ask: "What is this content supposed to do?"
- Make people aware → **TOFU**
- Educate and build trust → **MOFU**
- Get them to book a call → **BOFU**

### Step 2: Choose Strategy Type
Based on platform and stage, pick a strategy:
- LinkedIn TOFU → Hot Take, Founder Journey, or Industry Commentary
- Blog MOFU → How-To Guide or Case Study
- LinkedIn BOFU → Social Proof or Objection Handling

### Step 3: Set Conversion Goals
Define what success looks like:
- TOFU: "Impressions > 2K, Engagement > 5%"
- MOFU: "Downloads > 5, Email signups > 3"
- BOFU: "Calls booked > 2"

### Step 4: Link to Next Step
Ask: "What should they do next?"
- TOFU → Link to a MOFU guide or case study
- MOFU → Link to BOFU (discovery call) or another MOFU (email signup)
- BOFU → Discovery call (end of funnel)

---

## Success Metrics by Stage

### TOFU Success:
- Total impressions across platforms > 100K/month
- Follower growth > 500/month combined
- Website traffic > 2K visits/month

### MOFU Success:
- Lead magnet downloads > 50/month
- Email list growth > 200/month
- Case study page views > 500/month

### BOFU Success:
- Discovery calls booked > 10/month
- Qualified leads (passed discovery) > 5/month
- Proposals sent > 3/month

---

## What I Need From You

1. **Review the strategy document:**
   `/root/.openclaw/workspace/docs/projects/dandelion-labs/content-funnel-strategy.md`

2. **Check the funnel visualization:**
   Go to http://task-manager.robert-claw.com/funnels

3. **Approve or adjust:**
   - Are the strategy types right for each platform?
   - Do the metrics make sense?
   - Should I add/remove/modify any strategies?

4. **Start using it:**
   When you (or I) create content, we'll now assign:
   - Funnel stage
   - Strategy type
   - Conversion goals
   - Links to other content

This creates a **complete conversion machine**, not just random posts.

---

## Files Created/Updated

1. **Strategy Definition:**
   - `/root/.openclaw/workspace/docs/projects/dandelion-labs/content-funnel-strategy.md`
   - Full strategy breakdown by platform and stage

2. **Code Implementation:**
   - `/root/.openclaw/workspace/src/lib/types.ts` - Added funnel types
   - `/root/.openclaw/workspace/src/lib/funnel-strategies.ts` - Strategy definitions
   - `/root/.openclaw/workspace/src/app/funnels/page.tsx` - Funnel visualization page
   - `/root/.openclaw/workspace/src/components/layout/Sidebar.tsx` - Added Funnels link

3. **This Overview:**
   - `/root/.openclaw/workspace/docs/projects/dandelion-labs/FUNNEL-SYSTEM-OVERVIEW.md`

---

## Next Steps

1. **Build finishes** → Restart Community Manager
2. **You review** → Tell me what to adjust
3. **Update content form** → Add funnel fields to the New Content modal (TODO)
4. **Start creating linked content** → Build out the first complete funnel

Ready to make this real?

— Robert 🦞
