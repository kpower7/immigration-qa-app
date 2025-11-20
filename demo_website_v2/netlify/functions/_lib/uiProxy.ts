// Generic proxy helper for UI endpoints (supports GET/POST)
export interface NetlifyEvent {
  httpMethod: string;
  headers?: Record<string, string | undefined>;
  queryStringParameters?: Record<string, string | undefined>;
  body?: string | null;
}

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "Content-Type, Authorization, x-tool-token",
  "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
  "Cache-Control": "no-store",
} as const;

export function handleOptions(event: NetlifyEvent) {
  if (event.httpMethod === "OPTIONS") {
    return { statusCode: 200, headers: corsHeaders, body: "" };
  }
  return null;
}

export async function proxyUI(event: NetlifyEvent, path: string) {
  const maybe = handleOptions(event);
  if (maybe) return maybe;

  const BACKEND_BASE_URL = process.env.BACKEND_BASE_URL || "http://127.0.0.1:8001";
  const upstreamBase = BACKEND_BASE_URL.replace(/\/$/, "");
  const upstream = `${upstreamBase}${path}`;

  const headerToken = event.headers?.["x-tool-token"] || event.headers?.["X-Tool-Token"];
  const json = event.body ? safeJSONParse(event.body) : {};
  const toolToken = json.tool_token || headerToken || process.env.TOOL_TOKEN;

  const method = event.httpMethod || "GET";

  const url = new URL(upstream);
  if (method === "GET" && event.queryStringParameters) {
    for (const [k, v] of Object.entries(event.queryStringParameters)) {
      if (typeof v === "string" && v.length) url.searchParams.set(k, v);
    }
  }

  const resp = await fetch(url.toString(), {
    method,
    headers: {
      "Content-Type": "application/json",
      ...(toolToken ? { "x-tool-token": toolToken } : {}),
    },
    body: method === "POST" ? JSON.stringify(json || {}) : undefined,
  });

  const text = await resp.text();
  const contentType = resp.headers.get("content-type") || "application/json";

  return {
    statusCode: resp.status,
    headers: { ...corsHeaders, "Content-Type": contentType },
    body: text,
  };
}

function safeJSONParse(s: string) {
  try {
    return JSON.parse(s);
  } catch {
    return {} as any;
  }
}
