import { createServer } from 'node:http'
import { readFileSync, writeFileSync, existsSync, mkdirSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'
import { createHash, randomBytes } from 'node:crypto'
import { loadEnv } from './loadEnv.mjs'
import {
  buildInterviewQuestions,
  llmConfigured,
  scoreInterviewSession,
  summarizeProfile,
} from './interviewAgent.mjs'

loadEnv()

const __dirname = dirname(fileURLToPath(import.meta.url))
const DATA_DIR = join(__dirname, 'data')
const DB_PATH = join(DATA_DIR, 'db.json')
const PORT = Number(process.env.PORT) || 8787

/** @typedef {{ id: string, name: string, email: string, passwordHash: string, role?: string, companyName?: string, createdAt: string }} User */
/** @typedef {{
 *   users: User[],
 *   profiles: Record<string, unknown>,
 *   interviews: Record<string, unknown>,
 *   applications: Record<string, unknown[]>,
 *   interviewSessions: Record<string, unknown>,
 * }} DB */

function emptyDb() {
  return {
    users: [],
    profiles: {},
    interviews: {},
    applications: {},
    interviewSessions: {},
  }
}

function seedDemoUsers(db) {
  const demos = [
    {
      name: 'Arjun Sharma',
      email: 'demo@hireright.com',
      password: 'password123',
      role: 'jobseeker',
    },
    {
      name: 'Sarah Jenkins (Recruiter)',
      email: 'employer@hireright.com',
      password: 'password123',
      role: 'employer',
      companyName: 'TechCitta Solutions',
    },
  ]
  let changed = false
  for (const demo of demos) {
    if (!db.users.some((u) => u.email === demo.email)) {
      db.users.push({
        id: randomBytes(8).toString('hex'),
        name: demo.name,
        email: demo.email,
        passwordHash: hashPassword(demo.password),
        role: demo.role,
        companyName: demo.companyName,
        createdAt: new Date().toISOString(),
      })
      changed = true
    }
  }
  if (changed) saveDb(db)
  return db
}

function loadDb() {
  if (!existsSync(DATA_DIR)) mkdirSync(DATA_DIR, { recursive: true })
  if (!existsSync(DB_PATH)) {
    writeFileSync(DB_PATH, JSON.stringify(emptyDb(), null, 2))
  }
  let raw
  try {
    raw = /** @type {DB} */ (JSON.parse(readFileSync(DB_PATH, 'utf8')))
  } catch {
    raw = emptyDb()
    writeFileSync(DB_PATH, JSON.stringify(raw, null, 2))
  }
  if (!raw.users) raw.users = []
  if (!raw.profiles) raw.profiles = {}
  if (!raw.interviews) raw.interviews = {}
  if (!raw.applications) raw.applications = {}
  if (!raw.interviewSessions) raw.interviewSessions = {}
  return seedDemoUsers(raw)
}

function saveDb(db) {
  writeFileSync(DB_PATH, JSON.stringify(db, null, 2))
}

function hashPassword(password, salt = randomBytes(8).toString('hex')) {
  const hash = createHash('sha256').update(`${salt}:${password}`).digest('hex')
  return `${salt}$${hash}`
}

function verifyPassword(password, stored) {
  const [salt] = stored.split('$')
  return hashPassword(password, salt) === stored
}

function json(res, status, body) {
  const payload = JSON.stringify(body)
  res.writeHead(status, {
    'Content-Type': 'application/json',
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET,POST,PUT,OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization',
  })
  res.end(payload)
}

function readBody(req) {
  return new Promise((resolve, reject) => {
    let data = ''
    req.on('data', (chunk) => {
      data += chunk
      if (data.length > 4_000_000) reject(new Error('Body too large'))
    })
    req.on('end', () => {
      try {
        resolve(data ? JSON.parse(data) : {})
      } catch {
        reject(new Error('Invalid JSON'))
      }
    })
  })
}

const sessions = new Map()
/** Simple in-memory rate limit: email|ip → timestamps */
const rateBuckets = new Map()

function rateLimit(key, limit = 30, windowMs = 60_000) {
  const now = Date.now()
  const list = (rateBuckets.get(key) || []).filter((t) => now - t < windowMs)
  if (list.length >= limit) return false
  list.push(now)
  rateBuckets.set(key, list)
  return true
}

function authEmail(req) {
  const header = req.headers.authorization || ''
  const token = header.replace(/^Bearer\s+/i, '')
  return sessions.get(token) || null
}

function requireAuth(req, res) {
  const email = authEmail(req)
  if (!email) {
    json(res, 401, { error: 'Unauthorized' })
    return null
  }
  return email
}

const server = createServer(async (req, res) => {
  if (req.method === 'OPTIONS') {
    return json(res, 204, {})
  }

  const url = new URL(req.url || '/', `http://localhost:${PORT}`)
  const path = url.pathname
  const ip = req.socket.remoteAddress || 'local'

  try {
    if (req.method === 'GET' && path === '/api/health') {
      return json(res, 200, {
        ok: true,
        service: 'hireright-api',
        version: '2.0.0',
        llm: llmConfigured(),
        features: {
          interviewAgent: true,
          resumeAwareQuestions: true,
          adaptiveScoring: true,
          faceIntegrityClient: true,
          openrouterActive: Boolean(process.env.OPENROUTER_API_KEY),
        },
      })
    }

    if (req.method === 'GET' && path === '/api/llm-status') {
      const apiKey =
        process.env.OPENROUTER_API_KEY ||
        process.env.OPENAI_API_KEY ||
        process.env.LLM_API_KEY
      if (!apiKey) {
        return json(res, 200, {
          active: false,
          configured: false,
          provider: 'Built-in Local Agent',
          message: 'No LLM API key set. Running in local agent mode.',
        })
      }
      const base = (
        process.env.OPENAI_BASE_URL || 'https://openrouter.ai/api/v1'
      ).replace(/\/$/, '')
      const model =
        process.env.OPENROUTER_MODEL ||
        process.env.OPENAI_MODEL ||
        'openrouter/free'

      try {
        const pingRes = await fetch(`${base}/chat/completions`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${apiKey}`,
            'HTTP-Referer': 'http://localhost:5173',
            'X-Title': 'HIRERIGHTTT',
          },
          body: JSON.stringify({
            model,
            messages: [{ role: 'user', content: 'Ping' }],
          }),
        })
        if (pingRes.ok) {
          return json(res, 200, {
            active: true,
            configured: true,
            provider: 'OpenRouter AI',
            model,
            statusCode: pingRes.status,
            message: '✓ OpenRouter API Key is LIVE & WORKING!',
          })
        } else {
          const errData = await pingRes.json()
          return json(res, 200, {
            active: false,
            configured: true,
            provider: 'OpenRouter AI',
            model,
            statusCode: pingRes.status,
            message: errData.error?.message || 'OpenRouter API error',
          })
        }
      } catch (err) {
        return json(res, 200, {
          active: false,
          configured: true,
          provider: 'OpenRouter AI',
          message: err instanceof Error ? err.message : 'Network error testing OpenRouter',
        })
      }
    }

    if (req.method === 'POST' && path === '/api/signup') {
      if (!rateLimit(`signup:${ip}`, 8)) {
        return json(res, 429, { error: 'Too many signup attempts. Try again shortly.' })
      }
      const body = await readBody(req)
      const name = String(body.name || '').trim()
      const email = String(body.email || '').trim().toLowerCase()
      const password = String(body.password || '')
      if (!name || !email || password.length < 6) {
        return json(res, 400, { error: 'Name, email, and 6+ char password required.' })
      }
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
        return json(res, 400, { error: 'Enter a valid email address.' })
      }
      const db = loadDb()
      if (db.users.some((u) => u.email === email)) {
        return json(res, 409, { error: 'An account with this email already exists.' })
      }
      const role = body.role === 'employer' ? 'employer' : 'jobseeker'
      const companyName = String(body.companyName || '').trim()
      const user = {
        id: randomBytes(8).toString('hex'),
        name,
        email,
        passwordHash: hashPassword(password),
        role,
        companyName: role === 'employer' ? companyName : undefined,
        createdAt: new Date().toISOString(),
      }
      db.users.push(user)
      saveDb(db)
      const token = randomBytes(16).toString('hex')
      sessions.set(token, email)
      return json(res, 201, {
        token,
        user: {
          id: user.id,
          name: user.name,
          email: user.email,
          role: user.role,
          companyName: user.companyName,
        },
      })
    }

    if (req.method === 'POST' && path === '/api/login') {
      if (!rateLimit(`login:${ip}`, 20)) {
        return json(res, 429, { error: 'Too many login attempts. Try again shortly.' })
      }
      const body = await readBody(req)
      const email = String(body.email || '').trim().toLowerCase()
      const password = String(body.password || '')
      const db = loadDb()
      const user = db.users.find((u) => u.email === email)
      if (!user || !verifyPassword(password, user.passwordHash)) {
        return json(res, 401, { error: 'Email or password is incorrect.' })
      }
      const token = randomBytes(16).toString('hex')
      sessions.set(token, email)
      return json(res, 200, {
        token,
        user: {
          id: user.id,
          name: user.name,
          email: user.email,
          role: user.role || (email.includes('employer') ? 'employer' : 'jobseeker'),
          companyName: user.companyName,
        },
      })
    }

    if (req.method === 'POST' && path === '/api/logout') {
      const header = req.headers.authorization || ''
      const token = header.replace(/^Bearer\s+/i, '')
      sessions.delete(token)
      return json(res, 200, { ok: true })
    }

    if (req.method === 'GET' && path === '/api/me') {
      const email = requireAuth(req, res)
      if (!email) return
      const db = loadDb()
      const user = db.users.find((u) => u.email === email)
      if (!user) return json(res, 401, { error: 'Unauthorized' })
      return json(res, 200, {
        user: {
          id: user.id,
          name: user.name,
          email: user.email,
          role: user.role,
          companyName: user.companyName,
        },
        profile: db.profiles[email] || null,
        interview: db.interviews[email] || null,
        applications: db.applications[email] || [],
      })
    }

    if (req.method === 'PUT' && path === '/api/profile') {
      const email = requireAuth(req, res)
      if (!email) return
      const body = await readBody(req)
      const db = loadDb()
      const prev = /** @type {Record<string, unknown>} */ (db.profiles[email] || {})
      db.profiles[email] = {
        ...prev,
        ...body,
        updatedAt: new Date().toISOString(),
      }
      saveDb(db)
      return json(res, 200, { profile: db.profiles[email] })
    }

    /** Start Ava interview: resume-aware dynamic questions */
    if (req.method === 'POST' && path === '/api/interview/start') {
      const email = requireAuth(req, res)
      if (!email) return
      if (!rateLimit(`ivstart:${email}`, 12)) {
        return json(res, 429, { error: 'Interview start rate limited. Wait a minute.' })
      }
      const body = await readBody(req)
      const role = String(body.role || 'Full Stack Engineer')
      const level = String(body.level || '1–3 years')
      const jobDescription = String(body.jobDescription || '')
      const db = loadDb()
      const storedProfile = /** @type {Record<string, unknown>} */ (db.profiles[email] || {})
      const profile = {
        ...storedProfile,
        ...(body.profile || {}),
        name: body.profile?.name || db.users.find((u) => u.email === email)?.name,
      }

      const built = await buildInterviewQuestions(profile, role, level, jobDescription)
      const sessionId = randomBytes(12).toString('hex')
      const session = {
        id: sessionId,
        email,
        role,
        level,
        questions: built.questions,
        answers: [],
        agent: built.agent,
        context: built.context,
        integrity: {
          faceViolations: 0,
          singlePersonOk: true,
          maxFacesSeen: 1,
        },
        createdAt: new Date().toISOString(),
        status: 'active',
      }
      db.interviewSessions[sessionId] = session
      saveDb(db)

      return json(res, 200, {
        sessionId,
        agent: built.agent,
        llm: llmConfigured(),
        total: built.questions.length,
        questionIndex: 0,
        question: built.questions[0],
        questions: built.questions,
        profileDigest: summarizeProfile(profile),
      })
    }

    /** Record integrity ping (face count) during interview */
    if (req.method === 'POST' && path === '/api/interview/integrity') {
      const email = requireAuth(req, res)
      if (!email) return
      const body = await readBody(req)
      const sessionId = String(body.sessionId || '')
      const db = loadDb()
      const session = /** @type {any} */ (db.interviewSessions[sessionId])
      if (!session || session.email !== email) {
        return json(res, 404, { error: 'Interview session not found.' })
      }
      const faceCount = Number(body.faceCount ?? 1)
      session.integrity = session.integrity || {
        faceViolations: 0,
        singlePersonOk: true,
        maxFacesSeen: 1,
      }
      session.integrity.maxFacesSeen = Math.max(session.integrity.maxFacesSeen || 1, faceCount)
      if (faceCount !== 1) {
        session.integrity.faceViolations = (session.integrity.faceViolations || 0) + 1
        session.integrity.singlePersonOk = false
      }
      db.interviewSessions[sessionId] = session
      saveDb(db)
      return json(res, 200, { integrity: session.integrity })
    }

    /** Score full interview (client sends answers + optional live integrity) */
    if (req.method === 'POST' && path === '/api/interview/score') {
      const email = requireAuth(req, res)
      if (!email) return
      if (!rateLimit(`ivscore:${email}`, 10)) {
        return json(res, 429, { error: 'Score rate limited.' })
      }
      const body = await readBody(req)
      const db = loadDb()
      const sessionId = String(body.sessionId || '')
      const session = sessionId ? /** @type {any} */ (db.interviewSessions[sessionId]) : null

      const profile = {
        ...(db.profiles[email] || {}),
        ...(body.profile || {}),
        name: body.profile?.name || db.users.find((u) => u.email === email)?.name,
      }

      const questions = body.questions || session?.questions
      const answers = body.answers || []
      const role = String(body.role || session?.role || 'Full Stack Engineer')
      const level = String(body.level || session?.level || '1–3 years')

      if (!Array.isArray(questions) || questions.length === 0) {
        return json(res, 400, { error: 'Questions required to score interview.' })
      }

      const integrity = {
        ...(session?.integrity || {}),
        ...(body.integrity || {}),
      }

      const result = await scoreInterviewSession({
        role,
        level,
        questions,
        answers,
        profile,
        integrity,
      })

      db.interviews[email] = result
      if (session) {
        session.status = 'completed'
        session.answers = answers
        session.result = result
        session.completedAt = new Date().toISOString()
        db.interviewSessions[sessionId] = session
      }
      saveDb(db)
      return json(res, 200, { interview: result })
    }

    if (req.method === 'POST' && path === '/api/interview') {
      const email = requireAuth(req, res)
      if (!email) return
      const body = await readBody(req)
      const db = loadDb()
      db.interviews[email] = body
      saveDb(db)
      return json(res, 200, { interview: body })
    }

    if (req.method === 'POST' && path === '/api/applications') {
      const email = requireAuth(req, res)
      if (!email) return
      const body = await readBody(req)
      const db = loadDb()
      const list = db.applications[email] || []
      list.unshift({
        ...body,
        id: randomBytes(6).toString('hex'),
        appliedAt: new Date().toISOString(),
      })
      db.applications[email] = list
      saveDb(db)
      return json(res, 201, { applications: list })
    }

    return json(res, 404, { error: 'Not found' })
  } catch (err) {
    console.error(err)
    return json(res, 500, {
      error: err instanceof Error ? err.message : 'Server error',
    })
  }
})

server.listen(PORT, () => {
  console.log(`HIRERIGHT API v2 running on http://localhost:${PORT}`)
  console.log(`Interview agent: ${llmConfigured() ? 'LLM enabled' : 'local resume-aware agent (set OPENAI_API_KEY for LLM)'}`)
})
server.on('error', (err) => {
  if (err && err.code === 'EADDRINUSE') {
    console.warn(`Port ${PORT} already in use — API assumed running.`)
    return
  }
  console.error(err)
  process.exit(1)
})
