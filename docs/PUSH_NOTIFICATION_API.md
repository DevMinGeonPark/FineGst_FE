# 푸시 알림 API 가이드

## API 정보

| 항목 | 값 |
|------|---|
| URL | `https://uqzuwwouksrqacjikxph.supabase.co/functions/v1/send-push-all` |
| Method | `POST` |
| Content-Type | `application/json` |

---

## 인증

| Header | 값 |
|--------|---|
| `apikey` | 5d96a3e7-8790-45f2-b94c-72481ead87c3 |

---

## Request Body

### 전체 전송 (필수 필드만)

```json
{
  "title": "알림 제목",
  "body": "알림 내용"
}
```

### 딥링크 포함

```json
{
  "title": "알림 제목",
  "body": "알림 내용",
  "data": {
    "url": "/detail/123"
  }
}
```

### 특정 사용자만 전송

```json
{
  "title": "알림 제목",
  "body": "알림 내용",
  "userIds": ["user1", "user2"]
}
```

### 전체 옵션

```json
{
  "title": "알림 제목",
  "body": "알림 내용",
  "data": {
    "url": "/detail/123",
    "customKey": "customValue"
  },
  "userIds": ["user1", "user2"]
}
```

---

## Response

### 성공

```json
{
  "sent": 150,
  "failed": 2,
  "total": 152,
  "message": "Successfully sent to 150/152 devices"
}
```

### 실패

```json
{
  "error": "MISSING_FIELDS",
  "message": "title and body are required"
}
```

---

## 필드 설명

| 필드 | 타입 | 필수 | 설명 |
|------|------|------|------|
| `title` | string | ✅ | 알림 제목 |
| `body` | string | ✅ | 알림 내용 |
| `data` | object | ❌ | 추가 데이터 (딥링크 등) |
| `data.url` | string | ❌ | 알림 탭 시 이동할 경로 |
| `userIds` | string[] | ❌ | 특정 사용자만 전송 (없으면 전체) |

---

## 예시

### cURL

```bash
curl -X POST "https://uqzuwwouksrqacjikxph.supabase.co/functions/v1/send-push-all" \
  -H "Content-Type: application/json" \
  -H "apikey: YOUR_SUPABASE_ANON_KEY" \
  -d '{
    "title": "공지사항",
    "body": "새로운 이벤트가 시작되었습니다!",
    "data": { "url": "/event/1" }
  }'
```

### JavaScript (fetch)

```javascript
const response = await fetch(
  "https://uqzuwwouksrqacjikxph.supabase.co/functions/v1/send-push-all",
  {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "apikey": "YOUR_SUPABASE_ANON_KEY"
    },
    body: JSON.stringify({
      title: "공지사항",
      body: "새로운 이벤트가 시작되었습니다!",
      data: { url: "/event/1" }
    })
  }
);

const result = await response.json();
console.log(result);
```

### Python

```python
import requests

response = requests.post(
    "https://uqzuwwouksrqacjikxph.supabase.co/functions/v1/send-push-all",
    headers={
        "Content-Type": "application/json",
        "apikey": "YOUR_SUPABASE_ANON_KEY"
    },
    json={
        "title": "공지사항",
        "body": "새로운 이벤트가 시작되었습니다!",
        "data": {"url": "/event/1"}
    }
)

print(response.json())
```

---

## 주의사항

1. **apikey**는 절대 클라이언트(앱/웹)에 노출하지 마세요
2. 관리자 페이지 또는 서버에서만 호출하세요
3. `userIds`가 없으면 **모든 등록된 기기**에 전송됩니다
