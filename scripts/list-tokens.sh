#!/bin/bash

# 등록된 푸시 토큰 목록 확인 스크립트

SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
ENV_FILE="$SCRIPT_DIR/../.env"

# .env 파일 로드
if [ -f "$ENV_FILE" ]; then
  export $(grep -E "^SUPABASE" "$ENV_FILE" | xargs)
else
  echo "❌ .env 파일을 찾을 수 없습니다"
  exit 1
fi

echo "📱 등록된 푸시 토큰 목록"
echo ""

# Supabase REST API로 조회
RESPONSE=$(curl -s "${SUPABASE_URL}/rest/v1/push_tokens?select=token,platform,user_id,is_active,created_at&order=created_at.desc" \
  -H "apikey: ${SUPABASE_ANON_KEY}" \
  -H "Authorization: Bearer ${SUPABASE_ANON_KEY}")

# 결과 출력
echo "$RESPONSE" | python3 -m json.tool 2>/dev/null || echo "$RESPONSE"

# 카운트
COUNT=$(echo "$RESPONSE" | python3 -c "import sys, json; print(len(json.load(sys.stdin)))" 2>/dev/null || echo "?")
echo ""
echo "총 ${COUNT}개 토큰"
