# Technical Spec — Campus Rental Web App (MVP)

**Working name:** Presto (temporary; swap freely)
**Version:** 0.1 · 2026-11-20
**Platform:** Mobile-first responsive web app (no native app for MVP)
**Competitions:** Stella Zhang New Venture Competition (NVC) + Butterworth Product Development Competition (UCI)

---

## 1. Overview

A UCI-only web app where students rent everyday items from each other for an hour, a day or a weekend, and discover what UCI already lends for free.

**Problem:** Students occasionally need things (vacuum, bike pump, tool kit, ring light, speaker, projector, moving cart) that are too expensive to buy for one use. Asking around in group chats is awkward and unreliable, and many students don't know UCI Libraries already lends some items for free.

**Solution:**
1. **Peer rentals:** students list items they own; other verified UCI students request, pick up, use, and return them.
2. **UCI free-lending directory:** items UCI already lends (laptops, consoles, calculators, cameras) are listed with where/how to get them, so the app is the one place to check before buying.
3. **Seasonal spotlights:** a featured banner and category that change with the student calendar (move-in, weekend/party gear, Halloween/holidays, move-out/sublet season).
4. **Clubs:** verified club accounts that rent event gear and lend their own gear, with event bundles.

### MVP goals
| Goal | Target |
|---|---|
| Working demo for Butterworth product spec | by **2027-02-15** (spec due Feb 21) |
| Pilot-ready app (real users, real rentals) | by **2027-03-15** |
| Polished app for midpoint presentation | by **2027-04-10** (presentation Apr 15) |
| Final demo + summary video | by **2027-05-01** (final due May 3, finals May 14) |
| Pilot traction | 30+ completed rentals, 20+ items listed, 10+ lenders, 3+ repeat renters |

---

## 2. Users & roles

| Role | Who | Can do |
|---|---|---|
| **Student** | Anyone with a verified `@uci.edu` email | Browse, request, rent, list items, review, report |
| **Club officer** | Student linked to a verified club | Everything a student can + list/rent on behalf of the club, download receipts |
| **Admin** | Team members | Manage UCI directory, seasonal banners, categories, pickup spots, verify clubs, resolve reports/disputes, view metrics |

A single user is both renter and lender; there are no separate account types.

---

## 3. MVP scope

### In scope (MVP)
- UCI email sign-in (magic link / OTP), profile
- Create, edit, pause, delete item listings with photos, price, deposit-free protection fee
- Browse by category, search, filter (price, category, availability)
- Rental request lifecycle (request → accept/decline → pickup → return → complete)
- Fixed campus pickup spots (chosen per rental)
- Photo check-out and check-in (condition photos at pickup and return)
- In-app messaging per rental (simple thread)
- Ratings and reviews (both directions)
- Damage/issue reports and admin resolution
- UCI free-lending directory (admin-managed)
- Seasonal banner + featured category (admin-managed)
- Club profiles, club-owned listings, event bundles
- Basic admin dashboard + metrics
- Email notifications for key events

### Later (post-MVP, only if time allows)
- Online payments (Stripe Connect) — MVP records price and payment status; payment happens off-platform (Venmo/Zelle/cash)
- Delivery option
- Waitlists / "notify me when available"
- Item requests board ("Need a projector Saturday")
- PWA install + push notifications
- Smart lockers

### Out of scope
- Room/apartment sublet listings (we only rent items *for* subletters)
- Non-UCI users
- Native iOS/Android apps
- Real insurance products (we use a "protection fee / repair fund", not insurance)

---

## 4. Core user flows

### 4.1 Sign up
1. User enters email → must end in `@uci.edu` (reject others with a clear message).
2. Receives magic link / 6-digit code → verified.
3. First-time: set display name, housing area (dropdown: Mesa Court, Middle Earth, Campus Village, ACC/Vista del Campo, Off-campus, Other), optional photo, agree to Community Rules.

### 4.2 List an item
1. Tap **List an item**.
2. Fill: title, category, description, condition, 1–5 photos, replacement value (USD), price per hour and/or per day, min/max rental length, preferred pickup spots, availability (simple: available / paused + optional blocked dates).
3. App computes and shows the protection fee and lender payout.
4. Publish → listing is live.

### 4.3 Find & request
1. Home shows: seasonal banner, featured category, nearby/new items, UCI free-lending matches.
2. Search "vacuum" → results show peer listings **and** any UCI directory matches ("Free at Langson Library").
3. Open item → pick start/end time, pickup spot, write a short note → **Request**.
4. Price summary shows: rental price + protection fee = total.

### 4.4 Lender responds
- Accept or decline within 24h (auto-expire after 24h).
- On accept: both get an email; rental thread opens.

### 4.5 Pickup (check-out)
1. Meet at pickup spot.
2. Lender marks **Handed over**; renter uploads 1–3 condition photos and confirms **Received**.
3. Status → `active`.

### 4.6 Return (check-in)
1. Renter returns item, uploads 1–3 return photos.
2. Lender confirms **Returned OK** or **Report an issue**.
3. If OK → `completed`; both prompted to review.
4. If issue → `disputed`; damage report created for admin.

### 4.7 Review
- 1–5 stars + optional text, both directions, within 7 days of completion.

### 4.8 Damage / issue
- Either party files a report (type: damage, late, no-show, lost, other; description; photos).
- Admin reviews check-out/check-in photos, decides outcome, records amount paid from repair fund and/or capped renter charge.

### 4.9 Club flow
1. A student requests a club profile (club name, UCI club page link).
2. Admin verifies → student becomes club officer.
3. Officer can list club-owned items, create bundles, rent as the club, download a receipt (PDF or printable page) for reimbursement.

---

## 5. Functional requirements

Each requirement has acceptance criteria (AC). IDs are used in commits/PRs.

### AUTH — Authentication
- **AUTH-1** Only `@uci.edu` emails may sign up. AC: non-UCI email shows an error and no account is created; enforced server-side too.
- **AUTH-2** Passwordless sign-in (magic link or OTP). AC: user signs in without a password; session persists across visits.
- **AUTH-3** Onboarding requires display name + housing area + rules agreement. AC: user cannot browse/request until onboarding is complete.
- **AUTH-4** Sign out from any page.

### PROF — Profiles
- **PROF-1** Public profile shows display name, photo, housing area, member since, avg rating, number of completed rentals, active listings. Email is never shown publicly.
- **PROF-2** User can edit their profile.
- **PROF-3** New users are "New" (<3 completed rentals) and can only rent items with replacement value ≤ $150 (configurable).

### LIST — Listings
- **LIST-1** Create a listing with fields in §4.2. AC: required fields validated; ≥1 photo required.
- **LIST-2** Photos: max 5, ≤ 5 MB each, resized/compressed client-side, stored in object storage.
- **LIST-3** Edit, pause/unpause, delete (soft delete) a listing. AC: cannot delete while it has an active rental.
- **LIST-4** Price summary preview while creating (rental price, protection fee, lender payout).
- **LIST-5** Banned items list blocks obvious prohibited categories (weapons, alcohol, drugs, vehicles, medical devices). AC: category not selectable; flagged keywords warn.

### SRCH — Browse & search
- **SRCH-1** Keyword search over title + description + category.
- **SRCH-2** Filters: category, max price, available on a date, pickup spot.
- **SRCH-3** Sort: newest, price low→high, rating.
- **SRCH-4** UCI directory matches appear in a separate "Free from UCI" section above peer results when the query matches a directory entry's keywords.
- **SRCH-5** Category pages (e.g., Cleaning, Tools, Bikes & Scooters, Moving, Party & Events, Tech, Content & Interview, Costumes, Outdoor, Kitchen).

### RENT — Rental lifecycle
- **RENT-1** Request requires start/end, pickup spot, note (optional). AC: cannot request own item; cannot overlap an accepted rental of the same item.
- **RENT-2** Statuses and allowed transitions:

```
requested  -> accepted | declined | cancelled | expired
accepted   -> active | cancelled
active     -> returned
returned   -> completed | disputed
disputed   -> completed (after admin resolution)
```
  AC: any other transition is rejected server-side.
- **RENT-3** Requests auto-expire after 24h without response (scheduled job).
- **RENT-4** Price is snapshotted at request time (later listing edits don't change it).
- **RENT-5** Payment status field: `unpaid | paid_offline | waived`. MVP: renter marks paid, lender confirms.
- **RENT-6** Late flag: if `returned` not reached by end time + 2h, rental is marked late and both are emailed.

### PHOTO — Condition photos
- **PHOTO-1** Check-out requires ≥1 renter photo before status becomes `active`.
- **PHOTO-2** Check-in requires ≥1 renter return photo before status becomes `returned`.
- **PHOTO-3** Condition photos are visible only to the two parties and admins.

### MSG — Messaging
- **MSG-1** One message thread per rental, visible only to renter, lender, admins.
- **MSG-2** Text only for MVP; near-real-time updates (realtime subscription or polling every 10s).

### REV — Reviews
- **REV-1** After `completed`, each party can leave one review (1–5 stars, ≤ 500 chars) within 7 days.
- **REV-2** Average rating shown on profiles and listings (listing rating = reviews of rentals of that item).

### DMG — Damage & issues
- **DMG-1** Either party can file a report on an `active`, `returned`, or `disputed` rental.
- **DMG-2** Admin view shows rental details, both sets of photos, messages, and both statements.
- **DMG-3** Admin records outcome: `no_fault | repair_fund_paid | renter_charged | split`, amount(s), note. Renter charge capped at `RENTER_DAMAGE_CAP` (default $25).

### UCI — Free-lending directory
- **UCI-1** Admin CRUD for directory entries: name, provider (e.g., UCI Libraries – Langson), location, loan period, eligibility, hours note, link, keywords, category, last-verified date.
- **UCI-2** Public directory page grouped by category.
- **UCI-3** Entries show "Free · UCI" badge and link out; no booking in our app.

### SEAS — Seasonal spotlights
- **SEAS-1** Admin creates campaigns: title, subtitle, image, featured category or hand-picked items, start/end datetime, optional "weekends only" flag.
- **SEAS-2** Home shows the active campaign with highest priority; none active → default "Dorm & apartment essentials".

### CLUB — Clubs
- **CLUB-1** Request a club profile; admin verifies.
- **CLUB-2** Club officers can add/remove other officers (from verified students).
- **CLUB-3** Club-owned listings show the club as owner; any officer can manage them.
- **CLUB-4** Bundles: a named set of items from one owner with a single price (e.g., "Movie Night: projector + screen + speaker").
- **CLUB-5** Renting "as club" generates a printable receipt (rental ID, items, dates, amount, both parties).

### NOTIF — Notifications (email)
- **NOTIF-1** Emails for: new request, accepted/declined, expiring soon, pickup reminder (2h before), return reminder (2h before end), late, report filed, review prompt.
- **NOTIF-2** In-app notification list (bell icon) for the same events.

### ADMIN — Admin
- **ADMIN-1** Admin-only area protected by role.
- **ADMIN-2** Manage categories, pickup spots, directory, campaigns, clubs, reports, users (suspend/unsuspend).
- **ADMIN-3** Metrics page (see §11).

---

## 6. Data model (PostgreSQL)

All tables have `id uuid pk default gen_random_uuid()`, `created_at timestamptz default now()`, `updated_at timestamptz` unless noted. Money stored as integer cents.

| Table | Key fields |
|---|---|
| `profiles` | `id` (= auth user id), `email`, `display_name`, `avatar_url`, `housing_area`, `role` (`student`/`admin`), `is_suspended`, `rules_accepted_at`, `onboarded_at` |
| `clubs` | `name`, `slug`, `description`, `uci_page_url`, `logo_url`, `status` (`pending`/`verified`/`rejected`), `requested_by` |
| `club_officers` | `club_id`, `profile_id`, unique(club_id, profile_id) |
| `categories` | `name`, `slug`, `icon`, `sort_order`, `is_banned` |
| `pickup_spots` | `name`, `description`, `lat`, `lng`, `is_active` |
| `items` | `owner_profile_id`, `owner_club_id` (nullable; exactly one owner), `title`, `description`, `category_id`, `condition` (`new`/`good`/`fair`), `replacement_value_cents`, `price_per_hour_cents` (nullable), `price_per_day_cents` (nullable), `min_hours`, `max_days`, `status` (`active`/`paused`/`deleted`), `search_tsv` (tsvector) |
| `item_photos` | `item_id`, `storage_path`, `sort_order` |
| `item_pickup_spots` | `item_id`, `pickup_spot_id` |
| `item_blocked_dates` | `item_id`, `start_at`, `end_at` |
| `bundles` | `owner_profile_id` / `owner_club_id`, `title`, `description`, `price_per_day_cents`, `status` |
| `bundle_items` | `bundle_id`, `item_id` |
| `rentals` | `item_id` (nullable) / `bundle_id` (nullable), `renter_profile_id`, `renter_club_id` (nullable), `lender_profile_id`, `lender_club_id` (nullable), `pickup_spot_id`, `start_at`, `end_at`, `status`, `price_cents`, `protection_fee_cents`, `platform_fee_cents`, `lender_payout_cents`, `payment_status`, `note`, `accepted_at`, `picked_up_at`, `returned_at`, `completed_at`, `is_late` |
| `rental_events` | `rental_id`, `actor_profile_id`, `from_status`, `to_status`, `meta jsonb` (audit log of every transition) |
| `condition_photos` | `rental_id`, `uploaded_by`, `phase` (`checkout`/`checkin`), `storage_path` |
| `messages` | `rental_id`, `sender_profile_id`, `body` |
| `reviews` | `rental_id`, `reviewer_profile_id`, `reviewee_profile_id`, `rating` (1–5), `body`, unique(rental_id, reviewer_profile_id) |
| `reports` | `rental_id`, `reporter_profile_id`, `type`, `description`, `status` (`open`/`resolved`), `outcome`, `repair_fund_cents`, `renter_charge_cents`, `admin_note`, `resolved_by`, `resolved_at` |
| `report_photos` | `report_id`, `storage_path` |
| `uci_resources` | `name`, `provider`, `location`, `loan_period`, `eligibility`, `hours_note`, `url`, `keywords text[]`, `category_id`, `last_verified_at`, `is_active` |
| `campaigns` | `title`, `subtitle`, `image_url`, `category_id` (nullable), `item_ids uuid[]`, `starts_at`, `ends_at`, `weekends_only`, `priority`, `is_active` |
| `notifications` | `profile_id`, `type`, `rental_id`, `payload jsonb`, `read_at` |
| `analytics_events` | `profile_id` (nullable), `name`, `props jsonb` |

**Indexes:** `items(category_id, status)`, GIN on `items.search_tsv`, `rentals(item_id, start_at, end_at)`, `rentals(renter_profile_id)`, `rentals(lender_profile_id)`, `messages(rental_id, created_at)`.

**Overlap rule:** an exclusion constraint (or server check) prevents two `accepted`/`active` rentals of the same item with overlapping `[start_at, end_at)`.

---

## 7. Fees & pricing logic

Config values (env or `settings` table), defaults:

| Name | Default | Meaning |
|---|---|---|
| `PLATFORM_FEE_PCT` | 15% | Taken from rental price |
| `PROTECTION_FEE_PCT` | 10% of rental price | Paid by renter; goes to repair fund |
| `PROTECTION_FEE_MIN_CENTS` | 50 | Minimum protection fee |
| `PROTECTION_FEE_MAX_CENTS` | 300 | Maximum protection fee |
| `RENTER_DAMAGE_CAP_CENTS` | 2500 | Max a renter can be charged for careless damage |
| `NEW_USER_MAX_VALUE_CENTS` | 15000 | Max replacement value a "New" user can rent |
| `REQUEST_EXPIRY_HOURS` | 24 | Auto-expire unanswered requests |

```
rental_price   = hourly or daily rate × duration (whichever the lender set; daily if > 6h and daily set)
protection_fee = clamp(rental_price × PROTECTION_FEE_PCT, MIN, MAX)
platform_fee   = rental_price × PLATFORM_FEE_PCT
renter_total   = rental_price + protection_fee
lender_payout  = rental_price − platform_fee
```
All computed server-side in one shared function with unit tests. UI calls the same function for previews.

---

## 8. Pages & screens

| Route | Screen |
|---|---|
| `/` | Home: seasonal banner, featured category, new items, "Free from UCI" strip |
| `/login` | Email entry + code/magic link |
| `/onboarding` | Name, housing, rules |
| `/search?q=` | Results (UCI matches + peer listings), filters |
| `/c/[slug]` | Category page |
| `/items/[id]` | Item detail, request form |
| `/items/new`, `/items/[id]/edit` | Create/edit listing |
| `/rentals` | My rentals (tabs: Renting, Lending, Past) |
| `/rentals/[id]` | Rental detail: status timeline, actions, photos, messages |
| `/u/[id]` | Public profile |
| `/clubs`, `/clubs/[slug]` | Club list and club profile |
| `/clubs/[slug]/manage` | Officer tools |
| `/uci` | UCI free-lending directory |
| `/notifications` | Notification list |
| `/settings` | Profile edit, sign out |
| `/rules` | Community rules + protection fee explained |
| `/admin/*` | Dashboard, reports, directory, campaigns, clubs, categories, pickup spots, users, metrics |

---

## 9. Tech stack & architecture

| Layer | Choice | Why |
|---|---|---|
| Framework | **Next.js 15 (App Router) + TypeScript** | One codebase for UI + server actions; easy deploy |
| Styling | **Tailwind CSS + shadcn/ui** | Fast, consistent, mobile-first |
| Backend/DB | **Supabase** (Postgres, Auth, Storage, Realtime) | Auth with email OTP, row-level security, file storage, free tier |
| Validation | **Zod** | Shared schemas client + server |
| Forms | React Hook Form | Works with Zod |
| Email | **Resend** (or Supabase SMTP) | Transactional emails |
| Scheduled jobs | Supabase cron (pg_cron) or Vercel Cron | Expire requests, reminders, late flags |
| Analytics | `analytics_events` table + PostHog (optional) | Metrics for judges |
| Testing | Vitest (unit), Playwright (e2e happy paths) | Confidence before demos |
| Hosting | **Vercel** | Free tier, preview deploys per PR |
| Repo | GitHub, PRs into `main`, preview deploys | Team collaboration |

```
Browser (mobile-first Next.js UI)
   │  server actions / route handlers
   ▼
Next.js server (Vercel) ── Zod validation, fee logic, status transitions
   │
   ▼
Supabase: Postgres (RLS) · Auth (UCI email OTP) · Storage (photos) · Realtime (messages)
   │
   └── Cron: expire requests, reminders, late flags  →  Resend emails
```

**Rules:**
- All writes that change rental status go through one server module (`lib/rentals/transitions.ts`) that checks permission + allowed transition and writes a `rental_events` row.
- Row-level security on every table; the client never uses the service-role key.
- Images: compress client-side (max 1600px, ~80% JPEG/WebP) before upload; private buckets for condition/report photos, signed URLs.

---

## 10. Security, privacy, trust & safety

- **UCI-only:** enforce `@uci.edu` in the sign-up form, server action, and a DB trigger/Auth hook.
- **RLS policies:**
  - Items, item photos, public profile fields, categories, pickup spots, directory, campaigns: readable by signed-in users.
  - Write items only by owner (or club officer of owner club).
  - Rentals, messages, condition photos: only renter, lender (incl. club officers of involved clubs), admins.
  - Reports: reporter, both parties (read), admins (write outcome).
  - Admin tables: admins only.
- **Privacy:** never expose emails or phone numbers; communication stays in-app.
- **Suspended users** cannot sign in to act (read-only or blocked).
- **Rate limits:** max 10 open requests per user, max 20 listings per user (configurable).
- **Content:** banned categories; report-listing button; admins can hide listings.
- **Meet safely:** only listed public pickup spots; rules page explains.
- **Wording:** call it "protection fee" / "repair fund", never "insurance".
- **Secrets:** `.env.local` only; never committed.

---

## 11. Non-functional requirements

| Area | Requirement |
|---|---|
| Mobile-first | Designed for 375px width first; works on desktop |
| Performance | Home and item pages load in < 2.5s on 4G (LCP); images lazy-loaded |
| Accessibility | WCAG 2.1 AA basics: labels, contrast, keyboard nav, alt text on photos |
| Reliability | Status transitions are atomic (single DB transaction) |
| Browser support | Latest Chrome, Safari (iOS), Firefox, Edge |
| Data | Daily Supabase backup (built-in); soft deletes for items |
| Time zone | All times stored UTC, displayed America/Los_Angeles |

---

## 12. Analytics & metrics (for judges)

Track as `analytics_events` (name + props) and compute on `/admin/metrics`:

| Metric | Definition |
|---|---|
| Signups | verified users, by week |
| Listers | users with ≥1 active listing |
| Items listed | active listings, by category |
| Requests | created, accepted rate, expired rate |
| Completed rentals | by week, by category, by season campaign |
| GMV | sum of `price_cents` on completed rentals |
| Platform revenue | sum of `platform_fee_cents` |
| Repair fund balance | sum protection fees − payouts from fund |
| Repeat renters | users with ≥2 completed rentals |
| Dispute rate | reports / completed rentals |
| Avg rating | across all reviews |
| UCI directory clicks | outbound clicks on directory entries |
| Search misses | searches with 0 peer results (what to recruit next) |

Event names: `search_performed`, `item_viewed`, `request_created`, `request_accepted`, `rental_completed`, `uci_resource_clicked`, `campaign_banner_clicked`, `listing_created`.

Export: CSV download of each metric for the pitch deck.

---

## 13. Build plan & milestones

| Milestone | Scope | Target date |
|---|---|---|
| **M0 Setup** | Repo, Next.js, Tailwind, shadcn, Supabase project, env, CI (lint, typecheck, test), Vercel deploy | 2026-12-05 |
| **M1 Auth & profiles** | AUTH-1..4, PROF-1..2, onboarding | 2026-12-15 |
| **M2 Listings** | LIST-1..5, categories, pickup spots, photo upload | 2027-01-05 |
| **M3 Browse & search** | SRCH-1..5, home (static banner) | 2027-01-15 |
| **M4 Rentals** | RENT-1..6, transitions module, rental page, messaging (MSG) | 2027-01-31 |
| **M5 Trust** | PHOTO-1..3, REV-1..2, DMG-1..3, PROF-3 | 2027-02-10 |
| **Demo freeze** | Seed data, demo script, screenshots for product spec | **2027-02-15** |
| **M6 UCI + seasons** | UCI-1..3, SEAS-1..2 | 2027-02-28 |
| **M7 Notifications** | NOTIF-1..2, cron jobs | 2027-03-10 |
| **Pilot launch** | Real users; fix bugs weekly | **2027-03-15** |
| **M8 Clubs** | CLUB-1..5 | 2027-03-31 |
| **M9 Admin & metrics** | ADMIN-1..3, metrics page, CSV export | 2027-04-07 |
| **Midpoint polish** | UX fixes from pilot | **2027-04-10** |
| **Final polish** | Performance, accessibility pass, demo video | **2027-05-01** |

**Definition of done (every feature):** meets its AC; RLS policy written and tested; mobile layout checked at 375px; loading/empty/error states exist; typecheck + lint + tests pass; deployed to a preview URL.

---

## 14. Seed data (for demos)

- 10 categories, 6 pickup spots (e.g., Langson Library entrance, Student Center, Mesa Court Commons, Middle Earth Towers lobby, ARC entrance, Campus Village Community Center) — **verify real names before launch**
- 25 sample items across categories with photos
- 8 UCI directory entries (to be verified against UCI Libraries' equipment lending page)
- 2 clubs, 2 bundles
- 1 active campaign ("Weekend game night")
- 10 sample completed rentals + reviews (demo environment only, clearly separate from pilot data)

---

## 15. Open questions

- [ ] Final product name
- [ ] Payments in pilot: off-platform only, or Stripe Connect test mode?
- [ ] Exact pickup spots (confirm with Housing / public locations)
- [ ] UCI directory entries: confirm items, loan periods, locations
- [ ] Club reimbursement rules (ASUCI / Student Life & Leadership)
- [ ] Final fee percentages after survey price data
- [ ] Does Butterworth require a specific repo/demo format?

---

## 16. Change log

| Date | Change | Reason | Docs/code affected |
|---|---|---|---|
| 2026-11-20 | v0.1 created | Initial MVP spec | — |
