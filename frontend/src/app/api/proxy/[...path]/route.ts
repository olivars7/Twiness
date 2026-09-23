import { NextRequest, NextResponse } from 'next/server'

const BACKEND_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080'

async function proxyRequest(req: NextRequest, { params }: { params: Promise<{ path: string[] }> }) {
  const { path } = await params
  const url = `${BACKEND_URL}/api/${path.join('/')}${req.nextUrl.search}`

  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
  }

  const body = req.method !== 'GET' && req.method !== 'HEAD'
    ? await req.text()
    : undefined

  const response = await fetch(url, { method: req.method, headers, body })
  const data = await response.json()
  return NextResponse.json(data, { status: response.status })
}

export const GET    = (req: NextRequest, ctx: { params: Promise<{ path: string[] }> }) => proxyRequest(req, ctx)
export const POST   = (req: NextRequest, ctx: { params: Promise<{ path: string[] }> }) => proxyRequest(req, ctx)
export const PUT    = (req: NextRequest, ctx: { params: Promise<{ path: string[] }> }) => proxyRequest(req, ctx)
export const DELETE = (req: NextRequest, ctx: { params: Promise<{ path: string[] }> }) => proxyRequest(req, ctx)
