// Netlify Function: Get ElevenLabs signed WebSocket URL for Conversational AI
// Docs: https://elevenlabs.io/docs/conversational-ai/api-reference/conversations/get-signed-url
// Requires env ELEVEN_API_KEY (or ELEVENLABS_API_KEY) and ELEVEN_AGENT_ID (or AGENT_ID)

interface NetlifyEvent {
  httpMethod: string;
  headers?: Record<string, string | undefined>;
  queryStringParameters?: Record<string, string | undefined>;
  body?: string | null;
}

export async function handler(event: NetlifyEvent) {
  const corsHeaders = {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Headers": "Content-Type, Authorization",
    "Access-Control-Allow-Methods": "GET, OPTIONS",
    "Cache-Control": "no-store",
  } as const;

  if (event.httpMethod === "OPTIONS") {
    return { statusCode: 200, headers: corsHeaders, body: "" };
  }
  // Deprecated: ElevenLabs voice integration removed. Point to text chat UI.
  return {
    statusCode: 410,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
    body: JSON.stringify({
      error: "Deprecated",
      message: "ElevenLabs voice endpoints have been removed. Use the text chat at /voice-oss.",
      redirect: "/voice-oss",
    }),
  };
}
