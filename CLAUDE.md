# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

A static single-page Arabic/RTL web application for MUST (Misr University for Science and Technology) that automates academic quality reporting. The UI is fully in Arabic (RTL layout). There is no build system, package manager, or backend — open `index.html` directly in a browser to run.

## Architecture

All state is in-memory (page refresh resets everything). The app is structured as a single HTML file with JS split across modules:

- **`js/auth.js`** — User auth (login/signup), role-based access (`admin` vs `viewer`), nav visibility, and `applyViewerMode()` which disables form inputs for viewers. Exports globals: `currentUser`, `guardedNav()`, `updateNavAuth()`, `updateNavLinks()`, `updateHomeSections()`.
- **`js/ui.js`** — Shared utilities: `showPage(id)` (shows `#page-{id}` div), `showToast()`, tab switching, stat count updates.
- **`js/courseFile.js`** — Course file report logic. Maintains `courseFileReports[]` array. Contains `COURSE_CODES` (hardcoded list of CS/IS/AI/MATH courses) and `CF_DOCS` (checklist of required documents). Handles form rendering, PDF/Excel export.
- **`js/qualityStandards.js`** — Quality standards evaluation. Maintains `qualityStandardsReports[]`. Contains `INSTITUTIONAL_STANDARDS` and `PROGRAMMATIC_STANDARDS` arrays with indicator counts. Renders interactive cards with status dropdowns (مستوفي / مستوفي جزئي / غير مستوفي).
- **`js/slider.js`** — Auto-advancing hero image slider (IIFE, 4.5s interval).
- **`css/style.css`** — All styles, RTL-aware.

## Page Navigation

Pages are shown/hidden via CSS class `.active` on `div.page` elements. `showPage('home')` shows `#page-home`. The sub-navigation (`#app-subnav`) is only visible when logged in. `guardedNav(page, el, requiredRole)` enforces role checks before navigating.

## Role System

- **guest** — sees only the home page hero/guest section
- **viewer** — can view reports (`view-reports` page); form inputs are disabled via `applyViewerMode()`
- **admin** — full access to Course File and Quality Standards report forms

Auth is purely client-side with no persistence. The `users[]` array in `auth.js` is the in-memory user store.

## Key Patterns

- All user-facing strings are Arabic. Toast messages use `showToast(msg, 'success'|'error')`.
- DOM IDs follow `page-{name}`, `nav-{name}`, `cf-{field}` (course file), `qs-{field}` (quality standards).
- Export buttons (PDF/Excel) should never be disabled in viewer mode — checked by text content in `applyViewerMode()`.
