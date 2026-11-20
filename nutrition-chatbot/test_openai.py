
import os
from dotenv import load_dotenv
from openai import OpenAI, OpenAIError

load_dotenv()

api_key = os.getenv("OPENAI_API_KEY")

if not api_key:
    raise RuntimeError("API key missing!")

client = OpenAI(api_key=api_key, timeout=20.0, max_retries=0)

try:
    response = client.responses.create(
        model="gpt-4.1-mini",
        input="Say hello in one sentence."
    )

    print("SUCCESS!")
    print(response.output_text)

except OpenAIError as e:
    print("ERROR TYPE:", type(e).__name__)
    print("ERROR:", str(e))
