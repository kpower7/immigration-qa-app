"""
Modal deployment for GPT-OSS-120b chat endpoint
This creates the web endpoint that your FastAPI backend calls
"""
import modal
from typing import List, Dict, Any, Optional
from pydantic import BaseModel

# Create Modal app
app = modal.App("chat-with-pdf-vision")

# Request/Response models
class ChatMessage(BaseModel):
    role: str
    content: str

class ChatRequest(BaseModel):
    messages: List[ChatMessage]
    model: Optional[str] = "gpt-oss-120b"
    temperature: float = 0.3
    system_prompt: Optional[str] = None

class ChatResponse(BaseModel):
    text: str
    model: str

# Generation pipeline cache (initialized on first request)
_GEN_PIPE = None
_GEN_TOKENIZER = None

# Modal function with web endpoint
@app.function(
    image=modal.Image.debian_slim().pip_install([
        "transformers",
        "torch",
        "accelerate",
        "pydantic",
        "fastapi",
        "sentencepiece"  # Often needed for newer models
    ]),
    timeout=25,
    keep_warm=1,  # Keep 1 instance warm to avoid cold starts
)
@modal.web_endpoint(method="POST")
def web(request: ChatRequest) -> ChatResponse:
    """
    Web endpoint that receives chat requests and returns responses.
    This is what your FastAPI backend calls.
    """
    import os
    import torch
    from transformers import AutoTokenizer, AutoModelForCausalLM, pipeline
 
    # Small, fast default; can be overridden via env
    model_name = os.getenv("OSS_MODEL_NAME", "microsoft/DialoGPT-small")
 
    try:
        # Lazy-load and cache the pipeline across invocations
        global _GEN_PIPE, _GEN_TOKENIZER
        if _GEN_PIPE is None:
            tok = AutoTokenizer.from_pretrained(model_name)
            if tok.pad_token is None:
                tok.pad_token = tok.eos_token
            mdl = AutoModelForCausalLM.from_pretrained(model_name)
            # Use CPU by default to avoid CUDA kernel issues; opt-in to GPU via env
            use_gpu = os.getenv("OSS_USE_GPU", "0") == "1" and torch.cuda.is_available()
            if use_gpu:
                mdl = mdl.to("cuda")
                _GEN_PIPE = pipeline(
                    "text-generation",
                    model=mdl,
                    tokenizer=tok,
                    device=0,
                )
            else:
                _GEN_PIPE = pipeline(
                    "text-generation",
                    model=mdl,
                    tokenizer=tok,
                    device=-1,
                )
            _GEN_TOKENIZER = tok
 
        # Build a simple conversation prompt
        parts = []
        if request.system_prompt:
            parts.append(f"System: {request.system_prompt}")
        for msg in request.messages:
            role = (msg.role or "user").capitalize()
            parts.append(f"{role}: {msg.content}")
        parts.append("Assistant:")
        prompt = "\n".join(parts)
 
        # Generate with safe defaults
        out = _GEN_PIPE(
            prompt,
            max_new_tokens=120,
            do_sample=True,
            temperature=max(0.01, min(float(request.temperature or 0.3), 1.5)),
            eos_token_id=_GEN_TOKENIZER.eos_token_id,
            pad_token_id=_GEN_TOKENIZER.pad_token_id,
            return_full_text=False,
        )
 
        text = (out[0]["generated_text"] if isinstance(out, list) and out else "").strip()
        if not text:
            # Fallback: try extracting after "Assistant:" if full text returned
            maybe_full = out[0]["generated_text"] if isinstance(out, list) and out else ""
            text = maybe_full.split("Assistant:")[-1].strip() if "Assistant:" in maybe_full else ""
        if not text:
            text = "I understand your message. How can I help you further?"
 
        return ChatResponse(text=text, model=request.model or "gpt-oss-120b")
 
    except Exception as e:
        return ChatResponse(text=f"Error processing request: {str(e)}", model=request.model or "gpt-oss-120b")


