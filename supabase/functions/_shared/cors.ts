export const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// API Key 검증 (Publishable Key 방식)
export function verifyApiKey(req: Request): boolean {
  const apiKey = req.headers.get('apikey');
  const expectedKey = Deno.env.get('SUPABASE_ANON_KEY');

  // API Key가 없거나 맞지 않으면 false
  if (!apiKey || !expectedKey) {
    return false;
  }

  return apiKey === expectedKey;
}
