# Oustadi / أستادي — Project Map

> Generated: 2026-05-19
> Status: Phase 1 — Implementation Complete
> Author: Staff Software Engineer / SaaS Architect
> Last Updated: 2026-05-19 12:00 UTC

## CODE IMPLEMENTATION STATUS

| Module | Status | Files |
|--------|--------|-------|
| Root monorepo config | ✅ Complete | package.json, pnpm-workspace.yaml, turbo.json, tsconfig.base.json |
| packages/types | ✅ Complete | Role enums, interfaces, API response types |
| packages/shared | ✅ Complete | Constants, utilities (slugify, file limits, cities) |
| packages/config | ✅ Complete | Environment variable configuration |
| packages/ui | ✅ Complete | Button, Input, Card components with cn() utility |
| apps/api — Core | ✅ Complete | main.ts, app.module.ts, PrismaModule, RedisModule, guards, decorators, filters, interceptors |
| apps/api — Auth | ✅ Complete | Register, login, JWT refresh rotation, session tracking |
| apps/api — Users | ✅ Complete | Get/update/delete profile |
| apps/api — Teachers | ✅ Complete | Profile CRUD, subjects CRUD, availability, search with pagination |
| apps/api — Students | ✅ Complete | Profile, favorites (toggle/list) |
| apps/api — Subjects | ✅ Complete | CRUD with admin guard |
| apps/api — Requests | ✅ Complete | Create, list, accept/reject |
| apps/api — Chat | ✅ Complete | REST + Socket.IO gateway (messages, conversations, typing, read) |
| apps/api — Upload | ✅ Complete | Avatar (resize to 400x400), document upload, validation |
| apps/api — Notifications | ✅ Complete | CRUD, mark read |
| apps/api — Admin | ✅ Complete | Dashboard stats, user management, reports, document verification |
| apps/api — Prisma | ✅ Complete | Full schema (15 models), seed script with test data |
| apps/web — Layout | ✅ Complete | Root layout, header, footer, RTL, providers |
| apps/web — Auth pages | ✅ Complete | Login, register pages |
| apps/web — Teachers pages | ✅ Complete | Directory with search/filter, profile page with request form |
| apps/web — Dashboards | ✅ Complete | Student, Teacher, Admin dashboards |
| apps/web — Chat | ✅ Complete | Real-time chat UI with Socket.IO |
| apps/web — Settings | ✅ Complete | Profile settings with language toggle |
| apps/web — Error pages | ✅ Complete | 404, error boundary |
| Docker — Compose | ✅ Complete | Dev + production compose files |
| Docker — API | ✅ Complete | Multi-stage build with pnpm |
| Docker — Web | ✅ Complete | Standalone Next.js output |
| Docker — Nginx | ✅ Complete | Production config with SSL, security headers, reverse proxy |
| CI | ✅ Complete | GitHub Actions workflow (lint + build) |

---

## 1. REQUIREMENT VALIDATION

### Validated Requirements
| # | Requirement | Status | Notes |
|---|------------|--------|-------|
| 1 | Teacher profiles with subjects, levels, pricing, availability | ✅ Confirmed | Core feature |
| 2 | Student search/filter with PostgreSQL FTS | ✅ Confirmed | No external search engines |
| 3 | Lesson requests (Pending/Accepted/Rejected) | ✅ Confirmed | Expandable to Completed/Cancelled later |
| 4 | Real-time chat via WebSocket (Socket.IO) | ✅ Confirmed | REST for history, WS for live |
| 5 | Favorites/wishlist | ✅ Confirmed | Simple join table |
| 6 | File uploads (avatars, certificates) | ✅ Confirmed | Local VPS Phase 1, S3/R2 later |
| 7 | RBAC (Student, Teacher, Admin) | ✅ Confirmed | Guard-based enforcement |
| 8 | Admin panel (users, content, reports, analytics) | ✅ Confirmed | Basic analytics only |
| 9 | No internal payments | ✅ Confirmed | Phase 1 exclusion |
| 10 | No internal video calls | ✅ Confirmed | Phase 1 exclusion |
| 11 | Languages: Arabic, French | ✅ Confirmed | i18n-ready, RTL-ready |
| 12 | Monorepo (Turborepo + pnpm) | ✅ Confirmed | Mandated |
| 13 | Full Docker deployment | ✅ Confirmed | Ubuntu VPS target |
| 14 | PostgreSQL + Prisma ORM | ✅ Confirmed | Mandated |
| 15 | Redis for cache, sessions, rate-limiting | ✅ Confirmed | Mandated |

### Deferred to Phase 2+
- Payment integration (Stripe, PayPal, or CMI)
- Video/audio calls (Daily.co, Whereby, or Jitsi)
- Reviews & ratings system
- Notifications (email, push)
- Mobile apps (React Native)
- AI teacher-student matching
- Advanced analytics

---

## 2. ASSUMPTIONS

| # | Assumption | Risk | Mitigation |
|---|-----------|------|------------|
| 1 | VPS has minimum 2GB RAM, 2 vCPUs | Low | Docker Compose resource limits |
| 2 | PostgreSQL 17+ available | Low | Docker image pinning |
| 3 | Redis 7+ available | Low | Docker image pinning |
| 4 | Domain + DNS configured before deployment | Low | Documented in deployment guide |
| 5 | VPS has Docker + Docker Compose installed | Low | Included in setup script |
| 6 | Teachers will upload JPEG/PNG <5MB | Medium | Validation + compression with sharp |
| 7 | Peak concurrency <1000 users initially | Medium | Redis caching + connection pooling |
| 8 | Moroccan Arabic (Darija) + French are primary languages | Low | next-intl with RTL support |
| 9 | No PII/credit card data stored (Phase 1) | Low | Reduces PCI compliance scope |

---

## 3. TECH_STACK

### Core Technologies

| Technology | Version | Justification |
|-----------|---------|---------------|
| Node.js | 24.15.0 (LTS) | Current LTS, long-term support, performance improvements |
| TypeScript | 6.0.3 | Type safety across fullstack, better DX, AI-friendly |
| pnpm | 10.x+ | Disk-efficient, strict monorepe support, faster than npm/yarn |
| Turborepo | 2.9.14 | Native monorepo caching, parallel tasks, zero config |

### Frontend

| Package | Version | Justification |
|---------|---------|---------------|
| Next.js | 16.2.6 | App Router, SSR, RSC, SEO, file-based routing, middleware |
| React | 19.2.6 | Latest stable, concurrent features, server components |
| Tailwind CSS | 4.3.0 | Utility-first, fast prototyping, consistent design system |
| shadcn/ui | latest | Copy-paste components, Radix-based, customizable, no dependency lock |
| next-intl | 4.12.0 | i18n for Next.js App Router, RTL support, simple API |
| react-hook-form | 7.76.0 | Performant forms, minimal re-renders, easy validation |
| zod | 4.4.3 | Schema validation, TypeScript-first, composable |
| @hookform/resolvers | 5.2.2 | Bridge between react-hook-form and zod |
| lucide-react | 1.16.0 | Lightweight, consistent icon set |
| recharts | 3.8.1 | Admin analytics charts, minimal config |
| next-themes | 0.4.6 | Theme switching (light/dark) |
| date-fns | 4.4.3 | Date manipulation, tree-shakeable |
| framer-motion | 12.38.0 | Animations, transitions, micro-interactions |

### Backend (NestJS)

| Package | Version | Justification |
|---------|---------|---------------|
| @nestjs/core | 11.1.21 | Latest stable NestJS, modular architecture |
| @nestjs/config | 4.0.4 | Environment config management |
| @nestjs/passport | 11.0.5 | Authentication strategies |
| @nestjs/jwt | 11.0.2 | JWT generation + validation |
| @nestjs/throttler | 6.5.0 | Rate limiting guard |
| @nestjs/schedule | 6.1.3 | Cron jobs (session cleanup, temp file cleanup) |
| @nestjs/platform-socket.io | 11.1.21 | WebSocket gateway support |
| @nestjs/serve-static | 5.0.5 | Serve uploaded files in dev |
| passport | 0.7.0 | Auth middleware |
| passport-jwt | 4.0.1 | JWT strategy for passport |
| bcrypt | 6.0.0 | Password hashing |
| class-validator | 0.15.1 | DTO validation |
| class-transformer | 0.5.1 | Object serialization |
| multer | 2.1.1 | File upload handling |
| sharp | 0.34.5 | Image processing/resizing |
| socket.io | 4.8.3 | WebSocket server |
| helmet | 8.1.0 | HTTP security headers |

### Database & ORM

| Package | Version | Justification |
|---------|---------|---------------|
| prisma | 7.8.0 | Type-safe ORM, migrations, studio |
| @prisma/client | 7.8.0 | Auto-generated query client |
| ioredis | 5.10.1 | Redis client, cluster support, Promise-based |

### Dev Tools

| Package | Version | Justification |
|---------|---------|---------------|
| eslint | 10.4.0 | Code linting |
| prettier | 17.0.5 | Code formatting |
| husky | 10.4.0 | Git hooks |
| lint-staged | 8.5.14 | Lint only staged files |
| tsx | 4.22.0 | TypeScript execution for scripts |
| @types/* | latest | Type definitions |

### Infrastructure

| Technology | Version | Justification |
|-----------|---------|---------------|
| Docker | 28+ | Containerization, consistent environments |
| Docker Compose | 2.x+ | Multi-container orchestration |
| PostgreSQL | 17 | Primary database, full-text search |
| Redis | 7.4+ | Caching, sessions, rate limiting, Socket.IO adapter |
| Nginx | 1.27+ | Reverse proxy, static files, SSL termination |
| Let's Encrypt | latest | Free SSL certificates via Certbot |
| Ubuntu | 24.04 LTS | VPS operating system, stable, long support |

---

## 4. ARCHITECTURE

### Monorepo Structure

```
oustadi/
├── .github/
│   └── workflows/
│       ├── ci.yml
│       └── deploy.yml
├── apps/
│   ├── web/                          # Next.js frontend
│   │   ├── src/
│   │   │   ├── app/                  # Next.js App Router pages
│   │   │   │   ├── (auth)/           # Auth routes group
│   │   │   │   │   ├── login/
│   │   │   │   │   ├── register/
│   │   │   │   │   ├── forgot-password/
│   │   │   │   │   └── reset-password/
│   │   │   │   ├── (public)/         # Public routes group
│   │   │   │   │   ├── teachers/     # Teacher directory + profiles
│   │   │   │   │   └── page.tsx      # Landing page
│   │   │   │   ├── (dashboard)/      # Protected dashboard routes
│   │   │   │   │   ├── student/
│   │   │   │   │   ├── teacher/
│   │   │   │   │   └── admin/
│   │   │   │   ├── chat/             # Chat pages
│   │   │   │   ├── settings/
│   │   │   │   └── error.tsx
│   │   │   ├── components/           # Shared components
│   │   │   │   ├── ui/               # shadcn/ui components
│   │   │   │   ├── layout/           # Header, Footer, Sidebar
│   │   │   │   ├── forms/            # Form components
│   │   │   │   ├── teacher/          # Teacher-specific components
│   │   │   │   └── student/          # Student-specific components
│   │   │   ├── hooks/                # Custom React hooks
│   │   │   ├── lib/                  # Utilities, API client
│   │   │   ├── messages/            # i18n translation files
│   │   │   │   ├── ar.json
│   │   │   │   └── fr.json
│   │   │   ├── providers/           # React context providers
│   │   │   ├── middleware.ts         # Next.js middleware (auth, i18n)
│   │   │   └── styles/              # Global styles
│   │   ├── public/                  # Static assets
│   │   ├── next.config.ts
│   │   ├── tailwind.config.ts
│   │   ├── tsconfig.json
│   │   └── package.json
│   │
│   └── api/                          # NestJS backend
│       ├── src/
│       │   ├── main.ts
│       │   ├── app.module.ts
│       │   ├── common/               # Shared utilities
│       │   │   ├── decorators/
│       │   │   ├── filters/
│       │   │   ├── guards/
│       │   │   ├── interceptors/
│       │   │   ├── pipes/
│       │   │   └── types/
│       │   ├── config/               # Configuration modules
│       │   │   ├── database/
│       │   │   ├── redis/
│       │   │   └── storage/
│       │   ├── modules/              # Feature modules
│       │   │   ├── auth/
│       │   │   ├── users/
│       │   │   ├── teachers/
│       │   │   ├── students/
│       │   │   ├── subjects/
│       │   │   ├── requests/
│       │   │   ├── chat/
│       │   │   ├── upload/
│       │   │   ├── notifications/
│       │   │   └── admin/
│       │   └── prisma/               # Prisma service
│       ├── prisma/
│       │   ├── schema.prisma
│       │   ├── migrations/
│       │   └── seed.ts
│       ├── uploads/                  # Local file storage (gitignored)
│       ├── test/
│       ├── tsconfig.json
│       ├── nest-cli.json
│       └── package.json
│
├── packages/
│   ├── ui/                           # Shared UI components
│   │   ├── src/
│   │   ├── tsconfig.json
│   │   └── package.json
│   ├── shared/                       # Shared logic/utilities
│   │   ├── src/
│   │   │   ├── types/
│   │   │   ├── constants/
│   │   │   ├── utils/
│   │   │   └── validators/
│   │   ├── tsconfig.json
│   │   └── package.json
│   ├── config/                       # Shared configuration
│   │   ├── src/
│   │   │   └── index.ts
│   │   ├── tsconfig.json
│   │   └── package.json
│   └── types/                        # Shared TypeScript types
│       ├── src/
│       │   └── index.ts
│       ├── tsconfig.json
│       └── package.json
│
├── infra/
│   ├── docker/
│   │   ├── Dockerfile.web
│   │   ├── Dockerfile.api
│   │   ├── nginx/
│   │   │   ├── nginx.conf
│   │   │   ├── nginx.dev.conf
│   │   │   └── ssl/                  # Local dev certs (gitignored)
│   │   └── scripts/
│   │       ├── entrypoint.web.sh
│   │       ├── entrypoint.api.sh
│   │       └── wait-for-it.sh
│   ├── docker-compose.yml
│   ├── docker-compose.dev.yml
│   └── docker-compose.prod.yml
│
├── docs/
│   ├── DEPLOYMENT.md
│   ├── API.md
│   └── CONTRIBUTING.md
│
├── .env.example
├── .gitignore
├── .prettierrc
├── .eslintrc.js
├── turbo.json
├── package.json                    # Root workspace
├── pnpm-workspace.yaml
├── tsconfig.base.json
└── PROJECT_MAP.md                  # ← This file
```

### Module Relationships

```
┌─────────────────────────────────────┐
│         apps/web (Next.js)          │
│  ┌──────────┐  ┌──────────────────┐ │
│  │ App Router│  │  Server/Actions  │ │
│  │ SSR+RSC   │──│  API Client      │ │
│  └──────────┘  └────────┬─────────┘ │
└──────────────────────────┼──────────┘
                           │ HTTP + WS
┌──────────────────────────┼──────────┐
│         apps/api (NestJS)│          │
│  ┌──────────────────────┐│          │
│  │  AuthModule          ││          │
│  │  UsersModule         ││          │
│  │  TeachersModule      ││          │
│  │  StudentsModule      ││          │
│  │  SubjectsModule      ││          │
│  │  RequestsModule      ││          │
│  │  ChatModule (WS)     ││          │
│  │  UploadModule        ││          │
│  │  NotificationsModule ││          │
│  │  AdminModule         ││          │
│  └──┬─────────┬─────────┘│          │
│     │         │          │          │
│  ┌──▼─────────▼──────────┐          │
│  │   PrismaService       │          │
│  │   RedisService        │          │
│  └──┬─────────┬──────────┘          │
└──────┼─────────┼────────────────────┘
       │         │
  ┌────▼──┐ ┌───▼────┐
  │PostgreSQL│ │ Redis  │
  └─────────┘ └────────┘
```

---

## 5. DATABASE SCHEMA

### Prisma Schema Design

```prisma
// apps/api/prisma/schema.prisma

generator client {
  provider        = "prisma-client-js"
  previewFeatures = ["fullTextSearch"]
}

datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

// ─── ENUMS ───────────────────────────────────────

enum Role {
  STUDENT
  TEACHER
  ADMIN
}

enum TeachingMode {
  ONLINE
  IN_PERSON
  BOTH
}

enum RequestStatus {
  PENDING
  ACCEPTED
  REJECTED
}

enum MessageStatus {
  SENT
  DELIVERED
  READ
}

// ─── USER ────────────────────────────────────────

model User {
  id             String    @id @default(cuid())
  email          String    @unique
  passwordHash   String
  fullName       String
  role           Role      @default(STUDENT)
  phone          String?
  avatarKey      String?
  language       String    @default("ar") // ar | fr
  emailVerified  Boolean   @default(false)
  isActive       Boolean   @default(true)
  isSuspended    Boolean   @default(false)
  suspensionReason String?
  lastSeen       DateTime?
  isOnline       Boolean   @default(false)

  studentProfile   StudentProfile?
  teacherProfile   TeacherProfile?
  sentRequests     LessonRequest[]  @relation("StudentRequests")
  receivedRequests LessonRequest[]  @relation("TeacherRequests")
  conversations    Conversation[]   @relation("UserConversations")
  messages         Message[]
  favorites        Favorite[]
  reports          Report[]         @relation("Reporter")
  notifications    Notification[]
  sessions         Session[]

  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
  deletedAt DateTime?

  @@index([email])
  @@index([role])
}

// ─── SESSION ─────────────────────────────────────

model Session {
  id           String   @id @default(cuid())
  userId       String
  user         User     @relation(fields: [userId], references: [id], onDelete: Cascade)
  refreshToken String   @unique
  userAgent    String?
  ipAddress    String?
  expiresAt    DateTime
  isRevoked    Boolean  @default(false)

  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt

  @@index([userId])
  @@index([refreshToken])
}

// ─── TEACHER PROFILE ─────────────────────────────

model TeacherProfile {
  id          String       @id @default(cuid())
  userId      String       @unique
  user        User         @relation(fields: [userId], references: [id], onDelete: Cascade)
  bio         String?
  experience  Int?         // years of experience
  price       Decimal?     @db.Decimal(10, 2)
  teachingMode TeachingMode @default(BOTH)
  city        String?
  showContact Boolean      @default(false)
  isVerified  Boolean      @default(false)
  isOfficial  Boolean      @default(false)
  facebookUrl  String?
  instagramUrl String?
  linkedinUrl  String?
  youtubeUrl   String?
  websiteUrl   String?

  subjects      TeacherSubject[]
  availability  AvailabilitySlot[]
  documents     UploadedDocument[]
  favorites     Favorite[]

  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
  deletedAt DateTime?

  @@index([city])
  @@index([price])
}

// ─── STUDENT PROFILE ─────────────────────────────

model StudentProfile {
  id        String @id @default(cuid())
  userId    String @unique
  user      User   @relation(fields: [userId], references: [id], onDelete: Cascade)
  bio       String?
  city      String?

  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt

  @@index([city])
}

// ─── SUBJECT ─────────────────────────────────────

model Subject {
  id          String          @id @default(cuid())
  nameAr      String          // Arabic name
  nameFr      String          // French name
  slug        String          @unique
  isActive    Boolean         @default(true)
  icon        String?

  teachers    TeacherSubject[]
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt

  @@index([slug])
  @@index([nameAr])
}

// ─── TEACHER-SUBJECT (Junction) ──────────────────

model TeacherSubject {
  id          String    @id @default(cuid())
  teacherId   String
  teacher     TeacherProfile @relation(fields: [teacherId], references: [id], onDelete: Cascade)
  subjectId   String
  subject     Subject   @relation(fields: [subjectId], references: [id], onDelete: Cascade)
  levels      String[]  // ["college", "lycee", "superieur"]
  price       Decimal?  @db.Decimal(10, 2) // override per subject

  @@unique([teacherId, subjectId])
  @@index([teacherId])
  @@index([subjectId])
}

// ─── AVAILABILITY ────────────────────────────────

model AvailabilitySlot {
  id        String   @id @default(cuid())
  teacherId String
  teacher   TeacherProfile @relation(fields: [teacherId], references: [id], onDelete: Cascade)
  dayOfWeek Int      // 0=Sunday, 1=Monday, ...
  startTime String   // "09:00"
  endTime   String   // "17:00"

  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt

  @@index([teacherId])
}

// ─── LESSON REQUEST ──────────────────────────────

model LessonRequest {
  id            String        @id @default(cuid())
  studentId     String
  student       User          @relation("StudentRequests", fields: [studentId], references: [id], onDelete: Cascade)
  teacherId     String
  teacher       User          @relation("TeacherRequests", fields: [teacherId], references: [id], onDelete: Cascade)
  subjectId     String
  subject       Subject       @relation(fields: [subjectId], references: [id])
  message       String
  status        RequestStatus @default(PENDING)
  proposedSchedule String?     // JSON or free text
  teacherNotes  String?

  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
  deletedAt DateTime?

  @@index([studentId])
  @@index([teacherId])
  @@index([status])
}

// ─── FAVORITE ────────────────────────────────────

model Favorite {
  id        String   @id @default(cuid())
  studentId String
  student   User     @relation(fields: [studentId], references: [id], onDelete: Cascade)
  teacherId String
  teacher   TeacherProfile @relation(fields: [teacherId], references: [id], onDelete: Cascade)

  createdAt DateTime @default(now())

  @@unique([studentId, teacherId])
  @@index([studentId])
}

// ─── CONVERSATION ────────────────────────────────

model Conversation {
  id            String    @id @default(cuid())
  studentId     String
  teacherId     String
  teacher       User      @relation("UserConversations", fields: [teacherId], references: [id], onDelete: Cascade)
  student       User      @relation("UserConversations", fields: [studentId], references: [id], onDelete: Cascade)
  lastMessageAt DateTime?
  lastMessagePreview String?

  messages      Message[]
  createdAt     DateTime @default(now())
  updatedAt     DateTime @updatedAt

  @@index([studentId])
  @@index([teacherId])
  @@unique([studentId, teacherId])
}

// ─── MESSAGE ─────────────────────────────────────

model Message {
  id             String        @id @default(cuid())
  conversationId String
  conversation   Conversation  @relation(fields: [conversationId], references: [id], onDelete: Cascade)
  senderId       String
  sender         User          @relation(fields: [senderId], references: [id])
  content        String
  status         MessageStatus @default(SENT)

  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt

  @@index([conversationId])
  @@index([senderId])
}

// ─── UPLOADED DOCUMENTS ──────────────────────────

model UploadedDocument {
  id          String   @id @default(cuid())
  teacherId   String
  teacher     TeacherProfile @relation(fields: [teacherId], references: [id], onDelete: Cascade)
  fileName    String
  originalName String
  mimeType    String
  size        Int
  type        String   // "avatar" | "certificate" | "document"
  isVerified  Boolean  @default(false)

  createdAt DateTime @default(now())

  @@index([teacherId])
  @@index([type])
}

// ─── REPORT ──────────────────────────────────────

model Report {
  id          String   @id @default(cuid())
  reporterId  String
  reporter    User     @relation("Reporter", fields: [reporterId], references: [id], onDelete: Cascade)
  targetId    String   // userId being reported
  reason      String
  description String?
  isResolved  Boolean  @default(false)

  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt

  @@index([reporterId])
  @@index([targetId])
  @@index([isResolved])
}

// ─── NOTIFICATION ────────────────────────────────

model Notification {
  id        String   @id @default(cuid())
  userId    String
  user      User     @relation(fields: [userId], references: [id], onDelete: Cascade)
  title     String
  body      String
  type      String   // "request" | "message" | "system"
  isRead    Boolean  @default(false)
  link      String?

  createdAt DateTime @default(now())

  @@index([userId])
  @@index([isRead])
}

// ─── ADMIN LOG ───────────────────────────────────

model AdminLog {
  id        String   @id @default(cuid())
  adminId   String
  action    String   // "suspend_user", "verify_document", "delete_content"
  targetId  String?
  details   String?

  createdAt DateTime @default(now())

  @@index([adminId])
  @@index([action])
}
```

---

## 6. API STRUCTURE

### NestJS Module Map

```
POST   /api/auth/register              # Create account
POST   /api/auth/login                 # Login (returns tokens)
POST   /api/auth/refresh               # Refresh token
POST   /api/auth/logout                # Revoke session
POST   /api/auth/forgot-password       # Send reset email
POST   /api/auth/reset-password        # Reset password
GET    /api/auth/verify-email/:token   # Verify email

GET    /api/users/me                   # Current user profile
PATCH  /api/users/me                   # Update profile
DELETE /api/users/me                   # Delete account

GET    /api/teachers                   # List teachers (search/filter)
GET    /api/teachers/:id               # Teacher profile (public)
PATCH  /api/teachers/profile           # Update own profile (teacher)
POST   /api/teachers/subjects          # Add subject
DELETE /api/teachers/subjects/:id      # Remove subject
POST   /api/teachers/availability      # Add availability slot
DELETE /api/teachers/availability/:id  # Remove slot
GET    /api/teachers/documents         # List own documents
POST   /api/teachers/documents         # Upload document

GET    /api/students/profile           # Student profile
PATCH  /api/students/profile           # Update student profile

GET    /api/subjects                   # List all subjects
POST   /api/subjects                   # Create subject (admin)
PATCH  /api/subjects/:id               # Update subject (admin)
DELETE /api/subjects/:id               # Delete subject (admin)

GET    /api/requests                   # List own requests (student/teacher)
POST   /api/requests                   # Create request (student)
PATCH  /api/requests/:id/accept        # Accept request (teacher)
PATCH  /api/requests/:id/reject        # Reject request (teacher)

GET    /api/favorites                  # List favorites (student)
POST   /api/favorites/:teacherId       # Add favorite
DELETE /api/favorites/:teacherId       # Remove favorite

GET    /api/conversations              # List conversations
GET    /api/conversations/:id/messages # Get message history
POST   /api/conversations/:id/read     # Mark as read

WS     /ws                             # Socket.IO for real-time chat

POST   /api/upload/avatar              # Upload avatar
POST   /api/upload/document            # Upload certificate/doc
DELETE /api/upload/:id                 # Delete upload

POST   /api/teachers/:id/report        # Submit report (student)
POST   /api/auth/heartbeat             # Update online status
GET    /api/admin/reports              # List reports (admin)
PATCH  /api/admin/reports/:id/resolve  # Resolve report (admin)

GET    /api/admin/users                # List users (admin)
PATCH  /api/admin/users/:id/suspend    # Suspend user
PATCH  /api/admin/users/:id/activate   # Activate user
GET    /api/admin/dashboard            # Basic analytics
GET    /api/admin/subjects             # Manage subjects
POST   /api/admin/subjects
PATCH  /api/admin/subjects/:id
DELETE /api/admin/subjects/:id
GET    /api/admin/documents/pending    # Pending verifications
PATCH  /api/admin/documents/:id/verify # Verify document
DELETE /api/admin/documents/:id        # Reject document
GET    /api/admin/teachers             # List teachers (admin)
PATCH  /api/admin/teachers/:id/verify  # Toggle isVerified
PATCH  /api/admin/teachers/:id/official # Toggle isOfficial
```

---

## 7. REALTIME ARCHITECTURE

### Socket.IO Setup

```
Client (Next.js) ←→ Socket.IO (NestJS Gateway) ←→ Redis Adapter ←→ PostgreSQL (messages persisted)
```

- **Redis Adapter** for horizontal scaling (multiple API instances)
- **Events:**
  - `chat:join` — Join conversation room
  - `chat:leave` — Leave conversation room
  - `chat:message` — Send message
  - `chat:received` — Server acknowledges receipt
  - `chat:read` — Mark messages as read
  - `notification:new` — Push notification to user
  - `typing:start/stop` — Typing indicators
- **Authentication:** JWT token sent during handshake, verified by gateway
- **Persistence:** Messages saved to PostgreSQL (REST for history, WS for live)

---

## 8. SECURITY STRATEGY

### Authentication
- **JWT Access Token** (15 min expiry) — short-lived, stored in memory/httpOnly cookie
- **Refresh Token** (7 day expiry) — stored in httpOnly cookie, rotated on use
- **Password Hashing:** bcrypt with 12 salt rounds
- **Session Tracking:** Each login creates a session record; users can view/revoke sessions

### Authorization (RBAC)
```
                  PUBLIC     STUDENT    TEACHER    ADMIN
Landing           ✅         ✅         ✅         ✅
Teacher Search    ✅         ✅         ✅         ✅
Teacher Profile   ✅         ✅         ✅         ✅
Register          ✅         ❌         ❌         ❌
Login             ✅         ❌         ❌         ❌
Student Dash      ❌         ✅         ❌         ✅
Teacher Dash      ❌         ❌         ✅         ✅
Admin Dash        ❌         ❌         ❌         ✅
Create Request    ❌         ✅         ❌         ❌
Manage Requests   ❌         ❌         ✅         ✅
Chat              ❌         ✅         ✅         ✅
Upload Docs       ❌         ❌         ✅         ✅
Manage Users      ❌         ❌         ❌         ✅
Manage Subjects   ❌         ❌         ❌         ✅
```

### Guards (NestJS)
- `AuthGuard` — Verifies JWT, attaches user to request
- `RolesGuard` — Checks user role against required roles
- `ThrottlerGuard` — Rate limiting per endpoint
- `SelfGuard` — Ensures user can only access own resources

### Input Validation
- **DTOs** with `class-validator` decorators
- **File validation** (mime type, size, dimensions via sharp)
- **XSS prevention** via helmet + input sanitization
- **SQL injection** prevented by Prisma parameterized queries

### Rate Limiting
- Global: 100 requests/min per IP
- Auth endpoints: 10 requests/min per IP
- Chat WebSocket: 30 messages/min per user
- File upload: 5 uploads/min per user

---

## 9. LOGGING STRATEGY

### NestJS Logger (Custom)

```typescript
enum LogLevel {
  DEBUG = 'debug',
  INFO = 'info',
  WARN = 'warn',
  ERROR = 'error',
}
```

- **Output:** JSON lines to stdout (docker-friendly)
- **Format:** `{ timestamp, level, context, message, meta? }`
- **No file logging** in containers (stdout is container standard)
- **Async, non-blocking** — no external logging service in Phase 1
- **Sensitive data filtering** — passwords, tokens masked in logs
- **HTTP logging** via NestJS interceptor (method, url, status, duration)
- **WebSocket logging** via gateway interceptor

---

## 10. UPLOAD STRATEGY

### Phase 1: Local VPS Storage

```
/uploads/
  avatars/
    {userId}_{timestamp}.webp
  documents/
    {userId}_{uuid}.{ext}
```

- Images resized to max 400x400 (avatars) via sharp
- Documents (PDF, images) stored as-is with secure UUID filenames
- MIME validation: images (JPEG, PNG, WebP), documents (PDF, DOC, DOCX)
- Max file sizes: avatars 2MB, documents 10MB
- Served directly by Nginx in production (not through Node.js)

### Future: S3-Compatible Storage
- Replace local `fs` module with `@aws-sdk/client-s3`
- Same interface via StorageService abstraction
- Plugins for S3, Cloudflare R2, MinIO

---

## 11. DOCKER STRATEGY

### Images

| Service | Base Image | Notes |
|---------|-----------|-------|
| api | node:24-alpine | NestJS production build |
| web | node:24-alpine | Next.js standalone output |
| postgres | postgres:17-alpine | With init SQL |
| redis | redis:7-alpine | Default config |

### Docker Compose Layout

```yaml
services:
  postgres:
    image: postgres:17-alpine
    volumes: [postgres_data:/var/lib/postgresql/data]
    environment:
      POSTGRES_DB: oustadi
      POSTGRES_USER: oustadi
      POSTGRES_PASSWORD: ${DB_PASSWORD}

  redis:
    image: redis:7-alpine
    volumes: [redis_data:/data]
    command: redis-server --appendonly yes

  api:
    build:
      context: .
      dockerfile: infra/docker/Dockerfile.api
    depends_on: [postgres, redis]
    environment:
      DATABASE_URL: postgresql://oustadi:${DB_PASSWORD}@postgres:5432/oustadi
      REDIS_URL: redis://redis:6379
    ports: ["3001:3000"]
    volumes: [uploads:/app/apps/api/uploads]

  web:
    build:
      context: .
      dockerfile: infra/docker/Dockerfile.web
    depends_on: [api]
    ports: ["3000:3000"]

  nginx:
    image: nginx:1.27-alpine
    volumes:
      - ./infra/docker/nginx/nginx.conf:/etc/nginx/nginx.conf
      - uploads:/var/www/uploads
      - ./infra/docker/nginx/ssl:/etc/nginx/ssl
    ports: ["80:80", "443:443"]
    depends_on: [web, api]

volumes:
  postgres_data:
  redis_data:
  uploads:
```

---

## 12. NGINX CONFIGURATION

### Production nginx.conf

```nginx
upstream web {
    server web:3000;
}

upstream api {
    server api:3000;
}

server {
    listen 80;
    server_name oustadi.ma www.oustadi.ma;
    return 301 https://$server_name$request_uri;
}

server {
    listen 443 ssl http2;
    server_name oustadi.ma www.oustadi.ma;

    ssl_certificate     /etc/nginx/ssl/fullchain.pem;
    ssl_certificate_key /etc/nginx/ssl/privkey.pem;
    ssl_protocols       TLSv1.2 TLSv1.3;
    ssl_ciphers         HIGH:!aNULL:!MD5;
    ssl_prefer_server_ciphers on;
    ssl_session_cache   shared:SSL:10m;
    ssl_session_timeout 10m;

    # Security headers
    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header X-XSS-Protection "1; mode=block" always;
    add_header Strict-Transport-Security "max-age=31536000; includeSubDomains" always;
    add_header Referrer-Policy "strict-origin-when-cross-origin" always;
    add_header Permissions-Policy "camera=(), microphone=(), geolocation=()" always;

    # Uploaded files
    location /uploads/ {
        alias /var/www/uploads/;
        expires 30d;
        add_header Cache-Control "public, immutable";
    }

    # API reverse proxy
    location /api/ {
        proxy_pass http://api;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }

    # Socket.IO
    location /ws/ {
        proxy_pass http://api;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "upgrade";
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_read_timeout 86400;
    }

    # Web frontend
    location / {
        proxy_pass http://web;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }

    # Deny access to hidden files
    location ~ /\. {
        deny all;
        access_log off;
        log_not_found off;
    }

    client_max_body_size 10M;
}
```

---

## 13. SSL STRATEGY

### Local Development
- Self-signed certificates for local HTTPS testing
- Generated via `openssl` in setup script

### Production (Ubuntu VPS)
- **Let's Encrypt** via Certbot
- Auto-renewal via systemd timer
- `certbot certonly --webroot -d oustadi.ma -d www.oustadi.ma`
- SSL termination at Nginx level

---

## 14. ENVIRONMENT STRATEGY

### Environment Files

| File | Purpose |
|------|---------|
| `.env.example` | Template with all vars documented |
| `.env.local` | Local development overrides |
| `.env.production` | Production secrets (never committed) |

### Key Variables

```
# Database
DATABASE_URL=postgresql://oustadi:PASSWORD@localhost:5432/oustadi

# Redis
REDIS_URL=redis://localhost:6379

# JWT
JWT_SECRET=<random-64-char>
JWT_ACCESS_EXPIRY=15m
JWT_REFRESH_EXPIRY=7d

# App
NODE_ENV=development
API_URL=http://localhost:3001
WEB_URL=http://localhost:3000

# Upload
UPLOAD_DIR=./uploads
MAX_FILE_SIZE=10485760

# Email (future)
SMTP_HOST=
SMTP_PORT=587
SMTP_USER=
SMTP_PASS=

# NextAuth/Next.js
NEXT_PUBLIC_API_URL=http://localhost:3001/api
```

---

## 15. DEPLOYMENT STRATEGY (Ubuntu VPS)

```
┌─────────────┐     ┌──────────────┐     ┌─────────────┐
│  Developer   │────▶│   GitHub     │────▶│  VPS (DO)   │
│  (Windows)   │     │   (main)     │     │  Ubuntu 24  │
└─────────────┘     └──────────────┘     └─────────────┘
                                              │
                                         ┌────▼────┐
                                         │  Docker  │
                                         │ Compose  │
                                         └─────────┘
```

### Deployment Steps
1. Push to `main` branch
2. GitHub Actions builds Docker images
3. Secure copy to VPS via SSH
4. `docker compose -f infra/docker-compose.prod.yml up -d`
5. Nginx serves as reverse proxy with SSL termination

---

## 16. SYSTEM FLOWS

### Auth Flow
```
1. User visits /login or /register
2. Submits credentials
3. API validates → creates/verifies user → returns JWT + refresh token
4. Tokens stored as httpOnly cookies
5. Next.js middleware checks auth on protected routes → redirects if invalid
6. On 401 → refresh token automatically called → new access token issued
7. On refresh failure → redirect to /login
```

### Teacher Profile Creation Flow
```
1. Teacher registers → role=TEACHER
2. Redirected to /teacher/profile/create
3. Fills bio, subjects, levels, price, city, teaching mode, availability
4. Uploads avatar + certificates
5. Profile becomes visible in search
6. Can edit anytime from dashboard
```

### Lesson Request Flow
```
1. Student browses teachers → opens profile
2. Clicks "Send Request" → fills form (subject, message, proposed schedule)
3. Teacher receives notification (in-app)
4. Teacher reviews → Accepts or Rejects
5. Student notified of decision
6. If accepted → chat becomes available
```

### Chat Flow
```
1. After request accepted → student & teacher can chat
2. Conversation created on first message
3. Messages sent via Socket.IO → persisted to DB
4. Read/unread states tracked per message
5. Conversation list shows last message preview + unread count
6. Both sides can see full history
```

### Search Flow
```
1. Student lands on /teachers
2. Can search by keyword (PostgreSQL full-text search on name, bio, city)
3. Filters: subject, city, max price, min experience, teaching mode
4. Results paginated with cursor-based pagination
5. Can sort by: relevance, price (low/high), experience
```

---

## 17. RBAC MATRIX

| Route / Action | Guest | Student | Teacher | Admin |
|---------------|-------|---------|---------|-------|
| View landing | ✅ | ✅ | ✅ | ✅ |
| Register | ✅ | ❌ | ❌ | ❌ |
| Login | ✅ | ❌ | ❌ | ❌ |
| List teachers | ✅ | ✅ | ✅ | ✅ |
| View teacher profile | ✅ | ✅ | ✅ | ✅ |
| Search teachers | ✅ | ✅ | ✅ | ✅ |
| Create profile | ❌ | ❌ | ✅ | ✅ |
| Edit own profile | ❌ | ❌ | ✅ | ✅ |
| Manage subjects | ❌ | ❌ | ✅ | ✅ |
| Upload documents | ❌ | ❌ | ✅ | ✅ |
| Send request | ❌ | ✅ | ❌ | ❌ |
| Accept/reject requests | ❌ | ❌ | ✅ | ✅ |
| View own requests | ❌ | ✅ | ✅ | ✅ |
| Chat | ❌ | ✅* | ✅* | ✅ |
| Add favorites | ❌ | ✅ | ❌ | ❌ |
| Report user | ❌ | ✅ | ✅ | ✅ |
| View dashboard (own) | ❌ | ✅ | ✅ | ✅ |
| Manage all users | ❌ | ❌ | ❌ | ✅ |
| Manage subjects | ❌ | ❌ | ❌ | ✅ |
| Manage reports | ❌ | ❌ | ❌ | ✅ |
| View analytics | ❌ | ❌ | ❌ | ✅ |
| Verify documents | ❌ | ❌ | ❌ | ✅ |

*Chat only with connected party (accepted request)

---

## 18. SCALABILITY ROADMAP

```
Phase 1 (Now)
├── Monolith API (NestJS) — single instance
├── PostgreSQL — single instance
├── Redis — single instance
├── No CDN, local uploads
└── Single VPS

Phase 2 (Growth)
├── API horizontal scaling (multiple instances behind Nginx)
├── Redis adapter for Socket.IO multi-instance
├── S3-compatible storage (R2/MinIO)
├── Read replicas for PostgreSQL
└── Add CDN for static assets

Phase 3 (Scale)
├── Kubernetes (if needed)
├── PostgreSQL connection pooling (PgBouncer)
├── Separate Redis for cache vs sessions
├── Multi-region (if needed)
└── Monitoring (Grafana + Prometheus)
```

---

## 19. ORPHANS & PENDING

| Item | Status | Notes |
|------|--------|-------|
| Email service (verification, forgot password) | 🔴 Deferred | SMTP integration — needs email provider |
| Push notifications | 🔴 Deferred | Phase 2 with mobile apps |
| Reviews & ratings | 🔴 Deferred | Phase 2, requires moderation system |
| Advanced admin analytics (charts) | 🔴 Deferred | Phase 2 with Recharts integration |
| OAuth (Google, Facebook) | 🔴 Deferred | Phase 2 after core auth stable |
| Mobile apps | 🔴 Deferred | Phase 3 or separate project |
| AI teacher matching | 🔴 Deferred | Needs data first |
| Error monitoring (Sentry) | 🔴 Deferred | Phase 1.5 |
| Testing (Jest + Playwright) | 🟡 Planning | To be implemented |
| Social links management in teacher dashboard | ✅ Complete | All 5 social link fields, form in teacher profile page |
| Online status display in chat | ✅ Complete | Green dot + "En ligne" in conversation list + header |
| Admin teacher verification management | ✅ Complete | `/admin/teachers` page with isVerified/isOfficial toggles |
| i18n message interpolation in components | 🟡 Partial | JSON files exist, dynamic switching pending |
| Teacher profile create/edit form UI | 🟡 Partial | Backend complete, frontend form pending |
| Admin user management UI | ✅ Complete | Full UI for listing/suspending/activating users |
| Admin subjects management UI | ✅ Complete | Full UI for subject CRUD |
| Admin reports management UI | ✅ Complete | Listing + resolving reports |
| Admin document verification UI | ✅ Complete | View/verify/reject documents |
| File upload UI components | 🟡 Partial | Backend complete, frontend uploaders pending |
| Dispute system — timeline (user + admin) | ✅ Complete | Timeline with real booking/dispute events, i18n keys added |
| Dispute system — booking flow lock | ✅ Complete | Guards prevent confirm/dispute during active disputes; bookingStatus='resolved' on resolve |
| Dispute system — status sync on resolve | ✅ Complete | `resolveDispute` now updates bookingStatus to 'resolved', synced across all user roles |

---

## 20. MILESTONES

### M1: Foundation (Week 1-2) ✅ COMPLETE

**Objective:** Set up monorepo, Docker, database schema, basic API skeleton

**Deliverables:**
- [x] Turborepo monorepo with pnpm workspaces
- [x] Docker Compose with PostgreSQL + Redis
- [x] Prisma schema with all 15 models + seed script
- [x] NestJS project with all 10 modules (Auth, Users, Teachers, Students, Subjects, Requests, Chat, Upload, Notifications, Admin)
- [x] Next.js project with Tailwind CSS + custom UI components
- [x] RTL layout + i18n JSON files (ar/fr)
- [x] Dockerfiles (web, api, nginx) + compose files (dev + prod)
- [x] Nginx config with SSL, security headers, reverse proxy
- [x] GitHub Actions CI workflow
- [x] Health check endpoint
- [x] Error pages (404, error boundary)
- [x] Common layer (guards, decorators, filters, interceptors)

**Verification:** Code structure complete. Awaiting `pnpm install && docker compose up` for runtime validation.

---

### M2: Auth System ✅ COMPLETE

**Deliverables:**
- [x] Register/Login/Logout endpoints with DTO validation
- [x] JWT access (15min) + refresh token rotation (7d)
- [x] Session tracking (create/revoke on refresh)
- [x] Rate limiting (ThrottlerModule — 100/min global, 10/min auth)
- [x] Next.js AuthProvider context + middleware (protected routes)
- [x] Login + Register pages with form validation
- [x] JWT Strategy (Passport) with auto-refresh on 401
- [x] RBAC guards (RolesGuard, Roles decorator)
- [x] Password hashing (bcrypt, 12 rounds)

**Verification:** All auth endpoints implemented. Runtime testing with pnpm dev required.

---

### M3: Teacher Profiles ✅ COMPLETE

**Deliverables:**
- [x] Teacher profile CRUD (backend + public view page)
- [x] Subject assignment with levels + per-subject pricing
- [x] Availability slots CRUD (days, start/end times)
- [x] Avatar upload → resized to 400x400 WebP via sharp
- [x] Certificate/document upload → UUID filenames
- [x] File validation (MIME types, size limits)
- [x] Public teacher profile page with request form
- [x] Teacher search with filters (name, city, subject, price, experience, mode)
- [x] Cursor-based pagination

**Pending:**
- [ ] Teacher profile create/edit form UI (frontend form)
- [ ] File upload UI components in frontend

---

### M4: Student Features ✅ COMPLETE

**Deliverables:**
- [x] Teacher search with filters (backend)
- [x] Cursor-based pagination
- [x] Favorites add/remove/list (backend + frontend toggle)
- [x] Lesson request flow (send → pending → accept/reject)
- [x] Student dashboard with request status overview
- [x] Teacher directory page (frontend, with search/filter)
- [x] Teacher profile page with request form

**Pending:**
- [ ] PostgreSQL full-text search index (requires migration run)

---

### M5: Real-time Chat ✅ COMPLETE

**Deliverables:**
- [x] Socket.IO gateway with JWT auth (handshake token verification)
- [x] Conversation list (REST)
- [x] Message history (REST)
- [x] Real-time messaging (WS → persist to PostgreSQL)
- [x] Read/unread states (tracked per message)
- [x] Typing indicators (start/stop events)
- [x] Chat UI with conversation sidebar
- [x] Auto-scroll on new messages
- [x] User connection tracking (Map<userId, socketIds[]>)

**Verification:** WS events: chat:join, chat:leave, chat:message, chat:read, chat:received, typing:start, typing:stop

---

### M6: Admin Panel ✅ COMPLETE

**Deliverables:**
- [x] Admin dashboard with stats (users, teachers, students, requests, pending docs, reports)
- [x] User management list (backend)
- [x] User suspend/activate (JWT strategy blocks suspended users)
- [x] Subject CRUD (backend)
- [x] Report management (list, resolve)
- [x] Document verification workflow
- [x] Admin layout with sidebar navigation
- [x] RolesGuard protecting all admin routes (Role.ADMIN required)

**Pending Frontend UIs:**
- [ ] Admin full user list UI
- [ ] Admin subjects management UI
- [ ] Admin reports management UI
- [ ] Admin document verification UI

---

### M7: Polish & Deploy 🟡 In Progress

**Completed:**
- [x] Docker production compose file
- [x] Nginx config with SSL, security headers
- [x] GitHub Actions CI workflow
- [x] SEO metadata (Open Graph, meta tags in root layout)
- [x] Skeleton loaders (teacher directory)
- [x] Empty states (no results, no conversations, no requests)
- [x] Error boundary (error.tsx)
- [x] 404 page
- [x] Social links management in teacher dashboard
- [x] Online status display in chat
- [x] Admin teacher verification (isVerified/isOfficial toggle)
- [x] Share profile button with navigator.share + clipboard fallback
- [x] Report teacher system with admin resolution
- [x] Fixed critical search bug (isVerified: false → removed filter)
- [x] Fixed teacher profile navigation from student requests (was using User.id instead of TeacherProfile.id)
- [x] Inline review form on teacher profile page (replaced modal, shows for students with completed lessons)
- [x] Fixed canReview logic: /requests returns { sent, received } object, not array

**Pending:**
- [ ] Production deployment on Ubuntu VPS
- [ ] `docker compose -f docker-compose.prod.yml up` verification
- [ ] Let's Encrypt SSL certificate setup
- [ ] SSH deployment automation (GitHub Actions CD)
- [ ] Lighthouse audit and performance tuning
- [ ] WebSocket over WSS testing

---

## 21. TECHNICAL DECISION RATIONALE

| Decision | Choice | Alternatives | Rationale |
|----------|--------|-------------|-----------|
| Monorepo | Turborepo + pnpm | Nx, Lerna | Simpler than Nx, native pnpm support, excellent caching |
| ORM | Prisma | Drizzle, TypeORM | Best DX, type safety, migrations, popular in SaaS |
| Search | PostgreSQL FTS | Elasticsearch, Algolia | Zero additional infra, sufficient for Phase 1 scale |
| Real-time | Socket.IO | WebSocket native, SSE | Auto-fallback, rooms, Redis adapter for scaling |
| UI Framework | shadcn/ui | MUI, Ant Design | Copy-paste = no dependency lock, full customization |
| i18n | next-intl | react-i18next, next-i18next | First-class App Router support, RTL, simple API |
| File storage | Local (Phase 1) | S3, R2 | Simplest start, abstracted for future swap |
| Auth | JWT + Passport | NextAuth.js, Clerk | Full control, same pattern front+back, no vendor lock |
| Validation | class-validator (backend), zod (frontend) | Joi, yup | class-validator integrates with NestJS naturally; zod is ideal for frontend/API boundaries |
| Forms | react-hook-form + zod | Formik, React Aria | Best performance (uncontrolled), easy validation coupling |

---

## APPENDIX: Folder Creation Order

For implementation, create files in this dependency order:

```
1. Root config files (package.json, pnpm-workspace.yaml, turbo.json, tsconfig.base.json)
2. Infra (docker-compose.yml, Dockerfiles, nginx.conf)
3. packages/types, packages/shared, packages/config, packages/ui
4. apps/api (Prisma schema → modules → controllers → services)
5. apps/web (layout → pages → components)
6. .github/workflows
7. docs/
```

---

> **End of PROJECT_MAP.md**
> This document is a living artifact. Update as decisions change.
