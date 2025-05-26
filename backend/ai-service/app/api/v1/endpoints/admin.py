from typing import Dict, Any, List, Optional
from fastapi import APIRouter, Depends, HTTPException, status, BackgroundTasks
from pydantic import BaseModel, Field

from app.core.dependencies import get_admin_user
from app.services.training_service import ModelTrainingService
from app.core.config import settings
from app.utils.compliance import audit_log

router = APIRouter()
training_service = ModelTrainingService()

# Request and response models
class ModelFeatureRequest(BaseModel):
    feature: str = Field(..., description="AI feature name (chat, journal_analysis, etc.)")

class ModelVersionRequest(BaseModel):
    feature: str = Field(..., description="AI feature name")
    version: str = Field(..., description="Model version (e.g., 0.1.0)")

class DeployModelRequest(BaseModel):
    feature: str = Field(..., description="AI feature name")
    version: str = Field(..., description="Model version to deploy")
    rollout_percentage: int = Field(0, description="Percentage of traffic to route to this model (0-100)")

class UpdateRolloutRequest(BaseModel):
    deployment_id: str = Field(..., description="Deployment ID")
    rollout_percentage: int = Field(..., description="New percentage of traffic (0-100)")

class ABTestingConfigRequest(BaseModel):
    enabled: bool = Field(..., description="Enable or disable A/B testing")
    features: Dict[str, int] = Field(
        ..., 
        description="Rollout percentages for each feature (feature: percentage)"
    )

@router.post("/train", status_code=status.HTTP_202_ACCEPTED)
async def train_model(
    request: ModelFeatureRequest,
    background_tasks: BackgroundTasks,
    admin_user = Depends(get_admin_user)
):
    """
    Start training a new model for a specific feature.
    This is an asynchronous operation that runs in the background.
    """
    # Log the training request
    audit_log(
        action="model_training_request",
        user_id=admin_user.id,
        resource_type="ai_model",
        resource_id=f"training:{request.feature}",
        metadata={"feature": request.feature}
    )
    
    # Add training task to background tasks
    background_tasks.add_task(training_service.train_model, request.feature)
    
    return {
        "message": f"Training started for feature: {request.feature}",
        "status": "processing"
    }

@router.post("/evaluate", status_code=status.HTTP_202_ACCEPTED)
async def evaluate_model(
    request: ModelVersionRequest,
    background_tasks: BackgroundTasks,
    admin_user = Depends(get_admin_user)
):
    """
    Evaluate a specific model version on the evaluation dataset.
    This is an asynchronous operation that runs in the background.
    """
    # Log the evaluation request
    audit_log(
        action="model_evaluation_request",
        user_id=admin_user.id,
        resource_type="ai_model",
        resource_id=f"{request.feature}:{request.version}",
        metadata={"feature": request.feature, "version": request.version}
    )
    
    # Add evaluation task to background tasks
    background_tasks.add_task(
        training_service.evaluate_model, 
        request.feature, 
        request.version
    )
    
    return {
        "message": f"Evaluation started for {request.feature} model version {request.version}",
        "status": "processing"
    }

@router.post("/deploy", status_code=status.HTTP_200_OK)
async def deploy_model(
    request: DeployModelRequest,
    admin_user = Depends(get_admin_user)
):
    """
    Deploy a model version to production with a specified rollout percentage.
    """
    result = await training_service.deploy_model(
        request.feature, 
        request.version, 
        request.rollout_percentage
    )
    
    if not result["success"]:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=result.get("error", "Failed to deploy model")
        )
    
    # Update the config setting for the feature's rollout percentage
    # In a real implementation, this would update environment variables or a database
    
    return result

@router.post("/rollout", status_code=status.HTTP_200_OK)
async def update_rollout_percentage(
    request: UpdateRolloutRequest,
    admin_user = Depends(get_admin_user)
):
    """
    Update the rollout percentage for a deployed model.
    """
    result = await training_service.update_rollout_percentage(
        request.deployment_id, 
        request.rollout_percentage
    )
    
    if not result["success"]:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=result.get("error", "Failed to update rollout percentage")
        )
    
    return result

@router.get("/models/{feature}", response_model=List[Dict[str, Any]])
async def get_model_versions(
    feature: str,
    admin_user = Depends(get_admin_user)
):
    """
    Get all versions of a model for a specific feature.
    """
    versions = training_service.get_model_versions(feature)
    return versions

@router.get("/deployments", response_model=List[Dict[str, Any]])
async def get_active_deployments(
    admin_user = Depends(get_admin_user)
):
    """
    Get all active model deployments.
    """
    deployments = training_service.get_active_deployments()
    return deployments

@router.post("/ab-testing/config", status_code=status.HTTP_200_OK)
async def configure_ab_testing(
    request: ABTestingConfigRequest,
    admin_user = Depends(get_admin_user)
):
    """
    Configure A/B testing settings for all features.
    """
    # Log the configuration change
    audit_log(
        action="ab_testing_config_update",
        user_id=admin_user.id,
        resource_type="system_config",
        resource_id="ab_testing",
        metadata={"enabled": request.enabled, "features": request.features}
    )
    
    # In a real implementation, this would update environment variables or a database
    # For now, we'll just return success
    
    return {
        "success": True,
        "message": "A/B testing configuration updated",
        "config": {
            "enabled": request.enabled,
            "features": request.features
        }
    }

@router.get("/ab-testing/config", response_model=Dict[str, Any])
async def get_ab_testing_config(
    admin_user = Depends(get_admin_user)
):
    """
    Get current A/B testing configuration.
    """
    # In a real implementation, this would fetch from environment variables or a database
    # For now, we'll return the current settings from the config
    
    features_config = {
        "chat": settings.CUSTOM_CHAT_MODEL_ROLLOUT_PERCENTAGE,
        "journal_analysis": settings.CUSTOM_JOURNAL_MODEL_ROLLOUT_PERCENTAGE,
        "mood_prediction": settings.CUSTOM_MOOD_MODEL_ROLLOUT_PERCENTAGE,
        "recommendation": settings.CUSTOM_RECOMMENDATION_MODEL_ROLLOUT_PERCENTAGE,
        "personalization": settings.CUSTOM_PERSONALIZATION_MODEL_ROLLOUT_PERCENTAGE
    }
    
    return {
        "enabled": settings.AB_TESTING_ENABLED,
        "features": features_config
    }

@router.get("/models/best/{feature}", response_model=Dict[str, Any])
async def get_best_model_version(
    feature: str,
    admin_user = Depends(get_admin_user)
):
    """
    Get the best performing model version for a feature.
    """
    best_version = training_service.get_best_model_version(feature)
    
    if not best_version:
        return {
            "feature": feature,
            "has_model": False,
            "message": f"No models found for feature: {feature}"
        }
    
    versions = training_service.get_model_versions(feature)
    best_model = next((v for v in versions if v["version"] == best_version), None)
    
    return {
        "feature": feature,
        "has_model": True,
        "version": best_version,
        "metrics": best_model["metrics"] if best_model else {}
    } 