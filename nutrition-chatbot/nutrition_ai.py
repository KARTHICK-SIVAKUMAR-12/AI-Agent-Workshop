
import os
from pathlib import Path
from dotenv import load_dotenv
from groq import Groq

env_path = Path(__file__).resolve().parent / ".env"
load_dotenv(dotenv_path=env_path)

api_key = os.getenv("GROQ_API_KEY")

if not api_key:
    raise RuntimeError("GROQ_API_KEY is missing!")

client = Groq(api_key=api_key, timeout=30.0)

SYSTEM_PROMPT = """
You are NutriBot, a helpful AI nutrition assistant.

Your responsibilities:
1. Explain food nutrition in simple English.
2. Answer questions about calories, protein,
   carbohydrates, fats, vitamins, and minerals.
3. Suggest balanced Indian meals.
4. Support vegetarian and non-vegetarian diets.
5. Provide approximate nutrition values.
6. Ask for food quantity when needed.
7. Do not diagnose medical conditions.
8. Avoid extreme or unsafe dieting advice.
9. Recommend professional guidance for medical diets.
"""

def get_nutrition_response(question: str) -> str:
    response = client.chat.completions.create(
        model="openai/gpt-oss-20b",
        messages=[
            {
                "role": "system",
                "content": SYSTEM_PROMPT
            },
            {
                "role": "user",
                "content": question
            }
        ],
        temperature=0.4,
        max_completion_tokens=700
    )

    return response.choices[0].message.content or \
        "Sorry, I could not generate a response."
