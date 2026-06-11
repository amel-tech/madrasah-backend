#!/usr/bin/env bash
# scripts/setup-keycloak.sh
#
# Idempotent Keycloak setup for local e2e against the docker-compose
# `keycloak` service. Run from the repo root (or anywhere — script cds
# itself).
#
# Creates:
#   - realm:        amel-tech-dev
#   - realm role:   SYSTEM_ADMIN
#   - clients:      tedrisat-api  (public, direct grants — backend API + test)
#                   tedris-dev    (SPA, public + PKCE, localhost:4000)
#                   nizam-dev     (SPA, public + PKCE, localhost:4001)
#                   Both SPA clients ship an audience mapper that emits
#                   `aud: tedrisat-api` so the backend can later verify
#                   audience without re-binding clients.
#   - users:        admin-user / owner-user / stranger-user
#                   (passwords match the username for dev ergonomics)
#   - role assign:  SYSTEM_ADMIN → admin-user
#
# Prints the three users' `sub` (UUID) values at the end so you can seed
# matching rows in the `decks` table — e.g. set a private deck's
# `author_id` to `owner-user`'s sub to exercise the DECK_OWNER path.
#
# Re-run is safe: every step checks whether the target already exists
# before creating it.
#
# Usage:
#   ./scripts/setup-keycloak.sh             # uses defaults (admin/admin)
#   KC_ADMIN_USER=root KC_ADMIN_PASSWORD=… ./scripts/setup-keycloak.sh

set -euo pipefail

SERVICE="${KEYCLOAK_SERVICE:-keycloak}"
KC_ADMIN_USER="${KC_ADMIN_USER:-admin}"
KC_ADMIN_PASSWORD="${KC_ADMIN_PASSWORD:-admin}"

REALM="${REALM:-amel-tech-dev}"
ADMIN_ROLE="SYSTEM_ADMIN"
API_CLIENT_ID="tedrisat-api"

# Frontend SPA clients: `clientId:port` pairs. The script enforces PKCE
# (S256) and adds an audience mapper that emits `aud: ${API_CLIENT_ID}`
# on the access token, so the backend can validate audience uniformly
# regardless of which SPA issued the request.
SPA_CLIENTS=(
  "tedris-dev:4000"
  "nizam-dev:4001"
)

# username : password pairs
USERS=(
  "admin-user:admin"
  "owner-user:owner"
  "stranger-user:stranger"
)

# Discover the compose project root (script lives in <root>/scripts/)
cd "$(dirname "$0")/.."

# Convenience wrapper: run kcadm.sh inside the keycloak container.
kc() {
  docker compose exec -T "${SERVICE}" /opt/keycloak/bin/kcadm.sh "$@"
}

# Make sure the container is up and authenticated.
if ! docker compose ps "${SERVICE}" --format '{{.State}}' | grep -q running; then
  echo "Error: docker compose service '${SERVICE}' is not running. Start it first:" >&2
  echo "  KEYCLOAK_PORT=8088 docker compose up -d ${SERVICE}" >&2
  exit 1
fi

echo "[1/5] Authenticating to Keycloak master realm…"
kc config credentials \
  --server http://localhost:8080 \
  --realm master \
  --user "${KC_ADMIN_USER}" \
  --password "${KC_ADMIN_PASSWORD}" \
  >/dev/null

echo "[2/5] Ensuring realm '${REALM}' exists…"
if kc get "realms/${REALM}" --fields realm >/dev/null 2>&1; then
  echo "      already exists — skipping"
else
  kc create realms -s "realm=${REALM}" -s enabled=true >/dev/null
  echo "      created"
fi

echo "[3/5] Ensuring realm role '${ADMIN_ROLE}' exists…"
if kc get "roles/${ADMIN_ROLE}" -r "${REALM}" --fields name >/dev/null 2>&1; then
  echo "      already exists — skipping"
else
  kc create roles -r "${REALM}" -s "name=${ADMIN_ROLE}" >/dev/null
  echo "      created"
fi

# Helper: look up the internal UUID of a client by its clientId.
client_uuid_by_id() {
  kc get clients -r "${REALM}" -q "clientId=$1" --fields id 2>/dev/null \
    | grep -oE '"id" : "[^"]+"' | head -n1 | sed 's/.*"\([^"]*\)"$/\1/' || true
}

# Helper: fetch a confidential client's secret.
client_secret() {
  kc get "clients/$1/client-secret" -r "${REALM}" 2>/dev/null \
    | grep -oE '"value" : "[^"]+"' | head -n1 | sed 's/.*"\([^"]*\)"$/\1/' || true
}

# All clients are created/updated as **confidential** with Keycloak's
# Authorization Services enabled — per project policy "Client
# authentication ON, Authorization ON". A service account is created
# automatically (required by Authorization Services).
#
# NOTE for SPAs: confidential clients require a client_secret on the
# auth-code/token exchange. Browser-only SPAs cannot keep a secret
# safely; the standard mitigation is a backend BFF that holds the
# secret. This script honors the requested setting but flags the risk
# in the final summary so it is not silently forgotten.
CONFIDENTIAL_FLAGS=(
  -s publicClient=false
  -s serviceAccountsEnabled=true
  -s authorizationServicesEnabled=true
)

# Reapply the confidential / auth-services settings on an existing
# client. Safe to call multiple times.
enforce_confidential() {
  local uuid="$1"
  kc update "clients/${uuid}" -r "${REALM}" "${CONFIDENTIAL_FLAGS[@]}" >/dev/null
}

echo "[4a/5] Ensuring API client '${API_CLIENT_ID}' exists (confidential + authz services)…"
api_uuid=$(client_uuid_by_id "${API_CLIENT_ID}")
if [[ -n "${api_uuid}" ]]; then
  echo "       [=] exists (id=${api_uuid}) — enforcing confidential + authz"
else
  kc create clients -r "${REALM}" \
    -s "clientId=${API_CLIENT_ID}" \
    "${CONFIDENTIAL_FLAGS[@]}" \
    -s standardFlowEnabled=true \
    -s directAccessGrantsEnabled=true \
    -s enabled=true \
    -s 'redirectUris=["http://localhost:*"]' \
    -s 'webOrigins=["*"]' \
    >/dev/null
  api_uuid=$(client_uuid_by_id "${API_CLIENT_ID}")
  echo "       [+] created (id=${api_uuid})"
fi
enforce_confidential "${api_uuid}"

echo "[4b/5] Ensuring SPA clients exist (confidential + PKCE + authz services + audience mapper)…"
for entry in "${SPA_CLIENTS[@]}"; do
  spa_id="${entry%%:*}"
  spa_port="${entry##*:}"
  spa_uuid=$(client_uuid_by_id "${spa_id}")
  if [[ -n "${spa_uuid}" ]]; then
    echo "       [=] ${spa_id} exists (id=${spa_uuid}) — enforcing confidential + authz"
  else
    kc create clients -r "${REALM}" \
      -s "clientId=${spa_id}" \
      "${CONFIDENTIAL_FLAGS[@]}" \
      -s standardFlowEnabled=true \
      -s directAccessGrantsEnabled=true \
      -s enabled=true \
      -s "redirectUris=[\"http://localhost:${spa_port}/*\"]" \
      -s "webOrigins=[\"http://localhost:${spa_port}\"]" \
      -s 'attributes."pkce.code.challenge.method"=S256' \
      -s 'attributes."post.logout.redirect.uris"=+' \
      >/dev/null
    spa_uuid=$(client_uuid_by_id "${spa_id}")
    echo "       [+] ${spa_id} created (id=${spa_uuid}, port=${spa_port})"
  fi
  enforce_confidential "${spa_uuid}"

  # Audience mapper: ensure the SPA's access tokens carry
  # `aud: ${API_CLIENT_ID}`. Idempotent — skip when present.
  mapper_exists=$(kc get "clients/${spa_uuid}/protocol-mappers/models" -r "${REALM}" 2>/dev/null \
    | grep -c "\"name\" : \"audience-${API_CLIENT_ID}\"" || true)
  if [[ "${mapper_exists}" == "0" ]]; then
    kc create "clients/${spa_uuid}/protocol-mappers/models" -r "${REALM}" \
      -s "name=audience-${API_CLIENT_ID}" \
      -s protocol=openid-connect \
      -s protocolMapper=oidc-audience-mapper \
      -s consentRequired=false \
      -s "config.\"included.client.audience\"=${API_CLIENT_ID}" \
      -s 'config."access.token.claim"=true' \
      -s 'config."id.token.claim"=false' \
      >/dev/null
    echo "           audience mapper → ${API_CLIENT_ID} added"
  fi
done

echo "[5/5] Ensuring users and password assignments…"
for entry in "${USERS[@]}"; do
  username="${entry%%:*}"
  password="${entry##*:}"
  user_uuid=$(kc get users -r "${REALM}" -q "username=${username}" --fields id 2>/dev/null \
              | grep -oE '"id" : "[^"]+"' | head -n1 | sed 's/.*"\([^"]*\)"$/\1/' || true)
  if [[ -z "${user_uuid}" ]]; then
    user_uuid=$(kc create users -r "${REALM}" \
      -s "username=${username}" \
      -s enabled=true \
      -s emailVerified=true \
      -s "email=${username}@example.test" \
      -s "firstName=${username}" \
      -s "lastName=Test" \
      -i 2>&1 | tail -n1 | tr -d '\r')
    echo "      [+] ${username} created (id=${user_uuid})"
  else
    echo "      [=] ${username} exists (id=${user_uuid})"
  fi
  kc set-password -r "${REALM}" --username "${username}" --new-password "${password}" >/dev/null
done

echo "      assigning ${ADMIN_ROLE} → admin-user…"
kc add-roles -r "${REALM}" --uusername admin-user --rolename "${ADMIN_ROLE}" >/dev/null 2>&1 || true

echo
echo "Setup complete."
echo
echo "Users (sub values are stable across restarts; copy them into seed SQL):"
for entry in "${USERS[@]}"; do
  username="${entry%%:*}"
  uid=$(kc get users -r "${REALM}" -q "username=${username}" --fields id 2>/dev/null \
        | grep -oE '"id" : "[^"]+"' | head -n1 | sed 's/.*"\([^"]*\)"$/\1/')
  printf "  %-16s sub=%s\n" "${username}" "${uid}"
done

echo
echo "Clients (all confidential, Authorization Services enabled):"
for id in "${API_CLIENT_ID}" $(printf '%s\n' "${SPA_CLIENTS[@]}" | cut -d: -f1); do
  uuid=$(client_uuid_by_id "${id}")
  secret=$(client_secret "${uuid}")
  printf "  %-14s id=%s\n" "${id}" "${uuid}"
  printf "  %-14s secret=%s\n" "" "${secret}"
done

cat <<EOF

SPA tokens carry \`aud: ${API_CLIENT_ID}\` (audience mapper).

Token grab via direct grant (now needs client_secret):
  SECRET=\$(./scripts/setup-keycloak.sh 2>/dev/null | awk '/${API_CLIENT_ID}/{getline; print \$2}' | sed 's/secret=//')
  curl -s -X POST http://127.0.0.1:\${KEYCLOAK_PORT:-8080}/realms/${REALM}/protocol/openid-connect/token \\
    -d grant_type=password \\
    -d client_id=${API_CLIENT_ID} \\
    -d "client_secret=\$SECRET" \\
    -d username=owner-user \\
    -d password=owner | jq -r .access_token

Backend env (apps/tedrisat/.env):
  KEYCLOAK_JWKS_URL=http://127.0.0.1:\${KEYCLOAK_PORT:-8080}/realms/${REALM}/protocol/openid-connect/certs

⚠️  Security note on confidential SPA clients
    A browser-only SPA cannot keep a client_secret safely — anyone with
    DevTools can read it. Per project policy the clients are
    confidential anyway; intended usage is a backend BFF that holds the
    secret and proxies token exchange. If the SPA must call Keycloak
    directly from the browser, flip the SPA clients back to public:
        kcadm.sh update clients/<uuid> -r ${REALM} -s publicClient=true \\
            -s authorizationServicesEnabled=false -s serviceAccountsEnabled=false
EOF
