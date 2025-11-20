from __future__ import annotations

from typing import Any, Dict, List, Optional
import os
import httpx

from .config import settings


def _extract_text(resp_json: Dict[str, Any]) -> str:
    # Try common shapes
    if "text" in resp_json and isinstance(resp_json["text"], str):
        return resp_json["text"]
    if "output" in resp_json and isinstance(resp_json["output"], str):
        return resp_json["output"]
    choices = resp_json.get("choices")
    if isinstance(choices, list) and choices:
        msg = choices[0].get("message") if isinstance(choices[0], dict) else None
        if isinstance(msg, dict):
            content = msg.get("content")
            if isinstance(content, str):
                return content
    # Fallback to stringifying
    return str(resp_json)


def call_modal_generate(
    messages: List[Dict[str, str]],
    system_prompt: Optional[str] = None,
    model: Optional[str] = None,
    temperature: float = 0.3,
    timeout: float = 60.0,
) -> str:
    """
    Call a Modal-hosted GPT-OSS inference endpoint.

    Expected env/config:
      - settings.MODAL_WEB_URL (e.g., https://your-app--generate.modal.run or similar)
      - settings.DEFAULT_OSS_MODEL (default: gpt-oss-120b)
    """
    modal_url = settings.MODAL_WEB_URL or os.getenv("MODAL_WEB_URL")
    if not modal_url:
        # Development-friendly fallback so local RAG flows can be tested without a live LLM.
        # Set OSS_DEV_STUB=0 to disable this behavior and enforce configuration.
        if os.getenv("OSS_DEV_STUB", "1") == "1":
            # Use the last user message content as an echo so callers see end-to-end plumbing.
            last_user = ""
            for m in reversed(messages):
                if m.get("role") == "user" and isinstance(m.get("content"), str):
                    last_user = m["content"]
                    break
            snippet = last_user.strip()[:1200]
            return (
                "[DEV STUB] MODAL_WEB_URL not set. Returning a placeholder answer based on the provided input.\n\n"
                + snippet
            )
        raise RuntimeError(
            "MODAL_WEB_URL is not set. Configure your Modal web endpoint and set MODAL_WEB_URL in env."
        )

    # Normalize base URL (remove trailing slash)
    if modal_url.endswith("/"):
        modal_url = modal_url[:-1]
    # Modal web endpoints are at the root path, not /generate
    url = modal_url

    payload: Dict[str, Any] = {
        "model": model or settings.DEFAULT_OSS_MODEL,
        "messages": messages,
        "temperature": temperature,
    }
    if system_prompt:
        payload["system_prompt"] = system_prompt

    with httpx.Client(timeout=timeout) as client:
        r = client.post(url, json=payload)
        r.raise_for_status()
        data = r.json()
        return _extract_text(data)
