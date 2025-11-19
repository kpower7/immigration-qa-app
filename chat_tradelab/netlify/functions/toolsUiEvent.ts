/**
 * Netlify Function: Post UI Event
 * Allows ElevenLabs agents (or backend) to push UI events to sessions
 */

import { eventStore } from "./uiFeed";

interface NetlifyEvent {
  httpMethod: string;
  headers?: Record<string, string | undefined>;
  queryStringParameters?: Record<string, string | undefined>;
  body?: string | null;
}

export async function handler(event: NetlifyEvent) {
  const corsHeaders = {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Headers": "Content-Type, Authorization, x-ui-session-id",
    "Access-Control-Allow-Methods": "POST, OPTIONS",
    "Cache-Control": "no-store",
  } as const;

  if (event.httpMethod === "OPTIONS") {
    return { statusCode: 200, headers: corsHeaders, body: "" };
  }

  try {
    if (!event.body) {
      return {
        statusCode: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        body: JSON.stringify({ error: "Missing request body" }),
      };
    }

    const payload = JSON.parse(event.body);
    const sessionId = event.headers?.["x-ui-session-id"] || payload.session_id;

    if (!sessionId) {
      return {
        statusCode: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        body: JSON.stringify({ error: "Missing session_id" }),
      };
    }

    // Create UI event
    const uiEvent = {
      ts: new Date().toISOString(),
      session_id: sessionId,
      action: payload.action,
      tool_token: payload.tool_token,
    };

    // Store event
    const existingEvents = eventStore.get(sessionId) || [];
    existingEvents.push(uiEvent);
    eventStore.set(sessionId, existingEvents);

    // Limit events per session to prevent memory issues (keep last 50)
    if (existingEvents.length > 50) {
      eventStore.set(sessionId, existingEvents.slice(-50));
    }

    return {
      statusCode: 200,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      body: JSON.stringify({ success: true, event: uiEvent }),
    };
  } catch (error) {
    console.error("Error in toolsUiEvent function:", error);
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
