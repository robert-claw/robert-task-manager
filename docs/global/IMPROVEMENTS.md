# Infrastructure Improvements & Security Audit

**Date:** 2026-02-06
**Author:** Robert Claw

## Security Issues Found

### 🔴 Critical

1. **Scout app has NO authentication** - Anyone can access lead data
   - Fix: Add nginx basic auth (same as task-manager)

2. **Next.js apps listen on 0.0.0.0** - Exposed to public internet
   - Apps on ports 3030, 3031, 3032 bypass nginx
   - Fix: Bind to localhost only in next.config

3. **CUPS (port 631) exposed** - Printing service not needed
   - Fix: Disable or firewall

### 🟡 Medium

4. **Scout missing SSL hardening** - No DH params or modern options
   - Fix: Add Let's Encrypt options-ssl-nginx.conf

5. **No rate limiting** - APIs vulnerable to abuse
   - Fix: Add nginx rate limiting

6. **No security headers** - XSS, clickjacking possible
   - Fix: Add security headers to nginx

### 🟢 Low

7. **No HTTP/2 on task-manager** - Performance improvement
8. **No gzip compression** - Larger responses
9. **PM2 not set to restart on boot** - Manual start needed

---

## Code Organization Issues

### Task Manager (`/root/.openclaw/workspace/`)

1. **Mixed old/new structure** - Some files in `/app`, others in `/src/app`
2. **No consistent error handling** - API routes handle errors differently
3. **No input validation library** - Manual validation, easy to miss cases
4. **Hardcoded credentials** - `leon/clawsome2026` in code

### Scout (`/root/scout/`)

1. **No authentication at all** - Wide open
2. **Large crawler.ts** - 500+ lines, should split
3. **No request timeout handling** - Crawls can hang
4. **Perplexity API key in env but not validated**

### Blog (`/root/robert-blog/`)

1. **Good structure** - Clean i18n setup
2. **Missing sitemap.xml** - SEO improvement needed
3. **No robots.txt** - SEO

---

## Recommended Actions

### Phase 1: Security (Do Now)

- [x] Add nginx basic auth to Scout
- [ ] Bind Next.js to localhost only
- [ ] Add security headers
- [ ] Add rate limiting
- [ ] Disable CUPS

### Phase 2: Code Quality (This Week)

- [ ] Add Zod for input validation
- [ ] Standardize error handling
- [ ] Split large files (crawler.ts)
- [ ] Move credentials to env vars
- [ ] Add request timeouts

### Phase 3: DevOps (Soon)

- [ ] PM2 startup script
- [ ] Backup automation
- [ ] Health check endpoints
- [ ] Monitoring/alerting

---

## Best Practices for Future

### API Routes

```typescript
// Always validate input
import { z } from 'zod'

const schema = z.object({
  name: z.string().min(1).max(100),
  email: z.string().email(),
})

export async function POST(req: Request) {
  try {
    const body = await req.json()
    const data = schema.parse(body) // Throws if invalid
    // ... handle request
    return Response.json({ success: true, data })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return Response.json({ error: 'Invalid input', details: error.errors }, { status: 400 })
    }
    console.error('API error:', error)
    return Response.json({ error: 'Internal error' }, { status: 500 })
  }
}
```

### File Organization

```
src/
├── app/                 # Next.js app router pages
│   ├── api/            # API routes
│   └── (routes)/       # Page routes
├── components/
│   ├── ui/             # Reusable primitives (Button, Input)
│   ├── features/       # Feature-specific components
│   └── layout/         # Layout components (Header, Sidebar)
├── lib/
│   ├── api.ts          # API client functions
│   ├── types.ts        # TypeScript types
│   ├── utils.ts        # Utility functions
│   └── validations.ts  # Zod schemas
└── data/               # JSON data files (temporary, move to DB)
```

### Security Headers (nginx)

```nginx
add_header X-Frame-Options "SAMEORIGIN" always;
add_header X-Content-Type-Options "nosniff" always;
add_header X-XSS-Protection "1; mode=block" always;
add_header Referrer-Policy "strict-origin-when-cross-origin" always;
add_header Content-Security-Policy "default-src 'self'; script-src 'self' 'unsafe-inline' 'unsafe-eval'; style-src 'self' 'unsafe-inline';" always;
```

### Rate Limiting (nginx)

```nginx
# In http block
limit_req_zone $binary_remote_addr zone=api:10m rate=10r/s;

# In server block
location /api/ {
    limit_req zone=api burst=20 nodelay;
    proxy_pass http://127.0.0.1:3030;
}
```
