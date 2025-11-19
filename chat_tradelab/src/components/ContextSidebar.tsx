"use client";

import React from "react";
import { FileText, Video, Newspaper, RefreshCcw } from "lucide-react";
import type { ParsedEvents } from "@/types/ui-events";

interface ContextSidebarProps {
  events: ParsedEvents;
  isPolling: boolean;
  onRefresh: () => void;
  onTogglePolling: () => void;
}

/**
 * Context sidebar that displays documents, news, and videos
 * Updates dynamically based on UI events from the chatbot
 */
export default function ContextSidebar({
  events,
  isPolling,
  onRefresh,
  onTogglePolling
}: ContextSidebarProps) {
  const { documents, videos, news } = events;
  const hasContent = documents.length > 0 || videos.length > 0 || news.length > 0;

  return (
    <aside className="space-y-6">
      {/* Header with controls */}
      <div className="card p-6">
        <div className="flex items-center justify-between mb-2">
          <h3 className="text-lg font-semibold text-white">Context</h3>
          <div className="flex items-center gap-3">
            <button
              onClick={onRefresh}
              className="text-xs text-gray-300 hover:text-white transition-colors"
              aria-label="Refresh context"
            >
              <RefreshCcw className="h-4 w-4" />
            </button>
            <button
              onClick={onTogglePolling}
              className={`text-xs transition-colors ${
                isPolling ? 'text-green-400 hover:text-green-300' : 'text-gray-400 hover:text-gray-300'
              }`}
            >
              {isPolling ? "Live" : "Paused"}
            </button>
          </div>
        </div>
        <p className="text-xs text-gray-400">
          The assistant will add relevant documents, news, and resources here during the conversation.
        </p>
      </div>

      {/* Empty state */}
      {!hasContent && (
        <div className="card p-6 text-center">
          <div className="text-gray-400 text-sm">
            <p className="mb-2">No context yet</p>
            <p className="text-xs">Ask about regulations, classifications, or recent news</p>
          </div>
        </div>
      )}

      {/* Documents */}
      {documents.length > 0 && (
        <div className="card p-6">
          <div className="flex items-center gap-2 mb-3">
            <FileText className="h-5 w-5 text-primary-400" />
            <h4 className="text-md font-semibold text-white">Documents</h4>
          </div>
          <ul className="space-y-3">
            {documents.map((doc, idx) => (
              <li key={idx} className="text-gray-200">
                <div className="font-semibold text-sm">{doc.title || "Document"}</div>
                {doc.snippet && (
                  <p className="text-xs text-gray-400 mt-1 line-clamp-2">{doc.snippet}</p>
                )}
                {doc.url && (
                  <a
                    href={doc.url}
                    target="_blank"
                    rel="noreferrer"
                    className="text-xs text-primary-400 hover:text-primary-300 hover:underline mt-1 inline-block"
                  >
                    View document →
                  </a>
                )}
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Videos */}
      {videos.length > 0 && (
        <div className="card p-6">
          <div className="flex items-center gap-2 mb-3">
            <Video className="h-5 w-5 text-secondary-400" />
            <h4 className="text-md font-semibold text-white">Videos</h4>
          </div>
          <div className="space-y-4">
            {videos.map((video, idx) => (
              <div key={idx}>
                {video.video_id ? (
                  <iframe
                    className="w-full aspect-video rounded border border-white/10"
                    src={`https://www.youtube.com/embed/${video.video_id}`}
                    title={video.title || "Video"}
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                  />
                ) : video.url ? (
                  <a
                    href={video.url}
                    target="_blank"
                    rel="noreferrer"
                    className="text-secondary-400 hover:text-secondary-300 hover:underline text-sm"
                  >
                    {video.title || video.url}
                  </a>
                ) : null}
                {video.title && video.video_id && (
                  <div className="mt-2 text-sm text-gray-300">{video.title}</div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* News */}
      {news.length > 0 && (
        <div className="card p-6">
          <div className="flex items-center gap-2 mb-3">
            <Newspaper className="h-5 w-5 text-accent-400" />
            <h4 className="text-md font-semibold text-white">News & Updates</h4>
          </div>
          <ul className="space-y-3">
            {news.map((item, idx) => (
              <li key={idx}>
                <a
                  href={item.url}
                  target="_blank"
                  rel="noreferrer"
                  className="text-accent-400 hover:text-accent-300 hover:underline text-sm font-medium"
                >
                  {item.title || item.url}
                </a>
                <div className="flex items-center gap-2 mt-1">
                  {item.source && (
                    <span className="text-xs text-gray-400">{item.source}</span>
                  )}
                  {item.published_at && item.source && (
                    <span className="text-xs text-gray-500">•</span>
                  )}
                  {item.published_at && (
                    <span className="text-xs text-gray-400">
                      {new Date(item.published_at).toLocaleDateString()}
                    </span>
                  )}
                </div>
              </li>
            ))}
          </ul>
        </div>
      )}
    </aside>
  );
}
