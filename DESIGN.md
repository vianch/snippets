---
# DESIGN.md — machine-readable design tokens (YAML front matter).
# Spec: google-labs-code/design.md (alpha — field names may change).
# Snippets is MULTI-THEME: every value below is the live CSS custom property in
# app/globals.css. The hex shown is the DEFAULT theme ("Shades of Purple", :root).
# ALWAYS author UI with the var(--token) — never the literal hex — so it tracks
# the active [data-theme] (dracula, github-dark/light, catppuccin-latte, ayu-light).
version: alpha
meta:
  name: "Snippets"
  source: "https://snippets.vianch.com"
  updated: "2026-06-05"

# Semantic color ROLES → default hex. Comment = the CSS variable to actually use.
colors:
  primary: "#a599e9" # var(--foreground-color) / var(--purple-color) — brand + default text
  primaryDark: "#6943d8" # var(--blue-color) — deeper interactive / pressed
  accent: "#9effff" # var(--cyan-color) — active state, focus ring, links, selection
  accentWarm: "#ff9d00" # var(--orange-color) — Select trigger value, secondary emphasis
  highlight: "#fad000" # var(--yellow-color) — favorite star, badges of note
  surface: "#1e1e3f" # var(--bg-color-dark) — headers, toolbars, panels, popovers
  surfaceMuted: "#3b2d6b" # var(--current-line) — chips, Select rows, inset fields
  background: "#2d2b55" # var(--bg-color) — page canvas + editor body
  ink: "#a599e9" # var(--foreground-color) — primary text
  inkMuted: "#9a95b8" # var(--gray-color) — secondary text, placeholders, icons at rest
  border: "#3b2d6b" # var(--border-color) — hairlines, dividers, input outlines
  success: "#a5ff90" # var(--green-color) — saved / confirmed state
  warning: "#fad000" # var(--yellow-color)
  error: "#ff628c" # var(--red-color) — destructive, remove, failed

# Named type styles. Family: Inter (UI, next/font), monospace (editor body only).
typography:
  hero:      { fontFamily: "Inter", fontSize: "clamp(2.25rem,5.5vw,4rem)", fontWeight: 700, lineHeight: 1.05, letterSpacing: "-0.02em" }
  display:   { fontFamily: "Inter", fontSize: "clamp(1.75rem,3.5vw,2.75rem)", fontWeight: 700, lineHeight: 1.1, letterSpacing: "-0.01em" }
  title:     { fontFamily: "Inter", fontSize: "1.25rem", fontWeight: 600, lineHeight: 1.3, letterSpacing: "0" }   # var(--big-font-size)
  body-md:   { fontFamily: "Inter", fontSize: "1rem", fontWeight: 400, lineHeight: 1.5, letterSpacing: "0" }      # var(--normal-font-size)
  body-sm:   { fontFamily: "Inter", fontSize: "0.875rem", fontWeight: 400, lineHeight: 1.5, letterSpacing: "0" }  # var(--small-font-size)
  caption:   { fontFamily: "Inter", fontSize: "0.75rem", fontWeight: 500, lineHeight: 1.4, letterSpacing: "0" }   # var(--tiny-font-size)
  label-caps:{ fontFamily: "Inter", fontSize: "0.75rem", fontWeight: 700, lineHeight: 1.0, letterSpacing: "0.05rem", textTransform: "uppercase" }
  code:      { fontFamily: "monospace", fontSize: "0.875rem", fontWeight: 400, lineHeight: 1.5, letterSpacing: "0" }

# Fixed spacing scale (px). Author with rem; agents must use ONLY these steps.
spacing:
  scale: [4, 8, 12, 16, 24, 32, 48, 64]   # 0.25 / 0.5 / 0.75 / 1 / 1.5 / 2 / 3 / 4 rem
  radius: { sm: "0.313rem", md: "0.5rem", lg: "0.75rem", pill: "999px" }  # var(--border-radius{,-md,-lg})
  gutter: "0.625rem"   # legacy 10px bar/edge padding used across editor chrome

# Elevation tokens. e2/e3 are live CSS vars; e0/e1 are conventions.
elevation:
  e0: "none"
  e1: "0 1px 2px rgb(0 0 0 / 24%)"           # resting controls, subtle separation
  e2: "var(--card-shadow)"                   # 0 0.75rem 2rem rgb(0 0 0 / 40%) — menus, popovers, cards
  e3: "var(--card-shadow-hover)"             # 0 1.25rem 2.5rem rgb(0 0 0 / 52%) — modals, hover lift

# Components reference token NAMES above (preferred) or literal hex.
components:
  button-primary:   { backgroundColor: surface, textColor: ink, border: border, radius: sm, padding: "0.313rem 0.625rem" }
  button-secondary: { backgroundColor: surface, textColor: inkMuted, border: border, radius: sm, padding: "0.313rem 0.625rem" }
  button-cta:       { backgroundImage: "linear-gradient(135deg, primary, accent)", textColor: surface, radius: sm, fontWeight: 700 }
  button-saved:     { backgroundColor: success, textColor: surface, radius: pill }  # dirty/unsaved affordance
  icon-button:      { backgroundColor: "transparent", textColor: inkMuted, radius: sm, padding: "0.5rem", hoverBackground: background, hoverColor: accent }
  chip:             { backgroundColor: surfaceMuted, textColor: ink, radius: pill, padding: "0.25rem 0.625rem", removeColor: error }
  input:            { backgroundColor: surface, textColor: ink, border: border, radius: sm, focusRing: accent }
  select:           { backgroundColor: surfaceMuted, valueColor: accentWarm, radius: sm, activeColor: accent }
  card:             { backgroundColor: surface, border: border, radius: lg, elevation: e2 }
  tooltip:          { backgroundColor: surface, textColor: ink, border: border, radius: sm, fontSize: caption }
---

# DESIGN.md — Snippets

<!-- BODY = human-readable rationale. Values live in front matter; intent lives here. -->

## 1. Visual Theme & Atmosphere

Snippets is a focused, keyboard-first code workspace — calm, dark-by-default, and
editorial. Chrome recedes so code is the hero: flat surfaces, hairline borders, a
single saturated accent (cyan) for anything interactive, and warm amber/yellow used
only as a spark of personality. The system is fully theme-driven — six palettes
swap via `[data-theme]` — so the design lives in **token roles**, not fixed hues.

## 2. Color Palette & Roles

Use the `var(--token)` named in each front-matter comment, never the hex.

- `primary` (`--foreground-color`): brand identity and default text.
- `accent` (`--cyan-color`): the one interactive color — hover, active, focus rings, links, selection.
- `accentWarm` (`--orange-color`) / `highlight` (`--yellow-color`): emphasis only (Select value, favorite star). Never large fills.
- `surface` (`--bg-color-dark`) vs `background` (`--bg-color`): surface for raised chrome (headers, toolbars, panels); background for the editor canvas.
- `surfaceMuted` (`--current-line`): inset elements — chips, Select rows.
- `ink` / `inkMuted`: primary vs secondary text and resting icons.
- `success` / `warning` / `error`: state and feedback only (saved, dirty, destructive).

## 3. Typography Rules

- One family: **Inter** for all UI; **monospace** only inside the editor and code spans.
- Headings 600–700; body 400; `caption`/`label-caps` 500–700.
- `label-caps` is uppercase with `0.05rem` tracking — eyebrows and section labels only.
- Editor name/title fields read as `title` (600) — they are content, not form chrome.

## 4. Component Stylings

States everywhere: default / hover / active / focus / disabled.

- **Buttons**: one `button-cta` per primary surface; `button-primary`/`button-secondary` otherwise. Hover lifts to `accent`/`inkMuted`; focus → 2px `accent` ring; disabled → reduced opacity, no pointer.
- **Icon buttons** (toolbar/actions): transparent at rest with `inkMuted` glyph; hover fills `background` and colors the glyph `accent`; active/toggled stays `accent`; `:active` scales to 0.95. Always carry a tooltip + `aria-label`.
- **Chips** (tags): `surfaceMuted` pill; remove (`×`) is `error`-tinted and only shown when removable, revealed on hover/focus.
- **Inputs**: `input` token; focus swaps border to `accent`. Title inputs are borderless until focus.
- **Select**: `surfaceMuted` trigger with `accentWarm` value; open menu is `e2`, active row `accent`.
- **Tooltips**: `surface` + hairline border, `caption` text, fade in on hover.

## 5. Layout Principles

- Base unit 8px; pull every gap/padding from `spacing.scale`. Editor chrome uses the legacy `0.625rem` edge gutter.
- Editor chrome bars are a fixed `3.2rem` tall; keep new chrome on that rhythm.
- Breakpoints: phone 576, tablet 768, desktop 1024; the editor collapses its action rail at **1140px** (actions move to a fixed bottom bar on mobile).
- Content max width `1200px` on marketing/canvas surfaces.

## 6. Depth & Elevation

- Flat by default — prefer hairline `border` over shadow inside the app shell.
- `e2` for menus, popovers, the details dropdown, and cards; `e3` for modals and hover lift.
- No shadow offset above ~12px. One elevation step per surface — never stack cards.

## 7. Do's and Don'ts

- DO use `var(--token)` for every color, radius, and shadow — the app is multi-theme.
- DO reserve `accent` (cyan) for interactive elements only.
- DO give every icon-only control a tooltip and an `aria-label`.
- DO keep body text contrast ≥ 4.5:1 and large text ≥ 3:1 against its surface.
- DON'T hardcode hex (e.g. `fill="#f1fa8c"`) — map to a role token instead.
- DON'T introduce colors, fonts, radii, or shadows outside this file.
- DON'T use more than one primary/CTA action per surface.
- DON'T add a second full-height chrome bar where one row with grouping will do.

## 8. Responsive Behavior

- Below 1140px the editor's action rail hides and reappears as a centered fixed bottom bar; the title/Save row stays.
- Stack split panes (editor + preview/chat) vertically on mobile; the resizer is desktop-only.
- Touch targets ≥ 44px; icon buttons keep `0.5rem` padding minimum on touch.
- Keep the spacing scale on mobile — reduce container padding, not the base unit.

## 9. Agent Prompt Guide

When generating or editing UI, always:

1. Read this file before writing any markup or styles.
2. Use only tokens defined here, via `var(--token)` — no ad-hoc hex/sizes.
3. Map requested intent to a semantic role ("main action" → `button-cta`; "interactive" → `accent`).
4. Validate every text/background pair against WCAG AA across light AND dark themes before finalizing.
5. Apply hover/active/focus/disabled states per Section 4; give icon buttons tooltips + `aria-label`.
6. If a needed token is missing, add the CSS variable to every `[data-theme]` block in `app/globals.css` and document it here — never invent a one-off value.
