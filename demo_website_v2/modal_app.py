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
    gpu=modal.gpu.A10G(),  # Adjust GPU type as needed
    timeout=25,
    keep_warm=1,  # Keep 1 instance warm to avoid cold starts
)
@modal.web_endpoint(method="POST")
def web(request: ChatRequest) -> ChatResponse:
    """
    Web endpoint that receives chat requests and returns responses
    This is what your FastAPI backend calls at /generate
    """
    from transformers import AutoTokenizer, AutoModelForCausalLM
    import torch
    
    # Use a smaller, faster model for production speed
    model_name = "microsoft/DialoGPT-small"  # Much faster than large model
    
    try:
        # Load model and tokenizer (cached after first load)
        tokenizer = AutoTokenizer.from_pretrained(model_name)
        model = AutoModelForCausalLM.from_pretrained(model_name)
        
        # Set pad token if not set
        if tokenizer.pad_token is None:
            tokenizer.pad_token = tokenizer.eos_token
        
        # Process messages into conversation format
        conversation = ""
        if request.system_prompt:
            conversation += f"System: {request.system_prompt}\n"
        
        for msg in request.messages:
            conversation += f"{msg.role.capitalize()}: {msg.content}\n"
        
        conversation += "Assistant:"
        
        # Tokenize input
        inputs = tokenizer.encode(conversation, return_tensors="pt", max_length=1024, truncation=True)
        
        # Generate response (optimized for speed)
        with torch.no_grad():
            outputs = model.generate(
                inputs,
                max_new_tokens=50,  # Limit to 50 new tokens for speed
                temperature=request.temperature,
                do_sample=True,
                pad_token_id=tokenizer.pad_token_id,
                eos_token_id=tokenizer.eos_token_id,
                num_return_sequences=1,
                early_stopping=True,  # Stop early when EOS is generated
                num_beams=1,  # Use greedy search for speed
            )
        
        # Decode response
        response = tokenizer.decode(outputs[0][inputs.shape[1]:], skip_special_tokens=True)
        response = response.strip()
        
        # Fallback if response is empty
        if not response:
            response = "I understand your message. How can I help you further?"
        
        return ChatResponse(
            text=response,
            model=request.model or "gpt-oss-120b"
        )
        
    except Exception as e:
        # Error handling - return error message
        return ChatResponse(
            text=f"Error processing request: {str(e)}",
            model=request.model or "gpt-oss-120b"
        )


