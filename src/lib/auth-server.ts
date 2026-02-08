import { headers } from 'next/headers';
import { auth } from './auth';
import { prisma } from './prisma';

export async function getSession() {
  const session = await auth.api.getSession({
    headers: await headers(),
  });
  
  if (!session) {
    return null;
  }
  
  // Fetch full user data with role from database
  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: {
      id: true,
      email: true,
      name: true,
      role: true,
    }
  });
  
  if (!user) {
    return null;
  }
  
  return {
    ...session,
    user: {
      ...session.user,
      role: user.role || 'user',
    }
  };
}

export async function requireAuth() {
  const session = await getSession();
  
  if (!session) {
    throw new Error('Unauthorized');
  }
  
  return session;
}

export async function requireAdmin() {
  const session = await requireAuth();
  
  if (session.user.role !== 'admin') {
    throw new Error('Forbidden: Admin access required');
  }
  
  return session;
}
