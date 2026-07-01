---
name: frontend-a11y-checklist
description: >
  Project-specific deep accessibility review checklist for WCAG 2.1 AA compliance,
  semantic HTML, ARIA attributes, keyboard navigation, focus management, color
  contrast, screen reader behavior, modal traps, and responsive accessibility.
  Use as an optional deep-dive skill when the frontend-review-checklist surfaces
  a11y concerns or when a thorough accessibility audit is requested.
license: MIT
compatibility: Works alongside pr-review skill.
metadata:
  author: ops
  version: "1.0"
---

# Frontend Accessibility Checklist Skill

## When to Use

Trigger this skill as an optional deep-dive when:
- The main `frontend-review-checklist` surfaces accessibility concerns
- A thorough WCAG 2.1 Level AA audit is requested
- New UI components or complex interactive patterns are introduced
- Modal, dialog, or overlay patterns are added or changed
- Form complexity increases and needs validation accessibility review

## Review Discipline

- [ ] Inspect the **full changed file**, not just the diff — diffs can hide broken context around the change
- [ ] Verify you are reviewing the correct diff target before drawing conclusions
- [ ] Every finding must cite exact file paths, line numbers, or code evidence; no speculative severity claims

## Semantic HTML

- [ ] Correct HTML element used for content purpose (`<nav>`, `<main>`, `<header>`, `<section>`, `<aside>`, `<article>`)
- [ ] `<button>` used for actions, not `<div onClick>`
- [ ] `<a>` used for navigation, not `<div onClick>`
- [ ] Heading hierarchy is logical (no skipped levels)
- [ ] Lists use `<ul>`, `<ol>`, `<dl>` where semantically appropriate
- [ ] Tables use `<th>`, `<caption>`, and `scope` attributes for data tables

## ARIA Attributes

- [ ] `aria-label` on icon-only buttons and inputs without visible labels
- [ ] `aria-labelledby` used for complex composite widgets
- [ ] `aria-describedby` used for helper text, error text, or supplementary descriptions
- [ ] `aria-required="true"` on required form fields
- [ ] `aria-invalid="true"` on fields with validation errors
- [ ] `aria-expanded` on collapsible triggers (accordions, dropdowns)
- [ ] `aria-hidden="true"` on decorative elements
- [ ] `role="alert"` or `aria-live="polite"` on dynamic error messages
- [ ] `role="status"` on loading indicators or status updates

## Labels and Forms

- [ ] Every `<input>` has an associated `<label>` via `htmlFor` + `id`
- [ ] `<fieldset>` and `<legend>` group related radio buttons or checkboxes
- [ ] Error messages are programmatically associated with their fields (`aria-describedby`)
- [ ] Required field indicators are accessible (`aria-required`, not just visual asterisk)
- [ ] Placeholder text is not used as the only label
- [ ] Autocomplete attributes set on common fields (`email`, `name`, `tel`)

## Keyboard Navigation

- [ ] All interactive elements are reachable via Tab
- [ ] Tab order follows logical document flow (no positive `tabindex`)
- [ ] Custom widgets implement expected keyboard patterns (arrows for lists, Escape for dismiss)
- [ ] No keyboard traps (user can always Tab away from any element)
- [ ] Skip navigation link present and functional
- [ ] Custom key handlers use `onKeyDown`, not `onKeyPress` (deprecated)

## Focus Management

- [ ] Focus is visible on all interactive elements (`:focus-visible` styles defined)
- [ ] Focus is not removed without providing an alternative
- [ ] Focus moves into modals/dialogs when opened
- [ ] Focus is trapped inside open modals
- [ ] Focus is restored to trigger element when modal closes
- [ ] Route changes announce to screen readers (via focus management or live region)
- [ ] Dynamic content updates do not steal focus unexpectedly

## Color and Contrast

- [ ] Text meets 4.5:1 contrast ratio against background (3:1 for large text, 18px+ or 14px+ bold)
- [ ] Non-text elements meet 3:1 contrast ratio (icons, borders, form control boundaries)
- [ ] Color is never the sole indicator of state (error/success/warning use icons + text + color)
- [ ] Focus indicators meet 3:1 contrast ratio
- [ ] Information is not conveyed through color alone

## Screen Reader Behavior

- [ ] Decorative images have `alt=""` or `aria-hidden="true"`
- [ ] Informative images have descriptive `alt` text
- [ ] Icon-only buttons have accessible names that make sense without visual context
- [ ] Loading states announce to screen readers (via `aria-live` or `role="status"`)
- [ ] Dynamic list updates are announced via live regions
- [ ] Complex widgets have appropriate `role` attributes
- [ ] `visually-hidden` utility class used for screen-reader-only content

## Modal and Dialog Accessibility

- [ ] Modal has accessible name via `aria-labelledby` pointing to title element
- [ ] Modal has description via `aria-describedby` when applicable
- [ ] `role="dialog"` or `role="alertdialog"` present
- [ ] `aria-modal="true"` present
- [ ] Focus moves to modal content when opened
- [ ] Focus is trapped within modal
- [ ] Escape key closes non-blocking modals
- [ ] Close button has `aria-label`
- [ ] Background scroll is locked while modal is open
- [ ] Focus returns to trigger element on close

## Responsive and Touch Accessibility

- [ ] Touch targets are at least 44x44 CSS pixels
- [ ] Content is readable and functional at 200% zoom
- [ ] No horizontal scrolling at 320px viewport width (WCAG 1.4.10)
- [ ] Hover-dependent interactions have non-hover alternatives
- [ ] Motion/animation respects `prefers-reduced-motion`

## Route Away When

Do **not** own these findings. Route them to the appropriate specialist:

| Finding type | Route to |
|---|---|
| General frontend correctness (beyond a11y) | @frontend-reviewer with `frontend-review-checklist` |
| Architecture (module boundaries, layering) | @architecture-reviewer |
| Test coverage and test quality | @test-reviewer |
| Code-level quality (naming, duplication, readability) | @code-quality-reviewer |

## Output

Structure the report using the standardized reviewer format:

- **Agent**: `frontend-reviewer` (with `frontend-a11y-checklist`)
- **Verdict**: PASS | FAIL | PASS_WITH_WARNINGS
- **Severity distribution**: count per severity level
- **Scope**: files and components reviewed
- **Confidence**: HIGH | MEDIUM | LOW
- **Findings table**: columns — Sev, Category, Location (file + line), Evidence, Impact, Recommended fix, Suggested agent
- **Validation**: commands run with exact results, or NOT_AVAILABLE
- **Follow-up**: reviewers to rerun, implementers to delegate
