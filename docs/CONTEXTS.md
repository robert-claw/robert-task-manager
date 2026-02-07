# Context System

**Purpose:** Load only the files you need for a specific task to save tokens and stay focused.

---

## Quick Start

### Use a specific context
```
Leon: "use context infrastructure - check nginx status"
Robert: [loads only infrastructure files, runs commands]
```

### List available contexts
```bash
node skills/context-router/load-context.js --list
```

### Load a context manually
```bash
node skills/context-router/load-context.js community-manager
```

---

## Available Contexts

### `community-manager`
**What:** Next.js Community Manager app (task-manager.robert-claw.com)  
**Use for:** App development, debugging, feature requests, UI changes  
**Loads:** package.json, types, components, funnel strategies

### `blog`
**What:** Robert's personal blog (robert-claw.com)  
**Use for:** Blog content, site changes, i18n, design  
**Loads:** Blog app structure, content files

### `scout`
**What:** Lead generation crawler app (scout.robert-claw.com)  
**Use for:** Lead gen features, crawling logic, data enrichment  
**Loads:** Scout app source

### `infrastructure`
**What:** Server, DNS, deployment, hosting  
**Use for:** Server management, DNS changes, SSL, PM2, backups  
**Loads:** TOOLS.md, scripts, server info  
**Commands:** pm2 list, nginx status, certbot

### `skills`
**What:** OpenClaw skills development  
**Use for:** Creating/updating skills, ClawHub, skill structure  
**Loads:** Skills directory, clawhub config

### `dandelion-labs`
**What:** Dandelion Labs marketing, content, strategy  
**Use for:** Content creation, marketing strategy, social posts  
**Loads:** Marketing plans, funnel strategies, project docs

### `personal`
**What:** Personal context, preferences, identity  
**Use for:** Getting to know me, understanding preferences  
**Loads:** USER.md, SOUL.md, IDENTITY.md, AGENTS.md

### `memory`
**What:** Long-term memory and daily logs  
**Use for:** Recalling past events, updating MEMORY.md  
**Loads:** MEMORY.md, memory/*.md

### `heartbeat`
**What:** Heartbeat tasks and monitoring  
**Use for:** Running heartbeat checks, task monitoring  
**Loads:** HEARTBEAT.md, heartbeat state, notification API

---

## How It Works

### 1. Context Definition
Contexts are defined in `.openclaw/contexts.json`:

```json
{
  "contexts": {
    "infrastructure": {
      "description": "Server, DNS, deployment, hosting",
      "files": ["TOOLS.md", "scripts/backup.sh"],
      "directories": ["scripts"],
      "commands": ["pm2 list", "df -h"],
      "notes": ["Server: 46.225.78.116"]
    }
  }
}
```

### 2. Loading a Context
When Leon says "use context X":
1. Run `node skills/context-router/load-context.js X`
2. Read the files listed
3. Run suggested commands if helpful
4. Use notes as reference

### 3. Benefits
- **Massive token savings** - Only load what you need
- **Stay focused** - No distractions from unrelated files
- **Faster responses** - Less context to process
- **Explicit control** - Leon decides what's relevant

---

## Adding New Contexts

Edit `.openclaw/contexts.json`:

```json
{
  "contexts": {
    "my-new-context": {
      "description": "What this context is for",
      "files": ["file1.md", "file2.json"],
      "directories": ["src/components"],
      "commands": ["npm test"],
      "notes": ["Important info to remember"]
    }
  }
}
```

All paths are relative to `/root/.openclaw/workspace`.

---

## Best Practices

### When to use explicit context
- **Infrastructure work** - Server, DNS, deployment
- **App development** - Specific app (blog, scout, community-manager)
- **Skill creation** - Use `skills` context
- **Content creation** - Use `dandelion-labs` context

### When to use automatic classification
- **General chat** - Let classifier decide
- **Multi-topic conversations** - Classifier adapts
- **Exploratory work** - Not sure which context yet

### Token savings
- **Without context:** Load 20+ files every session (~30K tokens)
- **With context:** Load 3-5 files per session (~5K tokens)
- **Savings:** ~85% reduction in context size

---

## Examples

### Infrastructure work
```
Leon: "use context infrastructure - update nginx config for new subdomain"
Robert: [loads TOOLS.md, scripts, runs pm2 list]
        "Got it. Which subdomain are we adding?"
```

### App development
```
Leon: "use context community-manager - add a search feature"
Robert: [loads app structure, types, components]
        "I'll add search to the content page. Should it search titles, content, or both?"
```

### Content strategy
```
Leon: "use context dandelion-labs - create 5 LinkedIn posts for next week"
Robert: [loads marketing plan, funnel strategy]
        "Loading Dandelion Labs marketing plan... Creating TOFU/MOFU mix."
```

---

**This system lets Leon control exactly what I load, saving tokens and keeping me focused.**
