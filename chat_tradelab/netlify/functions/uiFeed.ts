/**
 * Netlify Function: UI Event Feed
 * Returns UI events for a given session from Render backend database
 * WITH USER AUTHENTICATION
 */

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

  try {
    const backendUrl = process.env.BACKEND_URL;
    if (!backendUrl) {
      return {
        statusCode: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        body: JSON.stringify({ error: "Backend URL not configured" }),
      };
    }

    const sessionId = event.queryStringParameters?.session_id;
    if (!sessionId) {
      return {
        statusCode: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        body: JSON.stringify({ error: "Missing session_id parameter" }),
      };
    }

    // Verify authentication
    const authHeader = event.headers?.authorization || event.headers?.Authorization;
    if (!authHeader) {
      return {
        statusCode: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        body: JSON.stringify({ error: "Authentication required" }),
      };
    }

    // Fetch events from backend
    const response = await fetch(
      `${backendUrl}/api/chat/ui-events/${sessionId}`,
      {
        method: "GET",
        headers: {
          "Authorization": authHeader,
          "Content-Type": "application/json",
        },
      }
    );

    if (!response.ok) {
      if (response.status === 403) {
        return {
          statusCode: 403,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
          body: JSON.stringify({ error: "Access denied to this session" }),
        };
      }
      throw new Error(`Backend returned ${response.status}`);
    }

    const data = await response.json();

    return {
      statusCode: 200,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      body: JSON.stringify(data),
    };
  } catch (error) {
    console.error("Error in uiFeed function:", error);
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
