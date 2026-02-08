#!/usr/bin/env npx tsx
// Create initial admin user using Better-Auth
// Note: With Better-Auth, use the sign-up API instead of direct database creation
import { prisma } from '../src/lib/prisma'

async function createAdmin() {
  const email = 'leon@dandelionlabs.io'
  const name = 'Leon'

  console.log('Checking admin user...')

  // Check if user exists
  const existing = await prisma.user.findUnique({
    where: { email }
  })

  if (existing) {
    console.log('✅ Admin user already exists')
    
    // Update role if not admin
    if (existing.role !== 'admin') {
      await prisma.user.update({
        where: { email },
        data: { role: 'admin' }
      })
      console.log('✅ User role updated to admin')
    }
    return
  }

  console.log('❌ Admin user not found')
  console.log('\n📝 To create admin user, use Better-Auth sign-up:')
  console.log('   1. Go to https://task-manager.robert-claw.com/login')
  console.log('   2. Sign up with email: leon@dandelionlabs.io')
  console.log('   3. Run this script again to set admin role')
}

createAdmin()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error('❌ Failed:', error)
    process.exit(1)
  })
