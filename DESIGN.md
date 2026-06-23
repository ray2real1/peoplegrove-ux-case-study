# Catch — DESIGN.md

> **Repo namespace:** `goodcatch`
> **Status:** Prototype / portfolio demo artifact. Pre-implementation design contract.
> **Scope:** Near-miss and hazard reporting PWA prototype for critical facilities (data center / mission-critical operations domain anchor).

---

## 0. How to read this document

This file is the **governing design contract** for Catch. It is written **before** code. Every visual decision, interaction rule, accessibility rule, severity semantic, offline/sync state, component boundary, and copy string in the build **must** be traceable back to a rule in this document.

When implementation and this document disagree, **this document wins** until it is deliberately amended. Claude Code (and any contributor) should treat the rules here as enforceable constraints, not suggestions.

### Non-negotiable framing

Catch is a **prototype** and **demo artifact**. It is **not** a production safety system. The following hard guardrails apply to all code, copy, and documentation in this repo:

- Do **not** imply this is a production safety system.
- Do **not** imply emergency-dispatch behavior.
- Do **not** imply validated risk methodology.
- Do **not** imply certified accessibility or regulatory compliance.
- Do **not** imply legally tamper-proof audit records.

Use scoped language everywhere: *prototype*, *demo artifact*, *simulated*, *local-only*, *illustrative severity model*, *designed toward WCAG 2.2 AA*, *not for active emergencies*, *follow your site's emergency procedures*.

See **§13 Claim-safe copy patterns** for the approved/forbidden list.

---

## 1. Product design thesis

**The core design problem is not safety awareness. It is reporting friction.**

People in critical facilities already know what a hazard looks like. They know a frayed cable, a wet floor near switchgear, a propped fire door, a missing lockout tag. Awareness is not the bottleneck.

The bottleneck is the **moment of decision** at the hazard. In that moment, the worker runs a fast, mostly unconscious cost comparison:

> **Cost of reporting** (stop, find the tool, log in, type, classify, justify, wait) **vs. cost of ignoring** (keep walking, it's probably fine, someone else will catch it).

When the cost of reporting exceeds the perceived cost of ignoring, **the hazard goes unreported.** Not because people don't care — because reporting is slower than not reporting.

**Catch's design job is to push the cost of reporting below the cost of ignoring.** Every design rule in this document exists to make capturing a near-miss *faster and lighter* than walking past it:

- One-handed, glove-friendly, zero-typing capture.
- Offline-first local storage so weak signal never blocks a report.
- Guided severity triage so the reporter doesn't have to think hard about classification.
- A visible audit/evidence trail so the report feels like it *went somewhere* and was worth the effort.

The product thesis, stated as a design constraint: **reporting must be faster than ignoring.** If a feature, screen, or interaction makes reporting slower without a proportional payoff, it is wrong by definition.

The acknowledgment — *"Good catch."* — is the emotional payoff that closes the loop. It rewards the behavior we want without hype.

---

## 2. Environment constraints

Catch is used in **high-consequence physical environments**, not at a desk. Each constraint below is converted into a binding design rule.

| # | Constraint | Reality in the field | **Design rule** |
|---|-----------|----------------------|-----------------|
| 2.1 | **Gloves** | Reporters wear cut/arc/electrical gloves. Capacitive precision is poor; fine targets are unhittable. | Primary touch targets ≥ **64px** tall. No fine-motor gestures (no long-press-to-confirm, no small close buttons as primary actions, no drag-precision). Generous spacing between tappable elements. |
| 2.2 | **Noise** | Server halls, generator rooms, and mechanical spaces are loud. Voice capture is unreliable; audio feedback is unheard. | The **primary** capture path is silent and visual: tap-based, zero-typing. Voice is **optional support only** (see §7). Never depend on sound for confirmation — use visual + (optional) haptic. |
| 2.3 | **Dim / control-room lighting** | Control rooms are kept dim; some spaces are dark or have harsh point lighting. | **Dark-first** design system (§4). High contrast. No reliance on subtle tonal differences. Status must read in low light at arm's length. |
| 2.4 | **Concrete / electrical rooms with weak signal** | Thick concrete, shielding, and below-grade rooms kill cellular and Wi-Fi. | **Offline-first.** Capture must fully succeed with **no network**. Submission saves locally and queues. Network is never a precondition for completing a report (§9). |
| 2.5 | **Frontline time pressure** | The reporter is mid-round, mid-task, on a clock. They will abandon anything slow. | **15-second target** from open to confirmed (§8). Step-by-step flow, smart defaults, skippable evidence, one-tap review. Friction that breaks the 15-second target is a defect. |
| 2.6 | **Reporter trust** | Frontline staff fear blame, retaliation, or "creating paperwork." | Low-stakes framing. **No login wall** to report. **Anonymous option** (§10). Acknowledgment over interrogation. A visible activity trail so reports demonstrably *go somewhere* (§11). |
| 2.7 | **High-consequence environments** | A real hazard here can hurt people or take down critical infrastructure. | Calm, operational, status-forward tone (§3). **Never** position the app as the emergency response itself. Always defer active emergencies to site procedures: *"not for active emergencies — follow your site's emergency procedures."* |

---

## 3. Visual tone

Catch should feel like **operational instrumentation**, not a consumer app.

**The tone is:**

- **Industrial** — built for a facility, not a lifestyle. Materials over decoration.
- **High-contrast** — legible in dim rooms, at arm's length, through safety glasses.
- **Calm-under-pressure** — the interface is steady even when the content is a Critical hazard. The UI never panics; it informs.
- **Operational** — reads like a console, a status board, a logbook.
- **Status-forward** — state (severity, sync, status) is always the most prominent information.
- **No decorative imagery** — no stock photos, no illustrations-for-vibe, no hero art.
- **No consumer-app cheeriness** — no confetti, no mascots, no exclamatory marketing voice, no gamified streaks.

**Acknowledgment tone.** The success acknowledgment is **"Good catch."** — short, sincere, operational. It respects the reporter and rewards the behavior without hype. It is the *only* place warmth is allowed, and even there it stays understated.

**Forbidden tonal moves:** celebration animations, emoji in core UI, hype adjectives ("amazing!", "awesome!"), urgency theater (flashing red, alarm sounds, countdown panic). Urgency is communicated through clear severity encoding (§5), never through alarm.

---

## 4. Dark-first design system

### 4.1 Base posture

- **Dark-first.** The dark theme is the canonical, designed-first surface. It is the P0 theme.
- **Light mode is later, not P0.** Tokens must be authored so a light theme can be added without re-architecting, but light mode ships after P0 and is not a launch requirement.

### 4.2 Neutral foundation

- **Graphite / steel neutral base.** Backgrounds and surfaces are cool, desaturated graphite/steel — not pure black, not warm gray. Layer surfaces with subtle elevation steps (background → surface → raised → overlay).
- Surfaces carry the UI; **color is reserved** for meaning (severity, status, primary action). A screen at rest is mostly neutral.

### 4.3 Accent

- **Restrained accent for the primary action.** A single, calm accent color marks the primary action on a screen. It is not used decoratively and not used for severity. Exactly one primary accent action should dominate at a time.

### 4.4 Type

- **High-legibility type.** A clear, neutral sans with strong character disambiguation (1/l/I, 0/O). Comfortable minimum body sizes for at-arm's-length reading in dim light. Strong size/weight hierarchy over color for emphasis.
- **Large scanning numbers** (tabular, oversized) are reserved for the **dashboard later** — counts, SLA timers, severity tallies that must be read across a room. Not a P0 concern, but the type scale must reserve a "display-numeric" step for it.

### 4.5 Density

- **Spacious capture density.** Capture screens (the reporter's flow) are low-density, large-target, one-thing-at-a-time. Generous padding. Breathing room is a feature: it serves gloves, speed, and calm.
- **Denser triage / dashboard density.** Triager and dashboard surfaces (later phases) are information-dense — tables, queues, timelines — for an operator at a desk who is scanning many reports.

These are two distinct density modes. Do not apply dashboard density to capture, or capture spaciousness to the queue.

---

## 5. Severity encoding system

This model is **locked**. Do not improvise severity visuals.

| Severity | Color | Shape | Icon intent |
|----------|-------|-------|-------------|
| **Low** | Slate / blue | **Circle** | Calm, informational |
| **Medium** | Amber | **Triangle** | Caution |
| **High** | Orange | **Diamond** | Elevated alert |
| **Critical** | Red | **Octagon** | Stop — pre-attentive urgency |

### 5.1 Rules

- **Severity is never communicated by color alone.** Every severity expression must carry **shape + label + icon + color together**. Strip the color (grayscale, color-blind simulation, dim light) and severity must still be unambiguous from shape and text.
- **Shape + label + icon + color travel as one unit.** The `SeverityBadge` component is the single source of truth; no ad-hoc colored dots, no color-only chips, no label without a shape.
- **Low is not green.** Using green for the safe/low end and red for the dangerous end creates a red/green dependency that fails for the most common color-vision deficiencies. Low is **slate/blue** specifically to break that dependency. Green is not used in the severity scale at all.
- **Critical uses an octagon** because the stop-sign silhouette is recognized **pre-attentively** — read as "stop/urgent" before the label is even parsed. This is the one place we lean on cultural shape priming, deliberately.

### 5.2 Ordering and meaning

The scale is monotonic: Low → Medium → High → Critical, increasing in consequence/likelihood band (see §6). Severity is **illustrative** (§6, §13) — a demo model, not a validated risk instrument.

---

## 6. Severity model rationale

### 6.1 The 3×4 matrix

Catch derives a provisional severity band from a deliberately small grid: **3 likelihoods × 4 consequences**.

**Likelihood (3):**
- Rare
- Possible
- Likely

**Potential consequence (4):**
- Minor
- Serious
- Severe
- Catastrophic

**Resulting risk band (4):** Low · Medium · High · Critical

#### Illustrative mapping

|              | **Minor** | **Serious** | **Severe** | **Catastrophic** |
|--------------|-----------|-------------|------------|------------------|
| **Likely**   | Medium    | High        | Critical   | Critical         |
| **Possible** | Low       | Medium      | High       | Critical         |
| **Rare**     | Low       | Low         | Medium     | High             |

> This mapping is an **illustrative severity model**, not a validated or certified risk methodology. It exists to make capture fast and the demo legible.

### 6.2 Why 3×4 and not 5×5

This is a **deliberate speed-first capture model**, not a formal 5×5 risk assessment.

- A 5×5 matrix asks the reporter to make fine distinctions (e.g., "unlikely" vs. "rare") in the field, under time pressure, in gloves. That is exactly the friction Catch exists to remove.
- Three likelihoods and four consequences is the smallest grid that still produces a meaningful four-band output. Fewer choices → faster capture → more reports.

### 6.3 Precision happens later

The reporter's severity is **provisional**. Precision is deferred to triage:

- A **triager** later **confirms or overrides** the reporter's provisional band.
- Any override is **logged with a reason** in the report's activity timeline (§11).
- This preserves speed at capture while allowing accuracy downstream — without ever blaming the reporter for a "wrong" guess.

This split — fast provisional capture, deliberate confirmed triage — is the heart of the severity design.

---

## 7. Voice input rule

**Correct framing:** Voice-to-text is **optional support** for eyes-busy capture and accessibility. It is **not** the primary answer to high-noise environments.

It would be a mistake to position voice as the noise solution — server halls and generator rooms are precisely where speech recognition fails. Voice serves the reporter whose **hands or eyes** are busy, and serves accessibility needs. It never serves as the load-bearing input path.

**The primary noise-resilient interaction is silent and tactile:**

- **Zero-typing tap flow** — a report can be completed entirely by tapping choices.
- **Large touch targets** (≥ 64px, glove-friendly).
- **Skippable evidence** — photo and voice are optional and can be skipped without penalty.
- **Editable text fallback** — anything captured by voice lands in an editable text field the user can correct.
- **Manual text always available** — the user can always type instead of speaking; voice is additive, never required.

Implementation rule: if voice is unavailable, denied permission, or unsupported, the flow must be **fully completable** without it, with no dead ends and no nagging.

---

## 8. Capture interaction rules

The reporter's capture flow is the product's center of gravity. Rules:

- **One-handed, mobile-first.** The flow is designed for a thumb on a phone held in one hand. Reachable primary actions, bottom-anchored where appropriate.
- **Primary actions ≥ 64px tall.** Glove-friendly. Generous spacing.
- **No login wall.** Reporting never requires authentication. Identity is optional (§10).
- **Step-by-step capture.** One decision per step. No long scrolling forms. Smart defaults pre-filled.
- **A report can be submitted with no typing.** The entire required path is tappable (zone → hazard type → severity → review → submit). Typing is always optional.
- **The Review step is one-glance, one-tap.** See the protected rule below.
- **Avoid friction that breaks the 15-second target.** Open-to-confirmed should be achievable in ~15 seconds for a typical zero-typing report. Anything that reliably pushes a normal report past that is a defect.
- **Photo and voice are optional.** Always skippable, never blocking.

### 8.1 The 15-second claim (protected rule)

> The 15-second claim is protected by making the **Review screen a compact confirmation surface, not a full inspection form.**

The Review step shows an **auto-summary** of what was captured (zone, hazard type, provisional severity, optional evidence indicator) in a single glance, with **one primary tap to confirm and submit.** The user is confirming, not re-entering. Editing is available via clearly secondary affordances, but the default, fastest path is **read → confirm.**

Any change that turns Review into a multi-field form to fill out **violates this rule** and breaks the 15-second target.

---

## 9. Offline / sync state machine

Catch is **offline-first**. The reporter must always reach a successful, saved state regardless of connectivity. The following states are canonical. Labels are **exact user-facing strings.**

> **v1 has no backend.** Sync is **simulated / local-only.** Do **not** imply actual server transmission. "Synced" means the local record moved from a pending queue to a synced state within the device — a simulated representation of how real sync would behave.

### State A — Online submitted
- **Label:** `Submitted`
- **Meaning:** Report saved locally and marked synced (simulated).
- **UI:** Confirmation card shows the **report reference**.

### State B — Offline queued
- **Label:** `Saved offline`
- **Meaning:** Report saved locally and queued for sync when connection returns.
- **UI:** Confirmation card shows the **report reference** and the **queued** state.
- **A11y:** `aria-live` announces the queued state.

### State C — Syncing
- **Label:** `Syncing`
- **Meaning:** Connection returned; the app is processing queued local reports (simulated).
- **UI:** **Non-blocking** sync indicator. **Do not remove the report from view.**

### State D — Synced
- **Label:** `Synced`
- **Meaning:** Queued report moved from pending to synced (simulated).
- **UI:** Success state; **preserve the report reference.**

### State E — Sync failed
- **Label:** `Still saved locally`
- **Meaning:** Sync attempt failed, **but the report is not lost.**
- **UI:** **Calm recovery copy**, a **retry** affordance, and **no panic language.** Reassure that the local record is safe.

### 9.1 Transition rules

- Capture **always** reaches A or B. There is no failure state at submission — only "synced now" or "saved offline."
- B → C → D is the recovery happy path when connectivity returns.
- C → E is the recovery sad path; it never loses data and never alarms the user.
- The **report reference** is generated locally at save time and persists across every state.

---

## 10. Anonymous reporting rule

Anonymous reporting **hides the reporter's identity** and **disables reporter-facing status updates** (an anonymous reporter cannot be notified or tracked, by design).

**It does not make the entire audit trail anonymous.** Anonymity covers the *reporter*, not the *system*. The following remain **attributed** in the activity timeline:

- Triager actions
- Manager actions
- System actions
- Assignment actions
- Severity override actions (with reason)
- Status-change actions

In other words: choosing anonymity removes *who reported it*, not *what happened to it afterward*. The downstream chain of custody stays intact and attributed.

UI implication: when anonymous is selected, communicate plainly that status updates won't be available to the reporter, and that everything else about the report's handling is still tracked.

---

## 11. Audit / evidence design rule

- The **per-report Activity timeline is the money shot.** It is the proof that a report went somewhere — the antidote to the "reporting feels pointless" friction (§2.6). Treat it as a flagship surface, not an afterthought.
- **Append-only at the app layer.** Events are added, never modified.
- **No edit/delete UI for activity events.** There is no affordance, anywhere, to alter or remove a logged event.
- **Label it "Simulated immutable record."** That exact framing.
- **Never imply cryptographic immutability or legal recordkeeping.** No hashing claims, no "tamper-proof," no "legally immutable," no chain-of-custody-as-evidence language. It is a *simulated* immutable record in a *prototype* — appended-only at the app layer for demonstration, nothing more.

The timeline demonstrates *what real audit behavior would look like*. It does not assert real audit guarantees.

---

## 12. Component design principles and component-library boundary

Catch components fall into two classes, and the boundary is **locked.**

### 12.1 Plumbing primitives — `shadcn/ui` allowed

`shadcn/ui` may be used **only** for non-semantic plumbing:

- Dialog
- Toast
- Tabs
- Dropdown / Select primitives
- Sheet / Drawer (if needed)
- Tooltip (if needed)

These carry interaction plumbing (focus trapping, portals, a11y wiring) but **no Catch-specific meaning.**

### 12.2 Semantic components — hand-built, Catch-owned

Any component that carries **Catch's design semantics** is **hand-built** and must follow this document's severity shapes, touch targets, dark-first tokens, and claim-safe copy:

- `SeverityBadge`
- `StatusPill`
- `SLATimer`
- Large capture buttons
- `ZonePicker`
- `HazardTypeGrid`
- `SeveritySelector`
- `ConfirmationCard`
- `QueueRow`
- `ActivityTimeline`
- `OfflineBanner`
- `DisclaimerGate`
- `DisclaimerBar`

### 12.3 Reason for the boundary

Catch's semantic components encode product meaning — severity shapes (§5), ≥64px targets (§8), dark-first tokens (§4), and claim-safe copy (§13). Default component-library styling must **not** override the product language. Plumbing is borrowed; **meaning is owned.**

Rule of thumb: *if getting it wrong would weaken a safety/claim/severity semantic, hand-build it. If it's just a portal or a focus trap, borrow it.*

---

## 13. Claim-safe copy patterns

### 13.1 Approved phrases (use these)

- "prototype"
- "demo artifact"
- "simulated"
- "local-only"
- "designed toward WCAG 2.2 AA"
- "illustrative severity model"
- "not for active emergencies"
- "follow your site's emergency procedures"
- "Simulated immutable record"

### 13.2 Forbidden as affirmative user-facing claims

Never present these as things Catch **does**:

- emergency dispatch
- production safety system
- validated risk methodology
- certified compliance
- OSHA compliance
- tamper-proof record
- legally immutable record

### 13.3 The governance exception

**Governance and documentation** (including this file, the README, and the About page) **may discuss forbidden claims as things the product explicitly does NOT claim** — e.g., "Catch is not a production safety system and does not perform emergency dispatch."

**User-facing app copy must never present the forbidden list affirmatively.** The distinction:
- ✅ Governance: "This is **not** a tamper-proof record."
- ✅ App copy: "Simulated immutable record."
- ❌ App copy: "Tamper-proof audit record." (forbidden)

When in doubt, scope down: prefer *simulated*, *local-only*, *illustrative*, *prototype*.

---

## 14. Accessibility acceptance rules

Catch is **designed toward WCAG 2.2 AA** (not certified). The following are acceptance criteria, not aspirations:

- **Touch targets** — primary actions ≥ 64px tall; all interactive targets meet at minimum the WCAG 2.2 target-size guidance, with comfortable spacing for gloves.
- **Contrast** — text and meaningful UI meet AA contrast in the dark theme; verified, not assumed.
- **No color-only meaning** — severity and status always pair color with shape + icon + label (§5). Strip color and meaning survives.
- **Visible focus** — every interactive element has a clear, high-contrast focus indicator. Never remove outlines without an equal-or-better replacement.
- **Screen reader labels** — all controls have accessible names; icons-as-buttons have labels; severity and status are announced with their text, not just their color.
- **`aria-live` for offline / sync / error states** — state changes in §9 (queued, syncing, synced, sync failed) are announced politely. Form-submission errors are announced.
- **Keyboard operability** — the entire flow is operable by keyboard; logical tab order; no keyboard traps; visible focus throughout.
- **`prefers-reduced-motion`** — honor it. No essential information conveyed only through motion; reduce/disable non-essential transitions when requested.
- **Form errors tied to fields** — errors are programmatically associated with their field (`aria-describedby`), shown in text (not color alone), and announced.
- **Editable fallback for voice input** — voice output lands in an editable, correctable field; the flow is fully completable without voice (§7).

A feature is **not done** until it meets these. Accessibility is part of the definition of done, not a later pass.

---

## 15. P0 design scope

P0 establishes the **shell and the guardrails** — the frame the rest of the product hangs on — and deliberately **defers all heavy product surfaces.**

### 15.1 In scope for P0 (build these)

- **App shell** — layout, navigation frame, dark-first tokens applied.
- **Route placeholders** — routes exist and render placeholder surfaces for the planned sections.
- **Role switcher** — switch between roles (e.g., reporter / triager / manager) to demonstrate perspective; drives later attribution.
- **First-run disclaimer gate** (`DisclaimerGate`) — on first run, present the prototype/not-for-emergencies disclaimer the user must acknowledge.
- **Persistent disclaimer footer / link** (`DisclaimerBar`) — always-available reminder: *prototype · not for active emergencies · follow your site's emergency procedures.*
- **Offline banner** (`OfflineBanner`) — visible offline/online status indicator wired to connectivity.
- **Seed data visibility check** — seed data exists and is visibly rendered somewhere, proving the data layer is wired.
- **About page** — explains what Catch is and is not, using claim-safe copy (§13) and the governance exception (§13.3).

### 15.2 Explicitly out of scope for P0 (do NOT build yet)

- Full capture flow
- Triage
- Dashboard
- Audit export
- Charts
- Polish animations

P0 proves the frame, the guardrails, and the claim-safe framing are correct **before** any heavy product surface is built. Building capture, triage, or dashboard in P0 is out of scope and should be rejected.

---

## Appendix A — Enforcement checklist (quick reference)

When reviewing any change, confirm:

- [ ] No language implies production safety, emergency dispatch, validated risk, certified a11y/compliance, or legal/tamper-proof audit (§0, §13).
- [ ] Severity uses shape + label + icon + color together; Low is not green; Critical is an octagon (§5).
- [ ] Severity treated as illustrative/provisional; overrides logged with reason (§6).
- [ ] Primary actions ≥ 64px; flow completable with zero typing; Review is one-glance/one-tap (§8).
- [ ] Capture always reaches "Submitted" or "Saved offline"; sync states use exact labels; sync is simulated/local-only (§9).
- [ ] Anonymity hides reporter only; downstream actions stay attributed (§10).
- [ ] Activity timeline is append-only, no edit/delete UI, labeled "Simulated immutable record" (§11).
- [ ] Semantic components hand-built; shadcn/ui only for plumbing primitives (§12).
- [ ] Accessibility acceptance rules met as definition-of-done (§14).
- [ ] P0 stays within shell scope; heavy surfaces deferred (§15).
