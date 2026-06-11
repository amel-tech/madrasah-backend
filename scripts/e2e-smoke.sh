#!/usr/bin/env bash
# scripts/e2e-smoke.sh
#
# Hits the running tedrisat backend with the three setup-keycloak.sh
# users (admin/owner/stranger) and asserts the authorization matrix
# behaves as documented in AUTHORIZATION.md.
#
# Requirements:
#   - docker compose services up (keycloak, medaris-db)
#   - tedrisat running on http://localhost:3001 with KEYCLOAK_JWKS_URL
#     pointing at the local realm
#   - ./scripts/setup-keycloak.sh already executed (realm + clients +
#     users provisioned)
#
# The script is read-only against Keycloak but creates a private deck
# under owner-user and deletes it at the end.

set -euo pipefail

KEYCLOAK_URL="${KEYCLOAK_URL:-http://127.0.0.1:8088}"
TEDRISAT_URL="${TEDRISAT_URL:-http://localhost:3001}"
REALM="${REALM:-amel-tech-dev}"
API_CLIENT_ID="${API_CLIENT_ID:-tedrisat-api}"

cd "$(dirname "$0")/.."

# Colour output if the terminal supports it.
if [[ -t 1 ]]; then
  GREEN=$'\033[32m'; RED=$'\033[31m'; DIM=$'\033[2m'; BOLD=$'\033[1m'; NC=$'\033[0m'
else
  GREEN=''; RED=''; DIM=''; BOLD=''; NC=''
fi

PASS=0
FAIL=0
declare -a FAILURES

# ---- Token acquisition ---------------------------------------------------

echo "${BOLD}[setup]${NC} Authenticating to Keycloak and fetching client secret + tokens…"

docker compose exec -T keycloak /opt/keycloak/bin/kcadm.sh config credentials \
  --server http://localhost:8080 \
  --realm master \
  --user "${KC_ADMIN_USER:-admin}" \
  --password "${KC_ADMIN_PASSWORD:-admin}" \
  >/dev/null 2>&1 || {
    echo "${RED}Could not authenticate to Keycloak. Check master credentials.${NC}" >&2
    exit 1
  }

CLIENT_UUID=$(docker compose exec -T keycloak /opt/keycloak/bin/kcadm.sh \
  get clients -r "${REALM}" -q "clientId=${API_CLIENT_ID}" --fields id 2>/dev/null \
  | jq -r '.[0].id')
CLIENT_SECRET=$(docker compose exec -T keycloak /opt/keycloak/bin/kcadm.sh \
  get "clients/${CLIENT_UUID}/client-secret" -r "${REALM}" 2>/dev/null \
  | jq -r '.value')

if [[ -z "${CLIENT_SECRET}" || "${CLIENT_SECRET}" == "null" ]]; then
  echo "${RED}Could not fetch ${API_CLIENT_ID} secret. Did you run setup-keycloak.sh?${NC}" >&2
  exit 1
fi

get_token() {
  curl -s -X POST "${KEYCLOAK_URL}/realms/${REALM}/protocol/openid-connect/token" \
    -d "grant_type=password" \
    -d "client_id=${API_CLIENT_ID}" \
    -d "client_secret=${CLIENT_SECRET}" \
    -d "username=$1" -d "password=$2" | jq -r '.access_token'
}

token_sub() {
  printf '%s' "$1" | jq -R 'split(".") | .[1] | @base64d | fromjson | .sub' -r
}

TOK_ADMIN=$(get_token admin-user admin)
TOK_OWNER=$(get_token owner-user owner)
TOK_STRANGER=$(get_token stranger-user stranger)

if [[ -z "${TOK_ADMIN}" || "${TOK_ADMIN}" == "null" ]]; then
  echo "${RED}Token grab failed — check users have email/firstName/lastName set.${NC}" >&2
  exit 1
fi

SUB_OWNER=$(token_sub "${TOK_OWNER}")
SUB_STRANGER=$(token_sub "${TOK_STRANGER}")
SUB_ADMIN=$(token_sub "${TOK_ADMIN}")
echo "${DIM}owner sub:    ${SUB_OWNER}"
echo "stranger sub: ${SUB_STRANGER}"
echo "admin sub:    ${SUB_ADMIN}${NC}"

# ---- Assertion helpers ---------------------------------------------------

run() {
  # run METHOD URL TOKEN [BODY]
  local method=$1 path=$2 token=$3 body=${4:-}
  local hdr_args=(-H "Authorization: Bearer ${token}")
  [[ -n "${body}" ]] && hdr_args+=(-H "Content-Type: application/json" --data "${body}")
  curl -s -o /tmp/e2e-body.$$ -w "%{http_code}" -X "${method}" \
    "${hdr_args[@]}" "${TEDRISAT_URL}${path}"
}

assert_status() {
  # assert_status DESC EXPECTED METHOD URL TOKEN [BODY]
  local desc=$1 expected=$2 method=$3 path=$4 token=$5 body=${6:-}
  local actual
  actual=$(run "${method}" "${path}" "${token}" "${body}")
  if [[ "${actual}" == "${expected}" ]]; then
    printf "  ${GREEN}✓${NC} %-66s %s\n" "${desc}" "${actual}"
    PASS=$((PASS + 1))
  else
    local got
    got=$(cat /tmp/e2e-body.$$ 2>/dev/null | head -c 160)
    printf "  ${RED}✗${NC} %-66s expected ${expected}, got %s\n" "${desc}" "${actual}"
    [[ -n "${got}" ]] && printf "    ${DIM}body: %s${NC}\n" "${got}"
    FAIL=$((FAIL + 1))
    FAILURES+=("${desc}")
  fi
  rm -f /tmp/e2e-body.$$
}

# ---- Resource setup ------------------------------------------------------

echo
echo "${BOLD}[fixtures]${NC} Creating an owner-private deck and an admin-public deck…"

create_deck_response() {
  curl -s -X POST "${TEDRISAT_URL}/flashcard/decks" \
    -H "Authorization: Bearer $1" \
    -H "Content-Type: application/json" \
    --data "$2"
}

OWNER_DECK_JSON=$(create_deck_response "${TOK_OWNER}" \
  '{"title":"e2e private deck","description":"smoke test fixture deck","isPublic":false}')
OWNER_DECK_ID=$(printf '%s' "${OWNER_DECK_JSON}" | jq -r '.id // empty')
echo "${DIM}owner private deck: ${OWNER_DECK_ID}${NC}"

ADMIN_DECK_JSON=$(create_deck_response "${TOK_ADMIN}" \
  '{"title":"e2e global deck","description":"smoke test fixture deck","isPublic":true}')
ADMIN_DECK_ID=$(printf '%s' "${ADMIN_DECK_JSON}" | jq -r '.id // empty')
echo "${DIM}admin public deck:  ${ADMIN_DECK_ID}${NC}"

if [[ -z "${OWNER_DECK_ID}" || -z "${ADMIN_DECK_ID}" ]]; then
  echo "${RED}Could not create fixture decks — check backend logs.${NC}" >&2
  printf 'owner response: %s\nadmin response: %s\n' "${OWNER_DECK_JSON}" "${ADMIN_DECK_JSON}" >&2
  exit 1
fi

cleanup() {
  curl -s -o /dev/null -X DELETE "${TEDRISAT_URL}/flashcard/decks/${OWNER_DECK_ID}" \
    -H "Authorization: Bearer ${TOK_OWNER}" || true
  curl -s -o /dev/null -X DELETE "${TEDRISAT_URL}/flashcard/decks/${ADMIN_DECK_ID}" \
    -H "Authorization: Bearer ${TOK_ADMIN}" || true
}
trap cleanup EXIT

# ---- Scenarios -----------------------------------------------------------

echo
echo "${BOLD}[1] Anonymous & malformed tokens${NC}"
assert_status "anonymous request → 401"                  401 GET "/flashcard/decks/${OWNER_DECK_ID}" ""
assert_status "garbage bearer → 401"                     401 GET "/flashcard/decks/${OWNER_DECK_ID}" "not-a-real-token"

echo
echo "${BOLD}[2] Deck view — private deck (DECK_OWNER vs PUBLIC fallback)${NC}"
assert_status "owner views own private deck → 200"       200 GET "/flashcard/decks/${OWNER_DECK_ID}" "${TOK_OWNER}"
assert_status "stranger denied on private deck → 403"    403 GET "/flashcard/decks/${OWNER_DECK_ID}" "${TOK_STRANGER}"
assert_status "SYSTEM_ADMIN bypass on private deck → 200" 200 GET "/flashcard/decks/${OWNER_DECK_ID}" "${TOK_ADMIN}"

echo
echo "${BOLD}[3] Deck view — public deck (PUBLIC.view granted to all)${NC}"
assert_status "owner views public deck → 200"            200 GET "/flashcard/decks/${ADMIN_DECK_ID}" "${TOK_OWNER}"
assert_status "stranger views public deck → 200"         200 GET "/flashcard/decks/${ADMIN_DECK_ID}" "${TOK_STRANGER}"

echo
echo "${BOLD}[4] Deck mutation — manage_private_deck${NC}"
assert_status "owner PATCH own deck → 200"               200 PATCH "/flashcard/decks/${OWNER_DECK_ID}" "${TOK_OWNER}" '{"title":"renamed"}'
assert_status "stranger PATCH not-own deck → 403"        403 PATCH "/flashcard/decks/${OWNER_DECK_ID}" "${TOK_STRANGER}" '{"title":"pwn"}'
assert_status "SYSTEM_ADMIN PATCH any deck → 200"        200 PATCH "/flashcard/decks/${ADMIN_DECK_ID}" "${TOK_ADMIN}" '{"title":"renamed by admin"}'
assert_status "owner cannot PATCH a public deck → 403"   403 PATCH "/flashcard/decks/${ADMIN_DECK_ID}" "${TOK_OWNER}" '{"title":"hijack"}'

echo
echo "${BOLD}[5] Deck create — PUBLIC.create_private_deck vs publish gate${NC}"
assert_status "stranger creates private deck → 201"      201 POST "/flashcard/decks" "${TOK_STRANGER}" '{"title":"Stranger deck","description":"stranger private deck","isPublic":false}'
assert_status "owner cannot publish (isPublic:true) → 403" 403 POST "/flashcard/decks" "${TOK_OWNER}" '{"title":"Publish attempt","description":"hijack publish attempt","isPublic":true}'
assert_status "admin can publish → 201"                  201 POST "/flashcard/decks" "${TOK_ADMIN}" '{"title":"Admin global","description":"admin published deck","isPublic":true}'

echo
echo "${BOLD}[6] PATCH must not let owner flip isPublic (DTO immutability — Critical #2)${NC}"
# Field is dropped silently by validation pipe (whitelist), so a PATCH
# with isPublic:true succeeds but persists no change. We verify the
# deck remains private afterwards.
assert_status "PATCH body with isPublic:true → 400"      400 PATCH "/flashcard/decks/${OWNER_DECK_ID}" "${TOK_OWNER}" '{"isPublic":true}'

echo
echo "${BOLD}[7] Collection attach — addToUserCollection requires VIEW on target (Critical #1)${NC}"
assert_status "stranger CANNOT attach owner's private deck → 403" 403 POST "/flashcard/decks/${OWNER_DECK_ID}/collections" "${TOK_STRANGER}" ""
assert_status "owner attaches own deck → 201"            201 POST "/flashcard/decks/${OWNER_DECK_ID}/collections" "${TOK_OWNER}" ""
assert_status "stranger CAN attach a public deck → 201"  201 POST "/flashcard/decks/${ADMIN_DECK_ID}/collections" "${TOK_STRANGER}" ""

echo
echo "${BOLD}[8] Card create / view on owner's private deck${NC}"
CARD_BODY='[{"type":"VOCABULARY","contentFront":"sevgi","contentBack":"love"}]'
CARDS_JSON=$(curl -s -X POST "${TEDRISAT_URL}/flashcard/decks/${OWNER_DECK_ID}/cards" \
  -H "Authorization: Bearer ${TOK_OWNER}" -H "Content-Type: application/json" --data "${CARD_BODY}")
CARD_ID=$(printf '%s' "${CARDS_JSON}" | jq -r '.[0].id // empty')
if [[ -n "${CARD_ID}" ]]; then
  printf "  ${GREEN}✓${NC} %-66s card created %s\n" "owner POSTs cards to own deck" "${CARD_ID}"
  PASS=$((PASS + 1))
else
  printf "  ${RED}✗${NC} %-66s body: %s\n" "owner POSTs cards to own deck" "$(printf '%s' "${CARDS_JSON}" | head -c 160)"
  FAIL=$((FAIL + 1))
fi
assert_status "stranger cannot POST cards on private deck → 403" 403 POST "/flashcard/decks/${OWNER_DECK_ID}/cards" "${TOK_STRANGER}" "${CARD_BODY}"
assert_status "owner views card → 200"                           200 GET  "/flashcard/cards/${CARD_ID}" "${TOK_OWNER}"
assert_status "stranger denied viewing card → 403"               403 GET  "/flashcard/cards/${CARD_ID}" "${TOK_STRANGER}"
assert_status "owner deletes card → 200"                         200 DELETE "/flashcard/cards/${CARD_ID}" "${TOK_OWNER}"

echo
echo "${BOLD}[9] Deck delete — manage_private_deck${NC}"
assert_status "stranger cannot DELETE someone else's deck → 403" 403 DELETE "/flashcard/decks/${OWNER_DECK_ID}" "${TOK_STRANGER}"
# Owner delete moved to cleanup so the table summary above stays clean.

# ----- KÖŞK -----------------------------------------------------------------

echo
echo "${BOLD}[fixtures] SYSTEM_ADMIN opens a köşk and assigns owner-user as KOSK_MANAGER…${NC}"
OWNER_KOSK_JSON=$(curl -s -X POST "${TEDRISAT_URL}/kosks" \
  -H "Authorization: Bearer ${TOK_ADMIN}" \
  -H "Content-Type: application/json" \
  --data "{\"name\":\"Owner e2e köşk\",\"description\":\"smoke test köşk\",\"ownerId\":\"${SUB_OWNER}\"}")
OWNER_KOSK_ID=$(printf '%s' "${OWNER_KOSK_JSON}" | jq -r '.id // empty')
echo "${DIM}owner köşk: ${OWNER_KOSK_ID}${NC}"
kosk_cleanup() {
  [[ -n "${OWNER_KOSK_ID}" ]] && curl -s -o /dev/null -X DELETE \
    "${TEDRISAT_URL}/kosks/${OWNER_KOSK_ID}" \
    -H "Authorization: Bearer ${TOK_OWNER}" || true
}
trap 'kosk_cleanup; cleanup' EXIT

echo
echo "${BOLD}[10] Köşk view — PUBLIC.view (anyone authenticated)${NC}"
assert_status "owner views own köşk → 200"                       200 GET "/kosks/${OWNER_KOSK_ID}" "${TOK_OWNER}"
assert_status "stranger views any köşk → 200"                    200 GET "/kosks/${OWNER_KOSK_ID}" "${TOK_STRANGER}"
assert_status "anonymous denied on köşk → 401"                   401 GET "/kosks/${OWNER_KOSK_ID}" ""

echo
echo "${BOLD}[11] Köşk create — SYSTEM_ADMIN-only gate${NC}"
assert_status "stranger CANNOT open a köşk → 403"                403 POST "/kosks" "${TOK_STRANGER}" '{"name":"Stranger köşk"}'
assert_status "owner (KOSK_MANAGER) CANNOT open another köşk → 403" 403 POST "/kosks" "${TOK_OWNER}" '{"name":"Owner second köşk"}'
assert_status "SYSTEM_ADMIN opens köşk and assigns to stranger → 201" 201 POST "/kosks" "${TOK_ADMIN}" "{\"name\":\"Admin assigned\",\"ownerId\":\"${SUB_STRANGER}\"}"

echo
echo "${BOLD}[12] Köşk mutation — EDIT (KOSK_MANAGER) / DELETE${NC}"
assert_status "owner PATCH own köşk → 200"                       200 PATCH "/kosks/${OWNER_KOSK_ID}" "${TOK_OWNER}" '{"name":"Owner renamed"}'
assert_status "stranger PATCH not-own köşk → 403"                403 PATCH "/kosks/${OWNER_KOSK_ID}" "${TOK_STRANGER}" '{"name":"hijack"}'
assert_status "SYSTEM_ADMIN PATCH any köşk → 200"                200 PATCH "/kosks/${OWNER_KOSK_ID}" "${TOK_ADMIN}" '{"name":"renamed by admin"}'
assert_status "stranger cannot DELETE someone else's köşk → 403" 403 DELETE "/kosks/${OWNER_KOSK_ID}" "${TOK_STRANGER}"

# ----- COURSE --------------------------------------------------------------

echo
echo "${BOLD}[fixtures] Creating a course under the owner's köşk…${NC}"
COURSE_BODY=$(cat <<'JSON'
{
  "title": "E2E Sarf Dersi",
  "description": "smoke test fixture course",
  "category": "Sarf",
  "level": "BEGINNER",
  "language": "Türkçe",
  "durationWeeks": 4,
  "status": "PUBLISHED",
  "weeks": [{"weekNumber":1,"title":"Birinci Bab","lessons":[{"title":"Açılış","type":"VIDEO"}]}],
  "muderris": [],
  "resources": []
}
JSON
)
OWNER_COURSE_JSON=$(curl -s -X POST "${TEDRISAT_URL}/kosks/${OWNER_KOSK_ID}/courses" \
  -H "Authorization: Bearer ${TOK_OWNER}" \
  -H "Content-Type: application/json" \
  --data "${COURSE_BODY}")
OWNER_COURSE_ID=$(printf '%s' "${OWNER_COURSE_JSON}" | jq -r '.id // empty')
echo "${DIM}owner course: ${OWNER_COURSE_ID}${NC}"

echo
echo "${BOLD}[13] Course view — KOSK_MANAGER / MUDERRIS / ENROLLED / PENDING${NC}"
assert_status "kosk-manager (= owner) VIEWs course → 200"           200 GET "/courses/${OWNER_COURSE_ID}" "${TOK_OWNER}"
assert_status "stranger (no relation) VIEW course → 403"            403 GET "/courses/${OWNER_COURSE_ID}" "${TOK_STRANGER}"
assert_status "SYSTEM_ADMIN bypass on course view → 200"            200 GET "/courses/${OWNER_COURSE_ID}" "${TOK_ADMIN}"

echo
echo "${BOLD}[14] Course create under köşk — kosk.MANAGE_COURSES${NC}"
assert_status "owner POSTs course under own köşk → 201"             201 POST "/kosks/${OWNER_KOSK_ID}/courses" "${TOK_OWNER}" "${COURSE_BODY}"
assert_status "stranger POSTs course under not-own köşk → 403"      403 POST "/kosks/${OWNER_KOSK_ID}/courses" "${TOK_STRANGER}" "${COURSE_BODY}"

echo
echo "${BOLD}[15] Course mutation — EDIT / DELETE (KOSK_MANAGER + MUDERRIS)${NC}"
assert_status "owner PATCH own course → 200"                        200 PATCH "/courses/${OWNER_COURSE_ID}" "${TOK_OWNER}" '{"title":"Renamed"}'
assert_status "stranger PATCH not-own course → 403"                 403 PATCH "/courses/${OWNER_COURSE_ID}" "${TOK_STRANGER}" '{"title":"hijack"}'
assert_status "SYSTEM_ADMIN PATCH any course → 200"                 200 PATCH "/courses/${OWNER_COURSE_ID}" "${TOK_ADMIN}" '{"title":"by admin"}'

echo
echo "${BOLD}[16] Course enroll — course.ENROLL (PUBLIC, inherited by all roles)${NC}"
assert_status "stranger enrolls in course → 201"                    201 POST "/courses/${OWNER_COURSE_ID}/enroll" "${TOK_STRANGER}" ""
assert_status "owner re-enrolls in own course → 201"                201 POST "/courses/${OWNER_COURSE_ID}/enroll" "${TOK_OWNER}" ""

# After ENROLL: stranger is now ENROLLED → resolver returns ENROLLED → matrix lets them view
echo
echo "${BOLD}[17] Post-enroll VIEW — ENROLLED role now grants view${NC}"
assert_status "stranger (now ENROLLED) views course → 200"          200 GET "/courses/${OWNER_COURSE_ID}" "${TOK_STRANGER}"

# ----- MÜDERRIS ASSIGNMENT -----------------------------------------------

echo
echo "${BOLD}[18] Müderris assignment — kosk_manager assigns muderris (matrix.course.ASSIGN_MUDERRIS)${NC}"
# Owner (KOSK_MANAGER) creates a fresh course for the muderris flow
MUDERRIS_COURSE_BODY=$(printf '%s' "${COURSE_BODY}" | jq -c '.title = "E2E Müderris kursu"')
MUDERRIS_COURSE_ID=$(curl -s -X POST "${TEDRISAT_URL}/kosks/${OWNER_KOSK_ID}/courses" \
  -H "Authorization: Bearer ${TOK_OWNER}" \
  -H "Content-Type: application/json" \
  --data "${MUDERRIS_COURSE_BODY}" | jq -r '.id // empty')
echo "${DIM}muderris course: ${MUDERRIS_COURSE_ID}${NC}"

# Initially stranger has no relationship → cannot PATCH the course
assert_status "stranger PATCH course (no role) → 403"               403 PATCH "/courses/${MUDERRIS_COURSE_ID}" "${TOK_STRANGER}" '{"title":"hijack"}'

# Stranger cannot self-assign as müderris
assert_status "stranger CANNOT assign self as muderris → 403"       403 POST "/courses/${MUDERRIS_COURSE_ID}/muderris" "${TOK_STRANGER}" "{\"userId\":\"${SUB_STRANGER}\",\"name\":\"Stranger Müderris\"}"

# KOSK_MANAGER assigns stranger as muderris
MUDERRIS_JSON=$(curl -s -X POST "${TEDRISAT_URL}/courses/${MUDERRIS_COURSE_ID}/muderris" \
  -H "Authorization: Bearer ${TOK_OWNER}" \
  -H "Content-Type: application/json" \
  --data "{\"userId\":\"${SUB_STRANGER}\",\"name\":\"Müderris Atanan\",\"title\":\"Sarf hocası\"}")
MUDERRIS_ROW_ID=$(printf '%s' "${MUDERRIS_JSON}" | jq -r '.id // empty')
if [[ -n "${MUDERRIS_ROW_ID}" ]]; then
  printf "  ${GREEN}✓${NC} %-66s muderris row %s\n" "owner assigns stranger as muderris" "${MUDERRIS_ROW_ID}"
  PASS=$((PASS + 1))
else
  printf "  ${RED}✗${NC} %-66s body: %s\n" "owner assigns stranger as muderris" "$(printf '%s' "${MUDERRIS_JSON}" | head -c 200)"
  FAIL=$((FAIL + 1))
fi

echo
echo "${BOLD}[19] Post-assignment — stranger now has MUDERRIS scopes${NC}"
assert_status "stranger (now MUDERRIS) PATCHes course → 200"        200 PATCH "/courses/${MUDERRIS_COURSE_ID}" "${TOK_STRANGER}" '{"title":"renamed by muderris"}'
assert_status "stranger (now MUDERRIS) views course → 200"          200 GET "/courses/${MUDERRIS_COURSE_ID}" "${TOK_STRANGER}"

# Remove the assignment → MUDERRIS scopes vanish
assert_status "owner removes muderris assignment → 200"             200 DELETE "/courses/${MUDERRIS_COURSE_ID}/muderris/${MUDERRIS_ROW_ID}" "${TOK_OWNER}"
assert_status "stranger PATCH after removal → 403"                  403 PATCH "/courses/${MUDERRIS_COURSE_ID}" "${TOK_STRANGER}" '{"title":"rebuked"}'

# ----- ENROLLMENT APPROVAL FLOW -----------------------------------------

echo
echo "${BOLD}[20] Approval flow — requiresApproval:true course${NC}"
APPROVAL_COURSE_BODY=$(printf '%s' "${COURSE_BODY}" | jq -c '.title = "Onaya tabi kurs" | .requiresApproval = true')
APPROVAL_COURSE_ID=$(curl -s -X POST "${TEDRISAT_URL}/kosks/${OWNER_KOSK_ID}/courses" \
  -H "Authorization: Bearer ${TOK_OWNER}" \
  -H "Content-Type: application/json" \
  --data "${APPROVAL_COURSE_BODY}" | jq -r '.id // empty')

# Talebe (admin-user used as 3rd party "talebe" for this fixture) enrolls and gets PENDING
ENROLL_JSON=$(curl -s -X POST "${TEDRISAT_URL}/courses/${APPROVAL_COURSE_ID}/enroll" \
  -H "Authorization: Bearer ${TOK_ADMIN}")
ENROLL_STATUS=$(printf '%s' "${ENROLL_JSON}" | jq -r '.status // empty')
if [[ "${ENROLL_STATUS}" == "PENDING" ]]; then
  printf "  ${GREEN}✓${NC} %-66s status=PENDING\n" "admin-as-talebe enrolls → PENDING"
  PASS=$((PASS + 1))
else
  printf "  ${RED}✗${NC} %-66s got status=%s\n" "admin-as-talebe enrolls → PENDING" "${ENROLL_STATUS:-<empty>}"
  FAIL=$((FAIL + 1))
fi

# Owner (KOSK_MANAGER) sees pending list
PENDING_LIST=$(curl -s "${TEDRISAT_URL}/kosks/${OWNER_KOSK_ID}/enrollments/pending" \
  -H "Authorization: Bearer ${TOK_OWNER}" | jq -r '[.[].userId] | join(",")')
if [[ "${PENDING_LIST}" == *"${SUB_ADMIN}"* ]]; then
  printf "  ${GREEN}✓${NC} %-66s contains the pending talebe\n" "owner lists pending under köşk"
  PASS=$((PASS + 1))
else
  printf "  ${RED}✗${NC} %-66s got: %s\n" "owner lists pending under köşk" "${PENDING_LIST}"
  FAIL=$((FAIL + 1))
fi

# Stranger cannot approve / reject — not KOSK_MANAGER
assert_status "stranger CANNOT approve enrollment → 403"            403 POST "/courses/${APPROVAL_COURSE_ID}/enrollments/${SUB_ADMIN}/approve" "${TOK_STRANGER}" ""

# Owner approves
APPROVAL_JSON=$(curl -s -X POST "${TEDRISAT_URL}/courses/${APPROVAL_COURSE_ID}/enrollments/${SUB_ADMIN}/approve" \
  -H "Authorization: Bearer ${TOK_OWNER}")
APPROVAL_STATUS=$(printf '%s' "${APPROVAL_JSON}" | jq -r '.status // empty')
if [[ "${APPROVAL_STATUS}" == "ENROLLED" ]]; then
  printf "  ${GREEN}✓${NC} %-66s status=ENROLLED\n" "owner approves → ENROLLED"
  PASS=$((PASS + 1))
else
  printf "  ${RED}✗${NC} %-66s got status=%s\n" "owner approves → ENROLLED" "${APPROVAL_STATUS:-<empty>}"
  FAIL=$((FAIL + 1))
fi

echo
echo "${BOLD}[21] Reject flow — second talebe rejected${NC}"
# Owner-user enrolls in own course as talebe (PUBLIC.enroll inherited)
SECOND_ENROLL=$(curl -s -X POST "${TEDRISAT_URL}/courses/${APPROVAL_COURSE_ID}/enroll" \
  -H "Authorization: Bearer ${TOK_OWNER}")
SECOND_STATUS=$(printf '%s' "${SECOND_ENROLL}" | jq -r '.status // empty')
[[ "${SECOND_STATUS}" == "PENDING" ]] && \
  printf "  ${GREEN}✓${NC} %-66s status=PENDING\n" "second talebe enrolls → PENDING" && PASS=$((PASS+1)) || \
  printf "  ${RED}✗${NC} %-66s got: %s\n" "second talebe enrolls → PENDING" "${SECOND_STATUS}" || true

# Stranger cannot reject — not KOSK_MANAGER
assert_status "stranger CANNOT reject enrollment → 403"             403 DELETE "/courses/${APPROVAL_COURSE_ID}/enrollments/${SUB_OWNER}" "${TOK_STRANGER}"

# Owner rejects → row deleted
REJECT=$(curl -s -X DELETE "${TEDRISAT_URL}/courses/${APPROVAL_COURSE_ID}/enrollments/${SUB_OWNER}" \
  -H "Authorization: Bearer ${TOK_OWNER}")
if [[ "${REJECT}" == "true" ]]; then
  printf "  ${GREEN}✓${NC} %-66s deleted\n" "owner rejects → enrollment row gone"
  PASS=$((PASS + 1))
else
  printf "  ${RED}✗${NC} %-66s got: %s\n" "owner rejects → enrollment row gone" "${REJECT}"
  FAIL=$((FAIL + 1))
fi

echo
echo "${BOLD}Summary${NC}"
printf "  passed: ${GREEN}%d${NC}\n  failed: ${RED}%d${NC}\n" "${PASS}" "${FAIL}"
if (( FAIL > 0 )); then
  printf "\n${RED}Failures:${NC}\n"
  for f in "${FAILURES[@]}"; do printf "  - %s\n" "${f}"; done
  exit 1
fi
