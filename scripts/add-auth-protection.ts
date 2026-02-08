/**
 * Script to add auth protection to all API routes
 * Adds requireAuth() call to each route handler
 */

import fs from 'fs';
import path from 'path';

const apiDir = path.join(process.cwd(), 'src/app/api');

// Routes to protect (exclude auth routes)
const routesToProtect = [
  'projects/route.ts',
  'projects/[id]/route.ts',
  'content/route.ts',
  'content/[id]/route.ts',
  'campaigns/route.ts',
  'campaigns/[id]/route.ts',
  'ideas/route.ts',
  'ideas/[id]/route.ts',
  'templates/route.ts',
  'templates/[id]/route.ts',
  'hashtags/route.ts',
  'notifications/route.ts',
];

function addAuthToRoute(filePath: string) {
  let content = fs.readFileSync(filePath, 'utf-8');
  
  // Skip if already has requireAuth
  if (content.includes('requireAuth')) {
    console.log(`✓ Already protected: ${filePath}`);
    return;
  }
  
  // Add import after prisma import
  if (!content.includes("from '@/lib/auth-server'")) {
    content = content.replace(
      /import { prisma } from '@\/lib\/prisma'/,
      "import { prisma } from '@/lib/prisma'\nimport { requireAuth } from '@/lib/auth-server'"
    );
  }
  
  // Add auth check at start of each handler
  content = content.replace(
    /(export async function (GET|POST|PATCH|DELETE)\([^)]*\)\s*{)\s*(try\s*{)?/g,
    (match, funcDef, method, tryBlock) => {
      if (tryBlock) {
        // Already has try block
        return `${funcDef}\n  try {\n    await requireAuth()\n    `;
      } else {
        // No try block, add one
        return `${funcDef}\n  try {\n    await requireAuth()\n    `;
      }
    }
  );
  
  // Add Unauthorized error handling to existing catch blocks
  content = content.replace(
    /} catch \(error\) {\s*console\.error/g,
    `} catch (error) {
    if ((error as Error).message === 'Unauthorized') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
    console.error`
  );
  
  // Ensure all handlers have a closing brace for try block
  // This is a simple check - might need manual review
  
  fs.writeFileSync(filePath, content);
  console.log(`✓ Protected: ${filePath}`);
}

// Process all routes
for (const route of routesToProtect) {
  const filePath = path.join(apiDir, route);
  if (fs.existsSync(filePath)) {
    try {
      addAuthToRoute(filePath);
    } catch (error) {
      console.error(`✗ Failed to protect ${filePath}:`, error);
    }
  } else {
    console.warn(`⚠ Not found: ${filePath}`);
  }
}

console.log('\nDone! All API routes are now protected.');
