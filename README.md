# Robert Task Manager

Task and communication manager for Robert (AI) + User collaboration.

## Features

- ✅ Task creation with priority levels (urgent, high, medium, low)
- ✅ Status tracking (pending, in progress, done, rejected)
- ✅ Sorted by priority and date
- ✅ Clean, dark-themed UI
- ✅ Simple token-based auth
- ✅ Real-time updates

## Setup

1. Install dependencies:
```bash
npm install
```

2. Configure auth token in `.env.local`:
```
AUTH_TOKEN=your-secret-token-here
```

3. Run development server:
```bash
npm run dev
```

4. Access at http://localhost:3030

## Security

- Token-based authentication (set in `.env.local`)
- All API routes require valid auth token
- Tasks stored in local JSON file

## Production

```bash
npm run build
npm start
```

## Usage

- **Create tasks**: Click "+ New Task"
- **Update status**: Click status buttons on each task
- **Delete tasks**: Click 🗑️ icon
- **Priority sorting**: Tasks automatically sorted by priority

Tasks are sorted: urgent → high → medium → low, then by creation date.
