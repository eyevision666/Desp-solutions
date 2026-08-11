import { NextResponse } from 'next/server'
import { v4 as uuidv4 } from 'uuid'
import { assessEyeStrain } from '@/lib/ai-logic'
import { appendAssessment, syncAssessments } from '@/lib/sheets'
import { SignJWT, jwtVerify } from 'jose'
import { cookies } from 'next/headers'

const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || 'aravind4906'
const ADMIN_USERNAME = process.env.ADMIN_USERNAME || 'eyevision'
const JWT_SECRET_ENCODED = new TextEncoder().encode(process.env.JWT_SECRET || 'dev-only-not-secure')
const isProd = process.env.NODE_ENV === 'production'

const assessments = []

function json(data, status = 200) {
  return NextResponse.json(data, {
    status,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    },
  })
}

function getCookieOptions() {
  return {
    httpOnly: true,
    secure: isProd,
    sameSite: 'lax',
    path: '/',
    maxAge: 60 * 60 * 24 * 7,
  }
}

export async function OPTIONS() { return json({}) }

async function route(request, method) {
  const url = new URL(request.url)
  const path = url.pathname.replace(/^\/api\/?/, '')
  const segments = path.split('/').filter(Boolean)

  try {
    // GET /api  — health
    if (segments.length === 0 && method === 'GET') {
      return json({ ok: true, service: 'Digital Eye Strain AI', time: new Date().toISOString() })
    }

    // ========== AUTH ENDPOINTS ==========
    // POST /api/auth/login  — verify username/password and set session cookie
    if (segments[0] === 'auth' && segments[1] === 'login' && method === 'POST') {
      const { username, password } = await request.json()
      if (!username || !password) return json({ error: 'Missing credentials' }, 400)
      if (username !== ADMIN_USERNAME || password !== ADMIN_PASSWORD) {
        return json({ error: 'Invalid username or password' }, 401)
      }
      const token = await new SignJWT({ username, role: 'admin' })
        .setProtectedHeader({ alg: 'HS256' })
        .setIssuedAt()
        .setExpirationTime('7d')
        .sign(JWT_SECRET_ENCODED)
      const cookieStore = await cookies()
      cookieStore.set('admin_session', token, getCookieOptions())
      return json({ success: true, username })
    }

    // POST /api/auth/logout
    if (segments[0] === 'auth' && segments[1] === 'logout' && method === 'POST') {
      const cookieStore = await cookies()
      cookieStore.delete('admin_session')
      return json({ success: true })
    }

    // GET /api/auth/me — check session
    if (segments[0] === 'auth' && segments[1] === 'me' && method === 'GET') {
      const session = await verifyAdminSession()
      if (!session) return json({ authenticated: false })
      return json({ authenticated: true, username: session.username })
    }

    // POST /api/assessments  — submit survey, compute AI result, store
    if (segments[0] === 'assessments' && segments.length === 1 && method === 'POST') {
      console.log('[api] POST /assessments received')
      const body = await request.json()
      console.log('[api] payload keys:', Object.keys(body || {}))
      const result = assessEyeStrain(body)
      const id = uuidv4()
      const doc = {
        id,
        createdAt: new Date().toISOString(),
        patient: body.patient || {},
        medicalHistory: body.medicalHistory || [],
        symptoms: body.symptoms || [],
        ocularHistory: body.ocularHistory || [],
        screenTime: body.screenTime || 0,
        devices: body.devices || [],
        deviceHours: body.deviceHours || {},
        usageTypes: body.usageTypes || [],
        eyeImages: body.eyeImages || { left: null, right: null },
        result,
      }
      assessments.push(doc)

      // Sync to Google Sheets (non-blocking best-effort)
      const proto = request.headers.get('x-forwarded-proto') || 'https'
      const host = request.headers.get('host')
      const baseUrl = `${proto}://${host}`
      appendAssessment(doc, baseUrl).catch((e) => console.error('sheets sync failed:', e.message))

      return json(doc)
    }

    // POST /api/sync — manual sync all missing assessments to Google Sheets (admin only)
    if (segments[0] === 'sync' && method === 'POST') {
      if (!(await verifyAdminSession())) return json({ error: 'Unauthorized' }, 401)
      const proto = request.headers.get('x-forwarded-proto') || 'https'
      const host = request.headers.get('host')
      const baseUrl = `${proto}://${host}`
      const res = await syncAssessments(assessments, baseUrl)
      return json({ total: assessments.length, ...res })
    }

    // GET /api/assessments/:id — fetch single assessment
    if (segments[0] === 'assessments' && segments.length === 2 && method === 'GET') {
      if (!(await verifyAdminSession())) return json({ error: 'Unauthorized' }, 401)
      const doc = assessments.find((item) => item.id === segments[1])
      if (!doc) return json({ error: 'not found' }, 404)
      return json(doc)
    }

    // GET /api/assessments — list recent assessments
    if (segments[0] === 'assessments' && segments.length === 1 && method === 'GET') {
      if (!(await verifyAdminSession())) return json({ error: 'Unauthorized' }, 401)
      return json(assessments.map(({ result, ...rest }) => ({ ...rest, result, eyeImages: undefined })))
    }

    // GET /api/stats  — admin stats (admin only)
    if (segments[0] === 'stats' && method === 'GET') {
      if (!(await verifyAdminSession())) return json({ error: 'Unauthorized' }, 401)
      const total = assessments.length
      const today = new Date(); today.setHours(0,0,0,0)
      const todayCount = assessments.filter((a) => new Date(a.createdAt) >= today).length
      const avgScore = total ? Math.round(assessments.reduce((sum, a) => sum + a.result.score, 0) / total) : 0
      const levelMap = assessments.reduce((acc, a) => {
        acc[a.result.level] = (acc[a.result.level] || 0) + 1
        return acc
      }, {})
      const severity = Object.entries(levelMap).map(([level, count]) => ({ _id: Number(level), count })).sort((a, b) => a._id - b._id)
      return json({ total, todayCount, avgScore, severity })
    }
  } catch (error) {
    console.error('[api] route error', error)
    return json({ error: error?.message || 'Internal server error' }, 500)
  }
}

export async function GET(request) { return route(request, 'GET') }
export async function POST(request) { return route(request, 'POST') }
export async function PUT(request) { return route(request, 'PUT') }
export async function DELETE(request) { return route(request, 'DELETE') }

async function verifyAdminSession() {
  try {
    const cookieStore = await cookies()
    const token = cookieStore.get('admin_session')?.value
    if (!token) return null
    const { payload } = await jwtVerify(token, JWT_SECRET_ENCODED)
    if (payload.role !== 'admin') return null
    return payload
  } catch { return null }
}
