# Enterprise Architecture Diagram
## AI-Powered Recruitment & Interview SaaS Platform

```
╔═══════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════╗
║                                          ENTERPRISE SYSTEM ARCHITECTURE - LEFT TO RIGHT FLOW                                                                                                                    ║
╚═══════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════╝

┌─────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────┐
│                                                            PUBLIC / EDGE LAYER                                                                                                                                  │
└─────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────┘

        ┌──────────────────────┐
        │   WEB CLIENTS        │
        │  ┌────────────────┐  │
        │  │ Web Browsers   │  │
        │  │ Mobile/Desktop │  │
        │  └────────────────┘  │
        │                      │
        │  HTTPS Client Stack  │
        └──────────────────────┘
                    │
                    │ HTTPS / TLS 1.2+
                    │
                    ▼
        ┌──────────────────────────────────────────┐
        │   VERCEL EDGE NETWORK                    │
        │  ┌────────────────────────────────────┐  │
        │  │ • CDN & Edge Routing               │  │
        │  │ • TLS Termination                  │  │
        │  │ • Static Asset Caching             │  │
        │  │ • DDoS Protection                  │  │
        │  │ • Auto Scaling                     │  │
        │  │ • Geographic Distribution          │  │
        │  └────────────────────────────────────┘  │
        └──────────────────────────────────────────┘
                    │
                    │ HTTPS / HTTP
                    │ Web Requests
                    │
                    ▼
        ┌──────────────────────────────────────────┐
        │   NEXT.JS APPLICATION                    │
        │  ┌────────────────────────────────────┐  │
        │  │ • Next.js 16 + React 19            │  │
        │  │ • Node.js Server Runtime           │  │
        │  │ • Server-Side Rendering            │  │
        │  │ • API Routes                       │  │
        │  │ • Application Routing              │  │
        │  │ • Backend-for-Frontend             │  │
        │  └────────────────────────────────────┘  │
        └──────────────────────────────────────────┘
                    │
                    │ REST / JSON over HTTPS
                    │ Authenticated Requests
                    │
                    ▼
        ┌──────────────────────────────────────────┐
        │   APPLICATION SECURITY LAYER             │
        │  ┌────────────────────────────────────┐  │
        │  │ • JWT Authentication               │  │
        │  │ • Role-Based Access Control (RBAC) │  │
        │  │ • CORS Policy                      │  │
        │  │ • Content Security Policy          │  │
        │  │ • Security Headers                 │  │
        │  │ • Request Validation               │  │
        │  │ • Rate Limiting                    │  │
        │  │ • OAuth 2.0 Integration            │  │
        │  └────────────────────────────────────┘  │
        └──────────────────────────────────────────┘
                    │
                    │ Authorized Requests
                    │ REST / JSON over HTTPS
                    │
                    ▼

┌─────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────┐
│                                                    APPLICATION TIER                                                                                                                                             │
└─────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────┘

        ┌──────────────────────────────────────────┐
        │   APPLICATION SERVICES                   │
        │  ┌────────────────────────────────────┐  │
        │  │ • Node.js Runtime                  │  │
        │  │ • Business Logic Layer             │  │
        │  │ • REST API Server                  │  │
        │  │ • Request/Response Handling        │  │
        │  │ • Webhook Receivers                │  │
        │  │ • Real-time Service Coordinator    │  │
        │  └────────────────────────────────────┘  │
        └──────────────────────────────────────────┘
           │                    │                    │
           │                    │                    │
    REST / JSON HTTPS    Redis Protocol / TLS   ORM Calls
           │                    │                    │
           ▼                    ▼                    ▼

        ┌──────────────────┐  ┌──────────────────┐  ┌──────────────────┐
        │ DISTRIBUTED      │  │ DATA ACCESS      │  │ REAL-TIME        │
        │ CACHE            │  │ LAYER            │  │ COMMUNICATION    │
        │                  │  │                  │  │                  │
        │ Upstash Redis    │  │ Prisma 7         │  │ LiveKit          │
        │                  │  │                  │  │                  │
        │ • Session State  │  │ • ORM            │  │ • WebRTC Stack   │
        │ • Rate Limits    │  │ • DB Abstraction │  │ • Signaling      │
        │ • Cached Data    │  │ • Connection Mgmt│  │ • Media Routing  │
        │ • Temp State     │  │ • Migrations     │  │ • Recording      │
        │                  │  │                  │  │                  │
        └──────────────────┘  └────────────────┬─┘  └──────────────────┘
                                               │
                                        SQL / PostgreSQL
                                        Protocol / TLS
                                               │
                                               ▼
                                    ┌──────────────────────┐
                                    │ RELATIONAL +         │
                                    │ VECTOR DATABASE      │
                                    │                      │
                                    │ PostgreSQL +         │
                                    │ PGVECTOR             │
                                    │                      │
                                    │ • Transactional Data │
                                    │ • User/Org Data      │
                                    │ • Interview Records  │
                                    │ • Billing Metadata   │
                                    │ • Vector Embeddings  │
                                    │ • Semantic Search    │
                                    │                      │
                                    └──────────────────────┘

           │
           │ HTTPS / WebSocket
           │ REST API + Signaling
           │
           ▼
        ┌──────────────────────┐
        │ WEB BROWSER          │
        │                      │
        │ WebRTC Client        │
        └──────────────────────┘
           │
           │ WebRTC (Encrypted Media)
           │ Real-Time Audio/Video
           │
           ▼
        ┌──────────────────────┐
        │ LiveKit              │
        │ Real-Time Media      │
        └──────────────────────┘


┌─────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────┐
│                                                  ASYNCHRONOUS / EVENT TIER                                                                                                                                      │
└─────────────────────────────────────────────────────────────────��───────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────┘

Application Services
        │
        │ Async Events / HTTPS
        │ (Dashed Arrow - Asynchronous)
        ├ - - - - - - - - - - - - - ▶
        │
        ▼

        ┌──────────────────────────────────────────┐
        │   EVENT / BACKGROUND PROCESSING          │
        │  ┌────────────────────────────────────┐  │
        │  │ Inngest                            │  │
        │  │                                    │  │
        │  │ • Event-Driven Architecture        │  │
        │  │ • Asynchronous Job Queue           │  │
        │  │ • Long-Running Processes           │  │
        │  │ • Retry Logic & Durability         │  │
        │  │ • Rate-Limited Execution           │  │
        │  │                                    │  │
        │  │ Background Tasks:                  │  │
        │  │ • AI Evaluations                   │  │
        │  │ • Notification Dispatch            │  │
        │  │ • Billing Synchronization          │  │
        │  │ • Usage Analytics                  │  │
        │  │ • Report Generation                │  │
        │  │ • Email Workflows                  │  │
        │  └────────────────────────────────────┘  │
        └──────────────────────────────────────────┘
           │          │           │           │
           │          │           │           │
   Async   │   Async  │   HTTPS   │    SMTP
   Requests│   Requests │         │
           │          │           │           │
           ▼          ▼           ▼           ▼

┌─────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────┐
│                                              EXTERNAL SaaS / AI SERVICES TIER                                                                                                                                  │
└─────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────┘

        ┌──────────────────────┐  ┌──────────────────┐  ┌──────────────────┐  ┌──────────────────┐
        │ AI / LLM SERVICES    │  │ SPEECH-TO-TEXT   │  │ PAYMENT SERVICES │  │ EMAIL DELIVERY   │
        │                      │  │                  │  │                  │  │                  │
        │ OpenAI API           │  │ Deepgram         │  │ Stripe           │  │ Nodemailer +     │
        │                      │  │                  │  │                  │  │ SMTP Provider    │
        │ • LLM Inference      │  │ • Speech-to-Text │  │ • Payment API    │  │                  │
        │ • AI Evaluation      │  │ • Audio Analysis │  │ • Billing        │  │ • Email Sending  │
        │ • Embeddings         │  │ • Stream Process │  │ • Subscriptions  │  │ • Templates      │
        │ • Semantic Processing│  │                  │  │ • Webhooks       │  │ • Delivery Mgmt  │
        │                      │  │ Protocol:        │  │                  │  │                  │
        │ Protocol:            │  │ WebSocket /      │  │ Protocol:        │  │ Protocol:        │
        │ REST / JSON over     │  │ Streaming Audio  │  │ REST / JSON      │  │ SMTP / TLS       │
        │ HTTPS                │  │                  │  │ over HTTPS       │  │                  │
        │                      │  │                  │  │                  │  │                  │
        └──────────────────────┘  └──────────────────┘  └──────────────────┘  └──────────────────┘
           ▲                          ▲                     ▲                       ▲
           │                          │                     │                       │
           │                          │                     │                       │
    HTTPS REST                  WebSocket             HTTPS REST             SMTP / TLS
    Async AI Requests          Streaming Audio       Payment + Webhooks      Async Events


        ┌──────────────────────────────────────┐
        │      OBJECT STORAGE LAYER            │
        │                                      │
        │  Cloudflare R2                       │
        │  (S3-Compatible)                     │
        │                                      │
        │  • Large Binary Files                │
        │  • Interview Recordings              │
        │  • Resume Documents                  │
        │  • Video Transcripts                 │
        │  • Captions / Transcripts            │
        │  • Media Assets                      │
        │                                      │
        │  Protocol: S3 API / HTTPS            │
        └──────────────────────────────────────┘
           ▲ ▲
           │ │
      S3 API │
           │ │
           │ └─── From: LiveKit (Recording Storage)
           │
           └─── From: Application Services


┌─────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────┐
│                                                  OBSERVABILITY & MONITORING LAYER                                                                                                                              │
└─────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────┘

(Runs beneath entire system, non-blocking telemetry collection)

Next.js Application                   Application Services
         │                                     │
         │ Telemetry (Dotted Arrow)           │ Telemetry (Dotted Arrow)
         │ HTTPS                              │ HTTPS
         └· · · · · · · · · · · ┐             │
                                 └· · · · · ·┐│
                                            ││
                                            ▼▼
                                ┌──────────────────────┐
                                │ ERROR TRACKING &     │
                                │ MONITORING           │
                                │                      │
                                │ Sentry               │
                                │                      │
                                │ • Error Tracking     │
                                │ • Stack Traces       │
                                │ • Performance Monitor│
                                │ • Release Tracking   │
                                │ • Session Replay     │
                                │ • Alert Management   │
                                │                      │
                                │ (Non-blocking)       │
                                │ (Out-of-band telemetry)
                                └──────────────────────┘


╔═══════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════╗
║                                                    ENTERPRISE PROTOCOL SUMMARY                                                                                                                                  ║
╚═══════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════╝

SYNCHRONOUS COMMUNICATION (Solid Arrows):

  Clients ──────────────────► Vercel Edge        | HTTPS / TLS 1.2+
  Vercel Edge ──────────────► Next.js            | HTTPS
  Next.js ──────────────────► App Services       | REST / JSON over HTTPS
  App Services ──────────────► Upstash Redis     | Redis Protocol / TLS
  App Services ──────────────► Prisma ORM        | Internal ORM Calls
  Prisma ORM ──────────────────► PostgreSQL      | SQL / PostgreSQL Wire Protocol / TLS
  App Services ◄────────────► LiveKit            | HTTPS / WebSocket
  Browsers ◄────────────────► LiveKit            | WebRTC (Encrypted A/V)
  App Services ──────────────► OpenAI            | REST / JSON over HTTPS
  App Services ──────────────► Deepgram          | WebSocket / Streaming Audio
  App Services ──────────────► Stripe            | REST / JSON over HTTPS
  Stripe ──────────────────► App Services        | HTTPS Webhooks
  App Services ──────────────► Cloudflare R2     | S3 API / HTTPS


ASYNCHRONOUS COMMUNICATION (Dashed Arrows):

  App Services - - - - - - ─► Inngest            | Async Events / HTTPS
  Inngest - - - - - - ─► OpenAI                  | Async AI Requests
  Inngest - - - - - - ─► Email Service           | SMTP / TLS
  Inngest - - - - - - ─► PostgreSQL              | SQL Queries


TELEMETRY / MONITORING (Dotted Arrows):

  Next.js · · · · · · · · · · ► Sentry            | HTTPS Telemetry
  App Services · · · · · · · ► Sentry            | HTTPS Telemetry


╔═══════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════╗
║                                                     SECURITY BOUNDARIES & ZONES                                                                                                                                ║
╚═══════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════╝

┌──────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────┐
│ ZONE 1: PUBLIC / INTERNET BOUNDARY                                                                                                                                                                │
│ ├─ Clients (external, untrusted)                                                                                                                                                            │
│ ├─ Vercel Edge (trusted CDN, provides DDoS protection, TLS termination, rate limiting)                                                                                                      │
│ └─ Security Boundary: HTTPS/TLS encryption, DDoS mitigation                                                                                                                               │
└──────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────┘

┌──────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────┐
│ ZONE 2: APPLICATION SECURITY LAYER                                                                                                                                                           │
│ ├─ JWT Authentication + RBAC enforcement                                                                                                                                                   │
│ ├─ Request validation, rate limiting                                                                                                                                                        │
│ ├─ CORS, CSP, security headers                                                                                                                                                             │
│ └─ Security Boundary: All inbound requests authenticated & authorized                                                                                                                      │
└──────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────┘

┌──────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────┐
│ ZONE 3: INTERNAL APPLICATION TIER (Trusted)                                                                                                                                                  │
│ ├─ Next.js + Node.js runtime                                                                                                                                                               │
│ ├─ Application Services                                                                                                                                                                     │
│ └─ Direct access to: Redis, PostgreSQL, Inngest                                                                                                                                            │
└──────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────┘

┌──────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────┐
│ ZONE 4: DATA PERSISTENCE TIER (Encrypted, TLS)                                                                                                                                              │
│ ├─ PostgreSQL (TLS for all connections)                                                                                                                                                    │
│ ├─ Upstash Redis (TLS/SSL encryption)                                                                                                                                                      │
│ └─ Security: Network isolation, connection encryption, access control                                                                                                                      │
└──────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────┘

┌──────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────┐
│ ZONE 5: EXTERNAL SaaS INTEGRATIONS (Encrypted HTTPS + Webhooks)                                                                                                                              │
│ ├─ OpenAI: API key auth, HTTPS requests                                                                                                                                                   │
│ ├─ Stripe: OAuth + API keys, webhook signature verification                                                                                                                               │
│ ├─ Deepgram: API key auth, WebSocket/HTTPS                                                                                                                                                 │
│ ├─ LiveKit: Access tokens (JWT-style), WebRTC with DTLS/SRTP encryption                                                                                                                   │
│ └─ Security: API key management (Env vars), request signing, webhook validation                                                                                                            │
└──────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────┘

┌──────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────┐
│ ZONE 6: STORAGE & OBSERVABILITY (Out-of-band, minimal data exposure)                                                                                                                         │
│ ├─ Cloudflare R2: S3 API with auth tokens                                                                                                                                                  │
│ ├─ Sentry: Error tracking (filtered, anonymized)                                                                                                                                           │
│ └─ Security: Non-blocking, post-request telemetry, data minimization                                                                                                                       │
└──────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────┘


╔═══════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════╗
║                                                    KEY ARCHITECTURAL PRINCIPLES                                                                                                                                 ║
╚═══════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════╝

1. EDGE-FIRST DELIVERY
   ├─ Static assets cached globally via Vercel CDN
   ├─ TLS termination at edge
   └─ DDoS protection before reaching origin

2. API-DRIVEN ARCHITECTURE
   ├─ Next.js BFF (Backend-for-Frontend) pattern
   ├─ RESTful API design
   └─ Clear separation between frontend & backend logic

3. SECURITY-BY-LAYERS
   ├─ Network security (HTTPS/TLS everywhere)
   ├─ Application security (JWT, RBAC, input validation)
   ├─ Data security (encrypted at rest & in transit)
   └─ Webhook verification for third-party integrations

4. ASYNCHRONOUS PROCESSING
   ├─ Inngest for event-driven background jobs
   ├─ Non-blocking user experience
   ├─ Reliable retry mechanisms
   └─ Rate-limiting on external API calls

5. REAL-TIME CAPABILITY
   ├─ WebRTC for live interview media
   ├─ WebSocket signaling via LiveKit
   ├─ SRTP encryption for media streams
   └─ Separate real-time tier from REST API

6. DATA PERSISTENCE & CACHING
   ├─ PostgreSQL as source of truth
   ├─ Redis for session/state management
   ├─ Vector embeddings for AI-powered matching
   └─ Cloudflare R2 for file storage

7. OBSERVABILITY
   ├─ Centralized error tracking via Sentry
   ├─ Non-blocking telemetry collection
   ├─ Stack traces and release tracking
   └─ Performance monitoring across tiers

8. EXTERNAL INTEGRATIONS
   ├─ OpenAI for AI evaluation & embeddings
   ├─ Deepgram for speech-to-text processing
   ├─ Stripe for PCI-compliant payments
   ├─ SMTP for email delivery
   └─ All third-party calls authenticated & rate-limited

9. SCALABILITY
   ├─ Stateless Next.js/Node.js services
   ├─ Auto-scaling at edge
   ├─ Connection pooling via Prisma
   ├─ Distributed cache (Redis)
   └─ Async job queue (Inngest)

10. ENTERPRISE RELIABILITY
    ├─ Health checks & monitoring
    ├─ Graceful degradation
    ├─ Retry policies on failures
    ├─ Request validation & rate limiting
    └─ Audit logging for compliance
```

---

## Architecture Layers Explained

### **PUBLIC / EDGE LAYER**
- **Clients**: Web browsers (desktops, mobile)
- **Vercel Edge Network**: Global CDN, DDoS protection, static caching, TLS termination
- **Protocol**: All traffic encrypted via HTTPS/TLS 1.2+

### **APPLICATION TIER**
- **Next.js 16 / React 19**: Server-side rendering, API routes, BFF pattern
- **Application Security Layer**: JWT auth, RBAC, CORS, request validation, rate limiting
- **Application Services**: Core business logic, REST API server, webhook handling

### **DATA TIER**
- **Upstash Redis**: Distributed cache, session state, rate limiting
- **Prisma ORM**: Database abstraction, schema management, connection pooling
- **PostgreSQL + PGVECTOR**: Transactional storage, embeddings, semantic search

### **ASYNC / EVENT TIER**
- **Inngest**: Event-driven processing, background jobs, retry logic
- **Tasks**: AI evaluations, notifications, billing sync, email workflows

### **EXTERNAL SaaS TIER**
- **OpenAI**: LLM inference, embeddings, AI evaluation
- **Deepgram**: Speech-to-text, audio analysis
- **LiveKit**: WebRTC media, real-time communication
- **Stripe**: Payment processing, billing
- **Email Provider**: SMTP-based email delivery

### **STORAGE TIER**
- **Cloudflare R2**: S3-compatible object storage for recordings, documents, resumes

### **OBSERVABILITY TIER**
- **Sentry**: Error tracking, performance monitoring, alerting (non-blocking telemetry)

---

## Communication Patterns

| Pattern | Arrow Style | Examples |
|---------|------------|----------|
| **Synchronous** | Solid → | Client → Edge, App → Database, App → Stripe |
| **Bidirectional** | ◄───► | Browser ↔ LiveKit, App ↔ Redis |
| **Asynchronous** | - - - → | App → Inngest, Inngest → OpenAI |
| **Telemetry** | · · · → | App → Sentry (non-blocking) |

---

## Security Summary

✓ **Network Layer**: HTTPS/TLS everywhere, DDoS protection at edge  
✓ **Application Layer**: JWT authentication, RBAC, input validation  
✓ **Data Layer**: PostgreSQL encryption, Redis TLS, PII protection  
✓ **Integration Layer**: API key management, webhook signature verification  
✓ **Observability**: Anonymized error tracking, no sensitive data logged  

---

## Deployment & Scalability

- **Frontend**: Vercel (serverless, auto-scaling, global CDN)
- **Backend**: Next.js server functions (serverless) or Node.js containers
- **Database**: PostgreSQL managed (AWS RDS, Neon, or similar)
- **Cache**: Upstash Redis (serverless, auto-scaling)
- **Jobs**: Inngest (serverless event processing)
- **Media**: LiveKit (managed WebRTC platform)
- **Storage**: Cloudflare R2 (S3-compatible, redundant)

---

## Enterprise Features

✓ **99.99% Uptime SLA** via Vercel + managed services  
✓ **PCI Compliance** via Stripe (no payment processing in app)  
✓ **GDPR/Privacy** via data encryption + audit logging  
✓ **Rate Limiting** at edge + application layer  
✓ **Request Signing** for webhook verification  
✓ **Monitoring & Alerting** via Sentry integration  
✓ **Graceful Degradation** if third-party services fail  
