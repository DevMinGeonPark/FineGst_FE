import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
import { corsHeaders } from '../_shared/cors.ts'

Deno.serve(async (req) => {
  // CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const { token, platform, deviceId, userId } = await req.json()

    // 필수 필드 검증
    if (!token || !platform || !deviceId) {
      return new Response(
        JSON.stringify({ error: 'MISSING_FIELDS', message: 'token, platform, deviceId are required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // 토큰 형식 검증
    if (!token.startsWith('ExponentPushToken[')) {
      return new Response(
        JSON.stringify({ error: 'INVALID_TOKEN_FORMAT', message: 'Invalid Expo Push Token format' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    const supabase = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    )

    // Upsert (있으면 업데이트, 없으면 생성)
    const { data, error } = await supabase
      .from('push_tokens')
      .upsert({
        token,
        platform,
        device_id: deviceId,
        user_id: userId || null,
        is_active: true,
      }, {
        onConflict: 'token',
      })
      .select()
      .single()

    if (error) {
      console.error('DB Error:', error)
      return new Response(
        JSON.stringify({ error: 'DB_ERROR', message: error.message }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    return new Response(
      JSON.stringify(data),
      { status: 201, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  } catch (err) {
    console.error('Error:', err)
    return new Response(
      JSON.stringify({ error: 'SERVER_ERROR', message: 'Internal server error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }
})
