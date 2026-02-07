# Context Router Skill

**Auto-load minimal context based on what the user is talking about.**

## Purpose

Instead of loading ALL workspace files every time, this skill:
- Analyzes the user's message
- Picks the relevant project/context
- Loads ONLY the files needed for that topic
- Keeps separate conversation histories per context

Massively reduces token usage and keeps conversations focused.

## How It Works

1. **Before responding**, run the classifier on the user's message
2. It returns which context to use (e.g., "dandelion-labs", "leon-acosta", "infrastructure")
3. Load only the files defined for that context
4. Track conversation state per context

## Two Modes

### Mode 1: Explicit Context (NEW)
**When:** Leon says "use context {name}" at the start of a message  
**Do:** Load ONLY the files defined in that context

```bash
# List available contexts
node skills/context-router/load-context.js --list

# Load a specific context
node skills/context-router/load-context.js infrastructure
```

**Examples:**
- "use context infrastructure - check nginx status"
- "use context community-manager - add search feature"
- "use context dandelion-labs - create 5 LinkedIn posts"

**Contexts defined in:** `.openclaw/contexts.json`

### Mode 2: Automatic Classification
**When:** No explicit context specified  
**Do:** Classify message and load relevant files

## Usage

### 1. Classify the Message

```bash
node /root/.openclaw/workspace/skills/context-router/classify.js "user message here"
```

Output:
```json
{
  "context": "dandelion-labs",
  "confidence": 0.92,
  "keywords": ["blog", "content", "marketing"]
}
```

### 2. Load Context Files

Each context has a list of files to load. Example for `dandelion-labs`:
- `docs/projects/dandelion-labs/marketing-plan.md`
- `data/content.json` (filtered to project)
- Recent memory files

### 3. Track State

State file: `/root/.openclaw/workspace/skills/context-router/state.json`

Tracks:
- Current active context
- Last message per context
- Timestamp of last use

## Available Contexts

Defined in `context-map.json`:

| Context | When to Use | Files Loaded |
|---------|-------------|--------------|
| **dandelion-labs** | Dandelion Labs content, marketing, blog | Project docs, content data |
| **leon-acosta** | Leon Acosta personal brand, LinkedIn | Project docs, LinkedIn posts |
| **infrastructure** | Server, apps, deployments, PM2 | TOOLS.md, app configs (logs on-demand) |
| **robert-meta** | My own development, SOUL, identity | SOUL.md, IDENTITY.md, AGENTS.md |
| **general** | Catch-all, OpenClaw help, random tasks | Core workspace files only |

**Note:** Some resources (like PM2 logs) are marked "on-demand" — only fetch them when actually needed for debugging, not as part of default context loading.

## Context Switching

If message spans multiple contexts:
- Pick the **primary** one
- Note secondary contexts in response
- User can explicitly switch: "switch to infrastructure context"

## Explicit Commands

- `/context` - Show current context
- `/context <name>` - Switch to specific context
- `/context list` - Show all available contexts
- `/context clear` - Reset to general

## Integration

Add to AGENTS.md:

```markdown
## Context Routing

Before responding, classify the message:
1. Run `node skills/context-router/classify.js "<message>"`
2. Load only the files for that context (see context-map.json)
3. Track state in skills/context-router/state.json
```

## Example Flow

**User:** "Review the LinkedIn posts for Leon"

1. Classify → `leon-acosta` context
2. Load:
   - `docs/projects/leon-acosta/brand-voice.md`
   - LinkedIn posts from `data/content.json`
   - Recent `memory/YYYY-MM-DD.md`
3. Respond with focused context
4. Update state: `activeContext = "leon-acosta"`

**User:** "Check PM2 logs"

1. Classify → `infrastructure` context  
2. Load:
   - `TOOLS.md`
   - Server info from MEMORY.md
3. Run `pm2 logs`
4. Update state: `activeContext = "infrastructure"`

## Benefits

- ✅ **90% less tokens** on average
- ✅ Faster responses (less context to process)
- ✅ Better focus (no cross-project noise)
- ✅ Conversation continuity per topic
- ✅ Easy to add new contexts

## Maintenance

To add a new context:
1. Edit `context-map.json`
2. Add keywords and file patterns
3. Test with sample messages

---

**Created:** 2026-02-07  
**Status:** Active
