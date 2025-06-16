import httpx
import logging
from datetime import datetime
from typing import List, Dict, Any, Optional
from enum import Enum

from app.core.config import settings

logger = logging.getLogger(__name__)

class LyfBotNotificationType(str, Enum):
    # Conversation notifications
    CONVERSATION_STARTED = "lyfbot_conversation_started"
    CONVERSATION_ENDED = "lyfbot_conversation_ended"
    MESSAGE_RECEIVED = "lyfbot_message_received"
    BOT_RESPONSE_GENERATED = "lyfbot_response_generated"
    CONVERSATION_SUMMARY = "lyfbot_conversation_summary"
    
    # Crisis and intervention notifications
    CRISIS_DETECTED = "lyfbot_crisis_detected"
    INTERVENTION_TRIGGERED = "lyfbot_intervention_triggered"
    EMERGENCY_PROTOCOL_ACTIVATED = "lyfbot_emergency_protocol_activated"
    HUMAN_HANDOFF_REQUIRED = "lyfbot_human_handoff_required"
    CRISIS_RESOLVED = "lyfbot_crisis_resolved"
    
    # Therapeutic notifications
    THERAPEUTIC_GOAL_SET = "lyfbot_therapeutic_goal_set"
    THERAPEUTIC_GOAL_ACHIEVED = "lyfbot_therapeutic_goal_achieved"
    THERAPY_TECHNIQUE_SUGGESTED = "lyfbot_therapy_technique_suggested"
    COPING_STRATEGY_RECOMMENDED = "lyfbot_coping_strategy_recommended"
    PROGRESS_MILESTONE = "lyfbot_progress_milestone"
    
    # Assessment notifications
    MOOD_ASSESSMENT_COMPLETE = "lyfbot_mood_assessment_complete"
    RISK_ASSESSMENT_COMPLETE = "lyfbot_risk_assessment_complete"
    WELLNESS_CHECK_COMPLETE = "lyfbot_wellness_check_complete"
    BEHAVIORAL_ASSESSMENT = "lyfbot_behavioral_assessment"
    
    # Engagement notifications
    CHECK_IN_REMINDER = "lyfbot_check_in_reminder"
    ACTIVITY_SUGGESTION = "lyfbot_activity_suggestion"
    MINDFULNESS_PROMPT = "lyfbot_mindfulness_prompt"
    GRATITUDE_PROMPT = "lyfbot_gratitude_prompt"
    REFLECTION_PROMPT = "lyfbot_reflection_prompt"
    
    # Learning and adaptation
    USER_PREFERENCE_LEARNED = "lyfbot_user_preference_learned"
    CONVERSATION_PATTERN_DETECTED = "lyfbot_conversation_pattern_detected"
    RESPONSE_PERSONALIZED = "lyfbot_response_personalized"
    BOT_LEARNING_UPDATE = "lyfbot_learning_update"
    
    # Referral and escalation
    THERAPIST_REFERRAL_SUGGESTED = "lyfbot_therapist_referral_suggested"
    PROFESSIONAL_HELP_RECOMMENDED = "lyfbot_professional_help_recommended"
    RESOURCE_SHARED = "lyfbot_resource_shared"
    EXTERNAL_SUPPORT_SUGGESTED = "lyfbot_external_support_suggested"
    
    # Technical notifications
    BOT_UNAVAILABLE = "lyfbot_unavailable"
    BOT_MAINTENANCE = "lyfbot_maintenance"
    CONVERSATION_BACKUP = "lyfbot_conversation_backup"
    PRIVACY_SETTINGS_UPDATED = "lyfbot_privacy_settings_updated"
    
    # Analytics and insights
    USAGE_INSIGHT = "lyfbot_usage_insight"
    CONVERSATION_ANALYTICS = "lyfbot_conversation_analytics"
    EFFECTIVENESS_REPORT = "lyfbot_effectiveness_report"
    ENGAGEMENT_REPORT = "lyfbot_engagement_report"
    
    # Special features
    VOICE_MODE_AVAILABLE = "lyfbot_voice_mode_available"
    NEW_FEATURE_AVAILABLE = "lyfbot_new_feature_available"
    PERSONALIZATION_IMPROVED = "lyfbot_personalization_improved"
    
    # Wellness tracking
    MOOD_TREND_DETECTED = "lyfbot_mood_trend_detected"
    WELLNESS_GOAL_REMINDER = "lyfbot_wellness_goal_reminder"
    SELF_CARE_REMINDER = "lyfbot_self_care_reminder"
    MEDICATION_REMINDER = "lyfbot_medication_reminder"

class LyfBotNotificationService:
    def __init__(self):
        self.notification_service_url = settings.NOTIFICATION_SERVICE_URL
        self.timeout = 5.0
        
    async def send_notification(
        self,
        notification_type: LyfBotNotificationType,
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
                "serviceSource": "lyfbot-service"
            }
            
            if scheduled_for:
                payload["scheduledFor"] = scheduled_for.isoformat()
            
            async with httpx.AsyncClient() as client:
                response = await client.post(
                    f"{self.notification_service_url}/api/notification",
                    json=payload,
                    headers={
                        "X-Service-Name": "lyfbot-service",
                        "Content-Type": "application/json"
                    },
                    timeout=self.timeout
                )
                
                if response.status_code == 200:
                    logger.info(f"LyfBot notification sent: {notification_type.value} to user {recipient_id}")
                    return True
                else:
                    logger.warning(f"Failed to send notification: HTTP {response.status_code}")
                    return False
                    
        except Exception as e:
            logger.error(f"Failed to send LyfBot notification: {str(e)}")
            # Don't raise - notifications are non-critical
            return False
    
    async def notify_conversation_started(
        self,
        user_id: str,
        conversation_id: str,
        bot_personality: str,
        initial_greeting: str,
        conversation_context: str = None
    ):
        """Notify about new conversation start"""
        await self.send_notification(
            LyfBotNotificationType.CONVERSATION_STARTED,
            user_id,
            ["in_app"],
            {
                "conversationId": conversation_id,
                "botPersonality": bot_personality,
                "initialGreeting": initial_greeting,
                "conversationContext": conversation_context,
                "startedAt": datetime.utcnow().isoformat()
            },
            priority="normal"
        )
    
    async def notify_crisis_detected(
        self,
        user_id: str,
        conversation_id: str,
        crisis_type: str,
        severity_level: str,
        detected_indicators: List[str],
        immediate_resources: List[Dict[str, str]],
        professional_contact_made: bool = False
    ):
        """Notify about crisis detection"""
        priority = "high" if severity_level in ["high", "critical"] else "normal"
        channels = ["in_app", "email"]
        
        if severity_level == "critical":
            channels.append("sms")
        
        await self.send_notification(
            LyfBotNotificationType.CRISIS_DETECTED,
            user_id,
            channels,
            {
                "conversationId": conversation_id,
                "crisisType": crisis_type,
                "severityLevel": severity_level,
                "detectedIndicators": detected_indicators,
                "immediateResources": immediate_resources,
                "professionalContactMade": professional_contact_made,
                "emergencyHotline": "988",
                "detectedAt": datetime.utcnow().isoformat()
            },
            priority=priority
        )
    
    async def notify_intervention_triggered(
        self,
        user_id: str,
        conversation_id: str,
        intervention_type: str,
        intervention_details: Dict[str, Any],
        coping_strategies: List[str],
        follow_up_scheduled: bool = False
    ):
        """Notify about triggered intervention"""
        await self.send_notification(
            LyfBotNotificationType.INTERVENTION_TRIGGERED,
            user_id,
            ["in_app"],
            {
                "conversationId": conversation_id,
                "interventionType": intervention_type,
                "interventionDetails": intervention_details,
                "copingStrategies": coping_strategies,
                "followUpScheduled": follow_up_scheduled,
                "triggeredAt": datetime.utcnow().isoformat()
            },
            priority="high"
        )
    
    async def notify_therapeutic_goal_achieved(
        self,
        user_id: str,
        goal_id: str,
        goal_description: str,
        achievement_date: datetime,
        conversation_id: str,
        celebration_message: str,
        next_goals: List[str] = None
    ):
        """Notify about therapeutic goal achievement"""
        await self.send_notification(
            LyfBotNotificationType.THERAPEUTIC_GOAL_ACHIEVED,
            user_id,
            ["in_app", "push", "email"],
            {
                "goalId": goal_id,
                "goalDescription": goal_description,
                "achievementDate": achievement_date.isoformat(),
                "conversationId": conversation_id,
                "celebrationMessage": celebration_message,
                "nextGoals": next_goals or [],
                "achievedAt": datetime.utcnow().isoformat()
            },
            priority="high"
        )
    
    async def notify_mood_assessment_complete(
        self,
        user_id: str,
        assessment_id: str,
        conversation_id: str,
        mood_score: float,
        mood_category: str,
        insights: List[str],
        recommendations: List[str],
        trend_analysis: Dict[str, Any] = None
    ):
        """Notify about completed mood assessment"""
        await self.send_notification(
            LyfBotNotificationType.MOOD_ASSESSMENT_COMPLETE,
            user_id,
            ["in_app"],
            {
                "assessmentId": assessment_id,
                "conversationId": conversation_id,
                "moodScore": mood_score,
                "moodCategory": mood_category,
                "insights": insights,
                "recommendations": recommendations,
                "trendAnalysis": trend_analysis or {},
                "completedAt": datetime.utcnow().isoformat()
            },
            priority="normal"
        )
    
    async def notify_coping_strategy_recommended(
        self,
        user_id: str,
        conversation_id: str,
        strategy_id: str,
        strategy_name: str,
        description: str,
        instructions: List[str],
        effectiveness_rating: float = None,
        personalization_score: float = None
    ):
        """Notify about recommended coping strategy"""
        await self.send_notification(
            LyfBotNotificationType.COPING_STRATEGY_RECOMMENDED,
            user_id,
            ["in_app", "push"],
            {
                "conversationId": conversation_id,
                "strategyId": strategy_id,
                "strategyName": strategy_name,
                "description": description,
                "instructions": instructions,
                "effectivenessRating": effectiveness_rating,
                "personalizationScore": personalization_score,
                "recommendedAt": datetime.utcnow().isoformat()
            },
            priority="normal"
        )
    
    async def notify_human_handoff_required(
        self,
        user_id: str,
        conversation_id: str,
        handoff_reason: str,
        complexity_level: str,
        conversation_summary: str,
        therapist_types_needed: List[str],
        urgent: bool = False
    ):
        """Notify about need for human therapist handoff"""
        priority = "high" if urgent else "normal"
        channels = ["in_app", "email"] if urgent else ["in_app"]
        
        await self.send_notification(
            LyfBotNotificationType.HUMAN_HANDOFF_REQUIRED,
            user_id,
            channels,
            {
                "conversationId": conversation_id,
                "handoffReason": handoff_reason,
                "complexityLevel": complexity_level,
                "conversationSummary": conversation_summary,
                "therapistTypesNeeded": therapist_types_needed,
                "urgent": urgent,
                "handoffAt": datetime.utcnow().isoformat()
            },
            priority=priority
        )
    
    async def notify_check_in_reminder(
        self,
        user_id: str,
        reminder_type: str,
        days_since_last_chat: int,
        personalized_message: str,
        suggested_topics: List[str] = None,
        mood_check: bool = True
    ):
        """Send check-in reminder"""
        await self.send_notification(
            LyfBotNotificationType.CHECK_IN_REMINDER,
            user_id,
            ["push", "in_app"],
            {
                "reminderType": reminder_type,
                "daysSinceLastChat": days_since_last_chat,
                "personalizedMessage": personalized_message,
                "suggestedTopics": suggested_topics or [],
                "moodCheck": mood_check,
                "reminderSentAt": datetime.utcnow().isoformat()
            },
            priority="normal"
        )
    
    async def notify_therapy_technique_suggested(
        self,
        user_id: str,
        conversation_id: str,
        technique_id: str,
        technique_name: str,
        technique_type: str,
        description: str,
        guided_steps: List[str],
        estimated_duration: int,
        difficulty_level: str = "beginner"
    ):
        """Notify about suggested therapy technique"""
        await self.send_notification(
            LyfBotNotificationType.THERAPY_TECHNIQUE_SUGGESTED,
            user_id,
            ["in_app"],
            {
                "conversationId": conversation_id,
                "techniqueId": technique_id,
                "techniqueName": technique_name,
                "techniqueType": technique_type,
                "description": description,
                "guidedSteps": guided_steps,
                "estimatedDuration": estimated_duration,
                "difficultyLevel": difficulty_level,
                "suggestedAt": datetime.utcnow().isoformat()
            },
            priority="normal"
        )
    
    async def notify_conversation_pattern_detected(
        self,
        user_id: str,
        pattern_id: str,
        pattern_type: str,
        description: str,
        frequency: int,
        time_period: str,
        insights: List[str],
        adaptive_responses: List[str] = None
    ):
        """Notify about detected conversation patterns"""
        await self.send_notification(
            LyfBotNotificationType.CONVERSATION_PATTERN_DETECTED,
            user_id,
            ["in_app"],
            {
                "patternId": pattern_id,
                "patternType": pattern_type,
                "description": description,
                "frequency": frequency,
                "timePeriod": time_period,
                "insights": insights,
                "adaptiveResponses": adaptive_responses or [],
                "detectedAt": datetime.utcnow().isoformat()
            },
            priority="normal"
        )
    
    async def notify_therapist_referral_suggested(
        self,
        user_id: str,
        conversation_id: str,
        referral_reason: str,
        suggested_specializations: List[str],
        urgency_level: str,
        preparation_tips: List[str],
        questions_to_ask: List[str] = None
    ):
        """Notify about therapist referral suggestion"""
        priority = "high" if urgency_level == "high" else "normal"
        
        await self.send_notification(
            LyfBotNotificationType.THERAPIST_REFERRAL_SUGGESTED,
            user_id,
            ["in_app", "email"],
            {
                "conversationId": conversation_id,
                "referralReason": referral_reason,
                "suggestedSpecializations": suggested_specializations,
                "urgencyLevel": urgency_level,
                "preparationTips": preparation_tips,
                "questionsToAsk": questions_to_ask or [],
                "suggestedAt": datetime.utcnow().isoformat()
            },
            priority=priority
        )
    
    async def notify_mindfulness_prompt(
        self,
        user_id: str,
        prompt_id: str,
        prompt_type: str,
        prompt_text: str,
        guided_exercise: bool,
        duration_minutes: int,
        difficulty_level: str = "beginner"
    ):
        """Send mindfulness exercise prompt"""
        await self.send_notification(
            LyfBotNotificationType.MINDFULNESS_PROMPT,
            user_id,
            ["push", "in_app"],
            {
                "promptId": prompt_id,
                "promptType": prompt_type,
                "promptText": prompt_text,
                "guidedExercise": guided_exercise,
                "durationMinutes": duration_minutes,
                "difficultyLevel": difficulty_level,
                "promptSentAt": datetime.utcnow().isoformat()
            },
            priority="normal"
        )
    
    async def notify_mood_trend_detected(
        self,
        user_id: str,
        trend_id: str,
        trend_type: str,
        trend_direction: str,
        time_period: str,
        confidence_score: float,
        contributing_factors: List[str],
        recommendations: List[str] = None
    ):
        """Notify about detected mood trends"""
        priority = "high" if trend_direction == "declining" else "normal"
        
        await self.send_notification(
            LyfBotNotificationType.MOOD_TREND_DETECTED,
            user_id,
            ["in_app", "email"],
            {
                "trendId": trend_id,
                "trendType": trend_type,
                "trendDirection": trend_direction,
                "timePeriod": time_period,
                "confidenceScore": confidence_score,
                "contributingFactors": contributing_factors,
                "recommendations": recommendations or [],
                "detectedAt": datetime.utcnow().isoformat()
            },
            priority=priority
        )
    
    async def notify_progress_milestone(
        self,
        user_id: str,
        milestone_id: str,
        milestone_type: str,
        description: str,
        achievement_details: Dict[str, Any],
        celebration_message: str,
        rewards_earned: List[str] = None
    ):
        """Notify about progress milestone achievement"""
        await self.send_notification(
            LyfBotNotificationType.PROGRESS_MILESTONE,
            user_id,
            ["in_app", "push", "email"],
            {
                "milestoneId": milestone_id,
                "milestoneType": milestone_type,
                "description": description,
                "achievementDetails": achievement_details,
                "celebrationMessage": celebration_message,
                "rewardsEarned": rewards_earned or [],
                "achievedAt": datetime.utcnow().isoformat()
            },
            priority="high"
        )
    
    async def notify_conversation_summary(
        self,
        user_id: str,
        conversation_id: str,
        session_duration: int,
        key_topics: List[str],
        mood_progression: Dict[str, Any],
        insights_generated: List[str],
        action_items: List[str] = None,
        next_session_suggested: bool = False
    ):
        """Send conversation summary notification"""
        await self.send_notification(
            LyfBotNotificationType.CONVERSATION_SUMMARY,
            user_id,
            ["in_app", "email"],
            {
                "conversationId": conversation_id,
                "sessionDuration": session_duration,
                "keyTopics": key_topics,
                "moodProgression": mood_progression,
                "insightsGenerated": insights_generated,
                "actionItems": action_items or [],
                "nextSessionSuggested": next_session_suggested,
                "summarizedAt": datetime.utcnow().isoformat()
            },
            priority="normal"
        )
    
    async def schedule_wellness_reminders(
        self,
        user_id: str,
        reminder_schedule: List[Dict[str, Any]],
        timezone: str = "UTC"
    ):
        """Schedule wellness and check-in reminders"""
        for reminder in reminder_schedule:
            scheduled_time = datetime.fromisoformat(reminder["time"])
            
            await self.send_notification(
                LyfBotNotificationType.CHECK_IN_REMINDER,
                user_id,
                ["push"],
                {
                    "reminderType": reminder.get("type", "wellness_check"),
                    "personalizedMessage": reminder.get("message", "How are you feeling today?"),
                    "timezone": timezone,
                    "scheduledReminder": True
                },
                priority="normal",
                scheduled_for=scheduled_time
            ) 