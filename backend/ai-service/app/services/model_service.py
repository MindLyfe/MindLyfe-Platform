from typing import Dict, Any, List, Optional, Tuple
import os
import logging
import json
import time
import redis
import numpy as np
from datetime import datetime
from enum import Enum
import hashlib
import openai
from pydantic import BaseModel
from tenacity import retry, stop_after_attempt, wait_random_exponential

from app.core.config import settings
from app.utils.encryption import encrypt_data, decrypt_data
from app.utils.compliance import sanitize_phi, audit_log

logger = logging.getLogger(__name__)

class ModelProvider(str, Enum):
    OPENAI = "openai"
    CUSTOM = "custom"

class ModelFeature(str, Enum):
    CHAT = "chat"
    JOURNAL_ANALYSIS = "journal_analysis"
    MOOD_PREDICTION = "mood_prediction"
    RECOMMENDATION = "recommendation"
    PERSONALIZATION = "personalization"

class ModelVersionInfo(BaseModel):
    version: str
    accuracy: float
    created_at: str
    feature: ModelFeature
    metrics: Dict[str, float]

class ModelService:
    def __init__(self):
        # OpenAI configuration
        openai.api_key = settings.OPENAI_API_KEY
        if settings.OPENAI_ORGANIZATION:
            openai.organization = settings.OPENAI_ORGANIZATION
        
        # Redis client for caching and session management
        self.redis_client = redis.from_url(settings.REDIS_URL)
        
        # Default model configurations
        self.default_model = settings.DEFAULT_MODEL
        self.default_provider = ModelProvider.OPENAI
        
        # Load custom model configurations
        self.custom_models = self._load_custom_models()
        
        # A/B testing configuration
        self.ab_testing_enabled = settings.AB_TESTING_ENABLED
        
        # Initialize custom model registry
        self._initialize_model_registry()
        
    def _load_custom_models(self) -> Dict[ModelFeature, str]:
        """Load custom model paths for each feature"""
        return {
            ModelFeature.CHAT: settings.CUSTOM_CHAT_MODEL_PATH,
            ModelFeature.JOURNAL_ANALYSIS: settings.CUSTOM_JOURNAL_MODEL_PATH,
            ModelFeature.MOOD_PREDICTION: settings.CUSTOM_MOOD_MODEL_PATH,
            ModelFeature.RECOMMENDATION: settings.CUSTOM_RECOMMENDATION_MODEL_PATH,
            ModelFeature.PERSONALIZATION: settings.CUSTOM_PERSONALIZATION_MODEL_PATH
        }
    
    def _initialize_model_registry(self):
        """Initialize model registry with available model versions"""
        # This would be populated from a database in a production environment
        # For now, we'll just create a placeholder structure
        self.model_registry = {
            ModelFeature.CHAT: [
                ModelVersionInfo(
                    version="0.1.0",
                    accuracy=0.85,
                    created_at=datetime.now().isoformat(),
                    feature=ModelFeature.CHAT,
                    metrics={"precision": 0.87, "recall": 0.83}
                )
            ]
        }
    
    def _get_ab_test_assignment(self, user_id: str, feature: ModelFeature) -> ModelProvider:
        """Determine which model to use based on A/B testing configuration"""
        if not self.ab_testing_enabled:
            return self.default_provider
        
        # Create a deterministic but random-seeming assignment based on user_id and feature
        seed = hashlib.md5(f"{user_id}:{feature}".encode()).hexdigest()
        # Convert first 8 chars of hash to int and use modulo 100 to get percentage
        assignment_value = int(seed[:8], 16) % 100
        
        # Check if user should get custom model based on current rollout percentage
        custom_model_percentage = self._get_feature_rollout_percentage(feature)
        
        # If feature has no custom model yet, default to OpenAI
        if feature not in self.custom_models or not self.custom_models[feature]:
            return ModelProvider.OPENAI
            
        return ModelProvider.CUSTOM if assignment_value < custom_model_percentage else ModelProvider.OPENAI
    
    def _get_feature_rollout_percentage(self, feature: ModelFeature) -> int:
        """Get the current rollout percentage for a feature's custom model"""
        # This would come from a database or config service in production
        rollout_percentages = {
            ModelFeature.CHAT: settings.CUSTOM_CHAT_MODEL_ROLLOUT_PERCENTAGE,
            ModelFeature.JOURNAL_ANALYSIS: settings.CUSTOM_JOURNAL_MODEL_ROLLOUT_PERCENTAGE,
            ModelFeature.MOOD_PREDICTION: settings.CUSTOM_MOOD_MODEL_ROLLOUT_PERCENTAGE,
            ModelFeature.RECOMMENDATION: settings.CUSTOM_RECOMMENDATION_MODEL_ROLLOUT_PERCENTAGE,
            ModelFeature.PERSONALIZATION: settings.CUSTOM_PERSONALIZATION_MODEL_ROLLOUT_PERCENTAGE
        }
        return rollout_percentages.get(feature, 0)
    
    def _log_model_usage(self, 
                         user_id: str, 
                         feature: ModelFeature, 
                         provider: ModelProvider, 
                         input_hash: str, 
                         output_hash: str,
                         metrics: Dict[str, Any],
                         execution_time: float):
        """Log model usage for auditing and performance tracking"""
        log_entry = {
            "user_id": user_id,
            "feature": feature,
            "provider": provider,
            "timestamp": datetime.now().isoformat(),
            "input_hash": input_hash,  # Hash of input to protect PHI
            "output_hash": output_hash,  # Hash of output to protect PHI
            "execution_time_ms": execution_time,
            "metrics": metrics
        }
        
        # In production, this would go to a secure audit logging system
        logger.info(f"Model usage: {json.dumps(log_entry)}")
        
        # Also log for compliance auditing
        audit_log(
            action="model_inference",
            user_id=user_id,
            resource_type="ai_model",
            resource_id=f"{provider}:{feature}",
            metadata={
                "execution_time_ms": execution_time,
                "model_provider": provider
            }
        )
    
    def _hash_content(self, content: Any) -> str:
        """Create a hash of content for logging without exposing PHI"""
        if isinstance(content, str):
            data = content
        else:
            data = json.dumps(content, sort_keys=True)
        return hashlib.sha256(data.encode()).hexdigest()
    
    @retry(wait=wait_random_exponential(min=1, max=60), stop=stop_after_attempt(3))
    async def generate_chat_response(
        self, 
        user_id: str, 
        message: str, 
        chat_history: Optional[List[Dict[str, str]]] = None,
        context: Optional[Dict[str, Any]] = None
    ) -> Tuple[str, Dict[str, Any]]:
        """Generate response for chat feature"""
        # Sanitize incoming data to remove any PHI that shouldn't be processed
        sanitized_message = sanitize_phi(message)
        
        # Decide which model to use based on A/B testing
        provider = self._get_ab_test_assignment(user_id, ModelFeature.CHAT)
        
        # Start timing for performance metrics
        start_time = time.time()
        
        response = ""
        metrics = {}
        
        try:
            # Get chat history if not provided
            if not chat_history:
                chat_history = await self._get_chat_history(user_id)
            
            if provider == ModelProvider.OPENAI:
                # Use OpenAI for inference
                response = await self._generate_openai_chat_response(
                    user_id=user_id,
                    message=sanitized_message,
                    chat_history=chat_history,
                    context=context
                )
                metrics["model"] = self.default_model
            else:
                # Use our custom model for inference
                response = await self._generate_custom_chat_response(
                    user_id=user_id,
                    message=sanitized_message,
                    chat_history=chat_history,
                    context=context
                )
                metrics["model"] = "custom-chat-v1"
            
            # Update chat history
            chat_history.append({"role": "user", "content": sanitized_message})
            chat_history.append({"role": "assistant", "content": response})
            
            # Save updated chat history
            await self._save_chat_history(user_id, chat_history)
            
        except Exception as e:
            logger.error(f"Error generating chat response: {str(e)}")
            # Fallback to OpenAI if custom model fails
            if provider == ModelProvider.CUSTOM:
                logger.info("Falling back to OpenAI due to custom model failure")
                response = await self._generate_openai_chat_response(
                    user_id=user_id,
                    message=sanitized_message,
                    chat_history=chat_history,
                    context=context
                )
                metrics["fallback"] = True
            else:
                # Re-raise if it was already using OpenAI
                raise
        
        finally:
            # Calculate execution time
            execution_time = (time.time() - start_time) * 1000  # Convert to ms
            metrics["execution_time_ms"] = execution_time
            
            # Log model usage (without exposing PHI)
            self._log_model_usage(
                user_id=user_id,
                feature=ModelFeature.CHAT,
                provider=provider,
                input_hash=self._hash_content(sanitized_message),
                output_hash=self._hash_content(response),
                metrics=metrics,
                execution_time=execution_time
            )
        
        return response, metrics
    
    async def _generate_openai_chat_response(
        self, 
        user_id: str, 
        message: str, 
        chat_history: List[Dict[str, str]],
        context: Optional[Dict[str, Any]] = None
    ) -> str:
        """Generate response using OpenAI's models"""
        # Prepare the messages for the OpenAI API
        messages = []
        
        # Add system message with context
        system_message = {
            "role": "system",
            "content": """You are LyfBot, an empathetic mental health assistant designed to provide support and guidance.
            Your responses should be compassionate, non-judgmental, and helpful.
            Always prioritize user safety and well-being.
            If you detect signs of crisis, suggest appropriate professional resources.
            Do not make any statements that could be harmful to someone experiencing mental health challenges.
            Do not diagnose medical conditions.
            Always clarify that you are an AI assistant and not a replacement for professional mental health care.
            """
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
            model=self.default_model,
            messages=messages,
            temperature=0.7,
            max_tokens=1024,
            top_p=1.0,
            frequency_penalty=0.0,
            presence_penalty=0.0
        )
        
        return response.choices[0].message["content"].strip()
    
    async def _generate_custom_chat_response(
        self, 
        user_id: str, 
        message: str, 
        chat_history: List[Dict[str, str]],
        context: Optional[Dict[str, Any]] = None
    ) -> str:
        """Generate response using our custom model"""
        # This is a placeholder for our custom model implementation
        # In a real implementation, this would load the appropriate model and generate a response
        
        # Since we don't have an actual model yet, we'll just return a placeholder
        logger.info(f"Custom model would process: {message[:20]}...")
        
        # In the future, this would be replaced with actual model inference
        return "This response would come from our custom mental health support model. Currently in development."
    
    def _get_chat_history_key(self, user_id: str) -> str:
        """Generate Redis key for storing chat history."""
        return f"chat:history:{user_id}"
    
    async def _get_chat_history(self, user_id: str) -> List[Dict[str, str]]:
        """Retrieve chat history from Redis."""
        history_key = self._get_chat_history_key(user_id)
        history_json = self.redis_client.get(history_key)
        
        if not history_json:
            return []
        
        # Decrypt the stored history
        decrypted_history = decrypt_data(history_json)
        return json.loads(decrypted_history)
    
    async def _save_chat_history(self, user_id: str, history: List[Dict[str, str]]) -> None:
        """Save chat history to Redis with encryption."""
        history_key = self._get_chat_history_key(user_id)
        # Encrypt the history before storing
        encrypted_history = encrypt_data(json.dumps(history))
        self.redis_client.set(history_key, encrypted_history)
        # Set expiry to 24 hours
        self.redis_client.expire(history_key, 60 * 60 * 24)
    
    async def reset_conversation(self, user_id: str) -> None:
        """Reset the conversation history for a user."""
        history_key = self._get_chat_history_key(user_id)
        self.redis_client.delete(history_key)
        
    async def analyze_journal_entry(
        self, 
        user_id: str, 
        journal_text: str, 
        context: Optional[Dict[str, Any]] = None
    ) -> Tuple[Dict[str, Any], Dict[str, Any]]:
        """Analyze journal entry for sentiment, themes, and insights"""
        # Sanitize input
        sanitized_text = sanitize_phi(journal_text)
        
        # Decide which model to use
        provider = self._get_ab_test_assignment(user_id, ModelFeature.JOURNAL_ANALYSIS)
        
        # Start timing
        start_time = time.time()
        
        analysis = {}
        metrics = {}
        
        try:
            if provider == ModelProvider.OPENAI:
                analysis = await self._analyze_journal_with_openai(sanitized_text, context)
                metrics["model"] = self.default_model
            else:
                analysis = await self._analyze_journal_with_custom_model(sanitized_text, context)
                metrics["model"] = "custom-journal-v1"
                
        except Exception as e:
            logger.error(f"Error analyzing journal: {str(e)}")
            # Fallback to OpenAI
            if provider == ModelProvider.CUSTOM:
                analysis = await self._analyze_journal_with_openai(sanitized_text, context)
                metrics["fallback"] = True
            else:
                raise
                
        finally:
            execution_time = (time.time() - start_time) * 1000
            metrics["execution_time_ms"] = execution_time
            
            self._log_model_usage(
                user_id=user_id,
                feature=ModelFeature.JOURNAL_ANALYSIS,
                provider=provider,
                input_hash=self._hash_content(sanitized_text),
                output_hash=self._hash_content(analysis),
                metrics=metrics,
                execution_time=execution_time
            )
            
        return analysis, metrics
    
    async def _analyze_journal_with_openai(
        self, 
        journal_text: str, 
        context: Optional[Dict[str, Any]] = None
    ) -> Dict[str, Any]:
        """Analyze journal using OpenAI"""
        prompt = f"""
        Analyze the following journal entry for emotional content, themes, and potential insights.
        Identify the overall sentiment, key emotions, and any patterns or topics that might be relevant for mental health support.
        Do not include any medical diagnoses or clinical assessments.
        
        Journal entry:
        {journal_text}
        
        Provide the analysis in the following JSON format:
        {{
            "sentiment": "positive/negative/neutral/mixed",
            "emotions": ["emotion1", "emotion2"],
            "themes": ["theme1", "theme2"],
            "insights": "brief paragraph with supportive insights",
            "word_count": number,
            "suggested_coping_strategies": ["strategy1", "strategy2"]
        }}
        """
        
        response = openai.ChatCompletion.create(
            model=self.default_model,
            messages=[
                {"role": "system", "content": "You are a mental health analysis assistant."},
                {"role": "user", "content": prompt}
            ],
            temperature=0.5,
            max_tokens=1024,
            top_p=1.0,
            frequency_penalty=0.0,
            presence_penalty=0.0
        )
        
        response_text = response.choices[0].message["content"].strip()
        
        # Extract JSON from response
        try:
            # Find JSON in the response
            start_idx = response_text.find('{')
            end_idx = response_text.rfind('}')
            
            if start_idx >= 0 and end_idx > start_idx:
                json_str = response_text[start_idx:end_idx+1]
                return json.loads(json_str)
            else:
                # Parse failed, return structured error
                return {
                    "error": "Failed to parse JSON response",
                    "sentiment": "unknown",
                    "emotions": [],
                    "themes": [],
                    "insights": "Analysis could not be completed."
                }
        except json.JSONDecodeError:
            return {
                "error": "Invalid JSON format in response",
                "sentiment": "unknown",
                "emotions": [],
                "themes": [],
                "insights": "Analysis could not be completed."
            }
    
    async def _analyze_journal_with_custom_model(
        self, 
        journal_text: str, 
        context: Optional[Dict[str, Any]] = None
    ) -> Dict[str, Any]:
        """Analyze journal using custom model"""
        # Placeholder for custom model implementation
        logger.info(f"Custom journal analysis would process: {journal_text[:20]}...")
        
        # Mock response structure that would come from our model
        return {
            "sentiment": "neutral",
            "emotions": ["placeholder"],
            "themes": ["development"],
            "insights": "This would be analyzed by our custom journal analysis model once deployed.",
            "word_count": len(journal_text.split()),
            "suggested_coping_strategies": ["placeholder strategy"]
        }
    
    async def generate_recommendations(
        self, 
        user_id: str, 
        user_data: Dict[str, Any]
    ) -> Tuple[List[Dict[str, Any]], Dict[str, Any]]:
        """Generate personalized recommendations for the user"""
        # Sanitize user data
        sanitized_data = {k: sanitize_phi(v) if isinstance(v, str) else v for k, v in user_data.items()}
        
        # Decide which model to use
        provider = self._get_ab_test_assignment(user_id, ModelFeature.RECOMMENDATION)
        
        # Start timing
        start_time = time.time()
        
        recommendations = []
        metrics = {}
        
        try:
            if provider == ModelProvider.OPENAI:
                recommendations = await self._generate_recommendations_with_openai(sanitized_data)
                metrics["model"] = self.default_model
            else:
                recommendations = await self._generate_recommendations_with_custom_model(sanitized_data)
                metrics["model"] = "custom-recommendation-v1"
                
        except Exception as e:
            logger.error(f"Error generating recommendations: {str(e)}")
            if provider == ModelProvider.CUSTOM:
                recommendations = await self._generate_recommendations_with_openai(sanitized_data)
                metrics["fallback"] = True
            else:
                raise
                
        finally:
            execution_time = (time.time() - start_time) * 1000
            metrics["execution_time_ms"] = execution_time
            
            self._log_model_usage(
                user_id=user_id,
                feature=ModelFeature.RECOMMENDATION,
                provider=provider,
                input_hash=self._hash_content(sanitized_data),
                output_hash=self._hash_content(recommendations),
                metrics=metrics,
                execution_time=execution_time
            )
            
        return recommendations, metrics
    
    async def _generate_recommendations_with_openai(
        self, 
        user_data: Dict[str, Any]
    ) -> List[Dict[str, Any]]:
        """Generate recommendations using OpenAI"""
        # Extract key user data for the prompt
        user_interests = user_data.get("interests", [])
        recent_moods = user_data.get("recent_moods", [])
        therapy_goals = user_data.get("therapy_goals", [])
        
        prompt = f"""
        Generate personalized mental health and wellbeing recommendations for a user with the following profile:
        
        Interests: {', '.join(user_interests)}
        Recent moods: {', '.join(recent_moods)}
        Therapy goals: {', '.join(therapy_goals)}
        
        Provide 5 specific, actionable recommendations that align with these goals and interests.
        Each recommendation should include:
        1. A title
        2. A brief description
        3. Why it would be helpful
        4. How to implement it
        
        Return the recommendations in the following JSON format:
        [
            {{
                "title": "Recommendation title",
                "description": "Brief description",
                "rationale": "Why this would help",
                "implementation": "How to do it",
                "category": "meditation/exercise/social/journaling/etc",
                "difficulty": "easy/medium/hard"
            }},
            ...
        ]
        """
        
        response = openai.ChatCompletion.create(
            model=self.default_model,
            messages=[
                {"role": "system", "content": "You are a mental health recommendation assistant."},
                {"role": "user", "content": prompt}
            ],
            temperature=0.7,
            max_tokens=1500,
            top_p=1.0,
            frequency_penalty=0.0,
            presence_penalty=0.0
        )
        
        response_text = response.choices[0].message["content"].strip()
        
        # Extract JSON from response
        try:
            # Find JSON in the response
            start_idx = response_text.find('[')
            end_idx = response_text.rfind(']')
            
            if start_idx >= 0 and end_idx > start_idx:
                json_str = response_text[start_idx:end_idx+1]
                return json.loads(json_str)
            else:
                # Parse failed, return empty list
                return []
        except json.JSONDecodeError:
            return []
    
    async def _generate_recommendations_with_custom_model(
        self, 
        user_data: Dict[str, Any]
    ) -> List[Dict[str, Any]]:
        """Generate recommendations using custom model"""
        # Placeholder for custom model implementation
        logger.info(f"Custom recommendation model would process user data")
        
        # Mock response
        return [
            {
                "title": "Custom Recommendation Example",
                "description": "This would be generated by our custom recommendation model.",
                "rationale": "Based on your specific profile and needs.",
                "implementation": "Would include personalized implementation steps.",
                "category": "placeholder",
                "difficulty": "medium"
            }
        ] 