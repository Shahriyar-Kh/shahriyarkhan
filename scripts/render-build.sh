#!/usr/bin/env bash
# Render build script (PRE-P01-DH1).
#
# Runs as this service's buildCommand. `set -Eeuo pipefail` makes the whole
# script fail-fast: any failing command (including one inside a pipeline)
# stops execution immediately with a non-zero exit code, which Render
# treats as a failed build - the deploy is cancelled and the previous,
# already-running instance keeps serving traffic (Render's own documented
# behavior). This is the fix for the incident where a later command in a
# plain multi-line buildCommand block could still exit 0 overall even if an
# earlier line (the migration) had failed, letting new code go live against
# an old schema. See docs/rebuild/PRE_P01_DH1_DEPLOYMENT_DIAGNOSIS.md for
# what is and isn't confirmed about that incident.
#
# Deliberately no `set -x`: that would echo every expanded command,
# including any that embed environment-derived values, to the build log.
set -Eeuo pipefail

echo "==> Upgrading packaging tools"
pip install --upgrade pip setuptools wheel

echo "==> Installing production requirements"
pip install -r backend/requirements/prod.txt

echo "==> Django system check (production settings)"
python backend/manage.py check --settings=config.settings.production

echo "==> Applying migrations"
python backend/manage.py migrate --noinput --settings=config.settings.production

echo "==> Verifying no unapplied migrations remain"
python backend/manage.py migrate --check --settings=config.settings.production

echo "==> Collecting static files"
python backend/manage.py collectstatic --noinput --clear --settings=config.settings.production

echo "==> Build complete"
