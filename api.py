import asyncio
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import uvicorn

# Import the main LangGraph agent from your project
from fact_checker.agent import graph
from fact_checker.schemas import FactCheckReport

# --- Pydantic Models for a structured API ---
class FactCheckRequest(BaseModel):
    """Request model for the fact-checking endpoint."""
    answer: str # We will use 'answer' consistently

class FactCheckResponse(BaseModel):
    """Response model matching the structure of the final report."""
    summary: str
    verified_claims: list
    stats: dict

# --- FastAPI Application ---
app = FastAPI(
    title="sachAI Fact-Checker API",
    description="An API to power the sachAI fact-checking agent.",
    version="1.0.0"
)

# --- CORS Configuration ---
# Crucial for allowing the browser extension to communicate with the API.
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Allows all origins
    allow_credentials=True,
    allow_methods=["*"],  # Allows all methods
    allow_headers=["*"],  # Allows all headers
)

# --- API Endpoint ---
@app.post("/fact-check", response_model=FactCheckResponse)
async def fact_check_endpoint(request: FactCheckRequest):
    """
    Receives text, runs it through the LangGraph agent, and returns the report.
    """
    from app import calculate_stats # Import the helper function from your Flask app

    # Run the entire graph and get the final state
    final_state = await graph.ainvoke({"answer": request.answer})
    
    final_report = final_state.get("final_report")
    
    if not final_report:
        # Fallback in case the report generation fails
        return {"error": "Failed to generate a complete report."}

    # Format the Pydantic models into a JSON-serializable dictionary
    response_data = {
        'summary': final_report.summary,
        'verified_claims': [claim.dict() for claim in final_report.verified_claims],
        'stats': calculate_stats(final_report.verified_claims)
    }
    return response_data

# --- Main entry point to run the API server ---
if __name__ == "__main__":
    print("Starting sachAI FastAPI server for API requests...")
    uvicorn.run(app, host="127.0.0.1", port=8000)