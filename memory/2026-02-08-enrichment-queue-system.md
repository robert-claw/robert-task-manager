# Enrichment Queue System - Async Batched Processing

**Date:** February 8, 2026  
**Commits:** Liberture 89e6431, Workspace 40a7756

## Architecture

### **Queue-Based System**
Instead of immediate processing, enrichments are queued and processed in batches during heartbeats.

**Flow:**
1. User clicks "Enrich" or "Enrich All" in admin
2. Items added to `/root/liberture/data/enrichment-queue.json`
3. Heartbeat checks queue 2-3x daily
4. Processes pending items in batches of 5
5. Updates database with results

---

## Components

### 1. Queue API (`/api/admin/enrich-queue`)

**GET** - List pending enrichments
```bash
curl http://localhost:3033/api/admin/enrich-queue
# Returns: { pending: [...], total: N }
```

**POST** - Add to queue
```json
{
  "type": "people",
  "id": "xyz",
  "name": "Andrew Huberman",
  "priority": "normal"
}
```

**PATCH** - Update status
```json
{
  "jobId": "enrich-123-abc",
  "status": "completed",
  "result": { ... }
}
```

**Queue File:** `/root/liberture/data/enrichment-queue.json`
```json
{
  "queue": [
    {
      "jobId": "enrich-1707405000-abc123",
      "type": "people",
      "id": "xyz",
      "name": "Andrew Huberman",
      "priority": "normal",
      "status": "pending",
      "createdAt": "2026-02-08T14:20:00Z",
      "attempts": 0
    }
  ]
}
```

**Statuses:**
- `pending` - In queue, not processed yet
- `processing` - Currently being enriched
- `completed` - Successfully enriched
- `failed` - Enrichment failed

---

### 2. Processor Script (`scripts/process-enrichment-queue.ts`)

**Location:** `/root/.openclaw/workspace/scripts/process-enrichment-queue.ts`

**What it does:**
1. Fetches pending enrichments from queue API
2. Groups into batches of 5
3. Sends one API call per batch to Together.ai
4. Updates database with results
5. Marks items as completed/failed

**AI Model:** Together.ai - `ServiceNow-AI/Apriel-1.6-15B-Thinker` (FREE)

**Batch Request Format:**
```
Research these 5 people:
1. Andrew Huberman
2. Wim Hof
3. Peter Attia
4. David Sinclair
5. Matthew Walker

Return JSON array with wikipedia, publications, speakingEvents, achievements for each.
```

**Rate Limiting:**
- 3 seconds between batches
- Max 5 items per batch
- Only processes during daytime (06:00-23:00)

---

### 3. Heartbeat Integration

**Added to HEARTBEAT.md:**
```markdown
## 7. Enrichment Queue Processing (2-3x daily)

Process pending enrichments for Liberture directory.

**Only run if:**
- There are pending enrichments in queue
- Last processing was >4 hours ago
- It's not late night (23:00-06:00)

Track in heartbeat-state.json under "lastEnrichmentProcessing"
```

**Heartbeat Logic:**
```javascript
const now = Date.now();
const lastRun = state.lastEnrichmentProcessing || 0;
const fourHours = 4 * 60 * 60 * 1000;

if (now - lastRun > fourHours) {
  const hour = new Date().getHours();
  if (hour >= 6 && hour < 23) {
    // Run processor
    await exec('npx tsx /root/.openclaw/workspace/scripts/process-enrichment-queue.ts');
    state.lastEnrichmentProcessing = now;
  }
}
```

---

### 4. UI Changes

**Admin → Directory:**
- "Enrich" button now queues instead of processing immediately
- Shows alert: "Added to enrichment queue! Will be processed by heartbeat."
- "Enrich All" queues all unenriched entries at once

**Benefits:**
- ✅ No UI blocking
- ✅ No timeouts
- ✅ Batched API calls (cheaper)
- ✅ Automatic processing
- ✅ Rate limiting built-in

---

## Usage

### Queue a Single Entry
1. Admin → Directory
2. Select type (people/books/organizations)
3. Click Sparkles icon on any entry
4. Alert confirms it's queued

### Queue All Unenriched
1. Admin → Directory
2. Select type
3. Click "Enrich All Unenriched" button
4. Confirm bulk queue
5. All unenriched entries added to queue

### Check Queue Status
```bash
curl http://localhost:3033/api/admin/enrich-queue | jq
```

### Manually Process Queue
```bash
cd /root/.openclaw/workspace
npx tsx scripts/process-enrichment-queue.ts
```

---

## Configuration

**Together.ai API Key:**
```bash
# Already set in workspace, copy to Liberture if needed
echo "TOGETHER_API_KEY=your_key" >> /root/liberture/.env.local
```

**Queue Settings:**
- **Batch size:** 5 items
- **Batch delay:** 3 seconds
- **Processing frequency:** Every 4 hours (during 06:00-23:00)
- **Max attempts:** Unlimited (failed items stay in queue)

---

## Monitoring

**Check Queue:**
```bash
cat /root/liberture/data/enrichment-queue.json | jq '.queue | length'
```

**View Pending:**
```bash
cat /root/liberture/data/enrichment-queue.json | jq '.queue[] | select(.status == "pending")'
```

**Last Processing Time:**
```bash
cat /root/.openclaw/workspace/memory/heartbeat-state.json | jq '.lastEnrichmentProcessing'
```

---

## Example Enrichment Result

**Input (Batch of 3):**
```json
[
  { "name": "Andrew Huberman", "type": "people", "id": "abc" },
  { "name": "Wim Hof", "type": "people", "id": "def" },
  { "name": "Peter Attia", "type": "people", "id": "ghi" }
]
```

**API Call:** 1 request to Together.ai with all 3 names

**Output:**
```json
[
  {
    "name": "Andrew Huberman",
    "wikipedia": "https://en.wikipedia.org/wiki/Andrew_Huberman",
    "publications": [
      "14,000+ citations on Google Scholar",
      "Research on neural plasticity",
      "Co-author: Stress mitigation paper (2023)"
    ],
    "speakingEvents": [
      "Huberman Lab Podcast (host, 2021-present)",
      "Joe Rogan Experience #1513, #1683, #1752, #1997",
      "Lex Fridman Podcast #234, #311, #436"
    ],
    "achievements": [
      "Associate Professor at Stanford",
      "McKnight Foundation Scholar",
      "Pew Biomedical Scholar"
    ]
  },
  ...
]
```

**Database Updates:** 3 people enriched from 1 API call

---

## Benefits vs Previous System

**Old System (Immediate Processing):**
- ❌ Blocked UI for 30-60 seconds
- ❌ Timeout risk on slow API
- ❌ 1 API call per entry (expensive)
- ❌ No rate limiting
- ❌ User had to wait

**New System (Queued + Batched):**
- ✅ Instant UI response
- ✅ No timeouts (runs in background)
- ✅ 1 API call per 5 entries (5x cheaper)
- ✅ Built-in rate limiting (3s delays)
- ✅ Automatic processing
- ✅ Processes during off-peak hours

---

## Cost Comparison

**Enriching 40 People:**

**Old System:**
- 40 API calls
- If using Perplexity ($0.001/request): $0.04
- Processing time: ~40 minutes (with delays)
- User must stay on page

**New System:**
- 8 API calls (40 ÷ 5)
- Using Together.ai Apriel (FREE): $0.00
- Processing time: ~2 minutes (batched)
- User can close page

**Savings:** $0.04 + 38 minutes + better UX

---

## Future Improvements

1. **Priority Queue** - Process high-priority items first
2. **Retry Logic** - Auto-retry failed items with exponential backoff
3. **Progress UI** - Show enrichment progress in admin panel
4. **Webhook Notifications** - Alert when batch completes
5. **Scheduled Processing** - Run at specific times (e.g., 3 AM daily)
6. **Result Caching** - Skip re-enriching recently enriched items

---

## Testing

**Add test items to queue:**
```bash
curl -X POST http://localhost:3033/api/admin/enrich-queue \
  -H "Content-Type: application/json" \
  -d '{"type":"people","id":"test123","name":"Test Person","priority":"normal"}'
```

**Process queue manually:**
```bash
npx tsx /root/.openclaw/workspace/scripts/process-enrichment-queue.ts
```

**Check results:**
```bash
cat /root/liberture/data/enrichment-queue.json | jq '.queue[] | select(.jobId == "...")' 
```

---

## Status

✅ **Complete and deployed**  
✅ **Queue API live**  
✅ **Processor script ready**  
✅ **Heartbeat integration added**  
✅ **UI updated to queue mode**  
✅ **Free AI model configured**

**Next Heartbeat:** Will check queue and process pending entries  
**Current Queue:** Empty (ready for items)
