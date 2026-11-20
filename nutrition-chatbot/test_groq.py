
import os
from dotenv import load_dotenv
from groq import Groq

from pathlib import Path

env_path = Path(__file__).resolve().parent / ".env"
load_dotenv(dotenv_path=env_path)

api_key = os.getenv("GROQ_API_KEY")

if not api_key:
    raise RuntimeError("GROQ_API_KEY is missing!")

client = Groq(api_key=api_key)

try:
    response = client.chat.completions.create(
        model="openai/gpt-oss-20b",
        messages=[
            {
                "role": "user",
                "content": "What are the benefits of eating bananas?"
            }
        ]
    )

    print("SUCCESS!")
    print(response.choices[0].message.content)

except Exception as e:
    print("ERROR TYPE:", type(e).__name__)
    print("ERROR:", str(e))
