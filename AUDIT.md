# NIRMAAN (GPOMS) — Repository Audit Report

**Date:** March 2026 / Academic Project Review  
**Auditor:** Antigravity AI  
**Scope:** Architecture, Authentication, Database Schema, API Routes, Frontend Pages, Navigation & Tests  

---

## 1. Executive Summary

NIRMAAN is a full-stack Next.js 16 (App Router) web application created as an academic prototype for transparent government project finance, milestone management, and multi-tier approval workflows across Maharashtra districts. While the core architecture (Next.js 16, React 19, Prisma 7, NextAuth v4, PostgreSQL) is well-structured, the audit identified critical gaps on the live site: broken navigation links, missing registration and legal/informational pages, hardcoded official government claims without proper academic disclaimers, hotlinked remote images, missing error handlers (404/500), and unseeded database tables leading to "0 stats" and "No projects available yet".

---

## 2. What Works

| Component | Status | Details |
|---|---|---|
| **Tech Stack Foundation** | ✅ Working | Next.js 16.2.9, React 19.2.4, TypeScript 5, Tailwind CSS v4, Prisma 7.8.0. |
| **Authentication Core** | ✅ Working | NextAuth v4.24.14 configured with JWT stateless sessions, bcrypt password hashing, credentials provider, and Google OAuth provider (`src/app/api/auth/[...nextauth]/route.ts`). |
| **Role-Based Portals** | ✅ Working | Guarded dashboard layouts for `ADMIN` (`/admin`), `OFFICER` (`/officer`), and `CONTRACTOR` (`/contractor`). |
| **Role Separation & Approval API** | ✅ Working | User status lifecycle (`PENDING_APPROVAL`, `ACTIVE`, `SUSPENDED`). Admin approval endpoints (`/api/login-requests/[id]`, `/api/users/pending`, `/api/users/[id]/approve`). |
| **Core Business APIs** | ✅ Working | Complete REST endpoints for Projects, Tasks (Milestones), Installments, Payment Requests, and Notifications with authorization checks. |
| **Database Schema** | ✅ Working | 12-table normalized relational schema in `prisma/schema.prisma` modeling Users, Projects, Tasks, Installments, Payment Requests, Notifications, and Auth accounts. |
| **Locations Page** | ✅ Working | Dedicated page at `/locations` displaying districts grouped by Maharashtra divisions. |

---

## 3. What Is Broken & Non-Compliant

| Issue | Severity | Location | Description & Root Cause |
|---|---|---|---|
| **Registration Page 404** | 🔴 Critical | Header & Login links to `/register` | Nav bars and login screens link to `/register`, but `src/app/register/page.tsx` does not exist, throwing a 404 error. |
| **District Count Discrepancy** | 🟠 High | `src/app/page.tsx` vs `src/app/locations/page.tsx` | The homepage hardcodes "34 districts" while the locations page lists 36 districts. There is no shared single source of truth module (`src/lib/maharashtra.ts`). |
| **Dead Navigation & Footer Links** | 🟠 High | `LandingNav.tsx`, `page.tsx`, `locations/page.tsx` | Over 20 navigation and footer links point to dead `#` anchors (About NIRMAAN, Vision & Mission, Governance, FAQ, Contact, Terms, Privacy, Accessibility, Sitemap, Tenders, Circulars, Downloads, RTI). |
| **Official Government Representation** | 🔴 Critical (Rule Violation) | Header top bar, footer, and hero text | Prominently displays "Government of India", "official project management system of the Maharashtra Zilla Parishad", and "Powered by Digital India" without the mandatory academic demo disclaimer strip. |
| **Hotlinked Images** | 🟡 Medium | `src/lib/images.ts`, `src/app/login/page.tsx` | Images are fetched from remote `lh3.googleusercontent.com` URLs and `www.google.com/favicon.ico` rather than being self-hosted in `public/`. |
| **Missing Custom 404 & 500 Pages** | 🟡 Medium | `src/app/not-found.tsx`, `src/app/error.tsx` | Next.js defaults to generic system error pages. Custom user-friendly branded error pages are missing. |
| **Empty Stats & Blank Project Showcase** | 🟠 High | Homepage (`/`) and `/api/public/stats`, `/api/public/projects` | The homepage displays "0" for all financial statistics and "No projects available yet" because no seed data exists in the database, and the public API routes lack fallback mock data when the database is offline or unpopulated. |
| **Missing Prisma Seed Script** | 🟠 High | `prisma/seed.ts` | No automated idempotent database seeding script exists to populate the required 36 districts, 6 departments, 1 admin, 3 officers, 4 contractors, and 60+ sample projects. |
| **Missing Test Suite** | 🟡 Medium | Repository root | No Cypress or Playwright end-to-end test suite is configured in `package.json` (only residual MCP log artifacts in `testsprite_tests`). |

---

## 4. What Is Missing

1. **`src/lib/maharashtra.ts`**: Single source of truth defining all 36 Maharashtra districts categorized across the 6 administrative divisions (Konkan, Pune, Nashik, Chhatrapati Sambhajinagar / Aurangabad, Amravati, Nagpur) with helper utilities.
2. **`src/app/register/page.tsx`**: Public registration portal allowing prospective Officers and Contractors to submit account requests with role selection, validation, and pending-approval notification.
3. **Dedicated Public Pages**:
   - `/about`: Project history, architecture, and academic disclaimer.
   - `/vision-mission`: Platform objectives and vision for transparent governance.
   - `/governance`: Role-based division of duties and approval hierarchy.
   - `/faq`: Common questions for citizens, officers, and contractors.
   - `/contact`: Academic contact and feedback submission.
   - `/terms`: Terms of use, academic demo disclaimer, and user responsibility.
   - `/privacy`: Data handling and privacy policies.
   - `/accessibility`: Accessibility statement conforming to WCAG 2.1 AA.
   - `/sitemap`: Complete directory of all pages and portals.
   - `/tenders`: Simulated open e-tenders and procurement notices.
   - `/circulars`: Sample administrative circulars and notifications.
   - `/downloads`: Project manuals, forms, and audit checklist downloads.
   - `/rti`: Right to Information transparency disclosure.
4. **Global Academic Disclaimer Banner (`DemoDisclaimerBanner`)**: Persistent header/footer strip on every page explicitly clarifying that NIRMAAN is an academic prototype with simulated data.
5. **Self-Hosted Assets**: Local storage of hero, about, login, and favicon assets in `public/images/`.
6. **Custom Error Boundaries**:
   - `src/app/not-found.tsx` (404 Page)
   - `src/app/error.tsx` (500 Server Error Boundary)
7. **`prisma/seed.ts`**: Idempotent seeding script generating 36 districts, 6 departments, sample users, and 60+ projects with milestones, installments, and payment requests.
8. **Resilient Public API Fallbacks**: Graceful fallback data in `/api/public/stats` and `/api/public/projects` ensuring the live site never renders empty zero-state dashboards when the remote database is offline or sleeping.

---

## 5. Remediation Plan

1. **Step 1 — Maharashtra Single Source of Truth**: Create `src/lib/maharashtra.ts` and sync all 36 districts across Homepage and Locations.
2. **Step 2 — Self-Host Images & Fix Metadata**: Host all images locally in `public/images/`, update `images.ts` and `login/page.tsx`, and update page metadata.
3. **Step 3 — Academic Disclaimer Strip**: Create `DemoDisclaimerBanner` and remove misleading official government claims.
4. **Step 4 — Build `/register` Page**: Implement accessible, bilingual-friendly registration for Officers and Contractors.
5. **Step 5 — Create Missing Pages & Eliminate `#` Links**: Build all 13 informational pages and wire all navbar/footer links.
6. **Step 6 — Custom 404 & 500 Pages**: Create `not-found.tsx` and `error.tsx`.
7. **Step 7 — Idempotent Seed Script & Resilient Public APIs**: Build `prisma/seed.ts` with 60+ projects, 36 districts, 6 departments, and seed data, plus resilient fallbacks for public stats.
8. **Step 8 — Browser Verification & Build Validation**: Test all pages in browser, ensure zero 404s, run build/typecheck.
