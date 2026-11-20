import os
from dotenv import load_dotenv

load_dotenv()

api_key = os.getenv("OPENAI_API_KEY")

if api_key and api_key != "your_actual_api_key_here":
    print("SUCCESS: OpenAI API key loaded!")
else:
    print("ERROR: OpenAI API key missing!")
