#!/usr/bin/env npx tsx
/**
 * Process Enrichment Queue
 * Called by heartbeat to process pending enrichments in batches
 */

interface QueueItem {
  jobId: string;
  type: string;
  id: string;
  name: string;
  status: string;
  createdAt: string;
  attempts: number;
}

interface EnrichmentResult {
  wikipedia?: string;
  publications?: string[];
  speakingEvents?: string[];
  achievements?: string[];
}

async function enrichBatch(items: QueueItem[]): Promise<Map<string, EnrichmentResult>> {
  const results = new Map<string, EnrichmentResult>();
  
  // Use Together.ai's free Apriel model
  const togetherKey = process.env.TOGETHER_API_KEY;
  if (!togetherKey) {
    console.error('❌ TOGETHER_API_KEY not set');
    return results;
  }
  
  // Batch request: Ask about all items at once
  const prompt = `Research the following ${items[0].type} for biohacking/health optimization context. For each, find Wikipedia URL (verify exists), publications, speaking events, and achievements.

${items.map((item, i) => `${i + 1}. ${item.name}`).join('\n')}

Return results in JSON array format:
[
  {
    "name": "${items[0].name}",
    "wikipedia": "URL or null",
    "publications": ["title1", "title2"],
    "speakingEvents": ["event1", "event2"],
    "achievements": ["achievement1", "achievement2"]
  },
  ...
]

IMPORTANT: Return ONLY verified information. Use null/empty arrays if not found. Be specific with titles and episode numbers.`;

  try {
    const response = await fetch('https://api.together.xyz/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${togetherKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'ServiceNow-AI/Apriel-1.6-15B-Thinker',
        messages: [{ role: 'user', content: prompt }],
        temperature: 0.3,
        max_tokens: 2000,
      }),
    });
    
    if (!response.ok) {
      console.error('Together.ai API error:', response.status);
      return results;
    }
    
    const data = await response.json();
    const content = data.choices?.[0]?.message?.content || '';
    
    // Try to parse JSON response
    const jsonMatch = content.match(/\[[\s\S]*\]/);
    if (!jsonMatch) {
      console.error('No JSON array found in response');
      return results;
    }
    
    const enrichments = JSON.parse(jsonMatch[0]);
    
    // Map results back to items
    for (const enrichment of enrichments) {
      const item = items.find(i => i.name === enrichment.name);
      if (item) {
        results.set(item.jobId, {
          wikipedia: enrichment.wikipedia || null,
          publications: Array.isArray(enrichment.publications) ? enrichment.publications : [],
          speakingEvents: Array.isArray(enrichment.speakingEvents) ? enrichment.speakingEvents : [],
          achievements: Array.isArray(enrichment.achievements) ? enrichment.achievements : [],
        });
      }
    }
    
    return results;
  } catch (error) {
    console.error('Batch enrichment error:', error);
    return results;
  }
}

async function updateDatabase(item: QueueItem, result: EnrichmentResult) {
  // This would be called from Node script with Prisma
  console.log(`✅ Would update ${item.type}/${item.id} with:`, result);
}

async function main() {
  console.log('🔄 Processing enrichment queue...');
  
  // Fetch pending items
  const response = await fetch('http://localhost:3033/api/admin/enrich-queue');
  if (!response.ok) {
    console.error('Failed to fetch queue');
    return;
  }
  
  const { pending } = await response.json();
  
  if (pending.length === 0) {
    console.log('✅ No pending enrichments');
    return;
  }
  
  console.log(`📋 Found ${pending.length} pending enrichments`);
  
  // Process in batches of 5
  const batchSize = 5;
  for (let i = 0; i < pending.length; i += batchSize) {
    const batch = pending.slice(i, i + batchSize);
    console.log(`\n🔬 Processing batch ${Math.floor(i / batchSize) + 1}...`);
    
    // Mark as processing
    for (const item of batch) {
      await fetch('http://localhost:3033/api/admin/enrich-queue', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ jobId: item.jobId, status: 'processing' }),
      });
    }
    
    // Enrich batch
    const results = await enrichBatch(batch);
    
    // Update database and mark as complete
    for (const item of batch) {
      const result = results.get(item.jobId);
      if (result) {
        await updateDatabase(item, result);
        await fetch('http://localhost:3033/api/admin/enrich-queue', {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ 
            jobId: item.jobId, 
            status: 'completed',
            result 
          }),
        });
        console.log(`  ✅ ${item.name}`);
      } else {
        await fetch('http://localhost:3033/api/admin/enrich-queue', {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ jobId: item.jobId, status: 'failed' }),
        });
        console.log(`  ❌ ${item.name} - no result`);
      }
    }
    
    // Rate limit between batches
    if (i + batchSize < pending.length) {
      console.log('⏳ Waiting 3s before next batch...');
      await new Promise(resolve => setTimeout(resolve, 3000));
    }
  }
  
  console.log('\n✨ Queue processing complete');
}

main().catch(console.error);
