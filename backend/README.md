# KLA System — Django Backend

**PT. Kusuma Lestari Agro** internal ERP backend.

## Stack
- Django 5.1 + Django REST Framework
- SimpleJWT (access + refresh tokens, blacklist on logout)
- SQLite (dev) / PostgreSQL (production)
- Custom user model with role-based access: `owner | admin | staff`

## Quick Start

```bash
# 1. Go into the backend folder
cd backend

# 2. Run setup (creates venv, installs deps, runs migrations, creates superuser)
chmod +x setup.sh && ./setup.sh

# 3. Start the server
source venv/bin/activate
python manage.py runserver
```

Backend runs at **http://localhost:8000**

## API Endpoints

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| POST | `/api/token/` | ❌ | Login → returns `{ access, refresh, user }` |
| POST | `/api/token/refresh/` | ❌ | Refresh access token |
| POST | `/api/token/blacklist/` | ✅ | Logout (blacklist refresh token) |
| POST | `/api/auth/register/` | ❌ | Register new account |
| GET | `/api/auth/me/` | ✅ | Current user profile |
| PATCH | `/api/auth/me/update/` | ✅ | Update profile (full_name only) |

## Register Endpoint

`POST /api/auth/register/`

**Request:**
```json
{
  "full_name": "Budi Santoso",
  "email":     "budi@kla.com",
  "password":  "SecurePass123",
  "password2": "SecurePass123"
}
```

**Response 201:**
```json
{
  "user": {
    "id":        "uuid...",
    "email":     "budi@kla.com",
    "full_name": "Budi Santoso",
    "role":      "staff",
    "is_active": true
  },
  "access":  "<JWT access token>",
  "refresh": "<JWT refresh token>",
  "message": "Akun berhasil dibuat."
}
```

**Response 400 (email taken):**
```json
{
  "email": ["Email ini sudah terdaftar. Gunakan email lain atau masuk dengan akun yang ada."]
}
```

## User Roles

| Role | Assigned By | Access |
|------|-------------|--------|
| `owner` | Django admin | Full system |
| `admin` | Django admin | Most features |
| `staff` | Default on register | Standard access |

New registrations always get `staff` role. Promote users via Django admin at `/admin/`.

## Project Structure

```
backend/
├── manage.py
├── requirements.txt
├── .env.example          ← copy to .env
├── setup.sh              ← run once to bootstrap
├── kla_project/
│   ├── settings.py
│   ├── urls.py
│   ├── wsgi.py
│   └── auth_views.py     ← custom JWT view (returns user in login response)
├── accounts/             ← Custom user model + auth
│   ├── models.py         ← KLAUser (email-based, role field)
│   ├── serializers.py    ← RegisterSerializer + KLATokenObtainPairSerializer
│   ├── views.py          ← RegisterView, MeView, MeUpdateView
│   ├── urls.py
│   └── admin.py
└── core/                 ← Shared base models (TimeStampedModel, AuditedModel)
```

## Frontend Integration

Copy `frontend_patch/authApi.ts` → `src/features/auth/api/authApi.ts` in your frontend.

The key change: login now sends `email` (not `username`) and the response includes `user` object directly, so no separate `/me/` call needed after login.
