import httpx
import logging
from datetime import datetime
from typing import List, Dict, Any, Optional
from enum import Enum

from app.core.config import settings

logger = logging.getLogger(__name__)

class JournalNotificationType(str, Enum):
    # Journal entry notifications
    ENTRY_CREATED = "journal_entry_created"
    ENTRY_UPDATED = "journal_entry_updated"
    ENTRY_DELETED = "journal_entry_deleted"
    ENTRY_SHARED = "journal_entry_shared"
    
    # Mood tracking notifications
    MOOD_LOGGED = "mood_logged"
    MOOD_PATTERN_DETECTED = "mood_pattern_detected"
    MOOD_IMPROVEMENT_DETECTED = "mood_improvement_detected"
    MOOD_DECLINE_DETECTED = "mood_decline_detected"
    MOOD_STREAK_ACHIEVED = "mood_streak_achieved"
    
    # AI insights notifications
    AI_INSIGHT_GENERATED = "ai_insight_generated"
    WEEKLY_SUMMARY_READY = "weekly_summary_ready"
    MONTHLY_SUMMARY_READY = "monthly_summary_ready"
    PATTERN_ANALYSIS_COMPLETE = "pattern_analysis_complete"
    SENTIMENT_ALERT = "sentiment_alert"
    
    # Reflection and writing prompts
    DAILY_REFLECTION_REMINDER = "daily_reflection_reminder"
    WRITING_PROMPT_AVAILABLE = "writing_prompt_available"
    REFLECTION_STREAK_MILESTONE = "reflection_streak_milestone"
    MISSED_ENTRIES_REMINDER = "missed_entries_reminder"
    
    # Goal and progress notifications
    WRITING_GOAL_SET = "writing_goal_set"
    WRITING_GOAL_ACHIEVED = "writing_goal_achieved"
    WRITING_GOAL_PROGRESS = "writing_goal_progress"
    WEEKLY_GOAL_REMINDER = "weekly_goal_reminder"
    
    # Privacy and sharing notifications
    JOURNAL_SHARED_WITH_THERAPIST = "journal_shared_with_therapist"
    PRIVACY_SETTINGS_UPDATED = "privacy_settings_updated"
    EXPORT_READY = "journal_export_ready"
    
    # Wellness notifications
    GRATITUDE_REMINDER = "gratitude_reminder"
    MINDFULNESS_SUGGESTION = "mindfulness_suggestion"
    SELF_CARE_REMINDER = "self_care_reminder"
    WELLNESS_CHECK_IN = "wellness_check_in"
    
    # Achievement notifications
    MILESTONE_REACHED = "journal_milestone_reached"
    CONSISTENCY_BADGE = "consistency_badge_earned"
    WORD_COUNT_ACHIEVEMENT = "word_count_achievement"
    
    # Emergency and support
    CRISIS_KEYWORDS_DETECTED = "crisis_keywords_detected"
    SUPPORT_SUGGESTION = "support_suggestion"
    THERAPIST_REFERRAL = "therapist_referral_suggested"

class JournalNotificationService:
    def __init__(self):
        self.notification_service_url = settings.NOTIFICATION_SERVICE_URL
        self.timeout = 5.0
        
    async def send_notification(
        self,
        notification_type: JournalNotificationType,
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
                "serviceSource": "journal-service"
            }
            
            if scheduled_for:
                payload["scheduledFor"] = scheduled_for.isoformat()
            
            async with httpx.AsyncClient() as client:
                response = await client.post(
                    f"{self.notification_service_url}/api/notification",
                    json=payload,
                    headers={
                        "X-Service-Name": "journal-service",
                        "Content-Type": "application/json"
                    },
                    timeout=self.timeout
                )
                
                if response.status_code == 200:
                    logger.info(f"Journal notification sent: {notification_type.value} to user {recipient_id}")
                    return True
                else:
                    logger.warning(f"Failed to send notification: HTTP {response.status_code}")
                    return False
                    
        except Exception as e:
            logger.error(f"Failed to send journal notification: {str(e)}")
            # Don't raise - notifications are non-critical
            return False
    
    async def notify_entry_created(
        self,
        user_id: str,
        entry_id: str,
        title: str,
        word_count: int,
        mood_score: Optional[float] = None,
        tags: List[str] = None
    ):
        """Notify about new journal entry creation"""
        await self.send_notification(
            JournalNotificationType.ENTRY_CREATED,
            user_id,
            ["in_app"],
            {
                "entryId": entry_id,
                "title": title,
                "wordCount": word_count,
                "moodScore": mood_score,
                "tags": tags or [],
                "createdAt": datetime.utcnow().isoformat()
            },
            priority="normal"
        )
    
    async def notify_mood_logged(
        self,
        user_id: str,
        mood_score: float,
        mood_category: str,
        entry_id: str,
        streak_count: int = 0
    ):
        """Notify about mood logging"""
        channels = ["in_app"]
        if streak_count > 0 and streak_count % 7 == 0:  # Weekly streak
            channels.append("push")
            
        await self.send_notification(
            JournalNotificationType.MOOD_LOGGED,
            user_id,
            channels,
            {
                "moodScore": mood_score,
                "moodCategory": mood_category,
                "entryId": entry_id,
                "streakCount": streak_count,
                "loggedAt": datetime.utcnow().isoformat()
            },
            priority="normal"
        )
    
    async def notify_mood_pattern_detected(
        self,
        user_id: str,
        pattern_type: str,
        pattern_description: str,
        confidence_score: float,
        time_period: str,
        suggestions: List[str] = None
    ):
        """Notify about detected mood patterns"""
        await self.send_notification(
            JournalNotificationType.MOOD_PATTERN_DETECTED,
            user_id,
            ["in_app", "email"],
            {
                "patternType": pattern_type,
                "patternDescription": pattern_description,
                "confidenceScore": confidence_score,
                "timePeriod": time_period,
                "suggestions": suggestions or [],
                "detectedAt": datetime.utcnow().isoformat()
            },
            priority="high"
        )
    
    async def notify_ai_insight_generated(
        self,
        user_id: str,
        insight_id: str,
        insight_type: str,
        title: str,
        summary: str,
        key_points: List[str],
        actionable_suggestions: List[str] = None
    ):
        """Notify about new AI-generated insights"""
        await self.send_notification(
            JournalNotificationType.AI_INSIGHT_GENERATED,
            user_id,
            ["in_app", "push"],
            {
                "insightId": insight_id,
                "insightType": insight_type,
                "title": title,
                "summary": summary,
                "keyPoints": key_points,
                "actionableSuggestions": actionable_suggestions or [],
                "generatedAt": datetime.utcnow().isoformat()
            },
            priority="high"
        )
    
    async def notify_weekly_summary_ready(
        self,
        user_id: str,
        summary_id: str,
        week_start: datetime,
        week_end: datetime,
        entries_count: int,
        avg_mood: float,
        key_themes: List[str]
    ):
        """Notify about weekly summary being ready"""
        await self.send_notification(
            JournalNotificationType.WEEKLY_SUMMARY_READY,
            user_id,
            ["email", "in_app"],
            {
                "summaryId": summary_id,
                "weekStart": week_start.isoformat(),
                "weekEnd": week_end.isoformat(),
                "entriesCount": entries_count,
                "averageMood": avg_mood,
                "keyThemes": key_themes,
                "generatedAt": datetime.utcnow().isoformat()
            },
            priority="normal"
        )
    
    async def notify_daily_reflection_reminder(
        self,
        user_id: str,
        reminder_type: str = "gentle",
        streak_count: int = 0,
        writing_prompt: str = None,
        last_entry_days_ago: int = 0
    ):
        """Send daily reflection reminder"""
        priority = "normal" if reminder_type == "gentle" else "high"
        
        await self.send_notification(
            JournalNotificationType.DAILY_REFLECTION_REMINDER,
            user_id,
            ["push", "in_app"],
            {
                "reminderType": reminder_type,
                "streakCount": streak_count,
                "writingPrompt": writing_prompt,
                "lastEntryDaysAgo": last_entry_days_ago,
                "reminderSentAt": datetime.utcnow().isoformat()
            },
            priority=priority
        )
    
    async def notify_writing_prompt_available(
        self,
        user_id: str,
        prompt_id: str,
        prompt_text: str,
        prompt_category: str,
        difficulty_level: str = "beginner"
    ):
        """Notify about new writing prompt"""
        await self.send_notification(
            JournalNotificationType.WRITING_PROMPT_AVAILABLE,
            user_id,
            ["in_app", "push"],
            {
                "promptId": prompt_id,
                "promptText": prompt_text,
                "promptCategory": prompt_category,
                "difficultyLevel": difficulty_level,
                "availableAt": datetime.utcnow().isoformat()
            },
            priority="normal"
        )
    
    async def notify_writing_goal_achieved(
        self,
        user_id: str,
        goal_id: str,
        goal_type: str,
        goal_target: int,
        actual_achievement: int,
        time_period: str,
        reward_earned: str = None
    ):
        """Notify about writing goal achievement"""
        await self.send_notification(
            JournalNotificationType.WRITING_GOAL_ACHIEVED,
            user_id,
            ["in_app", "push", "email"],
            {
                "goalId": goal_id,
                "goalType": goal_type,
                "goalTarget": goal_target,
                "actualAchievement": actual_achievement,
                "timePeriod": time_period,
                "rewardEarned": reward_earned,
                "achievedAt": datetime.utcnow().isoformat()
            },
            priority="high"
        )
    
    async def notify_journal_milestone_reached(
        self,
        user_id: str,
        milestone_type: str,
        milestone_value: int,
        description: str,
        badge_earned: str = None,
        celebration_message: str = None
    ):
        """Notify about journal milestone achievement"""
        await self.send_notification(
            JournalNotificationType.MILESTONE_REACHED,
            user_id,
            ["in_app", "push", "email"],
            {
                "milestoneType": milestone_type,
                "milestoneValue": milestone_value,
                "description": description,
                "badgeEarned": badge_earned,
                "celebrationMessage": celebration_message,
                "reachedAt": datetime.utcnow().isoformat()
            },
            priority="high"
        )
    
    async def notify_sentiment_alert(
        self,
        user_id: str,
        alert_type: str,
        sentiment_score: float,
        entry_id: str,
        detected_keywords: List[str],
        support_resources: List[Dict[str, str]] = None,
        crisis_level: str = "low"
    ):
        """Notify about sentiment-based alerts"""
        priority = "high" if crisis_level in ["high", "critical"] else "normal"
        channels = ["in_app"]
        
        if crisis_level == "critical":
            channels.extend(["email", "push"])
        
        await self.send_notification(
            JournalNotificationType.SENTIMENT_ALERT,
            user_id,
            channels,
            {
                "alertType": alert_type,
                "sentimentScore": sentiment_score,
                "entryId": entry_id,
                "detectedKeywords": detected_keywords,
                "supportResources": support_resources or [],
                "crisisLevel": crisis_level,
                "detectedAt": datetime.utcnow().isoformat()
            },
            priority=priority
        )
    
    async def notify_crisis_keywords_detected(
        self,
        user_id: str,
        entry_id: str,
        detected_keywords: List[str],
        risk_level: str,
        immediate_resources: List[Dict[str, str]],
        therapist_notified: bool = False
    ):
        """Notify about crisis keywords detection"""
        await self.send_notification(
            JournalNotificationType.CRISIS_KEYWORDS_DETECTED,
            user_id,
            ["in_app", "email"],
            {
                "entryId": entry_id,
                "detectedKeywords": detected_keywords,
                "riskLevel": risk_level,
                "immediateResources": immediate_resources,
                "therapistNotified": therapist_notified,
                "emergencyHotline": "988", # Crisis hotline
                "detectedAt": datetime.utcnow().isoformat()
            },
            priority="high"
        )
    
    async def notify_journal_shared_with_therapist(
        self,
        user_id: str,
        therapist_id: str,
        therapist_name: str,
        shared_entries_count: int,
        date_range: Dict[str, str],
        sharing_permissions: List[str]
    ):
        """Notify about journal sharing with therapist"""
        await self.send_notification(
            JournalNotificationType.JOURNAL_SHARED_WITH_THERAPIST,
            user_id,
            ["in_app", "email"],
            {
                "therapistId": therapist_id,
                "therapistName": therapist_name,
                "sharedEntriesCount": shared_entries_count,
                "dateRange": date_range,
                "sharingPermissions": sharing_permissions,
                "sharedAt": datetime.utcnow().isoformat()
            },
            priority="normal"
        )
    
    async def notify_gratitude_reminder(
        self,
        user_id: str,
        reminder_type: str = "daily",
        gratitude_streak: int = 0,
        suggested_prompts: List[str] = None
    ):
        """Send gratitude practice reminder"""
        await self.send_notification(
            JournalNotificationType.GRATITUDE_REMINDER,
            user_id,
            ["push", "in_app"],
            {
                "reminderType": reminder_type,
                "gratitudeStreak": gratitude_streak,
                "suggestedPrompts": suggested_prompts or [],
                "reminderSentAt": datetime.utcnow().isoformat()
            },
            priority="normal"
        )
    
    async def notify_wellness_check_in(
        self,
        user_id: str,
        check_in_type: str,
        days_since_last_entry: int,
        mood_trend: str,
        support_suggestions: List[str] = None
    ):
        """Send wellness check-in notification"""
        await self.send_notification(
            JournalNotificationType.WELLNESS_CHECK_IN,
            user_id,
            ["push", "in_app"],
            {
                "checkInType": check_in_type,
                "daysSinceLastEntry": days_since_last_entry,
                "moodTrend": mood_trend,
                "supportSuggestions": support_suggestions or [],
                "checkInAt": datetime.utcnow().isoformat()
            },
            priority="normal"
        )
    
    async def schedule_reflection_reminders(
        self,
        user_id: str,
        reminder_times: List[Dict[str, Any]],
        timezone: str = "UTC"
    ):
        """Schedule daily reflection reminders"""
        for reminder_time in reminder_times:
            scheduled_time = datetime.fromisoformat(reminder_time["time"])
            
            await self.send_notification(
                JournalNotificationType.DAILY_REFLECTION_REMINDER,
                user_id,
                ["push"],
                {
                    "reminderType": reminder_time.get("type", "daily"),
                    "timezone": timezone,
                    "scheduledReminder": True
                },
                priority="normal",
                scheduled_for=scheduled_time
            ) 