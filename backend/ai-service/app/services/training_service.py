import os
import json
import logging
import asyncio
import datetime
import uuid
from typing import Dict, Any, List, Optional, Tuple

import numpy as np
import pandas as pd
from sklearn.metrics import accuracy_score, precision_score, recall_score, f1_score

from app.core.config import settings
from app.utils.compliance import audit_log

logger = logging.getLogger(__name__)

class ModelTrainingService:
    """
    Service for training and evaluating custom AI models.
    This handles the training pipeline, data preparation, and model evaluation.
    """
    
    def __init__(self):
        """Initialize the training service with configuration"""
        self.training_enabled = settings.TRAINING_ENABLED
        self.training_data_dir = settings.TRAINING_DATA_DIR
        self.evaluation_data_dir = settings.EVALUATION_DATA_DIR
        self.model_registry_dir = settings.MODEL_REGISTRY_DIR
        self.batch_size = settings.TRAINING_BATCH_SIZE
        self.epochs = settings.TRAINING_EPOCHS
        self.evaluation_interval = settings.EVALUATION_INTERVAL
        
        # Create necessary directories
        os.makedirs(self.training_data_dir, exist_ok=True)
        os.makedirs(self.evaluation_data_dir, exist_ok=True)
        os.makedirs(self.model_registry_dir, exist_ok=True)
        
        # Initialize model registry
        self.model_registry = self._load_model_registry()
        
        # Start background training tasks if enabled
        if self.training_enabled:
            # In a real implementation, this would start background tasks
            # for continuous model training and evaluation
            pass
    
    def _load_model_registry(self) -> Dict[str, Any]:
        """Load the model registry from disk"""
        registry_path = os.path.join(self.model_registry_dir, "registry.json")
        if os.path.exists(registry_path):
            try:
                with open(registry_path, 'r') as f:
                    return json.load(f)
            except Exception as e:
                logger.error(f"Error loading model registry: {str(e)}")
                return self._create_empty_registry()
        else:
            return self._create_empty_registry()
    
    def _create_empty_registry(self) -> Dict[str, Any]:
        """Create an empty model registry structure"""
        return {
            "models": {},
            "versions": {},
            "deployments": {},
            "last_updated": datetime.datetime.now().isoformat()
        }
    
    def _save_model_registry(self) -> None:
        """Save the model registry to disk"""
        registry_path = os.path.join(self.model_registry_dir, "registry.json")
        try:
            with open(registry_path, 'w') as f:
                json.dump(self.model_registry, f, indent=2)
        except Exception as e:
            logger.error(f"Error saving model registry: {str(e)}")
    
    async def collect_training_data(self, 
                                   feature: str, 
                                   input_data: Any, 
                                   output_data: Any, 
                                   metadata: Dict[str, Any]) -> None:
        """
        Collect training data from production for future model training
        
        Args:
            feature: The AI feature (chat, journal_analysis, etc.)
            input_data: The input data to the model
            output_data: The output data from the model
            metadata: Additional metadata about the sample
        """
        if not self.training_enabled:
            return
            
        try:
            # Create a unique ID for this training sample
            sample_id = str(uuid.uuid4())
            
            # Create the training sample
            training_sample = {
                "id": sample_id,
                "feature": feature,
                "timestamp": datetime.datetime.now().isoformat(),
                "input_data": input_data,
                "output_data": output_data,
                "metadata": metadata
            }
            
            # Save the training sample to the appropriate feature directory
            feature_dir = os.path.join(self.training_data_dir, feature)
            os.makedirs(feature_dir, exist_ok=True)
            
            # Save as JSON file
            sample_path = os.path.join(feature_dir, f"{sample_id}.json")
            with open(sample_path, 'w') as f:
                json.dump(training_sample, f, indent=2)
                
            logger.debug(f"Saved training sample {sample_id} for feature {feature}")
            
        except Exception as e:
            logger.error(f"Error collecting training data: {str(e)}")
    
    async def train_model(self, feature: str) -> Dict[str, Any]:
        """
        Train a new model for a specific feature
        
        Args:
            feature: The AI feature to train a model for
            
        Returns:
            Dictionary with training results
        """
        if not self.training_enabled:
            return {"success": False, "error": "Training is disabled"}
            
        try:
            logger.info(f"Starting training for feature: {feature}")
            
            # Log the training start for auditing
            audit_log(
                action="model_training_start",
                user_id="system",
                resource_type="ai_model",
                resource_id=f"training:{feature}",
                metadata={"feature": feature}
            )
            
            # In a real implementation, this would:
            # 1. Load training data for the feature
            # 2. Preprocess the data
            # 3. Initialize the appropriate model architecture
            # 4. Train the model
            # 5. Evaluate on validation data
            # 6. Save the model if it meets quality thresholds
            
            # For now, we'll simulate a training process
            await asyncio.sleep(1)  # Simulate training time
            
            # Generate a new model version
            new_version = self._generate_model_version(feature)
            
            # Create model metadata
            model_metadata = {
                "version": new_version,
                "feature": feature,
                "training_date": datetime.datetime.now().isoformat(),
                "metrics": {
                    "accuracy": 0.85,
                    "precision": 0.87,
                    "recall": 0.83,
                    "f1_score": 0.85
                },
                "parameters": {
                    "batch_size": self.batch_size,
                    "epochs": self.epochs
                }
            }
            
            # Save the model metadata
            self._register_model_version(feature, new_version, model_metadata)
            
            # Log the training completion for auditing
            audit_log(
                action="model_training_complete",
                user_id="system",
                resource_type="ai_model",
                resource_id=f"training:{feature}:{new_version}",
                metadata={
                    "feature": feature,
                    "version": new_version,
                    "metrics": model_metadata["metrics"]
                }
            )
            
            logger.info(f"Completed training for feature: {feature}, version: {new_version}")
            
            return {
                "success": True,
                "feature": feature,
                "version": new_version,
                "metrics": model_metadata["metrics"]
            }
            
        except Exception as e:
            logger.error(f"Error training model for feature {feature}: {str(e)}")
            
            # Log the training failure for auditing
            audit_log(
                action="model_training_error",
                user_id="system",
                resource_type="ai_model",
                resource_id=f"training:{feature}",
                metadata={"feature": feature, "error": str(e)},
                status="error"
            )
            
            return {
                "success": False,
                "feature": feature,
                "error": str(e)
            }
    
    def _generate_model_version(self, feature: str) -> str:
        """Generate a new version string for a model feature"""
        # Check if we have any existing versions
        if feature in self.model_registry.get("models", {}):
            versions = self.model_registry["models"][feature]["versions"]
            if versions:
                # Get the latest version and increment
                latest_version = sorted(versions, key=lambda v: [int(x) for x in v.split('.')])[-1]
                major, minor, patch = [int(x) for x in latest_version.split('.')]
                return f"{major}.{minor}.{patch + 1}"
        
        # No existing versions, start with 0.1.0
        return "0.1.0"
    
    def _register_model_version(self, feature: str, version: str, metadata: Dict[str, Any]) -> None:
        """Register a new model version in the registry"""
        # Ensure feature exists in registry
        if feature not in self.model_registry.get("models", {}):
            self.model_registry.setdefault("models", {})[feature] = {
                "name": feature,
                "versions": [],
                "current_version": None
            }
        
        # Add the version to the feature
        self.model_registry["models"][feature]["versions"].append(version)
        
        # Store version metadata
        version_id = f"{feature}:{version}"
        self.model_registry.setdefault("versions", {})[version_id] = metadata
        
        # Update registry
        self.model_registry["last_updated"] = datetime.datetime.now().isoformat()
        
        # Save the updated registry
        self._save_model_registry()
    
    async def evaluate_model(self, feature: str, version: str) -> Dict[str, Any]:
        """
        Evaluate a model on the evaluation dataset
        
        Args:
            feature: The AI feature
            version: The model version
            
        Returns:
            Dictionary with evaluation results
        """
        try:
            logger.info(f"Starting evaluation for {feature} model version {version}")
            
            # In a real implementation, this would:
            # 1. Load the specified model
            # 2. Load the evaluation dataset
            # 3. Run inference on the evaluation data
            # 4. Calculate metrics
            
            # For now, we'll simulate an evaluation process
            await asyncio.sleep(1)  # Simulate evaluation time
            
            # Simulate evaluation metrics
            metrics = {
                "accuracy": 0.86,
                "precision": 0.88,
                "recall": 0.84,
                "f1_score": 0.86
            }
            
            # Update model metadata with evaluation results
            version_id = f"{feature}:{version}"
            if version_id in self.model_registry.get("versions", {}):
                self.model_registry["versions"][version_id]["evaluation"] = {
                    "date": datetime.datetime.now().isoformat(),
                    "metrics": metrics
                }
                self._save_model_registry()
            
            logger.info(f"Evaluation complete for {feature} model version {version}")
            
            return {
                "success": True,
                "feature": feature,
                "version": version,
                "metrics": metrics
            }
            
        except Exception as e:
            logger.error(f"Error evaluating model {feature} version {version}: {str(e)}")
            return {
                "success": False,
                "feature": feature,
                "version": version,
                "error": str(e)
            }
    
    async def deploy_model(self, feature: str, version: str, rollout_percentage: int = 0) -> Dict[str, Any]:
        """
        Deploy a trained model for production use
        
        Args:
            feature: The AI feature
            version: The model version to deploy
            rollout_percentage: Percentage of traffic to route to this model (0-100)
            
        Returns:
            Dictionary with deployment results
        """
        try:
            logger.info(f"Deploying {feature} model version {version} with {rollout_percentage}% traffic")
            
            # Check if the model version exists
            version_id = f"{feature}:{version}"
            if version_id not in self.model_registry.get("versions", {}):
                return {
                    "success": False,
                    "error": f"Model version {version_id} not found in registry"
                }
            
            # Update the current version for the feature
            self.model_registry["models"][feature]["current_version"] = version
            
            # Create a deployment record
            deployment_id = str(uuid.uuid4())
            self.model_registry.setdefault("deployments", {})[deployment_id] = {
                "id": deployment_id,
                "feature": feature,
                "version": version,
                "rollout_percentage": rollout_percentage,
                "status": "active",
                "deployed_at": datetime.datetime.now().isoformat()
            }
            
            # Update registry
            self.model_registry["last_updated"] = datetime.datetime.now().isoformat()
            self._save_model_registry()
            
            # Log the deployment for auditing
            audit_log(
                action="model_deployment",
                user_id="system",
                resource_type="ai_model",
                resource_id=version_id,
                metadata={
                    "feature": feature,
                    "version": version,
                    "rollout_percentage": rollout_percentage,
                    "deployment_id": deployment_id
                }
            )
            
            logger.info(f"Successfully deployed {feature} model version {version}")
            
            return {
                "success": True,
                "feature": feature,
                "version": version,
                "deployment_id": deployment_id,
                "rollout_percentage": rollout_percentage
            }
            
        except Exception as e:
            logger.error(f"Error deploying model {feature} version {version}: {str(e)}")
            return {
                "success": False,
                "feature": feature,
                "version": version,
                "error": str(e)
            }
    
    async def update_rollout_percentage(self, deployment_id: str, rollout_percentage: int) -> Dict[str, Any]:
        """
        Update the rollout percentage for a deployed model
        
        Args:
            deployment_id: The deployment ID
            rollout_percentage: New percentage of traffic to route to this model (0-100)
            
        Returns:
            Dictionary with update results
        """
        try:
            if deployment_id not in self.model_registry.get("deployments", {}):
                return {
                    "success": False,
                    "error": f"Deployment {deployment_id} not found"
                }
            
            # Update the rollout percentage
            deployment = self.model_registry["deployments"][deployment_id]
            old_percentage = deployment["rollout_percentage"]
            deployment["rollout_percentage"] = rollout_percentage
            deployment["updated_at"] = datetime.datetime.now().isoformat()
            
            # Save the updated registry
            self._save_model_registry()
            
            # Log the update for auditing
            audit_log(
                action="model_rollout_update",
                user_id="system",
                resource_type="ai_model",
                resource_id=f"{deployment['feature']}:{deployment['version']}",
                metadata={
                    "deployment_id": deployment_id,
                    "feature": deployment["feature"],
                    "version": deployment["version"],
                    "old_percentage": old_percentage,
                    "new_percentage": rollout_percentage
                }
            )
            
            logger.info(f"Updated rollout percentage for deployment {deployment_id} to {rollout_percentage}%")
            
            return {
                "success": True,
                "deployment_id": deployment_id,
                "feature": deployment["feature"],
                "version": deployment["version"],
                "rollout_percentage": rollout_percentage
            }
            
        except Exception as e:
            logger.error(f"Error updating rollout percentage for deployment {deployment_id}: {str(e)}")
            return {
                "success": False,
                "deployment_id": deployment_id,
                "error": str(e)
            }
    
    def get_model_versions(self, feature: str) -> List[Dict[str, Any]]:
        """
        Get all versions of a model for a specific feature
        
        Args:
            feature: The AI feature
            
        Returns:
            List of model versions with metadata
        """
        versions = []
        
        # Check if feature exists in registry
        if feature in self.model_registry.get("models", {}):
            feature_versions = self.model_registry["models"][feature]["versions"]
            
            # Get metadata for each version
            for version in feature_versions:
                version_id = f"{feature}:{version}"
                if version_id in self.model_registry.get("versions", {}):
                    versions.append(self.model_registry["versions"][version_id])
        
        return versions
    
    def get_active_deployments(self) -> List[Dict[str, Any]]:
        """
        Get all active model deployments
        
        Returns:
            List of active model deployments
        """
        active_deployments = []
        
        for deployment_id, deployment in self.model_registry.get("deployments", {}).items():
            if deployment["status"] == "active":
                active_deployments.append(deployment)
        
        return active_deployments
    
    def get_best_model_version(self, feature: str) -> Optional[str]:
        """
        Get the best performing model version for a feature
        
        Args:
            feature: The AI feature
            
        Returns:
            The best model version or None if no models exist
        """
        versions = self.get_model_versions(feature)
        
        if not versions:
            return None
        
        # Sort by accuracy (or other primary metric)
        sorted_versions = sorted(versions, 
                                key=lambda v: v.get("metrics", {}).get("accuracy", 0),
                                reverse=True)
        
        return sorted_versions[0]["version"] if sorted_versions else None 