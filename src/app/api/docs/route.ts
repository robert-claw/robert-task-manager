import { NextRequest, NextResponse } from 'next/server'
import fs from 'fs'
import path from 'path'

const DOCS_PATH = path.join(process.cwd(), 'docs')

interface DocFile {
  name: string
  path: string
  size: number
  modifiedAt: string
}

// GET - List all docs or get a specific doc
export async function GET(request: NextRequest) {
  try {
    const fileName = request.nextUrl.searchParams.get('file')
    
    // If file specified, return its content
    if (fileName) {
      const filePath = path.join(DOCS_PATH, fileName)
      
      // Security: prevent path traversal
      if (!filePath.startsWith(DOCS_PATH)) {
        return NextResponse.json({ error: 'Invalid path' }, { status: 400 })
      }
      
      if (!fs.existsSync(filePath)) {
        return NextResponse.json({ error: 'File not found' }, { status: 404 })
      }
      
      const content = fs.readFileSync(filePath, 'utf-8')
      const stats = fs.statSync(filePath)
      
      return NextResponse.json({
        name: fileName,
        content,
        size: stats.size,
        modifiedAt: stats.mtime.toISOString(),
      })
    }
    
    // Otherwise, list all markdown files
    if (!fs.existsSync(DOCS_PATH)) {
      fs.mkdirSync(DOCS_PATH, { recursive: true })
      return NextResponse.json({ docs: [] })
    }
    
    const files = fs.readdirSync(DOCS_PATH)
    const docs: DocFile[] = files
      .filter(f => f.endsWith('.md'))
      .map(name => {
        const filePath = path.join(DOCS_PATH, name)
        const stats = fs.statSync(filePath)
        return {
          name,
          path: `/docs/${name}`,
          size: stats.size,
          modifiedAt: stats.mtime.toISOString(),
        }
      })
      .sort((a, b) => new Date(b.modifiedAt).getTime() - new Date(a.modifiedAt).getTime())
    
    return NextResponse.json({ docs })
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to read docs' },
      { status: 500 }
    )
  }
}

// POST - Create or update a doc
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    
    if (!body.name || !body.content) {
      return NextResponse.json(
        { error: 'name and content are required' },
        { status: 400 }
      )
    }
    
    // Sanitize filename
    const fileName = body.name.endsWith('.md') ? body.name : `${body.name}.md`
    const safeName = fileName.replace(/[^a-zA-Z0-9-_.]/g, '-')
    const filePath = path.join(DOCS_PATH, safeName)
    
    if (!fs.existsSync(DOCS_PATH)) {
      fs.mkdirSync(DOCS_PATH, { recursive: true })
    }
    
    fs.writeFileSync(filePath, body.content, 'utf-8')
    
    return NextResponse.json({
      message: 'Document saved',
      name: safeName,
    })
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to save doc' },
      { status: 500 }
    )
  }
}

// DELETE - Delete a doc
export async function DELETE(request: NextRequest) {
  try {
    const fileName = request.nextUrl.searchParams.get('file')
    
    if (!fileName) {
      return NextResponse.json({ error: 'file param required' }, { status: 400 })
    }
    
    const filePath = path.join(DOCS_PATH, fileName)
    
    // Security: prevent path traversal
    if (!filePath.startsWith(DOCS_PATH)) {
      return NextResponse.json({ error: 'Invalid path' }, { status: 400 })
    }
    
    if (!fs.existsSync(filePath)) {
      return NextResponse.json({ error: 'File not found' }, { status: 404 })
    }
    
    fs.unlinkSync(filePath)
    
    return NextResponse.json({ message: 'Document deleted' })
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to delete doc' },
      { status: 500 }
    )
  }
}
