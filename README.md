# FinApply.ai

**The Financial Intelligence Simulation Platform** — Where finance careers begin with proof, not promises.

FinApply.ai is an AI-powered assessment platform that evaluates candidates for finance roles (Investment Banking, Private Equity, Big 4 Advisory, Equity Research, Corporate Finance) through realistic deal simulations and produces a **FISS (Financial Intelligence Simulation Score)** report — a standardized, shareable credential.

---

## ✨ Live Demo

🌐 **[finapply-ai-delta.vercel.app](https://finapply-ai-delta.vercel.app)**

---

## 🏗️ Architecture

```
FinApply.ai
├── 🎯 Public Platform
│   ├── Landing Page — Premium dark-mode UI with 3D icosahedron, motion animations
│   ├── Deal Simulation Room — Timed case-based financial simulations
│   ├── FISS Report (Sample) — Interactive score report with dimension breakdown
│   └── FISS Report (Token) — Real candidate reports via unique URLs
│
├── 🔐 Admin Dashboard (Invisible Admin Architecture)
│   ├── Candidate Pipeline — Review, evaluate, and manage applicants
│   ├── AI Evaluation Engine — Claude-powered FISS scoring
│   ├── Email System — Automated notifications via Resend
│   └── Calibration Tools — Score consistency tracking
│
├── 🧠 AI Evaluation Engine
│   ├── Prompt Engineering — Role-specific evaluation prompts
│   ├── Case Library — 25+ curated deal simulations (IB, PE, B4, ER, CF)
│   └── Scoring Framework — 4 dimensions × 25 points = 100 total
│
└── 📊 FISS Score Framework
    ├── Financial Reasoning (0-25)
    ├── Structured Thinking (0-25)
    ├── Risk Identification (0-25)
    └── Decision Clarity (0-25)
```

### System Flow

```
                    ┌──────────────┐
                    │  Candidate   │
                    │  Registers   │
                    └──────┬───────┘
                           │
                    ┌──────▼───────┐        ┌─────────────┐
                    │   Supabase   │◄──────►│   Resend    │
                    │  (Database)  │        │  (Email)    │
                    └──────┬───────┘        └─────────────┘
                           │
                    ┌──────▼───────┐
                    │ Deal Room    │
                    │ (Simulation) │
                    └──────┬───────┘
                           │
              ┌────────────▼────────────┐
              │   Admin Evaluates       │
              │   (Claude AI + Human)   │
              └────────────┬────────────┘
                           │
              ┌────────────▼────────────┐
              │   FISS Report Generated │
              │   (Vector PDF Export)   │
              └─────────────────────────┘
```

---

## 🛠️ Tech Stack

| Layer | Technology | Purpose |
|-------|-----------|---------|
| **Framework** | Next.js 15 (App Router) | Full-stack React with SSR |
| **Language** | TypeScript | Type safety |
| **Database** | Supabase (PostgreSQL) | Data storage + Auth |
| **AI Engine** | Claude (Anthropic SDK) | Candidate evaluation |
| **Email** | Resend | Transactional emails |
| **PDF** | jsPDF (Programmatic) | Vector PDF generation |
| **3D/Motion** | Three.js + Anime.js | Landing page effects |
| **Hosting** | Vercel | Edge deployment |
| **Styling** | Vanilla CSS | Custom dark-mode design system |

---

## 📁 Project Structure

```
FinApply.Ai/
├── app/
│   ├── page.tsx                    # Landing page (public)
│   ├── layout.tsx                  # Root layout
│   ├── globals.css                 # Design system & animations
│   ├── admin/                      # Protected admin dashboard
│   ├── confirmation/               # Post-registration confirmation
│   ├── dealroom/                   # Deal simulation room
│   ├── login/                      # Admin login (invisible)
│   ├── outcome/                    # Simulation outcome page
│   ├── report/
│   │   ├── page.tsx                # Sample FISS report
│   │   └── [token]/page.tsx        # Dynamic candidate report
│   ├── sample-report/              # Legacy sample report
│   └── api/
│       ├── register/               # Public registration endpoint
│       ├── admin/
│       │   ├── evaluate/           # Claude AI evaluation
│       │   ├── generate-report/    # FISS report generation
│       │   ├── send-report/        # Email report to candidate
│       │   ├── send-followup/      # Follow-up emails
│       │   ├── send-email/         # Custom email sender
│       │   ├── calibration-log/    # Score calibration tracking
│       │   ├── candidates/         # Candidate CRUD
│       │   ├── score/              # Manual scoring
│       │   └── test-dealroom/      # Test deal room tokens
│       ├── applications/           # Application listing
│       ├── dealroom/               # Deal room API
│       ├── employer-waitlist/      # Employer interest capture
│       ├── feedback/               # User feedback
│       ├── outcome/                # Outcome recording
│       ├── setup-admin/            # Initial admin setup
│       ├── simulations/            # Simulation management
│       └── webhooks/               # External webhook handlers
├── components/
│   ├── landing/                    # Landing page sections
│   │   ├── Hero.tsx                # Hero with 3D icosahedron
│   │   ├── Navbar.tsx              # Navigation bar
│   │   ├── HowItWorks.tsx          # Process explanation
│   │   ├── FissPreview.tsx         # FISS score preview
│   │   ├── ApplySection.tsx        # Registration form
│   │   ├── EmployerSection.tsx     # Employer CTA
│   │   └── Footer.tsx              # Footer
│   ├── effects/                    # Visual effect components
│   ├── report/                     # Report UI components
│   └── ui/                         # Shared UI primitives
├── lib/
│   ├── cases/                      # Deal simulation case library
│   │   ├── index.ts                # Case router & resolver
│   │   ├── types.ts                # Case type definitions
│   │   ├── ib.ts                   # Investment Banking cases
│   │   ├── pe.ts                   # Private Equity cases
│   │   ├── b4.ts                   # Big 4 Advisory cases
│   │   ├── er.ts                   # Equity Research cases
│   │   └── cf.ts                   # Corporate Finance cases
│   ├── evaluation/                 # AI evaluation engine
│   │   ├── prompt.ts               # Evaluation prompt builder
│   │   └── types.ts                # Evaluation result types
│   ├── supabase/                   # Supabase client configs
│   │   ├── client.ts               # Browser client
│   │   └── server.ts               # Server client (SSR)
│   ├── report/                     # Report utilities
│   ├── email.ts                    # Email template system
│   ├── generatePdf.ts              # Programmatic PDF generator
│   ├── types.ts                    # Shared type definitions
│   └── constants.ts                # App constants
├── middleware.ts                    # Auth & route protection
├── .env.local                      # Environment variables (not committed)
├── package.json
├── tsconfig.json
└── next.config.ts
```

---

## 🧠 FISS Scoring System

The **Financial Intelligence Simulation Score** evaluates candidates across 4 dimensions:

| Dimension | Weight | What It Measures |
|-----------|--------|-----------------|
| **Financial Reasoning** | 25 pts | Accuracy of financial analysis, valuation logic, number sense |
| **Structured Thinking** | 25 pts | Framework application, logical flow, prioritization |
| **Risk Identification** | 25 pts | Ability to spot risks, regulatory awareness, downside scenarios |
| **Decision Clarity** | 25 pts | Actionable recommendations, conviction, communication |

### Grade Bands

| Grade | Score Range | Color |
|-------|-----------|-------|
| Strong | 20-25 | 🟢 Green |
| Adequate | 14-19 | 🔵 Blue |
| Developing | 8-13 | 🟡 Amber |
| Critical Gap | 0-7 | 🔴 Red |

---

## 📋 Case Library

25+ curated deal simulations across 5 finance tracks:

| Track | Code | Example Cases |
|-------|------|--------------|
| **Investment Banking** | IB-001 to IB-005 | Cross-border M&A, IPO pricing, distressed debt |
| **Private Equity** | PE-001 to PE-005 | LBO modeling, portfolio turnaround, exit strategy |
| **Big 4 Advisory** | B4-001 to B4-005 | Due diligence, transaction advisory, restructuring |
| **Equity Research** | ER-001 to ER-005 | Sector analysis, earnings preview, initiating coverage |
| **Corporate Finance** | CF-001 to CF-005 | Capital allocation, treasury management, FP&A |

Each case includes:
- Scenario briefing with financial data
- Time-pressured deliverables
- Admin-only rubric (strong response benchmarks, critical gaps, non-obvious signals)

---

## 🚀 Getting Started

### Prerequisites

- Node.js 18+
- npm or yarn
- Supabase account
- Resend account (for emails)
- Anthropic API key (for AI evaluation)

### Installation

```bash
# Clone the repository
git clone https://github.com/chinmaykhatri/FinApply.Ai.git
cd FinApply.Ai

# Install dependencies
npm install

# Set up environment variables
cp .env.example .env.local
# Edit .env.local with your keys (see Environment Variables below)

# Start development server
npm run dev
```

### Environment Variables

Create a `.env.local` file with:

```env
# Supabase (Required)
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key

# Resend — Email delivery (Required for notifications)
RESEND_API_KEY=re_xxxxxxxxxxxx

# Anthropic — AI evaluation engine (Required for FISS scoring)
ANTHROPIC_API_KEY=sk-ant-xxxxxxxxxxxx

# App Configuration
NEXT_PUBLIC_APP_URL=https://your-domain.vercel.app
MAKE_WEBHOOK_SECRET=your-webhook-secret
```

### Database Setup

The app uses Supabase with these core tables:

| Table | Purpose |
|-------|---------|
| `applications` | Candidate registrations & status tracking |
| `simulations` | Deal room submissions |
| `fiss_reports` | AI-generated evaluation reports |
| `employer_waitlist` | Employer interest list |

---

## 🎨 Design System

The platform uses a custom dark-mode design system with:

- **Background**: `#08080C` (near-black)
- **Primary**: `#2563EB` (electric blue)
- **Accent**: Dynamic per-score theming (green/blue/amber/red)
- **Typography**: System fonts optimized for financial data
- **Motion**: Anime.js-powered staggered animations, scroll-triggered reveals
- **3D**: Three.js wireframe icosahedron with bloom post-processing

### PDF Export

FISS Reports can be downloaded as high-fidelity vector PDFs:
- Programmatic generation via jsPDF (no screenshot/rasterization)
- Text-selectable content
- Dark-mode styling matching the web UI
- Multi-page support with automatic page breaks

---

## 🔐 Security

- **Invisible Admin**: No public `/admin` link — access via direct URL with Supabase Auth
- **Row Level Security**: Supabase RLS policies on all tables
- **Middleware Protection**: Admin routes protected via Next.js middleware
- **Token-Based Access**: Deal Room and Report pages use UUID tokens
- **Environment Isolation**: All secrets in `.env.local` (never committed)

---

## 📦 Deployment

### Vercel (Recommended)

```bash
# Install Vercel CLI
npm i -g vercel

# Deploy
vercel --prod
```

Set environment variables in Vercel Dashboard → Settings → Environment Variables.

---

## 📄 License

Proprietary. All rights reserved.

---

<p align="center">
  <strong>FinApply.ai</strong> — Proving financial talent through simulation, not resumes.
</p>
