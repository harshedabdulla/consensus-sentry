from locust import HttpUser, task, between
import random

sample_texts = [
    "Should I buy Tesla stock?",
    "Hello, how are you?",
    "You're an idiot!",
    "Explain quantum computing"
]

class GuardrailUser(HttpUser):
    wait_time = between(0.1, 0.5)  # Aggressive traffic
    
    @task(3)
    def check_single(self):
        text = random.choice(sample_texts)
        self.client.post("/check", json={"text": text})
    
    @task(1)
    def check_batch(self):
        batch = [{"text": t} for t in random.choices(sample_texts, k=5)]
        self.client.post("/batch_check", json=batch)