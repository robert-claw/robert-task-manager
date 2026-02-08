import { betterAuth } from 'better-auth'
import { prismaAdapter } from 'better-auth/adapters/prisma'
import { prisma } from './prisma'

export const auth = betterAuth({
  database: prismaAdapter(prisma, {
    provider: 'postgresql'
  }),
  emailAndPassword: {
    enabled: true,
    minPasswordLength: 12,
  },
  session: {
    expiresIn: 60 * 60 * 24 * 7, // 7 days
    updateAge: 60 * 60 * 24, // Refresh daily
  },
  trustedOrigins: ['http://localhost:3030', 'https://task-manager.robert-claw.com'],
  user: {
    additionalFields: {
      role: {
        type: 'string',
        defaultValue: 'user',
        required: false,
      }
    }
  }
})

export type Session = typeof auth.$Infer.Session.session & {
  user: typeof auth.$Infer.Session.user & {
    role: string
  }
}
export type User = typeof auth.$Infer.Session.user & {
  role: string
}
