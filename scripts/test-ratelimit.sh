#!/bin/bash
# Rate limit test for OTP send & verify endpoints
set -e

BASE="http://localhost:3456"
PHONE="9988776655"
PASS=0
FAIL=0

check() {
  local desc="$1"
  local expected="$2"
  local actual="$3"
  local body="$4"
  if [ "$actual" = "$expected" ]; then
    echo "  ✅ $desc (HTTP $actual)"
    PASS=$((PASS + 1))
  else
    echo "  ❌ $desc - expected $expected, got $actual"
    echo "     Body: $body"
    FAIL=$((FAIL + 1))
  fi
}

echo ""
echo "══════════════════════════════════════════════════"
echo "  TEST: OTP Send - 60s cooldown"
echo "══════════════════════════════════════════════════"

# Clear any existing OTPs for this phone first
curl -s "$BASE/api/otp/send" -X POST \
  -H "Content-Type: application/json" \
  -d "{\"phone\":\"$PHONE\"}" > /dev/null 2>&1
# Also clear from DB by requesting an OTP — the first one goes through

echo ""
echo "--- Request 1: Should succeed (200) ---"
R1_CODE=$(curl -s -o /tmp/r1.json -w "%{http_code}" "$BASE/api/otp/send" -X POST \
  -H "Content-Type: application/json" \
  -d "{\"phone\":\"$PHONE\"}")
check "First OTP send" "200" "$R1_CODE" "$(cat /tmp/r1.json)"

echo ""
echo "--- Request 2: Immediate repeat (should get 429) ---"
R2_CODE=$(curl -s -o /tmp/r2.json -w "%{http_code}" "$BASE/api/otp/send" -X POST \
  -H "Content-Type: application/json" \
  -d "{\"phone\":\"$PHONE\"}")
R2_BODY=$(cat /tmp/r2.json)
check "Rapid repeat blocked (60s cooldown)" "429" "$R2_CODE" "$R2_BODY"

echo ""
echo "--- Response body: $R2_BODY ---"

echo ""
echo "══════════════════════════════════════════════════"
echo "  TEST: OTP Send - 5 per 10min cap"
echo "══════════════════════════════════════════════════"

# Send 4 more OTPs (with 61s gaps in between to avoid 60s cooldown)
for i in 3 4 5 6; do
  echo ""
  echo "--- Request $i (waiting 61s for cooldown to expire) ---"
  sleep 61
  CODE=$(curl -s -o /tmp/r$i.json -w "%{http_code}" "$BASE/api/otp/send" -X POST \
    -H "Content-Type: application/json" \
    -d "{\"phone\":\"$PHONE\"}")
  BODY=$(cat /tmp/r$i.json)
  if [ "$i" -le 5 ]; then
    check "OTP send #$i" "200" "$CODE" "$BODY"
  else
    check "OTP send #6 blocked (5/10min cap)" "429" "$CODE" "$BODY"
    echo "   Response body: $BODY"
  fi
done

echo ""
echo "══════════════════════════════════════════════════"
echo "  TEST: OTP Verify - 5 failed attempts per 10min"
echo "══════════════════════════════════════════════════"

# Send a fresh OTP first (before the cap blocks us)
sleep 62
echo ""
echo "--- Sending fresh OTP for verify test ---"
FRESH_CODE=$(curl -s -o /tmp/fresh.json -w "%{http_code}" "$BASE/api/otp/send" -X POST \
  -H "Content-Type: application/json" \
  -d "{\"phone\":\"$PHONE\"}")
echo "   Fresh OTP send: HTTP $FRESH_CODE"
OTP=$(cat /tmp/fresh.json | grep -o '"devOtp":"[0-9]*"' | cut -d'"' -f4)
echo "   Dev OTP: $OTP"

# Now try wrong OTPs 6 times
for i in 1 2 3 4 5 6; do
  echo ""
  echo "--- Wrong OTP attempt $i ---"
  VCODE=$(curl -s -o /tmp/v$i.json -w "%{http_code}" "$BASE/api/otp/verify" -X POST \
    -H "Content-Type: application/json" \
    -d "{\"phone\":\"$PHONE\",\"code\":\"00000$i\"}")
  VBODY=$(cat /tmp/v$i.json)
  if [ "$i" -le 5 ]; then
    check "Wrong OTP #$i rejected" "400" "$VCODE" "$VBODY"
  else
    check "Wrong OTP #6 blocked (5/10min cap)" "429" "$VCODE" "$VBODY"
    echo "   Response body: $VBODY"
  fi
done

echo ""
echo "══════════════════════════════════════════════════"
echo "  RESULTS: $PASS passed, $FAIL failed"
echo "══════════════════════════════════════════════════"

# Clean up
rm -f /tmp/r*.json /tmp/v*.json /tmp/fresh.json

exit $FAIL
