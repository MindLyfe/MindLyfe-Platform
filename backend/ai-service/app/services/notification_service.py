import httpx
import logging
from datetime import datetime
from typing import List, Dict, Any, Optional
from enum import Enum

from app.core.config import settings

logger = logging.getLogger(__name__)

class AINotificationType(str, Enum):
    # Model training notifications
    MODEL_TRAINING_STARTED = "model_training_started"
    MODEL_TRAINING_COMPLETED = "model_training_completed"
    MODEL_TRAINING_FAILED = "model_training_failed"
    MODEL_UPDATED = "model_updated"
    MODEL_DEPLOYMENT_READY = "model_deployment_ready"
    
    # Personalization notifications
    PERSONALIZATION_UPDATED = "personalization_updated"
    USER_PROFILE_ANALYZED = "user_profile_analyzed"
    BEHAVIOR_PATTERN_DETECTED = "behavior_pattern_detected"
    PREFERENCES_UPDATED = "preferences_updated"
    PERSONALIZATION_SCORE_IMPROVED = "personalization_score_improved"
    
    # Recommendation notifications
    NEW_RECOMMENDATIONS_AVAILABLE = "new_recommendations_available"
    RECOMMENDATION_ACCURACY_IMPROVED = "recommendation_accuracy_improved"
    CONTENT_RECOMMENDATION = "content_recommendation"
    THERAPIST_RECOMMENDATION = "therapist_recommendation"
    ACTIVITY_RECOMMENDATION = "activity_recommendation"
    
    # Insight notifications
    INSIGHT_GENERATED = "ai_insight_generated"
    TREND_ANALYSIS_COMPLETE = "trend_analysis_complete"
    ANOMALY_DETECTED = "anomaly_detected"
    PREDICTION_AVAILABLE = "prediction_available"
    WELLNESS_INSIGHT = "wellness_insight"
    
    # Learning and adaptation
    USER_LEARNING_COMPLETE = "user_learning_complete"
    ADAPTATION_IMPROVED = "adaptation_improved"
    FEEDBACK_PROCESSED = "feedback_processed"
    MODEL_CONFIDENCE_UPDATED = "model_confidence_updated"
    
    # Content analysis notifications
    CONTENT_ANALYZED = "content_analyzed"
    SENTIMENT_ANALYSIS_COMPLETE = "sentiment_analysis_complete"
    TOPIC_MODELING_COMPLETE = "topic_modeling_complete"
    CONTENT_CLASSIFICATION_COMPLETE = "content_classification_complete"
    
    # Predictive analytics
    RISK_ASSESSMENT_COMPLETE = "risk_assessment_complete"
    WELLNESS_PREDICTION = "wellness_prediction"
    ENGAGEMENT_PREDICTION = "engagement_prediction"
    OUTCOME_PREDICTION = "outcome_prediction"
    
    # System and performance notifications
    MODEL_PERFORMANCE_ALERT = "model_performance_alert"
    DATA_QUALITY_ALERT = "data_quality_alert"
    PROCESSING_COMPLETE = "ai_processing_complete"
    BATCH_JOB_COMPLETE = "batch_job_complete"
    
    # Experimental features
    AB_TEST_RESULT = "ab_test_result"
    EXPERIMENTAL_FEATURE_AVAILABLE = "experimental_feature_available"
    BETA_MODEL_INVITATION = "beta_model_invitation"
    
    # Privacy and compliance
    DATA_ANONYMIZATION_COMPLETE = "data_anonymization_complete"
    PRIVACY_COMPLIANCE_CHECK = "privacy_compliance_check"
    MODEL_BIAS_DETECTED = "model_bias_detected"
    
    # Integration notifications
    API_INTEGRATION_READY = "api_integration_ready"
    THIRD_PARTY_SYNC_COMPLETE = "third_party_sync_complete"
    DATA_EXPORT_READY = "data_export_ready"

class AINotificationService:
    def __init__(self):
        self.notification_service_url = settings.NOTIFICATION_SERVICE_URL
        self.timeout = 5.0
        
    async def send_notification(
        self,
        notification_type: AINotificationType,
        recipient_id: str,
        channels: List[str],
        variables: Dict[str, Any],
        priority: str = "normal",
        scheduled_for: Optional[datetime] = None
    ) -> bool:
        """Send notification to the notification service"""
        try:
            payload = {
                "type": notification_type.value,
                "recipientId": recipient_id,
                "channels": channels,
                "variables": {
                    **variables,
                    "timestamp": datetime.utcnow().isoformat(),
                },
                "priority": priority,
                "serviceSource": "ai-service"
            }
            
            if scheduled_for:
                payload["scheduledFor"] = scheduled_for.isoformat()
            
            async with httpx.AsyncClient() as client:
                response = await client.post(
                    f"{self.notification_service_url}/api/notification",
                    json=payload,
                    headers={
                        "X-Service-Name": "ai-service",
                        "Content-Type": "application/json"
                    },
                    timeout=self.timeout
                )
                
                if response.status_code == 200:
                    logger.info(f"AI notification sent: {notification_type.value} to user {recipient_id}")
                    return True
                else:
                    logger.warning(f"Failed to send notification: HTTP {response.status_code}")
                    return False
                    
        except Exception as e:
            logger.error(f"Failed to send AI notification: {str(e)}")
            # Don't raise - notifications are non-critical
            return False
    
    async def notify_personalization_updated(
        self,
        user_id: str,
        update_type: str,
        confidence_score: float,
        improved_areas: List[str],
        new_features: List[str] = None,
        performance_gain: float = None
    ):
        """Notify about personalization model updates"""
        await self.send_notification(
            AINotificationType.PERSONALIZATION_UPDATED,
            user_id,
            ["in_app"],
            {
                "updateType": update_type,
                "confidenceScore": confidence_score,
                "improvedAreas": improved_areas,
                "newFeatures": new_features or [],
                "performanceGain": performance_gain,
                "updatedAt": datetime.utcnow().isoformat()
            },
            priority="normal"
        )
    
    async def notify_new_recommendations_available(
        self,
        user_id: str,
        recommendation_type: str,
        count: int,
        categories: List[str],
        confidence_score: float,
        personalization_factor: float = None
    ):
        """Notify about new AI recommendations"""
        await self.send_notification(
            AINotificationType.NEW_RECOMMENDATIONS_AVAILABLE,
            user_id,
            ["in_app", "push"],
            {
                "recommendationType": recommendation_type,
                "count": count,
                "categories": categories,
                "confidenceScore": confidence_score,
                "personalizationFactor": personalization_factor,
                "generatedAt": datetime.utcnow().isoformat()
            },
            priority="normal"
        )
    
    async def notify_insight_generated(
        self,
        user_id: str,
        insight_id: str,
        insight_type: str,
        title: str,
        summary: str,
        confidence_level: str,
        actionable_items: List[str],
        data_sources: List[str] = None
    ):
        """Notify about new AI-generated insights"""
        await self.send_notification(
            AINotificationType.INSIGHT_GENERATED,
            user_id,
            ["in_app", "push"],
            {
                "insightId": insight_id,
                "insightType": insight_type,
                "title": title,
                "summary": summary,
                "confidenceLevel": confidence_level,
                "actionableItems": actionable_items,
                "dataSources": data_sources or [],
                "generatedAt": datetime.utcnow().isoformat()
            },
            priority="high"
        )
    
    async def notify_behavior_pattern_detected(
        self,
        user_id: str,
        pattern_id: str,
        pattern_type: str,
        description: str,
        confidence_score: float,
        time_period: str,
        implications: List[str],
        recommendations: List[str] = None
    ):
        """Notify about detected behavior patterns"""
        await self.send_notification(
            AINotificationType.BEHAVIOR_PATTERN_DETECTED,
            user_id,
            ["in_app", "email"],
            {
                "patternId": pattern_id,
                "patternType": pattern_type,
                "description": description,
                "confidenceScore": confidence_score,
                "timePeriod": time_period,
                "implications": implications,
                "recommendations": recommendations or [],
                "detectedAt": datetime.utcnow().isoformat()
            },
            priority="high"
        )
    
    async def notify_wellness_prediction(
        self,
        user_id: str,
        prediction_id: str,
        prediction_type: str,
        predicted_outcome: str,
        confidence_score: float,
        time_horizon: str,
        risk_factors: List[str],
        protective_factors: List[str],
        recommendations: List[str] = None
    ):
        """Notify about wellness predictions"""
        priority = "high" if any("risk" in factor.lower() for factor in risk_factors) else "normal"
        
        await self.send_notification(
            AINotificationType.WELLNESS_PREDICTION,
            user_id,
            ["in_app", "email"],
            {
                "predictionId": prediction_id,
                "predictionType": prediction_type,
                "predictedOutcome": predicted_outcome,
                "confidenceScore": confidence_score,
                "timeHorizon": time_horizon,
                "riskFactors": risk_factors,
                "protectiveFactors": protective_factors,
                "recommendations": recommendations or [],
                "predictedAt": datetime.utcnow().isoformat()
            },
            priority=priority
        )
    
    async def notify_therapist_recommendation(
        self,
        user_id: str,
        therapist_ids: List[str],
        match_scores: List[float],
        matching_criteria: List[str],
        specializations: List[str],
        availability_info: Dict[str, Any] = None
    ):
        """Notify about AI-recommended therapists"""
        await self.send_notification(
            AINotificationType.THERAPIST_RECOMMENDATION,
            user_id,
            ["in_app", "email"],
            {
                "therapistIds": therapist_ids,
                "matchScores": match_scores,
                "matchingCriteria": matching_criteria,
                "specializations": specializations,
                "availabilityInfo": availability_info or {},
                "recommendedAt": datetime.utcnow().isoformat()
            },
            priority="high"
        ) 