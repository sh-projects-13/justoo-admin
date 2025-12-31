# Admin auth wiring (frontend)

## Required env

Set one of:

- `NEXT_PUBLIC_BACKEND_URL` (used by the login page in the browser)
- `BACKEND_URL` (used by Next middleware and the logout route handler)

Example (local dev):

- `NEXT_PUBLIC_BACKEND_URL=http://localhost:4000`
- `BACKEND_URL=http://localhost:4000`

Optional:

- `SESSION_COOKIE_NAME` (defaults to `justoo.sid`)

## What is protected

- All routes under `/admin/*` are protected by `middleware.js`, except:

  - `/admin/login` (redirects to `/login`)
  - `/admin/logout` (redirects to `/logout`)

- Root auth entry points:
  - `/login`
  - `/logout`

The middleware checks the presence of the session cookie and (when `BACKEND_URL` is set) validates it by calling `GET /admin/auth/me` with the incoming `cookie` header.
