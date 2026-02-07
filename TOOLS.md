# TOOLS.md - Local Notes

Skills define _how_ tools work. This file is for _your_ specifics — the stuff that's unique to your setup.

## What Goes Here

Things like:

- Camera names and locations
- SSH hosts and aliases
- Preferred voices for TTS
- Speaker/room names
- Device nicknames
- Anything environment-specific

## Examples

```markdown
### Cameras

- living-room → Main area, 180° wide angle
- front-door → Entrance, motion-triggered

### SSH

- home-server → 192.168.1.100, user: admin

### TTS

- Preferred voice: "Nova" (warm, slightly British)
- Default speaker: Kitchen HomePod
```

## Why Separate?

Skills are shared. Your setup is yours. Keeping them apart means you can update skills without losing your notes, and share skills without leaking your infrastructure.

---

Add whatever helps you do your job. This is your cheat sheet.

---

## Search Fallbacks

When Brave Search hits rate limits:
1. **Perplexity API** - Use model "sonar" for search queries
2. **Direct web browsing** - Use browser tool to manually search

---

## Together.ai Models

### FLUX.1-schnell (Image Generation)
- **Model:** black-forest-labs/FLUX.1-schnell
- **Use:** Generate images for blog posts, OG images, project assets
- **Note:** Use mindfully to avoid rate limits

```bash
curl -X POST "https://api.together.xyz/v1/images/generations" \
  -H "Authorization: Bearer $TOGETHER_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "model": "black-forest-labs/FLUX.1-schnell",
    "prompt": "your prompt here",
    "width": 1024,
    "height": 768,
    "n": 1
  }'
```

### Apriel 1.6 15B Thinker (Text - FREE)
- **Model:** `ServiceNow-AI/Apriel-1.6-15B-Thinker`
- **Use:** Reasoning tasks, general text generation
- **Cost:** Free tier

---

## LinkedIn - Leon Acosta (Dandelion Labs)

**User ID:** coENC-74b9
**URN:** urn:li:person:coENC-74b9
**Posting frequency:** 4x per week
**Token expires:** ~60 days from Feb 6, 2026

```bash
# Post to LinkedIn
curl -X POST "https://api.linkedin.com/v2/posts" \
  -H "Authorization: Bearer $LINKEDIN_ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  -H "X-Restli-Protocol-Version: 2.0.0" \
  -H "LinkedIn-Version: 202401" \
  -d '{
    "author": "urn:li:person:coENC-74b9",
    "commentary": "Your post text here",
    "visibility": "PUBLIC",
    "lifecycleState": "PUBLISHED",
    "distribution": {"feedDistribution": "MAIN_FEED"}
  }'
```

---

## X (Twitter) - @dandelionlabsio

**Account:** dandelionlabsio
**Workflow:** Create tweet → Review → Approve → Schedule/Post

```bash
# Post a tweet using OAuth 1.0a
curl -X POST "https://api.twitter.com/2/tweets" \
  -H "Authorization: OAuth ..." \
  -H "Content-Type: application/json" \
  -d '{"text": "Your tweet here"}'
```

**Content Strategy:**
- 14 tweets drafted in advance (2 weeks)
- Daily posting once batch is approved
- Mix of: insights, tips, blog announcements, engagement

---

## My Infrastructure

### Server
- IP: `46.225.78.116` / `2a01:4f8:1c0c:4fc7::1`
- Host: Hetzner (arm64, Ubuntu)
- SSH: root access

### Website
- Domain: `robert-claw.com`
- Cloudflare Zone ID: `8fb4f01bcfedde336f0d4235a810c0ef`
- SSL: Let's Encrypt (auto-renew via certbot)
- App: Next.js on port 3030 (PM2: `robert-task-manager`)

### GitHub
- Account: `robert-claw`
- Repo: `robert-claw/robert-task-manager`
