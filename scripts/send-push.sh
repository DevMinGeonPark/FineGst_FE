#!/bin/bash

# 푸시 알림 전송 스크립트
# 사용법:
#   ./scripts/send-push.sh "제목" "내용"
#   ./scripts/send-push.sh "제목" "내용" "/detail/123"
#   ./scripts/send-push.sh "제목" "내용" "/detail/123" "user1,user2"

SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
ENV_FILE="$SCRIPT_DIR/../.env"

# .env 파일 로드
if [ -f "$ENV_FILE" ]; then
  export $(grep -E "^SUPABASE" "$ENV_FILE" | xargs)
else
  echo "❌ .env 파일을 찾을 수 없습니다: $ENV_FILE"
  exit 1
fi

# 필수 환경변수 확인
if [ -z "$SUPABASE_URL" ] || [ -z "$SUPABASE_ANON_KEY" ]; then
  echo "❌ SUPABASE_URL 또는 SUPABASE_ANON_KEY가 설정되지 않았습니다"
  exit 1
fi

# 인자 확인
TITLE="$1"
BODY="$2"
URL="$3"
USER_IDS="$4"

if [ -z "$TITLE" ] || [ -z "$BODY" ]; then
  echo "📱 푸시 알림 전송 스크립트"
  echo ""
  echo "사용법:"
  echo "  $0 \"제목\" \"내용\""
  echo "  $0 \"제목\" \"내용\" \"/딥링크URL\""
  echo "  $0 \"제목\" \"내용\" \"/딥링크URL\" \"user1,user2\""
  echo ""
  echo "예시:"
  echo "  $0 \"공지사항\" \"새로운 이벤트가 시작되었습니다!\""
  echo "  $0 \"신상품\" \"지금 확인하세요\" \"/detail/123\""
  echo "  $0 \"개인알림\" \"주문완료\" \"\" \"user123,user456\""
  exit 1
fi

# JSON 데이터 생성
if [ -n "$URL" ] && [ -n "$USER_IDS" ]; then
  # 딥링크 + 특정 사용자
  IFS=',' read -ra USERS <<< "$USER_IDS"
  USER_ARRAY=$(printf '"%s",' "${USERS[@]}" | sed 's/,$//')
  DATA="{\"title\": \"$TITLE\", \"body\": \"$BODY\", \"data\": {\"url\": \"$URL\"}, \"userIds\": [$USER_ARRAY]}"
elif [ -n "$URL" ]; then
  # 딥링크만
  DATA="{\"title\": \"$TITLE\", \"body\": \"$BODY\", \"data\": {\"url\": \"$URL\"}}"
elif [ -n "$USER_IDS" ]; then
  # 특정 사용자만
  IFS=',' read -ra USERS <<< "$USER_IDS"
  USER_ARRAY=$(printf '"%s",' "${USERS[@]}" | sed 's/,$//')
  DATA="{\"title\": \"$TITLE\", \"body\": \"$BODY\", \"userIds\": [$USER_ARRAY]}"
else
  # 전체 전송
  DATA="{\"title\": \"$TITLE\", \"body\": \"$BODY\"}"
fi

echo "📤 푸시 전송 중..."
echo "   제목: $TITLE"
echo "   내용: $BODY"
[ -n "$URL" ] && echo "   딥링크: $URL"
[ -n "$USER_IDS" ] && echo "   대상: $USER_IDS"
echo ""

# API 호출
RESPONSE=$(curl -s -X POST "${SUPABASE_URL}/functions/v1/send-push-all" \
  -H "apikey: ${SUPABASE_ANON_KEY}" \
  -H "Authorization: Bearer ${SUPABASE_ANON_KEY}" \
  -H "Content-Type: application/json" \
  -d "$DATA")

# 결과 출력
echo "📊 결과:"
echo "$RESPONSE" | python3 -m json.tool 2>/dev/null || echo "$RESPONSE"
