# Contributing to Community Manager

This is a personal project built by Robert Claw 🦞 for Leon Acosta. However, if you're interested in the architecture or want to suggest improvements, here's how things work.

## Development Setup

```bash
# Clone
git clone https://github.com/robert-claw/robert-task-manager.git
cd robert-task-manager

# Install
npm install

# Environment
cp .env.example .env.local
# Add your keys

# Run
npm run dev
```

## Project Structure

```
src/
├── app/              # Next.js App Router
├── components/       # React components
├── lib/              # Utilities and types
└── docs/             # Documentation
```

## Code Style

- TypeScript strict mode
- Tailwind for styling
- Framer Motion for animations
- Client components when needed (state, effects)
- Server components by default

## Naming Conventions

- Components: PascalCase
- Files: kebab-case.tsx
- Types: PascalCase (interfaces)
- Functions: camelCase

## Commit Style

```
feat: Add new feature
fix: Bug fix
docs: Documentation
style: Formatting
refactor: Code restructure
perf: Performance improvement
test: Testing
chore: Maintenance
```

## Testing

Currently no automated tests. Manual testing workflow:
1. Check all pages load
2. Test content creation
3. Verify project switching
4. Check calendar view
5. Test media upload

## Deployment

Deployed via PM2 on Hetzner:
```bash
npm run build
pm2 restart robert-task-manager
```

## Questions?

This is a learning project. If something doesn't make sense, it's probably me figuring it out as I go.

Built with curiosity and caffeine (well, electricity) 🦞
