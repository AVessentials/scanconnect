#!/bin/bash
# Rate limit test - runs each test with appropriate pacing
# Usage: bash scripts/test-ratelimit-fast.sh <phone_suffix>

BASE="http://localhost:3456"
SUFFIX="${1:-999999}"
PHONE="98765${SUFFIX}"
PASS=0
FAIL=0
STICKER_ID="test-rt-${SUFFIX}"

function check() {
    local label="$1" expected="$2" actual="$3" body="$4"
    if [ "$actual" = "$expected" ]; then
        echo "  ✅ $label (expected $expected, got $actual)"
        PASS=$((PASS + 1))
    else
        echo "  ❌ $label (expected $expected, got $actual)"
        echo "     Body: $body"
        FAIL=$((FAIL + 1))
    fi
}

# ─── Helper: send OTP ──────────────────────────────────────────
function send_otp() {
    local ext="$1"
    local stamp=$(date +%s%N)
    curl -s -o "/tmp/s${ext}.json" -w "%{http_code}" \
        -X POST "$BASE/api/otp/send" \
        -H "Content-Type: application/json" \
        -d "{\"phone\":\"${PHONE}\"}" 2>/dev/null
}

# ─── Helper: verify OTP ────────────────────────────────────────
function verify_otp() {
    local code="$1" ext="$2"
    curl -s -o "/tmp/v${ext}.json" -w "%{http_code}" \
        -X POST "$BASE/api/otp/verify" \
        -H "Content-Type: application/json" \
        -d "{\"phone\":\"${PHONE}\",\"code\":\"${code}\"}" 2>/dev/null
}

echo "══════════════════════════════════════════════════"
echo "  OTP Rate Limit Tests"
echo "  Phone: $PHONE"
echo "══════════════════════════════════════════════════"
echo ""

# ═══════════════════════════════════════════════════════
# TEST 1: 60s Cooldown
# ═══════════════════════════════════════════════════════
echo "─── Test 1: 60s Send Cooldown ───────────────────"

CODE1=$(send_otp "a")
BODY1=$(cat /tmp/sa.json 2>/dev/null)
check "First OTP send (should succeed)" "200" "$CODE1" "$BODY1"

sleep 1

CODE2=$(send_otp "b")
BODY2=$(cat /tmp/sb.json 2>/dev/null)
check "Second OTP send within 60s (should be 429)" "429" "$CODE2" "$BODY2"

echo ""

# ═══════════════════════════════════════════════════════
# TEST 2: Verify Rate Limit (5 failed attempts)
# ═══════════════════════════════════════════════════════
echo "─── Test 2: Verify Rate Limit (5 attempts/10min) ──"

# Need a fresh OTP for verification attempts
sleep 62  # Wait for cooldown to expire
echo "  (waiting 62s for cooldown...)"

CODE3=$(send_otp "c")
BODY3=$(cat /tmp/sc.json 2>/dev/null)
check "Fresh OTP send for verify test" "200" "$CODE3" "$BODY3"

# Extract dev OTP if present, or use a fake one
DEV_OTP=$(cat /tmp/sc.json 2>/dev/null | grep -o '"devOtp":"[^"]*"' | cut -d'"' -f4)
echo "  Dev OTP found: ${DEV_OTP:-none}"

# Try 6 wrong codes
for i in $(seq 1 6); do
    WRONG_CODE=$(printf "%06d" $((999999 - i)))
    EXPECTED=429
    if [ "$i" -le 5 ]; then
        EXPECTED=400  # Invalid OTP
    fi
    HTTP=$(verify_otp "$WRONG_CODE" "v${i}")
    BODY=$(cat "/tmp/vv${i}.json" 2>/dev/null)
    check "Wrong attempt #${i} (expected ${EXPECTED})" "$EXPECTED" "$HTTP" "$BODY"
done

echo ""

# ═══════════════════════════════════════════════════════
# TEST 3: 5 per 10min Send Cap
# ═══════════════════════════════════════════════════════
echo "─── Test 3: 5-per-10min Send Cap ─────────────────"
echo "  (sending 5 OTPs with 61s gaps = ~244s total)"

for i in $(seq 1 5); do
    echo "  Sending OTP #${i}..."
    if [ "$i" -gt 1 ]; then
        sleep 61
    fi
    RESP=$(send_otp "i${i}")
    BODY=$(cat "/tmp/si${i}.json" 2>/dev/null)
    check "OTP send #${i} in window (should succeed)" "200" "$RESP" "$BODY"
done

# Now the 6th should be blocked
echo "  Sending OTP #6 (should be rate-limited)..."
RESP6=$(send_otp "i6")
BODY6=$(cat /tmp/si6.json 2>/dev/null)
check "6th OTP send (should be 429)" "429" "$RESP6" "$BODY6"

echo ""
echo "══════════════════════════════════════════════════"
echo "  Results: ${PASS} passed, ${FAIL} failed"
echo "══════════════════════════════════════════════════"

# Cleanup
rm -f /tmp/s*.json /tmp/v*.json 2>/dev/null
exit $FAIL
