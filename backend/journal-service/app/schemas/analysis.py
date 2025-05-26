from typing import List, Optional, Dict, Any
from datetime import datetime
from pydantic import BaseModel, Field

class JournalAnalysisRequest(BaseModel):
    content: str = Field(..., description="Journal entry content to analyze")
    context: Optional[Dict[str, Any]] = Field(None, description="Additional context")

class JournalAnalysisResponse(BaseModel):
    sentiment: str = Field(..., description="Overall sentiment (positive, negative, neutral, mixed)")
    emotions: List[str] = Field(..., description="Detected emotions in the entry")
    themes: List[str] = Field(..., description="Detected themes in the entry")
    insights: str = Field(..., description="Supportive insights based on the entry")
    word_count: int = Field(..., description="Word count of the entry")
    suggested_coping_strategies: List[str] = Field(..., description="Suggested coping strategies")
    mood_prediction: Optional[float] = Field(None, description="Predicted mood score if not provided")
    analysis_id: str = Field(..., description="Unique ID for this analysis")

class JournalTrendsRequest(BaseModel):
    start_date: datetime = Field(..., description="Start date for trend analysis")
    end_date: datetime = Field(..., description="End date for trend analysis")
    include_content: bool = Field(False, description="Whether to include entry content in response")

class EmotionTrend(BaseModel):
    emotion: str
    frequency: int
    dates: List[datetime]

class ThemeTrend(BaseModel):
    theme: str
    frequency: int
    dates: List[datetime]

class SentimentDistribution(BaseModel):
    positive: float
    negative: float
    neutral: float
    mixed: float

class MoodPoint(BaseModel):
    date: datetime
    score: float
    note: Optional[str] = None

class JournalTrendsResponse(BaseModel):
    date_range: str = Field(..., description="Date range for the trend")
    entry_count: int = Field(..., description="Number of entries analyzed")
    word_count_avg: int = Field(..., description="Average word count")
    sentiment_distribution: SentimentDistribution = Field(..., description="Distribution of sentiments")
    top_emotions: List[EmotionTrend] = Field(..., description="Top emotions over time")
    top_themes: List[ThemeTrend] = Field(..., description="Top themes over time")
    mood_trend: List[MoodPoint] = Field(..., description="Mood trend over time")
    common_insights: List[str] = Field(..., description="Common insights across entries")

class AnalysisFeedback(BaseModel):
    analysis_id: str = Field(..., description="ID of the analysis")
    is_helpful: bool = Field(..., description="Whether the analysis was helpful")
    feedback_text: Optional[str] = Field(None, description="Optional feedback text")

class AnalysisInDB(JournalAnalysisResponse):
    journal_id: int
    created_at: datetime
    updated_at: datetime
    
    class Config:
        orm_mode = True 