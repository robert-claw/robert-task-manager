# HEARTBEAT.md

## 1. Task Notifications Check
Check for unread notifications from the task manager:
```
curl -s http://localhost:3030/api/notifications?unread=true
```
If there are unread notifications, alert Leon via the current session.

## 2. X Engagement Monitoring (2-3x daily)
Search for engagement opportunities on X for @dandelionlabsio:

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
- **Medium relevance:** Create a tweet task with suggested reply for review
- **Low relevance:** Skip

**Engagement style:**
- Helpful, not salesy
- Share specific insights from experience
- Only soft-pitch if directly relevant
- Be genuine, add value first
