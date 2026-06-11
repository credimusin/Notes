---
title: "Drills: Audit and Testing Plan"
tags:
  - laravel
  - quality-audit
  - testing-plan
---

# Code Audit and Test Coverage Plan for Drills (Laravel 13 / PHP 8.5+ / Vite / Alpine.js)

This document outlines the step-by-step plan to perform a thorough audit of the **Drills** codebase, implement backend and frontend test coverage, configure static analysis and refactoring tools (Larastan, Rector), and set up pre-push or CI automated quality checks.

---

## 🌿 Git & Branching Workflow
The `master` branch is protected and direct pushes are disabled. 
For each phase/iteration of this plan, we will create a dedicated branch and submit pull requests:
- **Phase 1 (Backend Audit):** `feature/backend-audit`
- **Phase 2 (Frontend Audit):** `feature/frontend-audit`
- **Phase 3 (Backend Testing):** `feature/backend-tests`
- **Phase 4 (Frontend Testing):** `feature/frontend-tests`
- **Phase 5 (Automation & Quality Checks):** `feature/automated-checks`

---

## 📐 Architecture, Design Patterns, & Code Quality Guidelines
During the audit and refactoring processes, the following principles must be integrated:
- **DDD (Domain-Driven Design):** Strive for clear domain separation. Isolate core logic from HTTP inputs or database concerns.
- **SOLID Principles:** Validate that single responsibility, open-closed, interface segregation, and dependency inversion principles are followed.
- **Design Patterns:** Identify opportunities to utilize appropriate design patterns (e.g., Service Layer, Repository, Factory, Strategy) to simplify logic.
- **Pattern Violations Handling:**
  - If a violation can be addressed with minimal changes, resolve it as part of the phase's fixes.
  - If a violation requires extensive refactoring, document the architecture issue and create a separate roadmap/task ticket (outside the scope of this audit) to address it safely.

---

## 📋 Table of Contents
1. [Phase 0: Environment & Tooling Setup](#phase-0-environment--tooling-setup)
2. [Phase 1: Backend Audit (Detailed Analysis)](#phase-1-backend-audit-detailed-analysis)
3. [Phase 2: Frontend Audit (Aesthetics & Interaction)](#phase-2-frontend-audit-aesthetics--interaction)
4. [Phase 3: Backend Test Coverage](#phase-3-backend-test-coverage)
5. [Phase 4: Frontend Test Coverage & Behavior Verification](#phase-4-frontend-test-coverage--behavior-verification)
6. [Phase 5: Code Quality & Automated Checks (Pint, Larastan, Rector, Pre-push)](#phase-5-code-quality--automated-checks)

---

## 🛠 Phase 0: Environment & Tooling Setup
Before auditing, we need to prepare the Docker-based development environment to run code quality, linting, and testing tools inside the container.

- [x] **Docker / Podman Dev Environment Updates:**
  - Add PHP extensions (e.g., `pdo_sqlite` if missing, or code coverage tools like `pcov`) to `docker/development/Dockerfile`.
  - Ensure Node.js tools are fully configured inside the container.
- [x] **Backend Quality Tooling Installation:**
  - Install **Larastan** (PHPStan for Laravel) as a dev dependency.
  - Install **Rector** as a dev dependency.
  - Create configuration files (`phpstan.neon` and `rector.php`).
- [x] **Frontend Linting & Formatting Installation:**
  - Install **ESLint** and **Prettier** for Javascript (Alpine.js integration) and CSS/Tailwind.
  - Create config files (`eslint.config.js` and `.prettierrc`).

---

## 🔍 Phase 1: Backend Audit (Detailed Analysis)
The backend audit will examine codebase security, structure, data flows, and adherence to rules outlined in `GEMINI.md`.

- [x] **1.1 Authentication & Registration Flow Audit:**
  - Verify case-insensitive email handling: registration, login, and profile update (emails must always be normalized to lowercase).
  - Inspect the referral link logic: user logs in/registers with `?ref=CODE`. Check if referral cookies/session variables are captured and if the referrer is indeed a `teacher` to assign `teacher_id` correctly.
- [x] **1.2 Database & Eloquent Models Audit:**
  - **User:** Check role validation ('admin', 'teacher', 'user') and referral code generation.
  - **Student:** Check relationship with `User` (teacher) and profile details.
  - **Word:** Check favorite and learned states, vocabulary mastery tracking, and query scopes.
  - **DailyStat:** Check how daily progress is stored and aggregated.
  - **Payment:** Verify transaction logging and validation.
- [x] **1.3 HTTP Controllers & Routing Audit:**
  - Check controller structures: Standard Laravel resource controller patterns, CRUD separation, logic leaks.
  - Review `PwaController` and offline capabilities backend integration.
  - Review `StudyController` logic for practicing vocabulary.
  - Check validation rules in Requests classes.
- [x] **1.4 Security & Middlewares Audit:**
  - Analyze middlewares: `CaptureReferral`, `CheckActiveStatus`, `SecurityHeaders`, `TrustHosts`.
  - Validate security headers configuration.
  - Ensure route protections (admin-only routes, teacher-only routes, user/student views separation).

---

## 🎨 Phase 2: Frontend Audit (Aesthetics & Interaction)
A thorough evaluation of layout, interactivity, and mobile/PWA performance.

- [x] **2.1 UI/UX & Aesthetics Audit:**
  - Verify modern design principles (gradients, dark modes, cohesive Tailwind/CSS layouts, premium typography).
  - Audit templates (`resources/views/`) for clean hierarchy, responsiveness, and consistent styles.
- [x] **2.2 Alpine.js & Frontend State Audit:**
  - Review Alpine.js components inside Blade views for state management.
  - Audit interactions: favorites toggling, marking words as learned, interactive practice cards.
- [x] **2.3 PWA & Offline Capabilities Audit:**
  - Audit service worker logic, manifest, and assets caching.
  - Check offline data storage using **Dexie.js** (IndexedDB wrapper).
  - Verify sync mechanisms when reconnecting (offline learning queue syncing back to the database).
- [x] **2.4 Confetti & Animations Audit:**
  - Check execution of visual rewards like `canvas-confetti` upon word mastery.
  - Ensure micro-animations improve feel without lag.

---

## 🧪 Phase 3: Backend Test Coverage
We will expand the existing Pest test suite to cover all critical paths.

- [x] **3.1 Authentication & Referral Tests:**
  - Test case-insensitive email normalization.
  - Test registration with `?ref=TEACHER_CODE` (user role set to user, linked to teacher).
  - Test registration with `?ref=STUDENT_CODE` (should NOT link to student since only teachers can be assigned as teachers).
- [x] **3.2 Word Practice & Mastery Tests:**
  - Test marking words as learned and checking stats updates.
  - Test favoriting/unfavoriting words.
  - Test listing and filtering words (favorites, learned, active).
- [x] **3.3 Role & Access Control Tests:**
  - Test that admins can view all dictionary items and filter by student.
  - Test that teachers can only view their students' stats and progress.
  - Test that students can only see and study their own words.
- [x] **3.4 Payment Processing Tests:**
  - Mock Robokassa SDK/API responses.
  - Test successful payment flow (marking users/students as premium or active).
  - Test failed payment handling and logs.

---

## 🖥 Phase 4: Frontend Test Coverage & Behavior Verification
Testing frontend components and interactive states.

- [x] **4.1 Blade & Alpine.js Behavior Verification:**
  - Use Laravel HTTP testing to assert the presence of CSS/JS, meta tags, and structured elements.
  - Write tests checking DOM changes based on Alpine state.
- [x] **4.2 Offline Client-Side Flow Verification:**
  - Setup scripts or mock environments to test offline status.
  - Validate that Dexie.js successfully loads offline records and syncs.
- [x] **4.3 E2E/Browser testing (Laravel Dusk):**
  - Configured and installed Laravel Dusk in the container dev environment (including Chromium and ChromeDriver).
  - Cleaned up boilerplate tests (`tests/Unit/ExampleTest.php` and `tests/Browser/ExampleTest.php`).
  - Implemented comprehensive E2E tests (`tests/Browser/VocabularyWorkflowTest.php`) verifying page elements, dynamic login/navigation, search/favorites filtering, word editing, and study mode access.
  - Specifically verified that UI delete actions perform safely (deleting a word does not delete user/student profiles).

---

## 🚀 Phase 5: Code Quality & Automated Checks
Setting up automatic validations to run locally or on push.

- [x] **5.1 Formatting and Linting Automation:**
  - Automate Laravel Pint checks for PHP styling.
  - Set up ESLint and Prettier for JS and CSS formatting.
- [x] **5.2 Static Analysis & Refactoring Integrations:**
  - Set up Larastan configuration (`phpstan.neon`) at level 5 or higher to detect type mismatches, missing methods, etc.
  - Set up Rector rules (`rector.php`) for automatic modernization to PHP 8.5+ and Laravel 13 codebases.
- [x] **5.3 Git Hooks / Local Automation:**
  - Write a local shell pre-push git hook (`.git/hooks/pre-push`) or a script `check.sh` that runs:
    1. Laravel Pint style check
    2. Larastan analysis
    3. Rector dry-run
    4. Frontend linter (ESLint/Prettier)
    5. PHP/Pest test suite
  - Integrate these checks into a sample GitHub Actions pipeline (if a CI workflow is desired in the future).
