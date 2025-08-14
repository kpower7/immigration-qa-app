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
        "fastapi"
    ]),
    gpu=modal.gpu.A10G(),  # Adjust GPU type as needed
    timeout=300,
)
@modal.web_endpoint(method="POST")
def web(request: ChatRequest) -> ChatResponse:
    """
    Web endpoint that receives chat requests and returns responses
    This is what your FastAPI backend calls at /generate
    """
    # For now, return a simple response
    # You can replace this with actual model inference
    
    # Extract the last user message
    user_messages = [msg for msg in request.messages if msg.role == "user"]
    last_message = user_messages[-1].content if user_messages else "Hello"
    
    # Simple response for testing
    response_text = f"[Modal GPT-OSS-120b] I received your message: '{last_message}'. This is a test response from Modal deployment."
    
    return ChatResponse(
        text=response_text,
        model=request.model or "gpt-oss-120b"
    )

# Alternative function for actual model inference (commented out for now)
"""
@app.function(
    image=modal.Image.debian_slim().pip_install([
        "transformers",
        "torch",
        "accelerate",
        "pydantic",
        "fastapi"
    ]),
    gpu=modal.gpu.A10G(),
    timeout=300,
)
@modal.web_endpoint(method="POST")
def web(request: ChatRequest) -> ChatResponse:
    from transformers import AutoTokenizer, AutoModelForCausalLM
    import torch
    
    # Load model (this would be cached after first load)
    model_name = "microsoft/DialoGPT-medium"  # Replace with actual model
    tokenizer = AutoTokenizer.from_pretrained(model_name)
    model = AutoModelForCausalLM.from_pretrained(model_name)
    
    # Process messages
    messages_text = ""
    for msg in request.messages:
        messages_text += f"{msg.role}: {msg.content}\n"
    
    if request.system_prompt:
        messages_text = f"System: {request.system_prompt}\n" + messages_text
    
    # Generate response
    inputs = tokenizer.encode(messages_text, return_tensors="pt")
    
    with torch.no_grad():
        outputs = model.generate(
            inputs,
            max_length=inputs.shape[1] + 150,
            temperature=request.temperature,
            do_sample=True,
            pad_token_id=tokenizer.eos_token_id
        )
    
    response = tokenizer.decode(outputs[0][inputs.shape[1]:], skip_special_tokens=True)
    
    return ChatResponse(
        text=response.strip(),
        model=request.model or "gpt-oss-120b"
    )
"""
