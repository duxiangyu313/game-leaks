Subject: GoTrue v2.189.0 incompatible with generated columns (migration 20260302000000)

Project Ref: gumpxfxbxxyljikaizsh
GoTrue Version: v2.189.0

**Issue:**
New user signup and first-time login are both broken after auth migration `20260302000000` introduced generated columns.

**Steps to reproduce:**
1. POST /auth/v1/signup with any email/password
2. Returns: `500 unexpected_failure: "Database error saving new user"`
3. If a user is created directly via SQL (bypassing GoTrue), the first login also fails with `500 unexpected_failure: "Database error querying schema"`

**Root cause analysis:**
Migration `20260302000000` added two generated columns in the auth schema:

```sql
-- auth.users
confirmed_at timestamptz GENERATED ALWAYS AS (LEAST(email_confirmed_at, phone_confirmed_at)) STORED

-- auth.identities
email text GENERATED ALWAYS AS (lower((identity_data ->> 'email'::text))) STORED
```

GoTrue v2.189.0 appears to attempt INSERT/UPDATE operations on these generated columns during signup and first-time login, which PostgreSQL rejects because generated columns cannot be written to directly.

**Evidence:**
- The database trigger, profiles table, enum types, and all auth schema objects are intact and correct
- Direct SQL INSERT into auth.users + auth.identities (skipping generated columns) creates a valid user successfully
- Pre-existing users (created before the migration was applied) can log in without issues
- ALTER TABLE to drop the generated expressions fails with `must be owner of table users` — the auth schema is locked by Supabase

**Request:**
Please either:
1. Upgrade GoTrue to a version that properly handles generated columns (does not attempt to write to them), or
2. Provide a supported method to resolve this schema incompatibility

Thank you.
