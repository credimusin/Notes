---
title: "Drills: Review Notes"
tags:
  - laravel
  - quality-audit
  - changelog
---

# Review Notes — Drills Code Audit & Quality Setup

This file tracks the steps completed in each phase, the files created/modified, and highlights what needs to be reviewed.

---

## 🛠 Phase 0: Environment & Tooling Setup (Completed)

### What was done:
1. **PHP 8.5 & Laravel 13 Upgrade:**
   - Updated [composer.json](file:///var/home/bmo/Devs/Drills/composer.json) dependencies to target **PHP 8.5+** and **Laravel 13+** (including updates to Breeze and Collision).
   - Updated base image in the dev Dockerfile [docker/development/Dockerfile](file:///var/home/bmo/Devs/Drills/docker/development/Dockerfile) and the production Dockerfile [docker/production/Dockerfile](file:///var/home/bmo/Devs/Drills/docker/production/Dockerfile) to **PHP 8.5**.
   - Added `pdo_sqlite` and `pcov` PHP extensions to the development Dockerfile for testing and coverage.
2. **Quality Tooling Configured:**
   - Created [phpstan.neon](file:///var/home/bmo/Devs/Drills/phpstan.neon) for Larastan analysis (level 5).
   - Configured [rector.php](file:///var/home/bmo/Devs/Drills/rector.php) targeting PHP 8.5+, enabling class name import optimizations, automated composer package detection (Laravel), and advanced prepared sets (naming, codeQuality, codingStyle, carbon, instanceOf). Refactored 71 files to standardize structures across the project.
   - Added `laravel/pao` dependency to format PHPUnit/Pest/PHPStan/Rector and Artisan command output into clean, token-efficient JSON structured messages for AI agents.
   - Created [eslint.config.js](file:///var/home/bmo/Devs/Drills/eslint.config.js) and [.prettierrc](file:///var/home/bmo/Devs/Drills/.prettierrc) for frontend JavaScript formatting and linting.
3. **Execution Script:**
   - Created [check.sh](file:///var/home/bmo/Devs/Drills/check.sh) in the root (and marked it executable) to run Pint, Larastan, Rector, ESLint, Prettier, and Pest tests in a single command.
4. **Audit and Testing Plan:**
   - Created [audit_and_testing_plan.md](file:///var/home/bmo/Devs/Drills/audit_and_testing_plan.md) in the project root outlining the entire audit workflow, including the Git branching strategy, and added guidelines for DDD, SOLID, and design patterns.

### What to review:
* Dockerfiles for the PHP 8.5 base image and extensions changes.
* Package dependencies in `composer.json` and `package.json`.
* Configurations for Larastan, Rector, ESLint, and Prettier.

---

## 🔍 Phase 1: Backend Audit & Fixes (Completed)

### What was done:
* Completed detailed audit of models, controllers, routing, and middlewares.
* Generated [backend_audit_report.md](file:///var/home/bmo/Devs/Drills/backend_audit_report.md) outlining recommendations.
* Implemented fixes for the findings and static analysis errors:
  1. **PHPStan Static Analysis Fixes:** Added generic type declarations and class-level docblocks specifying properties and relationships to all model classes (`User`, `Student`, `Word`, `DailyStat`, `Payment`).
  2. **Rector and Type Compatibility:** Fixed return type definitions in `StudentFactory`, `UserFactory`, and `WordFactory` using `model-property<TModel>` generic arrays to satisfy static analysis return type covariance requirements.
  3. **PWA Sync Robustness:** Wrapped the `DailyStat::firstOrCreate()` call inside the word update sync loop in `PwaController.php` in a `try/catch` block with a database query fallback.
  4. **Email Auto-Normalization:** Added request parameter merges in `StudentController.php` and `UserController.php` to automatically lowercase input emails prior to validation, resolving the normalization inconsistency.
  5. **Migration Concurrency Bug:** Fixed a database migration execution order bug in `2026_02_17_041334_ensure_teachers_have_student_profiles.php` and `2026_05_02_054239_lowercase_existing_emails.php` by using `DB::table(...)` direct queries instead of the Eloquent `User` model, which previously crashed the test migrations because the `SoftDeletes` trait scope queried the `deleted_at` column before it was added to the schema.
  6. **Backend Tests:** Updated `tests/Feature/ProfileTest.php` to assert that the deleted user is soft-deleted (`assertSoftDeleted`) rather than hard-deleted (`assertNull($user->fresh())`) since the `User` model now has soft deletes enabled.
* Verified that all checks run successfully:
  - **Pint Style Check:** 0 style issues.
  - **Rector Refactoring:** 0 changes needed.
  - **Larastan/PHPStan:** 0 errors (No errors).
  - **ESLint & Prettier:** Passed with 0 errors.
  - **Pest Test Suite:** All 42 tests passed (102 assertions).

### What to review:
* Model class docblocks and updated relationship method type hints.
* Null-safety updates and email normalization merges in the controllers.
* Safe direct DB queries in the modified migration files.
* Test suite adjustments in `ProfileTest.php`.

---

## 🎨 Phase 2: Frontend Audit & Fixes (Completed)

### What was done:
1. **PWA Syntax Error Resolution:** Checked and resolved duplicate markup/syntax errors at the end of `resources/views/pwa/index.blade.php`.
2. **CPU Resource Optimization:** Disabled Vite file watcher polling for native Linux environments by removing the `usePolling: true` option in [vite.config.js](file:///var/home/bmo/Devs/Drills/vite.config.js). This resolved the issue of high CPU resource consumption locally when run in dev mode.
3. **Concurrently Runner Adjustment:** Removed `npm run dev` from the concurrently process runner inside the Docker development entrypoint script to prevent duplicate dev server processes.

---

## 🧪 Phase 3: Backend Test Coverage (Completed)

### What was done:
1. **Comprehensive Feature Test Suite:** Expanded the Pest test suite to cover authentication normalization, referral code assignments (allowing teachers to be assigned and preventing students from being assigned as referrers), Robokassa payment processing mock states (success/fail redirect and validation callbacks), word practice daily statistics increments, and access control permissions across different roles.
2. **Database Integrity and Cascade Safety:** Added `tests/Feature/DatabaseIntegrityTest.php` to verify delete cascade behaviors, ensuring that deleting a word via HTTP request does NOT delete the student profile or user account, and that soft deleting a user keeps the student profile/words.
3. **Test Code Coverage:** Elevated test coverage for `UserController` from 0.0% to 96.1% and overall backend coverage to 48.0%.

---

## 🖥 Phase 4: Frontend Test Coverage & Behavior Verification (Completed)

### What was done:
1. **Laravel Dusk E2E Tests:** Fully configured Laravel Dusk E2E browser testing in the Podman development environment.
2. **E2E Vocabulary Workflow Test Suite:** Implemented [tests/Browser/VocabularyWorkflowTest.php](file:///var/home/bmo/Devs/Drills/tests/Browser/VocabularyWorkflowTest.php) testing landing page, dashboard navigation, login flow, adding/editing/deleting words, search input filtering, favorites toggling via Alpine.js, and study mode access.
3. **Admin User Management E2E Test Suite:** Implemented [tests/Browser/AdminUserManagementTest.php](file:///var/home/bmo/Devs/Drills/tests/Browser/AdminUserManagementTest.php) verifying admin dashboard user administration flows (creation, details edit, premium status toggles, deletion).
4. **View Null-Safety Fixes:** Added null-safe operators (`?->`) to student relationships inside admin view files to prevent `ErrorException: Attempt to read property "name" on null` when a user account is soft-deleted but its student profile remains.

---

## 🚀 Phase 5: Code Quality, Automation & Clean Up (Completed)

### What was done:
1. **Check Script Integration:** Integrated code quality and test suites into [check.sh](file:///var/home/bmo/Devs/Drills/check.sh) which runs Pint formatting, Rector modernizations, Larastan PHPStan analysis, ESLint/Prettier frontend formatting, Pest feature tests, and Dusk E2E browser tests in one unified script.
2. **Safe Back Redirection:** Added relative URL `back` redirect parameter support to the edit word link in the student profile view, the global dictionary index, and the edit view. This ensures staff are returned directly to the student page or the global dictionary with active filters preserved, using relative route verification to prevent open redirect vulnerabilities.
3. **Temporary/Draft Files Cleanup:** Removed all temporary files created during the audit process (such as `backend_audit_report.md`, `frontend_audit_report.md`, `audit_and_testing_plan.md`, `review_notes.md`, `repro_404.php`) from the Drills repository, staging their final copies safely inside the user's private Notes vault.
