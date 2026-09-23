#!/usr/bin/env bash
set -euo pipefail

SITE_ID="2b01d84c-f2eb-4e6d-a486-0546ffcac16e"

if [ -z "${NETLIFY_AUTH_TOKEN:-}" ]; then
  echo "NETLIFY_AUTH_TOKEN is not set."
  echo "Authenticate with Netlify or provide the token securely in your environment."
  exit 1
fi

npm install
npm run build
npx --yes netlify-cli@latest deploy --build --prod --site "$SITE_ID" --auth "$NETLIFY_AUTH_TOKEN"
