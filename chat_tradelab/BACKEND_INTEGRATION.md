# Backend Integration Guide

## Database Schema (Add to Render PostgreSQL)

Run these migrations on your existing Render PostgreSQL database:

```sql
-- Chat sessions table
CREATE TABLE chat_sessions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    country_code VARCHAR(2) NOT NULL,
    agent_id VARCHAR(255) NOT NULL,
    started_at TIMESTAMP NOT NULL DEFAULT NOW(),
    ended_at TIMESTAMP,
    total_duration_seconds INTEGER DEFAULT 0,
    total_messages INTEGER DEFAULT 0,
    status VARCHAR(20) DEFAULT 'active' CHECK (status IN ('active', 'ended', 'error')),
    metadata JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMP NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_chat_sessions_user_id ON chat_sessions(user_id);
CREATE INDEX idx_chat_sessions_started_at ON chat_sessions(started_at);
CREATE INDEX idx_chat_sessions_status ON chat_sessions(status);

-- UI events table
CREATE TABLE ui_events (
    id SERIAL PRIMARY KEY,
    session_id UUID NOT NULL REFERENCES chat_sessions(id) ON DELETE CASCADE,
    event_type VARCHAR(50) NOT NULL,
    event_data JSONB NOT NULL,
    created_at TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_ui_events_session_id ON ui_events(session_id);
CREATE INDEX idx_ui_events_created_at ON ui_events(created_at);

-- Chat usage tracking for billing
CREATE TABLE chat_usage (
    id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    session_id UUID NOT NULL REFERENCES chat_sessions(id) ON DELETE CASCADE,
    usage_type VARCHAR(50) NOT NULL, -- 'voice_minute', 'message', 'session_start'
    quantity DECIMAL(10, 2) NOT NULL DEFAULT 1,
    country_code VARCHAR(2) NOT NULL,
    cost_usd DECIMAL(10, 4) DEFAULT 0,
    metadata JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_chat_usage_user_id ON chat_usage(user_id);
CREATE INDEX idx_chat_usage_session_id ON chat_usage(session_id);
CREATE INDEX idx_chat_usage_created_at ON chat_usage(created_at);

-- Trigger to update chat_sessions.updated_at
CREATE OR REPLACE FUNCTION update_chat_sessions_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER chat_sessions_updated_at
    BEFORE UPDATE ON chat_sessions
    FOR EACH ROW
    EXECUTE FUNCTION update_chat_sessions_updated_at();
```

## Backend API Endpoints (Add to Render backend)

Create these endpoints in your existing Render backend (`platform` repo):

### 1. **POST /api/auth/verify-session**
Verify user JWT token and return user info.

```python
# backend/routes/auth.py (or similar)
from flask import Blueprint, request, jsonify
from functools import wraps
import jwt
import os

auth_bp = Blueprint('auth', __name__)

def verify_token():
    """Middleware to verify JWT token"""
    token = request.headers.get('Authorization', '').replace('Bearer ', '')
    if not token:
        return None, {'error': 'Missing token'}, 401
    
    try:
        payload = jwt.decode(token, os.getenv('JWT_SECRET'), algorithms=['HS256'])
        return payload, None, None
    except jwt.ExpiredSignatureError:
        return None, {'error': 'Token expired'}, 401
    except jwt.InvalidTokenError:
        return None, {'error': 'Invalid token'}, 401

@auth_bp.route('/api/auth/verify-session', methods=['POST'])
def verify_session():
    """Verify JWT and return user info"""
    payload, error, status = verify_token()
    if error:
        return jsonify(error), status
    
    # Get user from database
    user = db.session.query(User).filter_by(id=payload['user_id']).first()
    if not user:
        return jsonify({'error': 'User not found'}), 404
    
    return jsonify({
        'user_id': user.id,
        'email': user.email,
        'subscription_tier': user.subscription_tier,  # free, basic, premium
        'usage_limit': user.usage_limit,
        'current_usage': get_user_monthly_usage(user.id)
    })
```

### 2. **POST /api/chat/start-session**
Start a new chat session and return session ID.

```python
# backend/routes/chat.py
from flask import Blueprint, request, jsonify
from models import ChatSession, db
import uuid

chat_bp = Blueprint('chat', __name__)

@chat_bp.route('/api/chat/start-session', methods=['POST'])
def start_session():
    """Start a new chat session"""
    payload, error, status = verify_token()
    if error:
        return jsonify(error), status
    
    data = request.json
    country_code = data.get('country_code', 'US')
    agent_id = data.get('agent_id')
    
    # Create session
    session = ChatSession(
        id=uuid.uuid4(),
        user_id=payload['user_id'],
        country_code=country_code,
        agent_id=agent_id,
        status='active'
    )
    db.session.add(session)
    
    # Log session start usage
    usage = ChatUsage(
        user_id=payload['user_id'],
        session_id=session.id,
        usage_type='session_start',
        quantity=1,
        country_code=country_code,
        cost_usd=0.01  # Example: $0.01 per session start
    )
    db.session.add(usage)
    db.session.commit()
    
    return jsonify({
        'session_id': str(session.id),
        'started_at': session.started_at.isoformat()
    })
```

### 3. **POST /api/chat/log-usage**
Log chat usage (messages, voice minutes, etc.)

```python
@chat_bp.route('/api/chat/log-usage', methods=['POST'])
def log_usage():
    """Log chat usage for billing"""
    payload, error, status = verify_token()
    if error:
        return jsonify(error), status
    
    data = request.json
    session_id = data.get('session_id')
    usage_type = data.get('usage_type')  # 'voice_minute', 'message'
    quantity = data.get('quantity', 1)
    
    # Get session
    session = db.session.query(ChatSession).filter_by(id=session_id).first()
    if not session or session.user_id != payload['user_id']:
        return jsonify({'error': 'Invalid session'}), 403
    
    # Calculate cost
    cost = calculate_usage_cost(usage_type, quantity)
    
    # Log usage
    usage = ChatUsage(
        user_id=payload['user_id'],
        session_id=session_id,
        usage_type=usage_type,
        quantity=quantity,
        country_code=session.country_code,
        cost_usd=cost,
        metadata=data.get('metadata', {})
    )
    db.session.add(usage)
    
    # Update session counters
    if usage_type == 'message':
        session.total_messages += quantity
    elif usage_type == 'voice_minute':
        session.total_duration_seconds += (quantity * 60)
    
    db.session.commit()
    
    return jsonify({'success': True, 'cost': cost})

def calculate_usage_cost(usage_type, quantity):
    """Calculate cost based on usage type"""
    pricing = {
        'session_start': 0.01,
        'message': 0.001,
        'voice_minute': 0.05
    }
    return pricing.get(usage_type, 0) * quantity
```

### 4. **GET /api/chat/ui-events/:session_id**
Get UI events for a session

```python
@chat_bp.route('/api/chat/ui-events/<session_id>', methods=['GET'])
def get_ui_events(session_id):
    """Get UI events for a session"""
    payload, error, status = verify_token()
    if error:
        return jsonify(error), status
    
    # Verify session belongs to user
    session = db.session.query(ChatSession).filter_by(id=session_id).first()
    if not session or session.user_id != payload['user_id']:
        return jsonify({'error': 'Invalid session'}), 403
    
    # Get events
    events = db.session.query(UIEvent).filter_by(session_id=session_id).order_by(UIEvent.created_at).all()
    
    return jsonify({
        'events': [
            {
                'ts': e.created_at.isoformat(),
                'session_id': str(e.session_id),
                'action': e.event_data
            }
            for e in events
        ]
    })
```

### 5. **POST /api/chat/ui-event**
Post a UI event

```python
@chat_bp.route('/api/chat/ui-event', methods=['POST'])
def post_ui_event():
    """Post a UI event"""
    # This can be called by ElevenLabs webhook or internal tools
    # May not require auth if called by trusted sources
    
    data = request.json
    session_id = data.get('session_id')
    
    event = UIEvent(
        session_id=session_id,
        event_type=data.get('action', {}).get('type', 'unknown'),
        event_data=data.get('action', {})
    )
    db.session.add(event)
    db.session.commit()
    
    return jsonify({'success': True})
```

## Environment Variables (Render Backend)

Add to your Render backend:

```env
JWT_SECRET=your_jwt_secret_here
ELEVEN_API_KEY=your_elevenlabs_api_key
ALLOWED_ORIGINS=https://chat.thetradelab.ai,http://localhost:3000
```

## Environment Variables (Netlify)

Add to Netlify:

```env
BACKEND_URL=https://your-backend.onrender.com
JWT_SECRET=same_as_render_backend
ELEVEN_API_KEY=your_elevenlabs_api_key
NEXT_PUBLIC_ELEVEN_AGENT_ID_US=your_us_agent_id
```
