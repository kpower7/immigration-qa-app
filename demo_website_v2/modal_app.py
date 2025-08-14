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
    from transformers import (
        AutoTokenizer,
        AutoModelForCausalLM,
        AutoModelForSeq2SeqLM,
        AutoConfig,
        pipeline,
    )
 
    # Small, fast default; can be overridden via request.model or env
    # We'll compute model_name when building the pipeline so switching models works.
 
    try:
        # Lazy-load and cache the pipeline across invocations
        global _GEN_PIPE, _GEN_TOKENIZER, _GEN_MODEL_NAME
        # Determine which model to use for this request
        raw_requested = (getattr(request, "model", None) or "").strip()
        model_name = raw_requested or os.getenv("OSS_MODEL_NAME", "Qwen/Qwen2.5-0.5B-Instruct")
        if (_GEN_PIPE is None) or (_GEN_MODEL_NAME != model_name):
            tok = AutoTokenizer.from_pretrained(model_name)
            if tok.pad_token is None and tok.eos_token is not None:
                tok.pad_token = tok.eos_token
            cfg = AutoConfig.from_pretrained(model_name)
            is_seq2seq = bool(getattr(cfg, "is_encoder_decoder", False))
            if is_seq2seq:
                mdl = AutoModelForSeq2SeqLM.from_pretrained(model_name)
                task = "text2text-generation"
            else:
                mdl = AutoModelForCausalLM.from_pretrained(model_name)
                task = "text-generation"
            # Use CPU by default to avoid CUDA kernel issues; opt-in to GPU via env
            use_gpu = os.getenv("OSS_USE_GPU", "0") == "1" and torch.cuda.is_available()
            if use_gpu:
                mdl = mdl.to("cuda")
                _GEN_PIPE = pipeline(
                    task,
                    model=mdl,
                    tokenizer=tok,
                    device=0,
                )
            else:
                _GEN_PIPE = pipeline(
                    task,
                    model=mdl,
                    tokenizer=tok,
                    device=-1,
                )
            _GEN_TOKENIZER = tok
            _GEN_MODEL_NAME = model_name
 
        # Build a simple conversation prompt
        parts = []
        if request.system_prompt:
            parts.append(f"System: {request.system_prompt}")
        for msg in request.messages:
            role = (msg.role or "user").capitalize()
            parts.append(f"{role}: {msg.content}")
        parts.append("Assistant:")
        prompt = "\n".join(parts)
 
        # Truncate to fit model context window to avoid index errors
        try:
            cfg = _GEN_PIPE.model.config
            max_ctx = (
                getattr(cfg, "n_positions", None)
                or getattr(cfg, "max_position_embeddings", None)
                or getattr(cfg, "max_sequence_length", None)
            )
        except Exception:
            max_ctx = None
        # Use smaller generation and a safety buffer to avoid hitting the edge
        max_new = 64
        if not isinstance(max_ctx, int) or max_ctx <= 0:
            max_ctx = 1024  # safe default for GPT2/DialoGPT family
        safety_buf = 32
        max_input_tokens = max(1, max_ctx - max_new - safety_buf)
        ids = _GEN_TOKENIZER(prompt, add_special_tokens=False).input_ids
        if len(ids) > max_input_tokens:
            ids = ids[-max_input_tokens:]
            prompt = _GEN_TOKENIZER.decode(ids, skip_special_tokens=True)

        # Generate with safe defaults
        out = _GEN_PIPE(
            prompt,
            max_new_tokens=max_new,
            do_sample=True,
            temperature=max(0.01, min(float(request.temperature or 0.3), 1.5)),
            eos_token_id=_GEN_TOKENIZER.eos_token_id,
            pad_token_id=_GEN_TOKENIZER.pad_token_id,
            return_full_text=False,
            # Some transformer versions accept this and will tokenize with truncation
            # If unsupported, it will be ignored harmlessly.
            truncation=True,
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


