import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
import { corsHeaders } from '../_shared/cors.ts'

const EXPO_PUSH_URL = 'https://exp.host/--/api/v2/push/send'
const SAVE_ALARM_URL = 'https://kt-online.shop/api/save_push_alarm.php'
const BATCH_SIZE = 100 // Expo 권장 배치 크기

interface PushMessage {
  to: string
  title?: string
  body?: string
  data?: Record<string, unknown>
  sound?: 'default' | null
  badge?: number
  priority?: 'default' | 'normal' | 'high'
}

interface ExpoPushResponse {
  data: Array<{
    status: 'ok' | 'error'
    id?: string
    message?: string
    details?: { error: string }
  }>
}

async function sendPushBatch(messages: PushMessage[]): Promise<ExpoPushResponse> {
  const response = await fetch(EXPO_PUSH_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Accept': 'application/json',
    },
    body: JSON.stringify(messages),
  })
  return response.json()
}

async function saveAlarmToServer(title: string, body: string): Promise<void> {
  try {
    const params = new URLSearchParams()
    params.append('title', title)
    params.append('body', body)

    const response = await fetch(SAVE_ALARM_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: params.toString(),
    })

    if (!response.ok) {
      console.error('Failed to save alarm:', response.status, response.statusText)
    } else {
      console.log('Alarm saved to server successfully')
    }
  } catch (err) {
    console.error('Error saving alarm to server:', err)
  }
}

Deno.serve(async (req) => {
  // CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const { title, body, data, userIds } = await req.json()

    // 필수 필드 검증
    if (!title || !body) {
      return new Response(
        JSON.stringify({ error: 'MISSING_FIELDS', message: 'title and body are required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    const supabase = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    )

    // 토큰 조회 (활성 토큰만)
    let query = supabase
      .from('push_tokens')
      .select('token')
      .eq('is_active', true)

    // 특정 사용자들에게만 전송 (선택적)
    if (userIds && Array.isArray(userIds) && userIds.length > 0) {
      query = query.in('user_id', userIds)
    }

    const { data: tokens, error } = await query

    if (error) {
      console.error('DB Error:', error)
      return new Response(
        JSON.stringify({ error: 'DB_ERROR', message: error.message }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    if (!tokens || tokens.length === 0) {
      return new Response(
        JSON.stringify({ sent: 0, failed: 0, message: 'No active tokens found' }),
        { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // 메시지 생성
    const messages: PushMessage[] = tokens.map(t => ({
      to: t.token,
      title,
      body,
      data: data || {},
      sound: 'default',
      priority: 'high',
    }))

    // 배치로 나눠서 전송
    let sent = 0
    let failed = 0
    const failedTokens: string[] = []

    for (let i = 0; i < messages.length; i += BATCH_SIZE) {
      const batch = messages.slice(i, i + BATCH_SIZE)

      try {
        const result = await sendPushBatch(batch)

        result.data.forEach((res, idx) => {
          if (res.status === 'ok') {
            sent++
          } else {
            failed++
            failedTokens.push(batch[idx].to)

            // DeviceNotRegistered 에러면 토큰 비활성화
            if (res.details?.error === 'DeviceNotRegistered') {
              supabase
                .from('push_tokens')
                .update({ is_active: false })
                .eq('token', batch[idx].to)
                .then(() => console.log('Deactivated invalid token'))
            }
          }
        })
      } catch (err) {
        console.error('Batch send error:', err)
        failed += batch.length
      }
    }

    // 푸시 전송 성공 시 PHP 서버에 알림 저장
    if (sent > 0) {
      await saveAlarmToServer(title, body)
    }

    return new Response(
      JSON.stringify({
        sent,
        failed,
        total: tokens.length,
        message: `Successfully sent to ${sent}/${tokens.length} devices`
      }),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  } catch (err) {
    console.error('Error:', err)
    return new Response(
      JSON.stringify({ error: 'SERVER_ERROR', message: 'Internal server error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }
})
