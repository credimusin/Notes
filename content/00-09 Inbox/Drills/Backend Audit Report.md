---
title: "Drills: Backend Audit Report"
tags:
  - laravel
  - quality-audit
  - backend
---

# Backend Audit Report — Drills (Laravel 13)

This report details architectural issues, inconsistencies, inefficiency bugs, and security concerns identified during the backend audit (Phase 1.1 - 1.4).

---

## 🔍 1. Key Audit Findings

### 🔴 1. Database Concurrency Risks (PWA Cloud Sync)
* **Location:** [PwaController.php:L114-L119](file:///var/home/bmo/Devs/Drills/app/Http/Controllers/PwaController.php#L114-L119)
* **Issue:** When a word status is updated to "learned" during a PWA sync transaction, the code calls `DailyStat::firstOrCreate()` to obtain the day's record. Unlike other files (e.g. `DashboardController`, `StudyController`, `session_results` in `PwaController`), this specific call is **not** wrapped in a `try/catch` block.
* **Risk:** In cases of high concurrency or network retries, a duplicate key exception (violating the unique index `['student_id', 'date']`) will be thrown. This will abort the database transaction, causing the entire sync operation to fail and returning a `500 Server Error` to the client.
* **Recommended Fix:** Wrap `firstOrCreate()` in a `try/catch` block, falling back to `where('student_id', $student->id)->where('date', $today)->first()` on exceptions.

---

### 🟡 2. Inefficient SQL Operations (Daily Stats Accumulation)
* **Location:** [StudyController.php:L211-L214](file:///var/home/bmo/Devs/Drills/app/Http/Controllers/StudyController.php#L211-L214)
* **Issue:** In the `storeSession` endpoint, the controller updates daily stats by executing three separate `increment()` calls consecutively, followed by a final `save()` call:
  ```php
  $dailyStat->increment('time_spent', $request->time_spent);
  $dailyStat->increment('attempts_count', $totalThisSession);
  $dailyStat->increment('correct_count', $correctThisSession);
  $dailyStat->save();
  ```
* **Performance Impact:** Calling `increment()` immediately runs an UPDATE SQL query in the database. This pattern generates **4 database write operations** instead of 1 unified write query.
* **Recommended Fix:** Change the code to increment the attributes in-memory first, and persist them with a single `save()` call:
  ```php
  $dailyStat->time_spent += $request->time_spent;
  $dailyStat->attempts_count += $totalThisSession;
  $dailyStat->correct_count += $correctThisSession;
  $dailyStat->save();
  ```

---

### 🟡 3. Case-Insensitive Email Inconsistencies (UX Discrepancy)
* **Location:** [StudentController.php:L52](file:///var/home/bmo/Devs/Drills/app/Http/Controllers/StudentController.php#L52), [UserController.php:L62](file:///var/home/bmo/Devs/Drills/app/Http/Controllers/UserController.php#L62), [UserController.php:L121](file:///var/home/bmo/Devs/Drills/app/Http/Controllers/UserController.php#L121)
* **Issue:** Emails are normalized to lowercase during registration (`RegisteredUserController`), login (`LoginRequest`), and profile updates (`ProfileUpdateRequest`) using `$request->merge()` or `prepareForValidation()`.
  However, in `StudentController` (student creation) and `UserController` (user creation/update by admin), the application enforces the `'lowercase'` validation rule.
* **Impact:** If an admin/teacher creates a user and types `User@Example.com`, the request is rejected with a validation error rather than automatically converting it to lowercase. Furthermore, if case-sensitive emails bypass validation, unique constraint checks will fail in case-sensitive databases (like default PostgreSQL setups).
* **Recommended Fix:** Standardize validation across all controllers by lowercasing emails via request merging or using custom form request classes with `prepareForValidation()`.

---

## 🟡 4. Redundant User Premium Field
* **Location:** [User.php:L25](file:///var/home/bmo/Devs/Drills/app/Models/User.php#L25)
* **Issue:** The `premium` column on the `users` table is defined in the Eloquent model fillable array and cast as a boolean, but it is not used in authorization or word-limit check logic. Instead, the application checks `$student->is_premium`.
* **Impact:** Unused database field and dead model property.
* **Recommended Fix:** Retain it for potential future plans or deprecate/remove the unused `users.premium` column to clean up the schema.

---

### 🔵 5. Route Protection Bypass (Email Verification)
* **Location:** [web.php:L20-L47](file:///var/home/bmo/Devs/Drills/routes/web.php#L20-L47)
* **Issue:** The `/dashboard` route is protected by both `auth` and `verified` middlewares. However, other critical endpoints like `/app` (PWA index), `/study`, and `/profile` are only protected by `auth`.
* **Impact:** If email verification is mandatory, unverified users can bypass verification and directly use the app by visiting `/app` or `/study` instead of `/dashboard`.
* **Recommended Fix:** If email verification is required to use the system, the `verified` middleware should be applied to the entire authenticated route group in `web.php`.
