# FinApply.ai — Complete Workflow Implementation Plan

> **For agentic workers:** Use superpowers:executing-plans to implement task-by-task.

**Goal:** Wire AI evaluation, PDF reports, Make.com email, admin override, and feedback into FinApply.

**Architecture:** Claude API scores submissions → admin overrides in dashboard → PDF generated via `@react-pdf/renderer` → Make.com webhook sends email → candidate views report + submits feedback.

**Tech Stack:** Anthropic SDK, `@react-pdf/renderer`, Make.com webhooks, Supabase, Next.js.

---

## Phase 1: AI Evaluation Engine (Tasks 1-4)

### Task 1: Evaluation prompt + types

**Files:** Create `lib/evaluation/prompt.ts`, `lib/evaluation/types.ts`

- [ ] Create `ClaudeEvaluationResult` interface with all fields from the spec (fr_score, st_score, ri_score, dc_score, grades, rationales, evidence, improvements, standout_strength, critical_gap, one_line_summary, ai_generated_flag, etc.)
- [ ] Create `buildEvaluationPrompt(input)` function — interpolates case context, role weights, candidate response into the full prompt from PART 4 of the spec
- [ ] Commit: `feat: add Claude evaluation prompt builder and types`

### Task 2: Evaluate API route

**Files:** Create `app/api/admin/evaluate/route.ts`. Install `@anthropic-ai/sdk`.

- [ ] `npm install @anthropic-ai/sdk`
- [ ] POST handler: fetch simulation + application from Supabase, resolve case via `getCaseByCode()`, build prompt, call Claude (`claude-sonnet-4-20250514`), parse JSON, insert into `fiss_reports`, update status to `scored`
- [ ] Env var needed: `ANTHROPIC_API_KEY`
- [ ] Commit: `feat: add Claude evaluation API route`

### Task 3: "AI Evaluate" button in admin

**Files:** Modify `app/admin/page.tsx`

- [ ] Add 🤖 AI Evaluate button for `submitted` candidates next to existing Score button
- [ ] Button calls `POST /api/admin/evaluate`, shows spinner, refreshes on success
- [ ] Commit: `feat: add AI Evaluate button to admin`

### Task 4: Admin override modal

**Files:** Modify `app/admin/page.tsx`, add PATCH to `app/api/admin/score/route.ts`

- [ ] Replace simple score modal with full override modal showing all 4 dimension scores, grades, rationales, evidence, improvements — all editable
- [ ] Add PATCH handler to update existing `fiss_reports` row + set `override_by`/`override_at`
- [ ] Commit: `feat: admin override modal with full FISS editing`

---

## Phase 2: PDF Report Generation (Tasks 5-7)

### Task 5: PDF template

**Files:** Create `lib/report/pdf-template.tsx`. Install `@react-pdf/renderer`.

- [ ] `npm install @react-pdf/renderer`
- [ ] Build 5-page PDF: Cover (score ring, name, cohort) → Summary (evaluator quote) → Dimensions (2x2 grid with scores, grades, rationale, evidence, improvement) → Insights (standout strength + critical gap) → Footer (disclaimer, web report link)
- [ ] Design: black background, white text, same grade colors as web
- [ ] Commit: `feat: server-side PDF report template`

### Task 6: PDF generation API

**Files:** Create `app/api/admin/generate-report/route.ts`

- [ ] POST handler: fetch data, render PDF via `renderToBuffer()`, upload to Supabase Storage `reports` bucket, store URL in `fiss_reports.pdf_url`
- [ ] Supabase migration: `ALTER TABLE fiss_reports ADD COLUMN pdf_url TEXT;`
- [ ] Commit: `feat: PDF generation API with Supabase storage`

### Task 7: "Generate PDF" button in admin

**Files:** Modify `app/admin/page.tsx`

- [ ] Add 📄 Generate PDF button for `scored` candidates
- [ ] Commit: `feat: add Generate PDF button`

---

## Phase 3: Make.com Email Automation (Tasks 8-10)

### Task 8: Webhook receiver for new applications

**Files:** Create `app/api/webhooks/make/application/route.ts`

- [ ] POST handler: validates `webhook_secret`, generates `deal_room_token`, inserts into Supabase, returns `{ application_id, deal_room_token }`
- [ ] Env var: `MAKE_WEBHOOK_SECRET`
- [ ] Commit: `feat: Make.com webhook for Tally submissions`

### Task 9: Send report webhook

**Files:** Create `app/api/admin/send-report/route.ts`, modify `app/admin/page.tsx`

- [ ] POST handler: fetches data, calls Make.com webhook (`MAKE_SEND_REPORT_WEBHOOK`) with candidate info + PDF URL + report link, updates status to `report_sent`
- [ ] Add 📧 Send Report button in admin for scored candidates with PDF
- [ ] Commit: `feat: send report via Make.com webhook`

### Task 10: Make.com scenario setup (no code — user config)

**Scenario 1 — New Application:** Tally trigger → HTTP POST to webhook → Notion create row → Email admin notification

**Scenario 2 — Accept:** Notion status → "Accepted" → Email candidate acceptance with Deal Room link

**Scenario 3 — Reject:** Notion status → "Rejected" → Email candidate rejection

**Scenario 4 — Send Report:** Webhook trigger → Email candidate report with PDF attachment

---

## Phase 4: Feedback Form (Tasks 11-12)

### Task 11: Feedback form

**Files:** Create `app/api/feedback/route.ts`, modify `app/report/[token]/page.tsx`

- [ ] Create `feedback` table in Supabase (accuracy_rating, usefulness_rating, would_recommend, open_feedback)
- [ ] POST handler inserts feedback
- [ ] Add feedback section after report footer: star ratings, yes/no toggle, textarea, submit button
- [ ] Commit: `feat: candidate feedback form on report page`

### Task 12: LinkedIn URL field

**Files:** Modify `lib/types.ts`, modify `app/admin/page.tsx`

- [ ] Add `linkedin_url: string` to Application interface
- [ ] Show LinkedIn icon link in admin candidate row
- [ ] Supabase: `ALTER TABLE applications ADD COLUMN linkedin_url TEXT;`
- [ ] Commit: `feat: add LinkedIn URL to applications`

---

## Supabase Migrations

```sql
ALTER TABLE applications ADD COLUMN linkedin_url TEXT;
ALTER TABLE fiss_reports ADD COLUMN pdf_url TEXT;
ALTER TABLE fiss_reports ADD COLUMN override_by TEXT;
ALTER TABLE fiss_reports ADD COLUMN override_at TIMESTAMPTZ;

CREATE TABLE feedback (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  application_id UUID REFERENCES applications(id),
  accuracy_rating INT CHECK (accuracy_rating BETWEEN 1 AND 5),
  usefulness_rating INT CHECK (usefulness_rating BETWEEN 1 AND 5),
  would_recommend BOOLEAN,
  open_feedback TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
```

## Environment Variables

```env
ANTHROPIC_API_KEY=sk-ant-...
MAKE_WEBHOOK_SECRET=your-random-secret
MAKE_SEND_REPORT_WEBHOOK=https://hook.make.com/...
```

## Execution Order

| Phase | Tasks | Needs | Time |
|-------|-------|-------|------|
| 1: AI Eval | 1-4 | Anthropic key | 2-3h |
| 2: PDF | 5-7 | Phase 1 | 2-3h |
| 3: Email | 8-10 | Make.com account | 1-2h |
| 4: Feedback | 11-12 | Phase 2 | 1h |

**Total: ~7-9 hours**
