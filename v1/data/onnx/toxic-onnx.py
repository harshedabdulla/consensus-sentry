import onnxruntime
from transformers import DistilBertTokenizer

def predict_toxicity(text, model_path='toxic_classifier.onnx'):
    tokenizer = DistilBertTokenizer.from_pretrained('distilbert-base-uncased')
    session = onnxruntime.InferenceSession(model_path)
    
    inputs = tokenizer(
        text,
        truncation=True,
        padding='max_length',
        max_length=128,
        return_tensors='np'
    )
    
    output = session.run(['output'], {
        'input_ids': inputs['input_ids'],
        'attention_mask': inputs['attention_mask']
    })[0]
    
    categories = ['toxic', 'severe_toxic', 'obscene', 'threat', 'insult', 'identity_hate']
    sorted_results = sorted(zip(categories, output[0]), key=lambda x: x[1], reverse=True)[:2]
    return {k: f"{v:.3f}" for k, v in sorted_results}

# Test
text = "you are so dumb and useless"
results = predict_toxicity(text)
print(results)