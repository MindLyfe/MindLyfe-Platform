import httpx
import logging
import json
from typing import Dict, Any, Optional
from sqlalchemy.orm import Session

from app.core.config import settings
from app.core.security import get_service_token
from app.services.analysis_service import AnalysisService

logger = logging.getLogger(__name__)

class AIService:
    """Service for interacting with the AI Service for journal analysis"""
    
    def __init__(self):
        self.analysis_service = AnalysisService()
    
    async def analyze_text(
        self, 
        content: str, 
        user_id: str,
        context: Optional[Dict[str, Any]] = None
    ) -> Dict[str, Any]:
        """
        Analyze journal text using the AI Service
        
        Args:
            content: The journal text to analyze
            user_id: The ID of the user
            context: Optional context information
            
        Returns:
            Dict containing the analysis results
        """
        try:
            # Get service token for authentication
            token = await get_service_token()
            
            # Call AI Service to analyze the text
            async with httpx.AsyncClient() as client:
                response = await client.post(
                    f"{settings.AI_SERVICE_URL}/api/v1/journal/analyze",
                    json={
                        "content": content,
                        "context": context or {}
                    },
                    headers={
                        "Authorization": f"Bearer {token}",
                        "X-User-ID": user_id
                    },
                    timeout=30.0  # Longer timeout for AI processing
                )
                
                if response.status_code != 200:
                    logger.error(f"AI Service analysis failed: {response.text}")
                    
                    # Fallback to local analysis or OpenAI direct call if configured
                    if settings.OPENAI_API_KEY:
                        return await self._fallback_analyze_text(content, user_id, context)
                    
                    raise Exception(f"AI Service returned status {response.status_code}")
                    
                return response.json()
                
        except httpx.RequestError as exc:
            logger.error(f"AI Service request failed: {str(exc)}")
            
            # Fallback to local analysis or OpenAI direct call if configured
            if settings.OPENAI_API_KEY:
                return await self._fallback_analyze_text(content, user_id, context)
                
            raise Exception(f"Failed to connect to AI Service: {str(exc)}")
            
    async def analyze_journal(
        self,
        journal_id: int,
        content: str,
        user_id: str,
        db: Session
    ) -> Dict[str, Any]:
        """
        Analyze a journal entry and store the results
        
        Args:
            journal_id: The ID of the journal entry
            content: The journal content
            user_id: The ID of the user
            db: Database session
            
        Returns:
            Dict containing the analysis results
        """
        try:
            # Get journal analysis from AI Service
            analysis = await self.analyze_text(content, user_id)
            
            # Store the analysis in the database
            stored_analysis = await self.analysis_service.create_or_update_analysis(
                db=db,
                journal_id=journal_id,
                analysis_data=analysis
            )
            
            return stored_analysis
            
        except Exception as e:
            logger.error(f"Failed to analyze journal: {str(e)}")
            
            # Create a minimal analysis as fallback
            fallback_analysis = {
                "sentiment": "neutral",
                "emotions": [],
                "themes": [],
                "insights": "Unable to analyze journal at this time.",
                "word_count": len(content.split()),
                "suggested_coping_strategies": [],
                "analysis_id": f"fallback-{journal_id}"
            }
            
            # Store the fallback analysis
            stored_analysis = await self.analysis_service.create_or_update_analysis(
                db=db,
                journal_id=journal_id,
                analysis_data=fallback_analysis
            )
            
            return stored_analysis
            
    async def _fallback_analyze_text(
        self,
        content: str,
        user_id: str,
        context: Optional[Dict[str, Any]] = None
    ) -> Dict[str, Any]:
        """
        Fallback method to analyze text directly with OpenAI if AI Service is unavailable
        
        Args:
            content: The journal text to analyze
            user_id: The ID of the user
            context: Optional context information
            
        Returns:
            Dict containing the analysis results
        """
        try:
            # Only run this if OpenAI API key is configured
            if not settings.OPENAI_API_KEY:
                raise Exception("OpenAI API key not configured for fallback")
                
            import openai
            
            # Configure OpenAI
            openai.api_key = settings.OPENAI_API_KEY
            
            # Create a prompt for journal analysis
            prompt = f"""
            Analyze the following journal entry:
            
            {content}
            
            Provide a structured analysis with:
            1. Overall sentiment (positive, negative, neutral, or mixed)
            2. Emotions detected (list)
            3. Main themes (list)
            4. Supportive insights based on the content
            5. Word count
            6. Suggested coping strategies if needed
            
            Format the response as JSON.
            """
            
            # Call OpenAI API
            response = await openai.ChatCompletion.acreate(
                model="gpt-4",
                messages=[
                    {"role": "system", "content": "You are a mental health assistant specializing in journal analysis."},
                    {"role": "user", "content": prompt}
                ],
                temperature=0.3,
                max_tokens=1000
            )
            
            # Parse the response
            response_text = response.choices[0].message.content
            
            # Extract JSON from response
            try:
                # Try to parse the entire response as JSON
                analysis = json.loads(response_text)
            except json.JSONDecodeError:
                # If that fails, try to extract JSON from the text
                import re
                json_match = re.search(r'```json\n(.*?)\n```', response_text, re.DOTALL)
                if json_match:
                    analysis = json.loads(json_match.group(1))
                else:
                    # Create a simple analysis from the text
                    analysis = {
                        "sentiment": "neutral",
                        "emotions": [],
                        "themes": [],
                        "insights": response_text,
                        "word_count": len(content.split()),
                        "suggested_coping_strategies": []
                    }
            
            # Add analysis ID
            analysis["analysis_id"] = f"fallback-{user_id}-{hash(content)}"
            
            return analysis
            
        except Exception as e:
            logger.error(f"Fallback analysis failed: {str(e)}")
            
            # Return minimal analysis
            return {
                "sentiment": "neutral",
                "emotions": [],
                "themes": [],
                "insights": "Unable to analyze journal at this time.",
                "word_count": len(content.split()),
                "suggested_coping_strategies": [],
                "analysis_id": f"fallback-{user_id}-{hash(content)}"
            } 