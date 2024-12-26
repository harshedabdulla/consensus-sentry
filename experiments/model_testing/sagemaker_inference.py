import json
import sagemaker
import boto3
from sagemaker.huggingface import HuggingFaceModel, get_huggingface_llm_image_uri

try:
    role = sagemaker.get_execution_role()
except ValueError:
    iam = boto3.client('iam')
    role = iam.get_role(RoleName='sagemaker_execution_role')['Role']['Arn']

# Hub Model configuration
hub = {
    'HF_MODEL_ID': 'guardrail/llama-2-7b-guanaco-instruct-sharded',
    'SM_NUM_GPUS': json.dumps(1)
}

# Create Hugging Face Model Class
huggingface_model = HuggingFaceModel(
    image_uri=get_huggingface_llm_image_uri("huggingface", version="2.3.1"),
    env=hub,
    role=role,
)

# Deploy model to SageMaker Inference
predictor = huggingface_model.deploy(
    initial_instance_count=1,
    instance_type="ml.g5.2xlarge",
    container_startup_health_check_timeout=300,
)

# Send request
response = predictor.predict({
    "inputs": "My name is Julien and I like to"
})

print("Model response:", response)

# Clean up (delete the endpoint after use)
predictor.delete_endpoint()