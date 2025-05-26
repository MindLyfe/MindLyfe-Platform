import json
import logging
import httpx
import asyncio
import time
from typing import Dict, Any, List, Tuple, Optional, AsyncGenerator
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.config import settings
from app.core.security import get_service_token

logger = logging.getLogger(__name__)

class AIService:
    """Service for interacting with the AI Service for LyfBot"""
    
    async def generate_response(
        self,
        message: str,
        conversation_id: int,
        user_id: str,
        context: Dict[str, Any] = None,
        is_crisis: bool = False,
        crisis_type: str = None
    ) -> str:
        """
        Generate a response to a user message using the AI Service
        
        Args:
            message: The user message
            conversation_id: The ID of the conversation
            user_id: The ID of the user
            context: Additional context
            is_crisis: Whether the message indicates a crisis
            crisis_type: The type of crisis
            
        Returns:
            The generated response
        """
        try:
            # Get service token for authentication
            token = await get_service_token()
            
            # Get conversation history
            conversation_history = await self._get_conversation_history(conversation_id)
            
            # Prepare request payload
            payload = {
                "message": message,
                "conversation_id": str(conversation_id),
                "history": conversation_history,
                "context": context or {},
                "user_id": user_id,
                "is_crisis": is_crisis,
                "crisis_type": crisis_type
            }
            
            # Call AI Service to generate response
            async with httpx.AsyncClient() as client:
                response = await client.post(
                    f"{settings.AI_SERVICE_URL}/api/v1/lyfbot/generate",
                    json=payload,
                    headers={
                        "Authorization": f"Bearer {token}",
                        "X-User-ID": user_id
                    },
                    timeout=30.0  # Longer timeout for AI processing
                )
                
                if response.status_code != 200:
                    logger.error(f"AI Service response generation failed: {response.text}")
                    
                    # Fallback to local generation or OpenAI direct call if configured
                    if settings.OPENAI_API_KEY:
                        return await self._fallback_generate_response(
                            message, 
                            conversation_history, 
                            context, 
                            is_crisis, 
                            crisis_type
                        )
                    
                    raise Exception(f"AI Service returned status {response.status_code}")
                    
                result = response.json()
                return result["response"]
                
        except httpx.RequestError as exc:
            logger.error(f"AI Service request failed: {str(exc)}")
            
            # Fallback to local generation or OpenAI direct call if configured
            if settings.OPENAI_API_KEY:
                return await self._fallback_generate_response(
                    message, 
                    conversation_history, 
                    context, 
                    is_crisis, 
                    crisis_type
                )
                
            raise Exception(f"Failed to connect to AI Service: {str(exc)}")
    
    async def stream_response(
        self,
        message: str,
        conversation_id: int,
        user_id: str,
        context: Dict[str, Any] = None,
        is_crisis: bool = False,
        crisis_type: str = None,
        db: AsyncSession = None
    ) -> AsyncGenerator[str, None]:
        """
        Stream a response to a user message using the AI Service
        
        Args:
            message: The user message
            conversation_id: The ID of the conversation
            user_id: The ID of the user
            context: Additional context
            is_crisis: Whether the message indicates a crisis
            crisis_type: The type of crisis
            db: Database session
            
        Yields:
            Chunks of the generated response
        """
        try:
            # Get service token for authentication
            token = await get_service_token()
            
            # Get conversation history
            conversation_history = await self._get_conversation_history(conversation_id)
            
            # Prepare request payload
            payload = {
                "message": message,
                "conversation_id": str(conversation_id),
                "history": conversation_history,
                "context": context or {},
                "user_id": user_id,
                "is_crisis": is_crisis,
                "crisis_type": crisis_type,
                "stream": True
            }
            
            # Initialize full response for storage
            full_response = ""
            message_id = None
            
            # Setup streaming request to AI Service
            async with httpx.AsyncClient() as client:
                async with client.stream(
                    "POST",
                    f"{settings.AI_SERVICE_URL}/api/v1/lyfbot/generate",
                    json=payload,
                    headers={
                        "Authorization": f"Bearer {token}",
                        "X-User-ID": user_id
                    },
                    timeout=60.0  # Longer timeout for streaming
                ) as response:
                    if response.status_code != 200:
                        logger.error(f"AI Service streaming failed: {await response.aread()}")
                        
                        # Fallback to local generation
                        if settings.OPENAI_API_KEY:
                            # For fallback, we can't really stream, so we generate the full response
                            # and then simulate streaming
                            full_response = await self._fallback_generate_response(
                                message, 
                                conversation_history, 
                                context, 
                                is_crisis, 
                                crisis_type
                            )
                            
                            # Simulate streaming with chunks
                            words = full_response.split()
                            chunks = [" ".join(words[i:i+3]) for i in range(0, len(words), 3)]
                            
                            for chunk in chunks:
                                yield json.dumps({
                                    "message_part": chunk,
                                    "conversation_id": conversation_id,
                                    "is_final": False
                                }) + "\n"
                                await asyncio.sleep(0.1)
                                
                            # Save the message to the database
                            if db:
                                from app.services.message_service import MessageService
                                message_service = MessageService()
                                assistant_message = await message_service.create_message(
                                    db,
                                    conversation_id=conversation_id,
                                    role="assistant",
                                    content=full_response,
                                    user_id=user_id
                                )
                                message_id = assistant_message.id
                                
                            # Send final chunk
                            yield json.dumps({
                                "message_part": "",
                                "conversation_id": conversation_id,
                                "message_id": message_id,
                                "is_final": True
                            }) + "\n"
                            
                            return
                        
                        raise Exception(f"AI Service returned status {response.status_code}")
                    
                    # Process streaming response
                    async for line in response.aiter_lines():
                        if not line.strip():
                            continue
                            
                        try:
                            data = json.loads(line)
                            chunk = data.get("message_part", "")
                            is_final = data.get("is_final", False)
                            
                            # Append to full response
                            full_response += chunk
                            
                            # Save the message to the database when we get the final chunk
                            if is_final and db and not message_id:
                                from app.services.message_service import MessageService
                                message_service = MessageService()
                                assistant_message = await message_service.create_message(
                                    db,
                                    conversation_id=conversation_id,
                                    role="assistant",
                                    content=full_response,
                                    user_id=user_id
                                )
                                message_id = assistant_message.id
                                data["message_id"] = message_id
                                
                            # Yield the data to the client
                            yield json.dumps(data) + "\n"
                            
                        except json.JSONDecodeError as e:
                            logger.error(f"Failed to parse streaming response: {str(e)}")
                            continue
                
        except httpx.RequestError as exc:
            logger.error(f"AI Service streaming request failed: {str(exc)}")
            
            # Fallback to local generation
            if settings.OPENAI_API_KEY:
                # For fallback, we can't really stream, so we generate the full response
                # and then simulate streaming
                full_response = await self._fallback_generate_response(
                    message, 
                    conversation_history, 
                    context, 
                    is_crisis, 
                    crisis_type
                )
                
                # Simulate streaming with chunks
                words = full_response.split()
                chunks = [" ".join(words[i:i+3]) for i in range(0, len(words), 3)]
                
                for chunk in chunks:
                    yield json.dumps({
                        "message_part": chunk,
                        "conversation_id": conversation_id,
                        "is_final": False
                    }) + "\n"
                    await asyncio.sleep(0.1)
                    
                # Save the message to the database
                if db:
                    from app.services.message_service import MessageService
                    message_service = MessageService()
                    assistant_message = await message_service.create_message(
                        db,
                        conversation_id=conversation_id,
                        role="assistant",
                        content=full_response,
                        user_id=user_id
                    )
                    message_id = assistant_message.id
                    
                # Send final chunk
                yield json.dumps({
                    "message_part": "",
                    "conversation_id": conversation_id,
                    "message_id": message_id,
                    "is_final": True
                }) + "\n"
                
                return
                
            raise Exception(f"Failed to connect to AI Service: {str(exc)}")
    
    async def analyze_message(
        self,
        message_id: int,
        content: str,
        user_id: str,
        db: AsyncSession
    ) -> Dict[str, Any]:
        """
        Analyze a message for sentiment, topics, etc.
        
        Args:
            message_id: The ID of the message
            content: The message content
            user_id: The ID of the user
            db: Database session
            
        Returns:
            Dict containing the analysis results
        """
        try:
            # Get service token for authentication
            token = await get_service_token()
            
            # Call AI Service to analyze the message
            async with httpx.AsyncClient() as client:
                response = await client.post(
                    f"{settings.AI_SERVICE_URL}/api/v1/lyfbot/analyze",
                    json={
                        "content": content,
                        "message_id": message_id,
                        "user_id": user_id
                    },
                    headers={
                        "Authorization": f"Bearer {token}",
                        "X-User-ID": user_id
                    },
                    timeout=15.0
                )
                
                if response.status_code != 200:
                    logger.error(f"AI Service analysis failed: {response.text}")
                    return self._create_minimal_analysis(content)
                    
                analysis = response.json()
                
                # Store analysis in the database
                from app.models.message_analysis import MessageAnalysis
                
                # TODO: Implement storing analysis in the database
                
                return analysis
                
        except httpx.RequestError as exc:
            logger.error(f"AI Service analysis request failed: {str(exc)}")
            return self._create_minimal_analysis(content)
    
    async def detect_crisis(
        self,
        content: str,
        user_id: str
    ) -> Tuple[bool, Optional[str]]:
        """
        Detect if a message indicates a crisis situation
        
        Args:
            content: The message content
            user_id: The ID of the user
            
        Returns:
            Tuple of (is_crisis, crisis_type)
        """
        try:
            # Get service token for authentication
            token = await get_service_token()
            
            # Call AI Service to detect crisis
            async with httpx.AsyncClient() as client:
                response = await client.post(
                    f"{settings.AI_SERVICE_URL}/api/v1/lyfbot/detect-crisis",
                    json={
                        "content": content,
                        "user_id": user_id
                    },
                    headers={
                        "Authorization": f"Bearer {token}",
                        "X-User-ID": user_id
                    },
                    timeout=10.0
                )
                
                if response.status_code != 200:
                    logger.error(f"AI Service crisis detection failed: {response.text}")
                    return self._fallback_detect_crisis(content)
                    
                result = response.json()
                return result["is_crisis"], result.get("crisis_type")
                
        except httpx.RequestError as exc:
            logger.error(f"AI Service crisis detection request failed: {str(exc)}")
            return self._fallback_detect_crisis(content)
    
    async def _get_conversation_history(self, conversation_id: int) -> List[Dict[str, Any]]:
        """
        Get the conversation history for a conversation
        
        Args:
            conversation_id: The ID of the conversation
            
        Returns:
            List of messages in the conversation
        """
        try:
            # This would typically query the database for messages
            # but for now we'll return a stub implementation
            # TODO: Implement this with the database
            return []
        except Exception as e:
            logger.error(f"Failed to get conversation history: {str(e)}")
            return []
    
    async def _fallback_generate_response(
        self,
        message: str,
        conversation_history: List[Dict[str, Any]],
        context: Dict[str, Any] = None,
        is_crisis: bool = False,
        crisis_type: str = None
    ) -> str:
        """
        Fallback method to generate a response directly with OpenAI if AI Service is unavailable
        
        Args:
            message: The user message
            conversation_history: The conversation history
            context: Additional context
            is_crisis: Whether the message indicates a crisis
            crisis_type: The type of crisis
            
        Returns:
            The generated response
        """
        try:
            # Only run this if OpenAI API key is configured
            if not settings.OPENAI_API_KEY:
                return "I'm sorry, I'm having trouble connecting to my knowledge base right now. Please try again later."
                
            import openai
            
            # Configure OpenAI
            openai.api_key = settings.OPENAI_API_KEY
            
            # Build the messages array for the OpenAI API
            messages = []
            
            # Add system message
            system_message = settings.DEFAULT_SYSTEM_MESSAGE
            
            # If this is a crisis, update the system message
            if is_crisis and crisis_type in settings.CRISIS_RESPONSE:
                system_message += f"\n\nIMPORTANT: The user is expressing {crisis_type} thoughts. "
                system_message += "Respond with empathy and provide appropriate resources. "
                system_message += "Do not minimize their feelings or use generic platitudes."
                
            messages.append({"role": "system", "content": system_message})
            
            # Add conversation history
            for msg in conversation_history:
                messages.append({
                    "role": msg["role"],
                    "content": msg["content"]
                })
                
            # Add any context as a system message
            if context:
                context_message = "Context information:\n"
                for key, value in context.items():
                    if isinstance(value, dict):
                        context_message += f"{key}:\n"
                        for sub_key, sub_value in value.items():
                            context_message += f"- {sub_key}: {sub_value}\n"
                    else:
                        context_message += f"{key}: {value}\n"
                        
                messages.append({"role": "system", "content": context_message})
                
            # Add the current message
            messages.append({"role": "user", "content": message})
            
            # Call OpenAI API
            response = await openai.ChatCompletion.acreate(
                model=settings.OPENAI_MODEL,
                messages=messages,
                temperature=0.7,
                max_tokens=1000
            )
            
            # Get the response text
            response_text = response.choices[0].message.content
            
            # If this is a crisis, append resources
            if is_crisis and crisis_type in settings.CRISIS_RESPONSE:
                response_text += "\n\n" + settings.CRISIS_RESPONSE[crisis_type]["message"] + "\n\n"
                response_text += "Resources:\n"
                
                for resource in settings.CRISIS_RESPONSE[crisis_type]["resources"]:
                    response_text += f"- {resource['name']}: {resource['contact']}\n"
                    
            return response_text
            
        except Exception as e:
            logger.error(f"Fallback response generation failed: {str(e)}")
            
            # Return a generic response
            if is_crisis:
                return "I notice you might be going through a difficult time. If you're in immediate danger, please call emergency services or a crisis helpline like the National Suicide Prevention Lifeline at 1-800-273-8255. They can provide immediate support."
            else:
                return "I'm sorry, I'm having trouble connecting to my knowledge base right now. Please try again later."
    
    def _fallback_detect_crisis(self, content: str) -> Tuple[bool, Optional[str]]:
        """
        Fallback method to detect if a message indicates a crisis using simple keyword matching
        
        Args:
            content: The message content
            
        Returns:
            Tuple of (is_crisis, crisis_type)
        """
        content_lower = content.lower()
        
        # Check for suicide keywords
        suicide_keywords = [
            "suicide", "kill myself", "end my life", "don't want to live",
            "better off dead", "no reason to live", "can't go on"
        ]
        
        for keyword in suicide_keywords:
            if keyword in content_lower:
                return True, "suicide"
                
        # Check for self-harm keywords
        self_harm_keywords = [
            "self-harm", "cut myself", "cutting myself", "hurt myself",
            "harming myself", "self harm", "self-harming"
        ]
        
        for keyword in self_harm_keywords:
            if keyword in content_lower:
                return True, "self_harm"
                
        # No crisis detected
        return False, None
    
    def _create_minimal_analysis(self, content: str) -> Dict[str, Any]:
        """
        Create a minimal analysis when AI Service is unavailable
        
        Args:
            content: The message content
            
        Returns:
            Dict containing a minimal analysis
        """
        word_count = len(content.split())
        
        return {
            "sentiment": "neutral",
            "emotion": "unknown",
            "topics": [],
            "word_count": word_count,
            "timestamp": time.time()
        } 