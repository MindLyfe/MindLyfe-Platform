# MindLyf Custom AI Models

This directory contains the custom AI models for the MindLyf platform. These models are trained on anonymized user data to provide personalized mental health support and recommendations.

## Model Architecture

Our custom models are designed to gradually replace OpenAI's models for all AI features:

1. **LyfBot Chat Model**
   - Fine-tuned transformer-based model for mental health conversations
   - Optimized for empathetic responses with mental health context
   - Includes safety guardrails and crisis detection

2. **Journal Analysis Model**
   - Sentiment analysis and emotion detection
   - Theme extraction and pattern recognition
   - Personalized insights and coping strategy recommendations

3. **Recommendation Model**
   - Personalized activity and resource recommendations
   - Contextual understanding of user's mental health goals
   - Adaptive difficulty based on user feedback

4. **Mood Prediction Model**
   - Time-series forecasting of mood patterns
   - Early warning signs detection
   - Proactive intervention suggestion

## Implementation Instructions

To implement a custom model, follow these steps:

1. **Create a Model Class**
   - Create a new Python file in the appropriate subdirectory (`chat`, `journal`, `recommendation`, or `mood`)
   - Implement the required interface for the model type

2. **Training Pipeline**
   - Implement data preprocessing in `preprocessing.py`
   - Define training parameters in a configuration file
   - Create evaluation metrics and validation procedures

3. **Model Registration**
   - Register the model in the model registry
   - Implement versioning and deployment procedures

### Example: Custom Chat Model

```python
# app/models/chat/custom_chat_model.py
import torch
from transformers import AutoModelForCausalLM, AutoTokenizer
from typing import List, Dict, Any

from app.models.base_model import BaseModel

class CustomChatModel(BaseModel):
    def __init__(self, model_path: str):
        self.model_path = model_path
        self.tokenizer = AutoTokenizer.from_pretrained(model_path)
        self.model = AutoModelForCausalLM.from_pretrained(model_path)
        
    async def generate(self, prompt: str, context: Dict[str, Any] = None) -> str:
        """Generate a response to the given prompt"""
        # Prepare the input
        inputs = self.tokenizer(prompt, return_tensors="pt")
        
        # Generate the response
        outputs = self.model.generate(
            inputs["input_ids"],
            max_length=512,
            temperature=0.7,
            top_p=0.9,
            do_sample=True
        )
        
        # Decode and return the response
        response = self.tokenizer.decode(outputs[0], skip_special_tokens=True)
        return response
        
    async def batch_generate(self, prompts: List[str]) -> List[str]:
        """Generate responses to multiple prompts"""
        responses = []
        for prompt in prompts:
            response = await self.generate(prompt)
            responses.append(response)
        return responses
```

### Model Training

To train a custom model:

1. **Prepare Training Data**
   ```
   python -m app.scripts.prepare_training_data --feature chat --output-dir data/training/chat
   ```

2. **Train the Model**
   ```
   python -m app.scripts.train_model --feature chat --config configs/chat_model_config.yaml
   ```

3. **Evaluate the Model**
   ```
   python -m app.scripts.evaluate_model --feature chat --model-path models/chat/v1.0.0
   ```

## Model Registry

All models are registered in the model registry, which is stored in `app/models/registry/registry.json`. The registry contains:

- Model metadata (version, accuracy, training date)
- Deployment information (rollout percentage, status)
- A/B testing configuration

## Safety and Compliance

All custom models must implement:

1. **PHI Detection**
   - Automatic detection and sanitization of Protected Health Information
   - Compliance with HIPAA regulations

2. **Content Filtering**
   - Harmful content detection and filtering
   - Crisis detection and appropriate responses

3. **Explainability**
   - Ability to explain model decisions
   - Confidence scores for all predictions

## Testing and Validation

Before deploying a model to production:

1. **Unit Tests**
   - Test all model functionality
   - Ensure correct responses to edge cases

2. **Safety Tests**
   - Test for harmful responses
   - Verify crisis detection accuracy

3. **Performance Tests**
   - Measure latency and throughput
   - Optimize for production use 