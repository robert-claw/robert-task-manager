# Community Manager

Multi-project content management system for managing social media content, campaigns, and analytics across platforms.

## Features

- **Multi-Project Support** - Manage multiple brands/projects in one place
- **Content Calendar** - Visual calendar for scheduling posts
- **Funnel System** - TOFU/MOFU/BOFU content strategy mapping
- **Templates** - Reusable content templates
- **Analytics** - Track performance across platforms
- **Media Upload** - Image/video support via Hetzner Object Storage
- **Ideas Board** - Capture and organize content ideas
- **Campaigns** - Group related content into campaigns

## Projects

### Active Projects
- **Dandelion Labs** (Business) - AI agency, MVP development
- **Leon Acosta** (Personal) - Biohacking, consciousness, financial sovereignty
- **Robert Claw** (Personal) - AI companion journey, building in public

## Tech Stack

- Next.js 15 (App Router)
- TypeScript
- Tailwind CSS
- Framer Motion (animations)
- Prisma (planned)
- Hetzner S3 Object Storage

## Development

```bash
npm run dev    # Start development server
npm run build  # Build for production
npm run lint   # Run ESLint
```

## Deployment

Running on PM2 as `robert-task-manager`:
- Port: 3030
- URL: http://task-manager.robert-claw.com

```bash
pm2 restart robert-task-manager
pm2 logs robert-task-manager
```

## Structure

```
src/
├── app/              # Next.js app routes
│   ├── dashboard/    # Main dashboard
│   ├── calendar/     # Calendar view
│   ├── campaigns/    # Campaign management
│   ├── ideas/        # Ideas board
│   ├── templates/    # Template library
│   ├── analytics/    # Analytics dashboard
│   └── api/          # API routes
├── components/
│   ├── layout/       # Layout components (Sidebar, etc.)
│   ├── features/     # Feature-specific components
│   └── ui/           # Reusable UI components
├── lib/              # Utilities and types
└── docs/             # Documentation
    └── projects/     # Project-specific documentation
```

## Content Strategy

See `/docs/projects/{project-name}/` for project-specific strategies:
- Content pillars
- Funnel strategies (TOFU/MOFU/BOFU)
- Platform-specific guidelines
- Target audiences

## API Routes

- `GET /api/projects` - List all projects
- `GET /api/content` - List all content
- `POST /api/content` - Create new content
- `PUT /api/content/[id]` - Update content
- `DELETE /api/content/[id]` - Delete content
- `POST /api/upload` - Upload media files

## Context System

Uses context-based file loading for token efficiency:

```bash
node skills/context-router/load-context.js {context-name}
```

Available contexts: community-manager, infrastructure, blog, dandelion, scout, liberture, git, memory, self, heartbeat

## Contributing

Built and maintained by Robert Claw 🦞

Last updated: February 8, 2026
