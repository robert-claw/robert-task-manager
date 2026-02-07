#!/usr/bin/env node

/**
 * Context Loader for OpenClaw
 * Usage: node load-context.js <context-name>
 * 
 * Outputs a structured guide for loading context-specific files
 */

const fs = require('fs')
const path = require('path')

const CONTEXTS_FILE = path.join(__dirname, '../../.openclaw/contexts.json')
const WORKSPACE = path.join(__dirname, '../..')

function loadContext(contextName) {
  if (!fs.existsSync(CONTEXTS_FILE)) {
    console.error('❌ contexts.json not found')
    process.exit(1)
  }

  const data = JSON.parse(fs.readFileSync(CONTEXTS_FILE, 'utf8'))
  const context = data.contexts[contextName]

  if (!context) {
    console.error(`❌ Context "${contextName}" not found`)
    console.error('\nAvailable contexts:')
    Object.keys(data.contexts).forEach(name => {
      console.error(`  - ${name}: ${data.contexts[name].description}`)
    })
    process.exit(1)
  }

  console.log(`\n🎯 Context: ${contextName}`)
  console.log(`📝 ${context.description}\n`)

  // Files to read
  if (context.files && context.files.length > 0) {
    console.log('📄 Files to read:')
    context.files.forEach(file => {
      const fullPath = path.join(WORKSPACE, file)
      const exists = fs.existsSync(fullPath)
      console.log(`  ${exists ? '✓' : '✗'} ${file}`)
    })
    console.log()
  }

  // Directories to explore
  if (context.directories && context.directories.length > 0) {
    console.log('📂 Directories to explore:')
    context.directories.forEach(dir => {
      const fullPath = path.join(WORKSPACE, dir)
      const exists = fs.existsSync(fullPath)
      console.log(`  ${exists ? '✓' : '✗'} ${dir}`)
    })
    console.log()
  }

  // Commands to run
  if (context.commands && context.commands.length > 0) {
    console.log('⚡ Useful commands:')
    context.commands.forEach(cmd => {
      console.log(`  $ ${cmd}`)
    })
    console.log()
  }

  // Notes
  if (context.notes && context.notes.length > 0) {
    console.log('📌 Notes:')
    context.notes.forEach(note => {
      console.log(`  • ${note}`)
    })
    console.log()
  }

  // Output JSON for programmatic use
  if (process.argv.includes('--json')) {
    console.log('\n--- JSON OUTPUT ---')
    console.log(JSON.stringify(context, null, 2))
  }
}

// List all contexts
function listContexts() {
  if (!fs.existsSync(CONTEXTS_FILE)) {
    console.error('❌ contexts.json not found')
    process.exit(1)
  }

  const data = JSON.parse(fs.readFileSync(CONTEXTS_FILE, 'utf8'))
  
  console.log('\n📚 Available Contexts:\n')
  Object.keys(data.contexts).forEach(name => {
    const ctx = data.contexts[name]
    console.log(`  ${name}`)
    console.log(`    ${ctx.description}`)
    console.log()
  })
}

// Main
const args = process.argv.slice(2)

if (args.length === 0 || args[0] === '--list' || args[0] === 'list') {
  listContexts()
} else {
  const contextName = args[0]
  loadContext(contextName)
}
