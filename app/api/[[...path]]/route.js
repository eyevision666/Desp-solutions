import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { v4 as uuidv4 } from 'uuid'
import { assessEyeStrain } from '@/lib/ai-logic'
import { appendAssessment, syncAssessments } from '@/lib/sheets'
import { SignJWT, jwtVerify } from 'jose'
import { cookies } from 'next/headers'

const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || 'Aravind@4906'
const ADMIN_USERNAME = process.env.ADMIN_USERNAME || 'EYE VISION'
const JWT_SECRET_ENCODED = new TextEncoder().encode(process.env.JWT_SECRET || 'dev-only-not-secure')
const SUPABASE_URL = process.env.SUPABASE_URL || 'https://vmlnrnsxfzneojwpbpjo.supabase.co'
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY
const SUPABASE_ANON_KEY = process.env.SUPABASE_ANON_KEY || process.env.SUPABASE_PUBLIC_KEY
const SUPABASE_KEY = SUPABASE_SERVICE_ROLE_KEY || SUPABASE_ANON_KEY || ''
const SUPABASE_TABLE = process.env.SUPABASE_ASSESSMENTS_TABLE || 'assessments'

let supabaseClient = null
function getSupabase() {
  if (!SUPABASE_URL || !SUPABASE_KEY) return null
  if (!supabaseClient) {
    supabaseClient = createClient(SUPABASE_URL, SUPABASE_KEY)
  }
  return supabaseClient
}

const fallbackAssessments = []

function mapAssessmentToDb(doc) {
  return {
    id: doc.id,
    createdat: doc.createdAt,
    patient: doc.patient,
    medicalhistory: doc.medicalHistory,
    symptoms: doc.symptoms,
    ocularhistory: doc.ocularHistory,
    screentime: doc.screenTime,
    devices: doc.devices,
    devicehours: doc.deviceHours,
    usagetypes: doc.usageTypes,
    eyeimages: doc.eyeImages,
    result: doc.result,
  }
}

function mapDbAssessment(row) {
  if (!row) return null
  return {
    id: row.id,
    createdAt: row.createdat,
    patient: row.patient,
    medicalHistory: row.medicalhistory || [],
    symptoms: row.symptoms || [],
    ocularHistory: row.ocularhistory || [],
    screenTime: Number(row.screentime) || 0,
    devices: row.devices || [],
    deviceHours: row.devicehours || {},
    usageTypes: row.usagetypes || [],
    eyeImages: row.eyeimages || { left: null, right: null },
    result: row.result || {},
  }
}

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
      cookieStore.set('admin_session', token, {
        httpOnly: true,
        secure: true,
        sameSite: 'lax',
        path: '/',
        maxAge: 60 * 60 * 24 * 7,
      })
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

    const db = getSupabase()

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

      if (db) {
        console.log('[api] storing to Supabase')
        const dbDoc = mapAssessmentToDb(doc)
        const { error } = await db.from(SUPABASE_TABLE).insert([dbDoc])
        if (error) {
          console.error('[api] Supabase insert error', error)
          fallbackAssessments.push(doc)
        }
      } else {
        console.log('[api] Supabase not configured, using fallback')
        fallbackAssessments.push(doc)
      }

      // Sync to Google Sheets (non-blocking best-effort)
      const proto = request.headers.get('x-forwarded-proto') || 'https'
      const host = request.headers.get('host')
      const baseUrl = `${proto}://${host}`
      appendAssessment(doc, baseUrl).catch((e) => console.error('sheets sync failed:', e.message))

      return json({ id, ...doc })
    }

    // POST /api/sync — manual sync all missing assessments to Google Sheets (admin only)
    if (segments[0] === 'sync' && method === 'POST') {
      if (!(await verifyAdminSession())) return json({ error: 'Unauthorized' }, 401)
      if (!db) return json({ error: 'Supabase not configured' }, 500)
      const proto = request.headers.get('x-forwarded-proto') || 'https'
      const host = request.headers.get('host')
      const baseUrl = `${proto}://${host}`
      const { data: docs, error } = await db.from(SUPABASE_TABLE).select('*').order('createdat', { ascending: true })
      if (error) throw new Error(error.message)
      const mappedDocs = (docs || []).map(mapDbAssessment)
      const res = await syncAssessments(mappedDocs, baseUrl)
      return json({ total: mappedDocs.length, ...res })
    }

    // GET /api/assessments/:id — fetch single assessment
    if (segments[0] === 'assessments' && segments.length === 2 && method === 'GET') {
      if (!(await verifyAdminSession())) return json({ error: 'Unauthorized' }, 401)
      if (!db) {
        const doc = fallbackAssessments.find((item) => item.id === segments[1])
        if (!doc) return json({ error: 'not found' }, 404)
        return json(doc)
      }
      const { data, error } = await db.from(SUPABASE_TABLE).select('*').eq('id', segments[1]).single()
      if (error) {
        return json({ error: error.message || 'not found' }, error.code === 'PGRST116' ? 404 : 500)
      }
      return json(mapDbAssessment(data))
    }

    // GET /api/assessments — list recent assessments
    if (segments[0] === 'assessments' && segments.length === 1 && method === 'GET') {
      if (!(await verifyAdminSession())) return json({ error: 'Unauthorized' }, 401)
      if (!db) {
        return json(fallbackAssessments.map(({ result, ...rest }) => ({ ...rest, result, eyeImages: undefined })))
      }
      const { data, error } = await db.from(SUPABASE_TABLE)
        .select('id,createdat,patient,medicalhistory,symptoms,ocularhistory,screentime,devices,devicehours,usagetypes,result')
        .order('createdat', { ascending: false })
        .limit(200)
      if (error) throw new Error(error.message)
      return json((data || []).map(mapDbAssessment))
    }

    // GET /api/stats  — admin stats (admin only)
    if (segments[0] === 'stats' && method === 'GET') {
      if (!(await verifyAdminSession())) return json({ error: 'Unauthorized' }, 401)
      if (!db) {
        const total = fallbackAssessments.length
        const today = new Date(); today.setHours(0,0,0,0)
        const todayCount = fallbackAssessments.filter((a) => new Date(a.createdAt) >= today).length
        const avgScore = total ? Math.round(fallbackAssessments.reduce((sum, a) => sum + a.result.score, 0) / total) : 0
        const levelMap = fallbackAssessments.reduce((acc, a) => {
          acc[a.result.level] = (acc[a.result.level] || 0) + 1
          return acc
        }, {})
        const severity = Object.entries(levelMap).map(([level, count]) => ({ _id: Number(level), count })).sort((a, b) => a._id - b._id)
        return json({ total, todayCount, avgScore, severity })
      }
      const { count: totalCount, error: totalError } = await db.from(SUPABASE_TABLE).select('id', { count: 'exact', head: true })
      if (totalError) throw new Error(totalError.message)
      const today = new Date(); today.setHours(0,0,0,0)
      const isoToday = today.toISOString()
      const { count: todayCount, error: todayError } = await db.from(SUPABASE_TABLE)
        .select('id', { count: 'exact', head: true })
        .gte('createdat', isoToday)
      if (todayError) throw new Error(todayError.message)
      const { data: allResults, error: resultError } = await db.from(SUPABASE_TABLE).select('result')
      if (resultError) throw new Error(resultError.message)
      const rows = allResults || []
      const avgScore = rows.length ? Math.round(rows.reduce((sum, a) => sum + (a.result?.score || 0), 0) / rows.length) : 0
      const levelMap = rows.reduce((acc, a) => {
        const level = a.result?.level || 0
        acc[level] = (acc[level] || 0) + 1
        return acc
      }, {})
      const severity = Object.entries(levelMap).map(([level, count]) => ({ _id: Number(level), count })).sort((a, b) => a._id - b._id)
      return json({ total: totalCount ?? 0, todayCount: todayCount ?? 0, avgScore, severity })
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
