#!/bin/bash
# ═══════════════════════════════════════════════════════════════
#  PT. KUSUMA LESTARI AGRO — Backend Setup Script
#  Run once from inside the /backend folder.
# ═══════════════════════════════════════════════════════════════

set -e   # Exit immediately on any error

echo ""
echo "╔══════════════════════════════════════════╗"
echo "║   KLA System — Backend Setup            ║"
echo "╚══════════════════════════════════════════╝"
echo ""

# 1. Virtual environment
echo "→ Creating virtual environment..."
python3 -m venv venv
source venv/bin/activate

# 2. Install dependencies
echo "→ Installing Python dependencies..."
pip install --upgrade pip
pip install -r requirements.txt

# 3. Copy .env
if [ ! -f .env ]; then
  echo "→ Creating .env from template..."
  cp .env.example .env
  echo "   ⚠  Edit .env and set SECRET_KEY before deploying to production!"
fi

# 4. Migrations
echo "→ Running migrations..."
python manage.py migrate

# 5. Create superuser (owner)
echo ""
echo "→ Creating superuser account..."
echo "   (This will be your Owner login for the KLA system)"
echo ""
python manage.py createsuperuser --email admin@kla.com || true

echo ""
echo "╔══════════════════════════════════════════╗"
echo "║   ✅  Setup complete!                    ║"
echo "║                                          ║"
echo "║   Start server:                          ║"
echo "║   source venv/bin/activate               ║"
echo "║   python manage.py runserver             ║"
echo "║                                          ║"
echo "║   Backend: http://localhost:8000         ║"
echo "║   Admin:   http://localhost:8000/admin/  ║"
echo "╚══════════════════════════════════════════╝"
echo ""
