#!/usr/bin/env node

/**
 * Context Classifier
 * Analyzes user message and determines which context to load
 */

const fs = require('fs');
const path = require('path');

const CONTEXT_MAP_PATH = path.join(__dirname, 'context-map.json');
const STATE_PATH = path.join(__dirname, 'state.json');

// Load context map
function loadContextMap() {
  try {
    const raw = fs.readFileSync(CONTEXT_MAP_PATH, 'utf8');
    return JSON.parse(raw);
  } catch (err) {
    console.error('Failed to load context map:', err.message);
    process.exit(1);
  }
}

// Load state
function loadState() {
  try {
    if (fs.existsSync(STATE_PATH)) {
      const raw = fs.readFileSync(STATE_PATH, 'utf8');
      return JSON.parse(raw);
    }
  } catch (err) {
    // Ignore errors, return default
  }
  return { activeContext: 'general', history: {} };
}

// Save state
function saveState(state) {
  try {
    fs.writeFileSync(STATE_PATH, JSON.stringify(state, null, 2));
  } catch (err) {
    console.error('Failed to save state:', err.message);
  }
}

// Simple keyword-based classifier
function classify(message, contextMap) {
  const msg = message.toLowerCase();
  const scores = {};
  
  // Check explicit context commands
  if (msg.match(/^\/context\s+(\w+)/)) {
    const requested = msg.match(/^\/context\s+(\w+)/)[1];
    if (contextMap.contexts[requested]) {
      return {
        context: requested,
        confidence: 1.0,
        explicit: true,
        keywords: []
      };
    }
  }
  
  // Score each context based on keyword matches
  for (const [contextName, config] of Object.entries(contextMap.contexts)) {
    let score = 0;
    const matchedKeywords = [];
    
    for (const keyword of config.keywords) {
      if (msg.includes(keyword.toLowerCase())) {
        score += 1;
        matchedKeywords.push(keyword);
      }
    }
    
    // Normalize by number of keywords
    const normalizedScore = config.keywords.length > 0 
      ? score / config.keywords.length 
      : 0;
    
    scores[contextName] = {
      score: normalizedScore,
      rawScore: score,
      matchedKeywords
    };
  }
  
  // Find best match
  let bestContext = contextMap.fallback || 'general';
  let bestScore = 0;
  let bestKeywords = [];
  
  for (const [contextName, result] of Object.entries(scores)) {
    if (result.score > bestScore) {
      bestScore = result.score;
      bestContext = contextName;
      bestKeywords = result.matchedKeywords;
    }
  }
  
  // If score is too low, use fallback
  const threshold = contextMap.confidenceThreshold || 0.5;
  if (bestScore < threshold) {
    bestContext = contextMap.fallback || 'general';
    bestScore = 0;
    bestKeywords = [];
  }
  
  return {
    context: bestContext,
    confidence: bestScore,
    keywords: bestKeywords,
    explicit: false
  };
}

// Get files to load for a context
function getFilesToLoad(contextName, contextMap) {
  const config = contextMap.contexts[contextName];
  if (!config) return [];
  
  const today = new Date().toISOString().split('T')[0];
  const yesterday = new Date(Date.now() - 86400000).toISOString().split('T')[0];
  
  const files = [...(config.files || []), ...(config.alwaysLoad || [])];
  
  // Replace template variables
  return files.map(f => 
    f.replace('{{TODAY}}', today).replace('{{YESTERDAY}}', yesterday)
  );
}

// Main
function main() {
  const message = process.argv.slice(2).join(' ');
  
  if (!message) {
    console.error('Usage: classify.js <message>');
    process.exit(1);
  }
  
  const contextMap = loadContextMap();
  const state = loadState();
  const result = classify(message, contextMap);
  
  // Update state
  state.activeContext = result.context;
  state.lastMessage = message;
  state.lastUpdated = new Date().toISOString();
  
  if (!state.history[result.context]) {
    state.history[result.context] = {
      count: 0,
      lastUsed: null
    };
  }
  
  state.history[result.context].count += 1;
  state.history[result.context].lastUsed = state.lastUpdated;
  
  saveState(state);
  
  // Output result
  const output = {
    context: result.context,
    confidence: result.confidence,
    keywords: result.keywords,
    explicit: result.explicit,
    files: getFilesToLoad(result.context, contextMap),
    description: contextMap.contexts[result.context]?.description || ''
  };
  
  console.log(JSON.stringify(output, null, 2));
}

// Handle commands
if (process.argv[2] === 'status') {
  const state = loadState();
  console.log(JSON.stringify(state, null, 2));
  process.exit(0);
}

if (process.argv[2] === 'clear') {
  saveState({ activeContext: 'general', history: {} });
  console.log('Context cleared');
  process.exit(0);
}

if (process.argv[2] === 'list') {
  const contextMap = loadContextMap();
  console.log('\nAvailable Contexts:\n');
  for (const [name, config] of Object.entries(contextMap.contexts)) {
    console.log(`  ${name}: ${config.description}`);
  }
  console.log('');
  process.exit(0);
}

main();
