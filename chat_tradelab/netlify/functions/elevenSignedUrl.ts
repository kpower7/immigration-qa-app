/**
 * Netlify Function: Get ElevenLabs signed WebSocket URL
 * WITH USER AUTHENTICATION AND USAGE TRACKING
 * Verifies user session, checks usage limits, logs usage to Render backend
 */

interface NetlifyEvent {
  httpMethod: string;
  headers?: Record<string, string | undefined>;
  queryStringParameters?: Record<string, string | undefined>;
  body?: string | null;
}

interface UserSession {
  user_id: number;
  email: string;
  subscription_tier: string;
  usage_limit: number;
  current_usage: number;
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

  try {
    const backendUrl = process.env.BACKEND_URL;
    if (!backendUrl) {
      return {
        statusCode: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        body: JSON.stringify({ error: "Backend URL not configured" }),
      };
    }

    // 1. VERIFY USER AUTHENTICATION
    const authHeader = event.headers?.authorization || event.headers?.Authorization;
    if (!authHeader) {
      return {
        statusCode: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        body: JSON.stringify({ error: "Authentication required" }),
      };
    }

    // Verify user session with backend
    const authResponse = await fetch(`${backendUrl}/api/auth/verify-session`, {
      method: "POST",
      headers: {
        "Authorization": authHeader,
        "Content-Type": "application/json",
      },
    });

    if (!authResponse.ok) {
      return {
        statusCode: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        body: JSON.stringify({ error: "Invalid or expired session" }),
      };
    }

    const userSession: UserSession = await authResponse.json();

    // 2. CHECK USAGE LIMITS
    if (userSession.current_usage >= userSession.usage_limit) {
      return {
        statusCode: 403,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        body: JSON.stringify({
          error: "Usage limit reached",
          current_usage: userSession.current_usage,
          usage_limit: userSession.usage_limit,
          message: "Please upgrade your plan to continue chatting.",
        }),
      };
    }

    // 3. START CHAT SESSION IN BACKEND
    const agentId = event.queryStringParameters?.agent_id || process.env.NEXT_PUBLIC_ELEVEN_AGENT_ID_US;
    const countryCode = event.queryStringParameters?.country || "US";

    if (!agentId) {
      return {
        statusCode: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        body: JSON.stringify({ error: "Missing agent_id parameter" }),
      };
    }

    const sessionResponse = await fetch(`${backendUrl}/api/chat/start-session`, {
      method: "POST",
      headers: {
        "Authorization": authHeader,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        country_code: countryCode,
        agent_id: agentId,
      }),
    });

    if (!sessionResponse.ok) {
      return {
        statusCode: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        body: JSON.stringify({ error: "Failed to start chat session" }),
      };
    }

    const { session_id } = await sessionResponse.json();

    // 4. GET ELEVENLABS SIGNED URL
    const apiKey = process.env.ELEVEN_API_KEY || process.env.ELEVENLABS_API_KEY;
    if (!apiKey) {
      return {
        statusCode: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        body: JSON.stringify({ error: "ElevenLabs API key not configured" }),
      };
    }

    const elevenResponse = await fetch(
      `https://api.elevenlabs.io/v1/convai/conversation/get_signed_url?agent_id=${agentId}`,
      {
        method: "GET",
        headers: {
          "xi-api-key": apiKey,
        },
      }
    );

    if (!elevenResponse.ok) {
      const errorText = await elevenResponse.text();
      console.error("ElevenLabs API error:", elevenResponse.status, errorText);
      return {
        statusCode: elevenResponse.status,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        body: JSON.stringify({
          error: "Failed to get signed URL from ElevenLabs",
          details: errorText,
        }),
      };
    }

    const data = await elevenResponse.json();

    // 5. RETURN SIGNED URL + SESSION INFO
    return {
      statusCode: 200,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      body: JSON.stringify({
        signedUrl: data.signed_url,
        session_id,
        user: {
          subscription_tier: userSession.subscription_tier,
          usage: userSession.current_usage,
          limit: userSession.usage_limit,
        },
      }),
    };
  } catch (error) {
    console.error("Error in elevenSignedUrl function:", error);
    return {
      statusCode: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      body: JSON.stringify({
        error: "Internal server error",
        message: error instanceof Error ? error.message : "Unknown error",
      }),
    };
  }
}
