import { createServer } from 'node:http'
import { readFileSync, writeFileSync, existsSync, mkdirSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'
import { createHash, randomBytes } from 'node:crypto'

const __dirname = dirname(fileURLToPath(import.meta.url))
const DATA_DIR = join(__dirname, 'data')
const DB_PATH = join(DATA_DIR, 'db.json')
const PORT = Number(process.env.PORT) || 8787

/** @typedef {{ id: string, name: string, email: string, passwordHash: string, createdAt: string }} User */
/** @typedef {{ users: User[], profiles: Record<string, unknown>, interviews: Record<string, unknown>, applications: Record<string, unknown[]> }} DB */

function emptyDb() {
  return { users: [], profiles: {}, interviews: {}, applications: {} }
}

function loadDb() {
  if (!existsSync(DATA_DIR)) mkdirSync(DATA_DIR, { recursive: true })
  if (!existsSync(DB_PATH)) {
    writeFileSync(DB_PATH, JSON.stringify(emptyDb(), null, 2))
  }
  return /** @type {DB} */ (JSON.parse(readFileSync(DB_PATH, 'utf8')))
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
      if (data.length > 2_000_000) reject(new Error('Body too large'))
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

function authEmail(req) {
  const header = req.headers.authorization || ''
  const token = header.replace(/^Bearer\s+/i, '')
  return sessions.get(token) || null
}

const server = createServer(async (req, res) => {
  if (req.method === 'OPTIONS') {
    return json(res, 204, {})
  }

  const url = new URL(req.url || '/', `http://localhost:${PORT}`)
  const path = url.pathname

  try {
    if (req.method === 'GET' && path === '/api/health') {
      return json(res, 200, { ok: true, service: 'hireright-api' })
    }

    if (req.method === 'POST' && path === '/api/signup') {
      const body = await readBody(req)
      const name = String(body.name || '').trim()
      const email = String(body.email || '').trim().toLowerCase()
      const password = String(body.password || '')
      if (!name || !email || password.length < 6) {
        return json(res, 400, { error: 'Name, email, and 6+ char password required.' })
      }
      const db = loadDb()
      if (db.users.some((u) => u.email === email)) {
        return json(res, 409, { error: 'An account with this email already exists.' })
      }
      const user = {
        id: randomBytes(8).toString('hex'),
        name,
        email,
        passwordHash: hashPassword(password),
        createdAt: new Date().toISOString(),
      }
      db.users.push(user)
      saveDb(db)
      const token = randomBytes(16).toString('hex')
      sessions.set(token, email)
      return json(res, 201, {
        token,
        user: { id: user.id, name: user.name, email: user.email },
      })
    }

    if (req.method === 'POST' && path === '/api/login') {
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
        user: { id: user.id, name: user.name, email: user.email },
      })
    }

    if (req.method === 'GET' && path === '/api/me') {
      const email = authEmail(req)
      if (!email) return json(res, 401, { error: 'Unauthorized' })
      const db = loadDb()
      const user = db.users.find((u) => u.email === email)
      if (!user) return json(res, 401, { error: 'Unauthorized' })
      return json(res, 200, {
        user: { id: user.id, name: user.name, email: user.email },
        profile: db.profiles[email] || null,
        interview: db.interviews[email] || null,
        applications: db.applications[email] || [],
      })
    }

    if (req.method === 'PUT' && path === '/api/profile') {
      const email = authEmail(req)
      if (!email) return json(res, 401, { error: 'Unauthorized' })
      const body = await readBody(req)
      const db = loadDb()
      db.profiles[email] = { ...body, updatedAt: new Date().toISOString() }
      saveDb(db)
      return json(res, 200, { profile: db.profiles[email] })
    }

    if (req.method === 'POST' && path === '/api/interview') {
      const email = authEmail(req)
      if (!email) return json(res, 401, { error: 'Unauthorized' })
      const body = await readBody(req)
      const db = loadDb()
      db.interviews[email] = body
      saveDb(db)
      return json(res, 200, { interview: body })
    }

    if (req.method === 'POST' && path === '/api/applications') {
      const email = authEmail(req)
      if (!email) return json(res, 401, { error: 'Unauthorized' })
      const body = await readBody(req)
      const db = loadDb()
      const list = db.applications[email] || []
      list.unshift({ ...body, id: randomBytes(6).toString('hex'), appliedAt: new Date().toISOString() })
      db.applications[email] = list
      saveDb(db)
      return json(res, 201, { applications: list })
    }

    return json(res, 404, { error: 'Not found' })
  } catch (err) {
    return json(res, 500, {
      error: err instanceof Error ? err.message : 'Server error',
    })
  }
})

server.listen(PORT, () => {
  console.log(`HIRERIGHT API running on http://localhost:${PORT}`)
})
