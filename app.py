import asyncio
import json
from enum import Enum
from flask import Flask, render_template, request, jsonify

# Import your main fact-checking graph
from fact_checker.agent import graph

# Helper class to correctly convert the final report to JSON
class EnumEncoder(json.JSONEncoder):
    def default(self, obj):
        if isinstance(obj, Enum):
            return obj.value
        return super().default(obj)

# Initialize Flask to find your frontend files
app = Flask(__name__, template_folder='templates', static_folder='static')
app.json_encoder = EnumEncoder


@app.route('/')
def index():
    """Renders the main HTML page."""
    return render_template('index.html')

@app.route('/fact-check', methods=['POST'])
def fact_check():
    """Handles the API request from the frontend's JavaScript."""
    try:
        data = request.get_json()
        
        # --- FIX: Make sure we are getting the key 'text' ---
        text = data.get('text', '').strip()
        
        if not text:
            return jsonify({'error': 'Please provide text to analyze.'}), 400
        
        # Run the async agent logic
        final_state = asyncio.run(run_agent(text))
        
        final_report = final_state.get("final_report")
        
        if not final_report:
            return jsonify({'error': 'Failed to generate a complete report.'}), 500
        
        # Convert the report into a JSON-friendly format
        response_data = {
            'summary': final_report.summary,
            'verified_claims': [claim.dict() for claim in final_report.verified_claims],
            'stats': calculate_stats(final_report.verified_claims)
        }
        
        return jsonify(response_data)
        
    except Exception as e:
        print(f"An error occurred: {e}")
        return jsonify({'error': f'An error occurred: {str(e)}'}), 500

async def run_agent(text):
    """Wrapper to run your async LangGraph agent."""
    # The graph itself expects the key to be 'answer'
    inputs = {"answer": text} 
    final_state = await graph.ainvoke(inputs)
    return final_state

def calculate_stats(verified_claims):
    """Calculates the statistics for the final report."""
    if not verified_claims:
        return {'supported': 0, 'refuted': 0, 'insufficient': 0, 'conflicting': 0}
    
    total = len(verified_claims)
    results = [claim.result for claim in verified_claims]
    
    supported_count = sum(1 for r in results if r.value == 'Supported')
    refuted_count = sum(1 for r in results if r.value == 'Refuted')
    insufficient_count = sum(1 for r in results if r.value == 'Insufficient Information')
    conflicting_count = sum(1 for r in results if r.value == 'Conflicting')

    return {
        'supported': round((supported_count / total) * 100, 1) if total > 0 else 0,
        'refuted': round((refuted_count / total) * 100, 1) if total > 0 else 0,
        'insufficient': round((insufficient_count / total) * 100, 1) if total > 0 else 0,
        'conflicting': round((conflicting_count / total) * 100, 1) if total > 0 else 0
    }

if __name__ == '__main__':
    app.run(debug=True, port=5000)