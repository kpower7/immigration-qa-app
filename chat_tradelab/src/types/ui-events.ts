/**
 * Types for UI events and payloads
 * Used for context sidebar updates during chat
 */

export type DocumentPayload = {
  doc_id?: string;
  title?: string;
  url?: string;
  snippet?: string;
};

export type VideoPayload = {
  video_id?: string;
  url?: string;
  title?: string;
};

export type NewsItem = {
  title?: string;
  url: string;
  source?: string;
  published_at?: string;
};

export type UIAction =
  | { type: "show_document"; payload: DocumentPayload }
  | { type: "embed_video"; payload: VideoPayload }
  | { type: "show_news"; payload: NewsItem | NewsItem[] };

export type UIEvent = {
  ts: string;
  session_id: string;
  action: UIAction;
  tool_token?: string;
};

export type DisplayDocument = DocumentPayload & { ts: string };
export type DisplayVideo = VideoPayload & { ts: string };
export type DisplayNews = NewsItem & { ts: string };

export interface ParsedEvents {
  documents: DisplayDocument[];
  videos: DisplayVideo[];
  news: DisplayNews[];
}
