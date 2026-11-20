
from pathlib import Path

from fastapi import FastAPI, HTTPException
from fastapi.responses import FileResponse
from fastapi.staticfiles import StaticFiles
from pydantic import BaseModel, Field
from groq import GroqError

from nutrition_ai import get_nutrition_response


BASE_DIR = Path(__file__).resolve().parent
STATIC_DIR = BASE_DIR / "static"

app = FastAPI(
    title="Nutrition AI Chatbot",
    description="AI-powered Nutrition Assistant using Groq",
    version="1.0.0"
)

# Serve CSS, JavaScript and other frontend assets
app.mount(
    "/static",
    StaticFiles(directory=STATIC_DIR),
    name="static"
)


class ChatRequest(BaseModel):
    message: str = Field(
        min_length=1,
        max_length=2000
    )


@app.get("/")
def home():
    return FileResponse(STATIC_DIR / "index.html")


@app.get("/health")
def health():
    return {
        "status": "healthy",
        "ai_provider": "Groq"
    }


@app.post("/chat")
def chat(request: ChatRequest):

    if not request.message.strip():
        raise HTTPException(
            status_code=400,
            detail="Message cannot be empty"
        )

    try:
        answer = get_nutrition_response(
            request.message
        )

        return {
            "response": answer
        }

    except GroqError:
        raise HTTPException(
            status_code=503,
            detail="AI service temporarily unavailable."
        )
