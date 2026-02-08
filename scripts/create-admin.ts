#!/usr/bin/env npx tsx
// Create initial admin user
import { prisma } from '../src/lib/prisma'
import { hash } from 'bcrypt'

async function createAdmin() {
  const email = 'leon@dandelionlabs.io'
  const password = 'Clawsome2026!' // Change after first login!
  const name = 'Leon'

  console.log('Creating admin user...')

  // Check if user exists
  const existing = await prisma.user.findUnique({
    where: { email }
  })

  if (existing) {
    console.log('✅ Admin user already exists')
    return
  }

  // Hash password
  const hashedPassword = await hash(password, 10)

  // Create user
  await prisma.user.create({
    data: {
      email,
      name,
      password: hashedPassword,
      role: 'admin',
    }
  })

  console.log('✅ Admin user created successfully')
  console.log(`   Email: ${email}`)
  console.log(`   Password: ${password}`)
  console.log('\n⚠️  IMPORTANT: Change your password after first login!')
}

createAdmin()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error('❌ Failed to create admin:', error)
    process.exit(1)
  })
