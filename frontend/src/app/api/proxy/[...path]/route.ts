import { NextRequest, NextResponse } from 'next/server'

const BACKEND_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080'

async function proxyRequest(req: NextRequest, params: { path: string[] }) {
  const path = params.path.join('/')
  const url = `${BACKEND_URL}/api/${path}${req.nextUrl.search}`

  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
  }

  const body = req.method !== 'GET' && req.method !== 'HEAD'
    ? await req.text()
    : undefined

  const response = await fetch(url, {
    method: req.method,
    headers,
    body,
  })

  const data = await response.json()
  return NextResponse.json(data, { status: response.status })
}

export const GET = (req: NextRequest, { params }: { params: { path: string[] } }) => proxyRequest(req, params)
export const POST = (req: NextRequest, { params }: { params: { path: string[] } }) => proxyRequest(req, params)
export const PUT = (req: NextRequest, { params }: { params: { path: string[] } }) => proxyRequest(req, params)
export const DELETE = (req: NextRequest, { params }: { params: { path: string[] } }) => proxyRequest(req, params)
