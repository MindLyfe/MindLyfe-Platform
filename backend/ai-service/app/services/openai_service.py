import openai
import redis
import json
from typing import List, Dict, Any, Optional
from tenacity import retry, stop_after_attempt, wait_random_exponential

from app.core.config import settings

class OpenAIService:
    def __init__(self):
        openai.api_key = settings.OPENAI_API_KEY
        if settings.OPENAI_ORGANIZATION:
            openai.organization = settings.OPENAI_ORGANIZATION
        
        self.redis_client = redis.from_url(settings.REDIS_URL)
        self.model = settings.DEFAULT_MODEL
    
    def _get_chat_history_key(self, user_id: str) -> str:
        """Generate Redis key for storing chat history."""
        return f"chat:history:{user_id}"
    
    async def _get_chat_history(self, user_id: str) -> List[Dict[str, str]]:
        """Retrieve chat history from Redis."""
        history_key = self._get_chat_history_key(user_id)
        history_json = self.redis_client.get(history_key)
        
        if not history_json:
            return []
        
        return json.loads(history_json)
    
    async def _save_chat_history(self, user_id: str, history: List[Dict[str, str]]) -> None:
        """Save chat history to Redis."""
        history_key = self._get_chat_history_key(user_id)
        self.redis_client.set(history_key, json.dumps(history))
        # Set expiry to 24 hours
        self.redis_client.expire(history_key, 60 * 60 * 24)
    
    @retry(wait=wait_random_exponential(min=1, max=60), stop=stop_after_attempt(3))
    async def generate_chat_response(
        self, 
        user_id: str, 
        message: str, 
        chat_history: Optional[List[Dict[str, str]]] = None,
        context: Optional[Dict[str, Any]] = None
    ) -> str:
        """Generate response using OpenAI's ChatGPT."""
        if not chat_history:
            chat_history = await self._get_chat_history(user_id)
        
        # Prepare the messages for the OpenAI API
        messages = []
        
        # Add system message with context
        system_message = {
            "role": "system",
            "content": "You are LyfBot, an empathetic mental health assistant designed to provide support and guidance. "
                      "You should be compassionate, non-judgmental, and helpful. "
                      "Always prioritize user safety and well-being. "
                      "If you detect signs of crisis, suggest appropriate professional resources."
        }
        
        # Add context if provided
        if context:
            system_content_additions = []
            if "user_profile" in context:
                profile = context["user_profile"]
                system_content_additions.append(
                    f"The user's name is {profile.get('name', 'the user')}. "
                    f"Their therapy goals include: {', '.join(profile.get('therapy_goals', ['general well-being']))}."
                )
            
            if "recent_mood" in context:
                system_content_additions.append(
                    f"The user's recent mood tracking shows: {context['recent_mood']}."
                )
                
            if system_content_additions:
                system_message["content"] += " " + " ".join(system_content_additions)
        
        messages.append(system_message)
        
        # Add chat history (limited to last 10 messages to manage token count)
        for msg in chat_history[-10:]:
            messages.append({
                "role": msg["role"],
                "content": msg["content"]
            })
        
        # Add the current user message
        messages.append({
            "role": "user",
            "content": message
        })
        
        # Call the OpenAI API
        response = openai.ChatCompletion.create(
            model=self.model,
            messages=messages,
            temperature=0.7,
            max_tokens=1024,
            top_p=1.0,
            frequency_penalty=0.0,
            presence_penalty=0.0
        )
        
        assistant_response = response.choices[0].message["content"].strip()
        
        # Update chat history
        chat_history.append({"role": "user", "content": message})
        chat_history.append({"role": "assistant", "content": assistant_response})
        
        # Save updated chat history
        await self._save_chat_history(user_id, chat_history)
        
        return assistant_response
    
    async def reset_conversation(self, user_id: str) -> None:
        """Reset the conversation history for a user."""
        history_key = self._get_chat_history_key(user_id)
        self.redis_client.delete(history_key) 