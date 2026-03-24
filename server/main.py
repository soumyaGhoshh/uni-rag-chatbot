import os
import json
import pathlib
from fastapi import FastAPI, HTTPException, Request
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import google.generativeai as genai
from dotenv import load_dotenv

# Pathing
BASE_DIR = pathlib.Path(__file__).parent.resolve()
DATA_DIR = BASE_DIR.parent / "data" / "logs"

load_dotenv(BASE_DIR / ".env")

app = FastAPI()

# Enable CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Configure Gemini
api_key = os.getenv("GEMINI_API_KEY")
if api_key:
    genai.configure(api_key=api_key)

class ChatRequest(BaseModel):
    message: str
    role: str = "student" # Default role

def get_logs(role: str):
    """
    Robustly scans DATA_DIR/logs for JSON files.
    - Student: Returns 'public_status.json' and any file with 'public' in name.
    - Admin: Returns ALL logs including private health and lab data.
    """
    logs = []
    # Search all subdirectories in DATA_DIR
    for path in DATA_DIR.rglob("*.json"):
        # Privacy filter
        if role == "student":
            if "private" in path.name or "health" in str(path):
                continue
        
        try:
            with open(path, "r") as f:
                data = json.load(f)
                if isinstance(data, list):
                    logs.extend(data)
                else:
                    logs.append(data)
        except Exception as e:
            print(f"Error reading log at {path}: {e}")
            
    return logs

@app.post("/chat")
async def chat(request: ChatRequest):
    if not api_key:
        return {"response": "Warning: Gemini API Key missing on server."}

    context_logs = get_logs(request.role)
    
    role_instruction = (
        "You are 'UniGuard', a Campus Transparency AI. "
        "Your priority is to prevent panic and debunk rumors using verified logs. "
        "NEVER share student names or IDs with students. Keep data abstract (e.g., '3 cases reported')."
    ) if request.role == "student" else (
        "You are in ADMIN MODE. You have FULL CLEARANCE. "
        "When an administrator asks for names, student IDs, or room numbers, provide them DIRECTLY from the logs. "
        "Do not be vague. This is for medical isolation and emergency protocols."
    )

    prompt = f"""
    {role_instruction}
    
    VERIFIED CONTEXT (CURRENT LOGS):
    {json.dumps(context_logs, indent=2)}
    
    USER QUESTION:
    {request.message}
    
    TASK:
    - If Student: Be reassuring, use abstract data, debunk rumors.
    - If Admin: Be specific, provide IDs/Names if requested, give protocol details.
    - List the specific details (Room, Name, ID) clearly in a list format for Admins.
    """

    try:
        model = genai.GenerativeModel('gemini-2.0-flash')
        response = model.generate_content(prompt)
        return {"response": response.text}
    except Exception as e:
        print(f"Error calling Gemini: {str(e)}")
        raise HTTPException(status_code=500, detail="AI response failed.")

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8001)
